// Character Types
export interface CharacterCard {
  version: string;
  type: 'character';
  metadata: {
    id: string;
    created: string;
    modified: string;
    series: string;
  };
  character: {
    name: string;
    role: 'protagonist' | 'npc' | 'antagonist';
    avatar: string;
    description: string;
    background: string;
    personality: {
      traits: string[];
      quirks: string[];
      motivations: string[];
    };
    appearance: string;
    speech_patterns: string;
    relationships: Array<{
      character_id: string;
      name: string;
      relationship: string;
      dynamics: string;
    }>;
  };
  rpg_attributes: {
    stats: Record<string, number>;
    skills: Array<{
      name: string;
      description: string;
      level: number;
    }>;
    abilities: Array<{
      name: string;
      description: string;
      effects: string;
      limitations: string;
    }>;
    inventory: Array<{
      name: string;
      description: string;
      effects: string;
    }>;
  };
  series_specific: Record<string, any>;
  narrator_guidance: {
    character_voice: string;
    narrative_role: string;
    development_arc: string;
    interaction_notes: string;
  };
  visualization: {
    portrait: string;
    full_body: string;
    expressions: Array<{
      name: string;
      image: string;
    }>;
  };
}

// Lorebook Types
export interface Lorebook {
  version: string;
  type: 'lorebook';
  metadata: {
    id: string;
    created: string;
    modified: string;
    series: string;
    title: string;
  };
  world: {
    overview: string;
    history: string;
    geography: {
      regions: Array<{
        name: string;
        description: string;
        notable_locations: Array<{
          name: string;
          description: string;
          significance: string;
        }>;
        climate: string;
        culture: string;
      }>;
      maps: Array<{
        name: string;
        description: string;
        image: string;
      }>;
    };
    factions: Array<{
      name: string;
      description: string;
      goals: string;
      notable_members: string[];
      relationships: Array<{
        faction: string;
        status: 'ally' | 'enemy' | 'neutral';
        details: string;
      }>;
    }>;
  };
  rules: {
    magic_system: {
      overview: string;
      types: Array<{
        name: string;
        description: string;
        capabilities: string;
        limitations: string;
      }>;
      acquisition: string;
      societal_view: string;
    };
    technology: {
      level: string;
      notable_tech: Array<{
        name: string;
        description: string;
        impact: string;
      }>;
    };
    social_structure: {
      overview: string;
      classes: Array<{
        name: string;
        description: string;
        privileges: string;
        limitations: string;
      }>;
      governance: string;
    };
    combat: {
      overview: string;
      systems: string;
      weapons: string;
      tactics: string;
    };
  };
  narrative_elements: {
    themes: string[];
    tone: string;
    pacing: string;
    plot_points: Array<{
      name: string;
      description: string;
      triggers: string;
      consequences: string;
    }>;
    story_arcs: Array<{
      name: string;
      description: string;
      phases: Array<{
        name: string;
        description: string;
        key_events: string[];
      }>;
    }>;
  };
  series_specific: Record<string, any>;
  narrator_guidance: {
    starting_point: string;
    key_npcs: string[];
    narrative_hooks: Array<{
      description: string;
      potential_developments: string[];
    }>;
    secrets: Array<{
      description: string;
      revelation_timing: string;
      impact: string;
    }>;
    challenge_balance: string;
    world_consistency: string;
  };
  visualization: {
    style_guide: string;
    key_visuals: Array<{
      name: string;
      description: string;
      image: string;
    }>;
    color_palette: string[];
  };
}

// Support Tool Types
export interface SupportTool {
  version: string;
  type: 'support-tool';
  metadata: {
    id: string;
    created: string;
    modified: string;
    series: string;
    title: string;
  };
  tool: {
    name: string;
    description: string;
    type: 'tracker' | 'meter' | 'log' | 'map' | 'inventory' | 'custom';
    visibility: 'player' | 'narrator' | 'both';
    update_triggers: string[];
    ui_position: 'sidebar' | 'main' | 'floating' | 'bottom';
    style: {
      theme: 'fantasy' | 'sci-fi' | 'horror' | 'custom';
      color_scheme: string[];
      icon: string;
      custom_css: string;
    };
  };
  components: Array<{
    id: string;
    type: 'numeric' | 'text' | 'progress' | 'toggle' | 'list' | 'grid' | 'custom';
    name: string;
    description: string;
    default_value: string;
    current_value: string;
    history: Array<{
      value: string;
      timestamp: string;
      cause: string;
      narrator_note: string;
    }>;
    display: {
      format: string;
      min: string;
      max: string;
      steps: string;
      options: string[];
    };
    triggers: {
      on_change: Array<{
        condition: string;
        action: string;
        target: string;
        message: string;
      }>;
      on_threshold: Array<{
        threshold: string;
        condition: 'above' | 'below' | 'equal';
        action: string;
        target: string;
        message: string;
      }>;
    };
    narrator_guidance: {
      usage: string;
      narrative_impact: string;
      update_frequency: string;
    };
  }>;
  layouts: {
    default: {
      grid: string[][];
      responsive_behavior: 'stack' | 'scroll' | 'hide';
    };
    compact: {
      grid: string[][];
      responsive_behavior: 'stack' | 'scroll' | 'hide';
    };
  };
  interactions: {
    player_permissions: {
      view: string[];
      edit: string[];
    };
    narrator_commands: Array<{
      command: string;
      description: string;
      target: string;
      action: string;
      parameters: string[];
    }>;
    api: {
      get_state: string;
      update_component: string;
      trigger_event: string;
    };
  };
  series_specific: Record<string, any>;
  narrator_guidance: {
    tool_purpose: string;
    integration_points: string;
    update_guidance: string;
    narrative_hooks: Array<{
      component: string;
      state: string;
      narrative_suggestion: string;
    }>;
  };
}

// Chat Types
export interface ChatSession {
  id: string;
  title: string;
  series: string;
  protagonist_id: string;
  lorebook_id: string;
  created_at: string;
  modified_at: string;
  is_favorite: boolean;
  folder: string | null;
  settings: {
    model: string;
    temperature: number;
    max_tokens: number;
    narrator_prompt: string;
    system_prompt: string;
    theme_id: string | null;
  };
}

export interface ChatMessage {
  id: string;
  session_id: string;
  type: 'system' | 'narrator' | 'protagonist' | 'npc' | 'ooc';
  sender_id: string | null;
  sender_name: string;
  content: string;
  formatted_content: string | null;
  timestamp: string;
  is_edited: boolean;
  edit_history: Array<{
    content: string;
    formatted_content: string | null;
    timestamp: string;
  }> | null;
  is_regenerated: boolean;
  regeneration_history: Array<{
    content: string;
    formatted_content: string | null;
    timestamp: string;
  }> | null;
  metadata: Record<string, any> | null;
}

export interface ToolState {
  id: string;
  session_id: string;
  tool_id: string;
  message_id: string | null;
  state: Record<string, any>;
  changes: Array<{
    component_id: string;
    previous_value: string;
    new_value: string;
    cause: string;
  }> | null;
  timestamp: string;
}

// Theme Types
export interface Theme {
  version: string;
  type: 'theme';
  metadata: {
    id: string;
    created: string;
    modified: string;
    name: string;
    author: string;
    description: string;
    tags: string[];
    series_compatibility: string[];
  };
  base: {
    type: 'light' | 'dark' | 'custom';
    extends: string | null;
  };
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      accent: string;
      inverse: string;
    };
    ui: {
      header: string;
      sidebar: string;
      footer: string;
      card: string;
      dialog: string;
      tooltip: string;
    };
    status: {
      info: string;
      success: string;
      warning: string;
      error: string;
    };
    chat: {
      narrator: {
        background: string;
        text: string;
        border: string;
      };
      protagonist: {
        background: string;
        text: string;
        border: string;
      };
      npc: {
        background: string;
        text: string;
        border: string;
      };
      system: {
        background: string;
        text: string;
        border: string;
      };
      ooc: {
        background: string;
        text: string;
        border: string;
      };
    };
    tools: {
      background: string;
      border: string;
      header: string;
      component: {
        background: string;
        border: string;
        text: string;
      };
    };
    gradients: {
      primary: {
        colors: string[];
        direction: string;
      };
      secondary: {
        colors: string[];
        direction: string;
      };
    };
  };
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
      monospace: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: number;
      regular: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  borders: {
    radius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    width: {
      thin: string;
      medium: string;
      thick: string;
    };
    style: {
      solid: string;
      dashed: string;
      dotted: string;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    timing: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
      linear: string;
    };
    transitions: {
      default: string;
      fast: string;
      slow: string;
    };
    keyframes: Record<string, Record<string, Record<string, string>>>;
  };
  components: {
    button: {
      primary: {
        background: string;
        text: string;
        border: string;
        hover: {
          background: string;
          text: string;
          border: string;
        };
        active: {
          background: string;
          text: string;
          border: string;
        };
        disabled: {
          background: string;
          text: string;
          border: string;
        };
      };
      secondary: {
        background: string;
        text: string;
        border: string;
        hover: {
          background: string;
          text: string;
          border: string;
        };
        active: {
          background: string;
          text: string;
          border: string;
        };
        disabled: {
          background: string;
          text: string;
          border: string;
        };
      };
    };
    input: {
      background: string;
      text: string;
      border: string;
      placeholder: string;
      focus: {
        background: string;
        text: string;
        border: string;
      };
      disabled: {
        background: string;
        text: string;
        border: string;
      };
    };
    card: {
      background: string;
      text: string;
      border: string;
      header: {
        background: string;
        text: string;
      };
      footer: {
        background: string;
        text: string;
      };
    };
    dialog: {
      background: string;
      text: string;
      border: string;
      overlay: string;
    };
    tooltip: {
      background: string;
      text: string;
      border: string;
    };
    tabs: {
      background: string;
      text: string;
      active: {
        background: string;
        text: string;
        border: string;
      };
      hover: {
        background: string;
        text: string;
      };
    };
  };
  layouts: {
    chat: {
      messageSpacing: string;
      avatarSize: string;
      maxWidth: string;
      bubbleStyle: 'rounded' | 'angular' | 'custom';
      timestampPosition: 'inline' | 'above' | 'below';
    };
    sidebar: {
      width: string;
      collapsedWidth: string;
    };
    header: {
      height: string;
    };
    footer: {
      height: string;
    };
    tools: {
      width: string;
      collapsedWidth: string;
      position: 'right' | 'left' | 'bottom';
    };
  };
  assets: {
    backgrounds: {
      main: string;
      chat: string;
      sidebar: string;
    };
    icons: {
      logo: string;
      favicon: string;
      custom: Record<string, string>;
    };
    sounds: {
      notification: string;
      message: string;
      error: string;
    };
  };
  customCSS: string;
}

// Series Types
export interface Series {
  id: string;
  name: string;
  description: string | null;
  genre: string | null;
  tags: string[] | null;
  created_at: string;
  modified_at: string;
  is_favorite: boolean;
  is_system: boolean;
}

// API Types
export interface GeminiConfig {
  model: 'gemini-pro' | 'gemini-pro-vision';
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
  stopSequences: string[];
  safetySettings: Array<{
    category: string;
    threshold: string;
  }>;
}

export interface OpenRouterConfig {
  model: string;
  temperature: number;
  top_p: number;
  top_k: number;
  max_tokens: number;
  stop: string[];
}

// Window API Types
declare global {
  interface Window {
    api: {
      getPath: (name: string) => Promise<string>;
      
      apiKey: {
        save: (service: string, apiKey: string) => Promise<{ success: boolean; error?: string }>;
        exists: (service: string) => Promise<{ success: boolean; exists: boolean; error?: string }>;
        delete: (service: string) => Promise<{ success: boolean; error?: string }>;
      };
      
      gemini: {
        generate: (prompt: string, context: string, config: GeminiConfig) => 
          Promise<{ success: boolean; response: string; error?: string }>;
        generateWithHistory: (history: any[], newPrompt: string, config: GeminiConfig) => 
          Promise<{ success: boolean; response: string; error?: string }>;
      };
      
      openRouter: {
        getModels: () => Promise<{ success: boolean; models: any[]; error?: string }>;
        generate: (prompt: string, context: string, config: OpenRouterConfig) => 
          Promise<{ success: boolean; response: string; error?: string }>;
        generateWithHistory: (history: any[], newPrompt: string, config: OpenRouterConfig) => 
          Promise<{ success: boolean; content: string; updatedHistory: any[]; error?: string }>;
      };
      
      character: {
        get: (id: string) => Promise<{ success: boolean; character: any; error?: string }>;
        getBySeries: (series: string) => Promise<{ success: boolean; characters: any[]; error?: string }>;
        create: (character: any) => Promise<{ success: boolean; id: string; error?: string }>;
        update: (id: string, character: any) => Promise<{ success: boolean; error?: string }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
        search: (query: string) => Promise<{ success: boolean; characters: any[]; error?: string }>;
      };
      
      lorebook: {
        get: (id: string) => Promise<{ success: boolean; lorebook: any; error?: string }>;
        getBySeries: (series: string) => Promise<{ success: boolean; lorebooks: any[]; error?: string }>;
        create: (lorebook: any) => Promise<{ success: boolean; id: string; error?: string }>;
        update: (id: string, lorebook: any) => Promise<{ success: boolean; error?: string }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
        search: (query: string) => Promise<{ success: boolean; lorebooks: any[]; error?: string }>;
      };
      
      supportTool: {
        get: (id: string) => Promise<{ success: boolean; tool: any; error?: string }>;
        getBySeries: (series: string) => Promise<{ success: boolean; tools: any[]; error?: string }>;
        create: (tool: any) => Promise<{ success: boolean; id: string; error?: string }>;
        update: (id: string, tool: any) => Promise<{ success: boolean; error?: string }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
      };
      
      chatSession: {
        get: (id: string) => Promise<{ success: boolean; session: any; error?: string }>;
        getWithMessages: (id: string) => Promise<{ success: boolean; session: any; error?: string }>;
        create: (session: any) => Promise<{ success: boolean; id: string; error?: string }>;
        update: (id: string, session: any) => Promise<{ success: boolean; error?: string }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
      };
      
      chatMessage: {
        add: (message: any) => Promise<{ success: boolean; id: string; error?: string }>;
        update: (id: string, message: any) => Promise<{ success: boolean; error?: string }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
      };
      
      toolState: {
        add: (toolState: any) => Promise<{ success: boolean; id: string; error?: string }>;
        getLatest: (sessionId: string, toolId: string) => 
          Promise<{ success: boolean; toolState: any; error?: string }>;
      };
      
      theme: {
        get: (id: string) => Promise<{ success: boolean; theme: any; error?: string }>;
        getAll: () => Promise<{ success: boolean; themes: any[]; error?: string }>;
        create: (theme: any) => Promise<{ success: boolean; id: string; error?: string }>;
        update: (id: string, theme: any) => Promise<{ success: boolean; error?: string }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
      };
      
      settings: {
        get: (key: string) => Promise<{ success: boolean; setting: any; error?: string }>;
        getByCategory: (category: string) => Promise<{ success: boolean; settings: any[]; error?: string }>;
        set: (key: string, value: string, category: string) => 
          Promise<{ success: boolean; error?: string }>;
      };
      
      series: {
        get: (id: string) => Promise<{ success: boolean; series: any; error?: string }>;
        getAll: () => Promise<{ success: boolean; series: any[]; error?: string }>;
        create: (series: any) => Promise<{ success: boolean; id: string; error?: string }>;
        update: (id: string, series: any) => Promise<{ success: boolean; error?: string }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
      };
    };
  }
}