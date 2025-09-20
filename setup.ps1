# MoodTracker Environment Setup Script
# This script helps you configure your MoodTracker environment for AWS deployment

param(
    [switch]$SkipAWS
)

$ErrorColor = "Red"
$SuccessColor = "Green" 
$InfoColor = "Cyan"
$WarningColor = "Yellow"

Write-Host "🚀 MoodTracker Environment Setup" -ForegroundColor $InfoColor
Write-Host "=================================" -ForegroundColor $InfoColor
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor $InfoColor

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor $ErrorColor
        exit 1
    }
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor $ErrorColor
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm: v$npmVersion" -ForegroundColor $SuccessColor
    }
} catch {
    Write-Host "❌ npm not found" -ForegroundColor $ErrorColor
    exit 1
}

# Check AWS CLI (optional)
if (-not $SkipAWS) {
    try {
        $awsVersion = aws --version 2>$null
        if ($awsVersion) {
            Write-Host "✅ AWS CLI: $awsVersion" -ForegroundColor $SuccessColor
        } else {
            Write-Host "⚠️ AWS CLI not found. Install from https://aws.amazon.com/cli/" -ForegroundColor $WarningColor
            Write-Host "   You can skip this check with -SkipAWS flag" -ForegroundColor $WarningColor
        }
    } catch {
        Write-Host "⚠️ AWS CLI not found. Install from https://aws.amazon.com/cli/" -ForegroundColor $WarningColor
    }
}

Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor $InfoColor
try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor $ErrorColor
        exit 1
    }
} catch {
    Write-Host "❌ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor $ErrorColor
    exit 1
}

Write-Host ""

# Create environment file
Write-Host "⚙️ Setting up environment configuration..." -ForegroundColor $InfoColor

if (-not (Test-Path ".env.example")) {
    Write-Host "❌ .env.example file not found!" -ForegroundColor $ErrorColor
    exit 1
}

if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local from template" -ForegroundColor $SuccessColor
} else {
    Write-Host "⚠️ .env.local already exists" -ForegroundColor $WarningColor
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -eq "y" -or $overwrite -eq "Y") {
        Copy-Item ".env.example" ".env.local" -Force
        Write-Host "✅ Overwrote .env.local with template" -ForegroundColor $SuccessColor
    }
}

Write-Host ""

# Interactive environment configuration
Write-Host "🔧 Environment Configuration" -ForegroundColor $InfoColor
Write-Host "Please provide your AWS configuration details:" -ForegroundColor $InfoColor
Write-Host "(Press Enter to keep existing values or skip)" -ForegroundColor $WarningColor
Write-Host ""

# Read current .env.local content
$envContent = Get-Content ".env.local" -Raw

# Function to update environment variable
function Update-EnvVar {
    param($varName, $description, $currentValue = "")
    
    Write-Host "$description" -ForegroundColor $InfoColor
    if ($currentValue) {
        Write-Host "Current: $currentValue" -ForegroundColor $WarningColor
    }
    $newValue = Read-Host "Enter $varName"
    
    if ($newValue) {
        $script:envContent = $envContent -replace "$varName=.*", "$varName=$newValue"
        Write-Host "✅ Updated $varName" -ForegroundColor $SuccessColor
    } else {
        Write-Host "⏭️ Skipped $varName" -ForegroundColor $WarningColor
    }
    Write-Host ""
}

# Extract current values
$currentRegion = ($envContent | Select-String "VITE_AWS_REGION=(.*)").Matches.Groups[1].Value
$currentPoolId = ($envContent | Select-String "VITE_COGNITO_USER_POOL_ID=(.*)").Matches.Groups[1].Value
$currentClientId = ($envContent | Select-String "VITE_COGNITO_CLIENT_ID=(.*)").Matches.Groups[1].Value
$currentApiUrl = ($envContent | Select-String "VITE_API_BASE_URL=(.*)").Matches.Groups[1].Value

# Update environment variables
Update-EnvVar "VITE_AWS_REGION" "AWS Region (e.g., us-east-1):" $currentRegion
Update-EnvVar "VITE_COGNITO_USER_POOL_ID" "Cognito User Pool ID (e.g., us-east-1_XXXXXXXXX):" $currentPoolId
Update-EnvVar "VITE_COGNITO_CLIENT_ID" "Cognito Client ID:" $currentClientId
Update-EnvVar "VITE_API_BASE_URL" "API Gateway URL (e.g., https://api.example.com/prod):" $currentApiUrl

# Save updated environment
$envContent | Out-File ".env.local" -Encoding utf8 -NoNewline
Write-Host "✅ Environment configuration saved to .env.local" -ForegroundColor $SuccessColor

Write-Host ""

# Test build
Write-Host "🔨 Testing build..." -ForegroundColor $InfoColor
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ Build failed. Please check your environment configuration." -ForegroundColor $ErrorColor
        Write-Host "   Review .env.local and ensure all values are correct." -ForegroundColor $InfoColor
        exit 1
    }
} catch {
    Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor $ErrorColor
    exit 1
}

Write-Host ""

# Final instructions
Write-Host "🎉 Setup completed successfully!" -ForegroundColor $SuccessColor
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor $InfoColor
Write-Host "1. Review your .env.local file and update any remaining values" -ForegroundColor $InfoColor
Write-Host "2. Configure AWS CLI: aws configure" -ForegroundColor $InfoColor
Write-Host "3. Deploy to S3: .\deployment\deploy-to-s3.ps1 -BucketName 'your-unique-bucket-name'" -ForegroundColor $InfoColor
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor $InfoColor
Write-Host "   Deployment Guide: docs/DEPLOYMENT.md" -ForegroundColor $InfoColor
Write-Host "   README: README.md" -ForegroundColor $InfoColor
Write-Host ""
Write-Host "💡 Need help? Check the troubleshooting section in docs/DEPLOYMENT.md" -ForegroundColor $InfoColor
