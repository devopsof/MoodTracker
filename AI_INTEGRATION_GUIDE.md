# 🤖 AI Integration Setup Guide

## Overview

This guide will help you integrate **real AI APIs** (OpenAI GPT, Anthropic Claude, or Groq) into your MoodFlow therapy chat bot. The integration is secure - API keys are stored server-side in AWS Lambda, not exposed in the frontend.

## 🔐 Security Architecture

```
Frontend (React) → API Gateway → Lambda Function → AI APIs
```

- ✅ **API keys stored securely** in AWS Lambda environment variables
- ✅ **No secrets in frontend** code or browser
- ✅ **Multiple AI providers** for redundancy
- ✅ **Crisis detection** and safety features built-in

---

## 🚀 Quick Start

### Step 1: Get AI API Keys (Choose One or More)

#### Option A: OpenAI GPT (Recommended)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up and add $5-10 to your account
3. Create an API key in the [API Keys section](https://platform.openai.com/api-keys)
4. Copy your API key (starts with `sk-`)

**Cost:** ~$0.002 per conversation (very cheap)

#### Option B: Anthropic Claude (Best for therapy)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up for free account (includes $5 free credit)
3. Create an API key in the dashboard
4. Copy your API key

**Cost:** Free $5 credit, then ~$0.001 per conversation

#### Option C: Groq (Fastest, Free Tier)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Create an API key
4. Copy your API key

**Cost:** Free tier available, very fast responses

### Step 2: Deploy the AI Lambda Function

1. **Navigate to the Lambda directory:**
```bash
cd MoodTracker/lambda/aiChat
```

2. **Run the deployment script:**
```powershell
.\deploy.ps1
```

The script will:
- Create a deployment package
- Deploy the Lambda function
- Set up IAM roles
- Provide next steps

### Step 3: Add API Keys to Lambda

After deployment, add your API key(s) as environment variables:

```bash
# Add OpenAI API key (if using OpenAI)
aws lambda update-function-configuration \
  --function-name moodflow-ai-chat \
  --environment Variables='{OPENAI_API_KEY=sk-your-openai-key-here}'

# Add Anthropic API key (if using Claude)
aws lambda update-function-configuration \
  --function-name moodflow-ai-chat \
  --environment Variables='{ANTHROPIC_API_KEY=sk-ant-your-key-here}'

# Add Groq API key (if using Groq)
aws lambda update-function-configuration \
  --function-name moodflow-ai-chat \
  --environment Variables='{GROQ_API_KEY=gsk_your-groq-key-here}'
```

### Step 4: Set up API Gateway Endpoint

1. **Go to AWS API Gateway Console**
2. **Find your existing API** (likely named after your project)
3. **Create new resource:** `/ai-chat`
4. **Add POST method** to the resource
5. **Set integration type:** Lambda Function
6. **Select your function:** `moodflow-ai-chat`
7. **Enable CORS** for the method
8. **Deploy the API**

### Step 5: Test Your AI Integration

1. **Build and deploy your frontend:**
```bash
npm run build
cd deployment
.\deploy-to-s3-clean.ps1 -BucketName your-bucket-name
```

2. **Open your app and try the AI chat**

---

## 🔧 Advanced Configuration

### Multiple API Providers

The system automatically chooses the best available provider:

1. **Groq** (if available) - Free and fastest
2. **OpenAI** (if available) - Most reliable
3. **Anthropic** (if available) - Best for therapy

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-abc123...` |
| `ANTHROPIC_API_KEY` | Anthropic Claude key | `sk-ant-api03-abc123...` |
| `GROQ_API_KEY` | Groq API key | `gsk_abc123...` |

### Therapeutic Features Built-In

The AI integration includes:

- **Mood-aware responses** using user's recent entries
- **Crisis detection** with immediate resources (988 hotline)
- **Evidence-based techniques** (CBT, mindfulness)
- **Professional boundaries** and disclaimers
- **Empathetic conversation** flow

---

## 🧪 Testing

### Test the Lambda Function Directly

```bash
aws lambda invoke \
  --function-name moodflow-ai-chat \
  --payload '{"userMessage":"I feel anxious","moodContext":{"currentMood":{"mood":2,"intensity":7}}}' \
  response.json

cat response.json
```

### Test API Gateway Endpoint

```bash
curl -X POST https://your-api-gateway-url/dev/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"Hello, I need someone to talk to"}'
```

---

## 🛠️ Troubleshooting

### Common Issues

**❌ "AI service not configured"**
- Check API Gateway endpoint is set up correctly
- Verify VITE_API_BASE_URL in your environment

**❌ "No AI provider available"**
- Add at least one API key to Lambda environment variables
- Verify the API key format is correct

**❌ "API returned status 401"**
- API key is invalid or expired
- For OpenAI: check billing is set up

**❌ "API returned status 429"**
- Rate limit exceeded
- Wait a moment and try again, or upgrade your API plan

### Debug Lambda Function

View logs:
```bash
aws logs tail /aws/lambda/moodflow-ai-chat --follow
```

### Update Lambda Function

If you make changes:
```bash
cd MoodTracker/lambda/aiChat
.\deploy.ps1
```

---

## 💡 Tips for Best Results

### 1. Start with Groq (Free)
- Perfect for testing
- Fast responses
- Good quality for therapy use

### 2. Add OpenAI for Production
- Most reliable
- Great conversation quality
- Worth the small cost (~$0.002/conversation)

### 3. Use Claude for Advanced Therapy
- Best understanding of mental health
- Excellent at crisis situations
- Most empathetic responses

### 4. Monitor Costs
- Set up billing alerts
- Most conversations cost $0.001-0.003
- A $10 budget = thousands of conversations

---

## 🎉 What You'll Get

After setup, your AI therapist will:

✅ **Respond intelligently** to user messages  
✅ **Reference mood data** for personalized support  
✅ **Detect crisis situations** and provide resources  
✅ **Use therapeutic techniques** like CBT and mindfulness  
✅ **Maintain conversation** flow naturally  
✅ **Keep API keys secure** server-side  
✅ **Provide fallback responses** if AI is unavailable  

---

## 📞 Support

If you need help:

1. **Check the troubleshooting section** above
2. **Review AWS CloudWatch logs** for the Lambda function
3. **Test each component** individually (Lambda, API Gateway, Frontend)
4. **Verify environment variables** are set correctly

Your AI therapy bot will provide professional-grade support while keeping user data and API keys completely secure! 🌈💙
