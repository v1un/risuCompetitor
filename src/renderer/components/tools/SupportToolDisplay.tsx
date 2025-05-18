import React, { useState, useEffect } from 'react';

interface SupportToolDisplayProps {
  sessionId: string;
  tool: any;
}

interface ToolState {
  [key: string]: any;
}

const SupportToolDisplay: React.FC<SupportToolDisplayProps> = ({ sessionId, tool }) => {
  const [toolState, setToolState] = useState<ToolState>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load the latest tool state
  useEffect(() => {
    const loadToolState = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await window.api.toolState.getLatest(sessionId, tool.id);
        
        if (response.success && response.toolState) {
          setToolState(response.toolState.state);
        } else {
          // Initialize with default values if no state exists
          const initialState: ToolState = {};
          
          tool.data.components.forEach((component: any) => {
            initialState[component.id] = component.default_value;
          });
          
          setToolState(initialState);
        }
      } catch (err) {
        setError('Failed to load tool state');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadToolState();
  }, [sessionId, tool.id, tool.data.components]);

  // Update a component value
  const updateComponent = async (componentId: string, value: any) => {
    try {
      setError(null);
      
      // Update local state
      setToolState(prev => ({
        ...prev,
        [componentId]: value
      }));
      
      // Save to database
      const response = await window.api.toolState.add({
        session_id: sessionId,
        tool_id: tool.id,
        state: {
          ...toolState,
          [componentId]: value
        },
        changes: {
          [componentId]: {
            from: toolState[componentId],
            to: value,
            reason: 'Manual update by player'
          }
        }
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update tool state');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error(err);
      
      // Revert to previous state on error
      setToolState(prev => ({
        ...prev
      }));
    }
  };

  // Render a component based on its type
  const renderComponent = (component: any) => {
    const value = toolState[component.id] !== undefined 
      ? toolState[component.id] 
      : component.default_value;
    
    switch (component.type) {
      case 'numeric':
        return (
          <div className="tool-component numeric" key={component.id}>
            <label>{component.name}</label>
            <div className="numeric-control">
              <button 
                onClick={() => updateComponent(component.id, Number(value) - 1)}
                disabled={loading}
              >
                -
              </button>
              <input 
                type="number" 
                value={value} 
                onChange={(e) => updateComponent(component.id, e.target.value)}
                disabled={loading}
              />
              <button 
                onClick={() => updateComponent(component.id, Number(value) + 1)}
                disabled={loading}
              >
                +
              </button>
            </div>
            {component.description && (
              <div className="component-description">{component.description}</div>
            )}
          </div>
        );
        
      case 'text':
        return (
          <div className="tool-component text" key={component.id}>
            <label>{component.name}</label>
            <input 
              type="text" 
              value={value} 
              onChange={(e) => updateComponent(component.id, e.target.value)}
              disabled={loading}
            />
            {component.description && (
              <div className="component-description">{component.description}</div>
            )}
          </div>
        );
        
      case 'progress':
        const min = component.display?.min || 0;
        const max = component.display?.max || 100;
        const format = component.display?.format || '{value}';
        
        return (
          <div className="tool-component progress" key={component.id}>
            <label>{component.name}</label>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${((Number(value) - min) / (max - min)) * 100}%` }}
              ></div>
            </div>
            <div className="progress-value">
              {format.replace('{value}', value)}
            </div>
            <input 
              type="range" 
              min={min} 
              max={max} 
              value={value} 
              onChange={(e) => updateComponent(component.id, e.target.value)}
              disabled={loading}
            />
            {component.description && (
              <div className="component-description">{component.description}</div>
            )}
          </div>
        );
        
      case 'list':
        const items = Array.isArray(value) ? value : [];
        
        return (
          <div className="tool-component list" key={component.id}>
            <label>{component.name}</label>
            <ul className="list-items">
              {items.map((item, index) => (
                <li key={index}>
                  {item}
                  <button 
                    onClick={() => {
                      const newItems = [...items];
                      newItems.splice(index, 1);
                      updateComponent(component.id, newItems);
                    }}
                    disabled={loading}
                    className="remove-item"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="add-item-form">
              <input 
                type="text" 
                placeholder="Add new item" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    updateComponent(component.id, [...items, e.currentTarget.value.trim()]);
                    e.currentTarget.value = '';
                  }
                }}
                disabled={loading}
              />
              <button 
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (input && input.value.trim()) {
                    updateComponent(component.id, [...items, input.value.trim()]);
                    input.value = '';
                  }
                }}
                disabled={loading}
              >
                Add
              </button>
            </div>
            {component.description && (
              <div className="component-description">{component.description}</div>
            )}
          </div>
        );
        
      case 'toggle':
        return (
          <div className="tool-component toggle" key={component.id}>
            <label>
              <input 
                type="checkbox" 
                checked={value === 'true' || value === true} 
                onChange={(e) => updateComponent(component.id, e.target.checked)}
                disabled={loading}
              />
              {component.name}
            </label>
            {component.description && (
              <div className="component-description">{component.description}</div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="tool-component unknown" key={component.id}>
            <label>{component.name}</label>
            <div className="unknown-type">
              Unsupported component type: {component.type}
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return <div className="loading">Loading tool state...</div>;
  }

  return (
    <div className="support-tool-display">
      <div className="tool-header">
        <h3>{tool.data.tool.name}</h3>
        <p className="tool-description">{tool.data.tool.description}</p>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      <div className="tool-components">
        {tool.data.components.map((component: any) => renderComponent(component))}
      </div>
    </div>
  );
};

export default SupportToolDisplay;