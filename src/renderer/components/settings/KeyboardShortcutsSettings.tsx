import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`shortcut-tabpanel-${index}`}
      aria-labelledby={`shortcut-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const KeyboardShortcutsSettings: React.FC = () => {
  const { 
    shortcuts, 
    registerShortcut, 
    unregisterShortcut, 
    updateShortcut,
    disableShortcut,
    enableShortcut
  } = useKeyboardShortcuts();
  
  const [open, setOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<KeyboardShortcut | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [recordingKey, setRecordingKey] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Default new shortcut
  const defaultNewShortcut: KeyboardShortcut = {
    id: '',
    key: '',
    description: '',
    category: 'global',
    action: () => {},
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    disabled: false,
    global: false,
    preventDefault: true,
  };
  
  // Get categories from shortcuts
  const categories = Array.from(
    new Set(shortcuts.map(shortcut => shortcut.category))
  ).sort() as KeyboardShortcutCategory[];
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };
  
  // Open dialog to add new shortcut
  const handleAddShortcut = () => {
    setEditingShortcut({ ...defaultNewShortcut, id: `shortcut-${Date.now()}` });
    setIsEditing(false);
    setOpen(true);
  };
  
  // Open dialog to edit existing shortcut
  const handleEditShortcut = (shortcut: KeyboardShortcut) => {
    setEditingShortcut({ ...shortcut });
    setIsEditing(true);
    setOpen(true);
  };
  
  // Delete a shortcut
  const handleDeleteShortcut = (id: string) => {
    unregisterShortcut(id);
  };
  
  // Toggle shortcut enabled/disabled state
  const handleToggleShortcut = (id: string, disabled: boolean) => {
    if (disabled) {
      enableShortcut(id);
    } else {
      disableShortcut(id);
    }
  };
  
  // Close the dialog
  const handleClose = () => {
    setOpen(false);
    setEditingShortcut(null);
    setRecordingKey(false);
    setError(null);
  };
  
  // Start recording a key combination
  const handleStartRecording = () => {
    setRecordingKey(true);
  };
  
  // Handle key recording
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!recordingKey || !editingShortcut) return;
    
    e.preventDefault();
    
    // Ignore modifier keys when pressed alone
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      return;
    }
    
    setEditingShortcut({
      ...editingShortcut,
      key: e.key.toLowerCase(),
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      shiftKey: e.shiftKey,
      metaKey: e.metaKey,
    });
    
    setRecordingKey(false);
  }, [recordingKey, editingShortcut]);
  
  // Save the shortcut
  const handleSave = () => {
    if (!editingShortcut) return;
    
    // Validate shortcut
    if (!editingShortcut.key) {
      setError('Key is required');
      return;
    }
    
    if (!editingShortcut.description) {
      setError('Description is required');
      return;
    }
    
    // Check for duplicate shortcuts
    const duplicateShortcut = shortcuts.find(s => 
      s.id !== editingShortcut.id &&
      s.key.toLowerCase() === editingShortcut.key.toLowerCase() &&
      s.ctrlKey === editingShortcut.ctrlKey &&
      s.altKey === editingShortcut.altKey &&
      s.shiftKey === editingShortcut.shiftKey &&
      s.metaKey === editingShortcut.metaKey
    );
    
    if (duplicateShortcut) {
      setError(`This key combination is already used by "${duplicateShortcut.description}"`);
      return;
    }
    
    // Create a dummy action for now - in a real app, this would be handled differently
    const shortcutWithAction: KeyboardShortcut = {
      ...editingShortcut,
      action: () => {
        console.log(`Shortcut triggered: ${editingShortcut.description}`);
      }
    };
    
    if (isEditing) {
      updateShortcut(editingShortcut.id, shortcutWithAction);
    } else {
      registerShortcut(shortcutWithAction);
    }
    
    handleClose();
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Keyboard Shortcuts
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddShortcut}
        >
          Add Shortcut
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            aria-label="keyboard shortcut categories"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All" id="shortcut-tab-0" aria-controls="shortcut-tabpanel-0" />
            {categories.map((category, index) => (
              <Tab 
                key={category} 
                label={categoryDisplayNames[category]} 
                id={`shortcut-tab-${index + 1}`}
                aria-controls={`shortcut-tabpanel-${index + 1}`}
              />
            ))}
          </Tabs>
        </Box>
        
        <TabPanel value={currentTab} index={0}>
          <TableContainer>
            <Table aria-label="keyboard shortcuts table">
              <TableHead>
                <TableRow>
                  <TableCell>Shortcut</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Enabled</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shortcuts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No shortcuts defined. Click "Add Shortcut" to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  shortcuts.map((shortcut) => (
                    <TableRow key={shortcut.id}>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            backgroundColor: 'action.hover',
                            padding: '4px 8px',
                            borderRadius: 1,
                            display: 'inline-block'
                          }}
                        >
                          {formatKeyCombination(shortcut)}
                        </Typography>
                      </TableCell>
                      <TableCell>{shortcut.description}</TableCell>
                      <TableCell>{categoryDisplayNames[shortcut.category]}</TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!shortcut.disabled}
                              onChange={() => handleToggleShortcut(shortcut.id, !!shortcut.disabled)}
                              name={`enabled-${shortcut.id}`}
                            />
                          }
                          label=""
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton 
                            aria-label="edit" 
                            size="small"
                            onClick={() => handleEditShortcut(shortcut)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            aria-label="delete" 
                            size="small"
                            onClick={() => handleDeleteShortcut(shortcut.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {categories.map((category, index) => (
          <TabPanel key={category} value={currentTab} index={index + 1}>
            <TableContainer>
              <Table aria-label={`${category} shortcuts table`}>
                <TableHead>
                  <TableRow>
                    <TableCell>Shortcut</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Enabled</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shortcuts.filter(s => s.category === category).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body1" sx={{ py: 2 }}>
                          No shortcuts defined for this category.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    shortcuts
                      .filter(s => s.category === category)
                      .map((shortcut) => (
                        <TableRow key={shortcut.id}>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: 'monospace', 
                                backgroundColor: 'action.hover',
                                padding: '4px 8px',
                                borderRadius: 1,
                                display: 'inline-block'
                              }}
                            >
                              {formatKeyCombination(shortcut)}
                            </Typography>
                          </TableCell>
                          <TableCell>{shortcut.description}</TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={!shortcut.disabled}
                                  onChange={() => handleToggleShortcut(shortcut.id, !!shortcut.disabled)}
                                  name={`enabled-${shortcut.id}`}
                                />
                              }
                              label=""
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton 
                                aria-label="edit" 
                                size="small"
                                onClick={() => handleEditShortcut(shortcut)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                aria-label="delete" 
                                size="small"
                                onClick={() => handleDeleteShortcut(shortcut.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        ))}
      </Paper>
      
      {/* Dialog for adding/editing shortcuts */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        aria-labelledby="shortcut-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="shortcut-dialog-title">
          {isEditing ? 'Edit Keyboard Shortcut' : 'Add Keyboard Shortcut'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mt: 1 }}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant={recordingKey ? "contained" : "outlined"}
                color={recordingKey ? "secondary" : "primary"}
                onClick={handleStartRecording}
                onKeyDown={handleKeyDown}
                fullWidth
                sx={{ height: '56px' }}
              >
                {recordingKey 
                  ? "Press any key combination..." 
                  : editingShortcut && editingShortcut.key 
                    ? formatKeyCombination(editingShortcut)
                    : "Click to record shortcut"
                }
              </Button>
            </Box>
            
            <TextField
              margin="dense"
              id="description"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              value={editingShortcut?.description || ''}
              onChange={(e) => editingShortcut && setEditingShortcut({
                ...editingShortcut,
                description: e.target.value
              })}
              required
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                value={editingShortcut?.category || 'global'}
                label="Category"
                onChange={(e) => editingShortcut && setEditingShortcut({
                  ...editingShortcut,
                  category: e.target.value as KeyboardShortcutCategory
                })}
              >
                {Object.entries(categoryDisplayNames).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={editingShortcut?.global || false}
                  onChange={(e) => editingShortcut && setEditingShortcut({
                    ...editingShortcut,
                    global: e.target.checked
                  })}
                  name="global"
                />
              }
              label="Global (works everywhere in the application)"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={editingShortcut?.preventDefault !== false}
                  onChange={(e) => editingShortcut && setEditingShortcut({
                    ...editingShortcut,
                    preventDefault: e.target.checked
                  })}
                  name="preventDefault"
                />
              }
              label="Prevent default browser behavior"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KeyboardShortcutsSettings;