import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material';

// Default theme options
const defaultLightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6a0dad',
    },
    secondary: {
      main: '#4b0082',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Cinzel", serif',
    },
    h2: {
      fontFamily: '"Cinzel", serif',
    },
    h3: {
      fontFamily: '"Cinzel", serif',
    },
    h4: {
      fontFamily: '"Cinzel", serif',
    },
    h5: {
      fontFamily: '"Cinzel", serif',
    },
    h6: {
      fontFamily: '"Cinzel", serif',
    },
  },
});

const defaultDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9c27b0',
    },
    secondary: {
      main: '#7b1fa2',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Cinzel", serif',
    },
    h2: {
      fontFamily: '"Cinzel", serif',
    },
    h3: {
      fontFamily: '"Cinzel", serif',
    },
    h4: {
      fontFamily: '"Cinzel", serif',
    },
    h5: {
      fontFamily: '"Cinzel", serif',
    },
    h6: {
      fontFamily: '"Cinzel", serif',
    },
  },
});

// Theme context type
interface ThemeContextType {
  themeMode: 'light' | 'dark' | 'custom';
  themeId: string | null;
  customTheme: any | null;
  setThemeMode: (mode: 'light' | 'dark' | 'custom') => void;
  setThemeId: (id: string | null) => void;
  loadTheme: () => Promise<void>;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
interface ThemeContextProviderProps {
  children: ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'custom'>('dark');
  const [themeId, setThemeId] = useState<string | null>(null);
  const [customTheme, setCustomTheme] = useState<any | null>(null);
  
  // Load theme from settings
  const loadTheme = useCallback(async () => {
    try {
      // Get theme settings
      const themeModeResult = await window.api.settings.get('theme.mode');
      const themeIdResult = await window.api.settings.get('theme.id');
      
      const mode = themeModeResult.setting?.value || 'dark';
      const id = themeIdResult.setting?.value || null;
      
      setThemeMode(mode as 'light' | 'dark' | 'custom');
      setThemeId(id);
      
      // If custom theme, load it
      if (mode === 'custom' && id) {
        const themeResult = await window.api.theme.get(id);
        if (themeResult.success && themeResult.theme) {
          setCustomTheme(themeResult.theme.data);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fall back to dark theme
      setThemeMode('dark');
      setThemeId(null);
      setCustomTheme(null);
    }
  }, []);
  
  // Create MUI theme based on current settings
  const theme = useMemo(() => {
    if (themeMode === 'custom' && customTheme) {
      // Convert custom theme to MUI theme
      // This is a simplified version - in a real app, you'd need to map
      // your custom theme format to MUI's theme format
      return createTheme({
        palette: {
          mode: customTheme.base.type === 'dark' ? 'dark' : 'light',
          primary: {
            main: customTheme.colors.primary,
          },
          secondary: {
            main: customTheme.colors.secondary,
          },
          background: {
            default: customTheme.colors.background.primary,
            paper: customTheme.colors.background.secondary,
          },
          text: {
            primary: customTheme.colors.text.primary,
            secondary: customTheme.colors.text.secondary,
          },
        },
        typography: {
          fontFamily: customTheme.typography.fontFamily.primary,
          h1: {
            fontFamily: customTheme.typography.fontFamily.secondary,
          },
          h2: {
            fontFamily: customTheme.typography.fontFamily.secondary,
          },
          h3: {
            fontFamily: customTheme.typography.fontFamily.secondary,
          },
          h4: {
            fontFamily: customTheme.typography.fontFamily.secondary,
          },
          h5: {
            fontFamily: customTheme.typography.fontFamily.secondary,
          },
          h6: {
            fontFamily: customTheme.typography.fontFamily.secondary,
          },
        },
      });
    }
    
    return themeMode === 'light' ? defaultLightTheme : defaultDarkTheme;
  }, [themeMode, customTheme]);
  
  // Update theme mode in settings
  const handleSetThemeMode = useCallback(async (mode: 'light' | 'dark' | 'custom') => {
    try {
      await window.api.settings.set('theme.mode', mode, 'theme');
      setThemeMode(mode);
    } catch (error) {
      console.error('Error setting theme mode:', error);
    }
  }, []);
  
  // Update theme ID in settings
  const handleSetThemeId = useCallback(async (id: string | null) => {
    try {
      if (id) {
        await window.api.settings.set('theme.id', id, 'theme');
        
        // Load the custom theme
        const themeResult = await window.api.theme.get(id);
        if (themeResult.success && themeResult.theme) {
          setCustomTheme(themeResult.theme.data);
        }
      } else {
        await window.api.settings.set('theme.id', '', 'theme');
        setCustomTheme(null);
      }
      
      setThemeId(id);
    } catch (error) {
      console.error('Error setting theme ID:', error);
    }
  }, []);
  
  const contextValue = useMemo(() => ({
    themeMode,
    themeId,
    customTheme,
    setThemeMode: handleSetThemeMode,
    setThemeId: handleSetThemeId,
    loadTheme,
  }), [themeMode, themeId, customTheme, handleSetThemeMode, handleSetThemeId, loadTheme]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Hook for using the theme context
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};