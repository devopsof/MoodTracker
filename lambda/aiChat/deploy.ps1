# AI Chat Lambda Deployment Script
# This script packages and deploys the AI Chat Lambda function

param(
    [string]$FunctionName = "moodflow-ai-chat",
    [string]$Profile = "default",
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying AI Chat Lambda Function" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if AWS CLI is configured
try {
    $identity = aws sts get-caller-identity --profile $Profile 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ AWS CLI not configured for profile: $Profile" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ AWS CLI configured" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to verify AWS configuration" -ForegroundColor Red
    exit 1
}

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "deployment.zip") {
    Remove-Item "deployment.zip" -Force
}

# Create a zip file with the Lambda function
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open("deployment.zip", [System.IO.Compression.ZipArchiveMode]::Create)

# Add index.js
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "index.js", "index.js")

# Add package.json
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "package.json", "package.json")

$zip.Dispose()

Write-Host "✅ Deployment package created: deployment.zip" -ForegroundColor Green

# Deploy to AWS Lambda
Write-Host "☁️ Deploying to AWS Lambda..." -ForegroundColor Yellow

# Check if function exists
$functionExists = $false
try {
    aws lambda get-function --function-name $FunctionName --profile $Profile --region $Region 2>$null
    if ($LASTEXITCODE -eq 0) {
        $functionExists = $true
    }
} catch {
    # Function doesn't exist, we'll create it
}

if ($functionExists) {
    Write-Host "🔄 Updating existing function..." -ForegroundColor Yellow
    aws lambda update-function-code `
        --function-name $FunctionName `
        --zip-file "fileb://deployment.zip" `
        --profile $Profile `
        --region $Region
} else {
    Write-Host "🆕 Creating new function..." -ForegroundColor Yellow
    
    # Create IAM role for Lambda if it doesn't exist
    $roleName = "$FunctionName-role"
    $roleArn = ""
    
    try {
        $roleInfo = aws iam get-role --role-name $roleName --profile $Profile 2>$null
        if ($LASTEXITCODE -eq 0) {
            $roleArn = ($roleInfo | ConvertFrom-Json).Role.Arn
            Write-Host "✅ Using existing IAM role: $roleName" -ForegroundColor Green
        }
    } catch {
        Write-Host "🔧 Creating IAM role..." -ForegroundColor Yellow
        
        # Create trust policy
        $trustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
"@
        
        $trustPolicy | Out-File -FilePath "trust-policy.json" -Encoding utf8
        
        aws iam create-role `
            --role-name $roleName `
            --assume-role-policy-document "file://trust-policy.json" `
            --profile $Profile
        
        # Attach basic execution role
        aws iam attach-role-policy `
            --role-name $roleName `
            --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" `
            --profile $Profile
        
        # Get role ARN
        Start-Sleep -Seconds 10  # Wait for IAM propagation
        $roleInfo = aws iam get-role --role-name $roleName --profile $Profile
        $roleArn = ($roleInfo | ConvertFrom-Json).Role.Arn
        
        Remove-Item "trust-policy.json" -Force
        Write-Host "✅ IAM role created: $roleName" -ForegroundColor Green
    }
    
    # Create the Lambda function
    aws lambda create-function `
        --function-name $FunctionName `
        --runtime "nodejs20.x" `
        --role $roleArn `
        --handler "index.handler" `
        --zip-file "fileb://deployment.zip" `
        --timeout 30 `
        --memory-size 256 `
        --profile $Profile `
        --region $Region
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Lambda function deployed successfully!" -ForegroundColor Green
    
    # Get function info
    $functionInfo = aws lambda get-function --function-name $FunctionName --profile $Profile --region $Region | ConvertFrom-Json
    $functionArn = $functionInfo.Configuration.FunctionArn
    
    Write-Host "" -ForegroundColor White
    Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
    Write-Host "Function Name: $FunctionName" -ForegroundColor Cyan
    Write-Host "Function ARN: $functionArn" -ForegroundColor Cyan
    Write-Host "" -ForegroundColor White
    Write-Host "💡 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Set up API Gateway endpoint for this function" -ForegroundColor White
    Write-Host "2. Add environment variables for API keys:" -ForegroundColor White
    Write-Host "   - OPENAI_API_KEY" -ForegroundColor Gray
    Write-Host "   - ANTHROPIC_API_KEY" -ForegroundColor Gray
    Write-Host "   - GROQ_API_KEY" -ForegroundColor Gray
    Write-Host "3. Test the function with a sample payload" -ForegroundColor White
    
} else {
    Write-Host "❌ Failed to deploy Lambda function" -ForegroundColor Red
    exit 1
}

# Clean up
Remove-Item "deployment.zip" -Force
Write-Host "🧹 Cleaned up deployment files" -ForegroundColor Gray
