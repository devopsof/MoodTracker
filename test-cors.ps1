try {
    Write-Host "Testing OPTIONS request to photo upload endpoint..."
    $response = Invoke-WebRequest -Uri "https://e7a99njzra.execute-api.us-east-1.amazonaws.com/dev/photos/upload" -Method OPTIONS -UseBasicParsing
    Write-Host "✅ Status Code: $($response.StatusCode)"
    Write-Host "✅ Headers:"
    $response.Headers | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" }
} catch {
    Write-Host "❌ CORS Preflight Failed:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    Write-Host "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
