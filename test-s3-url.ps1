$photoUrl = "https://moodtracker-photos-bucket.s3.us-east-1.amazonaws.com/users/Parthpurbia_gmail_com/photos/photo_1757106369869_e98f6bb7-1baf-4922-9f0a-35222a8199fa/30b3f3791789e561e1d81fef0c45b3e3.jpg"

Write-Host "Testing S3 photo URL accessibility..."
Write-Host "URL: $photoUrl"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $photoUrl -Method Head -UseBasicParsing
    Write-Host "✅ SUCCESS!"
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Content Type: $($response.Headers.'Content-Type')"
    Write-Host "Content Length: $($response.Headers.'Content-Length')"
} catch {
    Write-Host "❌ FAILED!"
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
