import { ipcMain } from 'electron';
import axios from 'axios';
import { getApiKey } from '../services/api-key-manager';
import { apiErrorHandler, createErrorResponse } from './ApiErrorHandler';
import { API_ENDPOINTS } from '../../shared/config';

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
      const models = await apiErrorHandler.handleWithRetry(() => 
        getAvailableModels()
      );
      return { success: true, models };
    } catch (error: unknown) {
      console.error('Error fetching OpenRouter models:', error);
      // Use the centralized error handler to create a standardized error response
      return createErrorResponse(error, 'openrouter:get-models');
    }
  });
  
  // Generate text
  ipcMain.handle('openrouter:generate', async (_, prompt: string, context: string, config: OpenRouterConfig) => {
    try {
      const response = await apiErrorHandler.handleWithRetry(() => 
        generateWithOpenRouter(prompt, context, config)
      );
      return { success: true, response };
    } catch (error: unknown) {
      console.error('Error generating content with OpenRouter:', error);
      // Use the centralized error handler to create a standardized error response
      return createErrorResponse(error, 'openrouter:generate', { prompt, context });
    }
  });
  
  // Generate with history
  ipcMain.handle('openrouter:generate-with-history', async (_, history: OpenRouterMessage[], newPrompt: string, config: OpenRouterConfig) => {
    try {
      const result = await apiErrorHandler.handleWithRetry(() => 
        generateWithHistoryOpenRouter(history, newPrompt, config)
      );
      return { success: true, ...result };
    } catch (error: unknown) {
      console.error('Error generating content with history:', error);
      // Use the centralized error handler to create a standardized error response
      return createErrorResponse(error, 'openrouter:generate-with-history', { history, newPrompt });
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
    baseURL: API_ENDPOINTS.OPENROUTER.BASE_URL,
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
  const response = await client.get(API_ENDPOINTS.OPENROUTER.MODELS);
  return response.data.data;
}

// Generate text with OpenRouter
export async function generateWithOpenRouter(prompt: string, context: string, config: OpenRouterConfig): Promise<string> {
  const client = await initializeOpenRouterClient();
  
  const response = await client.post(API_ENDPOINTS.OPENROUTER.CHAT_COMPLETIONS, {
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
  
  const response = await client.post(API_ENDPOINTS.OPENROUTER.CHAT_COMPLETIONS, {
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