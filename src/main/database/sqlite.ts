import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let db: Database | null = null;

export async function initializeDatabase(): Promise<void> {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'database.sqlite');
  
  // Ensure the directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  
  // Open the database
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');
  
  // Create tables
  await createTables();
  
  console.log('Database initialized successfully');
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

async function createTables(): Promise<void> {
  // Characters table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('protagonist', 'npc', 'antagonist')),
      series TEXT NOT NULL,
      data TEXT NOT NULL,
      avatar BLOB,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_favorite BOOLEAN NOT NULL DEFAULT 0,
      folder TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_characters_series ON characters(series);
    CREATE INDEX IF NOT EXISTS idx_characters_role ON characters(role);
    CREATE INDEX IF NOT EXISTS idx_characters_folder ON characters(folder);
  `);
  
  // Lorebooks table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS lorebooks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      series TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_favorite BOOLEAN NOT NULL DEFAULT 0,
      folder TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_lorebooks_series ON lorebooks(series);
    CREATE INDEX IF NOT EXISTS idx_lorebooks_folder ON lorebooks(folder);
  `);
  
  // Support Tools table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS support_tools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      series TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_favorite BOOLEAN NOT NULL DEFAULT 0,
      folder TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_support_tools_series ON support_tools(series);
    CREATE INDEX IF NOT EXISTS idx_support_tools_type ON support_tools(type);
    CREATE INDEX IF NOT EXISTS idx_support_tools_folder ON support_tools(folder);
  `);
  
  // Chat Sessions table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      series TEXT NOT NULL,
      protagonist_id TEXT NOT NULL,
      lorebook_id TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_favorite BOOLEAN NOT NULL DEFAULT 0,
      folder TEXT,
      settings TEXT NOT NULL,
      FOREIGN KEY (protagonist_id) REFERENCES characters(id),
      FOREIGN KEY (lorebook_id) REFERENCES lorebooks(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_series ON chat_sessions(series);
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_protagonist_id ON chat_sessions(protagonist_id);
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_folder ON chat_sessions(folder);
  `);
  
  // Chat Messages table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('system', 'narrator', 'protagonist', 'npc', 'ooc')),
      sender_id TEXT,
      sender_name TEXT NOT NULL,
      content TEXT NOT NULL,
      formatted_content TEXT,
      timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_edited BOOLEAN NOT NULL DEFAULT 0,
      edit_history TEXT,
      is_regenerated BOOLEAN NOT NULL DEFAULT 0,
      regeneration_history TEXT,
      metadata TEXT,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES characters(id) ON DELETE SET NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(type);
  `);
  
  // Tool States table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS tool_states (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      tool_id TEXT NOT NULL,
      message_id TEXT,
      state TEXT NOT NULL,
      changes TEXT,
      timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (tool_id) REFERENCES support_tools(id) ON DELETE CASCADE,
      FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE SET NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_tool_states_session_id ON tool_states(session_id);
    CREATE INDEX IF NOT EXISTS idx_tool_states_tool_id ON tool_states(tool_id);
    CREATE INDEX IF NOT EXISTS idx_tool_states_message_id ON tool_states(message_id);
    CREATE INDEX IF NOT EXISTS idx_tool_states_timestamp ON tool_states(timestamp);
  `);
  
  // Session Tools table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS session_tools (
      session_id TEXT NOT NULL,
      tool_id TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      ui_position TEXT NOT NULL DEFAULT 'sidebar',
      PRIMARY KEY (session_id, tool_id),
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (tool_id) REFERENCES support_tools(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_session_tools_session_id ON session_tools(session_id);
    CREATE INDEX IF NOT EXISTS idx_session_tools_tool_id ON session_tools(tool_id);
  `);
  
  // Bookmarks table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      message_id TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_bookmarks_session_id ON bookmarks(session_id);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_message_id ON bookmarks(message_id);
  `);
  
  // Bookmark Tool States table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS bookmark_tool_states (
      bookmark_id TEXT NOT NULL,
      tool_state_id TEXT NOT NULL,
      PRIMARY KEY (bookmark_id, tool_state_id),
      FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
      FOREIGN KEY (tool_state_id) REFERENCES tool_states(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_bookmark_tool_states_bookmark_id ON bookmark_tool_states(bookmark_id);
    CREATE INDEX IF NOT EXISTS idx_bookmark_tool_states_tool_state_id ON bookmark_tool_states(tool_state_id);
  `);
  
  // Narrative Markers table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS narrative_markers (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('chapter', 'scene', 'event', 'decision')),
      name TEXT NOT NULL,
      description TEXT,
      message_id TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_narrative_markers_session_id ON narrative_markers(session_id);
    CREATE INDEX IF NOT EXISTS idx_narrative_markers_message_id ON narrative_markers(message_id);
    CREATE INDEX IF NOT EXISTS idx_narrative_markers_type ON narrative_markers(type);
  `);
  
  // Themes table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS themes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('light', 'dark', 'custom')),
      data TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_favorite BOOLEAN NOT NULL DEFAULT 0,
      is_system BOOLEAN NOT NULL DEFAULT 0
    );
    
    CREATE INDEX IF NOT EXISTS idx_themes_type ON themes(type);
  `);
  
  // Settings table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      category TEXT NOT NULL,
      modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
  `);
  
  // Folders table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      type TEXT NOT NULL CHECK (type IN ('character', 'lorebook', 'chat', 'tool')),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
    CREATE INDEX IF NOT EXISTS idx_folders_type ON folders(type);
  `);
  
  // Series table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS series (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      genre TEXT,
      tags TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_favorite BOOLEAN NOT NULL DEFAULT 0,
      is_system BOOLEAN NOT NULL DEFAULT 0
    );
    
    CREATE INDEX IF NOT EXISTS idx_series_genre ON series(genre);
  `);
  
  // API Keys table
  await db?.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      service TEXT PRIMARY KEY,
      encrypted_key BLOB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}