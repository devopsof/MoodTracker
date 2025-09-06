# Photo Upload Debugging Guide

## Updated Code Deployed ✅
I've added extensive debugging and error handling to the photo upload process. The updated code is now live on CloudFront.

## How to Debug Photo Upload Issues

### 1. Open Browser Developer Tools
- Press `F12` or right-click → "Inspect" 
- Go to the **Console** tab

### 2. Upload a Photo in MoodTracker
- Create a new mood entry
- Add a photo using drag & drop or file selection
- Submit the entry

### 3. Check Console Logs
Look for these specific log messages in order:

**Photo Selection:**
```
📷 Processing photos for entry: 1 photos
📅 Photo data structure: [{id: ..., fileName: ..., hasFile: true, ...}]
```

**S3 Upload Start:**
```
🚀 Starting S3 upload process...
⚙️ Processing and uploading photos: 1
📋 Photo data structure: [...] 
📁 Processing file: filename.jpg (123.4KB)
```

**S3 API Calls:**
```
📤 Starting batch S3 photo upload: 1 files
🚀 Starting upload 1/1: filename.jpg
📤 Starting S3 photo upload: filename.jpg
✅ Got presigned URL: photo_123456789
📸 Photo uploaded to S3: photo_123456789
✅ Upload 1 successful: filename.jpg
```

**Final Results:**
```
🏢 Uploaded photos to S3: 1
🖼️ S3 photo URLs: ["https://moodtracker-photos-bucket.s3.us-east-1.amazonaws.com/..."]
```

### 4. What to Look For

**If photos aren't uploading to S3:**
- Look for `❌` error messages in console
- Check if `hasFile: false` in photo data structure
- Look for network errors or API failures

**If photos show locally but not from S3:**
- Check if localStorage fallback is being used: `💾 Fallback: stored photos locally`
- Look for S3 upload errors before fallback

**Common Issues:**
- **File object missing**: `❌ Photo data missing file object`
- **API errors**: `Failed to get upload URL:` or `S3 upload failed:`
- **Network issues**: `Failed to fetch` or timeout errors

### 5. Check S3 Bucket
After upload, verify if photo actually made it to S3:
```bash
aws s3 ls s3://moodtracker-photos-bucket/users/ --recursive
```

## Next Steps
1. Try uploading a photo with dev tools open
2. Copy ALL console messages and send them to me
3. Check if photo appears in S3 bucket using AWS CLI
4. This will help identify exactly where the process is failing

The debugging should show us exactly where the S3 upload is failing and why photos are falling back to localStorage instead.
