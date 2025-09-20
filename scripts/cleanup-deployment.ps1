# MoodTracker Deployment Cleanup Script
# This script helps you clean up AWS resources for your MoodTracker deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName,
    [string]$Profile = "default",
    [switch]$Force
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

Write-Host "🧹 MoodTracker Deployment Cleanup" -ForegroundColor $InfoColor
Write-Host "==================================" -ForegroundColor $InfoColor
Write-Host ""

# Safety warning
if (-not $Force) {
    Write-Host "⚠️ WARNING: This will delete your S3 bucket and all its contents!" -ForegroundColor $WarningColor
    Write-Host "   Bucket to be deleted: $BucketName" -ForegroundColor $WarningColor
    Write-Host ""
    $confirm = Read-Host "Are you sure you want to continue? Type 'DELETE' to confirm"
    
    if ($confirm -ne "DELETE") {
        Write-Host "❌ Cleanup cancelled" -ForegroundColor $ErrorColor
        exit 1
    }
}

# Check AWS credentials
Write-Host "🔍 Checking AWS credentials..." -ForegroundColor $InfoColor
try {
    $identity = aws sts get-caller-identity --profile $Profile 2>$null | ConvertFrom-Json
    Write-Host "✅ AWS Identity: $($identity.Account)" -ForegroundColor $SuccessColor
} catch {
    Write-Host "❌ AWS credentials not configured" -ForegroundColor $ErrorColor
    exit 1
}

# Check if bucket exists
Write-Host "📦 Checking if bucket exists..." -ForegroundColor $InfoColor
try {
    aws s3api head-bucket --bucket $BucketName --profile $Profile 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✅ Bucket $BucketName does not exist (nothing to clean up)" -ForegroundColor $SuccessColor
        exit 0
    }
} catch {
    Write-Host "✅ Bucket $BucketName does not exist (nothing to clean up)" -ForegroundColor $SuccessColor
    exit 0
}

# List bucket contents
Write-Host "📁 Checking bucket contents..." -ForegroundColor $InfoColor
try {
    $objects = aws s3 ls s3://$BucketName --profile $Profile 2>$null
    if ($objects) {
        $fileCount = ($objects | Measure-Object).Count
        Write-Host "   Found $fileCount files to delete" -ForegroundColor $InfoColor
    } else {
        Write-Host "   Bucket is empty" -ForegroundColor $InfoColor
    }
} catch {
    Write-Host "   Could not list bucket contents" -ForegroundColor $WarningColor
}

# Delete all objects in bucket
Write-Host "🗑️ Deleting all objects in bucket..." -ForegroundColor $InfoColor
try {
    aws s3 rm s3://$BucketName --recursive --profile $Profile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All objects deleted" -ForegroundColor $SuccessColor
    } else {
        Write-Host "⚠️ Some objects may not have been deleted" -ForegroundColor $WarningColor
    }
} catch {
    Write-Host "❌ Error deleting objects: $($_.Exception.Message)" -ForegroundColor $ErrorColor
}

# Delete bucket policy (if exists)
Write-Host "🔓 Removing bucket policy..." -ForegroundColor $InfoColor
try {
    aws s3api delete-bucket-policy --bucket $BucketName --profile $Profile 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Bucket policy removed" -ForegroundColor $SuccessColor
    } else {
        Write-Host "   No bucket policy to remove" -ForegroundColor $InfoColor
    }
} catch {
    Write-Host "   Could not remove bucket policy" -ForegroundColor $WarningColor
}

# Remove website configuration
Write-Host "🌐 Removing website configuration..." -ForegroundColor $InfoColor
try {
    aws s3api delete-bucket-website --bucket $BucketName --profile $Profile 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Website configuration removed" -ForegroundColor $SuccessColor
    } else {
        Write-Host "   No website configuration to remove" -ForegroundColor $InfoColor
    }
} catch {
    Write-Host "   Could not remove website configuration" -ForegroundColor $WarningColor
}

# Delete the bucket
Write-Host "📦 Deleting S3 bucket..." -ForegroundColor $InfoColor
try {
    aws s3api delete-bucket --bucket $BucketName --profile $Profile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ S3 bucket deleted successfully" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ Failed to delete S3 bucket" -ForegroundColor $ErrorColor
        Write-Host "   The bucket may not be empty or may have versioning enabled" -ForegroundColor $InfoColor
    }
} catch {
    Write-Host "❌ Error deleting bucket: $($_.Exception.Message)" -ForegroundColor $ErrorColor
}

Write-Host ""
Write-Host "🎉 Cleanup completed!" -ForegroundColor $SuccessColor
Write-Host ""
Write-Host "📝 What was cleaned up:" -ForegroundColor $InfoColor
Write-Host "   - All files in S3 bucket: $BucketName" -ForegroundColor $InfoColor
Write-Host "   - Bucket policy (public read access)" -ForegroundColor $InfoColor
Write-Host "   - Website hosting configuration" -ForegroundColor $InfoColor
Write-Host "   - S3 bucket itself" -ForegroundColor $InfoColor
Write-Host ""
Write-Host "💡 Note: CloudFront distributions (if any) need to be deleted manually" -ForegroundColor $WarningColor
Write-Host "   You can do this in the AWS Console → CloudFront → Distributions" -ForegroundColor $InfoColor
