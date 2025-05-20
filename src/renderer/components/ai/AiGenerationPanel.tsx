import React, { useState } from 'react';
import MarkdownEditor from '../common/MarkdownEditor';
import MarkdownMessage from '../chat/MarkdownMessage';
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, Paper, CircularProgress, Alert } from '@mui/material';

interface AiGenerationPanelProps {
  series: string;
}

const AiGenerationPanel: React.FC<AiGenerationPanelProps> = ({ series }) => {
  const [generating, setGenerating] = useState<boolean>(false);
  const [generationType, setGenerationType] = useState<string>('character');
  const [role, setRole] = useState<string>('protagonist');
  const [toolType, setToolType] = useState<string>('tracker');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      let response;

      switch (generationType) {
        case 'character':
          response = await window.api.ai.generateCharacter(series, role, additionalInfo);
          break;
        case 'lorebook':
          response = await window.api.ai.generateLorebook(series, additionalInfo);
          break;
        case 'supportTool':
          response = await window.api.ai.generateSupportTool(series, toolType, additionalInfo);
          break;
        default:
          throw new Error('Invalid generation type');
      }

      if (response.success) {
        setResult(response);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="ai-generation-panel">
      <h2>AI Generation</h2>
      
      <div className="form-group">
        <label htmlFor="generationType">Generation Type</label>
        <select 
          id="generationType" 
          value={generationType} 
          onChange={(e) => setGenerationType(e.target.value)}
          disabled={generating}
        >
          <option value="character">Character</option>
          <option value="lorebook">Lorebook</option>
          <option value="supportTool">Support Tool</option>
        </select>
      </div>
      
      {generationType === 'character' && (
        <div className="form-group">
          <label htmlFor="role">Character Role</label>
          <select 
            id="role" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            disabled={generating}
          >
            <option value="protagonist">Protagonist</option>
            <option value="antagonist">Antagonist</option>
            <option value="npc">NPC</option>
          </select>
        </div>
      )}
      
      {generationType === 'supportTool' && (
        <div className="form-group">
          <label htmlFor="toolType">Tool Type</label>
          <select 
            id="toolType" 
            value={toolType} 
            onChange={(e) => setToolType(e.target.value)}
            disabled={generating}
          >
            <option value="tracker">Tracker</option>
            <option value="meter">Meter</option>
            <option value="journal">Journal</option>
            <option value="map">Map</option>
            <option value="inventory">Inventory</option>
          </select>
        </div>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Additional Information (Optional)
        </Typography>
        <MarkdownEditor
          value={additionalInfo}
          onChange={setAdditionalInfo}
          placeholder="Add any specific requirements or details you want the AI to consider..."
          minHeight={150}
          label="Additional Information"
          error={false}
          autoFocus={false}
        />
      </Box>
      
      <button 
        onClick={handleGenerate} 
        disabled={generating}
        className="primary-button"
      >
        {generating ? 'Generating...' : 'Generate'}
      </button>
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
      
      {result && (
        <div className="result-container">
          <h3>Generation Result</h3>
          
          {generationType === 'character' && result.character && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                {result.character.character.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Role:</strong> {result.character.character.role}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Description:</strong>
              </Typography>
              <Box sx={{ mb: 2 }}>
                <MarkdownMessage 
                  content={result.character.character.description}
                  type="system"
                />
              </Box>
              <Button 
                variant="contained"
                color="primary"
                onClick={() => {
                  // Save to database
                  window.api.character.create(result.character);
                }}
              >
                Save Character
              </Button>
            </Paper>
          )}
          
          {generationType === 'lorebook' && result.lorebook && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                {result.lorebook.metadata.title}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Overview:</strong>
              </Typography>
              <Box sx={{ mb: 2 }}>
                <MarkdownMessage 
                  content={result.lorebook.world.overview}
                  type="system"
                />
              </Box>
              <Button 
                variant="contained"
                color="primary"
                onClick={() => {
                  // Save to database
                  window.api.lorebook.create(result.lorebook);
                }}
              >
                Save Lorebook
              </Button>
            </Paper>
          )}
          
          {generationType === 'supportTool' && result.tool && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                {result.tool.tool.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Type:</strong> {result.tool.tool.type}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Description:</strong>
              </Typography>
              <Box sx={{ mb: 2 }}>
                <MarkdownMessage 
                  content={result.tool.tool.description}
                  type="system"
                />
              </Box>
              <Button 
                variant="contained"
                color="primary"
                onClick={() => {
                  // Save to database
                  window.api.supportTool.create(result.tool);
                }}
              >
                Save Support Tool
              </Button>
            </Paper>
          )}
          
          <details>
            <summary>View Raw JSON</summary>
            <pre className="json-preview">
              {JSON.stringify(
                generationType === 'character' ? result.character : 
                generationType === 'lorebook' ? result.lorebook : 
                result.tool, 
                null, 2
              )}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default AiGenerationPanel;