import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  IconButton, 
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CasinoIcon from '@mui/icons-material/Casino';
import TimerIcon from '@mui/icons-material/Timer';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MapIcon from '@mui/icons-material/Map';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';

import DiceRoller from './DiceRoller';
import InitiativeTracker from './InitiativeTracker';
import InventoryManager from './InventoryManager';
import QuestTracker from './QuestTracker';

interface ToolsPanelProps {
  sessionId: string;
  characters?: any[];
}

type ToolType = 'dice' | 'initiative' | 'inventory' | 'quests' | 'map' | 'characters';

interface ActiveTool {
  id: string;
  type: ToolType;
  label: string;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ 
  sessionId,
  characters = []
}) => {
  const [activeTools, setActiveTools] = useState<ActiveTool[]>([
    { id: 'dice-roller', type: 'dice', label: 'Dice Roller' }
  ]);
  
  const [currentToolIndex, setCurrentToolIndex] = useState<number>(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentToolIndex(newValue);
  };

  // Open tool menu
  const handleOpenToolMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Close tool menu
  const handleCloseToolMenu = () => {
    setMenuAnchorEl(null);
  };

  // Add a new tool
  const addTool = (type: ToolType) => {
    const toolLabels: Record<ToolType, string> = {
      dice: 'Dice Roller',
      initiative: 'Initiative Tracker',
      inventory: 'Inventory',
      quests: 'Quests',
      map: 'Map',
      characters: 'Characters'
    };
    
    // Check if tool already exists
    const existingToolIndex = activeTools.findIndex(tool => tool.type === type);
    
    if (existingToolIndex >= 0) {
      // Switch to existing tool
      setCurrentToolIndex(existingToolIndex);
    } else {
      // Add new tool
      const newTool: ActiveTool = {
        id: `${type}-${Date.now()}`,
        type,
        label: toolLabels[type]
      };
      
      setActiveTools(prev => [...prev, newTool]);
      setCurrentToolIndex(activeTools.length);
    }
    
    handleCloseToolMenu();
  };

  // Close a tool
  const closeTool = (index: number) => {
    setActiveTools(prev => prev.filter((_, i) => i !== index));
    
    // Adjust current tool index if needed
    if (currentToolIndex >= index && currentToolIndex > 0) {
      setCurrentToolIndex(currentToolIndex - 1);
    } else if (activeTools.length === 1) {
      // If closing the last tool, add dice roller as default
      setActiveTools([{ id: 'dice-roller', type: 'dice', label: 'Dice Roller' }]);
      setCurrentToolIndex(0);
    }
  };

  // Render the current tool
  const renderTool = (tool: ActiveTool) => {
    switch (tool.type) {
      case 'dice':
        return <DiceRoller sessionId={sessionId} />;
      case 'initiative':
        return <InitiativeTracker sessionId={sessionId} characters={characters} />;
      case 'inventory':
        return <InventoryManager sessionId={sessionId} />;
      case 'quests':
        return <QuestTracker sessionId={sessionId} />;
      case 'map':
        return (
          <Paper elevation={3} sx={{ p: 2, mb: 2, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Map Tool (Coming Soon)
            </Typography>
          </Paper>
        );
      case 'characters':
        return (
          <Paper elevation={3} sx={{ p: 2, mb: 2, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Character Manager (Coming Soon)
            </Typography>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex' }}>
        <Tabs 
          value={currentToolIndex} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ flexGrow: 1 }}
        >
          {activeTools.map((tool, index) => (
            <Tab 
              key={tool.id} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {tool.label}
                  {activeTools.length > 1 && (
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTool(index);
                      }}
                      sx={{ ml: 1, p: 0.2 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              } 
            />
          ))}
        </Tabs>
        <Tooltip title="Add Tool">
          <IconButton onClick={handleOpenToolMenu}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Tool content */}
      <Box sx={{ p: 2 }}>
        {activeTools.length > 0 && currentToolIndex < activeTools.length && 
          renderTool(activeTools[currentToolIndex])
        }
      </Box>
      
      {/* Add tool menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseToolMenu}
      >
        <MenuItem onClick={() => addTool('dice')}>
          <ListItemIcon>
            <CasinoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dice Roller</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => addTool('initiative')}>
          <ListItemIcon>
            <TimerIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Initiative Tracker</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => addTool('inventory')}>
          <ListItemIcon>
            <InventoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Inventory Manager</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => addTool('quests')}>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Quest Tracker</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => addTool('map')}>
          <ListItemIcon>
            <MapIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Map (Coming Soon)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => addTool('characters')}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Characters (Coming Soon)</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ToolsPanel;