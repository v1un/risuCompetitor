import React, { useState, useEffect } from 'react';
import AiGenerationPanel from '../components/ai/AiGenerationPanel';

const AiGenerationPage: React.FC = () => {
  const [series, setSeries] = useState<any[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyExists, setApiKeyExists] = useState<boolean>(false);

  // Load series and check API key
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if API key exists
        const geminiKeyResponse = await window.api.apiKey.exists('gemini');
        setApiKeyExists(geminiKeyResponse.exists);
        
        // Load series
        const seriesResponse = await window.api.series.getAll();
        
        if (seriesResponse.success) {
          setSeries(seriesResponse.series);
          
          if (seriesResponse.series.length > 0) {
            setSelectedSeries(seriesResponse.series[0].id);
          }
        } else {
          throw new Error(seriesResponse.error || 'Failed to load series');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, []);

  // Handle series selection
  const handleSeriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeries(e.target.value);
  };

  // Handle API key setup
  const handleApiKeySetup = async () => {
    const apiKey = prompt('Enter your Gemini API key:');
    
    if (apiKey) {
      try {
        const response = await window.api.apiKey.save('gemini', apiKey);
        
        if (response.success) {
          setApiKeyExists(true);
        } else {
          throw new Error(response.error || 'Failed to save API key');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="ai-generation-page">
      <h1>AI Generation</h1>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {!apiKeyExists ? (
        <div className="api-key-setup">
          <p>You need to set up your Gemini API key to use AI generation features.</p>
          <button onClick={handleApiKeySetup}>Set Up API Key</button>
        </div>
      ) : (
        <>
          <div className="series-selector">
            <label htmlFor="series">Select Series:</label>
            <select 
              id="series" 
              value={selectedSeries} 
              onChange={handleSeriesChange}
            >
              {series.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            
            {series.length === 0 && (
              <p className="no-series">
                No series found. Please create a series first.
              </p>
            )}
          </div>
          
          {selectedSeries && (
            <AiGenerationPanel 
              series={series.find(s => s.id === selectedSeries)?.name || ''}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AiGenerationPage;