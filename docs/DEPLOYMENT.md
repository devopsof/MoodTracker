# 🚀 MoodTracker Deployment Guide

This comprehensive guide will help you deploy your MoodTracker application to AWS S3 with CloudFront for a production-ready setup.

## 📋 Prerequisites

### Required Software
1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **AWS CLI** (v2 recommended) - [Installation guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
3. **Git** - [Download here](https://git-scm.com/downloads)

### AWS Account Setup
1. **AWS Account** - Create one at [aws.amazon.com](https://aws.amazon.com)
2. **IAM User** with the following permissions:
   - `s3:CreateBucket`
   - `s3:DeleteBucket`
   - `s3:GetBucketLocation`
   - `s3:ListBucket`
   - `s3:GetObject`
   - `s3:PutObject`
   - `s3:DeleteObject`
   - `s3:PutBucketWebsite`
   - `s3:PutBucketPolicy`
   - `s3:DeletePublicAccessBlock`
   - `cloudfront:*` (if using CloudFront)

### Configure AWS CLI
```bash
aws configure
```
Enter your:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region: `us-east-1`
- Output format: `json`

### Verify AWS Setup
```bash
aws sts get-caller-identity
```

## 🎯 Quick Start

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/moodtracker.git
cd moodtracker

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Step 2: Configure Environment
Edit `.env.local` with your AWS settings:
```bash
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_API_GATEWAY_URL=https://api.yourdomain.com
VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

### Step 3: Build and Deploy

#### Option A: Using PowerShell Script (Recommended for Windows)
```powershell
# Build the application
npm run build

# Deploy to S3 (replace with your unique bucket name)
.\deployment\deploy-to-s3.ps1 -BucketName "moodtracker-app-yourname"
```

#### Option B: Using Bash Script (Recommended for Mac/Linux)
```bash
# Build the application
npm run build

# Deploy to S3 (replace with your unique bucket name)
./aws/setup-s3.sh moodtracker-app-yourname
```

#### Option C: Manual AWS CLI Commands
**Step-by-step manual deployment for full control:**

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Create S3 bucket (choose a unique name):**
   ```bash
   aws s3 mb s3://moodtracker-app-yourname
   ```

3. **Remove public access block:**
   ```bash
   aws s3api delete-public-access-block --bucket moodtracker-app-yourname
   ```

4. **Configure static website hosting:**
   ```bash
   aws s3api put-bucket-website --bucket moodtracker-app-yourname --website-configuration '{
     "IndexDocument": {"Suffix": "index.html"},
     "ErrorDocument": {"Key": "index.html"}
   }'
   ```

5. **Set public read policy:**
   ```bash
   aws s3api put-bucket-policy --bucket moodtracker-app-yourname --policy '{
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::moodtracker-app-yourname/*"
     }]
   }'
   ```

6. **Upload files with proper caching:**
   ```bash
   # Upload assets with long-term caching
   aws s3 sync dist/ s3://moodtracker-app-yourname --delete --cache-control "public, max-age=31536000" --exclude "index.html"
   
   # Upload index.html with no caching (for SPA updates)
   aws s3 cp dist/index.html s3://moodtracker-app-yourname/index.html --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html"
   ```

7. **Your app is now live at:**
   ```
   http://moodtracker-app-yourname.s3-website-us-east-1.amazonaws.com
   ```

## 🌍 Production Setup with CloudFront

For production, set up CloudFront CDN for better performance and HTTPS:

### Create CloudFront Distribution
```bash
# Create CloudFront distribution (replace bucket name)
aws cloudfront create-distribution --distribution-config file://deployment/cloudfront-config.json
```

### Benefits of CloudFront:
- ✅ Global CDN for faster loading
- ✅ Free SSL/TLS certificate
- ✅ Custom domain support
- ✅ Better caching control
- ✅ DDoS protection

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
