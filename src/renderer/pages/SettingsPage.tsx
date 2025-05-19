import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyIcon from '@mui/icons-material/Key';
import PaletteIcon from '@mui/icons-material/Palette';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import BuildIcon from '@mui/icons-material/Build';
import KeyboardShortcutsSettings from '../components/settings/KeyboardShortcutsSettings';

// Settings sections
const sections = [
  { id: 'general', label: 'General', icon: <SettingsIcon /> },
  { id: 'api-keys', label: 'API Keys', icon: <KeyIcon /> },
  { id: 'appearance', label: 'Appearance', icon: <PaletteIcon /> },
  { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', icon: <KeyboardIcon /> },
  { id: 'advanced', label: 'Advanced', icon: <BuildIcon /> },
];

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('keyboard-shortcuts');

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  // Render the content for the active section
  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <>
            <Typography variant="h5" gutterBottom>General Settings</Typography>
            <Typography variant="body1">
              General application settings will be displayed here.
            </Typography>
          </>
        );
      case 'api-keys':
        return (
          <>
            <Typography variant="h5" gutterBottom>API Keys</Typography>
            <Typography variant="body1">
              API key management will be displayed here.
            </Typography>
          </>
        );
      case 'appearance':
        return (
          <>
            <Typography variant="h5" gutterBottom>Appearance Settings</Typography>
            <Typography variant="body1">
              Theme and appearance settings will be displayed here.
            </Typography>
          </>
        );
      case 'keyboard-shortcuts':
        return <KeyboardShortcutsSettings />;
      case 'advanced':
        return (
          <>
            <Typography variant="h5" gutterBottom>Advanced Settings</Typography>
            <Typography variant="body1">
              Advanced configuration options will be displayed here.
            </Typography>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {/* Settings navigation */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: '100%' }}>
            <List component="nav" aria-label="settings sections">
              {sections.map((section) => (
                <ListItem key={section.id} disablePadding>
                  <ListItemButton
                    selected={activeSection === section.id}
                    onClick={() => handleSectionChange(section.id)}
                  >
                    <ListItemIcon>
                      {section.icon}
                    </ListItemIcon>
                    <ListItemText primary={section.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Settings content */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, minHeight: '70vh' }}>
            {renderContent()}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;