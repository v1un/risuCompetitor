/**
 * MarkdownEditor.tsx
 * Rich text editor with markdown support for character descriptions and lorebooks
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  TextField, 
  Divider, 
  IconButton, 
  Tooltip, 
  ButtonGroup,
  Button,
  Typography,
  useTheme
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Link,
  Image,
  TableChart,
  HorizontalRule,
  Undo,
  Redo,
  Visibility,
  VisibilityOff,
  Help
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  maxHeight?: number | string;
  label?: string;
  helperText?: string;
  error?: boolean;
  autoFocus?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
  minHeight = 200,
  maxHeight = 600,
  label,
  helperText,
  error = false,
  autoFocus = false,
}) => {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [selectionStart, setSelectionStart] = useState<number>(0);
  const [selectionEnd, setSelectionEnd] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  // Track timestamp of last history addition
  const [lastHistoryTimestamp, setLastHistoryTimestamp] = useState<number>(Date.now());
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const theme = useTheme();

  // Track selection changes
  const handleSelect = (e: React.SyntheticEvent) => {
    // Cast the target to HTMLTextAreaElement to access selectionStart and selectionEnd
    const target = e.target as HTMLTextAreaElement;
    if (target && 'selectionStart' in target && 'selectionEnd' in target) {
      setSelectionStart(target.selectionStart);
      setSelectionEnd(target.selectionEnd);
    }
  };

  // Add to history when content changes
  useEffect(() => {
    const lastHistoryItem = history[historyIndex];
    if (lastHistoryItem !== value) {
      // Only add to history if there's a significant change (not just a character)
      if (Math.abs(lastHistoryItem.length - value.length) > 1 || 
          Date.now() - lastHistoryTimestamp > 1000) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(value);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setLastHistoryTimestamp(Date.now());
      }
    }
  }, [value, history, historyIndex, lastHistoryTimestamp]);

  // Handle undo/redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onChange(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onChange(history[historyIndex + 1]);
    }
  };

  // Insert markdown at current selection
  const insertMarkdown = (
    before: string,
    after: string = '',
    defaultText: string = 'text'
  ) => {
    if (!textFieldRef.current) return;

    const textarea = textFieldRef.current;
    const start = selectionStart;
    const end = selectionEnd;
    const selectedText = value.substring(start, end);
    const text = selectedText || defaultText;
    
    const newValue =
      value.substring(0, start) +
      before +
      text +
      after +
      value.substring(end);
    
    onChange(newValue);
    
    // Focus and set selection after update
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + text.length + after.length;
      textarea.setSelectionRange(
        selectedText ? start + before.length : start + before.length,
        selectedText ? start + before.length + text.length : start + before.length + defaultText.length
      );
    }, 0);
  };

  // Toolbar button handlers
  const handleBold = () => insertMarkdown('**', '**', 'bold text');
  const handleItalic = () => insertMarkdown('*', '*', 'italic text');
  const handleBulletList = () => insertMarkdown('\n- ', '', 'List item');
  const handleNumberList = () => insertMarkdown('\n1. ', '', 'List item');
  const handleQuote = () => insertMarkdown('\n> ', '', 'Quoted text');
  const handleCode = () => insertMarkdown('`', '`', 'code');
  const handleCodeBlock = () => insertMarkdown('\n```\n', '\n```', 'code block');
  const handleLink = () => insertMarkdown('[', '](https://example.com)', 'link text');
  const handleImage = () => insertMarkdown('![', '](https://example.com/image.jpg)', 'alt text');
  const handleTable = () => {
    insertMarkdown(
      '\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n| Cell 4 | Cell 5 | Cell 6 |\n',
      '',
      ''
    );
  };
  const handleHorizontalRule = () => insertMarkdown('\n---\n', '', '');

  // Help dialog
  const [showHelp, setShowHelp] = useState(false);

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      {/* Editor tabs */}
      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Edit" value="edit" />
        <Tab label="Preview" value="preview" />
      </Tabs>

      {/* Toolbar (only in edit mode) */}
      {tab === 'edit' && (
        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <ButtonGroup size="small" variant="outlined">
            <Tooltip title="Bold (Ctrl+B)">
              <IconButton onClick={handleBold} size="small">
                <FormatBold fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italic (Ctrl+I)">
              <IconButton onClick={handleItalic} size="small">
                <FormatItalic fontSize="small" />
              </IconButton>
            </Tooltip>
          </ButtonGroup>

          <ButtonGroup size="small" variant="outlined">
            <Tooltip title="Bullet List">
              <IconButton onClick={handleBulletList} size="small">
                <FormatListBulleted fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Numbered List">
              <IconButton onClick={handleNumberList} size="small">
                <FormatListNumbered fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Quote">
              <IconButton onClick={handleQuote} size="small">
                <FormatQuote fontSize="small" />
              </IconButton>
            </Tooltip>
          </ButtonGroup>

          <ButtonGroup size="small" variant="outlined">
            <Tooltip title="Inline Code">
              <IconButton onClick={handleCode} size="small">
                <Code fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Code Block">
              <IconButton onClick={handleCodeBlock} size="small">
                <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  { }
                </Box>
              </IconButton>
            </Tooltip>
          </ButtonGroup>

          <ButtonGroup size="small" variant="outlined">
            <Tooltip title="Link">
              <IconButton onClick={handleLink} size="small">
                <Link fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Image">
              <IconButton onClick={handleImage} size="small">
                <Image fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Table">
              <IconButton onClick={handleTable} size="small">
                <TableChart fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Horizontal Rule">
              <IconButton onClick={handleHorizontalRule} size="small">
                <HorizontalRule fontSize="small" />
              </IconButton>
            </Tooltip>
          </ButtonGroup>

          <Box sx={{ flexGrow: 1 }} />

          <ButtonGroup size="small" variant="outlined">
            <Tooltip title="Undo (Ctrl+Z)">
              <span>
                <IconButton 
                  onClick={handleUndo} 
                  size="small" 
                  disabled={historyIndex <= 0}
                >
                  <Undo fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Redo (Ctrl+Y)">
              <span>
                <IconButton 
                  onClick={handleRedo} 
                  size="small" 
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </ButtonGroup>

          <Tooltip title="Markdown Help">
            <IconButton 
              onClick={() => setShowHelp(!showHelp)} 
              size="small" 
              color={showHelp ? "primary" : "default"}
            >
              <Help fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Help panel */}
      {showHelp && tab === 'edit' && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', backgroundColor: theme.palette.background.default }}>
          <Typography variant="subtitle2" gutterBottom>Markdown Cheat Sheet</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="caption" component="div" sx={{ fontWeight: 'bold' }}>Text Formatting</Typography>
              <Typography variant="caption" component="div">**bold**</Typography>
              <Typography variant="caption" component="div">*italic*</Typography>
              <Typography variant="caption" component="div">~~strikethrough~~</Typography>
            </Box>
            <Box>
              <Typography variant="caption" component="div" sx={{ fontWeight: 'bold' }}>Headers</Typography>
              <Typography variant="caption" component="div"># Header 1</Typography>
              <Typography variant="caption" component="div">## Header 2</Typography>
              <Typography variant="caption" component="div">### Header 3</Typography>
            </Box>
            <Box>
              <Typography variant="caption" component="div" sx={{ fontWeight: 'bold' }}>Lists</Typography>
              <Typography variant="caption" component="div">- Bullet item</Typography>
              <Typography variant="caption" component="div">1. Numbered item</Typography>
            </Box>
            <Box>
              <Typography variant="caption" component="div" sx={{ fontWeight: 'bold' }}>Links & Images</Typography>
              <Typography variant="caption" component="div">[link text](url)</Typography>
              <Typography variant="caption" component="div">![alt text](image-url)</Typography>
            </Box>
          </Box>
          <Button size="small" onClick={() => setShowHelp(false)} sx={{ mt: 1 }}>Close</Button>
        </Box>
      )}

      {/* Editor content */}
      <Box sx={{ p: 2 }}>
        {tab === 'edit' ? (
          <TextField
            inputRef={textFieldRef}
            fullWidth
            multiline
            variant="outlined"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleSelect}
            placeholder={placeholder}
            label={label}
            error={error}
            helperText={helperText}
            autoFocus={autoFocus}
            InputProps={{
              sx: {
                fontFamily: 'monospace',
                minHeight,
                maxHeight,
                overflow: 'auto',
              },
            }}
            onKeyDown={(e) => {
              // Handle keyboard shortcuts
              if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                  case 'b':
                    e.preventDefault();
                    handleBold();
                    break;
                  case 'i':
                    e.preventDefault();
                    handleItalic();
                    break;
                  case 'z':
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleUndo();
                    }
                    break;
                  case 'y':
                    e.preventDefault();
                    handleRedo();
                    break;
                }
              }
              // Handle tab key for indentation
              if (e.key === 'Tab') {
                e.preventDefault();
                insertMarkdown('  ', '', '');
              }
            }}
          />
        ) : (
          <Box 
            sx={{ 
              minHeight, 
              maxHeight, 
              overflow: 'auto', 
              p: 2, 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {value ? (
              <ReactMarkdown>
                {value}
              </ReactMarkdown>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No content to preview
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Character count */}
      <Box 
        sx={{ 
          p: 1, 
          borderTop: 1, 
          borderColor: 'divider', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {value.length} characters
        </Typography>
        <Tooltip title={tab === 'edit' ? 'Show Preview' : 'Show Editor'}>
          <IconButton 
            size="small" 
            onClick={() => setTab(tab === 'edit' ? 'preview' : 'edit')}
          >
            {tab === 'edit' ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default MarkdownEditor;