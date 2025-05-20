/**
 * InventoryPanel.tsx
 * Component for displaying and managing character inventory with drag-and-drop interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  Chip,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  Sort as SortIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Settings as SettingsIcon,
  MonetizationOn as GoldIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  inventoryManager, 
  InventoryEvent 
} from '../../services/InventoryManager';
import {
  Item,
  EquipmentItem,
  InventorySlot,
  CharacterInventory,
  EquipmentSlot,
  ItemCategory,
  ItemRarity,
  ItemProperty,
  ItemPropertyType
} from '../../../shared/types/inventory';

// Item drag type
const ITEM_TYPE = 'inventoryItem';

// Drag item interface
interface DragItem {
  type: string;
  slotId: string;
  item: Item;
  quantity: number;
}

// Props for the inventory panel
interface InventoryPanelProps {
  characterId: string;
  onItemUse?: (item: Item) => void;
  onItemEquip?: (item: EquipmentItem, slot: EquipmentSlot) => void;
  onItemUnequip?: (item: EquipmentItem, slot: EquipmentSlot) => void;
  readOnly?: boolean;
}

// Props for inventory slot component
interface InventorySlotProps {
  slot: InventorySlot;
  isEquipped?: boolean;
  equipmentSlot?: EquipmentSlot;
  onContextMenu: (event: React.MouseEvent, slotId: string) => void;
  onClick: (slotId: string) => void;
  readOnly?: boolean;
}

// Get background color based on item rarity
const getRarityColor = (rarity: ItemRarity, theme: any) => {
  switch (rarity) {
    case ItemRarity.COMMON:
      return theme.palette.grey[500];
    case ItemRarity.UNCOMMON:
      return theme.palette.success.main;
    case ItemRarity.RARE:
      return theme.palette.info.main;
    case ItemRarity.EPIC:
      return theme.palette.secondary.main;
    case ItemRarity.LEGENDARY:
      return theme.palette.warning.main;
    case ItemRarity.ARTIFACT:
      return theme.palette.error.main;
    default:
      return theme.palette.grey[500];
  }
};

// Get category icon
const getCategoryIcon = (category: ItemCategory) => {
  switch (category) {
    case ItemCategory.WEAPON:
      return '⚔️';
    case ItemCategory.ARMOR:
      return '🛡️';
    case ItemCategory.ACCESSORY:
      return '💍';
    case ItemCategory.CONSUMABLE:
      return '🧪';
    case ItemCategory.QUEST:
      return '📜';
    case ItemCategory.MATERIAL:
      return '🧶';
    case ItemCategory.MISCELLANEOUS:
      return '📦';
    default:
      return '❓';
  }
};

// Inventory slot component with drag and drop
const InventorySlotComponent: React.FC<InventorySlotProps> = ({
  slot,
  isEquipped = false,
  equipmentSlot,
  onContextMenu,
  onClick,
  readOnly = false
}) => {
  const theme = useTheme();
  
  // Set up drag
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: {
      type: ITEM_TYPE,
      slotId: slot.id,
      item: slot.item,
      quantity: slot.quantity
    } as DragItem,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    canDrag: !readOnly && !!slot.item && !slot.locked
  }), [slot, readOnly]);
  
  // Set up drop
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    canDrop: (item: DragItem) => {
      // Can't drop on itself
      if (item.slotId === slot.id) return false;
      
      // Can't drop on locked slots
      if (slot.locked) return false;
      
      // Can't drop if read-only
      if (readOnly) return false;
      
      return true;
    },
    drop: (item: DragItem) => {
      // Handle the drop in the parent component
      return { slotId: slot.id };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  }), [slot, readOnly]);
  
  // Combine drag and drop refs
  const ref = (el: HTMLDivElement) => {
    drag(el);
    drop(el);
  };
  
  return (
    <Box
      ref={ref}
      sx={{
        width: 64,
        height: 64,
        border: '1px solid',
        borderColor: isOver && canDrop 
          ? theme.palette.primary.main 
          : slot.locked 
            ? theme.palette.error.main 
            : theme.palette.divider,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: isOver && canDrop 
          ? alpha(theme.palette.primary.main, 0.1) 
          : slot.locked 
            ? alpha(theme.palette.error.main, 0.05) 
            : isEquipped 
              ? alpha(theme.palette.secondary.main, 0.1) 
              : theme.palette.background.paper,
        opacity: isDragging ? 0.5 : 1,
        cursor: slot.item && !readOnly ? 'grab' : 'default',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: slot.item && !readOnly 
            ? theme.palette.primary.main 
            : slot.locked 
              ? theme.palette.error.main 
              : theme.palette.divider,
          backgroundColor: slot.item && !readOnly 
            ? alpha(theme.palette.primary.main, 0.05) 
            : slot.locked 
              ? alpha(theme.palette.error.main, 0.05) 
              : isEquipped 
                ? alpha(theme.palette.secondary.main, 0.1) 
                : theme.palette.background.paper,
        }
      }}
      onClick={() => onClick(slot.id)}
      onContextMenu={(e) => onContextMenu(e, slot.id)}
    >
      {slot.item ? (
        <>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: 0.5,
            }}
          >
            {/* Item image or icon */}
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: alpha(getRarityColor(slot.item.rarity, theme), 0.2),
                border: `1px solid ${getRarityColor(slot.item.rarity, theme)}`,
              }}
            >
              {slot.item.imageUrl ? (
                <img 
                  src={slot.item.imageUrl} 
                  alt={slot.item.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              ) : (
                <Typography variant="body1">
                  {getCategoryIcon(slot.item.category)}
                </Typography>
              )}
            </Box>
            
            {/* Item quantity */}
            {slot.quantity > 1 && (
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute', 
                  bottom: 2, 
                  right: 2, 
                  backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  padding: '0 2px',
                  borderRadius: 0.5,
                  minWidth: 16,
                  textAlign: 'center'
                }}
              >
                {slot.quantity}
              </Typography>
            )}
            
            {/* Equipment slot indicator */}
            {isEquipped && equipmentSlot && (
              <Tooltip title={equipmentSlot.replace('_', ' ').toUpperCase()}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.secondary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: theme.palette.secondary.contrastText,
                  }}
                >
                  {equipmentSlot.charAt(0).toUpperCase()}
                </Box>
              </Tooltip>
            )}
          </Box>
        </>
      ) : (
        // Empty slot
        equipmentSlot ? (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            {equipmentSlot.replace('_', ' ').toUpperCase()}
          </Typography>
        ) : null
      )}
      
      {/* Locked indicator */}
      {slot.locked && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LockIcon color="error" fontSize="small" />
        </Box>
      )}
    </Box>
  );
};

// Main inventory panel component
const InventoryPanel: React.FC<InventoryPanelProps> = ({
  characterId,
  onItemUse,
  onItemEquip,
  onItemUnequip,
  readOnly = false
}) => {
  const theme = useTheme();
  const [inventory, setInventory] = useState<CharacterInventory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    slotId: string;
  } | null>(null);
  const [itemDetailsOpen, setItemDetailsOpen] = useState<boolean>(false);
  const [splitStackOpen, setSplitStackOpen] = useState<boolean>(false);
  const [splitQuantity, setSplitQuantity] = useState<number>(1);
  const [goldDialogOpen, setGoldDialogOpen] = useState<boolean>(false);
  const [goldAmount, setGoldAmount] = useState<number>(0);
  const [goldAction, setGoldAction] = useState<'add' | 'remove'>('add');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredSlots, setFilteredSlots] = useState<InventorySlot[]>([]);
  
  // Load inventory on mount
  useEffect(() => {
    loadInventory();
    
    // Listen for inventory events
    const handleInventoryEvent = (event: InventoryEvent) => {
      if (event.characterId === characterId) {
        loadInventory();
      }
    };
    
    inventoryManager.addEventListener(handleInventoryEvent);
    
    return () => {
      inventoryManager.removeEventListener(handleInventoryEvent);
    };
  }, [characterId]);
  
  // Filter slots when search query changes
  useEffect(() => {
    if (!inventory) return;
    
    if (!searchQuery) {
      setFilteredSlots(inventory.slots);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = inventory.slots.filter(slot => {
      if (!slot.item) return false;
      
      return (
        slot.item.name.toLowerCase().includes(query) ||
        slot.item.description.toLowerCase().includes(query) ||
        slot.item.category.toLowerCase().includes(query) ||
        slot.item.rarity.toLowerCase().includes(query) ||
        slot.item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });
    
    setFilteredSlots(filtered);
  }, [inventory, searchQuery]);
  
  // Load inventory data
  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const inv = await inventoryManager.getInventory(characterId);
      setInventory(inv);
      setFilteredSlots(inv.slots);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle slot click
  const handleSlotClick = (slotId: string) => {
    setSelectedSlot(slotId);
    
    // Find the slot
    const slot = inventory?.slots.find(s => s.id === slotId);
    
    if (slot?.item) {
      setItemDetailsOpen(true);
    }
  };
  
  // Handle context menu
  const handleContextMenu = (event: React.MouseEvent, slotId: string) => {
    event.preventDefault();
    
    // Find the slot
    const slot = inventory?.slots.find(s => s.id === slotId);
    
    if (!slot || readOnly) return;
    
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      slotId
    });
  };
  
  // Handle context menu close
  const handleContextMenuClose = () => {
    setContextMenu(null);
  };
  
  // Handle item use
  const handleUseItem = () => {
    if (!contextMenu) return;
    
    const slot = inventory?.slots.find(s => s.id === contextMenu.slotId);
    
    if (!slot || !slot.item) return;
    
    inventoryManager.useItem(characterId, contextMenu.slotId);
    
    if (onItemUse) {
      onItemUse(slot.item);
    }
    
    handleContextMenuClose();
  };
  
  // Handle item equip
  const handleEquipItem = () => {
    if (!contextMenu) return;
    
    const slot = inventory?.slots.find(s => s.id === contextMenu.slotId);
    
    if (!slot || !slot.item) return;
    
    inventoryManager.equipItem(characterId, contextMenu.slotId);
    
    if (onItemEquip && 'equipmentSlot' in slot.item) {
      onItemEquip(slot.item as EquipmentItem, (slot.item as EquipmentItem).equipmentSlot);
    }
    
    handleContextMenuClose();
  };
  
  // Handle item unequip
  const handleUnequipItem = (equipmentSlot: EquipmentSlot) => {
    inventoryManager.unequipItem(characterId, equipmentSlot);
    
    const item = inventory?.equipped[equipmentSlot];
    
    if (item && onItemUnequip) {
      onItemUnequip(item, equipmentSlot);
    }
  };
  
  // Handle split stack
  const handleSplitStack = () => {
    if (!contextMenu) return;
    
    setSplitStackOpen(true);
    handleContextMenuClose();
  };
  
  // Handle split stack confirm
  const handleSplitStackConfirm = () => {
    if (!selectedSlot) return;
    
    inventoryManager.splitStack(characterId, selectedSlot, splitQuantity);
    setSplitStackOpen(false);
  };
  
  // Handle lock/unlock slot
  const handleToggleLockSlot = () => {
    if (!contextMenu) return;
    
    const slot = inventory?.slots.find(s => s.id === contextMenu.slotId);
    
    if (!slot) return;
    
    if (slot.locked) {
      inventoryManager.unlockSlot(characterId, contextMenu.slotId);
    } else {
      inventoryManager.lockSlot(characterId, contextMenu.slotId);
    }
    
    handleContextMenuClose();
  };
  
  // Handle sort inventory
  const handleSortInventory = () => {
    inventoryManager.sortInventory(characterId);
  };
  
  // Handle gold dialog open
  const handleGoldDialogOpen = (action: 'add' | 'remove') => {
    setGoldAction(action);
    setGoldAmount(0);
    setGoldDialogOpen(true);
  };
  
  // Handle gold dialog confirm
  const handleGoldDialogConfirm = () => {
    if (goldAction === 'add') {
      inventoryManager.addGold(characterId, goldAmount);
    } else {
      inventoryManager.removeGold(characterId, goldAmount);
    }
    
    setGoldDialogOpen(false);
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle item drop
  const handleItemDrop = useCallback(
    (sourceSlotId: string, targetSlotId: string) => {
      inventoryManager.moveItem(characterId, sourceSlotId, targetSlotId);
    },
    [characterId]
  );
  
  // Get selected item
  const getSelectedItem = (): Item | null => {
    if (!selectedSlot || !inventory) return null;
    
    const slot = inventory.slots.find(s => s.id === selectedSlot);
    
    return slot?.item || null;
  };
  
  // Get slot by ID
  const getSlotById = (slotId: string): InventorySlot | undefined => {
    return inventory?.slots.find(s => s.id === slotId);
  };
  
  // Format gold amount
  const formatGold = (amount: number): string => {
    return amount.toLocaleString();
  };
  
  // Render loading state
  if (loading && !inventory) {
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
          onClick={loadInventory} 
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  // Render empty state
  if (!inventory) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No inventory data available</Typography>
      </Box>
    );
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ p: 2 }}>
        {/* Header with gold and actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6">Inventory</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!readOnly && (
              <>
                <Tooltip title="Sort inventory">
                  <IconButton onClick={handleSortInventory} size="small">
                    <SortIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Inventory settings">
                  <IconButton size="small">
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            <Chip
              icon={<GoldIcon />}
              label={formatGold(inventory.gold)}
              color="primary"
              variant="outlined"
              onClick={() => !readOnly && handleGoldDialogOpen('add')}
              onDelete={() => !readOnly && handleGoldDialogOpen('remove')}
              deleteIcon={<RemoveIcon />}
              sx={{ ml: 1, cursor: readOnly ? 'default' : 'pointer' }}
            />
          </Box>
        </Box>
        
        {/* Search bar */}
        <TextField
          placeholder="Search items..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: searchQuery && (
              <IconButton size="small" onClick={() => setSearchQuery('')}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )
          }}
          sx={{ mb: 2 }}
        />
        
        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Inventory" />
          <Tab label="Equipment" />
        </Tabs>
        
        {/* Inventory tab */}
        {activeTab === 0 && (
          <Grid container spacing={1}>
            {filteredSlots.map((slot) => (
              <Grid item key={slot.id}>
                <InventorySlotComponent
                  slot={slot}
                  onContextMenu={handleContextMenu}
                  onClick={handleSlotClick}
                  readOnly={readOnly}
                />
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Equipment tab */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Upper body */}
            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'head',
                    item: inventory.equipped[EquipmentSlot.HEAD] || null,
                    quantity: inventory.equipped[EquipmentSlot.HEAD] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.HEAD]}
                  equipmentSlot={EquipmentSlot.HEAD}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.HEAD] && handleUnequipItem(EquipmentSlot.HEAD)}
                  readOnly={readOnly}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'neck',
                    item: inventory.equipped[EquipmentSlot.NECK] || null,
                    quantity: inventory.equipped[EquipmentSlot.NECK] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.NECK]}
                  equipmentSlot={EquipmentSlot.NECK}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.NECK] && handleUnequipItem(EquipmentSlot.NECK)}
                  readOnly={readOnly}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'shoulders',
                    item: inventory.equipped[EquipmentSlot.SHOULDERS] || null,
                    quantity: inventory.equipped[EquipmentSlot.SHOULDERS] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.SHOULDERS]}
                  equipmentSlot={EquipmentSlot.SHOULDERS}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.SHOULDERS] && handleUnequipItem(EquipmentSlot.SHOULDERS)}
                  readOnly={readOnly}
                />
              </Grid>
            </Grid>
            
            {/* Middle body */}
            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'main_hand',
                    item: inventory.equipped[EquipmentSlot.MAIN_HAND] || null,
                    quantity: inventory.equipped[EquipmentSlot.MAIN_HAND] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.MAIN_HAND]}
                  equipmentSlot={EquipmentSlot.MAIN_HAND}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.MAIN_HAND] && handleUnequipItem(EquipmentSlot.MAIN_HAND)}
                  readOnly={readOnly}
                />
              </Grid>
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'chest',
                    item: inventory.equipped[EquipmentSlot.CHEST] || null,
                    quantity: inventory.equipped[EquipmentSlot.CHEST] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.CHEST]}
                  equipmentSlot={EquipmentSlot.CHEST}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.CHEST] && handleUnequipItem(EquipmentSlot.CHEST)}
                  readOnly={readOnly}
                />
              </Grid>
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'off_hand',
                    item: inventory.equipped[EquipmentSlot.OFF_HAND] || null,
                    quantity: inventory.equipped[EquipmentSlot.OFF_HAND] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.OFF_HAND]}
                  equipmentSlot={EquipmentSlot.OFF_HAND}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.OFF_HAND] && handleUnequipItem(EquipmentSlot.OFF_HAND)}
                  readOnly={readOnly}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'two_hand',
                    item: inventory.equipped[EquipmentSlot.TWO_HAND] || null,
                    quantity: inventory.equipped[EquipmentSlot.TWO_HAND] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.TWO_HAND]}
                  equipmentSlot={EquipmentSlot.TWO_HAND}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.TWO_HAND] && handleUnequipItem(EquipmentSlot.TWO_HAND)}
                  readOnly={readOnly}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'wrists',
                    item: inventory.equipped[EquipmentSlot.WRISTS] || null,
                    quantity: inventory.equipped[EquipmentSlot.WRISTS] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.WRISTS]}
                  equipmentSlot={EquipmentSlot.WRISTS}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.WRISTS] && handleUnequipItem(EquipmentSlot.WRISTS)}
                  readOnly={readOnly}
                />
              </Grid>
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'hands',
                    item: inventory.equipped[EquipmentSlot.HANDS] || null,
                    quantity: inventory.equipped[EquipmentSlot.HANDS] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.HANDS]}
                  equipmentSlot={EquipmentSlot.HANDS}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.HANDS] && handleUnequipItem(EquipmentSlot.HANDS)}
                  readOnly={readOnly}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'waist',
                    item: inventory.equipped[EquipmentSlot.WAIST] || null,
                    quantity: inventory.equipped[EquipmentSlot.WAIST] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.WAIST]}
                  equipmentSlot={EquipmentSlot.WAIST}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.WAIST] && handleUnequipItem(EquipmentSlot.WAIST)}
                  readOnly={readOnly}
                />
              </Grid>
            </Grid>
            
            {/* Lower body */}
            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'legs',
                    item: inventory.equipped[EquipmentSlot.LEGS] || null,
                    quantity: inventory.equipped[EquipmentSlot.LEGS] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.LEGS]}
                  equipmentSlot={EquipmentSlot.LEGS}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.LEGS] && handleUnequipItem(EquipmentSlot.LEGS)}
                  readOnly={readOnly}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'feet',
                    item: inventory.equipped[EquipmentSlot.FEET] || null,
                    quantity: inventory.equipped[EquipmentSlot.FEET] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.FEET]}
                  equipmentSlot={EquipmentSlot.FEET}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.FEET] && handleUnequipItem(EquipmentSlot.FEET)}
                  readOnly={readOnly}
                />
              </Grid>
            </Grid>
            
            {/* Accessories */}
            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'finger_1',
                    item: inventory.equipped[EquipmentSlot.FINGER_1] || null,
                    quantity: inventory.equipped[EquipmentSlot.FINGER_1] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.FINGER_1]}
                  equipmentSlot={EquipmentSlot.FINGER_1}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.FINGER_1] && handleUnequipItem(EquipmentSlot.FINGER_1)}
                  readOnly={readOnly}
                />
              </Grid>
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'finger_2',
                    item: inventory.equipped[EquipmentSlot.FINGER_2] || null,
                    quantity: inventory.equipped[EquipmentSlot.FINGER_2] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.FINGER_2]}
                  equipmentSlot={EquipmentSlot.FINGER_2}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.FINGER_2] && handleUnequipItem(EquipmentSlot.FINGER_2)}
                  readOnly={readOnly}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'trinket_1',
                    item: inventory.equipped[EquipmentSlot.TRINKET_1] || null,
                    quantity: inventory.equipped[EquipmentSlot.TRINKET_1] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.TRINKET_1]}
                  equipmentSlot={EquipmentSlot.TRINKET_1}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.TRINKET_1] && handleUnequipItem(EquipmentSlot.TRINKET_1)}
                  readOnly={readOnly}
                />
              </Grid>
              <Grid item>
                <InventorySlotComponent
                  slot={{
                    id: 'trinket_2',
                    item: inventory.equipped[EquipmentSlot.TRINKET_2] || null,
                    quantity: inventory.equipped[EquipmentSlot.TRINKET_2] ? 1 : 0,
                    locked: false
                  }}
                  isEquipped={!!inventory.equipped[EquipmentSlot.TRINKET_2]}
                  equipmentSlot={EquipmentSlot.TRINKET_2}
                  onContextMenu={handleContextMenu}
                  onClick={() => inventory.equipped[EquipmentSlot.TRINKET_2] && handleUnequipItem(EquipmentSlot.TRINKET_2)}
                  readOnly={readOnly}
                />
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Context menu */}
        <Menu
          open={!!contextMenu}
          onClose={handleContextMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          {contextMenu && getSlotById(contextMenu.slotId)?.item && (
            <>
              <MenuItem onClick={() => {
                setSelectedSlot(contextMenu.slotId);
                setItemDetailsOpen(true);
                handleContextMenuClose();
              }}>
                <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                Item Details
              </MenuItem>
              
              {getSlotById(contextMenu.slotId)?.item?.usable && (
                <MenuItem onClick={handleUseItem}>
                  <AddIcon fontSize="small" sx={{ mr: 1 }} />
                  Use Item
                </MenuItem>
              )}
              
              {(getSlotById(contextMenu.slotId)?.item?.category === ItemCategory.WEAPON ||
               getSlotById(contextMenu.slotId)?.item?.category === ItemCategory.ARMOR ||
               getSlotById(contextMenu.slotId)?.item?.category === ItemCategory.ACCESSORY) && (
                <MenuItem onClick={handleEquipItem}>
                  <EquipIcon fontSize="small" sx={{ mr: 1 }} />
                  Equip
                </MenuItem>
              )}
              
              {getSlotById(contextMenu.slotId)?.item?.stackable &&
               getSlotById(contextMenu.slotId)?.quantity! > 1 && (
                <MenuItem onClick={handleSplitStack}>
                  <SplitIcon fontSize="small" sx={{ mr: 1 }} />
                  Split Stack
                </MenuItem>
              )}
              
              <Divider />
              
              <MenuItem onClick={handleToggleLockSlot}>
                {getSlotById(contextMenu.slotId)?.locked ? (
                  <>
                    <LockOpenIcon fontSize="small" sx={{ mr: 1 }} />
                    Unlock Slot
                  </>
                ) : (
                  <>
                    <LockIcon fontSize="small" sx={{ mr: 1 }} />
                    Lock Slot
                  </>
                )}
              </MenuItem>
              
              <MenuItem onClick={() => {
                inventoryManager.removeItem(characterId, contextMenu.slotId);
                handleContextMenuClose();
              }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Discard Item
              </MenuItem>
            </>
          )}
          
          {contextMenu && !getSlotById(contextMenu.slotId)?.item && (
            <MenuItem onClick={handleToggleLockSlot}>
              {getSlotById(contextMenu.slotId)?.locked ? (
                <>
                  <LockOpenIcon fontSize="small" sx={{ mr: 1 }} />
                  Unlock Slot
                </>
              ) : (
                <>
                  <LockIcon fontSize="small" sx={{ mr: 1 }} />
                  Lock Slot
                </>
              )}
            </MenuItem>
          )}
        </Menu>
        
        {/* Item details dialog */}
        <Dialog
          open={itemDetailsOpen}
          onClose={() => setItemDetailsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          {getSelectedItem() && (
            <>
              <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: alpha(getRarityColor(getSelectedItem()!.rarity, theme), 0.1)
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">{getSelectedItem()!.name}</Typography>
                  <Chip 
                    label={getSelectedItem()!.rarity.toUpperCase()} 
                    size="small" 
                    sx={{ 
                      ml: 1,
                      bgcolor: getRarityColor(getSelectedItem()!.rarity, theme),
                      color: '#fff'
                    }} 
                  />
                </Box>
                <IconButton onClick={() => setItemDetailsOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      {/* Item image */}
                      <Box sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(getRarityColor(getSelectedItem()!.rarity, theme), 0.2),
                        border: `2px solid ${getRarityColor(getSelectedItem()!.rarity, theme)}`,
                        mb: 2
                      }}>
                        {getSelectedItem()!.imageUrl ? (
                          <img 
                            src={getSelectedItem()!.imageUrl} 
                            alt={getSelectedItem()!.name} 
                            style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
                          />
                        ) : (
                          <Typography variant="h4">
                            {getCategoryIcon(getSelectedItem()!.category)}
                          </Typography>
                        )}
                      </Box>
                      
                      {/* Item basic info */}
                      <Typography variant="subtitle2" align="center">
                        {getSelectedItem()!.category.toUpperCase()}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" align="center">
                        Value: {getSelectedItem()!.value} gold
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" align="center">
                        Weight: {getSelectedItem()!.weight} {getSelectedItem()!.weight === 1 ? 'lb' : 'lbs'}
                      </Typography>
                      
                      {getSelectedItem()!.requiredLevel && (
                        <Typography variant="body2" color="text.secondary" align="center">
                          Required Level: {getSelectedItem()!.requiredLevel}
                        </Typography>
                      )}
                      
                      {/* Tags */}
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                        {getSelectedItem()!.tags.map((tag) => (
                          <Chip 
                            key={tag} 
                            label={tag} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={8}>
                    {/* Item description */}
                    <Typography variant="body1" paragraph>
                      {getSelectedItem()!.description}
                    </Typography>
                    
                    {/* Item properties */}
                    {getSelectedItem()!.properties.length > 0 && (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          Properties
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          {getSelectedItem()!.properties.map((prop: ItemProperty, index) => (
                            <Typography 
                              key={index} 
                              variant="body2" 
                              color={prop.type === ItemPropertyType.SPECIAL ? 'primary.main' : 'text.primary'}
                              sx={{ mb: 0.5 }}
                            >
                              {prop.name}: {prop.value}
                              {prop.description && ` (${prop.description})`}
                            </Typography>
                          ))}
                        </Box>
                      </>
                    )}
                    
                    {/* Equipment specific info */}
                    {'equipmentSlot' in getSelectedItem()! && (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          Equipment
                        </Typography>
                        <Typography variant="body2">
                          Slot: {(getSelectedItem() as EquipmentItem).equipmentSlot.replace('_', ' ').toUpperCase()}
                        </Typography>
                        
                        {'durability' in getSelectedItem()! && (getSelectedItem() as any).durability && (
                          <Typography variant="body2">
                            Durability: {(getSelectedItem() as any).durability.current}/{(getSelectedItem() as any).durability.max}
                          </Typography>
                        )}
                        
                        {'requirements' in getSelectedItem()! && (getSelectedItem() as any).requirements && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2">Requirements</Typography>
                            {(getSelectedItem() as any).requirements.strength && (
                              <Typography variant="body2">
                                Strength: {(getSelectedItem() as any).requirements.strength}
                              </Typography>
                            )}
                            {(getSelectedItem() as any).requirements.dexterity && (
                              <Typography variant="body2">
                                Dexterity: {(getSelectedItem() as any).requirements.dexterity}
                              </Typography>
                            )}
                            {(getSelectedItem() as any).requirements.intelligence && (
                              <Typography variant="body2">
                                Intelligence: {(getSelectedItem() as any).requirements.intelligence}
                              </Typography>
                            )}
                            {(getSelectedItem() as any).requirements.level && (
                              <Typography variant="body2">
                                Level: {(getSelectedItem() as any).requirements.level}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </>
                    )}
                    
                    {/* Weapon specific info */}
                    {getSelectedItem()!.category === ItemCategory.WEAPON && 'damage' in getSelectedItem()! && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Weapon Stats</Typography>
                        <Typography variant="body2">
                          Damage: {(getSelectedItem() as any).damage.min}-{(getSelectedItem() as any).damage.max} {(getSelectedItem() as any).damage.type}
                        </Typography>
                        <Typography variant="body2">
                          Attack Speed: {(getSelectedItem() as any).attackSpeed.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Range: {(getSelectedItem() as any).range}
                        </Typography>
                        <Typography variant="body2">
                          {(getSelectedItem() as any).twoHanded ? 'Two-handed' : 'One-handed'}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Armor specific info */}
                    {getSelectedItem()!.category === ItemCategory.ARMOR && 'defense' in getSelectedItem()! && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Armor Stats</Typography>
                        <Typography variant="body2">
                          Defense: {(getSelectedItem() as any).defense}
                        </Typography>
                        <Typography variant="body2">
                          Type: {(getSelectedItem() as any).armorType.charAt(0).toUpperCase() + (getSelectedItem() as any).armorType.slice(1)}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Consumable specific info */}
                    {getSelectedItem()!.category === ItemCategory.CONSUMABLE && 'effects' in getSelectedItem()! && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Effects</Typography>
                        {(getSelectedItem() as any).effects.map((effect: any, index: number) => (
                          <Typography key={index} variant="body2">
                            {effect.type}: {effect.value > 0 ? '+' : ''}{effect.value}
                            {effect.duration ? ` for ${effect.duration} seconds` : ''}
                          </Typography>
                        ))}
                        
                        {(getSelectedItem() as any).cooldown && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Cooldown: {(getSelectedItem() as any).cooldown} seconds
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    {/* Lore */}
                    {getSelectedItem()!.lore && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Lore
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontStyle: 'italic' }}
                        >
                          {getSelectedItem()!.lore}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions>
                {!readOnly && (
                  <>
                    {getSelectedItem()!.usable && (
                      <Button 
                        onClick={() => {
                          inventoryManager.useItem(characterId, selectedSlot!);
                          if (onItemUse) onItemUse(getSelectedItem()!);
                          setItemDetailsOpen(false);
                        }}
                      >
                        Use
                      </Button>
                    )}
                    
                    {(getSelectedItem()!.category === ItemCategory.WEAPON ||
                     getSelectedItem()!.category === ItemCategory.ARMOR ||
                     getSelectedItem()!.category === ItemCategory.ACCESSORY) && (
                      <Button 
                        onClick={() => {
                          inventoryManager.equipItem(characterId, selectedSlot!);
                          if (onItemEquip && 'equipmentSlot' in getSelectedItem()!) {
                            onItemEquip(
                              getSelectedItem()! as EquipmentItem, 
                              (getSelectedItem()! as EquipmentItem).equipmentSlot
                            );
                          }
                          setItemDetailsOpen(false);
                        }}
                      >
                        Equip
                      </Button>
                    )}
                    
                    <Button 
                      onClick={() => {
                        inventoryManager.removeItem(characterId, selectedSlot!);
                        setItemDetailsOpen(false);
                      }}
                      color="error"
                    >
                      Discard
                    </Button>
                  </>
                )}
                
                <Button 
                  onClick={() => setItemDetailsOpen(false)}
                  variant="contained"
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
        
        {/* Split stack dialog */}
        <Dialog
          open={splitStackOpen}
          onClose={() => setSplitStackOpen(false)}
        >
          <DialogTitle>Split Stack</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" gutterBottom>
                Current quantity: {getSlotById(selectedSlot || '')?.quantity || 0}
              </Typography>
              <TextField
                label="Quantity to split"
                type="number"
                fullWidth
                value={splitQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (
                    !isNaN(value) && 
                    value > 0 && 
                    value < (getSlotById(selectedSlot || '')?.quantity || 0)
                  ) {
                    setSplitQuantity(value);
                  }
                }}
                InputProps={{
                  inputProps: {
                    min: 1,
                    max: (getSlotById(selectedSlot || '')?.quantity || 0) - 1
                  }
                }}
                sx={{ mt: 1 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSplitStackOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSplitStackConfirm}
              variant="contained"
            >
              Split
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Gold dialog */}
        <Dialog
          open={goldDialogOpen}
          onClose={() => setGoldDialogOpen(false)}
        >
          <DialogTitle>
            {goldAction === 'add' ? 'Add Gold' : 'Remove Gold'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" gutterBottom>
                Current gold: {formatGold(inventory.gold)}
              </Typography>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={goldAmount}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    if (goldAction === 'remove' && value > inventory.gold) {
                      setGoldAmount(inventory.gold);
                    } else {
                      setGoldAmount(value);
                    }
                  } else {
                    setGoldAmount(0);
                  }
                }}
                InputProps={{
                  inputProps: {
                    min: 1,
                    max: goldAction === 'remove' ? inventory.gold : undefined
                  }
                }}
                sx={{ mt: 1 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGoldDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGoldDialogConfirm}
              variant="contained"
              disabled={goldAmount <= 0}
            >
              {goldAction === 'add' ? 'Add' : 'Remove'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DndProvider>
  );
};

// Missing icons
interface CustomIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  fontSize?: string;
  sx?: React.CSSProperties | any;
}

const RemoveIcon: React.FC<CustomIconProps> = ({ fontSize, sx, ...props }) => (
  <span style={{ ...(sx || {}), fontSize }} {...props}>-</span>
);

const EquipIcon: React.FC<CustomIconProps> = ({ fontSize, sx, ...props }) => (
  <span style={{ ...(sx || {}), fontSize }} {...props}>👕</span>
);

const SplitIcon: React.FC<CustomIconProps> = ({ fontSize, sx, ...props }) => (
  <span style={{ ...(sx || {}), fontSize }} {...props}>✂️</span>
);

export default InventoryPanel;