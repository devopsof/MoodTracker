@echo off
echo 🚀 MoodTracker S3 and CloudFront Deployment Script
echo ==============================================

set DISTRIBUTION_ID=E27U05DH6M273

echo 🔨 Building the project...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed
    exit /b 1
)

echo ⬆️ Deploying to S3...
cd dist
aws s3 sync . s3://moodtracker-legion-prod --delete
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to upload files to S3
    exit /b 1
)

echo 🔄 Creating CloudFront invalidation...
aws cloudfront create-invalidation --distribution-id %DISTRIBUTION_ID% --paths "/*"
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to create CloudFront invalidation
    exit /b 1
)

cd ..
echo.
echo ✅ Deployment completed successfully!
echo.
echo 📱 Your MoodTracker app is now live at:
echo    CloudFront URL: https://d2h9fk1tku14zk.cloudfront.net
echo.