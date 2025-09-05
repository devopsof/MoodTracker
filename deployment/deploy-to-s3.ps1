# MoodTracker S3 Deployment Script
# Run this script to deploy your frontend to S3

param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName,
    [string]$Profile = "default"
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

Write-Host "🚀 MoodTracker S3 Deployment Script" -ForegroundColor $InfoColor
Write-Host "=====================================" -ForegroundColor $InfoColor

# Check if AWS CLI is configured
try {
    $identity = aws sts get-caller-identity --profile $Profile 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ AWS CLI not configured. Please run 'aws configure --profile $Profile'" -ForegroundColor $ErrorColor
        exit 1
    }
    $identityObj = $identity | ConvertFrom-Json
    Write-Host "✅ AWS CLI configured for account: $($identityObj.Account)" -ForegroundColor $SuccessColor
} catch {
    Write-Host "❌ Failed to verify AWS configuration: $($_.Exception.Message)" -ForegroundColor $ErrorColor
    exit 1
}

# Check if dist folder exists
if (-not (Test-Path ".\dist")) {
    Write-Host "❌ Build folder 'dist' not found. Please run 'npm run build' first." -ForegroundColor $ErrorColor
    exit 1
}

Write-Host "✅ Build folder found" -ForegroundColor $SuccessColor

# Create S3 bucket if it doesn't exist
Write-Host "📦 Checking if S3 bucket exists: $BucketName" -ForegroundColor $InfoColor
try {
    aws s3api head-bucket --bucket $BucketName --profile $Profile 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Bucket $BucketName already exists" -ForegroundColor $SuccessColor
    } else {
        Write-Host "⚠️ Bucket $BucketName doesn't exist. Creating..." -ForegroundColor $WarningColor
        aws s3 mb s3://$BucketName --profile $Profile
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Bucket $BucketName created successfully" -ForegroundColor $SuccessColor
        } else {
            Write-Host "❌ Failed to create bucket $BucketName" -ForegroundColor $ErrorColor
            exit 1
        }
    }
} catch {
    Write-Host "❌ Error checking bucket: $($_.Exception.Message)" -ForegroundColor $ErrorColor
    exit 1
}

# Configure bucket for static website hosting
Write-Host "🌐 Configuring static website hosting..." -ForegroundColor $InfoColor
$websiteConfig = @{
    "IndexDocument" = @{ "Suffix" = "index.html" }
    "ErrorDocument" = @{ "Key" = "index.html" }  # For SPA routing
} | ConvertTo-Json -Depth 3

$websiteConfig | Out-File -FilePath "temp-website-config.json" -Encoding utf8

try {
    aws s3api put-bucket-website --bucket $BucketName --website-configuration file://temp-website-config.json --profile $Profile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Website hosting configured" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ Failed to configure website hosting" -ForegroundColor $ErrorColor
    }
} finally {
    Remove-Item "temp-website-config.json" -ErrorAction SilentlyContinue
}

# Set bucket policy for public read access
Write-Host "🔓 Setting bucket policy for public read access..." -ForegroundColor $InfoColor
$bucketPolicy = @{
    "Version" = "2012-10-17"
    "Statement" = @(
        @{
            "Sid" = "PublicReadGetObject"
            "Effect" = "Allow"
            "Principal" = "*"
            "Action" = "s3:GetObject"
            "Resource" = "arn:aws:s3:::$BucketName/*"
        }
    )
} | ConvertTo-Json -Depth 4

$bucketPolicy | Out-File -FilePath "temp-bucket-policy.json" -Encoding utf8

try {
    # Remove block public access first
    aws s3api delete-public-access-block --bucket $BucketName --profile $Profile 2>$null
    
    # Apply bucket policy
    aws s3api put-bucket-policy --bucket $BucketName --policy file://temp-bucket-policy.json --profile $Profile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Bucket policy configured" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ Failed to set bucket policy" -ForegroundColor $ErrorColor
    }
} finally {
    Remove-Item "temp-bucket-policy.json" -ErrorAction SilentlyContinue
}

# Upload files to S3
Write-Host "⬆️ Uploading files to S3..." -ForegroundColor $InfoColor
try {
    # Upload with proper content types and cache control
    aws s3 sync .\dist\ s3://$BucketName --delete --profile $Profile `
        --cache-control "public, max-age=31536000" `
        --exclude "index.html"
    
    # Upload index.html with shorter cache (for SPA updates)
    aws s3 cp .\dist\index.html s3://$BucketName/index.html --profile $Profile `
        --cache-control "no-cache, no-store, must-revalidate" `
        --content-type "text/html"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Files uploaded successfully!" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ Failed to upload files" -ForegroundColor $ErrorColor
        exit 1
    }
} catch {
    Write-Host "❌ Upload error: $($_.Exception.Message)" -ForegroundColor $ErrorColor
    exit 1
}

# Display website URL
$websiteUrl = "http://$BucketName.s3-website-us-east-1.amazonaws.com"
Write-Host "" -ForegroundColor $InfoColor
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor $SuccessColor
Write-Host "📱 Your MoodTracker app is now live at:" -ForegroundColor $InfoColor
Write-Host "   $websiteUrl" -ForegroundColor $SuccessColor
Write-Host "" -ForegroundColor $InfoColor
Write-Host "💡 Next steps:" -ForegroundColor $InfoColor
Write-Host "   - Test your app at the URL above" -ForegroundColor $InfoColor
Write-Host "   - Set up CloudFront for HTTPS and better performance" -ForegroundColor $InfoColor
Write-Host "   - Configure custom domain name" -ForegroundColor $InfoColor
Write-Host "" -ForegroundColor $InfoColor
