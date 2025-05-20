/**
 * ErrorDisplay.tsx
 * Component for displaying user-friendly error messages with recovery suggestions
 */

import React, { useState } from 'react';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Button, 
  Collapse, 
  Divider, 
  IconButton, 
  Paper, 
  Typography 
} from '@mui/material';
import { 
  Close as CloseIcon, 
  ExpandMore as ExpandMoreIcon, 
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { UserFriendlyError } from '../../../shared/services/ApiErrorHandler';

interface ErrorDisplayProps {
  error: UserFriendlyError;
  onClose?: () => void;
  onRetry?: () => void;
  variant?: 'inline' | 'dialog' | 'toast';
  autoHideDuration?: number;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onClose,
  onRetry,
  variant = 'inline',
  autoHideDuration,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);

  // Auto-hide for toast variant
  React.useEffect(() => {
    if (variant === 'toast' && autoHideDuration) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) {
          setTimeout(onClose, 300); // Allow animation to complete
        }
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [variant, autoHideDuration, onClose]);

  // Handle close
  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // Allow animation to complete
    }
  };

  // Severity mapping based on title
  const getSeverity = () => {
    if (error.title.includes('Connection') || 
        error.title.includes('Timeout') || 
        error.title.includes('Rate Limit')) {
      return 'warning';
    }
    if (error.title.includes('Authentication') || 
        error.title.includes('Authorization')) {
      return 'error';
    }
    return 'error';
  };

  // Inline variant
  if (variant === 'inline') {
    return (
      <Collapse in={visible}>
        <Alert 
          severity={getSeverity()}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {onRetry && (
                <IconButton 
                  color="inherit" 
                  size="small" 
                  onClick={onRetry}
                  aria-label="retry"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              )}
              {onClose && (
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={handleClose}
                  aria-label="close"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          }
          sx={{ mb: 2 }}
        >
          <AlertTitle>{error.title}</AlertTitle>
          {error.message}
          
          <Box sx={{ mt: 1 }}>
            <Button 
              size="small" 
              onClick={() => setExpanded(!expanded)}
              endIcon={<ExpandMoreIcon sx={{ 
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }} />}
            >
              {expanded ? 'Hide suggestions' : 'Show suggestions'}
            </Button>
          </Box>
          
          <Collapse in={expanded}>
            <Box sx={{ mt: 1, ml: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Suggestions:
              </Typography>
              <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                {error.recoverySuggestions.map((suggestion, index) => (
                  <li key={index}>
                    <Typography variant="body2">{suggestion}</Typography>
                  </li>
                ))}
              </ul>
              
              {error.technicalDetails && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ display: 'block', mt: 1 }}
                >
                  {error.technicalDetails}
                </Typography>
              )}
            </Box>
          </Collapse>
        </Alert>
      </Collapse>
    );
  }

  // Dialog variant
  if (variant === 'dialog') {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          maxWidth: 500, 
          mx: 'auto',
          borderTop: `4px solid ${getSeverity() === 'error' ? '#f44336' : '#ff9800'}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ErrorIcon 
            color={getSeverity() === 'error' ? 'error' : 'warning'} 
            sx={{ mr: 1, fontSize: 28 }} 
          />
          <Typography variant="h6" component="h2">
            {error.title}
          </Typography>
          {onClose && (
            <IconButton 
              size="small" 
              sx={{ ml: 'auto' }} 
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        
        <Typography variant="body1" paragraph>
          {error.message}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Suggestions:
        </Typography>
        <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
          {error.recoverySuggestions.map((suggestion, index) => (
            <li key={index}>
              <Typography variant="body2">{suggestion}</Typography>
            </li>
          ))}
        </ul>
        
        {error.technicalDetails && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ display: 'block', mt: 2 }}
          >
            {error.technicalDetails}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
          {onRetry && (
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Try Again
            </Button>
          )}
          {onClose && (
            <Button 
              variant="contained" 
              onClick={handleClose}
            >
              Dismiss
            </Button>
          )}
        </Box>
      </Paper>
    );
  }

  // Toast variant
  return (
    <Collapse in={visible}>
      <Alert 
        severity={getSeverity()}
        variant="filled"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {onRetry && (
              <IconButton 
                color="inherit" 
                size="small" 
                onClick={onRetry}
                aria-label="retry"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              color="inherit"
              size="small"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{ 
          mb: 2, 
          boxShadow: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <AlertTitle>{error.title}</AlertTitle>
        {error.message}
        
        {autoHideDuration && (
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              height: '2px', 
              bgcolor: 'rgba(255,255,255,0.5)',
              width: '100%',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                bgcolor: 'rgba(255,255,255,0.8)',
                animation: `shrink ${autoHideDuration}ms linear forwards`
              }
            }} 
          />
        )}
      </Alert>
    </Collapse>
  );
};

export default ErrorDisplay;