/**
 * MapEditor.tsx
 * Interactive map editor component for creating and editing world maps
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip, 
  Tabs, 
  Tab, 
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  useTheme
} from '@mui/material';
import {
  Map as MapIcon,
  Layers as LayersIcon,
  LocationOn as LocationIcon,
  Route as RouteIcon,
  Terrain as TerrainIcon,
  GridOn as GridIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Import the WorldMapService
import { WorldMapService } from '../../services/WorldMapService';

// Import types
import {
  WorldMap,
  MapLayer,
  MapLayerType,
  MapLocation,
  MapRoute,
  MapCoordinate,
  LocationType,
  RouteType,
  TerrainType
} from '../../../shared/types/worldmap';

interface MapEditorProps {
  mapId?: string;
  readOnly?: boolean;
  onMapSaved?: (mapId: string) => void;
}

const MapEditor: React.FC<MapEditorProps> = ({
  mapId,
  readOnly = false,
  onMapSaved
}) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [map, setMap] = useState<WorldMap | null>(null);
  const [currentMapId, setMapId] = useState<string | undefined>(mapId);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<'view' | 'add' | 'edit'>('view');
  const [toolType, setToolType] = useState<'location' | 'route' | 'terrain' | 'grid'>('location');
  const [newLocationDialog, setNewLocationDialog] = useState<boolean>(false);
  const [newRouteDialog, setNewRouteDialog] = useState<boolean>(false);
  const [mapSettingsDialog, setMapSettingsDialog] = useState<boolean>(false);
  
  // New location form state
  const [newLocation, setNewLocation] = useState<{
    name: string;
    type: LocationType;
    position: MapCoordinate;
    description: string;
  }>({
    name: '',
    type: LocationType.CITY,
    position: { x: 0, y: 0 },
    description: ''
  });
  
  // New route form state
  const [newRoute, setNewRoute] = useState<{
    name: string;
    type: RouteType;
    points: MapCoordinate[];
    description: string;
  }>({
    name: '',
    type: RouteType.ROAD,
    points: [],
    description: ''
  });
  
  // Map settings form state
  const [mapSettings, setMapSettings] = useState<{
    name: string;
    width: number;
    height: number;
    gridEnabled: boolean;
    fogOfWarEnabled: boolean;
    description: string;
  }>({
    name: '',
    width: 1000,
    height: 1000,
    gridEnabled: false,
    fogOfWarEnabled: false,
    description: ''
  });
  
  // Get the WorldMapService instance
  const worldMapService = WorldMapService.getInstance();
  
  // Load map on mount or when mapId changes
  useEffect(() => {
    loadMap();
    // Update currentMapId when prop changes
    if (mapId !== currentMapId) {
      setMapId(mapId);
    }
  }, [mapId, currentMapId]);
  
  // Load map data
  const loadMap = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (mapId) {
        // Load existing map
        const loadedMap = await worldMapService.getMap(mapId);
        
        if (loadedMap) {
          setMap(loadedMap);
          
          // Set initial selected layer
          if (loadedMap.settings.defaultLayer) {
            setSelectedLayer(loadedMap.settings.defaultLayer);
          } else if (loadedMap.layers.length > 0) {
            setSelectedLayer(loadedMap.layers[0].id);
          }
          
          // Set map settings
          setMapSettings({
            name: loadedMap.name,
            width: loadedMap.width,
            height: loadedMap.height,
            gridEnabled: loadedMap.settings.gridEnabled,
            fogOfWarEnabled: loadedMap.settings.fogOfWarEnabled,
            description: loadedMap.description || ''
          });
          
          // Set initial view
          if (loadedMap.defaultView) {
            setPan({
              x: loadedMap.defaultView.center.x,
              y: loadedMap.defaultView.center.y
            });
            setZoom(loadedMap.defaultView.zoom);
          }
        } else {
          throw new Error('Map not found');
        }
      } else {
        // Create a new map
        setMap(null);
      }
    } catch (err) {
      console.error('Error loading map:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  // Draw map on canvas
  useEffect(() => {
    if (!map || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    canvas.width = map.width;
    canvas.height = map.height;
    
    // Draw background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw each visible layer
    map.layers
      .filter(layer => layer.visible)
      .sort((a, b) => a.order - b.order)
      .forEach(layer => {
        drawLayer(ctx, layer);
      });
    
  }, [map, zoom, pan, selectedLayer]);
  
  // Draw a layer
  const drawLayer = (ctx: CanvasRenderingContext2D, layer: MapLayer) => {
    ctx.globalAlpha = layer.opacity;
    
    switch (layer.type) {
      case MapLayerType.BASE:
        // Draw base layer (background image or color)
        if (layer.data.imageUrl) {
          // Draw image if available
          const img = new Image();
          img.src = layer.data.imageUrl;
          ctx.drawImage(img, 0, 0, layer.data.width, layer.data.height);
        }
        break;
        
      case MapLayerType.TERRAIN:
        // Draw terrain features
        if (layer.data.terrains) {
          layer.data.terrains.forEach(terrain => {
            // Draw terrain based on type and shape
            // This would be implemented based on terrain visualization needs
          });
        }
        break;
        
      case MapLayerType.POINTS_OF_INTEREST:
        // Draw locations
        if (layer.data.locations) {
          layer.data.locations.forEach(location => {
            drawLocation(ctx, location);
          });
        }
        break;
        
      case MapLayerType.ROUTES:
        // Draw routes
        if (layer.data.routes) {
          layer.data.routes.forEach(route => {
            drawRoute(ctx, route);
          });
        }
        break;
        
      case MapLayerType.GRID:
        // Draw grid
        if (map?.settings.gridEnabled) {
          drawGrid(ctx, layer.data);
        }
        break;
        
      case MapLayerType.FOG_OF_WAR:
        // Draw fog of war
        if (map?.settings.fogOfWarEnabled) {
          drawFogOfWar(ctx, layer.data);
        }
        break;
        
      default:
        break;
    }
    
    // Reset opacity
    ctx.globalAlpha = 1;
  };
  
  // Draw a location on the map
  const drawLocation = (ctx: CanvasRenderingContext2D, location: MapLocation) => {
    const { x, y } = location.position;
    const isSelected = location.id === selectedLocation;
    
    // Set styles based on location type
    let color = '#3f51b5';
    let size = 10;
    
    switch (location.type) {
      case LocationType.CITY:
        color = '#e91e63';
        size = 12;
        break;
      case LocationType.TOWN:
        color = '#9c27b0';
        size = 10;
        break;
      case LocationType.VILLAGE:
        color = '#673ab7';
        size = 8;
        break;
      case LocationType.DUNGEON:
        color = '#f44336';
        size = 10;
        break;
      case LocationType.LANDMARK:
        color = '#2196f3';
        size = 10;
        break;
      default:
        break;
    }
    
    // Draw location marker
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw selection indicator if selected
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(x, y, size + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffeb3b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw location name
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(location.name, x, y + size + 15);
  };
  
  // Draw a route on the map
  const drawRoute = (ctx: CanvasRenderingContext2D, route: MapRoute) => {
    const isSelected = route.id === selectedRoute;
    
    // Set styles based on route type
    let color = '#795548';
    let width = 3;
    
    switch (route.type) {
      case RouteType.ROAD:
        color = '#795548';
        width = 3;
        break;
      case RouteType.RIVER:
        color = '#2196f3';
        width = 4;
        break;
      case RouteType.PATH:
        color = '#8d6e63';
        width = 2;
        break;
      case RouteType.TRAIL:
        color = '#a1887f';
        width = 1;
        break;
      case RouteType.BORDER:
        color = '#f44336';
        width = 3;
        break;
      case RouteType.TRADE_ROUTE:
        color = '#ffc107';
        width = 2;
        break;
      case RouteType.CUSTOM:
        color = '#f44336';
        width = 2;
        break;
      default:
        break;
    }
    
    // Draw route path
    if (route.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(route.points[0].x, route.points[0].y);
      
      for (let i = 1; i < route.points.length; i++) {
        ctx.lineTo(route.points[i].x, route.points[i].y);
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
      
      // Draw selection indicator if selected
      if (isSelected) {
        ctx.beginPath();
        ctx.moveTo(route.points[0].x, route.points[0].y);
        
        for (let i = 1; i < route.points.length; i++) {
          ctx.lineTo(route.points[i].x, route.points[i].y);
        }
        
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = width + 2;
        ctx.stroke();
      }
      
      // Draw route name at midpoint
      const midIndex = Math.floor(route.points.length / 2);
      const midPoint = route.points[midIndex];
      
      ctx.font = '12px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(route.name, midPoint.x, midPoint.y - 10);
    }
  };
  
  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, gridData: any) => {
    const { cellSize, color, opacity } = gridData;
    
    ctx.strokeStyle = color || '#000000';
    ctx.globalAlpha = opacity || 0.2;
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= map!.width; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, map!.height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= map!.height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(map!.width, y);
      ctx.stroke();
    }
    
    // Reset opacity
    ctx.globalAlpha = 1;
  };
  
  // Draw fog of war
  const drawFogOfWar = (ctx: CanvasRenderingContext2D, fogData: any) => {
    const { revealedAreas, exploredAreas } = fogData;
    
    // Draw unexplored areas (full fog)
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(0, 0, map!.width, map!.height);
    
    // Draw explored areas (partial fog)
    ctx.globalAlpha = 0.4;
    exploredAreas.forEach((area: any) => {
      // Clear the explored area with reduced fog
      ctx.clearRect(area.x, area.y, area.width, area.height);
    });
    
    // Draw revealed areas (no fog)
    ctx.globalAlpha = 0;
    revealedAreas.forEach((area: any) => {
      // Clear the revealed area completely
      ctx.clearRect(area.x, area.y, area.width, area.height);
    });
    
    // Reset opacity
    ctx.globalAlpha = 1;
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle zoom change
  const handleZoomChange = (event: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
  };
  
  // Handle layer visibility toggle
  const toggleLayerVisibility = (layerId: string) => {
    if (!map) return;
    
    const updatedMap = {
      ...map,
      layers: map.layers.map(layer => {
        if (layer.id === layerId) {
          return {
            ...layer,
            visible: !layer.visible
          };
        }
        return layer;
      })
    };
    
    setMap(updatedMap);
  };
  
  // Handle layer selection
  const handleLayerSelect = (layerId: string) => {
    setSelectedLayer(layerId);
  };
  
  // Handle location selection
  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
    setSelectedRoute(null);
  };
  
  // Handle route selection
  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
    setSelectedLocation(null);
  };
  
  // Create a new location
  const createLocation = async () => {
    if (!map) return;
    
    try {
      const location = await worldMapService.addLocation(
        map.id,
        newLocation.name,
        newLocation.type,
        newLocation.position,
        newLocation.description
      );
      
      if (location) {
        // Reload map to get updated data
        loadMap();
        setNewLocationDialog(false);
        
        // Reset form
        setNewLocation({
          name: '',
          type: LocationType.CITY,
          position: { x: 0, y: 0 },
          description: ''
        });
      }
    } catch (err) {
      console.error('Error creating location:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  
  // Create a new route
  const createRoute = async () => {
    if (!map) return;
    
    try {
      const route = await worldMapService.addRoute(
        map.id,
        newRoute.name,
        newRoute.type,
        newRoute.points,
        newRoute.description
      );
      
      if (route) {
        // Reload map to get updated data
        loadMap();
        setNewRouteDialog(false);
        
        // Reset form
        setNewRoute({
          name: '',
          type: RouteType.ROAD,
          points: [],
          description: ''
        });
      }
    } catch (err) {
      console.error('Error creating route:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  
  // Save map settings
  const saveMapSettings = async () => {
    if (!map) return;
    
    try {
      const updatedMap = {
        ...map,
        name: mapSettings.name,
        width: mapSettings.width,
        height: mapSettings.height,
        description: mapSettings.description,
        settings: {
          ...map.settings,
          gridEnabled: mapSettings.gridEnabled,
          fogOfWarEnabled: mapSettings.fogOfWarEnabled
        }
      };
      
      const success = await worldMapService.updateMap(updatedMap);
      
      if (success) {
        // Reload map to get updated data
        loadMap();
        setMapSettingsDialog(false);
      }
    } catch (err) {
      console.error('Error saving map settings:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  
  // Create a new map
  const createNewMap = async () => {
    try {
      const newMap = await worldMapService.createMap(
        mapSettings.name,
        mapSettings.width,
        mapSettings.height,
        mapSettings.description
      );
      
      if (newMap) {
        // Set the new map
        setMap(newMap);
        setMapId(newMap.id);
        
        // Set initial selected layer
        if (newMap.layers.length > 0) {
          setSelectedLayer(newMap.layers[0].id);
        }
        
        setMapSettingsDialog(false);
        
        // Notify parent component
        if (onMapSaved) {
          onMapSaved(newMap.id);
        }
      }
    } catch (err) {
      console.error('Error creating map:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={loadMap} 
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  // Render create new map prompt if no map is loaded
  if (!map && !mapId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>No Map Selected</Typography>
        <Typography variant="body1" paragraph>
          Create a new map or select an existing one to edit.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setMapSettingsDialog(true)}
        >
          Create New Map
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: 250,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" noWrap component="div">
            Map Editor
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {map?.name}
          </Typography>
        </Box>
        
        <Divider />
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Layers" />
          <Tab label="Objects" />
          <Tab label="Tools" />
        </Tabs>
        
        {/* Layers Tab */}
        {activeTab === 0 && map && (
          <List>
            {map.layers.map(layer => (
              <ListItem
                key={layer.id}
                button
                selected={selectedLayer === layer.id}
                onClick={() => handleLayerSelect(layer.id)}
              >
                <ListItemIcon>
                  {layer.type === MapLayerType.BASE && <MapIcon />}
                  {layer.type === MapLayerType.TERRAIN && <TerrainIcon />}
                  {layer.type === MapLayerType.POINTS_OF_INTEREST && <LocationIcon />}
                  {layer.type === MapLayerType.ROUTES && <RouteIcon />}
                  {layer.type === MapLayerType.GRID && <GridIcon />}
                  {layer.type === MapLayerType.FOG_OF_WAR && <VisibilityOffIcon />}
                </ListItemIcon>
                <ListItemText primary={layer.name} />
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  size="small"
                >
                  {layer.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
        
        {/* Objects Tab */}
        {activeTab === 1 && map && (
          <>
            <Typography variant="subtitle2" sx={{ p: 2, pb: 0 }}>
              Locations
            </Typography>
            <List dense>
              {map.layers
                .find(layer => layer.type === MapLayerType.POINTS_OF_INTEREST)
                ?.data.locations.map((location: MapLocation) => (
                  <ListItem
                    key={location.id}
                    button
                    selected={selectedLocation === location.id}
                    onClick={() => handleLocationSelect(location.id)}
                  >
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={location.name} 
                      secondary={location.type}
                    />
                  </ListItem>
                ))}
            </List>
            
            <Divider />
            
            <Typography variant="subtitle2" sx={{ p: 2, pb: 0 }}>
              Routes
            </Typography>
            <List dense>
              {map.layers
                .find(layer => layer.type === MapLayerType.ROUTES)
                ?.data.routes.map((route: MapRoute) => (
                  <ListItem
                    key={route.id}
                    button
                    selected={selectedRoute === route.id}
                    onClick={() => handleRouteSelect(route.id)}
                  >
                    <ListItemIcon>
                      <RouteIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={route.name} 
                      secondary={route.type}
                    />
                  </ListItem>
                ))}
            </List>
          </>
        )}
        
        {/* Tools Tab */}
        {activeTab === 2 && (
          <List>
            <ListItem>
              <Typography variant="subtitle2">Map Settings</Typography>
            </ListItem>
            <ListItem button onClick={() => setMapSettingsDialog(true)}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Edit Map Properties" />
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <Typography variant="subtitle2">Add Objects</Typography>
            </ListItem>
            <ListItem button onClick={() => setNewLocationDialog(true)}>
              <ListItemIcon>
                <LocationIcon />
              </ListItemIcon>
              <ListItemText primary="Add Location" />
            </ListItem>
            <ListItem button onClick={() => setNewRouteDialog(true)}>
              <ListItemIcon>
                <RouteIcon />
              </ListItemIcon>
              <ListItemText primary="Add Route" />
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <Typography variant="subtitle2">View Controls</Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body2">Zoom</Typography>
              <Slider
                value={zoom}
                min={0.5}
                max={2}
                step={0.1}
                onChange={handleZoomChange}
                valueLabelDisplay="auto"
                sx={{ ml: 2 }}
              />
            </ListItem>
          </List>
        )}
      </Drawer>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: 0,
          ...(drawerOpen && {
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: '250px',
          }),
        }}
      >
        {/* Map canvas */}
        <Paper
          sx={{
            width: '100%',
            height: 'calc(100vh - 100px)',
            overflow: 'auto',
            position: 'relative',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          />
        </Paper>
      </Box>
      
      {/* New Location Dialog */}
      <Dialog
        open={newLocationDialog}
        onClose={() => setNewLocationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Location</DialogTitle>
        <DialogContent>
          <TextField
            label="Location Name"
            value={newLocation.name}
            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Location Type</InputLabel>
            <Select
              value={newLocation.type}
              onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value as LocationType })}
              label="Location Type"
            >
              <MenuItem value={LocationType.CITY}>City</MenuItem>
              <MenuItem value={LocationType.TOWN}>Town</MenuItem>
              <MenuItem value={LocationType.VILLAGE}>Village</MenuItem>
              <MenuItem value={LocationType.DUNGEON}>Dungeon</MenuItem>
              <MenuItem value={LocationType.LANDMARK}>Landmark</MenuItem>
              <MenuItem value={LocationType.CUSTOM}>Point of Interest</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="X Position"
              type="number"
              value={newLocation.position.x}
              onChange={(e) => setNewLocation({
                ...newLocation,
                position: {
                  ...newLocation.position,
                  x: parseInt(e.target.value)
                }
              })}
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Y Position"
              type="number"
              value={newLocation.position.y}
              onChange={(e) => setNewLocation({
                ...newLocation,
                position: {
                  ...newLocation.position,
                  y: parseInt(e.target.value)
                }
              })}
              fullWidth
              margin="normal"
            />
          </Box>
          
          <TextField
            label="Description"
            value={newLocation.description}
            onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewLocationDialog(false)}>Cancel</Button>
          <Button
            onClick={createLocation}
            variant="contained"
            color="primary"
            disabled={!newLocation.name.trim()}
          >
            Add Location
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Route Dialog */}
      <Dialog
        open={newRouteDialog}
        onClose={() => setNewRouteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Route</DialogTitle>
        <DialogContent>
          <TextField
            label="Route Name"
            value={newRoute.name}
            onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Route Type</InputLabel>
            <Select
              value={newRoute.type}
              onChange={(e) => setNewRoute({ ...newRoute, type: e.target.value as RouteType })}
              label="Route Type"
            >
              <MenuItem value={RouteType.ROAD}>Road</MenuItem>
              <MenuItem value={RouteType.RIVER}>River</MenuItem>
              <MenuItem value={RouteType.TRAIL}>Trail</MenuItem>
              <MenuItem value={RouteType.BORDER}>Border</MenuItem>
              <MenuItem value={RouteType.TRADE_ROUTE}>Trade Route</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Route Points
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            In a full implementation, you would add points by clicking on the map.
            For this demo, you can add points manually.
          </Alert>
          
          {newRoute.points.map((point, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <TextField
                label={`Point ${index + 1} X`}
                type="number"
                value={point.x}
                onChange={(e) => {
                  const updatedPoints = [...newRoute.points];
                  updatedPoints[index] = {
                    ...updatedPoints[index],
                    x: parseInt(e.target.value)
                  };
                  setNewRoute({ ...newRoute, points: updatedPoints });
                }}
                fullWidth
              />
              
              <TextField
                label={`Point ${index + 1} Y`}
                type="number"
                value={point.y}
                onChange={(e) => {
                  const updatedPoints = [...newRoute.points];
                  updatedPoints[index] = {
                    ...updatedPoints[index],
                    y: parseInt(e.target.value)
                  };
                  setNewRoute({ ...newRoute, points: updatedPoints });
                }}
                fullWidth
              />
              
              <IconButton
                onClick={() => {
                  const updatedPoints = [...newRoute.points];
                  updatedPoints.splice(index, 1);
                  setNewRoute({ ...newRoute, points: updatedPoints });
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              setNewRoute({
                ...newRoute,
                points: [...newRoute.points, { x: 0, y: 0 }]
              });
            }}
            sx={{ mt: 1 }}
          >
            Add Point
          </Button>
          
          <TextField
            label="Description"
            value={newRoute.description}
            onChange={(e) => setNewRoute({ ...newRoute, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewRouteDialog(false)}>Cancel</Button>
          <Button
            onClick={createRoute}
            variant="contained"
            color="primary"
            disabled={!newRoute.name.trim() || newRoute.points.length < 2}
          >
            Add Route
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Map Settings Dialog */}
      <Dialog
        open={mapSettingsDialog}
        onClose={() => setMapSettingsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{map ? 'Edit Map Settings' : 'Create New Map'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Map Name"
            value={mapSettings.name}
            onChange={(e) => setMapSettings({ ...mapSettings, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Width"
              type="number"
              value={mapSettings.width}
              onChange={(e) => setMapSettings({ ...mapSettings, width: parseInt(e.target.value) })}
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Height"
              type="number"
              value={mapSettings.height}
              onChange={(e) => setMapSettings({ ...mapSettings, height: parseInt(e.target.value) })}
              fullWidth
              margin="normal"
            />
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={mapSettings.gridEnabled}
                onChange={(e) => setMapSettings({ ...mapSettings, gridEnabled: e.target.checked })}
              />
            }
            label="Enable Grid"
            sx={{ mt: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={mapSettings.fogOfWarEnabled}
                onChange={(e) => setMapSettings({ ...mapSettings, fogOfWarEnabled: e.target.checked })}
              />
            }
            label="Enable Fog of War"
          />
          
          <TextField
            label="Description"
            value={mapSettings.description}
            onChange={(e) => setMapSettings({ ...mapSettings, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapSettingsDialog(false)}>Cancel</Button>
          <Button
            onClick={map ? saveMapSettings : createNewMap}
            variant="contained"
            color="primary"
            disabled={!mapSettings.name.trim()}
          >
            {map ? 'Save Settings' : 'Create Map'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MapEditor;