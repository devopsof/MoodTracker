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
 * Gets date range for the last N days
 * @param {number} days - Number of days to go back
 * @returns {Object} - Date range object with from/to dates
 */
const getLastNDaysRange = (days = 7) => {
  const now = new Date();
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - days);
  fromDate.setHours(0, 0, 0, 0);
  
  const toDate = new Date(now);
  toDate.setHours(23, 59, 59, 999);
  
  return {
    from: fromDate.toISOString(),
    to: toDate.toISOString()
  };
};

/**
 * Calculates mood statistics from entries
 * @param {Array} entries - Array of mood entries
 * @returns {Object} - Analytics data
 */
const calculateAnalytics = (entries) => {
  if (!entries || entries.length === 0) {
    return {
      averageMood: 0,
      totalEntries: 0,
      moodDistribution: {},
      dailyAverages: [],
      weeklyTrend: 'stable'
    };
  }

  // Calculate basic stats
  const totalEntries = entries.length;
  const moodSum = entries.reduce((sum, entry) => sum + (entry.mood || 0), 0);
  const averageMood = parseFloat((moodSum / totalEntries).toFixed(2));

  // Mood distribution (1-5 scale)
  const moodDistribution = {};
  for (let i = 1; i <= 5; i++) {
    moodDistribution[i] = entries.filter(entry => entry.mood === i).length;
  }

  // Daily averages for the last 7 days
  const dailyAverages = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateString = targetDate.toISOString().split('T')[0];
    
    const dayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
      return entryDate === dateString;
    });
    
    const dayAverage = dayEntries.length > 0 
      ? parseFloat((dayEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayEntries.length).toFixed(2))
      : null;
    
    dailyAverages.push({
      date: dateString,
      average: dayAverage,
      count: dayEntries.length,
      label: targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }

  // Determine weekly trend
  const validAverages = dailyAverages.filter(day => day.average !== null);
  let weeklyTrend = 'stable';
  
  if (validAverages.length >= 2) {
    const firstHalf = validAverages.slice(0, Math.ceil(validAverages.length / 2));
    const secondHalf = validAverages.slice(Math.floor(validAverages.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, day) => sum + day.average, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + day.average, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    if (difference > 0.3) weeklyTrend = 'improving';
    else if (difference < -0.3) weeklyTrend = 'declining';
  }

  return {
    averageMood,
    totalEntries,
    moodDistribution,
    dailyAverages,
    weeklyTrend,
    dateRange: {
      from: dailyAverages[0]?.date,
      to: dailyAverages[dailyAverages.length - 1]?.date
    }
  };
};

/**
 * Lambda handler for mood analytics
 * @param {Object} event - API Gateway event object
 * @param {Object} context - Lambda context object
 * @returns {Object} - HTTP response object
 */
exports.handler = async (event, context) => {
  console.log('Received analytics request:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Get user ID from query parameter
    const userEmail = event.queryStringParameters?.userEmail;
    const userId = userEmail ? userEmail.replace(/[^a-zA-Z0-9]/g, '_') : 'test-user-123';
    
    console.log('Calculating analytics for user:', userId);

    // Get number of days (default 7)
    const days = Math.min(parseInt(event.queryStringParameters?.days) || 7, 30); // Max 30 days
    const dateRange = getLastNDaysRange(days);

    // Query DynamoDB for all entries by user, then filter by date in Lambda
    const queryParams = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Descending order by entryId (most recent first)
    };

    console.log('DynamoDB Query params:', queryParams);

    const result = await dynamoDb.send(new QueryCommand(queryParams));
    const allEntries = result.Items || [];

    // Filter entries by date range (since we're not using GSI)
    const filteredEntries = allEntries.filter(entry => {
      if (!entry.createdAt) return false;
      const entryDate = new Date(entry.createdAt);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      return entryDate >= fromDate && entryDate <= toDate;
    });

    console.log(`Retrieved ${allEntries.length} total entries, ${filteredEntries.length} within date range`);

    // Calculate analytics
    const analytics = calculateAnalytics(filteredEntries);

    // Add metadata
    analytics.metadata = {
      userId: userId,
      calculatedAt: new Date().toISOString(),
      daysAnalyzed: days,
      queryRange: dateRange
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(analytics)
    };

  } catch (error) {
    console.error('Error calculating analytics:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'Failed to calculate mood analytics',
        details: error.message
      })
    };
  }
};
