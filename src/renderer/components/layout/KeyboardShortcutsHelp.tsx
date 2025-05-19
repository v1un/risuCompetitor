import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Grid,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useKeyboardShortcuts } from '../../contexts/KeyboardShortcutContext';
import { KeyboardShortcut, KeyboardShortcutCategory } from '../../../shared/types';

// Helper function to format key combination for display
const formatKeyCombination = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.metaKey) parts.push('Meta');
  
  // Format the key for display
  let key = shortcut.key;
  if (key === ' ') key = 'Space';
  else if (key.length === 1) key = key.toUpperCase();
  else if (key === 'arrowup') key = '↑';
  else if (key === 'arrowdown') key = '↓';
  else if (key === 'arrowleft') key = '←';
  else if (key === 'arrowright') key = '→';
  else if (key === 'escape') key = 'Esc';
  
  parts.push(key);
  
  return parts.join(' + ');
};

// Categories with display names
const categoryDisplayNames: Record<KeyboardShortcutCategory, string> = {
  navigation: 'Navigation',
  chat: 'Chat',
  character: 'Character',
  lorebook: 'Lorebook',
  tools: 'Tools',
  generation: 'Generation',
  ui: 'UI',
  global: 'Global',
};

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ open, onClose }) => {
  const { shortcuts } = useKeyboardShortcuts();

  // Group shortcuts by category
  const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
    if (shortcut.disabled) return acc;
    
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<KeyboardShortcutCategory, KeyboardShortcut[]>);

  // Sort categories
  const sortedCategories = Object.keys(shortcutsByCategory).sort() as KeyboardShortcutCategory[];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="keyboard-shortcuts-help-title"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Keyboard Shortcuts</Typography>
          <IconButton aria-label="close" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {sortedCategories.map((category) => (
            <Grid item xs={12} md={6} key={category}>
              <Paper variant="outlined" sx={{ height: '100%' }}>
                <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {categoryDisplayNames[category]}
                  </Typography>
                </Box>
                <Divider />
                <List dense>
                  {shortcutsByCategory[category].map((shortcut) => (
                    <ListItem key={shortcut.id}>
                      <ListItemText
                        primary={shortcut.description}
                        secondary={
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              backgroundColor: 'action.hover',
                              padding: '2px 4px',
                              borderRadius: 1,
                              display: 'inline-block'
                            }}
                          >
                            {formatKeyCombination(shortcut)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          ))}
          
          {sortedCategories.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body1" align="center" sx={{ py: 4 }}>
                No keyboard shortcuts have been defined yet.
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => {
            onClose();
            window.location.href = '/settings';
          }}
        >
          Customize Shortcuts
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;