/**
 * ModelSelector.tsx
 * Enhanced model selection UI for OpenRouter with model information display
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Grid,
  Divider,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Skeleton,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Slider,
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  FilterList as FilterListIcon,
  Settings as SettingsIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Original interfaces
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

// Enhanced model information interface
export interface AIModel extends OpenRouterModel {
  provider: string;
  description?: string;
  contextSize: number;
  costPer1kTokens: {
    input: number;
    output: number;
  };
  capabilities: string[];
  tags: string[];
  imageSupport?: boolean;
  maxOutputTokens?: number;
  trainingData?: string;
  favorite?: boolean;
  recentlyUsed?: boolean;
  lastUsed?: Date;
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
  const theme = useTheme();
  const [provider, setProvider] = useState<'gemini' | 'openrouter'>(initialProvider);
  const [model, setModel] = useState<string>(initialModel);
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [enhancedModels, setEnhancedModels] = useState<AIModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [modelViewMode, setModelViewMode] = useState<'list' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModelTab, setSelectedModelTab] = useState<number>(0);
  const [selectedModelDetails, setSelectedModelDetails] = useState<AIModel | null>(null);
  const [showModelDetails, setShowModelDetails] = useState<boolean>(false);
  
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
        
        // Convert to enhanced models
        const enhanced = response.models.map((model: OpenRouterModel) => {
          // Extract provider from ID (e.g., "anthropic/claude-3" -> "Anthropic")
          const providerName = model.id.split('/')[0];
          const formattedProvider = providerName.charAt(0).toUpperCase() + providerName.slice(1);
          
          // Generate capabilities based on model name (this would be better from API)
          const capabilities = [];
          if (model.name.toLowerCase().includes('vision')) capabilities.push('image understanding');
          capabilities.push('chat', 'reasoning');
          if (model.name.toLowerCase().includes('code') || model.context_length > 16000) capabilities.push('coding');
          
          // Generate tags based on context length and pricing
          const tags = [];
          if (model.context_length > 100000) tags.push('large context');
          if (model.context_length > 32000) tags.push('medium context');
          if (model.pricing.completion < 0.001) tags.push('cost-effective');
          if (model.pricing.completion > 0.01) tags.push('premium');
          
          // Check if it's a favorite (would be from user settings in real app)
          const isFavorite = ['anthropic/claude-3-opus', 'anthropic/claude-3-sonnet', 'openai/gpt-4o'].includes(model.id);
          
          // Check if recently used (would be from user history in real app)
          const isRecentlyUsed = ['anthropic/claude-3-sonnet', 'anthropic/claude-3-haiku'].includes(model.id);
          
          return {
            ...model,
            provider: formattedProvider,
            description: `${formattedProvider}'s ${model.name.includes('3') ? 'advanced' : 'standard'} language model`,
            contextSize: model.context_length,
            costPer1kTokens: {
              input: model.pricing.prompt,
              output: model.pricing.completion
            },
            capabilities,
            tags,
            imageSupport: model.name.toLowerCase().includes('vision'),
            maxOutputTokens: Math.min(model.context_length / 2, 4096),
            trainingData: 'Up to 2023',
            favorite: isFavorite,
            recentlyUsed: isRecentlyUsed,
            lastUsed: isRecentlyUsed ? new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24) : undefined
          } as AIModel;
        });
        
        setEnhancedModels(enhanced);
        setFilteredModels(enhanced);
        
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
  const handleModelChange = (modelId: string) => {
    setModel(modelId);
    onModelChange(modelId, provider);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Handle model tab change
  const handleModelTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedModelTab(newValue);
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

  // Filter models based on search query and selected tab
  useEffect(() => {
    if (provider !== 'openrouter') return;
    
    let filtered = [...enhancedModels];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        model =>
          model.name.toLowerCase().includes(query) ||
          model.provider.toLowerCase().includes(query) ||
          model.description?.toLowerCase().includes(query) ||
          model.capabilities.some(cap => cap.toLowerCase().includes(query)) ||
          model.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply tab filter
    switch (selectedModelTab) {
      case 0: // All models
        break;
      case 1: // Favorites
        filtered = filtered.filter(model => model.favorite);
        break;
      case 2: // Recently used
        filtered = filtered.filter(model => model.recentlyUsed);
        break;
      case 3: // With image support
        filtered = filtered.filter(model => model.imageSupport);
        break;
    }
    
    setFilteredModels(filtered);
  }, [enhancedModels, searchQuery, selectedModelTab, provider]);

  // Toggle favorite status
  const toggleFavorite = (modelId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEnhancedModels(prevModels =>
      prevModels.map(model =>
        model.id === modelId
          ? { ...model, favorite: !model.favorite }
          : model
      )
    );
  };

  // Show model details
  const handleShowDetails = (model: AIModel, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedModelDetails(model);
    setShowModelDetails(true);
  };

  // Format cost as currency
  const formatCost = (cost: number) => {
    return `$${cost.toFixed(5)}`;
  };

  // Get model by ID
  const getModelById = (id: string): AIModel | undefined => {
    return enhancedModels.find(model => model.id === id);
  };

  // Render the enhanced UI when provider is OpenRouter and in grid view
  const renderEnhancedOpenRouterUI = () => {
    if (isLoading) {
      return (
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" height={48} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={48} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map(i => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={140} />
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }

    return (
      <Box>
        {/* Search and filter bar */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search models..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    edge="end"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Tooltip title="Filter options">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Model settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Tabs for filtering */}
        <Tabs
          value={selectedModelTab}
          onChange={handleModelTabChange}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Models" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon fontSize="small" sx={{ mr: 0.5 }} />
                Favorites
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HistoryIcon fontSize="small" sx={{ mr: 0.5 }} />
                Recent
              </Box>
            } 
          />
          <Tab 
            label="Image Support" 
          />
        </Tabs>

        {/* Selected model info */}
        {model && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Currently Selected:
            </Typography>
            <Card 
              variant="outlined" 
              sx={{ 
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }}
            >
              <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1">
                      {getModelById(model)?.name || model}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getModelById(model)?.provider || 'Unknown provider'}
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    onClick={() => setSelectedModelTab(0)}
                  >
                    Change
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Model grid */}
        {filteredModels.length > 0 ? (
          <Grid container spacing={2}>
            {filteredModels.map((modelItem) => (
              <Grid item xs={12} sm={6} md={4} key={modelItem.id}>
                <Card 
                  variant={modelItem.id === model ? 'outlined' : 'elevation'} 
                  sx={{ 
                    height: '100%',
                    borderColor: modelItem.id === model ? theme.palette.primary.main : undefined,
                    backgroundColor: modelItem.id === model 
                      ? alpha(theme.palette.primary.main, 0.05) 
                      : undefined
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleModelChange(modelItem.id)}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" component="div" noWrap>
                          {modelItem.name}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={(e) => toggleFavorite(modelItem.id, e)}
                          >
                            {modelItem.favorite ? (
                              <StarIcon fontSize="small" color="primary" />
                            ) : (
                              <StarBorderIcon fontSize="small" />
                            )}
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleShowDetails(modelItem, e)}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" component="div">
                        {modelItem.provider}
                      </Typography>
                      
                      {modelItem.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 1, 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            height: '2.5em'
                          }}
                        >
                          {modelItem.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip 
                          label={`${modelItem.contextSize.toLocaleString()} tokens`} 
                          size="small" 
                          variant="outlined"
                        />
                        {modelItem.imageSupport && (
                          <Chip 
                            label="Images" 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                      
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" component="div" color="text.secondary">
                          Cost: {formatCost(modelItem.costPer1kTokens.input)}/{formatCost(modelItem.costPer1kTokens.output)} per 1K tokens
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No models found matching your criteria
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }} 
              onClick={() => {
                setSearchQuery('');
                setSelectedModelTab(0);
              }}
            >
              Clear filters
            </Button>
          </Box>
        )}

        {/* Model details dialog */}
        <Dialog 
          open={showModelDetails} 
          onClose={() => setShowModelDetails(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedModelDetails && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{selectedModelDetails.name}</Typography>
                  <IconButton onClick={() => setShowModelDetails(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle1" gutterBottom>
                      {selectedModelDetails.provider}
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      {selectedModelDetails.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Capabilities
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {selectedModelDetails.capabilities.map((capability) => (
                        <Chip 
                          key={capability} 
                          label={capability} 
                          size="small"
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {selectedModelDetails.tags.map((tag) => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Usage Information
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Training Data:</strong> {selectedModelDetails.trainingData}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Last Used:</strong> {selectedModelDetails.lastUsed 
                          ? selectedModelDetails.lastUsed.toLocaleString() 
                          : 'Never'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Model Specifications
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Context Size:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {selectedModelDetails.contextSize.toLocaleString()} tokens
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Max Output:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {selectedModelDetails.maxOutputTokens?.toLocaleString() || 'Unknown'} tokens
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Image Support:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {selectedModelDetails.imageSupport ? 'Yes' : 'No'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                    
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Pricing
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Input:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCost(selectedModelDetails.costPer1kTokens.input)} per 1K tokens
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Output:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCost(selectedModelDetails.costPer1kTokens.output)} per 1K tokens
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="caption" color="text.secondary">
                          Estimated cost for a typical conversation (10K input, 2K output):
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" align="right">
                          {formatCost(
                            selectedModelDetails.costPer1kTokens.input * 10 +
                            selectedModelDetails.costPer1kTokens.output * 2
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button 
                  startIcon={selectedModelDetails.favorite ? <StarIcon /> : <StarBorderIcon />}
                  onClick={() => toggleFavorite(selectedModelDetails.id, {} as React.MouseEvent)}
                >
                  {selectedModelDetails.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    handleModelChange(selectedModelDetails.id);
                    setShowModelDetails(false);
                  }}
                >
                  Select Model
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    );
  };

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

          {provider === 'gemini' ? (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Model</InputLabel>
              <Select
                value={model}
                onChange={(e) => handleModelChange(e.target.value)}
                label="Model"
                disabled={isLoading}
              >
                <MenuItem value="gemini-pro">Gemini Pro</MenuItem>
                <MenuItem value="gemini-pro-vision">Gemini Pro Vision</MenuItem>
              </Select>
              {isLoading && <CircularProgress size={24} sx={{ mt: 1 }} />}
              {error && <FormHelperText error>{error}</FormHelperText>}
            </FormControl>
          ) : (
            // Enhanced OpenRouter UI
            renderEnhancedOpenRouterUI()
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