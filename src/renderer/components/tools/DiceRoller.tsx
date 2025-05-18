import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  TextField, 
  IconButton, 
  Tooltip,
  Grid,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import CasinoIcon from '@mui/icons-material/Casino';
import { v4 as uuidv4 } from 'uuid';

interface DiceRoll {
  id: string;
  formula: string;
  result: number;
  breakdown: string;
  timestamp: string;
  label?: string;
}

interface DiceRollerProps {
  sessionId: string;
  onRollComplete?: (roll: DiceRoll) => void;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ sessionId, onRollComplete }) => {
  const [diceFormula, setDiceFormula] = useState<string>('1d20');
  const [rollLabel, setRollLabel] = useState<string>('');
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quickRolls, setQuickRolls] = useState<{formula: string, label: string}[]>([
    { formula: '1d20', label: 'D20' },
    { formula: '2d6', label: '2D6' },
    { formula: '3d6', label: '3D6' },
    { formula: '1d100', label: 'D100' },
    { formula: '4d6k3', label: 'Ability' }
  ]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);
  const [customRollFormula, setCustomRollFormula] = useState<string>('');
  const [customRollLabel, setCustomRollLabel] = useState<string>('');
  const [showAddCustomRoll, setShowAddCustomRoll] = useState<boolean>(false);

  // Load roll history from database
  useEffect(() => {
    const loadRollHistory = async () => {
      try {
        // In a real implementation, this would fetch from the database
        // For now, we'll just use local state
        // const response = await window.api.diceRoller.getHistory(sessionId);
        // if (response.success) {
        //   setRollHistory(response.history);
        // }
      } catch (err) {
        console.error('Failed to load dice roll history:', err);
      }
    };
    
    loadRollHistory();
  }, [sessionId]);

  // Parse and roll dice
  const rollDice = (formula: string, label: string = '') => {
    setIsRolling(true);
    setError(null);
    
    try {
      // Parse the dice formula
      const result = parseDiceFormula(formula);
      
      // Create roll object
      const roll: DiceRoll = {
        id: uuidv4(),
        formula,
        result: result.total,
        breakdown: result.breakdown,
        timestamp: new Date().toISOString(),
        label: label || undefined
      };
      
      // Update state
      setLastRoll(roll);
      setRollHistory(prev => [roll, ...prev].slice(0, 50)); // Keep last 50 rolls
      
      // In a real implementation, save to database
      // window.api.diceRoller.saveRoll(sessionId, roll);
      
      // Call callback if provided
      if (onRollComplete) {
        onRollComplete(roll);
      }
      
      return roll;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error('Dice rolling error:', err);
      return null;
    } finally {
      setIsRolling(false);
    }
  };

  // Handle roll button click
  const handleRoll = () => {
    rollDice(diceFormula, rollLabel);
    setRollLabel('');
  };

  // Handle quick roll button click
  const handleQuickRoll = (formula: string, label: string) => {
    rollDice(formula, label);
  };

  // Add custom roll to quick rolls
  const addCustomRoll = () => {
    if (!customRollFormula) return;
    
    try {
      // Validate formula by attempting to parse it
      parseDiceFormula(customRollFormula);
      
      // Add to quick rolls
      setQuickRolls(prev => [
        ...prev, 
        { 
          formula: customRollFormula, 
          label: customRollLabel || customRollFormula 
        }
      ]);
      
      // Reset form
      setCustomRollFormula('');
      setCustomRollLabel('');
      setShowAddCustomRoll(false);
    } catch (err) {
      setError(`Invalid dice formula: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Remove a quick roll
  const removeQuickRoll = (index: number) => {
    setQuickRolls(prev => prev.filter((_, i) => i !== index));
  };

  // Clear roll history
  const clearHistory = () => {
    setRollHistory([]);
    // In a real implementation, clear from database
    // window.api.diceRoller.clearHistory(sessionId);
  };

  // Parse dice formula and calculate result
  const parseDiceFormula = (formula: string): { total: number, breakdown: string } => {
    // Basic validation
    if (!formula.trim()) {
      throw new Error('Empty dice formula');
    }
    
    // Regex to match dice notation (e.g., 2d6, 1d20+5, 4d6k3)
    const diceRegex = /(\d+)d(\d+)(?:k(\d+))?/gi;
    
    // Replace dice notation with actual rolls
    let breakdown = formula;
    let total = 0;
    
    // Track all dice parts for final calculation
    const diceParts: { original: string, result: number }[] = [];
    
    // Process each dice group
    let match;
    while ((match = diceRegex.exec(formula)) !== null) {
      const [fullMatch, countStr, sidesStr, keepStr] = match;
      const count = parseInt(countStr, 10);
      const sides = parseInt(sidesStr, 10);
      const keep = keepStr ? parseInt(keepStr, 10) : count;
      
      if (count <= 0 || sides <= 0 || keep <= 0 || keep > count) {
        throw new Error(`Invalid dice parameters: ${fullMatch}`);
      }
      
      // Roll the dice
      const rolls: number[] = [];
      for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }
      
      // Sort and keep highest if using 'k' notation
      if (keep < count) {
        rolls.sort((a, b) => b - a);
        rolls.splice(keep);
      }
      
      // Calculate sum
      const sum = rolls.reduce((acc, val) => acc + val, 0);
      
      // Store for final calculation
      diceParts.push({
        original: fullMatch,
        result: sum
      });
      
      // Update breakdown
      breakdown = breakdown.replace(
        fullMatch, 
        `${sum}[${rolls.join(', ')}]`
      );
    }
    
    // Calculate final total using eval (careful with this in production!)
    // For a real implementation, use a proper expression parser
    try {
      // Replace dice parts with their results
      let evalFormula = formula;
      for (const part of diceParts) {
        evalFormula = evalFormula.replace(part.original, part.result.toString());
      }
      
      // Basic sanitization - only allow numbers and basic operators
      if (!/^[0-9+\-*/() ]+$/.test(evalFormula)) {
        throw new Error('Formula contains invalid characters');
      }
      
      // Calculate total
      total = eval(evalFormula);
      
      if (isNaN(total)) {
        throw new Error('Invalid calculation result');
      }
    } catch (err) {
      throw new Error(`Failed to calculate result: ${err instanceof Error ? err.message : String(err)}`);
    }
    
    return { total, breakdown };
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CasinoIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Dice Roller</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Roll History">
          <IconButton onClick={() => setShowHistory(!showHistory)}>
            <HistoryIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Main dice roller */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={7}>
            <TextField
              label="Dice Formula"
              value={diceFormula}
              onChange={(e) => setDiceFormula(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g., 2d6+3, 1d20, 4d6k3"
              helperText="XdY+Z format, 'k' to keep highest (e.g., 4d6k3)"
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              label="Label (optional)"
              value={rollLabel}
              onChange={(e) => setRollLabel(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g., Attack Roll"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={handleRoll}
            disabled={isRolling}
            startIcon={<CasinoIcon />}
          >
            Roll Dice
          </Button>
        </Box>
      </Box>
      
      {/* Quick rolls */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Quick Rolls</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {quickRolls.map((roll, index) => (
            <Chip
              key={index}
              label={roll.label}
              onClick={() => handleQuickRoll(roll.formula, roll.label)}
              onDelete={() => removeQuickRoll(index)}
              deleteIcon={<DeleteIcon />}
              variant="outlined"
            />
          ))}
          <Chip
            icon={<AddIcon />}
            label="Add"
            onClick={() => setShowAddCustomRoll(!showAddCustomRoll)}
            variant="outlined"
          />
        </Box>
        
        <Collapse in={showAddCustomRoll}>
          <Box sx={{ mt: 2, p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Add Custom Roll</Typography>
            <Grid container spacing={1}>
              <Grid item xs={5}>
                <TextField
                  label="Formula"
                  value={customRollFormula}
                  onChange={(e) => setCustomRollFormula(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="e.g., 2d6+3"
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="Label"
                  value={customRollLabel}
                  onChange={(e) => setCustomRollLabel(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="e.g., Damage"
                />
              </Grid>
              <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={addCustomRoll}
                  disabled={!customRollFormula}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Box>
      
      {/* Last roll result */}
      {lastRoll && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle1">
            {lastRoll.label ? `${lastRoll.label}: ` : ''}
            <strong>{lastRoll.result}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Formula: {lastRoll.formula}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Breakdown: {lastRoll.breakdown}
          </Typography>
        </Box>
      )}
      
      {/* Error message */}
      {error && (
        <Box sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error.contrastText">{error}</Typography>
        </Box>
      )}
      
      {/* Roll history */}
      <Collapse in={showHistory}>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Roll History</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button 
              size="small" 
              onClick={clearHistory}
              disabled={rollHistory.length === 0}
            >
              Clear
            </Button>
          </Box>
          
          {rollHistory.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No rolls yet
            </Typography>
          ) : (
            <List dense sx={{ maxHeight: '200px', overflow: 'auto' }}>
              {rollHistory.map((roll) => (
                <React.Fragment key={roll.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography>
                          {roll.label ? `${roll.label}: ` : ''}
                          <strong>{roll.result}</strong> ({roll.formula})
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2">
                          {new Date(roll.timestamp).toLocaleTimeString()} - {roll.breakdown}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DiceRoller;