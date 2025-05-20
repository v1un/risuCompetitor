import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';

const ApiKeySetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [geminiKey, setGeminiKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const steps = ['Choose API Provider', 'Enter API Key', 'Finish Setup'];
  
  const handleNext = async () => {
    if (activeStep === 1) {
      setLoading(true);
      setError(null);
      
      try {
        // Save the API key based on the selected provider
        if (geminiKey) {
          const result = await window.api.apiKey.save('gemini', geminiKey);
          if (!result.success) {
            throw new Error(result.error || 'Failed to save Gemini API key');
          }
        }
        
        if (openRouterKey) {
          const result = await window.api.apiKey.save('openrouter', openRouterKey);
          if (!result.success) {
            throw new Error(result.error || 'Failed to save OpenRouter API key');
          }
        }
        
        // If no keys were provided, show an error
        if (!geminiKey && !openRouterKey) {
          throw new Error('Please enter at least one API key');
        }
        
        setActiveStep(activeStep + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep(activeStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };
  
  const handleFinish = () => {
    // Set a flag in localStorage to indicate API keys have been set
    localStorage.setItem('apiKeysConfigured', 'true');
    // Force a reload to ensure the app recognizes the new API key state
    window.location.href = '/';
  };
  
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose API Provider
            </Typography>
            <Typography paragraph>
              This application requires at least one AI API key to function. You can choose to use Google's Gemini API, OpenRouter, or both.
            </Typography>
            <Typography paragraph>
              <strong>Google Gemini API:</strong> Provides access to Google's Gemini models. You can get an API key from the{' '}
              <Link href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">
                Google AI Studio
              </Link>.
            </Typography>
            <Typography paragraph>
              <strong>OpenRouter:</strong> Provides access to multiple AI models from different providers. You can get an API key from{' '}
              <Link href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer">
                OpenRouter
              </Link>.
            </Typography>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Enter API Key
            </Typography>
            <Typography paragraph>
              Enter at least one API key below. Your keys are stored securely on your device and are never sent to our servers.
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Google Gemini API Key"
              variant="outlined"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              type="password"
            />
            <Typography variant="caption" color="text.secondary" paragraph>
              Optional if you provide an OpenRouter key
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="OpenRouter API Key"
              variant="outlined"
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              type="password"
            />
            <Typography variant="caption" color="text.secondary" paragraph>
              Optional if you provide a Gemini key
            </Typography>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Setup Complete
            </Typography>
            <Typography paragraph>
              Your API key(s) have been saved successfully. You can now start using the application.
            </Typography>
            <Typography paragraph>
              You can change or update your API keys at any time from the Settings page.
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          API Key Setup
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && activeStep !== steps.length - 1 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleFinish}
              >
                Get Started
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ApiKeySetupPage;