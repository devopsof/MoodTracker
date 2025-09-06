const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-User-Email',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

/**
 * Validates the mood entry data
 * @param {Object} data - The mood entry data to validate
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
const validateMoodEntry = (data) => {
  const errors = [];
  
  // Check if mood is provided and is a valid number between 1-5
  if (!data.mood) {
    errors.push('Mood is required');
  } else if (typeof data.mood !== 'number' || data.mood < 1 || data.mood > 5) {
    errors.push('Mood must be a number between 1 and 5');
  }
  
  // Validate intensity (optional, 1-10 scale)
  if (data.intensity !== undefined) {
    if (typeof data.intensity !== 'number' || data.intensity < 1 || data.intensity > 10) {
      errors.push('Intensity must be a number between 1 and 10');
    }
  }
  
  // Note is optional, but if provided should be a string
  if (data.note && typeof data.note !== 'string') {
    errors.push('Note must be a string');
  }
  
  // Check note length (optional limit)
  if (data.note && data.note.length > 1000) {
    errors.push('Note must be less than 1000 characters');
  }
  
  // Validate tags if provided
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push('Tags must be an array')
    } else {
      // Check each tag is a string and reasonable length
      data.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push(`Tag at index ${index} must be a string`)
        } else if (tag.length > 50) {
          errors.push(`Tag at index ${index} must be less than 50 characters`)
        }
      })
      
      // Limit number of tags
      if (data.tags.length > 10) {
        errors.push('Maximum 10 tags allowed per entry')
      }
    }
  }
  
  // Validate photos if provided
  if (data.photos !== undefined) {
    if (!Array.isArray(data.photos)) {
      errors.push('Photos must be an array')
    } else {
      // Check each photo object
      data.photos.forEach((photo, index) => {
        if (!photo || typeof photo !== 'object') {
          errors.push(`Photo at index ${index} must be an object`)
        } else {
          if (!photo.id || typeof photo.id !== 'string') {
            errors.push(`Photo at index ${index} must have a valid id`)
          }
          if (!photo.url || typeof photo.url !== 'string') {
            errors.push(`Photo at index ${index} must have a valid url`)
          }
          if (photo.fileName && typeof photo.fileName !== 'string') {
            errors.push(`Photo at index ${index} fileName must be a string`)
          }
        }
      })
      
      // Limit number of photos
      if (data.photos.length > 5) {
        errors.push('Maximum 5 photos allowed per entry')
      }
    }
  }
  
  // Validate promptId if provided
  if (data.promptId !== undefined) {
    if (typeof data.promptId !== 'string') {
      errors.push('PromptId must be a string');
    } else if (data.promptId.length > 100) {
      errors.push('PromptId must be less than 100 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Lambda handler for creating mood entries
 * @param {Object} event - API Gateway event object
 * @param {Object} context - Lambda context object
 * @returns {Object} - HTTP response object
 */
exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Get user ID from query parameter (temporary solution)
    const userEmail = event.queryStringParameters?.userEmail;
    const userId = userEmail ? userEmail.replace(/[^a-zA-Z0-9]/g, '_') : 'test-user-123';
    
    console.log('User email:', userEmail, 'User ID:', userId);

    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        })
      };
    }

    // Validate the mood entry data
    const validation = validateMoodEntry(requestBody);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Validation Error',
          message: 'Invalid mood entry data',
          details: validation.errors
        })
      };
    }

    // Create the mood entry object
    const now = new Date();
    const entryId = randomUUID();
    
    const moodEntry = {
      userId: userId,
      entryId: entryId,
      mood: requestBody.mood,
      intensity: requestBody.intensity || null,
      note: requestBody.note || '',
      tags: requestBody.tags || [],
      promptId: requestBody.promptId || null,
      photos: requestBody.photos || [], // Add photos support
      createdAt: now.toISOString(),
      date: now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      timestamp: now.getTime()
    }

    // Save to DynamoDB
    const putCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: moodEntry,
      ConditionExpression: 'attribute_not_exists(userId) AND attribute_not_exists(entryId)'
    });

    await dynamoDb.send(putCommand);

    console.log('Successfully created mood entry:', entryId);

    // Return success response
    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Mood entry created successfully',
        entry: {
          id: entryId,
          userId: userId,
          mood: moodEntry.mood,
          intensity: moodEntry.intensity,
          note: moodEntry.note,
          tags: moodEntry.tags,
          promptId: moodEntry.promptId,
          photos: moodEntry.photos, // Include photos in response
          date: moodEntry.date,
          createdAt: moodEntry.createdAt
        }
      })
    };

  } catch (error) {
    console.error('Error creating mood entry:', error);

    // Handle specific DynamoDB errors
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Conflict',
          message: 'Entry already exists'
        })
      };
    }

    // Handle other AWS SDK errors
    if (error.name === 'ValidationException') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Validation Error',
          message: error.message
        })
      };
    }

    // Generic error response
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'An error occurred while creating the mood entry'
      })
    };
  }
};
