import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { 
  KeyboardShortcut, 
  KeyboardShortcutContextValue, 
  KeyboardShortcutCategory,
  KeyCombination
} from '../../shared/types';

// Create the context with a default value
const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue>({
  shortcuts: [],
  registerShortcut: () => {},
  unregisterShortcut: () => {},
  updateShortcut: () => {},
  getShortcutById: () => undefined,
  getShortcutsByCategory: () => [],
  isShortcutRegistered: () => false,
  disableShortcut: () => {},
  enableShortcut: () => {},
  triggerShortcut: () => {},
});

interface KeyboardShortcutProviderProps {
  children: ReactNode;
}

export const KeyboardShortcutProvider: React.FC<KeyboardShortcutProviderProps> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);

  // Register a new shortcut
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prevShortcuts => {
      // Check if shortcut with same ID already exists
      if (prevShortcuts.some(s => s.id === shortcut.id)) {
        console.warn(`Shortcut with ID "${shortcut.id}" already exists. Skipping registration.`);
        return prevShortcuts;
      }
      return [...prevShortcuts, shortcut];
    });
  }, []);

  // Unregister a shortcut by ID
  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts(prevShortcuts => prevShortcuts.filter(shortcut => shortcut.id !== id));
  }, []);

  // Update an existing shortcut
  const updateShortcut = useCallback((id: string, updatedShortcut: Partial<KeyboardShortcut>) => {
    setShortcuts(prevShortcuts => 
      prevShortcuts.map(shortcut => 
        shortcut.id === id ? { ...shortcut, ...updatedShortcut } : shortcut
      )
    );
  }, []);

  // Get a shortcut by ID
  const getShortcutById = useCallback((id: string) => {
    return shortcuts.find(shortcut => shortcut.id === id);
  }, [shortcuts]);

  // Get shortcuts by category
  const getShortcutsByCategory = useCallback((category: KeyboardShortcutCategory) => {
    return shortcuts.filter(shortcut => shortcut.category === category);
  }, [shortcuts]);

  // Check if a shortcut is registered
  const isShortcutRegistered = useCallback((id: string) => {
    return shortcuts.some(shortcut => shortcut.id === id);
  }, [shortcuts]);

  // Disable a shortcut
  const disableShortcut = useCallback((id: string) => {
    updateShortcut(id, { disabled: true });
  }, [updateShortcut]);

  // Enable a shortcut
  const enableShortcut = useCallback((id: string) => {
    updateShortcut(id, { disabled: false });
  }, [updateShortcut]);

  // Trigger a shortcut programmatically
  const triggerShortcut = useCallback((id: string) => {
    const shortcut = shortcuts.find(s => s.id === id);
    if (shortcut && !shortcut.disabled) {
      shortcut.action();
    }
  }, [shortcuts]);

  // Handle keyboard events - using useRef to avoid dependency on shortcuts
  const shortcutsRef = React.useRef(shortcuts);
  
  // Keep the ref updated with the latest shortcuts
  React.useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const keyCombination: KeyCombination = {
      key: event.key.toLowerCase(),
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
    };

    // Use the current shortcuts from ref to avoid dependency issues
    const currentShortcuts = shortcutsRef.current;
    const matchingShortcuts = currentShortcuts.filter(shortcut => {
      if (shortcut.disabled) return false;
      
      const keyMatches = shortcut.key.toLowerCase() === keyCombination.key;
      const ctrlMatches = shortcut.ctrlKey === undefined ? !keyCombination.ctrlKey : shortcut.ctrlKey === keyCombination.ctrlKey;
      const altMatches = shortcut.altKey === undefined ? !keyCombination.altKey : shortcut.altKey === keyCombination.altKey;
      const shiftMatches = shortcut.shiftKey === undefined ? !keyCombination.shiftKey : shortcut.shiftKey === keyCombination.shiftKey;
      const metaMatches = shortcut.metaKey === undefined ? !keyCombination.metaKey : shortcut.metaKey === keyCombination.metaKey;
      
      return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches;
    });

    // Execute matching shortcuts
    matchingShortcuts.forEach(shortcut => {
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      shortcut.action();
    });
  }, []); // Empty dependency array since we're using the ref for shortcuts

  // Set up and clean up event listeners
  useEffect(() => {
    // Create a stable reference to the handler
    const handler = (e: KeyboardEvent) => handleKeyDown(e);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []); // Empty dependency array since handleKeyDown has no dependencies

  const contextValue: KeyboardShortcutContextValue = {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    updateShortcut,
    getShortcutById,
    getShortcutsByCategory,
    isShortcutRegistered,
    disableShortcut,
    enableShortcut,
    triggerShortcut,
  };

  return (
    <KeyboardShortcutContext.Provider value={contextValue}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
};

// Custom hook for using the keyboard shortcut context
export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutContext);
  if (context === undefined) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutProvider');
  }
  return context;
};

// Helper hook for registering a shortcut
export const useKeyboardShortcut = (
  id: string,
  key: string,
  action: () => void,
  options: {
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
) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    const shortcut: KeyboardShortcut = {
      id,
      key,
      action,
      ...options,
    };
    
    registerShortcut(shortcut);
    
    return () => {
      unregisterShortcut(id);
    };
  }, [id, key, action, options, registerShortcut, unregisterShortcut]);
};

export default KeyboardShortcutContext;