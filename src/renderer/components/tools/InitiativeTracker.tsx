import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  TextField, 
  IconButton, 
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Tooltip,
  Collapse,
  FormControlLabel,
  Switch,
  Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CasinoIcon from '@mui/icons-material/Casino';
import TimerIcon from '@mui/icons-material/Timer';
import { v4 as uuidv4 } from 'uuid';

interface Combatant {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  isPlayer: boolean;
  status: string[];
  notes: string;
}

interface InitiativeTrackerProps {
  sessionId: string;
  characters?: any[]; // Character data from the session
  onCombatStateChange?: (isActive: boolean) => void;
  onRoundChange?: (round: number) => void;
  onTurnChange?: (combatant: Combatant) => void;
}

const InitiativeTracker: React.FC<InitiativeTrackerProps> = ({ 
  sessionId, 
  characters = [],
  onCombatStateChange,
  onRoundChange,
  onTurnChange
}) => {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [newCombatantName, setNewCombatantName] = useState<string>('');
  const [newCombatantInitiative, setNewCombatantInitiative] = useState<string>('');
  const [newCombatantHp, setNewCombatantHp] = useState<string>('');
  const [newCombatantMaxHp, setNewCombatantMaxHp] = useState<string>('');
  const [newCombatantAc, setNewCombatantAc] = useState<string>('');
  const [newCombatantIsPlayer, setNewCombatantIsPlayer] = useState<boolean>(false);
  
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editingCombatant, setEditingCombatant] = useState<Combatant | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editInitiative, setEditInitiative] = useState<string>('');
  const [editHp, setEditHp] = useState<string>('');
  const [editMaxHp, setEditMaxHp] = useState<string>('');
  const [editAc, setEditAc] = useState<string>('');
  const [editIsPlayer, setEditIsPlayer] = useState<boolean>(false);
  const [editStatus, setEditStatus] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState<string>('');
  
  const [damageDialogOpen, setDamageDialogOpen] = useState<boolean>(false);
  const [healDialogOpen, setHealDialogOpen] = useState<boolean>(false);
  const [damageAmount, setDamageAmount] = useState<string>('');
  const [healAmount, setHealAmount] = useState<string>('');
  const [targetCombatantId, setTargetCombatantId] = useState<string | null>(null);
  
  const [addStatusDialogOpen, setAddStatusDialogOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('');
  
  const [isCombatActive, setIsCombatActive] = useState<boolean>(false);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [showAddForm, setShowAddForm] = useState<boolean>(true);
  const [showPlayerCharacters, setShowPlayerCharacters] = useState<boolean>(false);
  
  // Common status effects
  const commonStatuses = [
    'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled',
    'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned',
    'Prone', 'Restrained', 'Stunned', 'Unconscious', 'Exhaustion'
  ];

  // Load combatants from database
  useEffect(() => {
    const loadCombatants = async () => {
      try {
        // In a real implementation, this would fetch from the database
        // For now, we'll just use local state
        // const response = await window.api.initiativeTracker.getCombatants(sessionId);
        // if (response.success) {
        //   setCombatants(response.combatants);
        //   setIsCombatActive(response.isActive || false);
        //   setCurrentTurn(response.currentTurn || 0);
        //   setCurrentRound(response.currentRound || 1);
        // }
      } catch (err) {
        console.error('Failed to load combatants:', err);
      }
    };
    
    loadCombatants();
  }, [sessionId]);

  // Notify parent component when combat state changes
  useEffect(() => {
    if (onCombatStateChange) {
      onCombatStateChange(isCombatActive);
    }
  }, [isCombatActive, onCombatStateChange]);

  // Notify parent component when round changes
  useEffect(() => {
    if (onRoundChange) {
      onRoundChange(currentRound);
    }
  }, [currentRound, onRoundChange]);

  // Notify parent component when turn changes
  useEffect(() => {
    if (onTurnChange && combatants.length > 0 && currentTurn < combatants.length) {
      onTurnChange(combatants[currentTurn]);
    }
  }, [currentTurn, combatants, onTurnChange]);

  // Add a new combatant
  const addCombatant = () => {
    if (!newCombatantName.trim()) return;
    
    const initiative = parseInt(newCombatantInitiative) || 0;
    const hp = parseInt(newCombatantHp) || 10;
    const maxHp = parseInt(newCombatantMaxHp) || hp;
    const ac = parseInt(newCombatantAc) || 10;
    
    const newCombatant: Combatant = {
      id: uuidv4(),
      name: newCombatantName.trim(),
      initiative,
      hp,
      maxHp,
      ac,
      isPlayer: newCombatantIsPlayer,
      status: [],
      notes: ''
    };
    
    // Add to list and sort by initiative
    setCombatants(prev => 
      [...prev, newCombatant]
        .sort((a, b) => b.initiative - a.initiative)
    );
    
    // Reset form
    setNewCombatantName('');
    setNewCombatantInitiative('');
    setNewCombatantHp('');
    setNewCombatantMaxHp('');
    setNewCombatantAc('');
    
    // In a real implementation, save to database
    // window.api.initiativeTracker.addCombatant(sessionId, newCombatant);
  };

  // Add a character from the session
  const addCharacter = (character: any) => {
    // Extract relevant data from character
    const newCombatant: Combatant = {
      id: uuidv4(),
      name: character.character.name,
      initiative: 0, // Will be rolled
      hp: character.rpg_attributes.stats.hp || 10,
      maxHp: character.rpg_attributes.stats.hp || 10,
      ac: character.rpg_attributes.stats.ac || 10,
      isPlayer: character.character.role === 'protagonist',
      status: [],
      notes: ''
    };
    
    // Roll initiative (1d20 + dexterity modifier if available)
    const dexMod = character.rpg_attributes.stats.dexterity_mod || 0;
    const initiativeRoll = Math.floor(Math.random() * 20) + 1 + dexMod;
    newCombatant.initiative = initiativeRoll;
    
    // Add to list and sort by initiative
    setCombatants(prev => 
      [...prev, newCombatant]
        .sort((a, b) => b.initiative - a.initiative)
    );
    
    // In a real implementation, save to database
    // window.api.initiativeTracker.addCombatant(sessionId, newCombatant);
  };

  // Remove a combatant
  const removeCombatant = (id: string) => {
    setCombatants(prev => {
      const newCombatants = prev.filter(c => c.id !== id);
      
      // Adjust current turn if needed
      if (isCombatActive && currentTurn >= newCombatants.length) {
        setCurrentTurn(0);
      }
      
      return newCombatants;
    });
    
    // In a real implementation, remove from database
    // window.api.initiativeTracker.removeCombatant(sessionId, id);
  };

  // Edit a combatant
  const openEditDialog = (combatant: Combatant) => {
    setEditingCombatant(combatant);
    setEditName(combatant.name);
    setEditInitiative(combatant.initiative.toString());
    setEditHp(combatant.hp.toString());
    setEditMaxHp(combatant.maxHp.toString());
    setEditAc(combatant.ac.toString());
    setEditIsPlayer(combatant.isPlayer);
    setEditStatus([...combatant.status]);
    setEditNotes(combatant.notes);
    setEditDialogOpen(true);
  };

  // Save edited combatant
  const saveEditedCombatant = () => {
    if (!editingCombatant || !editName.trim()) return;
    
    const updatedCombatant: Combatant = {
      ...editingCombatant,
      name: editName.trim(),
      initiative: parseInt(editInitiative) || 0,
      hp: parseInt(editHp) || 0,
      maxHp: parseInt(editMaxHp) || 0,
      ac: parseInt(editAc) || 0,
      isPlayer: editIsPlayer,
      status: editStatus,
      notes: editNotes
    };
    
    setCombatants(prev => 
      prev.map(c => c.id === editingCombatant.id ? updatedCombatant : c)
        .sort((a, b) => b.initiative - a.initiative)
    );
    
    setEditDialogOpen(false);
    setEditingCombatant(null);
    
    // In a real implementation, update in database
    // window.api.initiativeTracker.updateCombatant(sessionId, updatedCombatant);
  };

  // Apply damage to a combatant
  const openDamageDialog = (id: string) => {
    setTargetCombatantId(id);
    setDamageAmount('');
    setDamageDialogOpen(true);
  };

  // Apply healing to a combatant
  const openHealDialog = (id: string) => {
    setTargetCombatantId(id);
    setHealAmount('');
    setHealDialogOpen(true);
  };

  // Apply damage
  const applyDamage = () => {
    if (!targetCombatantId) return;
    
    const damage = parseInt(damageAmount);
    if (isNaN(damage) || damage <= 0) {
      setDamageDialogOpen(false);
      setTargetCombatantId(null);
      return;
    }
    
    setCombatants(prev => 
      prev.map(c => {
        if (c.id === targetCombatantId) {
          const newHp = Math.max(0, c.hp - damage);
          return {
            ...c,
            hp: newHp,
            status: newHp === 0 && !c.status.includes('Unconscious') 
              ? [...c.status, 'Unconscious'] 
              : c.status
          };
        }
        return c;
      })
    );
    
    setDamageDialogOpen(false);
    setTargetCombatantId(null);
    
    // In a real implementation, update in database
    // window.api.initiativeTracker.updateCombatantHp(sessionId, targetCombatantId, newHp);
  };

  // Apply healing
  const applyHealing = () => {
    if (!targetCombatantId) return;
    
    const healing = parseInt(healAmount);
    if (isNaN(healing) || healing <= 0) {
      setHealDialogOpen(false);
      setTargetCombatantId(null);
      return;
    }
    
    setCombatants(prev => 
      prev.map(c => {
        if (c.id === targetCombatantId) {
          const newHp = Math.min(c.maxHp, c.hp + healing);
          return {
            ...c,
            hp: newHp,
            status: newHp > 0 && c.status.includes('Unconscious')
              ? c.status.filter(s => s !== 'Unconscious')
              : c.status
          };
        }
        return c;
      })
    );
    
    setHealDialogOpen(false);
    setTargetCombatantId(null);
    
    // In a real implementation, update in database
    // window.api.initiativeTracker.updateCombatantHp(sessionId, targetCombatantId, newHp);
  };

  // Add status effect
  const openAddStatusDialog = (id: string) => {
    setTargetCombatantId(id);
    setNewStatus('');
    setAddStatusDialogOpen(true);
  };

  // Add status effect to combatant
  const addStatusEffect = () => {
    if (!targetCombatantId || !newStatus.trim()) return;
    
    setCombatants(prev => 
      prev.map(c => {
        if (c.id === targetCombatantId && !c.status.includes(newStatus.trim())) {
          return {
            ...c,
            status: [...c.status, newStatus.trim()]
          };
        }
        return c;
      })
    );
    
    setAddStatusDialogOpen(false);
    setTargetCombatantId(null);
    
    // In a real implementation, update in database
    // window.api.initiativeTracker.updateCombatantStatus(sessionId, targetCombatantId, status);
  };

  // Remove status effect
  const removeStatusEffect = (combatantId: string, status: string) => {
    setCombatants(prev => 
      prev.map(c => {
        if (c.id === combatantId) {
          return {
            ...c,
            status: c.status.filter(s => s !== status)
          };
        }
        return c;
      })
    );
    
    // In a real implementation, update in database
    // window.api.initiativeTracker.updateCombatantStatus(sessionId, combatantId, newStatus);
  };

  // Start combat
  const startCombat = () => {
    if (combatants.length === 0) return;
    
    setIsCombatActive(true);
    setCurrentTurn(0);
    setCurrentRound(1);
    
    // In a real implementation, update in database
    // window.api.initiativeTracker.updateCombatState(sessionId, true, 0, 1);
  };

  // End combat
  const endCombat = () => {
    setIsCombatActive(false);
    
    // In a real implementation, update in database
    // window.api.initiativeTracker.updateCombatState(sessionId, false, 0, 1);
  };

  // Next turn
  const nextTurn = () => {
    if (!isCombatActive || combatants.length === 0) return;
    
    setCurrentTurn(prev => {
      const next = (prev + 1) % combatants.length;
      
      // If we've gone through all combatants, increment round
      if (next === 0) {
        setCurrentRound(prevRound => prevRound + 1);
      }
      
      return next;
    });
    
    // In a real implementation, update in database
    // window.api.initiativeTracker.updateCombatState(sessionId, true, nextTurn, nextRound);
  };

  // Reset combat
  const resetCombat = () => {
    setIsCombatActive(false);
    setCurrentTurn(0);
    setCurrentRound(1);
    
    // In a real implementation, update in database
    // window.api.initiativeTracker.updateCombatState(sessionId, false, 0, 1);
  };

  // Roll initiative for all
  const rollInitiativeForAll = () => {
    setCombatants(prev => 
      prev.map(c => ({
        ...c,
        initiative: Math.floor(Math.random() * 20) + 1
      })).sort((a, b) => b.initiative - a.initiative)
    );
    
    // In a real implementation, update in database
    // window.api.initiativeTracker.updateAllCombatants(sessionId, updatedCombatants);
  };

  // Move combatant up in initiative order
  const moveCombatantUp = (index: number) => {
    if (index <= 0) return;
    
    setCombatants(prev => {
      const newCombatants = [...prev];
      const temp = newCombatants[index].initiative;
      newCombatants[index].initiative = newCombatants[index - 1].initiative + 1;
      return newCombatants.sort((a, b) => b.initiative - a.initiative);
    });
    
    // In a real implementation, update in database
    // window.api.initiativeTracker.updateAllCombatants(sessionId, updatedCombatants);
  };

  // Move combatant down in initiative order
  const moveCombatantDown = (index: number) => {
    if (index >= combatants.length - 1) return;
    
    setCombatants(prev => {
      const newCombatants = [...prev];
      const temp = newCombatants[index].initiative;
      newCombatants[index].initiative = newCombatants[index + 1].initiative - 1;
      return newCombatants.sort((a, b) => b.initiative - a.initiative);
    });
    
    // In a real implementation, update in database
    // window.api.initiativeTracker.updateAllCombatants(sessionId, updatedCombatants);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TimerIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Initiative Tracker</Typography>
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Combat controls */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isCombatActive ? (
            <>
              <Tooltip title="Next Turn">
                <IconButton onClick={nextTurn} size="small">
                  <SkipNextIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="End Combat">
                <IconButton onClick={endCombat} size="small">
                  <PauseIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Start Combat">
                <IconButton 
                  onClick={startCombat} 
                  size="small"
                  disabled={combatants.length === 0}
                >
                  <PlayArrowIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Roll Initiative for All">
                <IconButton 
                  onClick={rollInitiativeForAll} 
                  size="small"
                  disabled={combatants.length === 0}
                >
                  <CasinoIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Reset Combat">
            <IconButton 
              onClick={resetCombat} 
              size="small"
              disabled={!isCombatActive}
            >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Combat status */}
      {isCombatActive && combatants.length > 0 && (
        <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2">
            Round: {currentRound} | Current Turn: {combatants[currentTurn]?.name}
          </Typography>
        </Box>
      )}
      
      {/* Add combatant form */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">
            Combatants ({combatants.length})
          </Typography>
          <Button 
            size="small" 
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Hide Form' : 'Add Combatant'}
          </Button>
        </Box>
        
        <Collapse in={showAddForm}>
          <Box sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1, mb: 2 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Name"
                  value={newCombatantName}
                  onChange={(e) => setNewCombatantName(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  label="Initiative"
                  type="number"
                  value={newCombatantInitiative}
                  onChange={(e) => setNewCombatantInitiative(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  label="HP"
                  type="number"
                  value={newCombatantHp}
                  onChange={(e) => setNewCombatantHp(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  label="Max HP"
                  type="number"
                  value={newCombatantMaxHp}
                  onChange={(e) => setNewCombatantMaxHp(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  label="AC"
                  type="number"
                  value={newCombatantAc}
                  onChange={(e) => setNewCombatantAc(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newCombatantIsPlayer}
                      onChange={(e) => setNewCombatantIsPlayer(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Player Character"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  variant="contained" 
                  onClick={addCombatant}
                  disabled={!newCombatantName.trim()}
                  fullWidth
                >
                  Add
                </Button>
              </Grid>
            </Grid>
            
            {/* Add from player characters */}
            {characters.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showPlayerCharacters}
                      onChange={(e) => setShowPlayerCharacters(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Add from Player Characters"
                />
                
                <Collapse in={showPlayerCharacters}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {characters.map((character) => (
                      <Chip
                        key={character.metadata.id}
                        label={character.character.name}
                        onClick={() => addCharacter(character)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Collapse>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
      
      {/* Combatants list */}
      {combatants.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No combatants added yet
        </Typography>
      ) : (
        <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
          {combatants.map((combatant, index) => (
            <React.Fragment key={combatant.id}>
              <ListItem 
                sx={{ 
                  bgcolor: isCombatActive && index === currentTurn 
                    ? 'action.selected' 
                    : 'transparent',
                  borderLeft: combatant.isPlayer 
                    ? '3px solid #4caf50' 
                    : '3px solid #f44336'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, width: '30px' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {combatant.initiative}
                  </Typography>
                </Box>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight="medium">
                        {combatant.name}
                      </Typography>
                      {combatant.status.length > 0 && (
                        <Box sx={{ display: 'flex', ml: 1, flexWrap: 'wrap', gap: 0.5 }}>
                          {combatant.status.map((status) => (
                            <Chip
                              key={status}
                              label={status}
                              size="small"
                              onDelete={() => removeStatusEffect(combatant.id, status)}
                              sx={{ height: '20px', fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Tooltip title="Hit Points">
                        <Typography 
                          variant="body2" 
                          color={combatant.hp <= combatant.maxHp * 0.3 ? 'error.main' : 'text.secondary'}
                          sx={{ mr: 2 }}
                        >
                          HP: {combatant.hp}/{combatant.maxHp}
                        </Typography>
                      </Tooltip>
                      
                      <Tooltip title="Armor Class">
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                          AC: {combatant.ac}
                        </Typography>
                      </Tooltip>
                      
                      {combatant.notes && (
                        <Tooltip title={combatant.notes}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              maxWidth: '150px', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {combatant.notes}
                          </Typography>
                        </Tooltip>
                      )}
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Damage">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => openDamageDialog(combatant.id)}
                      >
                        <Typography color="error.main" variant="body2" fontWeight="bold">
                          -
                        </Typography>
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Heal">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => openHealDialog(combatant.id)}
                      >
                        <Typography color="success.main" variant="body2" fontWeight="bold">
                          +
                        </Typography>
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Add Status">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => openAddStatusDialog(combatant.id)}
                      >
                        <Badge 
                          badgeContent={combatant.status.length} 
                          color="primary"
                          sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: '14px', minWidth: '14px' } }}
                        >
                          <AddIcon fontSize="small" />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Edit">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => openEditDialog(combatant)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Remove">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => removeCombatant(combatant.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Move Up">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => moveCombatantUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Move Down">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => moveCombatantDown(index)}
                        disabled={index === combatants.length - 1}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
      
      {/* Edit Combatant Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Combatant</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Initiative"
                type="number"
                value={editInitiative}
                onChange={(e) => setEditInitiative(e.target.value)}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="AC"
                type="number"
                value={editAc}
                onChange={(e) => setEditAc(e.target.value)}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Current HP"
                type="number"
                value={editHp}
                onChange={(e) => setEditHp(e.target.value)}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Max HP"
                type="number"
                value={editMaxHp}
                onChange={(e) => setEditMaxHp(e.target.value)}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editIsPlayer}
                    onChange={(e) => setEditIsPlayer(e.target.checked)}
                  />
                }
                label="Player Character"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Status Effects
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {editStatus.map((status) => (
                  <Chip
                    key={status}
                    label={status}
                    onDelete={() => setEditStatus(prev => prev.filter(s => s !== status))}
                    size="small"
                  />
                ))}
                <Chip
                  icon={<AddIcon />}
                  label="Add"
                  onClick={() => {
                    setNewStatus('');
                    setAddStatusDialogOpen(true);
                  }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveEditedCombatant} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Damage Dialog */}
      <Dialog 
        open={damageDialogOpen} 
        onClose={() => setDamageDialogOpen(false)}
      >
        <DialogTitle>Apply Damage</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Damage Amount"
            type="number"
            value={damageAmount}
            onChange={(e) => setDamageAmount(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDamageDialogOpen(false)}>Cancel</Button>
          <Button onClick={applyDamage} variant="contained" color="error">
            Apply Damage
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Heal Dialog */}
      <Dialog 
        open={healDialogOpen} 
        onClose={() => setHealDialogOpen(false)}
      >
        <DialogTitle>Apply Healing</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Healing Amount"
            type="number"
            value={healAmount}
            onChange={(e) => setHealAmount(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHealDialogOpen(false)}>Cancel</Button>
          <Button onClick={applyHealing} variant="contained" color="success">
            Apply Healing
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Status Dialog */}
      <Dialog 
        open={addStatusDialogOpen} 
        onClose={() => setAddStatusDialogOpen(false)}
      >
        <DialogTitle>Add Status Effect</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Status Effect"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Common Status Effects
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {commonStatuses.map((status) => (
                <Chip
                  key={status}
                  label={status}
                  onClick={() => setNewStatus(status)}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={addStatusEffect} 
            variant="contained" 
            color="primary"
            disabled={!newStatus.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InitiativeTracker;