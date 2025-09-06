const https = require('https');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-User-Email',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

// AI Configuration - API keys from environment variables
const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    url: 'api.openai.com',
    path: '/v1/chat/completions',
    model: 'gpt-4o-mini' // Latest, cheapest, good quality
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    url: 'api.anthropic.com',
    path: '/v1/messages',
    model: 'claude-3-haiku-20240307' // Fast and cheap
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    url: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    model: 'llama-3.1-8b-instant' // Reliable free model
  }
};

/**
 * Determine which AI provider to use (in order of preference)
 */
function getAvailableAI() {
  if (AI_CONFIG.groq.apiKey) return 'groq'; // Free and fast
  if (AI_CONFIG.openai.apiKey) return 'openai'; // Most reliable
  if (AI_CONFIG.anthropic.apiKey) return 'anthropic'; // Best for therapy
  return null;
}

/**
 * Create therapy-focused system prompt with mood context
 */
function createTherapySystemPrompt(moodContext) {
  let prompt = `You are a compassionate AI wellness companion. You're like having a wise, empathetic friend who's trained in mental health support.

Your core approach:
- Be genuinely caring and conversational
- Always validate feelings first ("That sounds really difficult")
- Give practical, actionable advice
- Keep responses natural and engaging (2-4 sentences)
- Ask one thoughtful question to continue the conversation
- Use "I" statements ("I can understand", "I notice")

Techniques to weave in naturally:
- CBT: Help reframe negative thoughts ("What evidence supports/challenges that thought?")
- Mindfulness: Breathing exercises, grounding techniques ("Name 3 things you can see right now")
- Behavioral: Suggest small, doable actions ("What's one tiny step you could take?")
- Validation: Normalize their experience ("Many people feel this way")

Crisis response (if suicide/self-harm mentioned):
- Show immediate concern: "I'm really worried about you right now"
- Provide resources: "Please reach out - call 988 (Suicide & Crisis Lifeline) or text 'HELLO' to 741741"
- Stay supportive: "You matter and there are people who want to help"

Remember: You're a supportive companion, not a replacement for professional therapy.`;

  if (moodContext?.currentMood) {
    const mood = moodContext.currentMood;
    const moodLabel = mood.mood <= 2 ? 'struggling' : mood.mood >= 4 ? 'feeling good' : 'neutral';
    
    prompt += `\n\nUser's current mood context:
- Current mood: ${mood.mood}/5 (${moodLabel})
- Intensity: ${mood.intensity}/10
- Recent tags: ${mood.tags?.join(', ') || 'none'}
- Date: ${mood.date}`;
    
    if (moodContext.recentPattern?.length > 1) {
      const recentMoods = moodContext.recentPattern.slice(0, 3).map(p => `${p.mood}/5`);
      prompt += `\n- Recent mood pattern: ${recentMoods.join(' → ')}`;
    }
    
    // Add specific guidance based on mood
    if (mood.mood <= 2) {
      prompt += `\n\nNote: User is struggling. Be extra supportive and gentle. Consider offering coping strategies.`;
    } else if (mood.intensity >= 8) {
      prompt += `\n\nNote: User is experiencing intense emotions. Validate their feelings and offer grounding techniques.`;
    }
  }

  return prompt;
}

/**
 * Format conversation history for API calls
 */
function formatConversationHistory(conversationHistory) {
  return conversationHistory
    .slice(1) // Skip the initial AI greeting
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
}

/**
 * Make HTTPS request to AI APIs
 */
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(body));
          } else {
            reject(new Error(`API returned status ${res.statusCode}: ${body}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

/**
 * Call OpenAI GPT API
 */
async function callOpenAI(userMessage, systemPrompt, conversationHistory) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...formatConversationHistory(conversationHistory),
    { role: 'user', content: userMessage }
  ];
  
  const requestData = JSON.stringify({
    model: AI_CONFIG.openai.model,
    messages: messages,
    max_tokens: 200,
    temperature: 0.7,
    presence_penalty: 0.1,
    frequency_penalty: 0.1
  });
  
  const options = {
    hostname: AI_CONFIG.openai.url,
    port: 443,
    path: AI_CONFIG.openai.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
      'Content-Length': Buffer.byteLength(requestData)
    }
  };
  
  const data = await makeRequest(options, requestData);
  return data.choices[0].message.content.trim();
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropic(userMessage, systemPrompt, conversationHistory) {
  const messages = [
    ...formatConversationHistory(conversationHistory),
    { role: 'user', content: userMessage }
  ];
  
  const requestData = JSON.stringify({
    model: AI_CONFIG.anthropic.model,
    system: systemPrompt,
    messages: messages,
    max_tokens: 200,
    temperature: 0.7
  });
  
  const options = {
    hostname: AI_CONFIG.anthropic.url,
    port: 443,
    path: AI_CONFIG.anthropic.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_CONFIG.anthropic.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(requestData)
    }
  };
  
  const data = await makeRequest(options, requestData);
  return data.content[0].text.trim();
}

/**
 * Call Groq API (OpenAI-compatible)
 */
async function callGroq(userMessage, systemPrompt, conversationHistory) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...formatConversationHistory(conversationHistory),
    { role: 'user', content: userMessage }
  ];
  
  const requestData = JSON.stringify({
    model: AI_CONFIG.groq.model,
    messages: messages,
    max_tokens: 200,
    temperature: 0.7
  });
  
  const options = {
    hostname: AI_CONFIG.groq.url,
    port: 443,
    path: AI_CONFIG.groq.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.groq.apiKey}`,
      'Content-Length': Buffer.byteLength(requestData)
    }
  };
  
  const data = await makeRequest(options, requestData);
  return data.choices[0].message.content.trim();
}

/**
 * Get AI therapy response using available providers
 */
async function getAITherapyResponse(userMessage, moodContext, conversationHistory) {
  const provider = getAvailableAI();
  
  if (!provider) {
    return "I'm currently offline for maintenance. Your feelings are still valid and important. Consider reaching out to a friend, family member, or mental health professional if you need immediate support.";
  }
  
  console.log(`🤖 Using ${provider.toUpperCase()} for therapy response`);
  
  const systemPrompt = createTherapySystemPrompt(moodContext);
  
  // Enhanced crisis detection
  const crisisKeywords = [
    'suicide', 'kill myself', 'end it all', 'hurt myself', 'not worth living', 
    'better off dead', 'want to die', 'ending my life', 'can\'t go on', 
    'no point in living', 'ready to give up', 'harm myself'
  ];
  
  const hasCrisisContent = crisisKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (hasCrisisContent) {
    return "I'm really concerned about you right now. Your life has value and meaning, even if it doesn't feel that way. Please reach out for immediate help: Call 988 (Suicide & Crisis Lifeline) - they're available 24/7, or text 'HELLO' to 741741 (Crisis Text Line). You don't have to go through this alone. Would you like to talk about what's making you feel this way? I'm here to listen.";
  }
  
  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(userMessage, systemPrompt, conversationHistory);
      case 'anthropic':
        return await callAnthropic(userMessage, systemPrompt, conversationHistory);
      case 'groq':
        return await callGroq(userMessage, systemPrompt, conversationHistory);
      default:
        throw new Error('No AI provider available');
    }
  } catch (error) {
    console.error(`AI API Error (${provider}):`, error);
    return "I'm having trouble responding right now, but I want you to know that your feelings are valid. Sometimes it helps to write down your thoughts or talk to someone you trust. What's the most important thing you'd like support with today?";
  }
}

/**
 * Lambda handler
 */
exports.handler = async (event, context) => {
  console.log('AI Chat request:', JSON.stringify(event, null, 2));
  
  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: ''
      };
    }
    
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        })
      };
    }
    
    const { userMessage, moodContext, conversationHistory } = requestBody;
    
    // Validate required fields
    if (!userMessage || typeof userMessage !== 'string') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Missing userMessage',
          message: 'userMessage is required and must be a string'
        })
      };
    }
    
    // Get AI response
    const aiResponse = await getAITherapyResponse(
      userMessage,
      moodContext || null,
      conversationHistory || []
    );
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        response: aiResponse,
        provider: getAvailableAI(),
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Lambda execution error:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'An error occurred while processing your request',
        details: error.message
      })
    };
  }
};
