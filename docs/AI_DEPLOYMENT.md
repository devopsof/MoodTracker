# 🤖 AI Sentiment Analysis - AWS Deployment Guide

This guide will help you deploy the AI sentiment analysis feature using AWS services.

## 🎯 AWS Services We'll Use

1. **AWS Comprehend** - Sentiment analysis AI service
2. **AWS Lambda** - Serverless function for sentiment analysis
3. **API Gateway** - REST endpoint for the frontend
4. **IAM** - Permissions and roles
5. **CloudWatch** - Monitoring and logs

## 📋 Prerequisites

- AWS CLI configured
- AWS account with appropriate permissions
- Node.js and npm installed

## 🚀 Step-by-Step Deployment

### Step 1: Create IAM Role for Lambda

1. **Go to AWS IAM Console** → Roles → Create Role

2. **Select AWS Service** → Lambda

3. **Add Permissions**:
   - `AWSLambdaBasicExecutionRole`
   - `ComprehendReadOnly` (or create custom policy below)

4. **Custom Comprehend Policy** (if needed):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "comprehend:DetectSentiment",
                "comprehend:BatchDetectSentiment"
            ],
            "Resource": "*"
        }
    ]
}
```

5. **Role Name**: `MoodFlow-Sentiment-Lambda-Role`

### Step 2: Deploy Lambda Function

1. **Navigate to lambda/sentiment directory**:
```bash
cd lambda/sentiment
npm install
```

2. **Create deployment package**:
```bash
# Zip the function
zip -r sentiment-analysis.zip index.js node_modules/ package.json
```

3. **Create Lambda Function in AWS Console**:
   - **Function name**: `MoodFlow-Sentiment-Analysis`
   - **Runtime**: Node.js 18.x
   - **Architecture**: x86_64
   - **Execution role**: Use existing role `MoodFlow-Sentiment-Lambda-Role`
   - **Upload**: sentiment-analysis.zip

4. **Configure Lambda Settings**:
   - **Timeout**: 30 seconds
   - **Memory**: 256 MB
   - **Environment variables**: 
     - `AWS_REGION`: us-east-1 (or your region)

### Step 3: Create API Gateway Endpoint

1. **Go to API Gateway Console**

2. **Find your existing API** (MoodFlow API)

3. **Create New Resource**:
   - **Resource Name**: sentiment
   - **Resource Path**: /sentiment

4. **Create POST Method**:
   - **Integration Type**: Lambda Function
   - **Lambda Function**: `MoodFlow-Sentiment-Analysis`
   - **Use Lambda Proxy Integration**: ✅ Yes

5. **Enable CORS**:
   - **Actions** → Enable CORS
   - **Access-Control-Allow-Origin**: *
   - **Access-Control-Allow-Headers**: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
   - **Access-Control-Allow-Methods**: GET,POST,OPTIONS

6. **Deploy API**:
   - **Actions** → Deploy API
   - **Deployment Stage**: dev (or your existing stage)

### Step 4: Test the Endpoint

1. **Get API URL** from API Gateway console
2. **Test with curl**:
```bash
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I had an amazing day today! Everything went perfectly.",
    "userEmail": "test@example.com"
  }'
```

3. **Expected Response**:
```json
{
  "success": true,
  "analysis": {
    "sentiment": "POSITIVE",
    "sentimentScores": {
      "Positive": 0.95,
      "Negative": 0.01,
      "Neutral": 0.03,
      "Mixed": 0.01
    },
    "suggestedMood": 5,
    "confidence": 95,
    "emotions": [...],
    "analyzedBy": "AWS-Comprehend"
  }
}
```

## 🔧 Frontend Configuration

Update your frontend API base URL if needed:

```javascript
// In src/utils/api.js
const API_BASE_URL = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev'
```

## 🎨 Get Hugging Face Token (Optional)

1. **Visit**: https://huggingface.co/
2. **Sign up** for free account
3. **Go to Settings** → Access Tokens
4. **Create Token** → Copy token
5. **Update Lambda code**:
```javascript
'Authorization': 'Bearer YOUR_ACTUAL_TOKEN_HERE'
```

## 📊 Monitoring & Debugging

### CloudWatch Logs
- **Log Group**: `/aws/lambda/MoodFlow-Sentiment-Analysis`
- **Check logs** for errors and debugging info

### Testing Commands
```bash
# Test sentiment analysis
npm run test:sentiment

# Check Lambda logs
aws logs tail /aws/lambda/MoodFlow-Sentiment-Analysis --follow
```

## 💰 Cost Estimation

### AWS Comprehend
- **Sentiment Analysis**: $0.0001 per unit (100 characters)
- **Example**: 500-word entry ≈ $0.0025 per analysis
- **Monthly (30 entries)**: ~$0.075 per user

### AWS Lambda
- **Free Tier**: 1M requests + 400,000 GB-seconds/month
- **Beyond Free Tier**: ~$0.0000002 per request

### API Gateway
- **Free Tier**: 1M API calls/month
- **Beyond Free Tier**: $3.50 per million API calls

## 🚨 Troubleshooting

### Common Issues

1. **"Access Denied" Error**:
   - Check IAM role has Comprehend permissions
   - Verify Lambda execution role

2. **"CORS Error"**:
   - Enable CORS on API Gateway
   - Redeploy API after enabling CORS

3. **"Function Timeout"**:
   - Increase Lambda timeout (currently 30s)
   - Check network connectivity

4. **"Invalid Region"**:
   - Ensure Comprehend is available in your region
   - Update AWS_REGION environment variable

### Debug Commands
```bash
# Test Lambda locally
node -e "
const handler = require('./index').handler;
handler({
  httpMethod: 'POST',
  body: JSON.stringify({
    text: 'I feel great today!',
    userEmail: 'test@example.com'
  })
}, {}, console.log);
"
```

## 🎯 Next Steps

1. **Deploy the Lambda function**
2. **Set up API Gateway endpoint**
3. **Test the complete workflow**
4. **Monitor costs and usage**
5. **Consider adding premium OpenAI integration later**

## 📞 Support

If you encounter issues:
1. Check CloudWatch logs first
2. Verify IAM permissions
3. Test API endpoint with Postman/curl
4. Review AWS Comprehend documentation

---

**Happy AI-powered mood tracking! 🤖✨**
