const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

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
 * Parses date query parameters and validates them
 * @param {Object} queryParams - Query parameters from the request
 * @returns {Object} - Parsed date range or null if not provided/invalid
 */
const parseDateRange = (queryParams) => {
  if (!queryParams || (!queryParams.from && !queryParams.to)) {
    return null;
  }

  const result = {};

  if (queryParams.from) {
    const fromDate = new Date(queryParams.from);
    if (isNaN(fromDate.getTime())) {
      throw new Error('Invalid "from" date format. Use YYYY-MM-DD.');
    }
    result.from = fromDate.toISOString();
  }

  if (queryParams.to) {
    const toDate = new Date(queryParams.to);
    if (isNaN(toDate.getTime())) {
      throw new Error('Invalid "to" date format. Use YYYY-MM-DD.');
    }
    // Set to end of day for "to" date
    toDate.setHours(23, 59, 59, 999);
    result.to = toDate.toISOString();
  }

  return result;
};

/**
 * Builds DynamoDB query parameters based on date range
 * @param {string} userId - User ID for the query
 * @param {Object} dateRange - Date range object with from/to dates
 * @param {number} limit - Maximum number of items to return
 * @param {string} lastKey - Last evaluated key for pagination
 * @returns {Object} - DynamoDB query parameters
 */
const buildQueryParams = (userId, dateRange, limit, lastKey) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false, // Sort in descending order (newest first)
    Limit: limit
  };

  // If date range is specified, use the GSI
  if (dateRange) {
    params.IndexName = 'DateIndex';
    
    if (dateRange.from && dateRange.to) {
      params.KeyConditionExpression = 'userId = :userId AND createdAt BETWEEN :fromDate AND :toDate';
      params.ExpressionAttributeValues[':fromDate'] = dateRange.from;
      params.ExpressionAttributeValues[':toDate'] = dateRange.to;
    } else if (dateRange.from) {
      params.KeyConditionExpression = 'userId = :userId AND createdAt >= :fromDate';
      params.ExpressionAttributeValues[':fromDate'] = dateRange.from;
    } else if (dateRange.to) {
      params.KeyConditionExpression = 'userId = :userId AND createdAt <= :toDate';
      params.ExpressionAttributeValues[':toDate'] = dateRange.to;
    }
  }

  // Add pagination support
  if (lastKey) {
    try {
      params.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
    } catch (error) {
      throw new Error('Invalid lastKey parameter');
    }
  }

  return params;
};

/**
 * Formats mood entries for response
 * @param {Array} items - Raw DynamoDB items
 * @returns {Array} - Formatted mood entries
 */
const formatEntries = (items) => {
  return items.map(item => ({
    id: item.entryId,
    mood: item.mood,
    intensity: item.intensity || null,
    note: item.note || '',
    tags: item.tags || [],
    promptId: item.promptId || null,
    date: item.date,
    createdAt: item.createdAt,
    timestamp: item.timestamp
  }));
};

/**
 * Lambda handler for retrieving mood entries
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

    const queryParams = event.queryStringParameters || {};
    
    // Parse pagination parameters
    const limit = Math.min(parseInt(queryParams.limit) || 50, 100); // Max 100 items per request
    const lastKey = queryParams.lastKey;

    // Parse and validate date range
    let dateRange;
    try {
      dateRange = parseDateRange(queryParams);
    } catch (error) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid Date Range',
          message: error.message
        })
      };
    }

    // Build query parameters
    let queryCommand;
    try {
      const params = buildQueryParams(userId, dateRange, limit, lastKey);
      queryCommand = new QueryCommand(params);
    } catch (error) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid Query Parameters',
          message: error.message
        })
      };
    }

    // Execute the query
    const result = await dynamoDb.send(queryCommand);

    console.log(`Retrieved ${result.Items?.length || 0} mood entries for user: ${userId}`);

    // Format the response
    const entries = formatEntries(result.Items || []);
    
    const response = {
      entries: entries,
      count: entries.length,
      pagination: {
        hasMore: !!result.LastEvaluatedKey,
        lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null
      }
    };

    // Add date range info if it was used
    if (dateRange) {
      response.dateRange = {
        from: dateRange.from,
        to: dateRange.to
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error retrieving mood entries:', error);

    // Handle specific AWS SDK errors
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

    if (error.name === 'ResourceNotFoundException') {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Resource Not Found',
          message: 'The requested resource was not found'
        })
      };
    }

    // Generic error response
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving mood entries'
      })
    };
  }
};
