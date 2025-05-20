import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // App
  getPath: (name: string) => ipcRenderer.invoke('app:get-path', name),
  
  // API Keys
  apiKey: {
    save: (service: string, apiKey: string) => ipcRenderer.invoke('api-key:save', service, apiKey),
    exists: (service: string) => ipcRenderer.invoke('api-key:exists', service),
    delete: (service: string) => ipcRenderer.invoke('api-key:delete', service),
  },
  
  // Gemini API
  gemini: {
    generate: (prompt: string, context: string, config: any) => 
      ipcRenderer.invoke('gemini:generate', prompt, context, config),
    generateWithHistory: (history: any[], newPrompt: string, config: any) => 
      ipcRenderer.invoke('gemini:generate-with-history', history, newPrompt, config),
  },
  
  // OpenRouter API
  openRouter: {
    getModels: () => ipcRenderer.invoke('openrouter:get-models'),
    generate: (prompt: string, context: string, config: any) => 
      ipcRenderer.invoke('openrouter:generate', prompt, context, config),
    generateWithHistory: (history: any[], newPrompt: string, config: any) => 
      ipcRenderer.invoke('openrouter:generate-with-history', history, newPrompt, config),
  },
  
  // Character
  character: {
    get: (id: string) => ipcRenderer.invoke('character:get', id),
    getBySeries: (series: string) => ipcRenderer.invoke('character:get-by-series', series),
    create: (character: any) => ipcRenderer.invoke('character:create', character),
    update: (id: string, character: any) => ipcRenderer.invoke('character:update', id, character),
    delete: (id: string) => ipcRenderer.invoke('character:delete', id),
    search: (query: string) => ipcRenderer.invoke('character:search', query),
  },
  
  // Lorebook
  lorebook: {
    get: (id: string) => ipcRenderer.invoke('lorebook:get', id),
    getBySeries: (series: string) => ipcRenderer.invoke('lorebook:get-by-series', series),
    create: (lorebook: any) => ipcRenderer.invoke('lorebook:create', lorebook),
    update: (id: string, lorebook: any) => ipcRenderer.invoke('lorebook:update', id, lorebook),
    delete: (id: string) => ipcRenderer.invoke('lorebook:delete', id),
    search: (query: string) => ipcRenderer.invoke('lorebook:search', query),
  },
  
  // Support Tool
  supportTool: {
    get: (id: string) => ipcRenderer.invoke('support-tool:get', id),
    getBySeries: (series: string) => ipcRenderer.invoke('support-tool:get-by-series', series),
    create: (tool: any) => ipcRenderer.invoke('support-tool:create', tool),
    update: (id: string, tool: any) => ipcRenderer.invoke('support-tool:update', id, tool),
    delete: (id: string) => ipcRenderer.invoke('support-tool:delete', id),
  },
  
  // Chat Session
  chatSession: {
    get: (id: string) => ipcRenderer.invoke('chat-session:get', id),
    getWithMessages: (id: string) => ipcRenderer.invoke('chat-session:get-with-messages', id),
    create: (session: any) => ipcRenderer.invoke('chat-session:create', session),
    update: (id: string, session: any) => ipcRenderer.invoke('chat-session:update', id, session),
    delete: (id: string) => ipcRenderer.invoke('chat-session:delete', id),
  },
  
  // Chat Message
  chatMessage: {
    add: (message: any) => ipcRenderer.invoke('chat-message:add', message),
    update: (id: string, message: any) => ipcRenderer.invoke('chat-message:update', id, message),
    delete: (id: string) => ipcRenderer.invoke('chat-message:delete', id),
  },
  
  // Tool State
  toolState: {
    add: (toolState: any) => ipcRenderer.invoke('tool-state:add', toolState),
    getLatest: (sessionId: string, toolId: string) => 
      ipcRenderer.invoke('tool-state:get-latest', sessionId, toolId),
  },
  
  // Theme
  theme: {
    get: (id: string) => ipcRenderer.invoke('theme:get', id),
    getAll: () => ipcRenderer.invoke('theme:get-all'),
    create: (theme: any) => ipcRenderer.invoke('theme:create', theme),
    update: (id: string, theme: any) => ipcRenderer.invoke('theme:update', id, theme),
    delete: (id: string) => ipcRenderer.invoke('theme:delete', id),
  },
  
  // Settings
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    getByCategory: (category: string) => ipcRenderer.invoke('settings:get-by-category', category),
    set: (key: string, value: string, category: string) => 
      ipcRenderer.invoke('settings:set', key, value, category),
  },
  
  // Series
  series: {
    get: (id: string) => ipcRenderer.invoke('series:get', id),
    getAll: () => ipcRenderer.invoke('series:get-all'),
    create: (series: any) => ipcRenderer.invoke('series:create', series),
    update: (id: string, series: any) => ipcRenderer.invoke('series:update', id, series),
    delete: (id: string) => ipcRenderer.invoke('series:delete', id),
  },
  
  // Inventory and Items
  inventory: {
    getItems: () => ipcRenderer.invoke('inventory:get-items'),
    getLootTables: () => ipcRenderer.invoke('inventory:get-loot-tables'),
    getInventory: (characterId: string) => ipcRenderer.invoke('inventory:get', characterId),
    saveInventory: (inventory: any) => ipcRenderer.invoke('inventory:save', inventory),
  },
  
  // AI Generation
  ai: {
    generateCharacter: (series: string, role: string, additionalInfo?: string) => 
      ipcRenderer.invoke('ai:generate-character', series, role, additionalInfo),
    generateLorebook: (series: string, additionalInfo?: string) => 
      ipcRenderer.invoke('ai:generate-lorebook', series, additionalInfo),
    generateSupportTool: (series: string, toolType: string, additionalInfo?: string) => 
      ipcRenderer.invoke('ai:generate-support-tool', series, toolType, additionalInfo),
    generateNarratorResponse: (sessionId: string, messages: any[], context: any) => 
      ipcRenderer.invoke('ai:generate-narrator-response', sessionId, messages, context),
  },
});