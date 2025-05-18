import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import CharactersPage from './pages/CharactersPage';
import LorebooksPage from './pages/LorebooksPage';
import SupportToolsPage from './pages/SupportToolsPage';
import SettingsPage from './pages/SettingsPage';
import ApiKeySetupPage from './pages/ApiKeySetupPage';
import AiGenerationPage from './pages/AiGenerationPage';
import { useThemeContext } from './contexts/ThemeContext';

const App: React.FC = () => {
  const { loadTheme } = useThemeContext();
  const [isLoading, setIsLoading] = useState(true);
  const [hasApiKeys, setHasApiKeys] = useState(false);
  
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load theme
        await loadTheme();
        
        // Check if API keys are set
        const geminiKeyExists = await window.api.apiKey.exists('gemini');
        const openRouterKeyExists = await window.api.apiKey.exists('openrouter');
        
        setHasApiKeys(geminiKeyExists.exists || openRouterKeyExists.exists);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [loadTheme]);
  
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Routes>
      {!hasApiKeys ? (
        <>
          <Route path="/setup" element={<ApiKeySetupPage />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </>
      ) : (
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat/:id?" element={<ChatPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/lorebooks" element={<LorebooksPage />} />
          <Route path="/tools" element={<SupportToolsPage />} />
          <Route path="/ai-generation" element={<AiGenerationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/setup" element={<ApiKeySetupPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
};

export default App;