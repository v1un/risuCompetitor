import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Slider,
  SelectChangeEvent
} from '@mui/material';

interface ModelSelectorProps {
  onModelChange: (model: string, provider: 'gemini' | 'openrouter') => void;
  onParametersChange: (params: {
    temperature: number;
    topP: number;
    topK: number;
    maxTokens: number;
  }) => void;
  initialModel?: string;
  initialProvider?: 'gemini' | 'openrouter';
  initialParameters?: {
    temperature: number;
    topP: number;
    topK: number;
    maxTokens: number;
  };
}

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  onModelChange,
  onParametersChange,
  initialModel = 'gemini-pro',
  initialProvider = 'gemini',
  initialParameters = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxTokens: 2048
  }
}) => {
  const [provider, setProvider] = useState<'gemini' | 'openrouter'>(initialProvider);
  const [model, setModel] = useState<string>(initialModel);
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  
  // Generation parameters
  const [temperature, setTemperature] = useState(initialParameters.temperature);
  const [topP, setTopP] = useState(initialParameters.topP);
  const [topK, setTopK] = useState(initialParameters.topK);
  const [maxTokens, setMaxTokens] = useState(initialParameters.maxTokens);

  // Fetch OpenRouter models on component mount
  useEffect(() => {
    if (provider === 'openrouter') {
      fetchOpenRouterModels();
    }
  }, [provider]);

  // Fetch OpenRouter models
  const fetchOpenRouterModels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await window.api.openRouter.getModels();
      
      if (response.success) {
        setOpenRouterModels(response.models);
        
        // Set default model if none selected
        if (provider === 'openrouter' && (!model || model === 'gemini-pro')) {
          const defaultModel = response.models[0]?.id;
          if (defaultModel) {
            setModel(defaultModel);
            onModelChange(defaultModel, 'openrouter');
          }
        }
      } else {
        throw new Error(response.error || 'Failed to fetch models');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error('Error fetching OpenRouter models:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle provider change
  const handleProviderChange = (event: SelectChangeEvent<'gemini' | 'openrouter'>) => {
    const newProvider = event.target.value as 'gemini' | 'openrouter';
    setProvider(newProvider);
    
    // Set default model for the provider
    if (newProvider === 'gemini') {
      setModel('gemini-pro');
      onModelChange('gemini-pro', 'gemini');
    } else if (openRouterModels.length > 0) {
      const defaultModel = openRouterModels[0].id;
      setModel(defaultModel);
      onModelChange(defaultModel, 'openrouter');
    }
  };

  // Handle model change
  const handleModelChange = (event: SelectChangeEvent) => {
    const newModel = event.target.value as string;
    setModel(newModel);
    onModelChange(newModel, provider);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Update parameters when they change
  useEffect(() => {
    onParametersChange({
      temperature,
      topP,
      topK,
      maxTokens
    });
  }, [temperature, topP, topK, maxTokens, onParametersChange]);

  return (
    <div className="model-selector">
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Model" />
          <Tab label="Parameters" />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Provider</InputLabel>
            <Select
              value={provider}
              onChange={handleProviderChange}
              label="Provider"
            >
              <MenuItem value="gemini">Google Gemini</MenuItem>
              <MenuItem value="openrouter">OpenRouter</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={model}
              onChange={handleModelChange}
              label="Model"
              disabled={isLoading}
            >
              {provider === 'gemini' ? (
                <>
                  <MenuItem value="gemini-pro">Gemini Pro</MenuItem>
                  <MenuItem value="gemini-pro-vision">Gemini Pro Vision</MenuItem>
                </>
              ) : (
                openRouterModels.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {isLoading && <CircularProgress size={24} sx={{ mt: 1 }} />}
            {error && <FormHelperText error>{error}</FormHelperText>}
          </FormControl>

          {provider === 'openrouter' && model && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Model Information</Typography>
              {openRouterModels.find(m => m.id === model) && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Context Length: {openRouterModels.find(m => m.id === model)?.context_length || 'Unknown'}
                  </Typography>
                  <Typography variant="body2">
                    Pricing: ${openRouterModels.find(m => m.id === model)?.pricing.prompt.toFixed(6)} per 1K prompt tokens, 
                    ${openRouterModels.find(m => m.id === model)?.pricing.completion.toFixed(6)} per 1K completion tokens
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </>
      )}

      {tabIndex === 1 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Temperature: {temperature}</Typography>
            <Slider
              value={temperature}
              onChange={(_, value) => setTemperature(value as number)}
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
            />
            <FormHelperText>
              Controls randomness: Lower values are more deterministic, higher values more creative
            </FormHelperText>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Top P: {topP}</Typography>
            <Slider
              value={topP}
              onChange={(_, value) => setTopP(value as number)}
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
            />
            <FormHelperText>
              Nucleus sampling: Only consider tokens with this cumulative probability
            </FormHelperText>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Top K: {topK}</Typography>
            <Slider
              value={topK}
              onChange={(_, value) => setTopK(value as number)}
              min={1}
              max={100}
              step={1}
              valueLabelDisplay="auto"
            />
            <FormHelperText>
              Only consider this many most likely tokens
            </FormHelperText>
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              label="Max Tokens"
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              fullWidth
              InputProps={{ inputProps: { min: 1, max: 8192 } }}
              helperText="Maximum number of tokens to generate"
            />
          </Box>
        </>
      )}
    </div>
  );
};

export default ModelSelector;