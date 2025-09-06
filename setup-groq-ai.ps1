# 🤖 Setup Groq AI for MoodFlow - FREE Advanced AI
# This script will help you activate the most advanced free AI for your therapy bot

Write-Host "🚀 Setting up FREE Advanced AI for MoodFlow" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "🧠 Groq AI Features:" -ForegroundColor Cyan
Write-Host "  ✅ 100% FREE - No credit card required" -ForegroundColor White
Write-Host "  ✅ Llama 3.1 70B - Most advanced open model" -ForegroundColor White
Write-Host "  ✅ Sub-second responses - Faster than GPT" -ForegroundColor White
Write-Host "  ✅ Unlimited usage on free tier" -ForegroundColor White
Write-Host "  ✅ Perfect for therapy conversations" -ForegroundColor White
Write-Host ""

Write-Host "📋 Step 1: Get your FREE Groq API Key" -ForegroundColor Yellow
Write-Host "1. Open browser and go to: https://console.groq.com" -ForegroundColor White
Write-Host "2. Click 'Sign Up' (completely free)" -ForegroundColor White
Write-Host "3. Sign up with your email" -ForegroundColor White
Write-Host "4. Go to 'API Keys' in the dashboard" -ForegroundColor White
Write-Host "5. Click 'Create API Key'" -ForegroundColor White
Write-Host "6. Copy the key (starts with gsk_)" -ForegroundColor White
Write-Host ""

Write-Host "⚡ Step 2: Activate your AI Bot" -ForegroundColor Yellow
Write-Host "After getting your key, run this command:" -ForegroundColor White
Write-Host ""
Write-Host 'aws lambda update-function-configuration \' -ForegroundColor Green
Write-Host '  --function-name moodflow-ai-chat \' -ForegroundColor Green
Write-Host '  --environment Variables="{GROQ_API_KEY=YOUR_ACTUAL_KEY_HERE}"' -ForegroundColor Green
Write-Host ""
Write-Host "Replace YOUR_ACTUAL_KEY_HERE with your real Groq key" -ForegroundColor Gray
Write-Host ""

Write-Host "🧪 Step 3: Test Your AI Bot" -ForegroundColor Yellow
Write-Host "Visit your app: https://d2h9fk1tku14zk.cloudfront.net" -ForegroundColor Cyan
Write-Host "Click '🤖 AI Chat' and start talking to your therapist!" -ForegroundColor White
Write-Host ""

Write-Host "💬 What your AI can do:" -ForegroundColor Magenta
Write-Host "  🧠 Personalized therapy based on your mood data" -ForegroundColor White
Write-Host "  🚨 Crisis detection with 988 hotline resources" -ForegroundColor White
Write-Host "  💙 CBT, mindfulness, and coping strategies" -ForegroundColor White
Write-Host "  🌟 Natural conversations with empathy" -ForegroundColor White
Write-Host ""

$response = Read-Host "Ready to get your Groq API key? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Start-Process "https://console.groq.com"
    Write-Host ""
    Write-Host "🌐 Browser opened to console.groq.com" -ForegroundColor Green
    Write-Host "Follow the steps above to get your free API key!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After getting your key, come back and run the aws lambda command." -ForegroundColor Yellow
} else {
    Write-Host "No problem! Run this script again when you're ready." -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Your advanced AI therapy bot will be ready in minutes!" -ForegroundColor Green
