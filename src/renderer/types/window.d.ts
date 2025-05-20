interface Window {
  api: {
    // App
    getPath: (name: string) => Promise<string>;
    
    // API Keys
    apiKey: {
      save: (service: string, apiKey: string) => Promise<{ success: boolean; error?: string }>;
      exists: (service: string) => Promise<{ success: boolean; exists: boolean; error?: string }>;
      delete: (service: string) => Promise<{ success: boolean; error?: string }>;
    };
    
    // Gemini API
    gemini: {
      generate: (prompt: string, context: string, config: any) => Promise<any>;
      generateWithHistory: (history: any[], newPrompt: string, config: any) => Promise<any>;
    };
    
    // OpenRouter API
    openRouter: {
      getModels: () => Promise<any>;
      generate: (prompt: string, context: string, config: any) => Promise<any>;
      generateWithHistory: (history: any[], newPrompt: string, config: any) => Promise<any>;
    };
    
    // Character
    character: {
      get: (id: string) => Promise<any>;
      getBySeries: (series: string) => Promise<any>;
      create: (character: any) => Promise<any>;
      update: (id: string, character: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
      search: (query: string) => Promise<any>;
    };
    
    // Lorebook
    lorebook: {
      get: (id: string) => Promise<any>;
      getBySeries: (series: string) => Promise<any>;
      create: (lorebook: any) => Promise<any>;
      update: (id: string, lorebook: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
      search: (query: string) => Promise<any>;
    };
    
    // Support Tool
    supportTool: {
      get: (id: string) => Promise<any>;
      getBySeries: (series: string) => Promise<any>;
      create: (tool: any) => Promise<any>;
      update: (id: string, tool: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    // Chat Session
    chatSession: {
      get: (id: string) => Promise<any>;
      getWithMessages: (id: string) => Promise<any>;
      create: (session: any) => Promise<any>;
      update: (id: string, session: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    // Chat Message
    chatMessage: {
      add: (message: any) => Promise<any>;
      update: (id: string, message: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    // Tool State
    toolState: {
      add: (toolState: any) => Promise<any>;
      getLatest: (sessionId: string, toolId: string) => Promise<any>;
    };
    
    // Theme
    theme: {
      get: (id: string) => Promise<any>;
      getAll: () => Promise<any>;
      create: (theme: any) => Promise<any>;
      update: (id: string, theme: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    // Settings
    settings: {
      get: (key: string) => Promise<any>;
      getByCategory: (category: string) => Promise<any>;
      set: (key: string, value: string, category: string) => Promise<any>;
    };
    
    // Series
    series: {
      get: (id: string) => Promise<any>;
      getAll: () => Promise<any>;
      create: (series: any) => Promise<any>;
      update: (id: string, series: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    // Inventory and Items
    inventory: {
      getItems: () => Promise<{ success: boolean; items: Record<string, any>; error?: string }>;
      getLootTables: () => Promise<{ success: boolean; lootTables: Record<string, any>; error?: string }>;
      getInventory: (characterId: string) => Promise<{ success: boolean; inventory: any; error?: string }>;
      saveInventory: (inventory: any) => Promise<{ success: boolean; error?: string }>;
    };
    
    // AI Generation
    ai: {
      generateCharacter: (series: string, role: string, additionalInfo?: string) => Promise<any>;
      generateLorebook: (series: string, additionalInfo?: string) => Promise<any>;
      generateSupportTool: (series: string, toolType: string, additionalInfo?: string) => Promise<any>;
      generateNarratorResponse: (sessionId: string, messages: any[], context: any) => Promise<any>;
    };
  };
}