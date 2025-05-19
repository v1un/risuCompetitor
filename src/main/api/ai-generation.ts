import { ipcMain } from 'electron';
import { apiErrorHandler, createErrorResponse } from './ApiErrorHandler';

// Setup AI generation IPC handlers
export function setupAiGenerationService(): void {
  // Generate character
  ipcMain.handle('ai:generate-character', async (_, series: string, role: string, additionalInfo?: string) => {
    try {
      // This would call the actual AI service in a real implementation
      // For now, we'll return mock data
      const character = generateMockCharacter(series, role, additionalInfo);
      return { success: true, character };
    } catch (error: unknown) {
      console.error('Error generating character:', error);
      return createErrorResponse(error, 'ai:generate-character', { series, role, additionalInfo });
    }
  });

  // Generate lorebook
  ipcMain.handle('ai:generate-lorebook', async (_, series: string, additionalInfo?: string) => {
    try {
      // This would call the actual AI service in a real implementation
      // For now, we'll return mock data
      const lorebook = generateMockLorebook(series, additionalInfo);
      return { success: true, lorebook };
    } catch (error: unknown) {
      console.error('Error generating lorebook:', error);
      return createErrorResponse(error, 'ai:generate-lorebook', { series, additionalInfo });
    }
  });

  // Generate support tool
  ipcMain.handle('ai:generate-support-tool', async (_, series: string, toolType: string, additionalInfo?: string) => {
    try {
      // This would call the actual AI service in a real implementation
      // For now, we'll return mock data
      const tool = generateMockSupportTool(series, toolType, additionalInfo);
      return { success: true, tool };
    } catch (error: unknown) {
      console.error('Error generating support tool:', error);
      return createErrorResponse(error, 'ai:generate-support-tool', { series, toolType, additionalInfo });
    }
  });

  // Generate narrator response
  ipcMain.handle('ai:generate-narrator-response', async (_, sessionId: string, messages: any[], context: any) => {
    try {
      // This would call the actual AI service in a real implementation
      // For now, we'll return mock data
      const response = generateMockNarratorResponse(sessionId, messages, context);
      return { success: true, response };
    } catch (error: unknown) {
      console.error('Error generating narrator response:', error);
      return createErrorResponse(error, 'ai:generate-narrator-response', { sessionId });
    }
  });
}

// Mock data generators
function generateMockCharacter(series: string, role: string, additionalInfo?: string) {
  return {
    id: `mock-${Date.now()}`,
    series,
    character: {
      name: role === 'protagonist' ? 'Hero Character' : role === 'antagonist' ? 'Villain Character' : 'NPC Character',
      role,
      description: `This is a mock ${role} character for the ${series} series. ${additionalInfo || ''}`,
      attributes: {
        strength: Math.floor(Math.random() * 10) + 10,
        dexterity: Math.floor(Math.random() * 10) + 10,
        constitution: Math.floor(Math.random() * 10) + 10,
        intelligence: Math.floor(Math.random() * 10) + 10,
        wisdom: Math.floor(Math.random() * 10) + 10,
        charisma: Math.floor(Math.random() * 10) + 10
      },
      background: 'Mock background story',
      motivation: 'Mock motivation',
      goals: ['Mock goal 1', 'Mock goal 2'],
      relationships: []
    }
  };
}

function generateMockLorebook(series: string, additionalInfo?: string) {
  return {
    id: `mock-${Date.now()}`,
    series,
    metadata: {
      title: `${series} World`,
      description: `Lorebook for the ${series} series. ${additionalInfo || ''}`,
      tags: [series, 'mock', 'generated']
    },
    world: {
      overview: `This is a mock world overview for the ${series} series.`,
      history: 'Mock history of the world',
      geography: 'Mock geography description',
      cultures: ['Mock culture 1', 'Mock culture 2'],
      magic: 'Mock magic system description',
      technology: 'Mock technology description'
    },
    entries: [
      {
        id: `entry-1-${Date.now()}`,
        name: 'Mock Location',
        content: 'This is a mock location entry',
        keywords: ['location', 'mock'],
        priority: 5
      },
      {
        id: `entry-2-${Date.now()}`,
        name: 'Mock Faction',
        content: 'This is a mock faction entry',
        keywords: ['faction', 'mock'],
        priority: 4
      }
    ]
  };
}

function generateMockSupportTool(series: string, toolType: string, additionalInfo?: string) {
  return {
    id: `mock-${Date.now()}`,
    series,
    tool: {
      name: `${series} ${toolType.charAt(0).toUpperCase() + toolType.slice(1)}`,
      type: toolType,
      description: `This is a mock ${toolType} tool for the ${series} series. ${additionalInfo || ''}`,
      config: {
        fields: ['Mock Field 1', 'Mock Field 2'],
        options: {
          showHeader: true,
          allowExport: true,
          theme: 'default'
        }
      },
      data: []
    }
  };
}

function generateMockNarratorResponse(sessionId: string, messages: any[], context: any) {
  const lastMessage = messages[messages.length - 1];
  return {
    content: `This is a mock narrator response to: "${lastMessage.content}"`,
    sessionId,
    timestamp: new Date().toISOString()
  };
}