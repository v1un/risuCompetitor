import { ipcMain } from 'electron';
import axios from 'axios';
import { getApiKey } from '../services/api-key-manager';

// Types
export interface OpenRouterConfig {
  model: string;
  temperature: number;
  top_p: number;
  top_k: number;
  max_tokens: number;
  stop: string[];
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Setup IPC handlers for OpenRouter API
export function setupOpenRouterService(): void {
  // Get available models
  ipcMain.handle('openrouter:get-models', async () => {
    try {
      const models = await getAvailableModels();
      return { success: true, models };
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Generate text
  ipcMain.handle('openrouter:generate', async (_, prompt: string, context: string, config: OpenRouterConfig) => {
    try {
      const response = await generateWithOpenRouter(prompt, context, config);
      return { success: true, response };
    } catch (error) {
      console.error('Error generating content with OpenRouter:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Generate with history
  ipcMain.handle('openrouter:generate-with-history', async (_, history: OpenRouterMessage[], newPrompt: string, config: OpenRouterConfig) => {
    try {
      const result = await generateWithHistoryOpenRouter(history, newPrompt, config);
      return { success: true, ...result };
    } catch (error) {
      console.error('Error generating content with history:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
}

// Initialize OpenRouter API client
async function initializeOpenRouterClient() {
  const apiKey = await getApiKey('openrouter');
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not found');
  }
  
  return axios.create({
    baseURL: 'https://openrouter.ai/api/v1',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:3000', // Replace with your app's URL in production
      'X-Title': 'Immersive RPG Storytelling Platform'
    }
  });
}

// Get available models
export async function getAvailableModels() {
  const client = await initializeOpenRouterClient();
  const response = await client.get('/models');
  return response.data.data;
}

// Generate text with OpenRouter
export async function generateWithOpenRouter(prompt: string, context: string, config: OpenRouterConfig): Promise<string> {
  const client = await initializeOpenRouterClient();
  
  const response = await client.post('/chat/completions', {
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
}

// Generate with history
export async function generateWithHistoryOpenRouter(history: OpenRouterMessage[], newPrompt: string, config: OpenRouterConfig) {
  const client = await initializeOpenRouterClient();
  
  // Add the new prompt to the history
  const updatedHistory = [
    ...history,
    { role: 'user', content: newPrompt }
  ];
  
  const response = await client.post('/chat/completions', {
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
}