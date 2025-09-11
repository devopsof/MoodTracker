const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-User-Email',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
};

/**
 * Lambda handler for deleting mood entries
 * @param {Object} event - API Gateway event object
 * @param {Object} context - Lambda context object
 * @returns {Object} - HTTP response object
 */
exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({})
    };
  }

  try {
    // Get user ID from query parameter
    const userEmail = event.queryStringParameters?.userEmail;
    if (!userEmail) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Missing Parameter',
          message: 'userEmail is required'
        })
      };
    }
    
    const userId = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
    console.log('User email:', userEmail, 'User ID:', userId);

    // Get entry ID from path parameter
    const entryId = event.pathParameters?.entryId;
    if (!entryId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Missing Parameter',
          message: 'entryId is required'
        })
      };
    }

    // Delete from DynamoDB
    const deleteCommand = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        userId: userId,
        entryId: entryId
      },
      // Make sure the entry exists and belongs to this user
      ConditionExpression: 'attribute_exists(userId) AND attribute_exists(entryId)'
    });

    await dynamoDb.send(deleteCommand);

    console.log('Successfully deleted mood entry:', entryId);

    // Return success response
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Mood entry deleted successfully',
        entryId: entryId
      })
    };
  } catch (error) {
    console.error('Error deleting mood entry:', error);
    
    // Check if this is a conditional check failure (entry doesn't exist)
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Not Found',
          message: 'Entry not found or does not belong to this user'
        })
      };
    }
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      })
    };
  }
};