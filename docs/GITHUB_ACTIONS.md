# 🚀 GitHub Actions CI/CD Setup

This guide explains how to set up automated deployments for your MoodTracker application using GitHub Actions.

## 🎯 What This Does

The GitHub Actions workflow automatically:
- ✅ Builds your application on every push
- ✅ Runs tests and linting (if configured)
- ✅ Deploys to AWS S3 on main/master branch
- ✅ Configures S3 for static website hosting
- ✅ Invalidates CloudFront cache (if configured)
- ✅ Provides deployment summaries

## 📋 Prerequisites

1. **GitHub Repository** with your MoodTracker code
2. **AWS Account** with S3 permissions
3. **Environment Variables** configured in your repository

## ⚙️ Setup Instructions

### Step 1: Configure GitHub Repository Settings

Navigate to your GitHub repository settings:
`Settings → Security → Secrets and variables → Actions`

#### Required Secrets
Add the following **Repository Secrets**:

```
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

#### Required Variables  
Add the following **Repository Variables**:

```bash
# AWS Configuration
VITE_AWS_REGION=us-east-1
S3_BUCKET_NAME=moodtracker-app-yourname

# Application Environment Variables
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_API_GATEWAY_URL=https://api.yourdomain.com
VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

#### Optional Variables
```bash
# For CloudFront Integration
CLOUDFRONT_DISTRIBUTION_ID=E1ABCDEFGHIJKL
```

### Step 2: Workflow File

The workflow file is already included at `.github/workflows/deploy.yml`. If you need to customize it:

```yaml
# Key configuration points:
- Triggers on: push to main/master, pull requests, manual dispatch
- Node.js version: 18 (configurable)
- Deploys only from main/master branch
- Includes CloudFront invalidation (optional)
```

### Step 3: First Deployment

1. **Push to main/master branch**:
   ```bash
   git add .
   git commit -m "Add GitHub Actions deployment"
   git push origin main
   ```

2. **Monitor deployment**:
   - Go to `Actions` tab in your GitHub repository
   - Watch the deployment process
   - Check the deployment summary

3. **Access your deployed app**:
   - URL will be shown in the deployment summary
   - Format: `http://your-bucket-name.s3-website-us-east-1.amazonaws.com`

## 🏗️ Workflow Details

### Build Job
- Installs Node.js dependencies
- Runs tests and linting (if available)
- Builds the application
- Uploads build artifacts

### Deploy Job  
- Only runs on main/master branch pushes
- Downloads build artifacts
- Configures AWS credentials
- Creates/configures S3 bucket
- Uploads files with proper caching headers
- Creates deployment summary

### Cleanup Job
- Cleans up temporary artifacts
- Runs regardless of success/failure

## 🛠️ Customization Options

### Different Node.js Version
Edit `.github/workflows/deploy.yml`:
```yaml
env:
  NODE_VERSION: '20'  # Change to desired version
```

### Custom Build Commands
Add custom scripts to your `package.json`:
```json
{
  "scripts": {
    "build:prod": "vite build --mode production",
    "test:ci": "vitest run --coverage"
  }
}
```

### Environment-Specific Deployments
Create separate workflows for staging/production:
```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches: [ develop ]

# Use different S3 bucket
S3_BUCKET_NAME: moodtracker-app-staging
```

## 🔧 Troubleshooting

### Common Issues

#### 1. AWS Credentials Error
```
Error: Could not load credentials from any providers
```
**Solution**: Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in repository secrets.

#### 2. S3 Bucket Already Exists (Different Region)
```
Error: A conflicting conditional operation is currently in progress
```
**Solution**: Choose a unique bucket name or delete existing bucket.

#### 3. Environment Variables Not Working
```
Error: Cannot resolve environment variables
```
**Solution**: Check that variables are set in repository settings, not secrets.

#### 4. Build Failures
```
Error: Process completed with exit code 1
```
**Solution**: 
- Check build logs for specific errors
- Ensure all environment variables are configured
- Test build locally: `npm run build`

### Debug Steps

1. **Check Action Logs**:
   - Go to Actions tab → Failed workflow → Click on failed step
   - Review detailed logs for error messages

2. **Test Locally**:
   ```bash
   # Test your build process locally
   npm install
   npm run build
   
   # Verify environment variables
   cat .env.local
   ```

3. **Verify AWS Permissions**:
   ```bash
   # Test AWS credentials locally
   aws sts get-caller-identity
   aws s3 ls
   ```

## 🔒 Security Best Practices

### IAM User Permissions
Create an IAM user with minimal required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:PutBucketWebsite",
        "s3:PutBucketPolicy",
        "s3:DeletePublicAccessBlock"
      ],
      "Resource": [
        "arn:aws:s3:::moodtracker-app-*",
        "arn:aws:s3:::moodtracker-app-*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

### Repository Settings
- ✅ Use repository secrets for sensitive data
- ✅ Use repository variables for non-sensitive configuration
- ✅ Enable branch protection rules for main branch
- ✅ Require pull request reviews before merging

## 📊 Monitoring Deployments

### Deployment Status
- Check Actions tab for deployment history
- Monitor deployment summaries
- Set up GitHub notifications for failures

### Post-Deployment Testing
The workflow can be extended to include automated testing:

```yaml
- name: 🧪 Test deployed application
  run: |
    # Wait for deployment to be ready
    sleep 30
    
    # Test if site is accessible
    curl -f ${{ steps.deploy.outputs.website-url }} || exit 1
    
    # Run E2E tests against deployed site
    npm run test:e2e -- --url=${{ steps.deploy.outputs.website-url }}
```

## 🎯 Advanced Features

### Multi-Environment Support
Set up different environments with branch-specific deployments:

- `main` → Production S3 bucket
- `develop` → Staging S3 bucket  
- `feature/*` → Preview deployments

### Slack/Discord Notifications
Add notification steps to inform your team:

```yaml
- name: 📢 Notify on success
  if: success()
  run: |
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚀 MoodTracker deployed successfully to ${{ steps.deploy.outputs.website-url }}"}' \
    ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Rollback Capability
Implement automatic rollback on health check failures:

```yaml
- name: 🔄 Rollback on failure
  if: failure()
  run: |
    echo "Deployment failed, implementing rollback..."
    # Restore previous version logic here
```

---

**Need help?** Check the [Deployment Guide](DEPLOYMENT.md) or create an issue in the repository.
