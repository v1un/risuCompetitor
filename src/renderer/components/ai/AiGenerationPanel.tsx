import React, { useState } from 'react';

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
      
      <div className="form-group">
        <label htmlFor="additionalInfo">Additional Information (Optional)</label>
        <textarea 
          id="additionalInfo" 
          value={additionalInfo} 
          onChange={(e) => setAdditionalInfo(e.target.value)}
          disabled={generating}
          placeholder="Add any specific requirements or details you want the AI to consider..."
          rows={4}
        />
      </div>
      
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
            <div className="character-result">
              <h4>{result.character.character.name}</h4>
              <p><strong>Role:</strong> {result.character.character.role}</p>
              <p><strong>Description:</strong> {result.character.character.description}</p>
              <button 
                onClick={() => {
                  // Save to database
                  window.api.character.create(result.character);
                }}
                className="secondary-button"
              >
                Save Character
              </button>
            </div>
          )}
          
          {generationType === 'lorebook' && result.lorebook && (
            <div className="lorebook-result">
              <h4>{result.lorebook.metadata.title}</h4>
              <p><strong>Overview:</strong> {result.lorebook.world.overview}</p>
              <button 
                onClick={() => {
                  // Save to database
                  window.api.lorebook.create(result.lorebook);
                }}
                className="secondary-button"
              >
                Save Lorebook
              </button>
            </div>
          )}
          
          {generationType === 'supportTool' && result.tool && (
            <div className="tool-result">
              <h4>{result.tool.tool.name}</h4>
              <p><strong>Type:</strong> {result.tool.tool.type}</p>
              <p><strong>Description:</strong> {result.tool.tool.description}</p>
              <button 
                onClick={() => {
                  // Save to database
                  window.api.supportTool.create(result.tool);
                }}
                className="secondary-button"
              >
                Save Support Tool
              </button>
            </div>
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