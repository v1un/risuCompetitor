import { useEffect } from 'react';
import { useKeyboardShortcut } from '../contexts/KeyboardShortcutContext';
import { KeyboardShortcutCategory } from '../../shared/types';

/**
 * Hook to register common application shortcuts
 * @param options Configuration options for the shortcuts
 */
export const useAppShortcuts = (options: {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onFind?: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
  onNewChat?: () => void;
  onNewCharacter?: () => void;
  onNewLorebook?: () => void;
  onToggleTheme?: () => void;
  onEscape?: () => void;
  category?: KeyboardShortcutCategory;
  disabled?: boolean;
}) => {
  const {
    onSave,
    onUndo,
    onRedo,
    onFind,
    onHelp,
    onSettings,
    onNewChat,
    onNewCharacter,
    onNewLorebook,
    onToggleTheme,
    onEscape,
    category = 'global',
    disabled = false,
  } = options;

  // Register save shortcut (Ctrl+S)
  useKeyboardShortcut(
    'app-save',
    's',
    onSave || (() => {}),
    {
      ctrlKey: true,
      description: 'Save current content',
      category,
      disabled: disabled || !onSave,
    }
  );

  // Register undo shortcut (Ctrl+Z)
  useKeyboardShortcut(
    'app-undo',
    'z',
    onUndo || (() => {}),
    {
      ctrlKey: true,
      description: 'Undo last action',
      category,
      disabled: disabled || !onUndo,
    }
  );

  // Register redo shortcut (Ctrl+Y or Ctrl+Shift+Z)
  useKeyboardShortcut(
    'app-redo',
    'y',
    onRedo || (() => {}),
    {
      ctrlKey: true,
      description: 'Redo last undone action',
      category,
      disabled: disabled || !onRedo,
    }
  );

  // Register alternative redo shortcut (Ctrl+Shift+Z)
  useKeyboardShortcut(
    'app-redo-alt',
    'z',
    onRedo || (() => {}),
    {
      ctrlKey: true,
      shiftKey: true,
      description: 'Redo last undone action',
      category,
      disabled: disabled || !onRedo,
    }
  );

  // Register find shortcut (Ctrl+F)
  useKeyboardShortcut(
    'app-find',
    'f',
    onFind || (() => {}),
    {
      ctrlKey: true,
      description: 'Find in current content',
      category,
      disabled: disabled || !onFind,
    }
  );

  // Register help shortcut (F1)
  useKeyboardShortcut(
    'app-help',
    'F1',
    onHelp || (() => {}),
    {
      description: 'Show help',
      category,
      disabled: disabled || !onHelp,
    }
  );

  // Register settings shortcut (Ctrl+,)
  useKeyboardShortcut(
    'app-settings',
    ',',
    onSettings || (() => {}),
    {
      ctrlKey: true,
      description: 'Open settings',
      category,
      disabled: disabled || !onSettings,
    }
  );

  // Register new chat shortcut (Ctrl+N)
  useKeyboardShortcut(
    'app-new-chat',
    'n',
    onNewChat || (() => {}),
    {
      ctrlKey: true,
      description: 'Start new chat',
      category,
      disabled: disabled || !onNewChat,
    }
  );

  // Register new character shortcut (Ctrl+Shift+C)
  useKeyboardShortcut(
    'app-new-character',
    'c',
    onNewCharacter || (() => {}),
    {
      ctrlKey: true,
      shiftKey: true,
      description: 'Create new character',
      category,
      disabled: disabled || !onNewCharacter,
    }
  );

  // Register new lorebook shortcut (Ctrl+Shift+L)
  useKeyboardShortcut(
    'app-new-lorebook',
    'l',
    onNewLorebook || (() => {}),
    {
      ctrlKey: true,
      shiftKey: true,
      description: 'Create new lorebook',
      category,
      disabled: disabled || !onNewLorebook,
    }
  );

  // Register toggle theme shortcut (Ctrl+Shift+T)
  useKeyboardShortcut(
    'app-toggle-theme',
    't',
    onToggleTheme || (() => {}),
    {
      ctrlKey: true,
      shiftKey: true,
      description: 'Toggle light/dark theme',
      category,
      disabled: disabled || !onToggleTheme,
    }
  );

  // Register escape shortcut (Esc)
  useKeyboardShortcut(
    'app-escape',
    'Escape',
    onEscape || (() => {}),
    {
      description: 'Cancel current action',
      category,
      disabled: disabled || !onEscape,
    }
  );

  return {};
};

/**
 * Hook to register chat-specific shortcuts
 */
export const useChatShortcuts = (options: {
  onSend?: () => void;
  onClear?: () => void;
  onRegenerate?: () => void;
  onToggleTools?: () => void;
  disabled?: boolean;
}) => {
  const {
    onSend,
    onClear,
    onRegenerate,
    onToggleTools,
    disabled = false,
  } = options;

  // Register send message shortcut (Ctrl+Enter)
  useKeyboardShortcut(
    'chat-send',
    'Enter',
    onSend || (() => {}),
    {
      ctrlKey: true,
      description: 'Send message',
      category: 'chat',
      disabled: disabled || !onSend,
    }
  );

  // Register clear chat shortcut (Ctrl+Shift+Delete)
  useKeyboardShortcut(
    'chat-clear',
    'Delete',
    onClear || (() => {}),
    {
      ctrlKey: true,
      shiftKey: true,
      description: 'Clear chat',
      category: 'chat',
      disabled: disabled || !onClear,
    }
  );

  // Register regenerate response shortcut (Ctrl+R)
  useKeyboardShortcut(
    'chat-regenerate',
    'r',
    onRegenerate || (() => {}),
    {
      ctrlKey: true,
      description: 'Regenerate last response',
      category: 'chat',
      disabled: disabled || !onRegenerate,
    }
  );

  // Register toggle tools shortcut (Ctrl+T)
  useKeyboardShortcut(
    'chat-toggle-tools',
    't',
    onToggleTools || (() => {}),
    {
      ctrlKey: true,
      description: 'Toggle tools panel',
      category: 'chat',
      disabled: disabled || !onToggleTools,
    }
  );

  return {};
};

/**
 * Hook to register navigation shortcuts
 */
export const useNavigationShortcuts = (options: {
  onNavigateHome?: () => void;
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  onNavigateCharacters?: () => void;
  onNavigateLorebooks?: () => void;
  onNavigateChats?: () => void;
  onNavigateSettings?: () => void;
  disabled?: boolean;
}) => {
  const {
    onNavigateHome,
    onNavigateBack,
    onNavigateForward,
    onNavigateCharacters,
    onNavigateLorebooks,
    onNavigateChats,
    onNavigateSettings,
    disabled = false,
  } = options;

  // Register home shortcut (Alt+H)
  useKeyboardShortcut(
    'nav-home',
    'h',
    onNavigateHome || (() => {}),
    {
      altKey: true,
      description: 'Go to home',
      category: 'navigation',
      disabled: disabled || !onNavigateHome,
    }
  );

  // Register back shortcut (Alt+Left)
  useKeyboardShortcut(
    'nav-back',
    'ArrowLeft',
    onNavigateBack || (() => {}),
    {
      altKey: true,
      description: 'Go back',
      category: 'navigation',
      disabled: disabled || !onNavigateBack,
    }
  );

  // Register forward shortcut (Alt+Right)
  useKeyboardShortcut(
    'nav-forward',
    'ArrowRight',
    onNavigateForward || (() => {}),
    {
      altKey: true,
      description: 'Go forward',
      category: 'navigation',
      disabled: disabled || !onNavigateForward,
    }
  );

  // Register characters shortcut (Alt+C)
  useKeyboardShortcut(
    'nav-characters',
    'c',
    onNavigateCharacters || (() => {}),
    {
      altKey: true,
      description: 'Go to characters',
      category: 'navigation',
      disabled: disabled || !onNavigateCharacters,
    }
  );

  // Register lorebooks shortcut (Alt+L)
  useKeyboardShortcut(
    'nav-lorebooks',
    'l',
    onNavigateLorebooks || (() => {}),
    {
      altKey: true,
      description: 'Go to lorebooks',
      category: 'navigation',
      disabled: disabled || !onNavigateLorebooks,
    }
  );

  // Register chats shortcut (Alt+M)
  useKeyboardShortcut(
    'nav-chats',
    'm',
    onNavigateChats || (() => {}),
    {
      altKey: true,
      description: 'Go to chats',
      category: 'navigation',
      disabled: disabled || !onNavigateChats,
    }
  );

  // Register settings shortcut (Alt+S)
  useKeyboardShortcut(
    'nav-settings',
    's',
    onNavigateSettings || (() => {}),
    {
      altKey: true,
      description: 'Go to settings',
      category: 'navigation',
      disabled: disabled || !onNavigateSettings,
    }
  );

  return {};
};