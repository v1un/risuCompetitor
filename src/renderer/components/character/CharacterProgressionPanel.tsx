/**
 * CharacterProgressionPanel.tsx
 * Component for displaying and managing character progression, experience, and advancement
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Check as CheckIcon,
  Star as StarIcon,
  EmojiEvents as AchievementIcon,
  Explore as DiscoveryIcon,
  People as RelationshipIcon,
  History as HistoryIcon,
  School as SkillIcon,
  FitnessCenter as AttributeIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  ArrowUpward as LevelUpIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  characterProgressionService,
  ProgressionEvent
} from '../../services/CharacterProgressionService';
import {
  CharacterProgression,
  Attribute,
  Skill,
  Milestone,
  ExperienceEntry,
  ExperienceSource,
  AttributeType,
  SkillCategory,
  MilestoneType,
  LevelUpResult,
  SkillImprovementResult,
  AttributeImprovementResult,
  MilestoneCompletionResult,
  ExperienceGainResult
} from '../../../shared/types/progression';

// Props for the character progression panel
interface CharacterProgressionPanelProps {
  characterId: string;
  onLevelUp?: (result: LevelUpResult) => void;
  onExperienceGain?: (result: ExperienceGainResult) => void;
  readOnly?: boolean;
}

// Main component
const CharacterProgressionPanel: React.FC<CharacterProgressionPanelProps> = ({
  characterId,
  onLevelUp,
  onExperienceGain,
  readOnly = false
}) => {
  const theme = useTheme();
  const [progression, setProgression] = useState<CharacterProgression | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [addExperienceOpen, setAddExperienceOpen] = useState<boolean>(false);
  const [experienceAmount, setExperienceAmount] = useState<number>(100);
  const [experienceSource, setExperienceSource] = useState<ExperienceSource>(ExperienceSource.ROLEPLAY);
  const [experienceDescription, setExperienceDescription] = useState<string>('');
  const [attributeDialogOpen, setAttributeDialogOpen] = useState<boolean>(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [attributePoints, setAttributePoints] = useState<number>(1);
  const [skillDialogOpen, setSkillDialogOpen] = useState<boolean>(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [skillPoints, setSkillPoints] = useState<number>(1);
  const [levelUpDialogOpen, setLevelUpDialogOpen] = useState<boolean>(false);
  const [levelUpResult, setLevelUpResult] = useState<LevelUpResult | null>(null);
  const [experienceHistoryOpen, setExperienceHistoryOpen] = useState<boolean>(false);
  
  // Load progression on mount
  useEffect(() => {
    loadProgression();
    
    // Listen for progression events
    const handleProgressionEvent = (event: ProgressionEvent) => {
      if (event.characterId === characterId) {
        loadProgression();
        
        // Handle specific events
        if (event.type === 'level_up' && onLevelUp) {
          onLevelUp(event.data);
        }
        
        if (event.type === 'experience_gain' && onExperienceGain) {
          onExperienceGain(event.data);
        }
      }
    };
    
    characterProgressionService.addEventListener(handleProgressionEvent);
    
    return () => {
      characterProgressionService.removeEventListener(handleProgressionEvent);
    };
  }, [characterId, onLevelUp, onExperienceGain]);
  
  // Load progression data
  const loadProgression = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const prog = await characterProgressionService.getProgression(characterId);
      setProgression(prog);
    } catch (err) {
      console.error('Error loading progression:', err);
      setError('Failed to load character progression');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle add experience
  const handleAddExperience = async () => {
    if (!progression) return;
    
    try {
      const result = await characterProgressionService.addExperience(
        characterId,
        experienceAmount,
        experienceSource,
        experienceDescription
      );
      
      // Reset form
      setExperienceAmount(100);
      setExperienceSource(ExperienceSource.ROLEPLAY);
      setExperienceDescription('');
      setAddExperienceOpen(false);
      
      // Check for level up
      if (result.leveledUp && result.newLevel) {
        setLevelUpResult({
          success: true,
          previousLevel: result.newLevel - 1,
          newLevel: result.newLevel,
          attributePointsGained: 0, // Will be updated when progression reloads
          skillPointsGained: 0, // Will be updated when progression reloads
          newFeatures: [],
          message: `Leveled up to ${result.newLevel}!`
        });
        setLevelUpDialogOpen(true);
      }
    } catch (err) {
      console.error('Error adding experience:', err);
    }
  };
  
  // Handle improve attribute
  const handleImproveAttribute = async () => {
    if (!progression || !selectedAttributeId) return;
    
    try {
      await characterProgressionService.improveAttribute(
        characterId,
        selectedAttributeId,
        attributePoints
      );
      
      // Reset form
      setSelectedAttributeId(null);
      setAttributePoints(1);
      setAttributeDialogOpen(false);
    } catch (err) {
      console.error('Error improving attribute:', err);
    }
  };
  
  // Handle improve skill
  const handleImproveSkill = async () => {
    if (!progression || !selectedSkillId) return;
    
    try {
      await characterProgressionService.improveSkill(
        characterId,
        selectedSkillId,
        skillPoints
      );
      
      // Reset form
      setSelectedSkillId(null);
      setSkillPoints(1);
      setSkillDialogOpen(false);
    } catch (err) {
      console.error('Error improving skill:', err);
    }
  };
  
  // Handle complete milestone
  const handleCompleteMilestone = async (milestoneId: string) => {
    if (!progression) return;
    
    try {
      await characterProgressionService.completeMilestone(
        characterId,
        milestoneId
      );
    } catch (err) {
      console.error('Error completing milestone:', err);
    }
  };
  
  // Handle level up
  const handleLevelUp = async () => {
    if (!progression) return;
    
    try {
      const result = await characterProgressionService.levelUp(characterId);
      
      if (result.success) {
        setLevelUpResult(result);
        setLevelUpDialogOpen(true);
      }
    } catch (err) {
      console.error('Error leveling up:', err);
    }
  };
  
  // Format experience source
  const formatExperienceSource = (source: ExperienceSource): string => {
    return source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get milestone icon
  const getMilestoneIcon = (type: MilestoneType) => {
    switch (type) {
      case MilestoneType.STORY:
        return <StarIcon />;
      case MilestoneType.ACHIEVEMENT:
        return <AchievementIcon />;
      case MilestoneType.DISCOVERY:
        return <DiscoveryIcon />;
      case MilestoneType.RELATIONSHIP:
        return <RelationshipIcon />;
      default:
        return <InfoIcon />;
    }
  };
  
  // Get attribute modifier string
  const getAttributeModifier = (modifier: number): string => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };
  
  // Calculate experience percentage
  const calculateExperiencePercentage = (): number => {
    if (!progression) return 0;
    
    if (progression.experienceToNextLevel <= 0) return 100;
    
    const prevLevelExp = progression.experience - (progression.experienceToNextLevel || 0);
    const totalNeeded = progression.experienceToNextLevel;
    const current = progression.experience - prevLevelExp;
    
    return Math.min(100, Math.round((current / totalNeeded) * 100));
  };
  
  // Render loading state
  if (loading && !progression) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={loadProgression} 
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  // Render empty state
  if (!progression) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No progression data available</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      {/* Header with level and experience */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                {progression.level}
              </Box>
              <Box>
                <Typography variant="h6">Level {progression.level}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {progression.experience} XP total
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  Experience to Level {progression.level + 1}:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {progression.experienceToNextLevel > 0 
                    ? `${progression.experienceToNextLevel} XP needed` 
                    : 'Max level reached'}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={calculateExperiencePercentage()} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                {!readOnly && (
                  <>
                    <Button 
                      size="small" 
                      startIcon={<AddIcon />}
                      onClick={() => setAddExperienceOpen(true)}
                    >
                      Add XP
                    </Button>
                    
                    {progression.experienceToNextLevel <= 0 ? (
                      <Button 
                        size="small" 
                        disabled
                        variant="outlined"
                      >
                        Max Level
                      </Button>
                    ) : (
                      <Button 
                        size="small" 
                        startIcon={<LevelUpIcon />}
                        variant="contained"
                        onClick={handleLevelUp}
                        disabled={progression.experience < progression.experienceToNextLevel}
                      >
                        Level Up
                      </Button>
                    )}
                  </>
                )}
                
                <Button 
                  size="small" 
                  startIcon={<HistoryIcon />}
                  onClick={() => setExperienceHistoryOpen(true)}
                >
                  History
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Unspent points */}
      {(progression.unspentAttributePoints > 0 || progression.unspentSkillPoints > 0) && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
          <Typography variant="subtitle1" gutterBottom>
            Available Points
          </Typography>
          <Grid container spacing={2}>
            {progression.unspentAttributePoints > 0 && (
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttributeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography>
                    {progression.unspentAttributePoints} Attribute Point{progression.unspentAttributePoints !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {progression.unspentSkillPoints > 0 && (
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SkillIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography>
                    {progression.unspentSkillPoints} Skill Point{progression.unspentSkillPoints !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
      
      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Attributes" />
        <Tab label="Skills" />
        <Tab label="Milestones" />
      </Tabs>
      
      {/* Attributes tab */}
      {activeTab === 0 && (
        <Grid container spacing={2}>
          {progression.attributes.map((attribute) => (
            <Grid item xs={12} sm={6} md={4} key={attribute.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{attribute.name}</Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.background.default,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {attribute.value}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Modifier: {getAttributeModifier(attribute.modifier)}
                  </Typography>
                  
                  {attribute.description && (
                    <Typography variant="body2" color="text.secondary">
                      {attribute.description}
                    </Typography>
                  )}
                </CardContent>
                
                {!readOnly && progression.unspentAttributePoints > 0 && (
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setSelectedAttributeId(attribute.id);
                        setAttributePoints(1);
                        setAttributeDialogOpen(true);
                      }}
                      disabled={attribute.value >= attribute.maxValue}
                    >
                      Improve
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Skills tab */}
      {activeTab === 1 && (
        <Grid container spacing={2}>
          {progression.skills.map((skill) => (
            <Grid item xs={12} sm={6} md={4} key={skill.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{skill.name}</Typography>
                    <Chip 
                      label={`Level ${skill.level}`} 
                      color="primary" 
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {skill.category.replace('_', ' ').toUpperCase()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {skill.relatedAttributes.map((attr) => (
                      <Chip 
                        key={attr} 
                        label={attr.replace('_', ' ').toUpperCase()} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  
                  {skill.proficient && (
                    <Chip 
                      label="Proficient" 
                      color="success" 
                      size="small" 
                      sx={{ mr: 0.5 }}
                    />
                  )}
                  
                  {skill.expertise && (
                    <Chip 
                      label="Expertise" 
                      color="secondary" 
                      size="small"
                    />
                  )}
                  
                  {skill.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {skill.description}
                    </Typography>
                  )}
                </CardContent>
                
                {!readOnly && progression.unspentSkillPoints > 0 && (
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setSelectedSkillId(skill.id);
                        setSkillPoints(1);
                        setSkillDialogOpen(true);
                      }}
                      disabled={skill.level >= 5} // Assuming max level is 5
                    >
                      Improve
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Milestones tab */}
      {activeTab === 2 && (
        <List>
          {progression.milestones.map((milestone) => (
            <Paper 
              key={milestone.id} 
              sx={{ 
                mb: 2, 
                bgcolor: milestone.completed 
                  ? alpha(theme.palette.success.main, 0.1) 
                  : 'background.paper'
              }}
            >
              <ListItem>
                <ListItemIcon>
                  {getMilestoneIcon(milestone.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1">{milestone.name}</Typography>
                      {milestone.completed && (
                        <Chip 
                          label="Completed" 
                          color="success" 
                          size="small" 
                          icon={<CheckIcon />}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {milestone.description}
                      </Typography>
                      
                      {milestone.rewards && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Rewards:</strong>
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {milestone.rewards.experience && (
                              <Chip 
                                label={`${milestone.rewards.experience} XP`} 
                                size="small" 
                                variant="outlined"
                              />
                            )}
                            
                            {milestone.rewards.attributes && Object.entries(milestone.rewards.attributes).map(([attr, value]) => (
                              <Chip 
                                key={attr} 
                                label={`${attr.replace('_', ' ').toUpperCase()} +${value}`} 
                                size="small" 
                                variant="outlined"
                              />
                            ))}
                            
                            {milestone.rewards.skills && Object.entries(milestone.rewards.skills).map(([skill, value]) => (
                              <Chip 
                                key={skill} 
                                label={`${skill} +${value}`} 
                                size="small" 
                                variant="outlined"
                              />
                            ))}
                            
                            {milestone.rewards.items && milestone.rewards.items.length > 0 && (
                              <Chip 
                                label={`${milestone.rewards.items.length} Item${milestone.rewards.items.length !== 1 ? 's' : ''}`} 
                                size="small" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                      
                      {milestone.completed && milestone.completedDate && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Completed on {formatDate(milestone.completedDate)}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                
                {!readOnly && !milestone.completed && (
                  <ListItemSecondaryAction>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => handleCompleteMilestone(milestone.id)}
                    >
                      Complete
                    </Button>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
      
      {/* Add Experience Dialog */}
      <Dialog
        open={addExperienceOpen}
        onClose={() => setAddExperienceOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Experience</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={experienceAmount}
              onChange={(e) => setExperienceAmount(Math.max(1, parseInt(e.target.value) || 0))}
              sx={{ mb: 2 }}
              InputProps={{ inputProps: { min: 1 } }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Source</InputLabel>
              <Select
                value={experienceSource}
                onChange={(e) => setExperienceSource(e.target.value as ExperienceSource)}
                label="Source"
              >
                {Object.values(ExperienceSource).map((source) => (
                  <MenuItem key={source} value={source}>
                    {formatExperienceSource(source)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={experienceDescription}
              onChange={(e) => setExperienceDescription(e.target.value)}
              placeholder="Describe how the character earned this experience..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddExperienceOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddExperience}
            variant="contained"
            disabled={experienceAmount <= 0}
          >
            Add Experience
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Improve Attribute Dialog */}
      <Dialog
        open={attributeDialogOpen}
        onClose={() => setAttributeDialogOpen(false)}
      >
        <DialogTitle>Improve Attribute</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {selectedAttributeId && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  {progression.attributes.find(a => a.id === selectedAttributeId)?.name}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  Current Value: {progression.attributes.find(a => a.id === selectedAttributeId)?.value}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  Available Points: {progression.unspentAttributePoints}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    Points to Spend:
                  </Typography>
                  
                  <IconButton 
                    onClick={() => setAttributePoints(Math.max(1, attributePoints - 1))}
                    disabled={attributePoints <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                  
                  <Typography variant="body1" sx={{ mx: 2 }}>
                    {attributePoints}
                  </Typography>
                  
                  <IconButton 
                    onClick={() => setAttributePoints(Math.min(progression.unspentAttributePoints, attributePoints + 1))}
                    disabled={attributePoints >= progression.unspentAttributePoints}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="body2" sx={{ mt: 2 }}>
                  New Value: {(progression.attributes.find(a => a.id === selectedAttributeId)?.value || 0) + attributePoints}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttributeDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImproveAttribute}
            variant="contained"
            disabled={!selectedAttributeId || attributePoints <= 0 || attributePoints > progression.unspentAttributePoints}
          >
            Improve
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Improve Skill Dialog */}
      <Dialog
        open={skillDialogOpen}
        onClose={() => setSkillDialogOpen(false)}
      >
        <DialogTitle>Improve Skill</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {selectedSkillId && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  {progression.skills.find(s => s.id === selectedSkillId)?.name}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  Current Level: {progression.skills.find(s => s.id === selectedSkillId)?.level}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  Available Points: {progression.unspentSkillPoints}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    Points to Spend:
                  </Typography>
                  
                  <IconButton 
                    onClick={() => setSkillPoints(Math.max(1, skillPoints - 1))}
                    disabled={skillPoints <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                  
                  <Typography variant="body1" sx={{ mx: 2 }}>
                    {skillPoints}
                  </Typography>
                  
                  <IconButton 
                    onClick={() => setSkillPoints(Math.min(progression.unspentSkillPoints, skillPoints + 1))}
                    disabled={skillPoints >= progression.unspentSkillPoints}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="body2" sx={{ mt: 2 }}>
                  New Level: {(progression.skills.find(s => s.id === selectedSkillId)?.level || 0) + skillPoints}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImproveSkill}
            variant="contained"
            disabled={!selectedSkillId || skillPoints <= 0 || skillPoints > progression.unspentSkillPoints}
          >
            Improve
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Level Up Dialog */}
      <Dialog
        open={levelUpDialogOpen}
        onClose={() => setLevelUpDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LevelUpIcon sx={{ mr: 1 }} />
            Level Up!
          </Box>
        </DialogTitle>
        <DialogContent>
          {levelUpResult && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h5" align="center" gutterBottom>
                Congratulations!
              </Typography>
              
              <Typography variant="h6" align="center" gutterBottom>
                You have reached level {levelUpResult.newLevel}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Rewards:
              </Typography>
              
              <List>
                {levelUpResult.attributePointsGained > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <AttributeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${levelUpResult.attributePointsGained} Attribute Point${levelUpResult.attributePointsGained !== 1 ? 's' : ''}`} 
                    />
                  </ListItem>
                )}
                
                {levelUpResult.skillPointsGained > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <SkillIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${levelUpResult.skillPointsGained} Skill Point${levelUpResult.skillPointsGained !== 1 ? 's' : ''}`} 
                    />
                  </ListItem>
                )}
                
                {levelUpResult.newFeatures.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <StarIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setLevelUpDialogOpen(false)}
            variant="contained"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Experience History Dialog */}
      <Dialog
        open={experienceHistoryOpen}
        onClose={() => setExperienceHistoryOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Experience History</Typography>
            <IconButton onClick={() => setExperienceHistoryOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {progression.experienceHistory.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ py: 2 }}>
                No experience history available
              </Typography>
            ) : (
              progression.experienceHistory.map((entry) => (
                <ListItem key={entry.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1">
                          {entry.description || formatExperienceSource(entry.source)}
                        </Typography>
                        <Typography variant="subtitle1" color="primary">
                          +{entry.amount} XP
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Chip 
                          label={formatExperienceSource(entry.source)} 
                          size="small" 
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(entry.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CharacterProgressionPanel;