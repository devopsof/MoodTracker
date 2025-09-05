const AWS = require('aws-sdk');

// Initialize AWS Comprehend
const comprehend = new AWS.Comprehend({
    region: process.env.AWS_REGION || 'us-east-1'
});

exports.handler = async (event) => {
    console.log('Sentiment Analysis Request:', JSON.stringify(event, null, 2));
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight CORS requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ message: 'CORS preflight' })
        };
    }
    
    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { text, userEmail } = body;
        
        // Validate input
        if (!text || text.trim().length === 0) {
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({ 
                    error: 'Text is required for sentiment analysis' 
                })
            };
        }
        
        // Limit text length (Comprehend has limits)
        const maxLength = 5000;
        const analysisText = text.length > maxLength ? text.substring(0, maxLength) : text;
        
        console.log(`Analyzing text for user: ${userEmail}`);
        console.log(`Text length: ${analysisText.length} characters`);
        
        // **AWS COMPREHEND SENTIMENT ANALYSIS**
        const comprehendParams = {
            Text: analysisText,
            LanguageCode: 'en'
        };
        
        const [sentimentResult, emotionResult] = await Promise.all([
            // Basic sentiment analysis
            comprehend.detectSentiment(comprehendParams).promise(),
            // Emotion detection (if available in your region)
            detectEmotionsWithFallback(analysisText)
        ]);
        
        console.log('AWS Comprehend Result:', sentimentResult);
        
        // Convert AWS Comprehend result to mood scale (1-5)
        const moodSuggestion = convertSentimentToMood(sentimentResult);
        
        // Prepare response
        const analysisResponse = {
            // AWS Comprehend results
            sentiment: sentimentResult.Sentiment,
            sentimentScores: sentimentResult.SentimentScore,
            
            // Mood suggestion (1-5 scale)
            suggestedMood: moodSuggestion.mood,
            confidence: moodSuggestion.confidence,
            
            // Additional emotion data
            emotions: emotionResult.emotions || [],
            
            // Analysis metadata
            textAnalyzed: analysisText.substring(0, 100) + '...',
            timestamp: new Date().toISOString(),
            analyzedBy: 'AWS-Comprehend'
        };
        
        console.log('Final Analysis Response:', analysisResponse);
        
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                success: true,
                analysis: analysisResponse
            })
        };
        
    } catch (error) {
        console.error('Sentiment Analysis Error:', error);
        
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({
                success: false,
                error: 'Failed to analyze sentiment',
                details: error.message
            })
        };
    }
};

// Convert AWS Comprehend sentiment to 1-5 mood scale
function convertSentimentToMood(sentimentResult) {
    const { Sentiment, SentimentScore } = sentimentResult;
    
    let mood, confidence;
    
    switch (Sentiment) {
        case 'POSITIVE':
            // Map positive sentiment to mood 4-5
            const positiveScore = SentimentScore.Positive;
            if (positiveScore > 0.8) {
                mood = 5; // Very happy
            } else if (positiveScore > 0.6) {
                mood = 4; // Happy
            } else {
                mood = 4; // Default happy
            }
            confidence = Math.round(positiveScore * 100);
            break;
            
        case 'NEGATIVE':
            // Map negative sentiment to mood 1-2
            const negativeScore = SentimentScore.Negative;
            if (negativeScore > 0.8) {
                mood = 1; // Very sad
            } else if (negativeScore > 0.6) {
                mood = 2; // Sad
            } else {
                mood = 2; // Default sad
            }
            confidence = Math.round(negativeScore * 100);
            break;
            
        case 'NEUTRAL':
            mood = 3; // Neutral
            confidence = Math.round(SentimentScore.Neutral * 100);
            break;
            
        case 'MIXED':
            // For mixed emotions, lean towards neutral or analyze dominant emotion
            const scores = SentimentScore;
            if (scores.Positive > scores.Negative) {
                mood = 4;
                confidence = Math.round(scores.Positive * 100);
            } else if (scores.Negative > scores.Positive) {
                mood = 2;
                confidence = Math.round(scores.Negative * 100);
            } else {
                mood = 3;
                confidence = 60; // Lower confidence for mixed emotions
            }
            break;
            
        default:
            mood = 3;
            confidence = 50;
    }
    
    return { mood, confidence };
}

// Fallback emotion detection using Hugging Face API
async function detectEmotionsWithFallback(text) {
    try {
        // Try Hugging Face API for detailed emotion analysis
        const response = await fetch('https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer hf_demo', // You'll need to get a free token
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: text.substring(0, 500) // Limit for API
            })
        });
        
        if (response.ok) {
            const emotions = await response.json();
            console.log('Hugging Face Emotions:', emotions);
            
            return {
                emotions: emotions[0] || [],
                source: 'HuggingFace'
            };
        }
        
        throw new Error('Hugging Face API not available');
        
    } catch (error) {
        console.log('Falling back to basic emotion detection:', error.message);
        
        // Fallback to simple keyword-based emotion detection
        return detectEmotionsKeywordBased(text);
    }
}

// Simple keyword-based emotion detection as fallback
function detectEmotionsKeywordBased(text) {
    const lowerText = text.toLowerCase();
    
    const emotionKeywords = {
        joy: ['happy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'joy', 'delighted'],
        sadness: ['sad', 'depressed', 'down', 'terrible', 'awful', 'horrible', 'upset', 'disappointed'],
        anger: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'rage'],
        fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'panic', 'terrified'],
        surprise: ['surprised', 'shocked', 'amazed', 'stunned', 'unexpected', 'wow'],
        love: ['love', 'adore', 'cherish', 'grateful', 'thankful', 'appreciate']
    };
    
    const detectedEmotions = [];
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        const matches = keywords.filter(keyword => lowerText.includes(keyword));
        if (matches.length > 0) {
            detectedEmotions.push({
                label: emotion.toUpperCase(),
                score: Math.min(matches.length * 0.3, 0.9) // Simple scoring
            });
        }
    }
    
    // Sort by score and return top emotions
    detectedEmotions.sort((a, b) => b.score - a.score);
    
    return {
        emotions: detectedEmotions.slice(0, 3), // Top 3 emotions
        source: 'Keyword-Based'
    };
}
