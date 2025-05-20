import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { generateNarratorResponse } from '../api/gemini';
import { generateWithOpenRouter } from '../api/openrouter';
import { getApiKey } from './api-key-manager';
import { getDatabase } from '../database/sqlite';

// Setup AI generation service
export function setupAiGenerationService(): void {
  // Generate character
  ipcMain.handle('ai:generate-character', async (_, series: string, role: string, additionalInfo: string = '') => {
    try {
      return await generateCharacter(series, role, additionalInfo);
    } catch (error) {
      console.error('Error generating character:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Generate lorebook
  ipcMain.handle('ai:generate-lorebook', async (_, series: string, additionalInfo: string = '') => {
    try {
      return await generateLorebook(series, additionalInfo);
    } catch (error) {
      console.error('Error generating lorebook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Generate support tool
  ipcMain.handle('ai:generate-support-tool', async (_, series: string, toolType: string, additionalInfo: string = '') => {
    try {
      return await generateSupportTool(series, toolType, additionalInfo);
    } catch (error) {
      console.error('Error generating support tool:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Generate narrator response
  ipcMain.handle('ai:generate-narrator-response', async (_, sessionId: string, messages: any[], context: any) => {
    try {
      return await generateNarratorResponseWithContext(sessionId, messages, context);
    } catch (error) {
      console.error('Error generating narrator response:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
}

// Generate character
async function generateCharacter(series: string, role: string, additionalInfo: string = '') {
  // Check if API key exists
  const useOpenRouter = false; // Default to Gemini for character generation
  const apiKey = await getApiKey(useOpenRouter ? 'openrouter' : 'gemini');
  
  if (!apiKey) {
    return { 
      success: false, 
      error: `${useOpenRouter ? 'OpenRouter' : 'Gemini'} API key not found` 
    };
  }
  
  // Build system prompt
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

  const prompt = `Generate a complete character card for a ${role} in the ${series} universe.`;
  
  // Generate character using Gemini
  const jsonResponse = await generateNarratorResponse(prompt, systemPrompt, {
    model: 'gemini-pro',
    temperature: 0.8,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
    stopSequences: [],
    safetySettings: []
  });
  
  // Extract JSON from response
  const jsonMatch = jsonResponse.match(/```json\n([\s\S]*?)\n```/) || 
                    jsonResponse.match(/```\n([\s\S]*?)\n```/) ||
                    [null, jsonResponse];
  
  const jsonString = jsonMatch[1];
  
  let characterCard;
  try {
    characterCard = JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse character JSON:', error);
    throw new Error('Generated character data is not valid JSON. Please try again.');
  }
  
  // Generate a proper ID if not present
  if (!characterCard.metadata.id || characterCard.metadata.id === "unique-id") {
    characterCard.metadata.id = `char-${uuidv4()}`;
  }
  
  // Ensure timestamps are proper
  const now = new Date().toISOString();
  characterCard.metadata.created = now;
  characterCard.metadata.modified = now;
  
  // Save to database
  const db = getDatabase();
  
  await db.run(
    `INSERT INTO characters (
      id, name, role, series, data, created_at, modified_at
    ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    characterCard.metadata.id,
    characterCard.character.name,
    characterCard.character.role,
    characterCard.metadata.series,
    JSON.stringify(characterCard)
  );
  
  return { success: true, character: characterCard };
}

// Generate lorebook
async function generateLorebook(series: string, additionalInfo: string = '') {
  // Check if API key exists
  const useOpenRouter = false; // Default to Gemini for lorebook generation
  const apiKey = await getApiKey(useOpenRouter ? 'openrouter' : 'gemini');
  
  if (!apiKey) {
    return { 
      success: false, 
      error: `${useOpenRouter ? 'OpenRouter' : 'Gemini'} API key not found` 
    };
  }
  
  // Build system prompt
  const systemPrompt = `You are a world-builder for an immersive RPG experience set in the world of ${series}.
Your task is to create a detailed lorebook in JSON format following the exact structure provided below.
The lorebook should capture the essence of the ${series} universe, focusing on the canonical beginning of the series.

${additionalInfo}

The lorebook must strictly follow this JSON structure:
\`\`\`json
{
  "version": "1.0",
  "type": "lorebook",
  "metadata": {
    "id": "unique-id",
    "created": "current-timestamp",
    "modified": "current-timestamp",
    "series": "${series}",
    "title": "${series} World Guide"
  },
  "world": {
    "overview": "General description of the world/setting",
    "history": "Historical timeline and significant events",
    "geography": {
      "regions": [
        // Key regions in the series
      ]
    },
    "factions": [
      // Major factions/groups in the series
    ]
  },
  "rules": {
    // Rules specific to the series (magic system, technology, etc.)
  },
  "narrative_elements": {
    "themes": ["Theme 1", "Theme 2"],
    "tone": "Overall tone of the narrative",
    "plot_points": [
      // Key plot points from the beginning of the series
    ]
  },
  "series_specific": {
    // Elements unique to the ${series} universe
  },
  "narrator_guidance": {
    "starting_point": "Canonical starting point for the narrative",
    "key_npcs": ["NPC 1", "NPC 2"],
    "narrative_hooks": [
      // Potential story hooks
    ],
    "secrets": [
      // Hidden elements to be revealed at appropriate times
    ]
  }
}
\`\`\`

Ensure all fields are filled with rich, detailed, and accurate content for the ${series} universe.
The lorebook should provide a solid foundation for an immersive RPG experience set at the beginning of the series.
`;

  const prompt = `Generate a complete lorebook for the ${series} universe, focusing on the canonical beginning of the series.`;
  
  // Generate lorebook using Gemini
  const jsonResponse = await generateNarratorResponse(prompt, systemPrompt, {
    model: 'gemini-pro',
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 4096,
    stopSequences: [],
    safetySettings: []
  });
  
  // Extract JSON from response
  const jsonMatch = jsonResponse.match(/```json\n([\s\S]*?)\n```/) || 
                    jsonResponse.match(/```\n([\s\S]*?)\n```/) ||
                    [null, jsonResponse];
  
  const jsonString = jsonMatch[1];
  
  let lorebook;
  try {
    lorebook = JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse lorebook JSON:', error);
    throw new Error('Generated lorebook data is not valid JSON. Please try again.');
  }
  
  // Generate a proper ID if not present
  if (!lorebook.metadata.id || lorebook.metadata.id === "unique-id") {
    lorebook.metadata.id = `lore-${uuidv4()}`;
  }
  
  // Ensure timestamps are proper
  const now = new Date().toISOString();
  lorebook.metadata.created = now;
  lorebook.metadata.modified = now;
  
  // Save to database
  const db = getDatabase();
  
  await db.run(
    `INSERT INTO lorebooks (
      id, title, series, data, created_at, modified_at
    ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    lorebook.metadata.id,
    lorebook.metadata.title,
    lorebook.metadata.series,
    JSON.stringify(lorebook)
  );
  
  return { success: true, lorebook };
}

// Generate support tool
async function generateSupportTool(series: string, toolType: string, additionalInfo: string = '') {
  // Check if API key exists
  const useOpenRouter = false; // Default to Gemini for support tool generation
  const apiKey = await getApiKey(useOpenRouter ? 'openrouter' : 'gemini');
  
  if (!apiKey) {
    return { 
      success: false, 
      error: `${useOpenRouter ? 'OpenRouter' : 'Gemini'} API key not found` 
    };
  }
  
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

  // Build system prompt
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
  
  // Generate support tool using Gemini
  const jsonResponse = await generateNarratorResponse(prompt, systemPrompt, {
    model: 'gemini-pro',
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 4096,
    stopSequences: [],
    safetySettings: []
  });
  
  // Extract JSON from response
  const jsonMatch = jsonResponse.match(/```json\n([\s\S]*?)\n```/) || 
                    jsonResponse.match(/```\n([\s\S]*?)\n```/) ||
                    [null, jsonResponse];
  
  const jsonString = jsonMatch[1];
  const supportTool = JSON.parse(jsonString);
  
  // Generate a proper ID if not present
  if (!supportTool.metadata.id || supportTool.metadata.id === "unique-id") {
    supportTool.metadata.id = `tool-${series.toLowerCase().replace(/\s+/g, '-')}-${toolType}-${uuidv4()}`;
  }
  
  // Ensure timestamps are proper
  const now = new Date().toISOString();
  supportTool.metadata.created = now;
  supportTool.metadata.modified = now;
  
  // Save to database
  const db = getDatabase();
  
  await db.run(
    `INSERT INTO support_tools (
      id, name, type, series, data, created_at, modified_at
    ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    supportTool.metadata.id,
    supportTool.tool.name,
    supportTool.tool.type,
    supportTool.metadata.series,
    JSON.stringify(supportTool)
  );
  
  return { success: true, tool: supportTool };
}

// Generate narrator response with context
async function generateNarratorResponseWithContext(sessionId: string, messages: any[], context: any) {
  // Check if API key exists
  const useOpenRouter = context.useOpenRouter || false;
  const apiKey = await getApiKey(useOpenRouter ? 'openrouter' : 'gemini');
  
  if (!apiKey) {
    return { 
      success: false, 
      error: `${useOpenRouter ? 'OpenRouter' : 'Gemini'} API key not found` 
    };
  }
  
  // Build system prompt
  const systemPrompt = `You are the Narrator/Game Master for an immersive RPG experience set in the world of ${context.series}.
Your role is to guide the narrative, describe the world, portray all non-player characters (NPCs), and respond to the protagonist's actions.
The user is always playing as the protagonist, ${context.protagonist.name}.

The narrative begins at the canonical starting point of the series: ${context.startingPoint}

## World Information
${context.worldInfo}

## Protagonist Information
${context.protagonistInfo}

## Support Tools
${context.toolsInfo}

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
    return { success: false, error: 'Last message must be from the protagonist' };
  }

  const prompt = lastMessage.content.text;
  
  // Generate response
  let response;
  if (useOpenRouter) {
    // Format messages for OpenRouter
    const openRouterMessages = messages.map(msg => {
      if (msg.type === 'system') {
        return { role: 'system', content: msg.content.text };
      } else if (msg.type === 'narrator') {
        return { role: 'assistant', content: msg.content.text };
      } else {
        return { role: 'user', content: msg.content.text };
      }
    });
    
    // Generate with OpenRouter
    response = await generateWithOpenRouter(prompt, systemPrompt, {
      model: context.model || 'anthropic/claude-3-opus',
      temperature: context.temperature || 0.8,
      top_p: context.topP || 0.95,
      top_k: context.topK || 40,
      max_tokens: context.maxTokens || 2048,
      stop: context.stopSequences || []
    });
  } else {
    // Generate with Gemini
    response = await generateNarratorResponse(prompt, systemPrompt, {
      model: context.model || 'gemini-pro',
      temperature: context.temperature || 0.8,
      topK: context.topK || 40,
      topP: context.topP || 0.95,
      maxOutputTokens: context.maxTokens || 2048,
      stopSequences: context.stopSequences || [],
      safetySettings: context.safetySettings || []
    });
  }
  
  // Extract tool updates
  const toolUpdates: any[] = [];
  const toolUpdateRegex = /<tool:update id="([^"]+)" value="([^"]+)" reason="([^"]+)">/g;
  const toolAddRegex = /<tool:add id="([^"]+)" value="([^"]+)" reason="([^"]+)">/g;
  
  let match;
  while ((match = toolUpdateRegex.exec(response)) !== null) {
    toolUpdates.push({
      type: 'update',
      componentId: match[1],
      value: match[2],
      reason: match[3]
    });
  }
  
  while ((match = toolAddRegex.exec(response)) !== null) {
    toolUpdates.push({
      type: 'add',
      componentId: match[1],
      value: match[2],
      reason: match[3]
    });
  }
  
  // Remove tool commands from response
  response = response.replace(toolUpdateRegex, '').replace(toolAddRegex, '');
  
  // Save the response to the database
  const db = getDatabase();
  const messageId = `msg-${uuidv4()}`;
  
  await db.run(
    `INSERT INTO chat_messages (
      id, session_id, type, sender_name, content, timestamp
    ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    messageId,
    sessionId,
    'narrator',
    'Narrator',
    JSON.stringify({ text: response })
  );
  
  // Update session modified time
  await db.run('UPDATE chat_sessions SET modified_at = CURRENT_TIMESTAMP WHERE id = ?', sessionId);
  
  // Process tool updates
  if (toolUpdates.length > 0) {
    for (const update of toolUpdates) {
      // Get the tool that contains this component
      const tools = await db.all(`
        SELECT st.* FROM support_tools st
        JOIN session_tools st_tools ON st.id = st_tools.tool_id
        WHERE st_tools.session_id = ?
      `, sessionId);
      
      for (const tool of tools) {
        // Parse tool data
        const toolData = JSON.parse(tool.data);
        
        // Find the component
        const component = toolData.components.find((c: any) => c.id === update.componentId);
        
        if (component) {
          // Get the latest state of this tool
          const latestState = await db.get(`
            SELECT * FROM tool_states
            WHERE session_id = ? AND tool_id = ?
            ORDER BY timestamp DESC
            LIMIT 1
          `, sessionId, tool.id);
          
          let currentState: Record<string, any>;
          if (latestState) {
            currentState = JSON.parse(latestState.state);
          } else {
            // Initialize state from default values
            currentState = {};
            toolData.components.forEach((c: any) => {
              currentState[c.id] = c.default_value;
            });
          }
          
          // Update the state
          const newState: Record<string, any> = { ...currentState };
          const changes: Record<string, any> = {};
          
          if (update.type === 'update') {
            newState[update.componentId] = update.value;
            changes[update.componentId] = {
              from: currentState[update.componentId],
              to: update.value,
              reason: update.reason
            };
          } else if (update.type === 'add' && component.type === 'list') {
            if (!Array.isArray(newState[update.componentId])) {
              newState[update.componentId] = [];
            }
            newState[update.componentId].push(update.value);
            changes[update.componentId] = {
              action: 'add',
              value: update.value,
              reason: update.reason
            };
          }
          
          // Save the new state
          const stateId = `state-${uuidv4()}`;
          await db.run(`
            INSERT INTO tool_states (
              id, session_id, tool_id, message_id, state, changes, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            stateId,
            sessionId,
            tool.id,
            messageId,
            JSON.stringify(newState),
            JSON.stringify(changes)
          );
          
          break; // Found the tool, no need to check others
        }
      }
    }
  }
  
  return { 
    success: true, 
    response,
    messageId,
    toolUpdates
  };
}