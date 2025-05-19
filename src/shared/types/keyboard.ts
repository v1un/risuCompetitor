// Keyboard shortcut types
export interface KeyboardShortcut {
  id: string;
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  category: KeyboardShortcutCategory;
  action: () => void;
  disabled?: boolean;
  global?: boolean;
  preventDefault?: boolean;
}

export type KeyboardShortcutCategory = 
  | 'navigation'
  | 'chat'
  | 'character'
  | 'lorebook'
  | 'tools'
  | 'generation'
  | 'ui'
  | 'global';

export interface KeyCombination {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

export interface KeyboardShortcutContextValue {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  updateShortcut: (id: string, shortcut: Partial<KeyboardShortcut>) => void;
  getShortcutById: (id: string) => KeyboardShortcut | undefined;
  getShortcutsByCategory: (category: KeyboardShortcutCategory) => KeyboardShortcut[];
  isShortcutRegistered: (id: string) => boolean;
  disableShortcut: (id: string) => void;
  enableShortcut: (id: string) => void;
  triggerShortcut: (id: string) => void;
}

export interface KeyboardShortcutConfig {
  id: string;
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  category: KeyboardShortcutCategory;
  disabled?: boolean;
  global?: boolean;
  preventDefault?: boolean;
}