# Database Schema

This document outlines the SQLite database schema for our Local-First Immersive RPG AI Storytelling Platform.

## Overview

The application uses SQLite for local storage of all user data, including character cards, lorebooks, chat logs, support tools, and application settings. The schema is designed to support the proprietary data formats defined in our specifications.

## Tables

### Characters

Stores character cards for protagonists and NPCs.

```sql
CREATE TABLE characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('protagonist', 'npc', 'antagonist')),
    series TEXT NOT NULL,
    data TEXT NOT NULL,  -- JSON data following our character card format
    avatar BLOB,         -- Base64 encoded image data
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN NOT NULL DEFAULT 0,
    folder TEXT
);

CREATE INDEX idx_characters_series ON characters(series);
CREATE INDEX idx_characters_role ON characters(role);
CREATE INDEX idx_characters_folder ON characters(folder);
```

### Lorebooks

Stores lorebooks for different series.

```sql
CREATE TABLE lorebooks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    series TEXT NOT NULL,
    data TEXT NOT NULL,  -- JSON data following our lorebook format
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN NOT NULL DEFAULT 0,
    folder TEXT
);

CREATE INDEX idx_lorebooks_series ON lorebooks(series);
CREATE INDEX idx_lorebooks_folder ON lorebooks(folder);
```

### Support Tools

Stores support tool definitions.

```sql
CREATE TABLE support_tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    series TEXT NOT NULL,
    data TEXT NOT NULL,  -- JSON data following our support tool format
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN NOT NULL DEFAULT 0,
    folder TEXT
);

CREATE INDEX idx_support_tools_series ON support_tools(series);
CREATE INDEX idx_support_tools_type ON support_tools(type);
CREATE INDEX idx_support_tools_folder ON support_tools(folder);
```

### Chat Sessions

Stores metadata about chat sessions.

```sql
CREATE TABLE chat_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    series TEXT NOT NULL,
    protagonist_id TEXT NOT NULL,
    lorebook_id TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN NOT NULL DEFAULT 0,
    folder TEXT,
    settings TEXT NOT NULL,  -- JSON data with session settings
    FOREIGN KEY (protagonist_id) REFERENCES characters(id),
    FOREIGN KEY (lorebook_id) REFERENCES lorebooks(id)
);

CREATE INDEX idx_chat_sessions_series ON chat_sessions(series);
CREATE INDEX idx_chat_sessions_protagonist_id ON chat_sessions(protagonist_id);
CREATE INDEX idx_chat_sessions_folder ON chat_sessions(folder);
```

### Chat Messages

Stores individual messages in chat sessions.

```sql
CREATE TABLE chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('system', 'narrator', 'protagonist', 'npc', 'ooc')),
    sender_id TEXT,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    formatted_content TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_edited BOOLEAN NOT NULL DEFAULT 0,
    edit_history TEXT,  -- JSON array of previous versions
    is_regenerated BOOLEAN NOT NULL DEFAULT 0,
    regeneration_history TEXT,  -- JSON array of previous generations
    metadata TEXT,  -- JSON data with additional metadata
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES characters(id) ON DELETE SET NULL
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_chat_messages_type ON chat_messages(type);
```

### Tool States

Stores the state of support tools at different points in a chat session.

```sql
CREATE TABLE tool_states (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    tool_id TEXT NOT NULL,
    message_id TEXT,
    state TEXT NOT NULL,  -- JSON data with tool state
    changes TEXT,  -- JSON data with changes since last state
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES support_tools(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE SET NULL
);

CREATE INDEX idx_tool_states_session_id ON tool_states(session_id);
CREATE INDEX idx_tool_states_tool_id ON tool_states(tool_id);
CREATE INDEX idx_tool_states_message_id ON tool_states(message_id);
CREATE INDEX idx_tool_states_timestamp ON tool_states(timestamp);
```

### Session Tools

Maps support tools to chat sessions.

```sql
CREATE TABLE session_tools (
    session_id TEXT NOT NULL,
    tool_id TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    ui_position TEXT NOT NULL DEFAULT 'sidebar',
    PRIMARY KEY (session_id, tool_id),
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES support_tools(id) ON DELETE CASCADE
);

CREATE INDEX idx_session_tools_session_id ON session_tools(session_id);
CREATE INDEX idx_session_tools_tool_id ON session_tools(tool_id);
```

### Bookmarks

Stores user-created bookmarks in chat sessions.

```sql
CREATE TABLE bookmarks (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    message_id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
);

CREATE INDEX idx_bookmarks_session_id ON bookmarks(session_id);
CREATE INDEX idx_bookmarks_message_id ON bookmarks(message_id);
```

### Bookmark Tool States

Maps tool states to bookmarks.

```sql
CREATE TABLE bookmark_tool_states (
    bookmark_id TEXT NOT NULL,
    tool_state_id TEXT NOT NULL,
    PRIMARY KEY (bookmark_id, tool_state_id),
    FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
    FOREIGN KEY (tool_state_id) REFERENCES tool_states(id) ON DELETE CASCADE
);

CREATE INDEX idx_bookmark_tool_states_bookmark_id ON bookmark_tool_states(bookmark_id);
CREATE INDEX idx_bookmark_tool_states_tool_state_id ON bookmark_tool_states(tool_state_id);
```

### Narrative Markers

Stores markers for significant points in the narrative.

```sql
CREATE TABLE narrative_markers (
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

CREATE INDEX idx_narrative_markers_session_id ON narrative_markers(session_id);
CREATE INDEX idx_narrative_markers_message_id ON narrative_markers(message_id);
CREATE INDEX idx_narrative_markers_type ON narrative_markers(type);
```

### Themes

Stores custom themes.

```sql
CREATE TABLE themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('light', 'dark', 'custom')),
    data TEXT NOT NULL,  -- JSON data following our theme format
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN NOT NULL DEFAULT 0,
    is_system BOOLEAN NOT NULL DEFAULT 0
);

CREATE INDEX idx_themes_type ON themes(type);
```

### Settings

Stores application settings.

```sql
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    category TEXT NOT NULL,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_category ON settings(category);
```

### Folders

Stores folder structure for organizing items.

```sql
CREATE TABLE folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,
    type TEXT NOT NULL CHECK (type IN ('character', 'lorebook', 'chat', 'tool')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_folders_type ON folders(type);
```

### Series

Stores information about different series.

```sql
CREATE TABLE series (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    tags TEXT,  -- JSON array of tags
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN NOT NULL DEFAULT 0,
    is_system BOOLEAN NOT NULL DEFAULT 0
);

CREATE INDEX idx_series_genre ON series(genre);
```

### API Keys

Stores encrypted API keys.

```sql
CREATE TABLE api_keys (
    service TEXT PRIMARY KEY,
    encrypted_key BLOB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Data Access Layer

The application uses a data access layer to interact with the database. Here's an example of how the data access layer might be implemented:

```typescript
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { app } from 'electron';

class DatabaseService {
  private db: Database | null = null;
  
  async initialize(): Promise<void> {
    const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
    
    this.db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Enable foreign keys
    await this.db.exec('PRAGMA foreign_keys = ON');
    
    // Create tables if they don't exist
    await this.createTables();
  }
  
  private async createTables(): Promise<void> {
    // Implementation of table creation SQL statements
    // ...
  }
  
  // Character methods
  async getCharacter(id: string): Promise<any> {
    return this.db?.get('SELECT * FROM characters WHERE id = ?', id);
  }
  
  async createCharacter(character: any): Promise<string> {
    const id = uuidv4();
    await this.db?.run(
      'INSERT INTO characters (id, name, role, series, data, avatar, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      id, character.name, character.role, character.series, JSON.stringify(character.data), character.avatar
    );
    return id;
  }
  
  async updateCharacter(id: string, character: any): Promise<void> {
    await this.db?.run(
      'UPDATE characters SET name = ?, role = ?, series = ?, data = ?, avatar = ?, modified_at = CURRENT_TIMESTAMP WHERE id = ?',
      character.name, character.role, character.series, JSON.stringify(character.data), character.avatar, id
    );
  }
  
  async deleteCharacter(id: string): Promise<void> {
    await this.db?.run('DELETE FROM characters WHERE id = ?', id);
  }
  
  async getCharactersBySeries(series: string): Promise<any[]> {
    return this.db?.all('SELECT * FROM characters WHERE series = ? ORDER BY name', series) || [];
  }
  
  // Similar methods for other entities
  // ...
  
  // Transaction support
  async transaction<T>(callback: (db: Database) => Promise<T>): Promise<T> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.exec('BEGIN TRANSACTION');
    
    try {
      const result = await callback(this.db);
      await this.db.exec('COMMIT');
      return result;
    } catch (error) {
      await this.db.exec('ROLLBACK');
      throw error;
    }
  }
  
  // Close the database connection
  async close(): Promise<void> {
    await this.db?.close();
    this.db = null;
  }
}

export const databaseService = new DatabaseService();
```

## Migrations

The application supports database migrations for schema updates:

```typescript
interface Migration {
  version: number;
  up: (db: Database) => Promise<void>;
  down: (db: Database) => Promise<void>;
}

class MigrationService {
  private migrations: Migration[] = [];
  
  constructor(private db: Database) {}
  
  registerMigration(migration: Migration): void {
    this.migrations.push(migration);
    // Sort migrations by version
    this.migrations.sort((a, b) => a.version - b.version);
  }
  
  async getCurrentVersion(): Promise<number> {
    // Create migrations table if it doesn't exist
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await this.db.get('SELECT MAX(version) as version FROM migrations');
    return result?.version || 0;
  }
  
  async migrateToLatest(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const pendingMigrations = this.migrations.filter(m => m.version > currentVersion);
    
    for (const migration of pendingMigrations) {
      await this.db.exec('BEGIN TRANSACTION');
      
      try {
        await migration.up(this.db);
        await this.db.run('INSERT INTO migrations (version) VALUES (?)', migration.version);
        await this.db.exec('COMMIT');
        
        console.log(`Applied migration ${migration.version}`);
      } catch (error) {
        await this.db.exec('ROLLBACK');
        console.error(`Migration ${migration.version} failed:`, error);
        throw error;
      }
    }
  }
  
  async rollback(targetVersion: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const migrationsToRollback = this.migrations
      .filter(m => m.version <= currentVersion && m.version > targetVersion)
      .sort((a, b) => b.version - a.version); // Reverse order for rollback
    
    for (const migration of migrationsToRollback) {
      await this.db.exec('BEGIN TRANSACTION');
      
      try {
        await migration.down(this.db);
        await this.db.run('DELETE FROM migrations WHERE version = ?', migration.version);
        await this.db.exec('COMMIT');
        
        console.log(`Rolled back migration ${migration.version}`);
      } catch (error) {
        await this.db.exec('ROLLBACK');
        console.error(`Rollback of migration ${migration.version} failed:`, error);
        throw error;
      }
    }
  }
}
```

## Example Queries

### Get a chat session with its messages

```typescript
async function getChatSessionWithMessages(sessionId: string): Promise<any> {
  const session = await db.get('SELECT * FROM chat_sessions WHERE id = ?', sessionId);
  
  if (!session) return null;
  
  const messages = await db.all('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp', sessionId);
  
  return {
    ...session,
    messages
  };
}
```

### Get active tools for a session with their latest states

```typescript
async function getSessionToolsWithStates(sessionId: string): Promise<any[]> {
  const tools = await db.all(`
    SELECT st.*, t.name, t.type, t.data
    FROM session_tools st
    JOIN support_tools t ON st.tool_id = t.id
    WHERE st.session_id = ? AND st.is_active = 1
  `, sessionId);
  
  const toolsWithStates = [];
  
  for (const tool of tools) {
    const latestState = await db.get(`
      SELECT * FROM tool_states
      WHERE session_id = ? AND tool_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `, sessionId, tool.tool_id);
    
    toolsWithStates.push({
      ...tool,
      currentState: latestState ? JSON.parse(latestState.state) : null
    });
  }
  
  return toolsWithStates;
}
```

### Search characters by name or description

```typescript
async function searchCharacters(query: string): Promise<any[]> {
  return db.all(`
    SELECT * FROM characters
    WHERE name LIKE ? OR data LIKE ?
    ORDER BY name
  `, `%${query}%`, `%${query}%`);
}
```

### Get bookmarks with associated tool states

```typescript
async function getBookmarksWithToolStates(sessionId: string): Promise<any[]> {
  const bookmarks = await db.all(`
    SELECT b.*, m.content as message_content
    FROM bookmarks b
    JOIN chat_messages m ON b.message_id = m.id
    WHERE b.session_id = ?
    ORDER BY b.timestamp
  `, sessionId);
  
  const bookmarksWithToolStates = [];
  
  for (const bookmark of bookmarks) {
    const toolStates = await db.all(`
      SELECT ts.*
      FROM bookmark_tool_states bts
      JOIN tool_states ts ON bts.tool_state_id = ts.id
      WHERE bts.bookmark_id = ?
    `, bookmark.id);
    
    bookmarksWithToolStates.push({
      ...bookmark,
      toolStates
    });
  }
  
  return bookmarksWithToolStates;
}
```