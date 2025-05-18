import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Divider,
  Tooltip,
  IconButton,
  Collapse,
  Grid,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Define the generation settings interface
export interface GenerationSettings {
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  presencePenalty: number;
  frequencyPenalty: number;
  stopSequences: string[];
  repetitionPenalty: number;
  seed?: number;
}

// Define preset types
export interface GenerationPreset {
  id: string;
  name: string;
  description: string;
  settings: GenerationSettings;
  isSystem: boolean;
}

// Props for the component
interface GenerationSettingsProps {
  initialSettings?: Partial<GenerationSettings>;
  onSettingsChange: (settings: GenerationSettings) => void;
  modelId?: string;
  presets?: GenerationPreset[];
  onSavePreset?: (preset: Omit<GenerationPreset, 'id' | 'isSystem'>) => void;
  onDeletePreset?: (presetId: string) => void;
}

// Default settings
const defaultSettings: GenerationSettings = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxTokens: 1024,
  presencePenalty: 0.0,
  frequencyPenalty: 0.0,
  stopSequences: [],
  repetitionPenalty: 1.1
};

// System presets
const systemPresets: GenerationPreset[] = [
  {
    id: 'creative',
    name: 'Creative',
    description: 'High creativity for brainstorming and open-ended generation',
    isSystem: true,
    settings: {
      ...defaultSettings,
      temperature: 0.9,
      topP: 0.95,
      presencePenalty: 0.2,
      frequencyPenalty: 0.2
    }
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Good balance between creativity and consistency',
    isSystem: true,
    settings: {
      ...defaultSettings,
      temperature: 0.7,
      topP: 0.9,
      presencePenalty: 0.1,
      frequencyPenalty: 0.1
    }
  },
  {
    id: 'precise',
    name: 'Precise',
    description: 'Lower creativity for more predictable, factual responses',
    isSystem: true,
    settings: {
      ...defaultSettings,
      temperature: 0.3,
      topP: 0.8,
      presencePenalty: 0.0,
      frequencyPenalty: 0.0
    }
  },
  {
    id: 'narrator',
    name: 'Narrator',
    description: 'Optimized for storytelling and narrative consistency',
    isSystem: true,
    settings: {
      ...defaultSettings,
      temperature: 0.8,
      topP: 0.9,
      presencePenalty: 0.1,
      frequencyPenalty: 0.2,
      repetitionPenalty: 1.2
    }
  }
];

/**
 * Component for adjusting AI generation settings
 */
const GenerationSettings: React.FC<GenerationSettingsProps> = ({
  initialSettings,
  onSettingsChange,
  modelId,
  presets = [],
  onSavePreset,
  onDeletePreset
}) => {
  // Combine system and user presets
  const allPresets = [...systemPresets, ...presets.filter(p => !p.isSystem)];
  
  // State for current settings
  const [settings, setSettings] = useState<GenerationSettings>({
    ...defaultSettings,
    ...initialSettings
  });
  
  // State for UI
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [stopSequence, setStopSequence] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [showPresetSave, setShowPresetSave] = useState(false);
  const [randomSeed, setRandomSeed] = useState(settings.seed === undefined);

  // Update settings when initialSettings change
  useEffect(() => {
    if (initialSettings) {
      setSettings(prev => ({
        ...prev,
        ...initialSettings
      }));
    }
  }, [initialSettings]);

  // Handle settings change
  const handleSettingChange = (key: keyof GenerationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
    
    // Clear selected preset if settings are changed
    if (selectedPresetId) {
      setSelectedPresetId(null);
    }
  };

  // Handle preset selection
  const handlePresetSelect = (presetId: string) => {
    const preset = allPresets.find(p => p.id === presetId);
    if (preset) {
      setSettings(preset.settings);
      onSettingsChange(preset.settings);
      setSelectedPresetId(presetId);
    }
  };

  // Handle adding stop sequence
  const handleAddStopSequence = () => {
    if (stopSequence && !settings.stopSequences.includes(stopSequence)) {
      const newStopSequences = [...settings.stopSequences, stopSequence];
      handleSettingChange('stopSequences', newStopSequences);
      setStopSequence('');
    }
  };

  // Handle removing stop sequence
  const handleRemoveStopSequence = (sequence: string) => {
    const newStopSequences = settings.stopSequences.filter(s => s !== sequence);
    handleSettingChange('stopSequences', newStopSequences);
  };

  // Handle saving preset
  const handleSavePreset = () => {
    if (onSavePreset && newPresetName) {
      onSavePreset({
        name: newPresetName,
        description: newPresetDescription,
        settings
      });
      setNewPresetName('');
      setNewPresetDescription('');
      setShowPresetSave(false);
    }
  };

  // Handle seed toggle
  const handleSeedToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRandomSeed(event.target.checked);
    if (event.target.checked) {
      const newSettings = { ...settings };
      delete newSettings.seed;
      setSettings(newSettings);
      onSettingsChange(newSettings);
    } else {
      const seed = Math.floor(Math.random() * 2147483647);
      handleSettingChange('seed', seed);
    }
  };

  // Generate a new random seed
  const handleNewRandomSeed = () => {
    if (!randomSeed) {
      const seed = Math.floor(Math.random() * 2147483647);
      handleSettingChange('seed', seed);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Generation Settings
        {modelId && (
          <Typography variant="caption" display="block">
            Model: {modelId}
          </Typography>
        )}
      </Typography>

      {/* Presets */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Presets
        </Typography>
        <Grid container spacing={1}>
          {allPresets.map(preset => (
            <Grid item key={preset.id}>
              <Chip
                label={preset.name}
                onClick={() => handlePresetSelect(preset.id)}
                onDelete={!preset.isSystem && onDeletePreset ? () => onDeletePreset(preset.id) : undefined}
                color={selectedPresetId === preset.id ? 'primary' : 'default'}
                variant={selectedPresetId === preset.id ? 'filled' : 'outlined'}
                sx={{ mr: 1 }}
              />
            </Grid>
          ))}
          {onSavePreset && (
            <Grid item>
              <Chip
                label="Save Current"
                onClick={() => setShowPresetSave(!showPresetSave)}
                color="secondary"
                variant="outlined"
              />
            </Grid>
          )}
        </Grid>

        {/* Save Preset Form */}
        <Collapse in={showPresetSave}>
          <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Save Current Settings as Preset
            </Typography>
            <TextField
              label="Preset Name"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              fullWidth
              margin="dense"
              size="small"
            />
            <TextField
              label="Description"
              value={newPresetDescription}
              onChange={(e) => setNewPresetDescription(e.target.value)}
              fullWidth
              margin="dense"
              size="small"
              multiline
              rows={2}
            />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPresetSave(false)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleSavePreset}
                disabled={!newPresetName}
                startIcon={<SaveIcon />}
              >
                Save Preset
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Basic Settings */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Basic Settings
        </Typography>

        {/* Temperature */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom display="flex" alignItems="center">
            Temperature: {settings.temperature.toFixed(2)}
            <Tooltip title="Controls randomness: Lower values are more deterministic, higher values are more creative">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Slider
            value={settings.temperature}
            onChange={(_, value) => handleSettingChange('temperature', value)}
            min={0}
            max={2}
            step={0.01}
            marks={[
              { value: 0, label: '0' },
              { value: 1, label: '1' },
              { value: 2, label: '2' }
            ]}
          />
        </Box>

        {/* Max Tokens */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom display="flex" alignItems="center">
            Max Tokens: {settings.maxTokens}
            <Tooltip title="Maximum number of tokens to generate">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Slider
            value={settings.maxTokens}
            onChange={(_, value) => handleSettingChange('maxTokens', value)}
            min={16}
            max={4096}
            step={16}
            marks={[
              { value: 16, label: '16' },
              { value: 1024, label: '1024' },
              { value: 2048, label: '2048' },
              { value: 4096, label: '4096' }
            ]}
          />
        </Box>

        {/* Top P */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom display="flex" alignItems="center">
            Top P: {settings.topP.toFixed(2)}
            <Tooltip title="Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Slider
            value={settings.topP}
            onChange={(_, value) => handleSettingChange('topP', value)}
            min={0.01}
            max={1}
            step={0.01}
            marks={[
              { value: 0.01, label: '0.01' },
              { value: 0.5, label: '0.5' },
              { value: 1, label: '1' }
            ]}
          />
        </Box>
      </Box>

      {/* Advanced Settings Toggle */}
      <Button
        variant="text"
        onClick={() => setAdvancedOpen(!advancedOpen)}
        endIcon={advancedOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ mb: 1 }}
      >
        {advancedOpen ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
      </Button>

      {/* Advanced Settings */}
      <Collapse in={advancedOpen}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Advanced Settings
          </Typography>

          {/* Top K */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom display="flex" alignItems="center">
              Top K: {settings.topK}
              <Tooltip title="Limits the number of tokens considered for each step">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Slider
              value={settings.topK}
              onChange={(_, value) => handleSettingChange('topK', value)}
              min={1}
              max={100}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 40, label: '40' },
                { value: 100, label: '100' }
              ]}
            />
          </Box>

          {/* Presence Penalty */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom display="flex" alignItems="center">
              Presence Penalty: {settings.presencePenalty.toFixed(2)}
              <Tooltip title="Penalizes tokens that have appeared at all, encouraging the model to talk about new topics">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Slider
              value={settings.presencePenalty}
              onChange={(_, value) => handleSettingChange('presencePenalty', value)}
              min={-2}
              max={2}
              step={0.01}
              marks={[
                { value: -2, label: '-2' },
                { value: 0, label: '0' },
                { value: 2, label: '2' }
              ]}
            />
          </Box>

          {/* Frequency Penalty */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom display="flex" alignItems="center">
              Frequency Penalty: {settings.frequencyPenalty.toFixed(2)}
              <Tooltip title="Penalizes tokens based on their frequency in the text so far, reducing repetition">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Slider
              value={settings.frequencyPenalty}
              onChange={(_, value) => handleSettingChange('frequencyPenalty', value)}
              min={-2}
              max={2}
              step={0.01}
              marks={[
                { value: -2, label: '-2' },
                { value: 0, label: '0' },
                { value: 2, label: '2' }
              ]}
            />
          </Box>

          {/* Repetition Penalty */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom display="flex" alignItems="center">
              Repetition Penalty: {settings.repetitionPenalty.toFixed(2)}
              <Tooltip title="Penalizes repetition - higher values mean less repetition">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Slider
              value={settings.repetitionPenalty}
              onChange={(_, value) => handleSettingChange('repetitionPenalty', value)}
              min={1}
              max={2}
              step={0.01}
              marks={[
                { value: 1, label: '1' },
                { value: 1.5, label: '1.5' },
                { value: 2, label: '2' }
              ]}
            />
          </Box>

          {/* Random Seed */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={randomSeed}
                  onChange={handleSeedToggle}
                />
              }
              label="Use random seed"
            />
            
            {!randomSeed && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TextField
                  label="Seed"
                  type="number"
                  value={settings.seed || 0}
                  onChange={(e) => handleSettingChange('seed', parseInt(e.target.value) || 0)}
                  size="small"
                  sx={{ width: 150 }}
                />
                <Tooltip title="Generate new random seed">
                  <IconButton onClick={handleNewRandomSeed} size="small" sx={{ ml: 1 }}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          {/* Stop Sequences */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom display="flex" alignItems="center">
              Stop Sequences
              <Tooltip title="Sequences that will cause the model to stop generating">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            
            <Box sx={{ display: 'flex', mb: 1 }}>
              <TextField
                label="Add stop sequence"
                value={stopSequence}
                onChange={(e) => setStopSequence(e.target.value)}
                size="small"
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddStopSequence}
                disabled={!stopSequence}
              >
                Add
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {settings.stopSequences.map((sequence, index) => (
                <Chip
                  key={index}
                  label={sequence}
                  onDelete={() => handleRemoveStopSequence(sequence)}
                  size="small"
                />
              ))}
              {settings.stopSequences.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No stop sequences defined
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default GenerationSettings;