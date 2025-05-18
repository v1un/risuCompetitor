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
  Badge,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Checkbox,
  ListItemIcon
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { v4 as uuidv4 } from 'uuid';

interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  optional: boolean;
  notes: string;
}

interface QuestReward {
  id: string;
  description: string;
  type: 'item' | 'currency' | 'experience' | 'reputation' | 'other';
  claimed: boolean;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed' | 'on hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  giver: string;
  location: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  notes: string;
  tags: string[];
  created: string;
  updated: string;
  deadline?: string;
  related_quests: string[];
}

interface QuestTrackerProps {
  sessionId: string;
  onQuestUpdate?: (quest: Quest) => void;
  onQuestComplete?: (quest: Quest) => void;
}

const QuestTracker: React.FC<QuestTrackerProps> = ({ 
  sessionId, 
  onQuestUpdate,
  onQuestComplete
}) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [tabIndex, setTabIndex] = useState<number>(0);
  
  const [newQuestDialogOpen, setNewQuestDialogOpen] = useState<boolean>(false);
  const [editQuestDialogOpen, setEditQuestDialogOpen] = useState<boolean>(false);
  const [deleteQuestDialogOpen, setDeleteQuestDialogOpen] = useState<boolean>(false);
  
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [questToDelete, setQuestToDelete] = useState<string | null>(null);
  
  const [newObjectiveText, setNewObjectiveText] = useState<string>('');
  const [newRewardText, setNewRewardText] = useState<string>('');
  const [newRewardType, setNewRewardType] = useState<'item' | 'currency' | 'experience' | 'reputation' | 'other'>('item');
  const [newTag, setNewTag] = useState<string>('');
  
  // Default new quest template
  const defaultNewQuest: Quest = {
    id: '',
    title: '',
    description: '',
    status: 'active',
    priority: 'medium',
    giver: '',
    location: '',
    objectives: [],
    rewards: [],
    notes: '',
    tags: [],
    created: '',
    updated: '',
    related_quests: []
  };
  
  const [newQuest, setNewQuest] = useState<Quest>({ ...defaultNewQuest });

  // Load quests from database
  useEffect(() => {
    const loadQuests = async () => {
      try {
        // In a real implementation, this would fetch from the database
        // For now, we'll just use local state
        // const response = await window.api.quests.getAll(sessionId);
        // if (response.success) {
        //   setQuests(response.quests);
        // }
      } catch (err) {
        console.error('Failed to load quests:', err);
      }
    };
    
    loadQuests();
  }, [sessionId]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Toggle quest expansion
  const toggleQuestExpansion = (questId: string) => {
    setExpandedQuestId(prev => prev === questId ? null : questId);
  };

  // Add a new quest
  const addQuest = () => {
    const now = new Date().toISOString();
    
    const questToAdd: Quest = {
      ...newQuest,
      id: uuidv4(),
      created: now,
      updated: now
    };
    
    setQuests(prev => [...prev, questToAdd]);
    
    // Reset form
    setNewQuest({ ...defaultNewQuest });
    setNewQuestDialogOpen(false);
    
    // In a real implementation, save to database
    // window.api.quests.add(sessionId, questToAdd);
  };

  // Edit a quest
  const openEditQuestDialog = (quest: Quest) => {
    setEditingQuest({ ...quest });
    setEditQuestDialogOpen(true);
  };

  // Save edited quest
  const saveEditedQuest = () => {
    if (!editingQuest) return;
    
    const updatedQuest: Quest = {
      ...editingQuest,
      updated: new Date().toISOString()
    };
    
    setQuests(prev => 
      prev.map(quest => 
        quest.id === updatedQuest.id ? updatedQuest : quest
      )
    );
    
    setEditQuestDialogOpen(false);
    setEditingQuest(null);
    
    // Notify parent component
    if (onQuestUpdate) {
      onQuestUpdate(updatedQuest);
    }
    
    // If quest was marked as completed, call the completion callback
    if (updatedQuest.status === 'completed' && onQuestComplete) {
      onQuestComplete(updatedQuest);
    }
    
    // In a real implementation, update in database
    // window.api.quests.update(sessionId, updatedQuest);
  };

  // Delete quest confirmation
  const confirmDeleteQuest = (questId: string) => {
    setQuestToDelete(questId);
    setDeleteQuestDialogOpen(true);
  };

  // Delete a quest
  const deleteQuest = () => {
    if (!questToDelete) return;
    
    setQuests(prev => prev.filter(quest => quest.id !== questToDelete));
    setDeleteQuestDialogOpen(false);
    setQuestToDelete(null);
    
    // In a real implementation, remove from database
    // window.api.quests.delete(sessionId, questToDelete);
  };

  // Add objective to quest
  const addObjective = (isNew: boolean = true) => {
    if (!newObjectiveText.trim()) return;
    
    const newObjective: QuestObjective = {
      id: uuidv4(),
      description: newObjectiveText.trim(),
      completed: false,
      optional: false,
      notes: ''
    };
    
    if (isNew) {
      setNewQuest(prev => ({
        ...prev,
        objectives: [...prev.objectives, newObjective]
      }));
    } else if (editingQuest) {
      setEditingQuest(prev => {
        if (!prev) return null;
        return {
          ...prev,
          objectives: [...prev.objectives, newObjective]
        };
      });
    }
    
    setNewObjectiveText('');
  };

  // Remove objective from quest
  const removeObjective = (objectiveId: string, isNew: boolean = true) => {
    if (isNew) {
      setNewQuest(prev => ({
        ...prev,
        objectives: prev.objectives.filter(obj => obj.id !== objectiveId)
      }));
    } else if (editingQuest) {
      setEditingQuest(prev => {
        if (!prev) return null;
        return {
          ...prev,
          objectives: prev.objectives.filter(obj => obj.id !== objectiveId)
        };
      });
    }
  };

  // Toggle objective completion
  const toggleObjectiveCompletion = (questId: string, objectiveId: string) => {
    setQuests(prev => 
      prev.map(quest => {
        if (quest.id === questId) {
          const updatedObjectives = quest.objectives.map(obj => {
            if (obj.id === objectiveId) {
              return { ...obj, completed: !obj.completed };
            }
            return obj;
          });
          
          // Check if all required objectives are completed
          const allRequiredCompleted = updatedObjectives
            .filter(obj => !obj.optional)
            .every(obj => obj.completed);
          
          // Auto-update quest status if all required objectives are completed
          let updatedStatus = quest.status;
          if (allRequiredCompleted && quest.status === 'active') {
            updatedStatus = 'completed';
            
            // Notify parent component of quest completion
            if (onQuestComplete) {
              onQuestComplete({
                ...quest,
                objectives: updatedObjectives,
                status: 'completed',
                updated: new Date().toISOString()
              });
            }
          }
          
          return {
            ...quest,
            objectives: updatedObjectives,
            status: updatedStatus,
            updated: new Date().toISOString()
          };
        }
        return quest;
      })
    );
    
    // In a real implementation, update in database
    // window.api.quests.updateObjective(sessionId, questId, objectiveId, { completed: !isCompleted });
  };

  // Toggle objective optional status
  const toggleObjectiveOptional = (objectiveId: string, isNew: boolean = true) => {
    if (isNew) {
      setNewQuest(prev => ({
        ...prev,
        objectives: prev.objectives.map(obj => {
          if (obj.id === objectiveId) {
            return { ...obj, optional: !obj.optional };
          }
          return obj;
        })
      }));
    } else if (editingQuest) {
      setEditingQuest(prev => {
        if (!prev) return null;
        return {
          ...prev,
          objectives: prev.objectives.map(obj => {
            if (obj.id === objectiveId) {
              return { ...obj, optional: !obj.optional };
            }
            return obj;
          })
        };
      });
    }
  };

  // Add reward to quest
  const addReward = (isNew: boolean = true) => {
    if (!newRewardText.trim()) return;
    
    const newReward: QuestReward = {
      id: uuidv4(),
      description: newRewardText.trim(),
      type: newRewardType,
      claimed: false
    };
    
    if (isNew) {
      setNewQuest(prev => ({
        ...prev,
        rewards: [...prev.rewards, newReward]
      }));
    } else if (editingQuest) {
      setEditingQuest(prev => {
        if (!prev) return null;
        return {
          ...prev,
          rewards: [...prev.rewards, newReward]
        };
      });
    }
    
    setNewRewardText('');
  };

  // Remove reward from quest
  const removeReward = (rewardId: string, isNew: boolean = true) => {
    if (isNew) {
      setNewQuest(prev => ({
        ...prev,
        rewards: prev.rewards.filter(reward => reward.id !== rewardId)
      }));
    } else if (editingQuest) {
      setEditingQuest(prev => {
        if (!prev) return null;
        return {
          ...prev,
          rewards: prev.rewards.filter(reward => reward.id !== rewardId)
        };
      });
    }
  };

  // Toggle reward claimed status
  const toggleRewardClaimed = (questId: string, rewardId: string) => {
    setQuests(prev => 
      prev.map(quest => {
        if (quest.id === questId) {
          return {
            ...quest,
            rewards: quest.rewards.map(reward => {
              if (reward.id === rewardId) {
                return { ...reward, claimed: !reward.claimed };
              }
              return reward;
            }),
            updated: new Date().toISOString()
          };
        }
        return quest;
      })
    );
    
    // In a real implementation, update in database
    // window.api.quests.updateReward(sessionId, questId, rewardId, { claimed: !isClaimed });
  };

  // Add tag to quest
  const addTag = (isNew: boolean = true) => {
    if (!newTag.trim()) return;
    
    if (isNew) {
      setNewQuest(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
    } else if (editingQuest) {
      setEditingQuest(prev => {
        if (!prev) return null;
        return {
          ...prev,
          tags: [...prev.tags, newTag.trim()]
        };
      });
    }
    
    setNewTag('');
  };

  // Remove tag from quest
  const removeTag = (tag: string, isNew: boolean = true) => {
    if (isNew) {
      setNewQuest(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      }));
    } else if (editingQuest) {
      setEditingQuest(prev => {
        if (!prev) return null;
        return {
          ...prev,
          tags: prev.tags.filter(t => t !== tag)
        };
      });
    }
  };

  // Update quest status
  const updateQuestStatus = (questId: string, status: 'active' | 'completed' | 'failed' | 'on hold') => {
    setQuests(prev => 
      prev.map(quest => {
        if (quest.id === questId) {
          const updatedQuest = {
            ...quest,
            status,
            updated: new Date().toISOString()
          };
          
          // Notify parent component
          if (onQuestUpdate) {
            onQuestUpdate(updatedQuest);
          }
          
          // If quest was marked as completed, call the completion callback
          if (status === 'completed' && onQuestComplete) {
            onQuestComplete(updatedQuest);
          }
          
          return updatedQuest;
        }
        return quest;
      })
    );
    
    // In a real implementation, update in database
    // window.api.quests.updateStatus(sessionId, questId, status);
  };

  // Calculate quest progress
  const calculateQuestProgress = (quest: Quest): number => {
    if (quest.objectives.length === 0) return 0;
    
    const completedCount = quest.objectives.filter(obj => obj.completed).length;
    return Math.round((completedCount / quest.objectives.length) * 100);
  };

  // Filter quests based on search, status, priority, and tab
  const filteredQuests = quests.filter(quest => {
    const matchesSearch = searchTerm === '' || 
                         quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.giver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || quest.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || quest.priority === priorityFilter;
    
    const matchesTab = (tabIndex === 0) || // All quests
                      (tabIndex === 1 && quest.status === 'active') || // Active
                      (tabIndex === 2 && quest.status === 'completed') || // Completed
                      (tabIndex === 3 && (quest.status === 'failed' || quest.status === 'on hold')); // Failed/On Hold
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTab;
  });

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'low': return '#8bc34a';
      case 'medium': return '#ffc107';
      case 'high': return '#ff9800';
      case 'critical': return '#f44336';
      default: return '#8bc34a';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AssignmentIcon />;
      case 'completed': return <AssignmentTurnedInIcon style={{ color: '#4caf50' }} />;
      case 'failed': return <AssignmentLateIcon style={{ color: '#f44336' }} />;
      case 'on hold': return <AssignmentLateIcon style={{ color: '#ff9800' }} />;
      default: return <AssignmentIcon />;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AssignmentIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Quest Tracker</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setNewQuestDialogOpen(true)}
          size="small"
        >
          New Quest
        </Button>
      </Box>
      
      {/* Search and filters */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search quests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as string)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="on hold">On Hold</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as string)}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="All Quests" />
          <Tab label="Active" />
          <Tab label="Completed" />
          <Tab label="Failed/On Hold" />
        </Tabs>
      </Box>
      
      {/* Quest list */}
      {filteredQuests.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No quests found
        </Typography>
      ) : (
        <List>
          {filteredQuests.map((quest) => (
            <React.Fragment key={quest.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  bgcolor: expandedQuestId === quest.id ? 'action.selected' : 'transparent',
                  borderLeft: `4px solid ${getPriorityColor(quest.priority)}`
                }}
              >
                <ListItemIcon>
                  {getStatusIcon(quest.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium' }}>
                        {quest.title}
                      </Typography>
                      {quest.tags.length > 0 && (
                        <Box sx={{ display: 'flex', ml: 1, flexWrap: 'wrap', gap: 0.5 }}>
                          {quest.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{ height: '20px', fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" component="span">
                        {quest.description.length > 100 
                          ? `${quest.description.substring(0, 100)}...` 
                          : quest.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', mt: 1, alignItems: 'center' }}>
                        {quest.giver && (
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                            From: {quest.giver}
                          </Typography>
                        )}
                        
                        {quest.location && (
                          <Typography variant="body2" color="text.secondary">
                            Location: {quest.location}
                          </Typography>
                        )}
                      </Box>
                      
                      {quest.objectives.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={calculateQuestProgress(quest)} 
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Progress: {calculateQuestProgress(quest)}% ({quest.objectives.filter(obj => obj.completed).length}/{quest.objectives.length})
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Edit Quest">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => openEditQuestDialog(quest)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Quest">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => confirmDeleteQuest(quest.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={expandedQuestId === quest.id ? "Collapse" : "Expand"}>
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => toggleQuestExpansion(quest.id)}
                      >
                        {expandedQuestId === quest.id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              
              {/* Expanded quest details */}
              <Collapse in={expandedQuestId === quest.id} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
                  {/* Objectives */}
                  <Typography variant="subtitle2" gutterBottom>
                    Objectives
                  </Typography>
                  {quest.objectives.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No objectives defined
                    </Typography>
                  ) : (
                    <List dense disablePadding>
                      {quest.objectives.map((objective) => (
                        <ListItem key={objective.id} disablePadding>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Checkbox
                              edge="start"
                              checked={objective.completed}
                              onChange={() => toggleObjectiveCompletion(quest.id, objective.id)}
                              size="small"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  textDecoration: objective.completed ? 'line-through' : 'none',
                                  fontStyle: objective.optional ? 'italic' : 'normal'
                                }}
                              >
                                {objective.description}
                                {objective.optional && ' (Optional)'}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                  
                  {/* Rewards */}
                  {quest.rewards.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Rewards
                      </Typography>
                      <List dense disablePadding>
                        {quest.rewards.map((reward) => (
                          <ListItem key={reward.id} disablePadding>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Checkbox
                                edge="start"
                                checked={reward.claimed}
                                onChange={() => toggleRewardClaimed(quest.id, reward.id)}
                                size="small"
                                disabled={quest.status !== 'completed'}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    textDecoration: reward.claimed ? 'line-through' : 'none'
                                  }}
                                >
                                  {reward.description}
                                  <Chip 
                                    label={reward.type} 
                                    size="small" 
                                    sx={{ ml: 1, height: '16px', fontSize: '0.6rem' }}
                                  />
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  {/* Notes */}
                  {quest.notes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body2">
                        {quest.notes}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Status actions */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {quest.status !== 'active' && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => updateQuestStatus(quest.id, 'active')}
                      >
                        Mark Active
                      </Button>
                    )}
                    
                    {quest.status !== 'completed' && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="success"
                        onClick={() => updateQuestStatus(quest.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                    
                    {quest.status !== 'failed' && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="error"
                        onClick={() => updateQuestStatus(quest.id, 'failed')}
                      >
                        Mark Failed
                      </Button>
                    )}
                    
                    {quest.status !== 'on hold' && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="warning"
                        onClick={() => updateQuestStatus(quest.id, 'on hold')}
                      >
                        Put On Hold
                      </Button>
                    )}
                  </Box>
                </Box>
              </Collapse>
              
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
      
      {/* New Quest Dialog */}
      <Dialog 
        open={newQuestDialogOpen} 
        onClose={() => setNewQuestDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Quest</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Quest Title"
                value={newQuest.title}
                onChange={(e) => setNewQuest(prev => ({ ...prev, title: e.target.value }))}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quest Giver"
                value={newQuest.giver}
                onChange={(e) => setNewQuest(prev => ({ ...prev, giver: e.target.value }))}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                value={newQuest.location}
                onChange={(e) => setNewQuest(prev => ({ ...prev, location: e.target.value }))}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={newQuest.status}
                  onChange={(e) => setNewQuest(prev => ({ ...prev, status: e.target.value as any }))}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="on hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newQuest.priority}
                  onChange={(e) => setNewQuest(prev => ({ ...prev, priority: e.target.value as any }))}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={newQuest.description}
                onChange={(e) => setNewQuest(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            
            {/* Objectives */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Objectives
              </Typography>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  label="Add Objective"
                  value={newObjectiveText}
                  onChange={(e) => setNewObjectiveText(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <Button 
                  onClick={() => addObjective()}
                  disabled={!newObjectiveText.trim()}
                  sx={{ ml: 1 }}
                >
                  Add
                </Button>
              </Box>
              
              {newQuest.objectives.length > 0 ? (
                <List dense>
                  {newQuest.objectives.map((objective) => (
                    <ListItem key={objective.id}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={objective.optional}
                          onChange={() => toggleObjectiveOptional(objective.id)}
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={objective.description}
                        secondary={objective.optional ? "Optional" : "Required"}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => removeObjective(objective.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No objectives added yet
                </Typography>
              )}
            </Grid>
            
            {/* Rewards */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Rewards
              </Typography>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  label="Add Reward"
                  value={newRewardText}
                  onChange={(e) => setNewRewardText(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <FormControl sx={{ minWidth: 120, ml: 1 }}>
                  <InputLabel size="small">Type</InputLabel>
                  <Select
                    value={newRewardType}
                    onChange={(e) => setNewRewardType(e.target.value as any)}
                    label="Type"
                    size="small"
                  >
                    <MenuItem value="item">Item</MenuItem>
                    <MenuItem value="currency">Currency</MenuItem>
                    <MenuItem value="experience">Experience</MenuItem>
                    <MenuItem value="reputation">Reputation</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                <Button 
                  onClick={() => addReward()}
                  disabled={!newRewardText.trim()}
                  sx={{ ml: 1 }}
                >
                  Add
                </Button>
              </Box>
              
              {newQuest.rewards.length > 0 ? (
                <List dense>
                  {newQuest.rewards.map((reward) => (
                    <ListItem key={reward.id}>
                      <ListItemText
                        primary={reward.description}
                        secondary={`Type: ${reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => removeReward(reward.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No rewards added yet
                </Typography>
              )}
            </Grid>
            
            {/* Tags */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {newQuest.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex' }}>
                <TextField
                  label="Add Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <Button 
                  onClick={() => addTag()}
                  disabled={!newTag.trim() || newQuest.tags.includes(newTag.trim())}
                  sx={{ ml: 1 }}
                >
                  Add
                </Button>
              </Box>
            </Grid>
            
            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={newQuest.notes}
                onChange={(e) => setNewQuest(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewQuestDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={addQuest} 
            variant="contained" 
            color="primary"
            disabled={!newQuest.title.trim()}
          >
            Add Quest
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Quest Dialog */}
      <Dialog 
        open={editQuestDialogOpen} 
        onClose={() => setEditQuestDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Quest</DialogTitle>
        <DialogContent>
          {editingQuest && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Quest Title"
                  value={editingQuest.title}
                  onChange={(e) => setEditingQuest(prev => prev ? { ...prev, title: e.target.value } : null)}
                  fullWidth
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Quest Giver"
                  value={editingQuest.giver}
                  onChange={(e) => setEditingQuest(prev => prev ? { ...prev, giver: e.target.value } : null)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  value={editingQuest.location}
                  onChange={(e) => setEditingQuest(prev => prev ? { ...prev, location: e.target.value } : null)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editingQuest.status}
                    onChange={(e) => setEditingQuest(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="on hold">On Hold</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editingQuest.priority}
                    onChange={(e) => setEditingQuest(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={editingQuest.description}
                  onChange={(e) => setEditingQuest(prev => prev ? { ...prev, description: e.target.value } : null)}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              
              {/* Objectives */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Objectives
                </Typography>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    label="Add Objective"
                    value={newObjectiveText}
                    onChange={(e) => setNewObjectiveText(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <Button 
                    onClick={() => addObjective(false)}
                    disabled={!newObjectiveText.trim()}
                    sx={{ ml: 1 }}
                  >
                    Add
                  </Button>
                </Box>
                
                {editingQuest.objectives.length > 0 ? (
                  <List dense>
                    {editingQuest.objectives.map((objective) => (
                      <ListItem key={objective.id}>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={objective.completed}
                            onChange={() => setEditingQuest(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                objectives: prev.objectives.map(obj => 
                                  obj.id === objective.id ? { ...obj, completed: !obj.completed } : obj
                                )
                              };
                            })}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={objective.description}
                          secondary={
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={objective.optional}
                                  onChange={() => toggleObjectiveOptional(objective.id, false)}
                                  size="small"
                                />
                              }
                              label="Optional"
                            />
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={() => removeObjective(objective.id, false)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No objectives added yet
                  </Typography>
                )}
              </Grid>
              
              {/* Rewards */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Rewards
                </Typography>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    label="Add Reward"
                    value={newRewardText}
                    onChange={(e) => setNewRewardText(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <FormControl sx={{ minWidth: 120, ml: 1 }}>
                    <InputLabel size="small">Type</InputLabel>
                    <Select
                      value={newRewardType}
                      onChange={(e) => setNewRewardType(e.target.value as any)}
                      label="Type"
                      size="small"
                    >
                      <MenuItem value="item">Item</MenuItem>
                      <MenuItem value="currency">Currency</MenuItem>
                      <MenuItem value="experience">Experience</MenuItem>
                      <MenuItem value="reputation">Reputation</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  <Button 
                    onClick={() => addReward(false)}
                    disabled={!newRewardText.trim()}
                    sx={{ ml: 1 }}
                  >
                    Add
                  </Button>
                </Box>
                
                {editingQuest.rewards.length > 0 ? (
                  <List dense>
                    {editingQuest.rewards.map((reward) => (
                      <ListItem key={reward.id}>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={reward.claimed}
                            onChange={() => setEditingQuest(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                rewards: prev.rewards.map(r => 
                                  r.id === reward.id ? { ...r, claimed: !r.claimed } : r
                                )
                              };
                            })}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={reward.description}
                          secondary={`Type: ${reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={() => removeReward(reward.id, false)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No rewards added yet
                  </Typography>
                )}
              </Grid>
              
              {/* Tags */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {editingQuest.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => removeTag(tag, false)}
                      size="small"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <TextField
                    label="Add Tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <Button 
                    onClick={() => addTag(false)}
                    disabled={!newTag.trim() || (editingQuest && editingQuest.tags.includes(newTag.trim()))}
                    sx={{ ml: 1 }}
                  >
                    Add
                  </Button>
                </Box>
              </Grid>
              
              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  value={editingQuest.notes}
                  onChange={(e) => setEditingQuest(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditQuestDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={saveEditedQuest} 
            variant="contained" 
            color="primary"
            disabled={!editingQuest || !editingQuest.title.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Quest Dialog */}
      <Dialog 
        open={deleteQuestDialogOpen} 
        onClose={() => setDeleteQuestDialogOpen(false)}
      >
        <DialogTitle>Delete Quest</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this quest? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteQuestDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={deleteQuest} 
            variant="contained" 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default QuestTracker;