$body = @{
    fileName = "test.jpg"
    fileType = "image/jpeg"
    fileSize = 50000
    userEmail = "test@example.com"
} | ConvertTo-Json

Write-Host "Testing Lambda function with body:"
Write-Host $body
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://e7a99njzra.execute-api.us-east-1.amazonaws.com/dev/photos/upload" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Lambda response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Lambda error:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody"
    }
}
