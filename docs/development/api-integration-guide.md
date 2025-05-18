# API Integration Guide

## Overview

This document details the integration of our Local-First Immersive RPG AI Storytelling Platform with external AI services, specifically Google's Gemini API and OpenRouter. These integrations are crucial for providing the AI-driven Narrator/Game Master (GM) functionality that powers the immersive RPG experience.

## Gemini API Integration

### Overview

Google's Gemini API provides access to Google's large language models, which we use as the primary AI engine for our Narrator/GM system. The integration is done through the official Gemini SDK.

### Setup and Configuration

#### Installation

```bash
npm install @google/generative-ai
```

#### Basic Configuration

```typescript
// src/main/api/gemini.ts
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

export class GeminiService {
  private api: GoogleGenerativeAI;
  private model: GenerativeModel;
  
  constructor(apiKey: string, modelName: string = 'gemini-pro') {
    this.api = new GoogleGenerativeAI(apiKey);
    this.model = this.api.getGenerativeModel({ model: modelName });
  }
  
  async generateResponse(prompt: string, systemPrompt: string, generationConfig: GenerationConfig) {
    try {
      const result = await this.model.generateContent({
        contents: [
          { role: 'system', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: prompt }] }
        ],
        generationConfig
      });
      
      return result.response.text();
    } catch (error) {
      console.error('Error generating response from Gemini:', error);
      throw error;
    }
  }
  
  async generateStreamingResponse(prompt: string, systemPrompt: string, generationConfig: GenerationConfig, 
                                 onChunk: (chunk: string) => void) {
    try {
      const result = await this.model.generateContentStream({
        contents: [
          { role: 'system', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: prompt }] }
        ],
        generationConfig
      });
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        onChunk(chunkText);
      }
    } catch (error) {
      console.error('Error generating streaming response from Gemini:', error);
      throw error;
    }
  }
}
```

#### Generation Configuration

```typescript
// Example generation configuration
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
  stopSequences: ['USER:', 'PROTAGONIST:']
};
```

### Character Card Generation

```typescript
// src/main/services/character-generation.ts
import { GeminiService } from '../api/gemini';
import { CharacterCard } from '../types/character-card';

export class CharacterGenerationService {
  private geminiService: GeminiService;
  
  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
  }
  
  async generateCharacterCard(series: string, characterType: 'protagonist' | 'npc', 
                             additionalInfo: string = ''): Promise<CharacterCard> {
    const systemPrompt = `You are a character designer for an immersive RPG experience set in the world of ${series}.
Your task is to create a detailed character card in JSON format following the exact structure provided below.
The character should be a ${characterType} that fits naturally within the ${series} universe.
Focus on creating a character that would exist at the beginning of the series' canonical timeline.

${additionalInfo}

The character card must strictly follow this JSON structure:
\`\`\`json
{
  "version": "1.0",
  "type": "character",
  "metadata": {
    "id": "unique-id",
    "created": "current-timestamp",
    "modified": "current-timestamp",
    "series": "${series}"
  },
  "character": {
    "name": "Character Name",
    "role": "${characterType}",
    "description": "Detailed character description",
    "background": "Character backstory and history",
    "personality": {
      "traits": ["trait1", "trait2", "..."],
      "quirks": ["quirk1", "quirk2", "..."],
      "motivations": ["motivation1", "motivation2", "..."]
    },
    "appearance": "Detailed physical description",
    "speech_patterns": "Description of how the character speaks"
  },
  "rpg_attributes": {
    "stats": {
      // Appropriate stats for the series
    },
    "skills": [
      // Appropriate skills for the character and series
    ],
    "abilities": [
      // Special abilities relevant to the series
    ]
  },
  "series_specific": {
    // Attributes specific to the ${series} universe
  },
  "narrator_guidance": {
    "character_voice": "Guidelines for how the Narrator should portray this character",
    "narrative_role": "Character's role in the story",
    "development_arc": "Planned character development"
  }
}
\`\`\`

Ensure all fields are filled with rich, detailed, and appropriate content for the ${series} universe.
The character should feel authentic to the series and have depth and nuance.
`;

    const prompt = `Generate a complete character card for a ${characterType} in the ${series} universe.`;
    
    try {
      const jsonResponse = await this.geminiService.generateResponse(prompt, systemPrompt, {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      });
      
      // Extract JSON from response
      const jsonMatch = jsonResponse.match(/```json\n([\s\S]*?)\n```/) || 
                        jsonResponse.match(/```\n([\s\S]*?)\n```/) ||
                        [null, jsonResponse];
      
      const jsonString = jsonMatch[1];
      const characterCard = JSON.parse(jsonString) as CharacterCard;
      
      // Generate a proper ID if not present
      if (!characterCard.metadata.id || characterCard.metadata.id === "unique-id") {
        characterCard.metadata.id = `cc-${series.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      }
      
      // Ensure timestamps are proper
      const now = new Date().toISOString();
      characterCard.metadata.created = now;
      characterCard.metadata.modified = now;
      
      return characterCard;
    } catch (error) {
      console.error('Error generating character card:', error);
      throw new Error('Failed to generate character card. Please try again.');
    }
  }
}
```

### Support Tool Generation

```typescript
// src/main/services/support-tool-generation.ts
import { GeminiService } from '../api/gemini';
import { SupportTool } from '../types/support-tool';

export class SupportToolGenerationService {
  private geminiService: GeminiService;
  
  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
  }
  
  async generateSupportTool(series: string, toolType: string, additionalInfo: string = ''): Promise<SupportTool> {
    // Provide examples based on the tool type
    let examples = '';
    if (toolType === 'tracker') {
      examples = `
Example of a tracker tool for Re:Zero:
\`\`\`json
{
  "version": "1.0",
  "type": "support-tool",
  "metadata": {
    "id": "rezero-timeline-tracker",
    "series": "Re:Zero",
    "title": "Return by Death Tracker"
  },
  "tool": {
    "name": "Return by Death Tracker",
    "description": "Tracks the protagonist's deaths, resets, and timeline variations",
    "type": "tracker",
    "visibility": "both"
  },
  "components": [
    {
      "id": "death-counter",
      "type": "numeric",
      "name": "Death Counter",
      "description": "Number of times the protagonist has died",
      "default_value": "0",
      "current_value": "0"
    },
    {
      "id": "current-checkpoint",
      "type": "text",
      "name": "Current Checkpoint",
      "description": "The current 'save point' the protagonist returns to upon death",
      "default_value": "Arrival in Lugnica",
      "current_value": "Arrival in Lugnica"
    }
  ]
}
\`\`\`
`;
    } else if (toolType === 'meter') {
      examples = `
Example of a meter tool for a Lovecraftian setting:
\`\`\`json
{
  "version": "1.0",
  "type": "support-tool",
  "metadata": {
    "id": "lovecraft-sanity-meter",
    "series": "Lovecraftian Horror",
    "title": "Sanity Meter"
  },
  "tool": {
    "name": "Sanity Meter",
    "description": "Tracks the protagonist's mental state as they encounter cosmic horrors",
    "type": "meter",
    "visibility": "both"
  },
  "components": [
    {
      "id": "sanity-level",
      "type": "progress",
      "name": "Sanity Level",
      "description": "Current mental stability of the protagonist",
      "default_value": "100",
      "current_value": "100",
      "display": {
        "format": "Sanity: {value}%",
        "min": "0",
        "max": "100"
      }
    },
    {
      "id": "eldritch-knowledge",
      "type": "numeric",
      "name": "Eldritch Knowledge",
      "description": "Amount of forbidden knowledge accumulated",
      "default_value": "0",
      "current_value": "0"
    }
  ]
}
\`\`\`
`;
    }

    const systemPrompt = `You are a game designer creating support tools for an immersive RPG experience set in the world of ${series}.
Your task is to create a ${toolType} tool in JSON format that enhances the RPG experience by providing visual and interactive elements for tracking game state, character progression, or narrative events.

The tool should be specifically tailored to the ${series} universe and should be useful for both the AI Narrator/GM and the player.

${examples}

${additionalInfo}

The support tool must strictly follow this JSON structure:
\`\`\`json
{
  "version": "1.0",
  "type": "support-tool",
  "metadata": {
    "id": "unique-id",
    "created": "current-timestamp",
    "modified": "current-timestamp",
    "series": "${series}",
    "title": "Tool Title"
  },
  "tool": {
    "name": "Tool Name",
    "description": "Tool description and purpose",
    "type": "${toolType}",
    "visibility": "player|narrator|both",
    "update_triggers": ["player-action", "narrator-action", "time-based", "event-based"]
  },
  "components": [
    // At least 3-5 components that make sense for the series and tool type
  ],
  "layouts": {
    "default": {
      "grid": [
        // Layout of components
      ]
    }
  },
  "interactions": {
    "player_permissions": {
      "view": ["component-id-1", "component-id-2"],
      "edit": ["component-id-3"]
    },
    "narrator_commands": [
      // Commands the narrator can use
    ]
  },
  "series_specific": {
    // Elements specific to the ${series} universe
  },
  "narrator_guidance": {
    "tool_purpose": "Overall purpose of this tool",
    "integration_points": "How to integrate this tool into the narrative",
    "update_guidance": "When and how to update this tool"
  }
}
\`\`\`

Ensure all fields are filled with rich, detailed, and appropriate content for the ${series} universe.
The tool should feel authentic to the series and provide meaningful gameplay and narrative enhancements.
Focus on creating components that track important elements from the series that would enhance an RPG experience.
`;

    const prompt = `Generate a complete ${toolType} support tool for the ${series} universe that would enhance an immersive RPG experience.`;
    
    try {
      const jsonResponse = await this.geminiService.generateResponse(prompt, systemPrompt, {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096
      });
      
      // Extract JSON from response
      const jsonMatch = jsonResponse.match(/```json\n([\s\S]*?)\n```/) || 
                        jsonResponse.match(/```\n([\s\S]*?)\n```/) ||
                        [null, jsonResponse];
      
      const jsonString = jsonMatch[1];
      const supportTool = JSON.parse(jsonString) as SupportTool;
      
      // Generate a proper ID if not present
      if (!supportTool.metadata.id || supportTool.metadata.id === "unique-id") {
        supportTool.metadata.id = `st-${series.toLowerCase().replace(/\s+/g, '-')}-${toolType}-${Date.now()}`;
      }
      
      // Ensure timestamps are proper
      const now = new Date().toISOString();
      supportTool.metadata.created = now;
      supportTool.metadata.modified = now;
      
      return supportTool;
    } catch (error) {
      console.error('Error generating support tool:', error);
      throw new Error('Failed to generate support tool. Please try again.');
    }
  }
}
```

### Narrator/GM Chat

```typescript
// src/main/services/narrator-service.ts
import { GeminiService } from '../api/gemini';
import { ChatMessage } from '../types/chat-message';
import { CharacterCard } from '../types/character-card';
import { Lorebook } from '../types/lorebook';
import { SupportTool } from '../types/support-tool';

export class NarratorService {
  private geminiService: GeminiService;
  
  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
  }
  
  async generateNarratorResponse(
    messages: ChatMessage[],
    protagonist: CharacterCard,
    lorebook: Lorebook,
    supportTools: SupportTool[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    // Build context from lorebook
    const lorebookContext = `
# World Information
${lorebook.world.overview}

# Current Setting
${lorebook.narrator_guidance.starting_point}

# Key Characters
${lorebook.narrator_guidance.key_npcs.join(', ')}
`;

    // Build context from protagonist
    const protagonistContext = `
# Protagonist
Name: ${protagonist.character.name}
Description: ${protagonist.character.description}
Personality: ${protagonist.character.personality.traits.join(', ')}
`;

    // Build context from support tools
    const toolsContext = supportTools.map(tool => `
# ${tool.tool.name}
${tool.tool.description}
Current State: ${tool.components.map(c => `${c.name}: ${c.current_value}`).join(', ')}
`).join('\n');

    // Build chat history
    const chatHistory = messages.map(msg => {
      if (msg.type === 'protagonist') {
        return `PROTAGONIST: ${msg.content.text}`;
      } else if (msg.type === 'narrator') {
        return `NARRATOR: ${msg.content.text}`;
      } else if (msg.type === 'npc') {
        return `NPC (${msg.sender.name}): ${msg.content.text}`;
      } else {
        return `SYSTEM: ${msg.content.text}`;
      }
    }).join('\n\n');

    // Build system prompt
    const systemPrompt = `You are the Narrator/Game Master for an immersive RPG experience set in the world of ${lorebook.metadata.series}.
Your role is to guide the narrative, describe the world, portray all non-player characters (NPCs), and respond to the protagonist's actions.
The user is always playing as the protagonist, ${protagonist.character.name}.

The narrative begins at the canonical starting point of the series: ${lorebook.narrator_guidance.starting_point}

## World Information
${lorebookContext}

## Protagonist Information
${protagonistContext}

## Support Tools
${toolsContext}

## Guidelines
1. Maintain a consistent narrative that aligns with the series' lore and themes.
2. Portray NPCs with distinct personalities and speech patterns.
3. Respond to the protagonist's actions with appropriate consequences.
4. Use rich, descriptive language to create an immersive experience.
5. Reference and update support tools when appropriate using special commands.
6. Always stay in character as the Narrator/GM.

## Support Tool Commands
You can update support tools by using special commands in your response:
- To update a numeric component: \`<tool:update id="component-id" value="new-value" reason="reason for change">\`
- To add to a list component: \`<tool:add id="component-id" value="new-value" reason="reason for change">\`

## Format
Your responses should be well-formatted and may include:
- Descriptive narration
- NPC dialogue (format as: **Character Name:** "Dialogue")
- Environmental details
- Emotional cues
- Action outcomes

Always end your response with a hook, question, or situation that invites the protagonist to respond.`;

    // Get the last message from the protagonist
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.type !== 'protagonist') {
      throw new Error('Last message must be from the protagonist');
    }

    const prompt = lastMessage.content.text;
    
    try {
      if (onChunk) {
        // Use streaming for real-time response
        await this.geminiService.generateStreamingResponse(prompt, systemPrompt, {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        }, onChunk);
        
        return ""; // The full response is handled by the onChunk callback
      } else {
        // Use non-streaming for single response
        return await this.geminiService.generateResponse(prompt, systemPrompt, {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        });
      }
    } catch (error) {
      console.error('Error generating narrator response:', error);
      throw new Error('Failed to generate narrator response. Please try again.');
    }
  }
}
```

## OpenRouter API Integration

### Overview

OpenRouter provides access to multiple LLMs through a unified API, giving our application flexibility in model selection and fallback options.

### Setup and Configuration

#### Installation

```bash
npm install axios
```

#### Basic Configuration

```typescript
// src/main/api/openrouter.ts
import axios, { AxiosInstance } from 'axios';

export class OpenRouterService {
  private api: AxiosInstance;
  private modelName: string;
  
  constructor(apiKey: string, modelName: string = 'anthropic/claude-3-opus') {
    this.api = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost', // Replace with your app's domain in production
        'X-Title': 'RPG Storytelling Platform'
      }
    });
    
    this.modelName = modelName;
  }
  
  async generateResponse(prompt: string, systemPrompt: string, options: any = {}) {
    try {
      const response = await this.api.post('/chat/completions', {
        model: this.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxOutputTokens || 1024,
        top_p: options.topP || 0.95,
        stream: false
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating response from OpenRouter:', error);
      throw error;
    }
  }
  
  async generateStreamingResponse(prompt: string, systemPrompt: string, options: any = {}, 
                                 onChunk: (chunk: string) => void) {
    try {
      const response = await this.api.post('/chat/completions', {
        model: this.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxOutputTokens || 1024,
        top_p: options.topP || 0.95,
        stream: true
      }, {
        responseType: 'stream'
      });
      
      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error('Error parsing streaming response:', e);
            }
          }
        }
      });
      
      return new Promise<string>((resolve) => {
        response.data.on('end', () => {
          resolve("");
        });
      });
    } catch (error) {
      console.error('Error generating streaming response from OpenRouter:', error);
      throw error;
    }
  }
  
  async listAvailableModels() {
    try {
      const response = await this.api.get('/models');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching available models from OpenRouter:', error);
      throw error;
    }
  }
  
  setModel(modelName: string) {
    this.modelName = modelName;
  }
}
```

## API Key Management

### Secure Storage

```typescript
// src/main/services/api-key-service.ts
import { safeStorage } from 'electron';
import fs from 'fs';
import path from 'path';

export class ApiKeyService {
  private configPath: string;
  
  constructor(appDataPath: string) {
    this.configPath = path.join(appDataPath, 'config.json');
    this.ensureConfigFile();
  }
  
  private ensureConfigFile() {
    if (!fs.existsSync(this.configPath)) {
      fs.writeFileSync(this.configPath, JSON.stringify({
        geminiApiKey: '',
        openRouterApiKey: ''
      }));
    }
  }
  
  async setGeminiApiKey(apiKey: string): Promise<void> {
    const encryptedKey = safeStorage.encryptString(apiKey).toString('base64');
    
    const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    config.geminiApiKey = encryptedKey;
    
    fs.writeFileSync(this.configPath, JSON.stringify(config));
  }
  
  async getGeminiApiKey(): Promise<string> {
    const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    
    if (!config.geminiApiKey) {
      return '';
    }
    
    const encryptedKey = Buffer.from(config.geminiApiKey, 'base64');
    return safeStorage.decryptString(encryptedKey);
  }
  
  async setOpenRouterApiKey(apiKey: string): Promise<void> {
    const encryptedKey = safeStorage.encryptString(apiKey).toString('base64');
    
    const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    config.openRouterApiKey = encryptedKey;
    
    fs.writeFileSync(this.configPath, JSON.stringify(config));
  }
  
  async getOpenRouterApiKey(): Promise<string> {
    const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    
    if (!config.openRouterApiKey) {
      return '';
    }
    
    const encryptedKey = Buffer.from(config.openRouterApiKey, 'base64');
    return safeStorage.decryptString(encryptedKey);
  }
}
```

## Error Handling and Fallbacks

### Error Handling Strategy

```typescript
// src/main/services/error-handling.ts
export enum ErrorType {
  API_CONNECTION,
  API_AUTHENTICATION,
  API_QUOTA_EXCEEDED,
  API_CONTENT_FILTERED,
  PARSING_ERROR,
  UNKNOWN
}

export class ApiError extends Error {
  type: ErrorType;
  
  constructor(message: string, type: ErrorType) {
    super(message);
    this.type = type;
    this.name = 'ApiError';
  }
}

export function handleGeminiError(error: any): ApiError {
  const message = error.message || 'Unknown error occurred';
  
  if (message.includes('UNAUTHENTICATED')) {
    return new ApiError('Invalid API key. Please check your Gemini API key.', ErrorType.API_AUTHENTICATION);
  } else if (message.includes('RESOURCE_EXHAUSTED')) {
    return new ApiError('API quota exceeded. Please try again later.', ErrorType.API_QUOTA_EXCEEDED);
  } else if (message.includes('PERMISSION_DENIED') || message.includes('blocked')) {
    return new ApiError('Content was filtered by the API. Please modify your prompt.', ErrorType.API_CONTENT_FILTERED);
  } else if (message.includes('UNAVAILABLE') || message.includes('DEADLINE_EXCEEDED')) {
    return new ApiError('Could not connect to Gemini API. Please check your internet connection.', ErrorType.API_CONNECTION);
  } else {
    return new ApiError(`Gemini API error: ${message}`, ErrorType.UNKNOWN);
  }
}

export function handleOpenRouterError(error: any): ApiError {
  const status = error.response?.status;
  const message = error.response?.data?.error?.message || error.message || 'Unknown error occurred';
  
  if (status === 401) {
    return new ApiError('Invalid API key. Please check your OpenRouter API key.', ErrorType.API_AUTHENTICATION);
  } else if (status === 429) {
    return new ApiError('API rate limit exceeded. Please try again later.', ErrorType.API_QUOTA_EXCEEDED);
  } else if (status === 400 && message.includes('content filtered')) {
    return new ApiError('Content was filtered by the API. Please modify your prompt.', ErrorType.API_CONTENT_FILTERED);
  } else if (status === 503 || status === 504) {
    return new ApiError('Could not connect to OpenRouter API. Please check your internet connection.', ErrorType.API_CONNECTION);
  } else {
    return new ApiError(`OpenRouter API error: ${message}`, ErrorType.UNKNOWN);
  }
}
```

### Fallback Mechanism

```typescript
// src/main/services/ai-service.ts
import { GeminiService } from '../api/gemini';
import { OpenRouterService } from '../api/openrouter';
import { ApiError, ErrorType, handleGeminiError, handleOpenRouterError } from './error-handling';

export class AiService {
  private geminiService: GeminiService;
  private openRouterService: OpenRouterService;
  private primaryProvider: 'gemini' | 'openrouter';
  
  constructor(geminiService: GeminiService, openRouterService: OpenRouterService, primaryProvider: 'gemini' | 'openrouter' = 'gemini') {
    this.geminiService = geminiService;
    this.openRouterService = openRouterService;
    this.primaryProvider = primaryProvider;
  }
  
  setPrimaryProvider(provider: 'gemini' | 'openrouter') {
    this.primaryProvider = provider;
  }
  
  async generateResponse(prompt: string, systemPrompt: string, options: any = {}): Promise<string> {
    try {
      if (this.primaryProvider === 'gemini') {
        return await this.geminiService.generateResponse(prompt, systemPrompt, options);
      } else {
        return await this.openRouterService.generateResponse(prompt, systemPrompt, options);
      }
    } catch (error) {
      console.error(`Error with primary provider (${this.primaryProvider}):`, error);
      
      // Try fallback provider
      try {
        console.log(`Falling back to ${this.primaryProvider === 'gemini' ? 'OpenRouter' : 'Gemini'}...`);
        
        if (this.primaryProvider === 'gemini') {
          return await this.openRouterService.generateResponse(prompt, systemPrompt, options);
        } else {
          return await this.geminiService.generateResponse(prompt, systemPrompt, options);
        }
      } catch (fallbackError) {
        console.error('Fallback provider also failed:', fallbackError);
        
        // Determine which error to throw based on which provider was used last
        if (this.primaryProvider === 'gemini') {
          throw handleOpenRouterError(fallbackError);
        } else {
          throw handleGeminiError(fallbackError);
        }
      }
    }
  }
  
  async generateStreamingResponse(
    prompt: string, 
    systemPrompt: string, 
    options: any = {}, 
    onChunk: (chunk: string) => void,
    onError: (error: ApiError) => void
  ): Promise<void> {
    try {
      if (this.primaryProvider === 'gemini') {
        await this.geminiService.generateStreamingResponse(prompt, systemPrompt, options, onChunk);
      } else {
        await this.openRouterService.generateStreamingResponse(prompt, systemPrompt, options, onChunk);
      }
    } catch (error) {
      console.error(`Error with primary provider (${this.primaryProvider}):`, error);
      
      // Notify about the error and fallback attempt
      onChunk('\n\n[Switching to fallback AI provider due to an error...]\n\n');
      
      // Try fallback provider
      try {
        console.log(`Falling back to ${this.primaryProvider === 'gemini' ? 'OpenRouter' : 'Gemini'}...`);
        
        if (this.primaryProvider === 'gemini') {
          await this.openRouterService.generateStreamingResponse(prompt, systemPrompt, options, onChunk);
        } else {
          await this.geminiService.generateStreamingResponse(prompt, systemPrompt, options, onChunk);
        }
      } catch (fallbackError) {
        console.error('Fallback provider also failed:', fallbackError);
        
        // Determine which error to report based on which provider was used last
        if (this.primaryProvider === 'gemini') {
          onError(handleOpenRouterError(fallbackError));
        } else {
          onError(handleGeminiError(fallbackError));
        }
      }
    }
  }
}
```

## Conclusion

This API integration guide provides a robust foundation for the AI-driven Narrator/GM system in our Local-First Immersive RPG AI Storytelling Platform. By integrating with both Gemini and OpenRouter, we ensure flexibility in model selection and provide fallback options for reliability.

The implementation includes:

1. Direct integration with Google's Gemini SDK
2. Integration with OpenRouter for access to multiple LLMs
3. Secure API key storage
4. Error handling and fallback mechanisms
5. Support for character card generation, lorebook generation, and support tool generation
6. Robust Narrator/GM chat functionality

This design supports all the core AI-driven features of our platform while maintaining a local-first architecture with minimal cloud dependencies.