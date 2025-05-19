import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ModelSelector from '../ai/ModelSelector';

interface NarratorChatProps {
  sessionId: string;
  protagonist: any;
  lorebook: any;
  tools: any[];
}

interface Message {
  id: string;
  type: 'system' | 'narrator' | 'protagonist' | 'npc' | 'ooc';
  sender: {
    id?: string;
    name: string;
  };
  content: {
    text: string;
  };
  timestamp: string;
}

const NarratorChat: React.FC<NarratorChatProps> = ({ 
  sessionId, 
  protagonist, 
  lorebook, 
  tools 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Model settings
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [modelProvider, setModelProvider] = useState<'gemini' | 'openrouter'>('gemini');
  const [modelName, setModelName] = useState<string>('gemini-pro');
  const [modelParams, setModelParams] = useState({
    temperature: 0.8,
    topP: 0.95,
    topK: 40,
    maxTokens: 2048
  });
  
  // Message editing
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await window.api.chatSession.getWithMessages(sessionId);
        
        if (response.success && response.session && response.session.messages) {
          setMessages(response.session.messages);
        }
      } catch (err) {
        setError('Failed to load messages');
        console.error(err);
      }
    };
    
    loadMessages();
  }, [sessionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a message as the protagonist
  const sendMessage = async () => {
    if (!inputText.trim() || isGenerating) return;
    
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      type: 'protagonist',
      sender: {
        id: protagonist.id,
        name: protagonist.character.name
      },
      content: {
        text: inputText
      },
      timestamp: new Date().toISOString()
    };
    
    // Add user message to the UI
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsGenerating(true);
    setError(null);
    
    try {
      // Save user message to database
      const saveResponse = await window.api.chatMessage.add({
        session_id: sessionId,
        type: 'protagonist',
        sender_id: protagonist.id,
        sender_name: protagonist.character.name,
        content: { text: inputText }
      });
      
      if (!saveResponse.success) {
        throw new Error(saveResponse.error || 'Failed to save message');
      }
      
      // Update the temporary ID with the real one
      userMessage.id = saveResponse.id;
      
      // Build context for the AI
      const context = {
        series: lorebook.metadata.series,
        protagonist: protagonist,
        startingPoint: lorebook.narrator_guidance.starting_point,
        worldInfo: lorebook.world.overview,
        protagonistInfo: `Name: ${protagonist.character.name}\nDescription: ${protagonist.character.description}`,
        toolsInfo: tools.map(tool => 
          `${tool.tool.name}: ${tool.tool.description}`
        ).join('\n\n'),
        useOpenRouter: modelProvider === 'openrouter',
        model: modelName,
        temperature: modelParams.temperature,
        topP: modelParams.topP,
        topK: modelParams.topK,
        maxTokens: modelParams.maxTokens
      };
      
      // Generate narrator response
      // Using type assertion to handle the TypeScript error
      const aiResponse = await (window.api as any).ai.generateNarratorResponse(
        sessionId,
        messages.concat(userMessage),
        context
      );
      
      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'Failed to generate response');
      }
      
      // Add narrator response to messages
      const narratorMessage: Message = {
        id: aiResponse.messageId,
        type: 'narrator',
        sender: {
          name: 'Narrator'
        },
        content: {
          text: aiResponse.response
        },
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, narratorMessage]);
      
      // Process tool updates if any
      if (aiResponse.toolUpdates && aiResponse.toolUpdates.length > 0) {
        // In a real app, you would update the UI to reflect these changes
        console.log('Tool updates:', aiResponse.toolUpdates);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle model change
  const handleModelChange = (model: string, provider: 'gemini' | 'openrouter') => {
    setModelName(model);
    setModelProvider(provider);
  };

  // Handle parameters change
  const handleParametersChange = (params: {
    temperature: number;
    topP: number;
    topK: number;
    maxTokens: number;
  }) => {
    setModelParams(params);
  };

  // Handle message edit
  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditText(content);
    setEditDialogOpen(true);
  };

  // Save edited message
  const saveEditedMessage = async () => {
    if (!editingMessageId || !editText.trim()) return;
    
    try {
      const response = await window.api.chatMessage.update(editingMessageId, { content: { text: editText } });
      
      if (response.success) {
        // Update message in UI
        setMessages(prev => 
          prev.map(msg => 
            msg.id === editingMessageId 
              ? { ...msg, content: { text: editText }, is_edited: true } 
              : msg
          )
        );
      } else {
        throw new Error(response.error || 'Failed to edit message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error(err);
    } finally {
      setEditDialogOpen(false);
      setEditingMessageId(null);
      setEditText('');
    }
  };

  // Handle message delete
  const handleDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  // Delete message
  const deleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      const response = await window.api.chatMessage.delete(messageToDelete);
      
      if (response.success) {
        // Remove message from UI
        setMessages(prev => prev.filter(msg => msg.id !== messageToDelete));
      } else {
        throw new Error(response.error || 'Failed to delete message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  return (
    <div className="narrator-chat">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Tooltip title="AI Settings">
          <IconButton onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <div className="messages-container">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.type}`}
          >
            <div className="message-header">
              <span className="sender-name">{message.sender.name}</span>
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              
              {/* Message actions */}
              {message.type === 'protagonist' && (
                <Box sx={{ display: 'inline-flex', ml: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small"
                      onClick={() => handleEditMessage(message.id, message.content.text)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small"
                      onClick={() => handleDeleteMessage(message.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </div>
            <div className="message-content markdown-content">
              <ReactMarkdown>{message.content.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="message narrator generating">
            <div className="message-header">
              <span className="sender-name">Narrator</span>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setError(null)}
            sx={{ mt: 1 }}
          >
            Dismiss
          </Button>
        </div>
      )}
      
      <div className="input-container">
        <textarea 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={`What will ${protagonist.character.name} do?`}
          disabled={isGenerating}
          aria-label="Message input"
          aria-multiline="true"
          role="textbox"
        />
        <button 
          onClick={sendMessage}
          disabled={isGenerating || !inputText.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
      
      {/* Model Settings Dialog */}
      <Dialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>AI Model Settings</DialogTitle>
        <DialogContent>
          <ModelSelector 
            onModelChange={handleModelChange}
            onParametersChange={handleParametersChange}
            initialModel={modelName}
            initialProvider={modelProvider}
            initialParameters={modelParams}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Message Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Message</DialogTitle>
        <DialogContent>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{ width: '100%', minHeight: '150px', padding: '8px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveEditedMessage} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Message Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Message</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this message?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteMessage} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NarratorChat;