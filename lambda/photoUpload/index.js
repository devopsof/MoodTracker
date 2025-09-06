const AWS = require('aws-sdk');
const { randomUUID } = require('crypto');

// Initialize S3 client
const s3 = new AWS.S3({
    region: process.env.AWS_REGION || 'us-east-1',
    signatureVersion: 'v4'
});

const BUCKET_NAME = process.env.PHOTO_BUCKET_NAME || 'moodtracker-photos-bucket';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

/**
 * Generate a presigned URL for uploading photos to S3
 * @param {Object} event - API Gateway event
 * @returns {Object} - Presigned URL response
 */
exports.handler = async (event) => {
    console.log('Photo upload request:', JSON.stringify(event, null, 2));
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'CORS preflight' })
        };
    }
    
    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { fileName, fileType, fileSize, userEmail } = body;
        
        // Validate required fields
        if (!fileName || !fileType || !userEmail) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Missing required fields: fileName, fileType, userEmail'
                })
            };
        }
        
        // Validate file type (only images)
        if (!fileType.startsWith('image/')) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Only image files are allowed'
                })
            };
        }
        
        // Validate file size (max 10MB)
        if (fileSize && fileSize > 10 * 1024 * 1024) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'File size too large. Maximum 10MB allowed.'
                })
            };
        }
        
        // Generate unique photo ID and S3 key
        const photoId = `photo_${Date.now()}_${randomUUID()}`;
        const userPrefix = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
        const s3Key = `users/${userPrefix}/photos/${photoId}/${fileName}`;
        
        console.log(`Generating presigned URL for: ${s3Key}`);
        
        // Generate presigned URL for upload
        const presignedUrl = s3.getSignedUrl('putObject', {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            ContentType: fileType,
            Expires: 300, // 5 minutes
            Metadata: {
                'photo-id': photoId,
                'user-email': userEmail,
                'uploaded-at': new Date().toISOString()
            }
        });
        
        // Generate the final URL for accessing the photo
        const photoUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
        
        console.log(`Generated presigned URL for upload: ${s3Key}`);
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                upload: {
                    presignedUrl: presignedUrl,
                    photoId: photoId,
                    s3Key: s3Key,
                    photoUrl: photoUrl,
                    expiresIn: 300
                },
                photo: {
                    id: photoId,
                    fileName: fileName,
                    fileType: fileType,
                    fileSize: fileSize,
                    url: photoUrl,
                    s3Key: s3Key,
                    createdAt: new Date().toISOString()
                }
            })
        };
        
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to generate upload URL',
                details: error.message
            })
        };
    }
};
