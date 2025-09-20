# MoodTracker Troubleshooting Script
# This script helps diagnose common deployment issues

param(
    [string]$BucketName,
    [string]$Profile = "default"
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

Write-Host "🔧 MoodTracker Troubleshooting Tool" -ForegroundColor $InfoColor
Write-Host "===================================" -ForegroundColor $InfoColor
Write-Host ""

# Check system prerequisites
Write-Host "🔍 Checking System Prerequisites" -ForegroundColor $InfoColor
Write-Host "--------------------------------" -ForegroundColor $InfoColor

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ Node.js not found" -ForegroundColor $ErrorColor
        Write-Host "   Install from: https://nodejs.org/" -ForegroundColor $InfoColor
    }
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor $ErrorColor
    Write-Host "   Install from: https://nodejs.org/" -ForegroundColor $InfoColor
}

# Check npm
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm: v$npmVersion" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ npm not found" -ForegroundColor $ErrorColor
    }
} catch {
    Write-Host "❌ npm not found" -ForegroundColor $ErrorColor
}

# Check AWS CLI
try {
    $awsVersion = aws --version 2>$null
    if ($awsVersion) {
        Write-Host "✅ AWS CLI: $awsVersion" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ AWS CLI not found" -ForegroundColor $ErrorColor
        Write-Host "   Install from: https://aws.amazon.com/cli/" -ForegroundColor $InfoColor
    }
} catch {
    Write-Host "❌ AWS CLI not found" -ForegroundColor $ErrorColor
    Write-Host "   Install from: https://aws.amazon.com/cli/" -ForegroundColor $InfoColor
}

Write-Host ""

# Check project structure
Write-Host "📁 Checking Project Structure" -ForegroundColor $InfoColor
Write-Host "-----------------------------" -ForegroundColor $InfoColor

$requiredFiles = @(
    "package.json",
    ".env.example", 
    "vite.config.js",
    "src/main.jsx",
    "deployment/deploy-to-s3.ps1"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ $file missing" -ForegroundColor $ErrorColor
    }
}

Write-Host ""

# Check environment configuration
Write-Host "⚙️ Checking Environment Configuration" -ForegroundColor $InfoColor
Write-Host "-------------------------------------" -ForegroundColor $InfoColor

if (Test-Path ".env.local") {
    Write-Host "✅ .env.local exists" -ForegroundColor $SuccessColor
    
    $envContent = Get-Content ".env.local" -Raw
    $requiredVars = @(
        "VITE_AWS_REGION",
        "VITE_COGNITO_USER_POOL_ID", 
        "VITE_COGNITO_CLIENT_ID",
        "VITE_API_BASE_URL"
    )
    
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=.+") {
            Write-Host "✅ $var configured" -ForegroundColor $SuccessColor
        } elseif ($envContent -match "$var=\s*$") {
            Write-Host "⚠️ $var is empty" -ForegroundColor $WarningColor
        } else {
            Write-Host "❌ $var missing" -ForegroundColor $ErrorColor
        }
    }
} else {
    Write-Host "❌ .env.local not found" -ForegroundColor $ErrorColor
    Write-Host "   Run: cp .env.example .env.local" -ForegroundColor $InfoColor
}

Write-Host ""

# Check AWS credentials
Write-Host "🔐 Checking AWS Configuration" -ForegroundColor $InfoColor
Write-Host "-----------------------------" -ForegroundColor $InfoColor

try {
    $identity = aws sts get-caller-identity --profile $Profile 2>$null
    if ($LASTEXITCODE -eq 0) {
        $identityObj = $identity | ConvertFrom-Json
        Write-Host "✅ AWS credentials configured" -ForegroundColor $SuccessColor
        Write-Host "   Account: $($identityObj.Account)" -ForegroundColor $InfoColor
        Write-Host "   User: $($identityObj.Arn)" -ForegroundColor $InfoColor
    } else {
        Write-Host "❌ AWS credentials not configured" -ForegroundColor $ErrorColor
        Write-Host "   Run: aws configure" -ForegroundColor $InfoColor
    }
} catch {
    Write-Host "❌ AWS credentials not configured" -ForegroundColor $ErrorColor
    Write-Host "   Run: aws configure" -ForegroundColor $InfoColor
}

Write-Host ""

# Check build process
Write-Host "🔨 Checking Build Process" -ForegroundColor $InfoColor
Write-Host "-------------------------" -ForegroundColor $InfoColor

if (Test-Path "dist") {
    Write-Host "✅ dist folder exists" -ForegroundColor $SuccessColor
    
    if (Test-Path "dist/index.html") {
        Write-Host "✅ index.html built" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ index.html missing from build" -ForegroundColor $ErrorColor
    }
    
    $distFiles = Get-ChildItem "dist" -Recurse | Measure-Object
    Write-Host "   Build contains $($distFiles.Count) files" -ForegroundColor $InfoColor
} else {
    Write-Host "❌ dist folder not found" -ForegroundColor $ErrorColor
    Write-Host "   Run: npm run build" -ForegroundColor $InfoColor
}

# Test build process
Write-Host "🧪 Testing build process..." -ForegroundColor $InfoColor
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build process successful" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ Build process failed" -ForegroundColor $ErrorColor
        Write-Host "   Error output:" -ForegroundColor $InfoColor
        Write-Host $buildOutput -ForegroundColor $WarningColor
    }
} catch {
    Write-Host "❌ Build process failed: $($_.Exception.Message)" -ForegroundColor $ErrorColor
}

Write-Host ""

# Check deployment if bucket name provided
if ($BucketName) {
    Write-Host "🚀 Checking Deployment Status" -ForegroundColor $InfoColor
    Write-Host "-----------------------------" -ForegroundColor $InfoColor
    
    # Run the deployment checker
    & "$PSScriptRoot\check-deployment.ps1" -BucketName $BucketName -Profile $Profile
}

Write-Host ""

# Common solutions
Write-Host "💡 Common Solutions" -ForegroundColor $InfoColor
Write-Host "------------------" -ForegroundColor $InfoColor
Write-Host ""

Write-Host "🔧 Build Issues:" -ForegroundColor $WarningColor
Write-Host "   - Check environment variables in .env.local" -ForegroundColor $InfoColor
Write-Host "   - Run: npm install to ensure dependencies" -ForegroundColor $InfoColor
Write-Host "   - Clear cache: npm run build --clean" -ForegroundColor $InfoColor
Write-Host ""

Write-Host "🔧 AWS Issues:" -ForegroundColor $WarningColor
Write-Host "   - Configure credentials: aws configure" -ForegroundColor $InfoColor
Write-Host "   - Check IAM permissions for S3" -ForegroundColor $InfoColor
Write-Host "   - Verify region is us-east-1" -ForegroundColor $InfoColor
Write-Host ""

Write-Host "🔧 Deployment Issues:" -ForegroundColor $WarningColor
Write-Host "   - Bucket names must be globally unique" -ForegroundColor $InfoColor
Write-Host "   - Check bucket policy allows public read" -ForegroundColor $InfoColor
Write-Host "   - Verify website hosting is enabled" -ForegroundColor $InfoColor
Write-Host ""

Write-Host "🔧 Website Access Issues:" -ForegroundColor $WarningColor
Write-Host "   - Wait 5-10 minutes for DNS propagation" -ForegroundColor $InfoColor
Write-Host "   - Check browser cache (try incognito mode)" -ForegroundColor $InfoColor
Write-Host "   - Verify S3 website URL format" -ForegroundColor $InfoColor
Write-Host ""

Write-Host "📚 Additional Help:" -ForegroundColor $InfoColor
Write-Host "   - Deployment Guide: docs/DEPLOYMENT.md" -ForegroundColor $InfoColor
Write-Host "   - GitHub Actions Guide: docs/GITHUB_ACTIONS.md" -ForegroundColor $InfoColor
Write-Host "   - Check deployment: .\scripts\check-deployment.ps1 -BucketName your-bucket" -ForegroundColor $InfoColor
