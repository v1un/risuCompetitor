# API Integration

This document outlines the integration with external AI services for our Local-First Immersive RPG AI Storytelling Platform.

## Overview

The platform integrates with two primary AI services:
1. **Google's Gemini API** - Using the official SDK
2. **OpenRouter API** - For access to multiple LLM providers

These integrations enable the AI Narrator/GM functionality that powers the immersive RPG experience.

## Gemini API Integration

### Setup and Authentication

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

### Configuration Options

The Gemini API integration supports the following configuration options:

```typescript
interface GeminiConfig {
  model: 'gemini-pro' | 'gemini-pro-vision';
  temperature: number; // 0.0 to 1.0
  topK: number;
  topP: number;
  maxOutputTokens: number;
  stopSequences: string[];
  safetySettings: SafetySetting[];
}

interface SafetySetting {
  category: HarmCategory;
  threshold: HarmBlockThreshold;
}
```

### Basic Text Generation

```typescript
async function generateNarratorResponse(prompt: string, context: string, config: GeminiConfig) {
  try {
    const model = genAI.getGenerativeModel({ model: config.model });
    
    const generationConfig = {
      temperature: config.temperature,
      topK: config.topK,
      topP: config.topP,
      maxOutputTokens: config.maxOutputTokens,
      stopSequences: config.stopSequences,
    };
    
    const safetySettings = config.safetySettings;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: context + prompt }] }],
      generationConfig,
      safetySettings,
    });
    
    return result.response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw error;
  }
}
```

### Streaming Responses

For a more dynamic chat experience, the platform supports streaming responses:

```typescript
async function streamNarratorResponse(prompt: string, context: string, config: GeminiConfig, 
                                     onChunk: (chunk: string) => void) {
  try {
    const model = genAI.getGenerativeModel({ model: config.model });
    
    const generationConfig = {
      temperature: config.temperature,
      topK: config.topK,
      topP: config.topP,
      maxOutputTokens: config.maxOutputTokens,
      stopSequences: config.stopSequences,
    };
    
    const safetySettings = config.safetySettings;
    
    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: context + prompt }] }],
      generationConfig,
      safetySettings,
    });
    
    let responseText = '';
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      responseText += chunkText;
      onChunk(chunkText);
    }
    
    return responseText;
  } catch (error) {
    console.error('Error streaming content with Gemini:', error);
    throw error;
  }
}
```

### Chat History Management

The platform maintains chat history for context:

```typescript
interface ChatMessage {
  role: 'user' | 'model' | 'system';
  parts: Array<{ text: string }>;
}

async function generateWithHistory(history: ChatMessage[], newPrompt: string, config: GeminiConfig) {
  try {
    const model = genAI.getGenerativeModel({ model: config.model });
    
    const generationConfig = {
      temperature: config.temperature,
      topK: config.topK,
      topP: config.topP,
      maxOutputTokens: config.maxOutputTokens,
      stopSequences: config.stopSequences,
    };
    
    // Add the new prompt to the history
    const updatedHistory = [
      ...history,
      { role: 'user', parts: [{ text: newPrompt }] }
    ];
    
    const result = await model.generateContent({
      contents: updatedHistory,
      generationConfig,
      safetySettings: config.safetySettings,
    });
    
    return result.response.text();
  } catch (error) {
    console.error('Error generating content with history:', error);
    throw error;
  }
}
```

## OpenRouter API Integration

### Setup and Authentication

```typescript
import axios from 'axios';

const openRouterClient = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'http://localhost:3000', // Replace with your app's URL in production
    'X-Title': 'RPG Storytelling Platform'
  }
});
```

### Available Models

The platform allows users to select from various models available through OpenRouter:

```typescript
async function getAvailableModels() {
  try {
    const response = await openRouterClient.get('/models');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    throw error;
  }
}
```

### Text Generation

```typescript
interface OpenRouterConfig {
  model: string;
  temperature: number;
  top_p: number;
  top_k: number;
  max_tokens: number;
  stop: string[];
}

async function generateWithOpenRouter(prompt: string, context: string, config: OpenRouterConfig) {
  try {
    const response = await openRouterClient.post('/chat/completions', {
      model: config.model,
      messages: [
        { role: 'system', content: context },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      top_p: config.top_p,
      top_k: config.top_k,
      max_tokens: config.max_tokens,
      stop: config.stop
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content with OpenRouter:', error);
    throw error;
  }
}
```

### Streaming Responses

```typescript
async function streamWithOpenRouter(prompt: string, context: string, config: OpenRouterConfig, 
                                   onChunk: (chunk: string) => void) {
  try {
    const response = await openRouterClient.post('/chat/completions', {
      model: config.model,
      messages: [
        { role: 'system', content: context },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      top_p: config.top_p,
      top_k: config.top_k,
      max_tokens: config.max_tokens,
      stop: config.stop,
      stream: true
    }, {
      responseType: 'stream'
    });
    
    let buffer = '';
    
    response.data.on('data', (chunk: Buffer) => {
      const chunkStr = chunk.toString();
      buffer += chunkStr;
      
      // Process complete SSE messages
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) onChunk(content);
          } catch (e) {
            console.error('Error parsing SSE chunk:', e);
          }
        }
      }
    });
    
    return new Promise<void>((resolve, reject) => {
      response.data.on('end', resolve);
      response.data.on('error', reject);
    });
  } catch (error) {
    console.error('Error streaming content with OpenRouter:', error);
    throw error;
  }
}
```

### Chat History Management

```typescript
interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function generateWithHistoryOpenRouter(history: OpenRouterMessage[], newPrompt: string, 
                                           config: OpenRouterConfig) {
  try {
    // Add the new prompt to the history
    const updatedHistory = [
      ...history,
      { role: 'user', content: newPrompt }
    ];
    
    const response = await openRouterClient.post('/chat/completions', {
      model: config.model,
      messages: updatedHistory,
      temperature: config.temperature,
      top_p: config.top_p,
      top_k: config.top_k,
      max_tokens: config.max_tokens,
      stop: config.stop
    });
    
    const generatedMessage = response.data.choices[0].message;
    
    // Return the generated message and updated history
    return {
      content: generatedMessage.content,
      updatedHistory: [...updatedHistory, generatedMessage]
    };
  } catch (error) {
    console.error('Error generating content with history:', error);
    throw error;
  }
}
```

## Context Management

The platform uses a sophisticated context management system to provide the AI with relevant information:

```typescript
interface ContextItem {
  type: 'character' | 'lorebook' | 'chat_history' | 'tool_state' | 'system_prompt';
  content: string;
  priority: number; // Higher priority items are included first when context window is limited
}

function buildContext(items: ContextItem[], maxTokens: number): string {
  // Sort items by priority (descending)
  const sortedItems = [...items].sort((a, b) => b.priority - a.priority);
  
  let context = '';
  let estimatedTokens = 0;
  
  for (const item of sortedItems) {
    // Rough token estimation (4 characters ≈ 1 token)
    const itemTokens = Math.ceil(item.content.length / 4);
    
    if (estimatedTokens + itemTokens <= maxTokens) {
      context += `[${item.type.toUpperCase()}]\n${item.content}\n\n`;
      estimatedTokens += itemTokens;
    }
  }
  
  return context;
}
```

## Error Handling and Fallbacks

The platform implements robust error handling and fallback mechanisms:

```typescript
async function generateWithFallback(prompt: string, context: string, 
                                  primaryConfig: GeminiConfig, 
                                  fallbackConfig: OpenRouterConfig) {
  try {
    // Try Gemini first
    return await generateNarratorResponse(prompt, context, primaryConfig);
  } catch (error) {
    console.warn('Gemini API error, falling back to OpenRouter:', error);
    
    try {
      // Fall back to OpenRouter
      return await generateWithOpenRouter(prompt, context, fallbackConfig);
    } catch (fallbackError) {
      console.error('Both primary and fallback APIs failed:', fallbackError);
      throw new Error('Unable to generate content. Please try again later.');
    }
  }
}
```

## API Key Management

The platform securely stores API keys using the operating system's secure storage:

```typescript
import { safeStorage } from 'electron';
import fs from 'fs';
import path from 'path';

// Save API key
function saveApiKey(service: 'gemini' | 'openrouter', apiKey: string): void {
  const encryptedKey = safeStorage.encryptString(apiKey);
  const keyPath = path.join(app.getPath('userData'), `${service}_api_key`);
  fs.writeFileSync(keyPath, encryptedKey);
}

// Load API key
function loadApiKey(service: 'gemini' | 'openrouter'): string | null {
  try {
    const keyPath = path.join(app.getPath('userData'), `${service}_api_key`);
    if (fs.existsSync(keyPath)) {
      const encryptedKey = fs.readFileSync(keyPath);
      return safeStorage.decryptString(encryptedKey);
    }
    return null;
  } catch (error) {
    console.error(`Error loading ${service} API key:`, error);
    return null;
  }
}
```

## Rate Limiting and Throttling

The platform implements rate limiting to prevent API abuse:

```typescript
class RateLimiter {
  private requestTimes: number[] = [];
  private maxRequests: number;
  private timeWindow: number; // in milliseconds
  
  constructor(maxRequests: number, timeWindowSeconds: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowSeconds * 1000;
  }
  
  async throttle(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests from the window
    this.requestTimes = this.requestTimes.filter(time => now - time < this.timeWindow);
    
    if (this.requestTimes.length >= this.maxRequests) {
      // Calculate time to wait
      const oldestRequest = this.requestTimes[0];
      const timeToWait = this.timeWindow - (now - oldestRequest);
      
      if (timeToWait > 0) {
        await new Promise(resolve => setTimeout(resolve, timeToWait));
      }
    }
    
    // Add current request
    this.requestTimes.push(Date.now());
  }
}

// Usage
const geminiLimiter = new RateLimiter(60, 60); // 60 requests per minute
const openRouterLimiter = new RateLimiter(20, 60); // 20 requests per minute

async function generateWithRateLimit(prompt: string, context: string, config: GeminiConfig) {
  await geminiLimiter.throttle();
  return generateNarratorResponse(prompt, context, config);
}
```

## Prompt Templates

The platform uses structured prompt templates for different purposes:

```typescript
const promptTemplates = {
  narrator: `You are the Narrator/Game Master for an immersive RPG experience set in the world of {series}. 
Your role is to guide the story, describe the world, portray all non-player characters, and respond to the protagonist's actions.
The protagonist is played by the user and is named {protagonist_name}.

Current setting: {current_location}
Current situation: {current_situation}

Support tools available:
{support_tools}

Remember to reference and update these tools when appropriate using the special command format: 
[[TOOL:tool_id:action:value:reason]]

Respond in a rich, descriptive style appropriate for the {series} setting. Include dialogue, thoughts, and actions of NPCs.
Always end your response with a question, decision point, or prompt for the protagonist's next action.`,

  characterGeneration: `Create a detailed character card for a {role} character in the {series} universe.
The character should be well-suited for an RPG narrative starting at the canonical beginning of the series.
Follow the character card format exactly as specified below:

{character_card_format}

Make sure all fields are filled with rich, detailed content that captures the essence of the {series} universe.
For the series_specific section, include attributes that are uniquely relevant to {series}.`,

  lorebookGeneration: `Create a comprehensive lorebook for the {series} universe.
The lorebook should focus on the canonical beginning of the series, providing all necessary context for an RPG narrative.
Follow the lorebook format exactly as specified below:

{lorebook_format}

Make sure all fields are filled with rich, detailed content that captures the essence of the {series} universe.
For the series_specific section, include elements that are uniquely relevant to {series}.`,

  supportToolGeneration: `Design a set of RPG support tools specifically tailored for a {series} narrative experience.
These tools should enhance the storytelling and gameplay by tracking elements unique to the {series} universe.
Follow the support tool format exactly as specified below:

{support_tool_format}

Here are examples of effective support tools for different series:
{support_tool_examples}

Create 2-3 support tools that would be most useful for tracking important elements in a {series} narrative.
Make sure the tools are interactive, visually appropriate for the setting, and provide meaningful gameplay impact.`
};
```

## Implementation Considerations

1. **Token Optimization**: The platform carefully manages token usage to maximize the context window.
2. **Response Parsing**: Special formats in AI responses are parsed to extract tool updates and other structured data.
3. **Caching**: Frequently used contexts are cached to reduce token usage and improve response times.
4. **Error Recovery**: The platform implements graceful recovery from API errors and network issues.
5. **Offline Detection**: The application detects when it's offline and provides appropriate feedback to the user.