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
  CardActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { v4 as uuidv4 } from 'uuid';

interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  weight: number;
  value: number;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact';
  attunement: boolean;
  equipped: boolean;
  tags: string[];
  notes: string;
  image?: string;
}

interface Currency {
  platinum: number;
  gold: number;
  electrum: number;
  silver: number;
  copper: number;
}

interface InventoryManagerProps {
  sessionId: string;
  characterId?: string;
  isShared?: boolean;
  onInventoryChange?: (items: Item[], currency: Currency) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ 
  sessionId, 
  characterId,
  isShared = false,
  onInventoryChange
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [currency, setCurrency] = useState<Currency>({
    platinum: 0,
    gold: 0,
    electrum: 0,
    silver: 0,
    copper: 0
  });
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tabIndex, setTabIndex] = useState<number>(0);
  
  const [newItemDialogOpen, setNewItemDialogOpen] = useState<boolean>(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState<boolean>(false);
  const [currencyDialogOpen, setCurrencyDialogOpen] = useState<boolean>(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState<boolean>(false);
  
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [newItem, setNewItem] = useState<Item>({
    id: '',
    name: '',
    description: '',
    quantity: 1,
    weight: 0,
    value: 0,
    category: 'miscellaneous',
    rarity: 'common',
    attunement: false,
    equipped: false,
    tags: [],
    notes: ''
  });
  
  const [newTag, setNewTag] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(1);
  const [transferItemId, setTransferItemId] = useState<string | null>(null);
  
  const [currencyTransaction, setCurrencyTransaction] = useState<{
    type: 'add' | 'remove';
    platinum: number;
    gold: number;
    electrum: number;
    silver: number;
    copper: number;
    reason: string;
  }>({
    type: 'add',
    platinum: 0,
    gold: 0,
    electrum: 0,
    silver: 0,
    copper: 0,
    reason: ''
  });
  
  // Categories
  const categories = [
    'weapon', 'armor', 'potion', 'scroll', 'wand', 'ring', 
    'ammunition', 'tool', 'food', 'clothing', 'container', 
    'treasure', 'miscellaneous'
  ];
  
  // Rarities with colors
  const rarityColors = {
    common: '#b0b0b0',
    uncommon: '#1db11d',
    rare: '#2196f3',
    'very rare': '#9c27b0',
    legendary: '#ff9800',
    artifact: '#f44336'
  };

  // Load inventory from database
  useEffect(() => {
    const loadInventory = async () => {
      try {
        // In a real implementation, this would fetch from the database
        // For now, we'll just use local state
        // const response = await window.api.inventory.getItems(sessionId, characterId);
        // if (response.success) {
        //   setItems(response.items);
        //   setCurrency(response.currency);
        // }
      } catch (err) {
        console.error('Failed to load inventory:', err);
      }
    };
    
    loadInventory();
  }, [sessionId, characterId]);

  // Notify parent component when inventory changes
  useEffect(() => {
    if (onInventoryChange) {
      onInventoryChange(items, currency);
    }
  }, [items, currency, onInventoryChange]);

  // Add a new item
  const addItem = () => {
    const itemToAdd = {
      ...newItem,
      id: uuidv4()
    };
    
    setItems(prev => [...prev, itemToAdd]);
    
    // Reset form
    setNewItem({
      id: '',
      name: '',
      description: '',
      quantity: 1,
      weight: 0,
      value: 0,
      category: 'miscellaneous',
      rarity: 'common',
      attunement: false,
      equipped: false,
      tags: [],
      notes: ''
    });
    
    setNewItemDialogOpen(false);
    
    // In a real implementation, save to database
    // window.api.inventory.addItem(sessionId, characterId, itemToAdd);
  };

  // Edit an item
  const openEditItemDialog = (item: Item) => {
    setEditingItem({ ...item });
    setEditItemDialogOpen(true);
  };

  // Save edited item
  const saveEditedItem = () => {
    if (!editingItem) return;
    
    setItems(prev => 
      prev.map(item => 
        item.id === editingItem.id ? editingItem : item
      )
    );
    
    setEditItemDialogOpen(false);
    setEditingItem(null);
    
    // In a real implementation, update in database
    // window.api.inventory.updateItem(sessionId, characterId, editingItem);
  };

  // Remove an item
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    
    // In a real implementation, remove from database
    // window.api.inventory.removeItem(sessionId, characterId, id);
  };

  // Update item quantity
  const updateItemQuantity = (id: string, change: number) => {
    setItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change);
          
          // If quantity becomes 0, remove the item
          if (newQuantity === 0) {
            return item;
          }
          
          return {
            ...item,
            quantity: newQuantity
          };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
    
    // In a real implementation, update in database
    // window.api.inventory.updateItemQuantity(sessionId, characterId, id, newQuantity);
  };

  // Toggle item equipped status
  const toggleEquipped = (id: string) => {
    setItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            equipped: !item.equipped
          };
        }
        return item;
      })
    );
    
    // In a real implementation, update in database
    // window.api.inventory.updateItem(sessionId, characterId, updatedItem);
  };

  // Add tag to item
  const addTagToItem = (itemId: string, tag: string) => {
    if (!tag.trim()) return;
    
    setItems(prev => 
      prev.map(item => {
        if (item.id === itemId && !item.tags.includes(tag.trim())) {
          return {
            ...item,
            tags: [...item.tags, tag.trim()]
          };
        }
        return item;
      })
    );
    
    // In a real implementation, update in database
    // window.api.inventory.updateItem(sessionId, characterId, updatedItem);
  };

  // Remove tag from item
  const removeTagFromItem = (itemId: string, tag: string) => {
    setItems(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            tags: item.tags.filter(t => t !== tag)
          };
        }
        return item;
      })
    );
    
    // In a real implementation, update in database
    // window.api.inventory.updateItem(sessionId, characterId, updatedItem);
  };

  // Update currency
  const updateCurrency = () => {
    const { type, platinum, gold, electrum, silver, copper, reason } = currencyTransaction;
    
    const multiplier = type === 'add' ? 1 : -1;
    
    setCurrency(prev => ({
      platinum: Math.max(0, prev.platinum + (platinum * multiplier)),
      gold: Math.max(0, prev.gold + (gold * multiplier)),
      electrum: Math.max(0, prev.electrum + (electrum * multiplier)),
      silver: Math.max(0, prev.silver + (silver * multiplier)),
      copper: Math.max(0, prev.copper + (copper * multiplier))
    }));
    
    // Reset form
    setCurrencyTransaction({
      type: 'add',
      platinum: 0,
      gold: 0,
      electrum: 0,
      silver: 0,
      copper: 0,
      reason: ''
    });
    
    setCurrencyDialogOpen(false);
    
    // In a real implementation, update in database
    // window.api.inventory.updateCurrency(sessionId, characterId, updatedCurrency, {
    //   type,
    //   amount: { platinum, gold, electrum, silver, copper },
    //   reason,
    //   timestamp: new Date().toISOString()
    // });
  };

  // Convert currency to lower denominations
  const convertCurrency = () => {
    // Conversion rates
    // 1 platinum = 10 gold
    // 1 gold = 2 electrum
    // 1 electrum = 5 silver
    // 1 silver = 10 copper
    
    let { platinum, gold, electrum, silver, copper } = currency;
    
    // Convert all to copper
    let totalCopper = copper + 
                      silver * 10 + 
                      electrum * 50 + 
                      gold * 100 + 
                      platinum * 1000;
    
    // Redistribute optimally
    platinum = Math.floor(totalCopper / 1000);
    totalCopper %= 1000;
    
    gold = Math.floor(totalCopper / 100);
    totalCopper %= 100;
    
    electrum = Math.floor(totalCopper / 50);
    totalCopper %= 50;
    
    silver = Math.floor(totalCopper / 10);
    totalCopper %= 10;
    
    copper = totalCopper;
    
    setCurrency({ platinum, gold, electrum, silver, copper });
    
    // In a real implementation, update in database
    // window.api.inventory.updateCurrency(sessionId, characterId, { platinum, gold, electrum, silver, copper });
  };

  // Calculate total weight
  const calculateTotalWeight = () => {
    return items.reduce((total, item) => total + (item.weight * item.quantity), 0);
  };

  // Calculate total value
  const calculateTotalValue = () => {
    return items.reduce((total, item) => total + (item.value * item.quantity), 0);
  };

  // Convert currency to gold value
  const currencyToGold = (curr: Currency) => {
    return curr.copper / 100 + 
           curr.silver / 10 + 
           curr.electrum / 2 + 
           curr.gold + 
           curr.platinum * 10;
  };

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
                         item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    const matchesTab = (tabIndex === 0) || // All items
                      (tabIndex === 1 && item.equipped) || // Equipped
                      (tabIndex === 2 && !item.equipped); // Backpack
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <InventoryIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Inventory Manager</Typography>
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Currency display */}
        <Tooltip title="Manage Currency">
          <IconButton onClick={() => setCurrencyDialogOpen(true)}>
            <MonetizationOnIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Currency summary */}
      <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2">Currency</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Chip 
              size="small" 
              label={`${currency.platinum} PP`} 
              sx={{ bgcolor: '#e0e0e0' }}
            />
            <Chip 
              size="small" 
              label={`${currency.gold} GP`} 
              sx={{ bgcolor: '#ffd700', color: '#000' }}
            />
            <Chip 
              size="small" 
              label={`${currency.electrum} EP`} 
              sx={{ bgcolor: '#97a2a2' }}
            />
            <Chip 
              size="small" 
              label={`${currency.silver} SP`} 
              sx={{ bgcolor: '#c0c0c0' }}
            />
            <Chip 
              size="small" 
              label={`${currency.copper} CP`} 
              sx={{ bgcolor: '#b87333' }}
            />
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="subtitle2">Total Value</Typography>
          <Typography variant="body2">
            {currencyToGold(currency).toFixed(2)} GP (currency) + {calculateTotalValue().toFixed(2)} GP (items)
          </Typography>
        </Box>
      </Box>
      
      {/* Search and filters */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search items..."
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
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as string)}
                label="Category"
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="All Items" />
          <Tab label="Equipped" />
          <Tab label="Backpack" />
        </Tabs>
      </Box>
      
      {/* Item list */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">
            Items ({filteredItems.length})
          </Typography>
          <Button 
            size="small" 
            startIcon={<AddIcon />}
            onClick={() => setNewItemDialogOpen(true)}
          >
            Add Item
          </Button>
        </Box>
        
        {filteredItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No items found
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    borderColor: item.equipped ? '#4caf50' : undefined,
                    borderWidth: item.equipped ? 2 : 1
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium' }}>
                        {item.name}
                        {item.quantity > 1 && (
                          <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                            ×{item.quantity}
                          </Typography>
                        )}
                      </Typography>
                      <Chip 
                        label={item.rarity} 
                        size="small"
                        sx={{ 
                          bgcolor: rarityColors[item.rarity as keyof typeof rarityColors],
                          color: ['common', 'uncommon'].includes(item.rarity) ? '#000' : '#fff',
                          height: '20px',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {item.description.length > 100 
                        ? `${item.description.substring(0, 100)}...` 
                        : item.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">
                        {item.weight > 0 && `${item.weight} lb${item.quantity > 1 ? ` (${(item.weight * item.quantity).toFixed(1)} total)` : ''}`}
                      </Typography>
                      <Typography variant="body2">
                        {item.value > 0 && `${item.value} gp${item.quantity > 1 ? ` (${(item.value * item.quantity).toFixed(1)} total)` : ''}`}
                      </Typography>
                    </Box>
                    
                    {item.tags.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {item.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ height: '20px', fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    )}
                    
                    {item.attunement && (
                      <Typography variant="body2" color="primary" sx={{ mt: 1, fontStyle: 'italic' }}>
                        Requires attunement
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ pt: 0 }}>
                    <Button 
                      size="small" 
                      onClick={() => toggleEquipped(item.id)}
                    >
                      {item.equipped ? 'Unequip' : 'Equip'}
                    </Button>
                    <Button 
                      size="small"
                      onClick={() => updateItemQuantity(item.id, 1)}
                    >
                      +1
                    </Button>
                    <Button 
                      size="small"
                      onClick={() => updateItemQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      -1
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton 
                      size="small"
                      onClick={() => openEditItemDialog(item)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => removeItem(item.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Summary */}
      <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="subtitle2">
          Total: {items.length} items ({calculateTotalWeight().toFixed(1)} lb)
        </Typography>
      </Box>
      
      {/* New Item Dialog */}
      <Dialog 
        open={newItemDialogOpen} 
        onClose={() => setNewItemDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Quantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Weight (lb)"
                type="number"
                value={newItem.weight}
                onChange={(e) => setNewItem(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Value (gp)"
                type="number"
                value={newItem.value}
                onChange={(e) => setNewItem(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Rarity</InputLabel>
                <Select
                  value={newItem.rarity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, rarity: e.target.value as any }))}
                  label="Rarity"
                >
                  <MenuItem value="common">Common</MenuItem>
                  <MenuItem value="uncommon">Uncommon</MenuItem>
                  <MenuItem value="rare">Rare</MenuItem>
                  <MenuItem value="very rare">Very Rare</MenuItem>
                  <MenuItem value="legendary">Legendary</MenuItem>
                  <MenuItem value="artifact">Artifact</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newItem.attunement}
                      onChange={(e) => setNewItem(prev => ({ ...prev, attunement: e.target.checked }))}
                    />
                  }
                  label="Requires Attunement"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={newItem.equipped}
                      onChange={(e) => setNewItem(prev => ({ ...prev, equipped: e.target.checked }))}
                    />
                  }
                  label="Equipped"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {newItem.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => setNewItem(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                    size="small"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', mt: 1 }}>
                <TextField
                  label="Add Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <Button 
                  onClick={() => {
                    if (newTag.trim() && !newItem.tags.includes(newTag.trim())) {
                      setNewItem(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
                      setNewTag('');
                    }
                  }}
                  disabled={!newTag.trim() || newItem.tags.includes(newTag.trim())}
                  sx={{ ml: 1 }}
                >
                  Add
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={newItem.notes}
                onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewItemDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={addItem} 
            variant="contained" 
            color="primary"
            disabled={!newItem.name.trim()}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Item Dialog */}
      <Dialog 
        open={editItemDialogOpen} 
        onClose={() => setEditItemDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          {editingItem && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                  fullWidth
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, category: e.target.value } : null)}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={editingItem.quantity}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, quantity: parseInt(e.target.value) || 1 } : null)}
                  fullWidth
                  margin="normal"
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Weight (lb)"
                  type="number"
                  value={editingItem.weight}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, weight: parseFloat(e.target.value) || 0 } : null)}
                  fullWidth
                  margin="normal"
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Value (gp)"
                  type="number"
                  value={editingItem.value}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, value: parseFloat(e.target.value) || 0 } : null)}
                  fullWidth
                  margin="normal"
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Rarity</InputLabel>
                  <Select
                    value={editingItem.rarity}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, rarity: e.target.value as any } : null)}
                    label="Rarity"
                  >
                    <MenuItem value="common">Common</MenuItem>
                    <MenuItem value="uncommon">Uncommon</MenuItem>
                    <MenuItem value="rare">Rare</MenuItem>
                    <MenuItem value="very rare">Very Rare</MenuItem>
                    <MenuItem value="legendary">Legendary</MenuItem>
                    <MenuItem value="artifact">Artifact</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editingItem.attunement}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, attunement: e.target.checked } : null)}
                      />
                    }
                    label="Requires Attunement"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editingItem.equipped}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, equipped: e.target.checked } : null)}
                      />
                    }
                    label="Equipped"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {editingItem.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => setEditingItem(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : null)}
                      size="small"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', mt: 1 }}>
                  <TextField
                    label="Add Tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <Button 
                    onClick={() => {
                      if (newTag.trim() && editingItem && !editingItem.tags.includes(newTag.trim())) {
                        setEditingItem({ ...editingItem, tags: [...editingItem.tags, newTag.trim()] });
                        setNewTag('');
                      }
                    }}
                    disabled={!newTag.trim() || (editingItem && editingItem.tags.includes(newTag.trim()))}
                    sx={{ ml: 1 }}
                  >
                    Add
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, notes: e.target.value } : null)}
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
          <Button onClick={() => setEditItemDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={saveEditedItem} 
            variant="contained" 
            color="primary"
            disabled={!editingItem || !editingItem.name.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Currency Dialog */}
      <Dialog 
        open={currencyDialogOpen} 
        onClose={() => setCurrencyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Currency</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Currency
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={2.4}>
                <Typography variant="body2" align="center">
                  {currency.platinum} PP
                </Typography>
              </Grid>
              <Grid item xs={2.4}>
                <Typography variant="body2" align="center">
                  {currency.gold} GP
                </Typography>
              </Grid>
              <Grid item xs={2.4}>
                <Typography variant="body2" align="center">
                  {currency.electrum} EP
                </Typography>
              </Grid>
              <Grid item xs={2.4}>
                <Typography variant="body2" align="center">
                  {currency.silver} SP
                </Typography>
              </Grid>
              <Grid item xs={2.4}>
                <Typography variant="body2" align="center">
                  {currency.copper} CP
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            {currencyTransaction.type === 'add' ? 'Add' : 'Remove'} Currency
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={currencyTransaction.type === 'add'}
                  onChange={(e) => setCurrencyTransaction(prev => ({ ...prev, type: e.target.checked ? 'add' : 'remove' }))}
                />
              }
              label={currencyTransaction.type === 'add' ? 'Adding Currency' : 'Removing Currency'}
            />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={2.4}>
              <TextField
                label="PP"
                type="number"
                value={currencyTransaction.platinum}
                onChange={(e) => setCurrencyTransaction(prev => ({ ...prev, platinum: parseInt(e.target.value) || 0 }))}
                fullWidth
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <TextField
                label="GP"
                type="number"
                value={currencyTransaction.gold}
                onChange={(e) => setCurrencyTransaction(prev => ({ ...prev, gold: parseInt(e.target.value) || 0 }))}
                fullWidth
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <TextField
                label="EP"
                type="number"
                value={currencyTransaction.electrum}
                onChange={(e) => setCurrencyTransaction(prev => ({ ...prev, electrum: parseInt(e.target.value) || 0 }))}
                fullWidth
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <TextField
                label="SP"
                type="number"
                value={currencyTransaction.silver}
                onChange={(e) => setCurrencyTransaction(prev => ({ ...prev, silver: parseInt(e.target.value) || 0 }))}
                fullWidth
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <TextField
                label="CP"
                type="number"
                value={currencyTransaction.copper}
                onChange={(e) => setCurrencyTransaction(prev => ({ ...prev, copper: parseInt(e.target.value) || 0 }))}
                fullWidth
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reason (optional)"
                value={currencyTransaction.reason}
                onChange={(e) => setCurrencyTransaction(prev => ({ ...prev, reason: e.target.value }))}
                fullWidth
                size="small"
                placeholder="e.g., Purchased supplies, Found treasure"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              Total: {
                (currencyTransaction.copper / 100 + 
                currencyTransaction.silver / 10 + 
                currencyTransaction.electrum / 2 + 
                currencyTransaction.gold + 
                currencyTransaction.platinum * 10).toFixed(2)
              } GP
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Button 
            variant="outlined" 
            fullWidth
            onClick={convertCurrency}
          >
            Convert to Optimal Currency Mix
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCurrencyDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={updateCurrency} 
            variant="contained" 
            color="primary"
            disabled={
              currencyTransaction.platinum === 0 && 
              currencyTransaction.gold === 0 && 
              currencyTransaction.electrum === 0 && 
              currencyTransaction.silver === 0 && 
              currencyTransaction.copper === 0
            }
          >
            {currencyTransaction.type === 'add' ? 'Add' : 'Remove'} Currency
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InventoryManager;