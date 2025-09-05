const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Create DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event, null, 2));
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight check passed' })
        };
    }

    try {
        // Parse request body
        const body = JSON.parse(event.body);
        const userEmail = event.queryStringParameters?.userEmail;

        if (!userEmail) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'userEmail query parameter is required' })
            };
        }

        // Validate required fields
        if (!body.mood || body.mood < 1 || body.mood > 5) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'mood is required and must be between 1 and 5' })
            };
        }

        // Create entry object
        const timestamp = Date.now();
        const entry = {
            userId: userEmail,
            entryId: timestamp.toString(),
            mood: parseInt(body.mood),
            note: body.note || '',
            tags: body.tags || [], // ← NEW: Support tags field
            date: body.date || new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            }),
            createdAt: new Date().toISOString(),
            timestamp: timestamp
        };

        console.log('Creating entry:', JSON.stringify(entry, null, 2));

        // Save to DynamoDB
        const params = {
            TableName: 'MoodEntries',
            Item: entry
        };

        await dynamoDb.send(new PutCommand(params));

        console.log('Entry saved successfully');

        // Return success response
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                message: 'Entry created successfully',
                entry: {
                    id: entry.entryId,
                    mood: entry.mood,
                    note: entry.note,
                    tags: entry.tags, // ← NEW: Return tags in response
                    date: entry.date,
                    createdAt: entry.createdAt
                }
            })
        };

    } catch (error) {
        console.error('Error creating entry:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to create entry',
                details: error.message
            })
        };
    }
};
