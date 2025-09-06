$distributionId = "E32S7P9W78LVGE"
$etag = "EBLXW4W42I2YN"

Write-Host "Monitoring CloudFront distribution $distributionId..."
Write-Host "Started at: $(Get-Date)"
Write-Host ""

do {
    $status = aws cloudfront get-distribution --id $distributionId --query "Distribution.Status" --output text
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    Write-Host "[$timestamp] Status: $status"
    
    if ($status -eq "Deployed") {
        Write-Host ""
        Write-Host "✅ Distribution is now Deployed! Proceeding with deletion..."
        
        # Delete the distribution
        Write-Host "Deleting distribution $distributionId with ETag $etag..."
        
        $deleteResult = aws cloudfront delete-distribution --id $distributionId --if-match $etag 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Distribution deleted successfully!"
        } else {
            Write-Host "❌ Failed to delete distribution:"
            Write-Host $deleteResult
        }
        
        break
    }
    
    if ($status -ne "InProgress") {
        Write-Host "⚠️  Unexpected status: $status"
        break
    }
    
    Write-Host "   Waiting 60 seconds before next check..."
    Start-Sleep -Seconds 60
    
} while ($true)

Write-Host ""
Write-Host "Monitoring completed at: $(Get-Date)"
