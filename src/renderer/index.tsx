import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import { ThemeContextProvider } from './contexts/ThemeContext';

// Import custom styles
import './styles/markdown.css';

// Create root
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

// Render app
root.render(
  <React.StrictMode>
    <HashRouter>
      <ThemeContextProvider>
        <CssBaseline />
        <App />
      </ThemeContextProvider>
    </HashRouter>
  </React.StrictMode>
);