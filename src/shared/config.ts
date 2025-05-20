/**
 * Application configuration
 */

// API endpoints
export const API_ENDPOINTS = {
  OPENROUTER: {
    BASE_URL: 'https://openrouter.ai/api/v1',
    MODELS: '/models',
    CHAT_COMPLETIONS: '/chat/completions'
  },
  GEMINI: {
    // Gemini API is accessed through the Google Generative AI SDK
    // No direct endpoints needed
  },
  IMAGE_GENERATION: {
    STABLE_DIFFUSION: 'https://api.stability.ai/v1/generation',
    DALLE: 'https://api.openai.com/v1/images/generations',
    MIDJOURNEY: 'https://api.midjourney.com/v1/generation' // Example URL, not actual
  }
};

// Default generation settings
export const DEFAULT_GENERATION_SETTINGS = {
  GEMINI: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
    stopSequences: []
  },
  OPENROUTER: {
    temperature: 0.7,
    top_p: 0.95,
    top_k: 40,
    max_tokens: 1024,
    stop: []
  }
};

// Application settings
export const APP_SETTINGS = {
  DEFAULT_THEME: 'dark',
  MAX_CHAT_HISTORY: 100,
  AUTO_SAVE_INTERVAL: 60000, // 1 minute
  DEFAULT_MODEL: 'gemini-pro'
};

// Export default config
export default {
  API_ENDPOINTS,
  DEFAULT_GENERATION_SETTINGS,
  APP_SETTINGS
};