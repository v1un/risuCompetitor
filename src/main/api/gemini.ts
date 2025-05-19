import { ipcMain } from 'electron';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GenerationConfig, SafetySetting } from '@google/generative-ai';
import { getApiKey } from '../services/api-key-manager';
import { apiErrorHandler } from './ApiErrorHandler';

// Types
export interface GeminiConfig {
  model: 'gemini-pro' | 'gemini-pro-vision';
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
  stopSequences: string[];
  safetySettings: SafetySetting[];
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  parts: Array<{ text: string }>;
}

// Setup IPC handlers for Gemini API
export function setupGeminiService(): void {
  // Generate text
  ipcMain.handle('gemini:generate', async (_, prompt: string, context: string, config: GeminiConfig) => {
    try {
      const response = await apiErrorHandler.handleWithRetry(() => 
        generateNarratorResponse(prompt, context, config)
      );
      return { success: true, response };
    } catch (error: unknown) {
      console.error('Error generating content with Gemini:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        details: error
      };
    }
  });
  
  // Generate with history
  ipcMain.handle('gemini:generate-with-history', async (_, history: ChatMessage[], newPrompt: string, config: GeminiConfig) => {
    try {
      const response = await apiErrorHandler.handleWithRetry(() => 
        generateWithHistory(history, newPrompt, config)
      );
      return { success: true, response };
    } catch (error: unknown) {
      console.error('Error generating content with history:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        details: error
      };
    }
  });
}

// Initialize Gemini API
async function initializeGeminiAPI(): Promise<GoogleGenerativeAI> {
  const apiKey = await getApiKey('gemini');
  
  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }
  
  return new GoogleGenerativeAI(apiKey);
}

// Generate text with Gemini
export async function generateNarratorResponse(prompt: string, context: string, config: GeminiConfig): Promise<string> {
  const genAI = await initializeGeminiAPI();
  
  const model = genAI.getGenerativeModel({ model: config.model });
  
  const generationConfig: GenerationConfig = {
    temperature: config.temperature,
    topK: config.topK,
    topP: config.topP,
    maxOutputTokens: config.maxOutputTokens,
    stopSequences: config.stopSequences,
  };
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: context + prompt }] }],
    generationConfig,
    safetySettings: config.safetySettings,
  });
  
  return result.response.text();
}

// Generate with history
export async function generateWithHistory(history: ChatMessage[], newPrompt: string, config: GeminiConfig): Promise<string> {
  const genAI = await initializeGeminiAPI();
  
  const model = genAI.getGenerativeModel({ model: config.model });
  
  const generationConfig: GenerationConfig = {
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
}