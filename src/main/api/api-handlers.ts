import { ipcMain } from 'electron';
import { getDatabase } from '../database/sqlite';
import { v4 as uuidv4 } from 'uuid';
import { setupInventoryHandlers } from './inventory-handlers';

// Define types for database entities
interface Character {
  id: string;
  name: string;
  role: string;
  series: string;
  data: any;
  avatar?: Buffer;
  created_at: string;
  modified_at: string;
  is_favorite: number;
  folder?: string;
}

interface Lorebook {
  id: string;
  title: string;
  series: string;
  data: any;
  created_at: string;
  modified_at: string;
  is_favorite: number;
  folder?: string;
}

interface SupportTool {
  id: string;
  name: string;
  type: string;
  series: string;
  data: any;
  created_at: string;
  modified_at: string;
  is_favorite: number;
  folder?: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  type: string;
  sender_id?: string;
  sender_name: string;
  content: string;
  formatted_content?: string;
  timestamp: string;
  is_edited: number;
  edit_history?: any;
  is_regenerated: number;
  regeneration_history?: any;
  metadata?: any;
}

interface Theme {
  id: string;
  name: string;
  type: string;
  data: any;
  created_at: string;
  modified_at: string;
  is_favorite: number;
  is_system: number;
}

interface Series {
  id: string;
  name: string;
  description?: string;
  genre?: string;
  tags?: any;
  created_at: string;
  modified_at: string;
  is_favorite: number;
  is_system: number;
}

// Setup IPC handlers for database operations
export function setupApiHandlers(): void {
  // Character handlers
  setupCharacterHandlers();
  
  // Lorebook handlers
  setupLorebookHandlers();
  
  // Support Tool handlers
  setupSupportToolHandlers();
  
  // Chat Session handlers
  setupChatSessionHandlers();
  
  // Theme handlers
  setupThemeHandlers();
  
  // Settings handlers
  setupSettingsHandlers();
  
  // Series handlers
  setupSeriesHandlers();
  
  // Inventory handlers
  setupInventoryHandlers();
}

// Character handlers
function setupCharacterHandlers(): void {
  // Get character by ID
  ipcMain.handle('character:get', async (_, id: string) => {
    try {
      const db = getDatabase();
      const character = await db.get('SELECT * FROM characters WHERE id = ?', id);
      
      if (character) {
        // Parse JSON data
        character.data = JSON.parse(character.data);
      }
      
      return { success: true, character };
    } catch (error) {
      console.error('Error getting character:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Get characters by series
  ipcMain.handle('character:get-by-series', async (_, series: string) => {
    try {
      const db = getDatabase();
      const characters = await db.all(
        'SELECT * FROM characters WHERE series = ? ORDER BY name',
        series
      );
      
      // Parse JSON data for each character
      characters.forEach(character => {
        character.data = JSON.parse(character.data);
      });
      
      return { success: true, characters };
    } catch (error) {
      console.error('Error getting characters by series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Create character
  ipcMain.handle('character:create', async (_, character: any) => {
    try {
      const db = getDatabase();
      const id = uuidv4();
      
      await db.run(
        `INSERT INTO characters (
          id, name, role, series, data, avatar, created_at, modified_at, is_favorite, folder
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)`,
        id,
        character.name,
        character.role,
        character.series,
        JSON.stringify(character.data),
        character.avatar,
        character.is_favorite || 0,
        character.folder || null
      );
      
      return { success: true, id };
    } catch (error) {
      console.error('Error creating character:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Update character
  ipcMain.handle('character:update', async (_, id: string, character: any) => {
    try {
      const db = getDatabase();
      
      await db.run(
        `UPDATE characters SET
          name = ?, role = ?, series = ?, data = ?, avatar = ?,
          modified_at = CURRENT_TIMESTAMP, is_favorite = ?, folder = ?
        WHERE id = ?`,
        character.name,
        character.role,
        character.series,
        JSON.stringify(character.data),
        character.avatar,
        character.is_favorite || 0,
        character.folder || null,
        id
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating character:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Delete character
  ipcMain.handle('character:delete', async (_, id: string) => {
    try {
      const db = getDatabase();
      await db.run('DELETE FROM characters WHERE id = ?', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting character:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Search characters
  ipcMain.handle('character:search', async (_, query: string) => {
    try {
      const db = getDatabase();
      const characters = await db.all(
        `SELECT * FROM characters
        WHERE name LIKE ? OR data LIKE ?
        ORDER BY name`,
        `%${query}%`, `%${query}%`
      );
      
      // Parse JSON data for each character
      characters.forEach(character => {
        character.data = JSON.parse(character.data);
      });
      
      return { success: true, characters };
    } catch (error) {
      console.error('Error searching characters:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
}

// Lorebook handlers
function setupLorebookHandlers(): void {
  // Get lorebook by ID
  ipcMain.handle('lorebook:get', async (_, id: string) => {
    try {
      const db = getDatabase();
      const lorebook = await db.get('SELECT * FROM lorebooks WHERE id = ?', id);
      
      if (lorebook) {
        // Parse JSON data
        lorebook.data = JSON.parse(lorebook.data);
      }
      
      return { success: true, lorebook };
    } catch (error) {
      console.error('Error getting lorebook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Get lorebooks by series
  ipcMain.handle('lorebook:get-by-series', async (_, series: string) => {
    try {
      const db = getDatabase();
      const lorebooks = await db.all(
        'SELECT * FROM lorebooks WHERE series = ? ORDER BY title',
        series
      );
      
      // Parse JSON data for each lorebook
      lorebooks.forEach(lorebook => {
        lorebook.data = JSON.parse(lorebook.data);
      });
      
      return { success: true, lorebooks };
    } catch (error) {
      console.error('Error getting lorebooks by series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Create lorebook
  ipcMain.handle('lorebook:create', async (_, lorebook: any) => {
    try {
      const db = getDatabase();
      const id = uuidv4();
      
      await db.run(
        `INSERT INTO lorebooks (
          id, title, series, data, created_at, modified_at, is_favorite, folder
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)`,
        id,
        lorebook.title,
        lorebook.series,
        JSON.stringify(lorebook.data),
        lorebook.is_favorite || 0,
        lorebook.folder || null
      );
      
      return { success: true, id };
    } catch (error) {
      console.error('Error creating lorebook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Update lorebook
  ipcMain.handle('lorebook:update', async (_, id: string, lorebook: any) => {
    try {
      const db = getDatabase();
      
      await db.run(
        `UPDATE lorebooks SET
          title = ?, series = ?, data = ?,
          modified_at = CURRENT_TIMESTAMP, is_favorite = ?, folder = ?
        WHERE id = ?`,
        lorebook.title,
        lorebook.series,
        JSON.stringify(lorebook.data),
        lorebook.is_favorite || 0,
        lorebook.folder || null,
        id
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating lorebook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Delete lorebook
  ipcMain.handle('lorebook:delete', async (_, id: string) => {
    try {
      const db = getDatabase();
      await db.run('DELETE FROM lorebooks WHERE id = ?', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting lorebook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Search lorebooks
  ipcMain.handle('lorebook:search', async (_, query: string) => {
    try {
      const db = getDatabase();
      const lorebooks = await db.all(
        `SELECT * FROM lorebooks
        WHERE title LIKE ? OR data LIKE ?
        ORDER BY title`,
        `%${query}%`, `%${query}%`
      );
      
      // Parse JSON data for each lorebook
      lorebooks.forEach(lorebook => {
        lorebook.data = JSON.parse(lorebook.data);
      });
      
      return { success: true, lorebooks };
    } catch (error) {
      console.error('Error searching lorebooks:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
}

// Support Tool handlers
function setupSupportToolHandlers(): void {
  // Get support tool by ID
  ipcMain.handle('support-tool:get', async (_, id: string) => {
    try {
      const db = getDatabase();
      const tool = await db.get('SELECT * FROM support_tools WHERE id = ?', id);
      
      if (tool) {
        // Parse JSON data
        tool.data = JSON.parse(tool.data);
      }
      
      return { success: true, tool };
    } catch (error) {
      console.error('Error getting support tool:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Get support tools by series
  ipcMain.handle('support-tool:get-by-series', async (_, series: string) => {
    try {
      const db = getDatabase();
      const tools = await db.all(
        'SELECT * FROM support_tools WHERE series = ? ORDER BY name',
        series
      );
      
      // Parse JSON data for each tool
      tools.forEach(tool => {
        tool.data = JSON.parse(tool.data);
      });
      
      return { success: true, tools };
    } catch (error) {
      console.error('Error getting support tools by series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Create support tool
  ipcMain.handle('support-tool:create', async (_, tool: any) => {
    try {
      const db = getDatabase();
      const id = uuidv4();
      
      await db.run(
        `INSERT INTO support_tools (
          id, name, type, series, data, created_at, modified_at, is_favorite, folder
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)`,
        id,
        tool.name,
        tool.type,
        tool.series,
        JSON.stringify(tool.data),
        tool.is_favorite || 0,
        tool.folder || null
      );
      
      return { success: true, id };
    } catch (error) {
      console.error('Error creating support tool:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Update support tool
  ipcMain.handle('support-tool:update', async (_, id: string, tool: any) => {
    try {
      const db = getDatabase();
      
      await db.run(
        `UPDATE support_tools SET
          name = ?, type = ?, series = ?, data = ?,
          modified_at = CURRENT_TIMESTAMP, is_favorite = ?, folder = ?
        WHERE id = ?`,
        tool.name,
        tool.type,
        tool.series,
        JSON.stringify(tool.data),
        tool.is_favorite || 0,
        tool.folder || null,
        id
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating support tool:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Delete support tool
  ipcMain.handle('support-tool:delete', async (_, id: string) => {
    try {
      const db = getDatabase();
      await db.run('DELETE FROM support_tools WHERE id = ?', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting support tool:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
}

// Chat Session handlers
function setupChatSessionHandlers(): void {
  // Get chat session by ID
  ipcMain.handle('chat-session:get', async (_, id: string) => {
    try {
      const db = getDatabase();
      const session = await db.get('SELECT * FROM chat_sessions WHERE id = ?', id);
      
      if (session) {
        // Parse JSON data
        session.settings = JSON.parse(session.settings);
      }
      
      return { success: true, session };
    } catch (error) {
      console.error('Error getting chat session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Get chat session with messages
  ipcMain.handle('chat-session:get-with-messages', async (_, id: string) => {
    try {
      const db = getDatabase();
      const session = await db.get('SELECT * FROM chat_sessions WHERE id = ?', id);
      
      if (!session) {
        return { success: true, session: null };
      }
      
      // Parse JSON data
      session.settings = JSON.parse(session.settings);
      
      // Get messages
      const messages = await db.all(
        'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp',
        id
      );
      
      // Parse JSON data for each message
      messages.forEach(message => {
        if (message.edit_history) {
          message.edit_history = JSON.parse(message.edit_history);
        }
        if (message.regeneration_history) {
          message.regeneration_history = JSON.parse(message.regeneration_history);
        }
        if (message.metadata) {
          message.metadata = JSON.parse(message.metadata);
        }
      });
      
      return { success: true, session: { ...session, messages } };
    } catch (error) {
      console.error('Error getting chat session with messages:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Create chat session
  ipcMain.handle('chat-session:create', async (_, session: any) => {
    try {
      const db = getDatabase();
      const id = uuidv4();
      
      await db.run(
        `INSERT INTO chat_sessions (
          id, title, series, protagonist_id, lorebook_id, settings,
          created_at, modified_at, is_favorite, folder
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)`,
        id,
        session.title,
        session.series,
        session.protagonist_id,
        session.lorebook_id,
        JSON.stringify(session.settings),
        session.is_favorite || 0,
        session.folder || null
      );
      
      return { success: true, id };
    } catch (error) {
      console.error('Error creating chat session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Update chat session
  ipcMain.handle('chat-session:update', async (_, id: string, session: any) => {
    try {
      const db = getDatabase();
      
      await db.run(
        `UPDATE chat_sessions SET
          title = ?, series = ?, protagonist_id = ?, lorebook_id = ?, settings = ?,
          modified_at = CURRENT_TIMESTAMP, is_favorite = ?, folder = ?
        WHERE id = ?`,
        session.title,
        session.series,
        session.protagonist_id,
        session.lorebook_id,
        JSON.stringify(session.settings),
        session.is_favorite || 0,
        session.folder || null,
        id
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating chat session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Delete chat session
  ipcMain.handle('chat-session:delete', async (_, id: string) => {
    try {
      const db = getDatabase();
      await db.run('DELETE FROM chat_sessions WHERE id = ?', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting chat session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Add message to chat session
  ipcMain.handle('chat-message:add', async (_, message: any) => {
    try {
      const db = getDatabase();
      const id = uuidv4();
      
      await db.run(
        `INSERT INTO chat_messages (
          id, session_id, type, sender_id, sender_name, content, formatted_content,
          timestamp, is_edited, edit_history, is_regenerated, regeneration_history, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)`,
        id,
        message.session_id,
        message.type,
        message.sender_id || null,
        message.sender_name,
        message.content,
        message.formatted_content || null,
        message.is_edited || 0,
        message.edit_history ? JSON.stringify(message.edit_history) : null,
        message.is_regenerated || 0,
        message.regeneration_history ? JSON.stringify(message.regeneration_history) : null,
        message.metadata ? JSON.stringify(message.metadata) : null
      );
      
      // Update the modified_at timestamp of the chat session
      await db.run(
        'UPDATE chat_sessions SET modified_at = CURRENT_TIMESTAMP WHERE id = ?',
        message.session_id
      );
      
      return { success: true, id };
    } catch (error) {
      console.error('Error adding chat message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Update message
  ipcMain.handle('chat-message:update', async (_, id: string, message: any) => {
    try {
      const db = getDatabase();
      
      // Get the current message to preserve history
      const currentMessage = await db.get('SELECT * FROM chat_messages WHERE id = ?', id);
      
      if (!currentMessage) {
        throw new Error('Message not found');
      }
      
      // Prepare edit history
      let editHistory = [];
      if (currentMessage.edit_history) {
        editHistory = JSON.parse(currentMessage.edit_history);
      }
      
      // Add current content to edit history
      editHistory.push({
        content: currentMessage.content,
        formatted_content: currentMessage.formatted_content,
        timestamp: new Date().toISOString()
      });
      
      await db.run(
        `UPDATE chat_messages SET
          content = ?, formatted_content = ?, is_edited = 1, edit_history = ?
        WHERE id = ?`,
        message.content,
        message.formatted_content || null,
        JSON.stringify(editHistory),
        id
      );
      
      // Update the modified_at timestamp of the chat session
      await db.run(
        'UPDATE chat_sessions SET modified_at = CURRENT_TIMESTAMP WHERE id = ?',
        currentMessage.session_id
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating chat message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Delete message
  ipcMain.handle('chat-message:delete', async (_, id: string) => {
    try {
      const db = getDatabase();
      
      // Get the session_id before deleting
      const message = await db.get('SELECT session_id FROM chat_messages WHERE id = ?', id);
      
      if (!message) {
        throw new Error('Message not found');
      }
      
      await db.run('DELETE FROM chat_messages WHERE id = ?', id);
      
      // Update the modified_at timestamp of the chat session
      await db.run(
        'UPDATE chat_sessions SET modified_at = CURRENT_TIMESTAMP WHERE id = ?',
        message.session_id
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting chat message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Add tool state
  ipcMain.handle('tool-state:add', async (_, toolState: any) => {
    try {
      const db = getDatabase();
      const id = uuidv4();
      
      await db.run(
        `INSERT INTO tool_states (
          id, session_id, tool_id, message_id, state, changes, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        id,
        toolState.session_id,
        toolState.tool_id,
        toolState.message_id || null,
        JSON.stringify(toolState.state),
        toolState.changes ? JSON.stringify(toolState.changes) : null
      );
      
      return { success: true, id };
    } catch (error) {
      console.error('Error adding tool state:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Get latest tool state
  ipcMain.handle('tool-state:get-latest', async (_, sessionId: string, toolId: string) => {
    try {
      const db = getDatabase();
      const toolState = await db.get(
        `SELECT * FROM tool_states
        WHERE session_id = ? AND tool_id = ?
        ORDER BY timestamp DESC
        LIMIT 1`,
        sessionId, toolId
      );
      
      if (toolState) {
        // Parse JSON data
        toolState.state = JSON.parse(toolState.state);
        if (toolState.changes) {
          toolState.changes = JSON.parse(toolState.changes);
        }
      }
      
      return { success: true, toolState };
    } catch (error) {
      console.error('Error getting latest tool state:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
}

// Theme handlers
function setupThemeHandlers(): void {
  // Get theme by ID
  ipcMain.handle('theme:get', async (_, id: string) => {
    try {
      const db = getDatabase();
      const theme = await db.get('SELECT * FROM themes WHERE id = ?', id);
      
      if (theme) {
        // Parse JSON data
        theme.data = JSON.parse(theme.data);
      }
      
      return { success: true, theme };
    } catch (error) {
      console.error('Error getting theme:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Get all themes
  ipcMain.handle('theme:get-all', async () => {
    try {
      const db = getDatabase();
      const themes = await db.all('SELECT * FROM themes ORDER BY name');
      
      // Parse JSON data for each theme
      themes.forEach(theme => {
        theme.data = JSON.parse(theme.data);
      });
      
      return { success: true, themes };
    } catch (error) {
      console.error('Error getting all themes:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Create theme
  ipcMain.handle('theme:create', async (_, theme: any) => {
    try {
      const db = getDatabase();
      const id = uuidv4();
      
      await db.run(
        `INSERT INTO themes (
          id, name, type, data, created_at, modified_at, is_favorite, is_system
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)`,
        id,
        theme.name,
        theme.type,
        JSON.stringify(theme.data),
        theme.is_favorite || 0,
        theme.is_system || 0
      );
      
      return { success: true, id };
    } catch (error) {
      console.error('Error creating theme:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Update theme
  ipcMain.handle('theme:update', async (_, id: string, theme: any) => {
    try {
      const db = getDatabase();
      
      await db.run(
        `UPDATE themes SET
          name = ?, type = ?, data = ?,
          modified_at = CURRENT_TIMESTAMP, is_favorite = ?
        WHERE id = ?`,
        theme.name,
        theme.type,
        JSON.stringify(theme.data),
        theme.is_favorite || 0,
        id
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating theme:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Delete theme
  ipcMain.handle('theme:delete', async (_, id: string) => {
    try {
      const db = getDatabase();
      
      // Check if it's a system theme
      const theme = await db.get('SELECT is_system FROM themes WHERE id = ?', id);
      
      if (theme && theme.is_system) {
        throw new Error('Cannot delete system theme');
      }
      
      await db.run('DELETE FROM themes WHERE id = ?', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting theme:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
}

// Settings handlers
function setupSettingsHandlers(): void {
  // Get setting
  ipcMain.handle('settings:get', async (_, key: string) => {
    try {
      const db = getDatabase();
      const setting = await db.get('SELECT * FROM settings WHERE key = ?', key);
      
      return { success: true, setting };
    } catch (error) {
      console.error('Error getting setting:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Get settings by category
  ipcMain.handle('settings:get-by-category', async (_, category: string) => {
    try {
      const db = getDatabase();
      const settings = await db.all(
        'SELECT * FROM settings WHERE category = ?',
        category
      );
      
      return { success: true, settings };
    } catch (error) {
      console.error('Error getting settings by category:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Set setting
  ipcMain.handle('settings:set', async (_, key: string, value: string, category: string) => {
    try {
      const db = getDatabase();
      
      // Check if setting exists
      const existingSetting = await db.get('SELECT key FROM settings WHERE key = ?', key);
      
      if (existingSetting) {
        // Update existing setting
        await db.run(
          'UPDATE settings SET value = ?, modified_at = CURRENT_TIMESTAMP WHERE key = ?',
          value, key
        );
      } else {
        // Insert new setting
        await db.run(
          'INSERT INTO settings (key, value, category, modified_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          key, value, category
        );
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error setting setting:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
}

// Series handlers
function setupSeriesHandlers(): void {
  // Get series by ID
  ipcMain.handle('series:get', async (_, id: string) => {
    try {
      const db = getDatabase();
      const series = await db.get('SELECT * FROM series WHERE id = ?', id);
      
      if (series && series.tags) {
        // Parse JSON data
        series.tags = JSON.parse(series.tags);
      }
      
      return { success: true, series };
    } catch (error) {
      console.error('Error getting series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Get all series
  ipcMain.handle('series:get-all', async () => {
    try {
      const db = getDatabase();
      const allSeries = await db.all('SELECT * FROM series ORDER BY name');
      
      // Parse JSON data for each series
      allSeries.forEach(series => {
        if (series.tags) {
          series.tags = JSON.parse(series.tags);
        }
      });
      
      return { success: true, series: allSeries };
    } catch (error) {
      console.error('Error getting all series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Create series
  ipcMain.handle('series:create', async (_, series: any) => {
    try {
      const db = getDatabase();
      const id = uuidv4();
      
      await db.run(
        `INSERT INTO series (
          id, name, description, genre, tags,
          created_at, modified_at, is_favorite, is_system
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)`,
        id,
        series.name,
        series.description || null,
        series.genre || null,
        series.tags ? JSON.stringify(series.tags) : null,
        series.is_favorite || 0,
        series.is_system || 0
      );
      
      return { success: true, id };
    } catch (error) {
      console.error('Error creating series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Update series
  ipcMain.handle('series:update', async (_, id: string, series: any) => {
    try {
      const db = getDatabase();
      
      await db.run(
        `UPDATE series SET
          name = ?, description = ?, genre = ?, tags = ?,
          modified_at = CURRENT_TIMESTAMP, is_favorite = ?
        WHERE id = ?`,
        series.name,
        series.description || null,
        series.genre || null,
        series.tags ? JSON.stringify(series.tags) : null,
        series.is_favorite || 0,
        id
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Delete series
  ipcMain.handle('series:delete', async (_, id: string) => {
    try {
      const db = getDatabase();
      
      // Check if it's a system series
      const series = await db.get('SELECT is_system FROM series WHERE id = ?', id);
      
      if (series && series.is_system) {
        throw new Error('Cannot delete system series');
      }
      
      await db.run('DELETE FROM series WHERE id = ?', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
}