# AI Integration Guide

This document provides a comprehensive guide to the AI integration in the Immersive RPG AI Storytelling Platform, covering the supported AI providers, implementation details, prompt engineering strategies, and best practices.

## Supported AI Providers

### 1. Google Gemini

- **API Version**: Gemini Pro
- **Implementation**: `/src/main/api/gemini.ts`
- **Key Features**:
  - Text generation for character creation
  - Lorebook generation
  - Support tool generation
  - Narrator responses

### 2. OpenRouter

- **API Version**: OpenRouter v1
- **Implementation**: `/src/main/api/openrouter.ts`
- **Key Features**:
  - Access to multiple AI models (Claude, GPT-4, etc.)
  - Model selection for different use cases
  - Fallback options when primary models are unavailable

## Integration Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│  AI Generation      │     │  API Service Layer  │     │  External AI APIs   │
│  Service            │◄───►│  (Gemini/OpenRouter)│◄───►│                     │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         ▲                                                        
         │                                                        
         │                                                        
         │                                                        
         ▼                                                        
┌─────────────────────┐                                           
│                     │                                           
│  IPC Handlers       │                                           
│                     │                                           
└─────────────────────┘                                           
         ▲                                                        
         │                                                        
         │                                                        
         │                                                        
         ▼                                                        
┌─────────────────────┐                                           
│                     │                                           
│  React UI           │                                           
│  Components         │                                           
│                     │                                           
└─────────────────────┘                                           
```

## Key Components

### 1. AI Generation Service

Located at `/src/main/services/ai-generation-service.ts`, this service provides high-level functions for:

- Character generation
- Lorebook generation
- Support tool generation
- Narrator responses with context

### 2. API Service Layer

Provides direct interfaces to AI providers:

- `/src/main/api/gemini.ts` - Google Gemini API
- `/src/main/api/openrouter.ts` - OpenRouter API

### 3. IPC Handlers

Exposes AI functionality to the renderer process:

- `ai:generate-character`
- `ai:generate-lorebook`
- `ai:generate-support-tool`
- `ai:generate-narrator-response`

### 4. React Components

UI components for interacting with AI features:

- `/src/renderer/components/ai/AiGenerationPanel.tsx`
- `/src/renderer/components/chat/NarratorChat.tsx`

## Prompt Engineering

### 1. System Prompts

Each AI generation function uses carefully crafted system prompts that:

- Define the AI's role (character designer, world builder, etc.)
- Provide context about the series/setting
- Specify the required output format (JSON structure)
- Include examples and constraints

Example (Character Generation):
```typescript
const systemPrompt = `You are a character designer for an immersive RPG experience set in the world of ${series}.
Your task is to create a detailed character card in JSON format following the exact structure provided below.
The character should be a ${role} that fits naturally within the ${series} universe.
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
    "role": "${role}",
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
```

### 2. Narrator Context Building

For narrator responses, we build a comprehensive context that includes:

- Series information
- Protagonist details
- World information
- Support tool states
- Conversation history

Example:
```typescript
const context = {
  series: lorebook.metadata.series,
  protagonist: protagonist,
  startingPoint: lorebook.narrator_guidance.starting_point,
  worldInfo: lorebook.world.overview,
  protagonistInfo: `Name: ${protagonist.character.name}\nDescription: ${protagonist.character.description}`,
  toolsInfo: tools.map(tool => 
    `${tool.tool.name}: ${tool.tool.description}`
  ).join('\n\n'),
  useOpenRouter: false,
  temperature: 0.8,
  topP: 0.95,
  topK: 40,
  maxTokens: 2048
};
```

### 3. Output Parsing

AI responses are parsed to extract structured data:

- JSON extraction from text responses
- Validation against expected schemas
- Fallback handling for malformed responses

Example:
```typescript
const jsonMatch = jsonResponse.match(/```json\n([\s\S]*?)\n```/) || 
                  jsonResponse.match(/```\n([\s\S]*?)\n```/) ||
                  [null, jsonResponse];

const jsonString = jsonMatch[1];
const characterCard = JSON.parse(jsonString);
```

## Generation Parameters

### 1. Temperature

- **Character Generation**: 0.8 (balanced creativity)
- **Lorebook Generation**: 0.7 (more factual)
- **Support Tool Generation**: 0.7 (more structured)
- **Narrator Responses**: 0.8 (balanced creativity)

### 2. Top-K and Top-P

- **Top-K**: 40 (standard for most generations)
- **Top-P**: 0.95 (allows for some creativity while maintaining coherence)

### 3. Max Tokens

- **Character Generation**: 2048
- **Lorebook Generation**: 4096 (more comprehensive)
- **Support Tool Generation**: 4096 (more detailed)
- **Narrator Responses**: 2048 (standard response length)

## Special Features

### 1. Tool State Updates

The narrator can update support tool states using special commands in responses:

```
<tool:update id="component-id" value="new-value" reason="reason for change">
<tool:add id="component-id" value="new-value" reason="reason for change">
```

These commands are parsed and processed to update the relevant tool states.

### 2. Series-Specific Adaptation

The system adapts to different series by:

- Incorporating series-specific terminology
- Adjusting character attributes based on the series
- Tailoring support tools to match series mechanics
- Adapting narrator tone and style to match the series

## Error Handling and Fallbacks

### 1. API Failures

- Retry logic for transient failures
- Fallback to alternative models when available
- Clear error messages for users

### 2. Malformed Responses

- JSON validation and repair when possible
- Fallback to simpler generation when complex structures fail
- Logging for debugging and improvement

### 3. Rate Limiting

- Throttling of requests to respect API limits
- Queue system for multiple generations
- User feedback during waiting periods

## Future Improvements

### 1. Enhanced Prompt Engineering

- More detailed examples for each series
- Fine-tuned prompts based on user feedback
- A/B testing of different prompt strategies

### 2. Model Selection UI

- Allow users to select specific models for different tasks
- Provide guidance on model strengths and weaknesses
- Save preferences per series or task

### 3. Caching and Optimization

- Cache similar requests to reduce API usage
- Implement background generation for non-critical content
- Add streaming responses for narrator chat

### 4. Advanced Features

- Image generation for characters and scenes
- Voice options for narrator responses
- Fine-tuning options for generation parameters

## Best Practices for Developers

### 1. Prompt Development

- Keep prompts modular and reusable
- Document the purpose and structure of each prompt
- Test prompts with multiple series and scenarios

### 2. API Integration

- Always check for API key before making requests
- Handle all potential error cases
- Provide meaningful feedback to users

### 3. Response Processing

- Validate all AI-generated content before saving
- Sanitize content for security and consistency
- Provide fallbacks for unexpected formats

## Conclusion

The AI integration in the Immersive RPG AI Storytelling Platform provides a powerful foundation for creating rich, dynamic RPG experiences. By leveraging multiple AI providers and carefully crafted prompts, we can generate high-quality content tailored to specific series and user preferences.

As AI technology evolves, this integration will continue to improve, offering even more immersive and engaging storytelling capabilities.