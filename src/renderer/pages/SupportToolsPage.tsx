import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  TextField, 
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import DiceIcon from '@mui/icons-material/Casino';
import MapIcon from '@mui/icons-material/Map';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ImageIcon from '@mui/icons-material/Image';
import CalculateIcon from '@mui/icons-material/Calculate';
import TimerIcon from '@mui/icons-material/Timer';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useKeyboardShortcut } from '../contexts/KeyboardShortcutContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tool-tabpanel-${index}`}
      aria-labelledby={`tool-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SupportToolsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [diceResult, setDiceResult] = useState<string | null>(null);
  const [diceFormula, setDiceFormula] = useState('1d20');
  const [diceHistory, setDiceHistory] = useState<string[]>([]);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState('05:00');
  
  // Register keyboard shortcuts
  useKeyboardShortcut('tools-roll-dice', 'r', () => handleRollDice(), {
    ctrlKey: true,
    description: 'Roll dice with current formula',
    category: 'tools',
    preventDefault: true
  });
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Dice Roller
  const handleRollDice = () => {
    try {
      const result = rollDice(diceFormula);
      setDiceResult(result);
      setDiceHistory(prev => [result, ...prev].slice(0, 10));
    } catch (error) {
      setDiceResult(`Error: ${error instanceof Error ? error.message : 'Invalid formula'}`);
    }
  };
  
  const rollDice = (formula: string): string => {
    // Basic dice rolling implementation
    const diceRegex = /(\d+)d(\d+)([+-]\d+)?/i;
    const match = formula.match(diceRegex);
    
    if (!match) {
      throw new Error('Invalid dice formula');
    }
    
    const numDice = parseInt(match[1], 10);
    const numSides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;
    
    if (numDice > 100) {
      throw new Error('Too many dice (max 100)');
    }
    
    if (numSides > 1000) {
      throw new Error('Too many sides (max 1000)');
    }
    
    let total = 0;
    const rolls: number[] = [];
    
    for (let i = 0; i < numDice; i++) {
      const roll = Math.floor(Math.random() * numSides) + 1;
      rolls.push(roll);
      total += roll;
    }
    
    total += modifier;
    
    const rollsText = rolls.join(' + ');
    const modifierText = modifier !== 0 ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : '';
    
    return `${formula} = ${total} [${rollsText}${modifierText}]`;
  };
  
  // Timer
  const handleStartTimer = () => {
    if (timerRunning) return;
    
    const totalSeconds = timerMinutes * 60 + timerSeconds;
    let remainingSeconds = totalSeconds;
    
    setTimerRunning(true);
    
    const intervalId = setInterval(() => {
      remainingSeconds -= 1;
      
      if (remainingSeconds <= 0) {
        clearInterval(intervalId);
        setTimerRunning(false);
        setTimerDisplay('00:00');
        // In a real implementation, we would play a sound here
        alert('Timer finished!');
      } else {
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        setTimerDisplay(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    // Store the interval ID to clear it later
    return () => clearInterval(intervalId);
  };
  
  const handleStopTimer = () => {
    setTimerRunning(false);
    setTimerDisplay(`${timerMinutes.toString().padStart(2, '0')}:${timerSeconds.toString().padStart(2, '0')}`);
  };
  
  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerDisplay(`${timerMinutes.toString().padStart(2, '0')}:${timerSeconds.toString().padStart(2, '0')}`);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Game Master Tools
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="GM tools tabs">
          <Tab icon={<DiceIcon />} label="Dice Roller" id="tool-tab-0" aria-controls="tool-tabpanel-0" />
          <Tab icon={<CalculateIcon />} label="Calculator" id="tool-tab-1" aria-controls="tool-tabpanel-1" />
          <Tab icon={<TimerIcon />} label="Timer" id="tool-tab-2" aria-controls="tool-tabpanel-2" />
          <Tab icon={<MapIcon />} label="Maps" id="tool-tab-3" aria-controls="tool-tabpanel-3" />
          <Tab icon={<MusicNoteIcon />} label="Sound Board" id="tool-tab-4" aria-controls="tool-tabpanel-4" />
          <Tab icon={<ImageIcon />} label="Image Gallery" id="tool-tab-5" aria-controls="tool-tabpanel-5" />
        </Tabs>
      </Box>
      
      {/* Dice Roller */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dice Roller
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    label="Dice Formula"
                    value={diceFormula}
                    onChange={(e) => setDiceFormula(e.target.value)}
                    fullWidth
                    margin="normal"
                    helperText="Examples: 1d20, 3d6+2, 2d8-1"
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleRollDice}
                    startIcon={<DiceIcon />}
                    sx={{ mt: 1 }}
                  >
                    Roll Dice
                  </Button>
                </Box>
                
                {diceResult && (
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      mt: 2, 
                      backgroundColor: 'background.paper',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="h5">
                      {diceResult}
                    </Typography>
                    <IconButton 
                      size="small"
                      onClick={() => navigator.clipboard.writeText(diceResult)}
                      title="Copy result"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Roll History
                </Typography>
                {diceHistory.length === 0 ? (
                  <Typography color="text.secondary">
                    No rolls yet. Roll some dice to see your history.
                  </Typography>
                ) : (
                  <List>
                    {diceHistory.map((roll, index) => (
                      <ListItem key={index} divider={index < diceHistory.length - 1}>
                        <ListItemIcon>
                          <DiceIcon />
                        </ListItemIcon>
                        <ListItemText primary={roll} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Calculator */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Game Calculator
            </Typography>
            <Typography color="text.secondary">
              Calculator functionality would be implemented here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Timer */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Game Timer
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TextField
                label="Minutes"
                type="number"
                value={timerMinutes}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setTimerMinutes(isNaN(value) ? 0 : Math.max(0, Math.min(99, value)));
                }}
                disabled={timerRunning}
                sx={{ width: 100, mr: 2 }}
              />
              <Typography variant="h6" sx={{ mx: 1 }}>:</Typography>
              <TextField
                label="Seconds"
                type="number"
                value={timerSeconds}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setTimerSeconds(isNaN(value) ? 0 : Math.max(0, Math.min(59, value)));
                }}
                disabled={timerRunning}
                sx={{ width: 100 }}
              />
            </Box>
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h2" component="div">
                {timerDisplay}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              {!timerRunning ? (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleStartTimer}
                  disabled={timerMinutes === 0 && timerSeconds === 0}
                >
                  Start
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={handleStopTimer}
                >
                  Stop
                </Button>
              )}
              <Button 
                variant="outlined"
                onClick={handleResetTimer}
                startIcon={<RefreshIcon />}
              >
                Reset
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Maps */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Battle Maps
            </Typography>
            <Typography color="text.secondary">
              Map functionality would be implemented here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Sound Board */}
      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sound Board
            </Typography>
            <Typography color="text.secondary">
              Sound board functionality would be implemented here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Image Gallery */}
      <TabPanel value={tabValue} index={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Image Gallery
            </Typography>
            <Typography color="text.secondary">
              Image gallery functionality would be implemented here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default SupportToolsPage;