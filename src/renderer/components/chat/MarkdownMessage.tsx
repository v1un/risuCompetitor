/**
 * MarkdownMessage.tsx
 * Component for rendering markdown-formatted chat messages with syntax highlighting
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

// Define message types
export type MessageType = 'system' | 'character' | 'narrator' | 'player';

interface MarkdownMessageProps {
  content: string;
  type: MessageType;
  timestamp?: Date;
  author?: string;
  avatarUrl?: string;
}

// Styled components for different message types
const MessageContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'messageType',
})<{ messageType: MessageType }>(({ theme, messageType }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  maxWidth: '85%',
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  ...(messageType === 'system' && {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.6)' 
      : 'rgba(0, 0, 0, 0.05)',
    color: theme.palette.text.primary,
    alignSelf: 'center',
    maxWidth: '95%',
  }),
  ...(messageType === 'character' && {
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.primary.dark 
      : theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  }),
  ...(messageType === 'narrator' && {
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.secondary.dark 
      : theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  }),
  ...(messageType === 'player' && {
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.info.dark 
      : theme.palette.info.light,
    color: theme.palette.info.contrastText,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  }),
}));

// Custom styles for markdown content
const StyledMarkdown = styled(Box)(({ theme }) => ({
  '& p': {
    margin: theme.spacing(1, 0),
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    margin: theme.spacing(2, 0, 1, 0),
    fontWeight: 600,
  },
  '& h1': {
    fontSize: '1.5rem',
  },
  '& h2': {
    fontSize: '1.3rem',
  },
  '& h3': {
    fontSize: '1.1rem',
  },
  '& h4, & h5, & h6': {
    fontSize: '1rem',
  },
  '& ul, & ol': {
    marginLeft: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  '& li': {
    margin: theme.spacing(0.5, 0),
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.divider}`,
    margin: theme.spacing(1, 0),
    padding: theme.spacing(0, 2),
    color: theme.palette.text.secondary,
  },
  '& code': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)',
    padding: theme.spacing(0.5, 1),
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: '0.9em',
  },
  '& pre': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.3)' 
      : 'rgba(0, 0, 0, 0.05)',
    padding: theme.spacing(1.5),
    borderRadius: 4,
    overflow: 'auto',
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
    },
  },
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    margin: theme.spacing(2, 0),
  },
  '& th, & td': {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(0.75, 1),
    textAlign: 'left',
  },
  '& th': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)',
    fontWeight: 600,
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& img': {
    maxWidth: '100%',
    borderRadius: 4,
    margin: theme.spacing(1, 0),
  },
  '& hr': {
    border: 'none',
    height: 1,
    backgroundColor: theme.palette.divider,
    margin: theme.spacing(2, 0),
  },
}));

// Component for rendering code blocks with syntax highlighting
const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  
  return (
    <Box
      component="pre"
      sx={{
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(0, 0, 0, 0.3)' 
          : 'rgba(0, 0, 0, 0.05)',
        padding: 2,
        borderRadius: 1,
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        lineHeight: 1.5,
      }}
    >
      <Box component="code" sx={{ display: 'block' }}>
        {children}
      </Box>
    </Box>
  );
};

// Main component
export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({
  content,
  type,
  timestamp,
  author,
  avatarUrl,
}) => {
  const theme = useTheme();
  
  // Format timestamp
  const formattedTime = timestamp 
    ? new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(timestamp)
    : '';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: type === 'narrator' ? 'flex-end' : 'flex-start',
        width: '100%',
        mb: 2,
      }}
    >
      {/* Author and timestamp */}
      {(author || timestamp) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 0.5,
            ...(type === 'narrator' && {
              flexDirection: 'row-reverse',
            }),
          }}
        >
          {author && (
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.secondary,
                mr: type === 'narrator' ? 0 : 1,
                ml: type === 'narrator' ? 1 : 0,
              }}
            >
              {author}
            </Typography>
          )}
          {timestamp && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
              }}
            >
              {formattedTime}
            </Typography>
          )}
        </Box>
      )}

      {/* Message container with avatar */}
      <Box
        sx={{
          display: 'flex',
          ...(type === 'narrator' && {
            flexDirection: 'row-reverse',
          }),
        }}
      >
        {/* Avatar */}
        {avatarUrl && type !== 'system' && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              mr: type === 'narrator' ? 0 : 1,
              ml: type === 'narrator' ? 1 : 0,
              flexShrink: 0,
            }}
          >
            <img
              src={avatarUrl}
              alt={author || 'avatar'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        )}

        {/* Message content */}
        <MessageContainer messageType={type} elevation={1}>
          <StyledMarkdown>
            <ReactMarkdown
              components={{
                // Custom renderers for markdown elements
                h1: ({ node, ...props }) => <Typography variant="h5" gutterBottom {...props} />,
                h2: ({ node, ...props }) => <Typography variant="h6" gutterBottom {...props} />,
                h3: ({ node, ...props }) => <Typography variant="subtitle1" gutterBottom fontWeight="bold" {...props} />,
                h4: ({ node, ...props }) => <Typography variant="subtitle2" gutterBottom fontWeight="bold" {...props} />,
                h5: ({ node, ...props }) => <Typography variant="body1" gutterBottom fontWeight="bold" {...props} />,
                h6: ({ node, ...props }) => <Typography variant="body2" gutterBottom fontWeight="bold" {...props} />,
                p: ({ node, ...props }) => <Typography variant="body1" paragraph {...props} />,
                a: ({ node, ...props }) => (
                  <Typography
                    component="a"
                    variant="body1"
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                    {...props}
                  />
                ),
                code: ({ node, inline, ...props }) => {
                  return inline ? (
                    <Typography
                      component="code"
                      variant="body2"
                      sx={{
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.05)',
                        padding: '0.2em 0.4em',
                        borderRadius: '3px',
                        fontFamily: 'monospace',
                        fontSize: '0.9em',
                      }}
                      {...props}
                    />
                  ) : (
                    <CodeBlock {...props} />
                  );
                },
                table: ({ node, ...props }) => (
                  <Box sx={{ overflowX: 'auto', my: 2 }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }} {...props} />
                  </Box>
                ),
                th: ({ node, ...props }) => (
                  <th
                    style={{
                      border: `1px solid ${theme.palette.divider}`,
                      padding: theme.spacing(0.75, 1),
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.05)',
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                    {...props}
                  />
                ),
                td: ({ node, ...props }) => (
                  <td
                    style={{
                      border: `1px solid ${theme.palette.divider}`,
                      padding: theme.spacing(0.75, 1),
                      textAlign: 'left',
                    }}
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <Box
                    component="blockquote"
                    sx={{
                      borderLeft: `4px solid ${theme.palette.divider}`,
                      margin: theme.spacing(1, 0),
                      padding: theme.spacing(0, 2),
                      color: theme.palette.text.secondary,
                    }}
                    {...props}
                  />
                ),
                img: ({ node, ...props }) => (
                  <img
                    style={{
                      maxWidth: '100%',
                      borderRadius: theme.shape.borderRadius,
                      margin: `${theme.spacing(1)} 0`,
                    }}
                    {...props}
                    alt={props.alt || 'image'}
                  />
                ),
                hr: ({ node, ...props }) => (
                  <hr
                    style={{
                      border: 'none',
                      height: 1,
                      backgroundColor: theme.palette.divider,
                      margin: `${theme.spacing(2)} 0`,
                    }}
                    {...props}
                  />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </StyledMarkdown>
        </MessageContainer>
      </Box>
    </Box>
  );
};

export default MarkdownMessage;