#!/bin/bash

# MoodTracker S3 Photo Storage Setup Script
# Run this script to create and configure the S3 bucket for photo storage

BUCKET_NAME="moodtracker-photos-bucket"
REGION="us-east-1"

echo "🚀 Setting up MoodTracker S3 Photo Storage..."

# Create S3 bucket
echo "📦 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Configure public access settings (allow some public access for presigned URLs)
echo "🔓 Configuring public access settings..."
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration \
        BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

# Apply CORS configuration
echo "🌐 Setting up CORS configuration..."
aws s3api put-bucket-cors \
    --bucket $BUCKET_NAME \
    --cors-configuration file://s3-cors-config.json

# Apply bucket policy
echo "🔐 Setting up bucket policy..."
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy file://s3-bucket-policy.json

# Enable server-side encryption
echo "🔒 Enabling server-side encryption..."
aws s3api put-bucket-encryption \
    --bucket $BUCKET_NAME \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                },
                "BucketKeyEnabled": true
            }
        ]
    }'

# Set up lifecycle configuration to manage costs
echo "♻️ Setting up lifecycle rules..."
aws s3api put-bucket-lifecycle-configuration \
    --bucket $BUCKET_NAME \
    --lifecycle-configuration '{
        "Rules": [
            {
                "ID": "DeleteIncompleteMultipartUploads",
                "Status": "Enabled",
                "AbortIncompleteMultipartUpload": {
                    "DaysAfterInitiation": 1
                }
            },
            {
                "ID": "TransitionToIA",
                "Status": "Enabled",
                "Filter": {
                    "Prefix": "users/"
                },
                "Transitions": [
                    {
                        "Days": 30,
                        "StorageClass": "STANDARD_IA"
                    }
                ]
            }
        ]
    }'

# Enable versioning for data protection
echo "📋 Enabling versioning..."
aws s3api put-bucket-versioning \
    --bucket $BUCKET_NAME \
    --versioning-configuration Status=Enabled

echo "✅ S3 bucket setup complete!"
echo ""
echo "📊 Bucket Information:"
echo "   Name: $BUCKET_NAME"
echo "   Region: $REGION"
echo "   URL: https://$BUCKET_NAME.s3.$REGION.amazonaws.com"
echo ""
echo "🔗 Next steps:"
echo "   1. Deploy the Lambda functions (photoUpload, photoManager)"
echo "   2. Update API Gateway to include photo endpoints"
echo "   3. Update frontend to use S3 photo storage"
echo ""
echo "💰 Cost optimization:"
echo "   - Photos transition to IA storage after 30 days"
echo "   - Incomplete uploads are cleaned up after 1 day"
echo "   - Versioning is enabled for data protection"
