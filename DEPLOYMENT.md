# MoodTracker Deployment Guide

This document explains how to deploy your MoodTracker frontend to AWS S3.

## Prerequisites

1. **AWS CLI installed and configured**
   ```bash
   aws configure
   ```
   Enter your AWS Access Key ID, Secret Access Key, region (us-east-1), and output format (json).

2. **Node.js dependencies installed**
   ```bash
   npm install
   ```

## Quick Deployment

### Option 1: Using the PowerShell Script (Recommended)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Run the deployment script:**
   ```powershell
   .\deploy-to-s3.ps1 -BucketName "your-unique-bucket-name"
   ```

   Example:
   ```powershell
   .\deploy-to-s3.ps1 -BucketName "moodtracker-app-prod"
   ```

### Option 2: Manual AWS CLI Commands

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Create S3 bucket:**
   ```bash
   aws s3 mb s3://your-bucket-name
   ```

3. **Configure static website hosting:**
   ```bash
   aws s3api put-bucket-website --bucket your-bucket-name --website-configuration '{
     "IndexDocument": {"Suffix": "index.html"},
     "ErrorDocument": {"Key": "index.html"}
   }'
   ```

4. **Set public read policy:**
   ```bash
   aws s3api put-bucket-policy --bucket your-bucket-name --policy '{
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::your-bucket-name/*"
     }]
   }'
   ```

5. **Upload files:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

## Environment Variables

The app uses these environment variables (defined in `.env.production`):

- `VITE_AWS_REGION` - AWS region (us-east-1)
- `VITE_COGNITO_USERPOOL_ID` - Cognito User Pool ID
- `VITE_COGNITO_CLIENT_ID` - Cognito Client ID
- `VITE_COGNITO_DOMAIN` - Cognito domain URL
- `VITE_API_BASE_URL` - API Gateway endpoint URL

## Post-Deployment Steps

1. **Test your deployment:**
   Visit: `http://your-bucket-name.s3-website-us-east-1.amazonaws.com`

2. **Set up CloudFront (Recommended):**
   - Create a CloudFront distribution
   - Set S3 bucket as origin
   - Configure custom error pages for SPA routing
   - Enable HTTPS with ACM certificate

3. **Configure custom domain:**
   - Register domain or use existing
   - Create ACM certificate
   - Update CloudFront distribution
   - Configure DNS (Route 53 or external)

## Troubleshooting

### Common Issues:

1. **403 Forbidden Error:**
   - Check bucket policy allows public read access
   - Verify bucket is configured for static website hosting

2. **Route Not Found (404 on refresh):**
   - Ensure error document is set to `index.html`
   - For CloudFront, configure custom error responses

3. **CORS Issues:**
   - Update API Gateway CORS settings
   - Ensure API allows requests from your domain

4. **Build Issues:**
   - Check environment variables are properly set
   - Verify all dependencies are installed

### Debugging:

1. **Check AWS credentials:**
   ```bash
   aws sts get-caller-identity
   ```

2. **Verify bucket exists:**
   ```bash
   aws s3 ls s3://your-bucket-name
   ```

3. **Test website endpoint:**
   ```bash
   curl -I http://your-bucket-name.s3-website-us-east-1.amazonaws.com
   ```

## Security Considerations

- Never commit `.env.local` or `.env.production` with secrets to git
- Use least-privilege IAM policies for deployment
- Consider implementing Content Security Policy (CSP) headers
- Use HTTPS in production (CloudFront + ACM certificate)

## Automation

For CI/CD, you can use GitHub Actions or similar:

```yaml
name: Deploy to S3
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 sync dist/ s3://your-bucket-name --delete
```
