# MoodTracker Deployment Status Checker
# This script checks the status of your MoodTracker deployment

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

Write-Host "🔍 MoodTracker Deployment Status Check" -ForegroundColor $InfoColor
Write-Host "======================================" -ForegroundColor $InfoColor
Write-Host ""

# Check AWS credentials
try {
    $identity = aws sts get-caller-identity --profile $Profile 2>$null | ConvertFrom-Json
    Write-Host "✅ AWS Identity: $($identity.Account)" -ForegroundColor $SuccessColor
} catch {
    Write-Host "❌ AWS credentials not configured" -ForegroundColor $ErrorColor
    exit 1
}

# Check if bucket exists
Write-Host "📦 Checking S3 bucket: $BucketName" -ForegroundColor $InfoColor
try {
    aws s3api head-bucket --bucket $BucketName --profile $Profile 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Bucket exists" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ Bucket does not exist" -ForegroundColor $ErrorColor
        exit 1
    }
} catch {
    Write-Host "❌ Error checking bucket" -ForegroundColor $ErrorColor
    exit 1
}

# Check website hosting configuration
Write-Host "🌐 Checking website hosting configuration..." -ForegroundColor $InfoColor
try {
    $websiteConfig = aws s3api get-bucket-website --bucket $BucketName --profile $Profile 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Website hosting configured" -ForegroundColor $SuccessColor
        $config = $websiteConfig | ConvertFrom-Json
        Write-Host "   Index document: $($config.IndexDocument.Suffix)" -ForegroundColor $InfoColor
        if ($config.ErrorDocument) {
            Write-Host "   Error document: $($config.ErrorDocument.Key)" -ForegroundColor $InfoColor
        }
    } else {
        Write-Host "❌ Website hosting not configured" -ForegroundColor $ErrorColor
    }
} catch {
    Write-Host "❌ Error checking website configuration" -ForegroundColor $ErrorColor
}

# Check bucket policy
Write-Host "🔓 Checking bucket policy..." -ForegroundColor $InfoColor
try {
    aws s3api get-bucket-policy --bucket $BucketName --profile $Profile 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Public read policy configured" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ No public read policy found" -ForegroundColor $ErrorColor
    }
} catch {
    Write-Host "⚠️ Could not verify bucket policy" -ForegroundColor $WarningColor
}

# Check if files exist
Write-Host "📁 Checking deployed files..." -ForegroundColor $InfoColor
try {
    $objects = aws s3 ls s3://$BucketName --profile $Profile 2>$null
    if ($objects) {
        $fileCount = ($objects | Measure-Object).Count
        Write-Host "✅ Found $fileCount files in bucket" -ForegroundColor $SuccessColor
        
        # Check for index.html specifically
        if ($objects -match "index.html") {
            Write-Host "✅ index.html found" -ForegroundColor $SuccessColor
        } else {
            Write-Host "❌ index.html not found" -ForegroundColor $ErrorColor
        }
    } else {
        Write-Host "❌ No files found in bucket" -ForegroundColor $ErrorColor
    }
} catch {
    Write-Host "❌ Error checking bucket contents" -ForegroundColor $ErrorColor
}

# Test website endpoint
$websiteUrl = "http://$BucketName.s3-website-us-east-1.amazonaws.com"
Write-Host "🌐 Testing website endpoint..." -ForegroundColor $InfoColor
try {
    $response = Invoke-WebRequest -Uri $websiteUrl -Method Head -TimeoutSec 10 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Website is accessible" -ForegroundColor $SuccessColor
        Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor $InfoColor
        Write-Host "   Content Type: $($response.Headers['Content-Type'])" -ForegroundColor $InfoColor
    } else {
        Write-Host "❌ Website returned status: $($response.StatusCode)" -ForegroundColor $ErrorColor
    }
} catch {
    Write-Host "❌ Website is not accessible" -ForegroundColor $ErrorColor
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor $ErrorColor
}

Write-Host ""
Write-Host "📊 Deployment Summary" -ForegroundColor $InfoColor
Write-Host "=====================" -ForegroundColor $InfoColor
Write-Host "🔗 Website URL: $websiteUrl" -ForegroundColor $SuccessColor
Write-Host "📦 S3 Bucket: $BucketName" -ForegroundColor $InfoColor
Write-Host "🌍 Region: us-east-1" -ForegroundColor $InfoColor
Write-Host ""
Write-Host "💡 Tip: For HTTPS and better performance, consider setting up CloudFront" -ForegroundColor $WarningColor
