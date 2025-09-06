const AWS = require('aws-sdk');

// Initialize S3 client
const s3 = new AWS.S3({
    region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.PHOTO_BUCKET_NAME || 'moodtracker-photos-bucket';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
};

/**
 * Handle photo management operations (delete, list)
 * @param {Object} event - API Gateway event
 * @returns {Object} - Response
 */
exports.handler = async (event) => {
    console.log('Photo management request:', JSON.stringify(event, null, 2));
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'CORS preflight' })
        };
    }
    
    try {
        const method = event.httpMethod;
        const userEmail = event.queryStringParameters?.userEmail;
        
        if (!userEmail) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'userEmail parameter is required'
                })
            };
        }
        
        const userPrefix = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
        
        switch (method) {
            case 'DELETE':
                return await handleDeletePhoto(event, userPrefix);
            case 'GET':
                return await handleListPhotos(event, userPrefix);
            default:
                return {
                    statusCode: 405,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        error: 'Method not allowed'
                    })
                };
        }
        
    } catch (error) {
        console.error('Photo management error:', error);
        
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Photo management failed',
                details: error.message
            })
        };
    }
};

/**
 * Delete a photo from S3
 * @param {Object} event - API Gateway event
 * @param {string} userPrefix - User prefix for S3 keys
 */
async function handleDeletePhoto(event, userPrefix) {
    const body = JSON.parse(event.body || '{}');
    const { photoId, s3Key } = body;
    
    if (!photoId && !s3Key) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Either photoId or s3Key is required for deletion'
            })
        };
    }
    
    try {
        let keyToDelete = s3Key;
        
        // If only photoId provided, construct the key pattern and find it
        if (!s3Key && photoId) {
            const listParams = {
                Bucket: BUCKET_NAME,
                Prefix: `users/${userPrefix}/photos/${photoId}/`
            };
            
            const listResult = await s3.listObjectsV2(listParams).promise();
            if (listResult.Contents && listResult.Contents.length > 0) {
                keyToDelete = listResult.Contents[0].Key;
            } else {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        error: 'Photo not found'
                    })
                };
            }
        }
        
        // Delete the photo
        const deleteParams = {
            Bucket: BUCKET_NAME,
            Key: keyToDelete
        };
        
        await s3.deleteObject(deleteParams).promise();
        console.log(`Deleted photo: ${keyToDelete}`);
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: 'Photo deleted successfully',
                deletedKey: keyToDelete
            })
        };
        
    } catch (error) {
        console.error('Error deleting photo:', error);
        throw error;
    }
}

/**
 * List photos for a user
 * @param {Object} event - API Gateway event
 * @param {string} userPrefix - User prefix for S3 keys
 */
async function handleListPhotos(event, userPrefix) {
    try {
        const listParams = {
            Bucket: BUCKET_NAME,
            Prefix: `users/${userPrefix}/photos/`,
            MaxKeys: 1000
        };
        
        const result = await s3.listObjectsV2(listParams).promise();
        
        const photos = (result.Contents || []).map(obj => {
            // Extract photo ID from key pattern: users/user_prefix/photos/photo_id/filename
            const keyParts = obj.Key.split('/');
            const photoId = keyParts[3]; // photo_id part
            const fileName = keyParts[4]; // filename part
            
            return {
                id: photoId,
                fileName: fileName,
                s3Key: obj.Key,
                url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${obj.Key}`,
                size: obj.Size,
                lastModified: obj.LastModified,
                etag: obj.ETag
            };
        });
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                photos: photos,
                count: photos.length
            })
        };
        
    } catch (error) {
        console.error('Error listing photos:', error);
        throw error;
    }
}
