/**
 * worldmap.ts
 * Types for world map integration and location tracking
 */

// Map layer types
export enum MapLayerType {
  BASE = 'base',
  TERRAIN = 'terrain',
  POLITICAL = 'political',
  POINTS_OF_INTEREST = 'points_of_interest',
  ROUTES = 'routes',
  NOTES = 'notes',
  GRID = 'grid',
  FOG_OF_WAR = 'fog_of_war',
  CUSTOM = 'custom',
}

// Location types
export enum LocationType {
  CITY = 'city',
  TOWN = 'town',
  VILLAGE = 'village',
  DUNGEON = 'dungeon',
  LANDMARK = 'landmark',
  WILDERNESS = 'wilderness',
  BUILDING = 'building',
  SHOP = 'shop',
  TAVERN = 'tavern',
  TEMPLE = 'temple',
  CASTLE = 'castle',
  RUINS = 'ruins',
  CAVE = 'cave',
  CAMP = 'camp',
  PORTAL = 'portal',
  CUSTOM = 'custom',
}

// Route types
export enum RouteType {
  ROAD = 'road',
  PATH = 'path',
  RIVER = 'river',
  COAST = 'coast',
  MOUNTAIN_PASS = 'mountain_pass',
  TUNNEL = 'tunnel',
  BRIDGE = 'bridge',
  PORTAL = 'portal',
  TRAIL = 'trail',
  BORDER = 'border',
  TRADE_ROUTE = 'trade_route',
  CUSTOM = 'custom',
}

// Terrain types
export enum TerrainType {
  PLAINS = 'plains',
  FOREST = 'forest',
  MOUNTAINS = 'mountains',
  HILLS = 'hills',
  DESERT = 'desert',
  SWAMP = 'swamp',
  JUNGLE = 'jungle',
  TUNDRA = 'tundra',
  WATER = 'water',
  OCEAN = 'ocean',
  BEACH = 'beach',
  GRASSLAND = 'grassland',
  WASTELAND = 'wasteland',
  URBAN = 'urban',
  CUSTOM = 'custom',
}

// Map coordinate
export interface MapCoordinate {
  x: number;
  y: number;
}

// Map bounds
export interface MapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// Map layer
export interface MapLayer {
  id: string;
  name: string;
  type: MapLayerType;
  visible: boolean;
  opacity: number;
  order: number;
  data: any; // Layer-specific data
}

// Base map layer
export interface BaseMapLayer extends MapLayer {
  type: MapLayerType.BASE;
  data: {
    imageUrl: string;
    width: number;
    height: number;
    scale: number;
  };
}

// Terrain map layer
export interface TerrainMapLayer extends MapLayer {
  type: MapLayerType.TERRAIN;
  data: {
    terrains: {
      id: string;
      type: TerrainType;
      name: string;
      color: string;
      points: MapCoordinate[];
      description?: string;
    }[];
  };
}

// Political map layer
export interface PoliticalMapLayer extends MapLayer {
  type: MapLayerType.POLITICAL;
  data: {
    regions: {
      id: string;
      name: string;
      color: string;
      points: MapCoordinate[];
      description?: string;
      ruler?: string;
      population?: number;
      capital?: string;
    }[];
  };
}

// Points of interest map layer
export interface PointsOfInterestMapLayer extends MapLayer {
  type: MapLayerType.POINTS_OF_INTEREST;
  data: {
    locations: MapLocation[];
  };
}

// Routes map layer
export interface RoutesMapLayer extends MapLayer {
  type: MapLayerType.ROUTES;
  data: {
    routes: MapRoute[];
  };
}

// Notes map layer
export interface NotesMapLayer extends MapLayer {
  type: MapLayerType.NOTES;
  data: {
    notes: {
      id: string;
      text: string;
      position: MapCoordinate;
      color?: string;
      icon?: string;
    }[];
  };
}

// Grid map layer
export interface GridMapLayer extends MapLayer {
  type: MapLayerType.GRID;
  data: {
    cellSize: number;
    color: string;
    opacity: number;
    showCoordinates: boolean;
    offset: {
      x: number;
      y: number;
    };
  };
}

// Fog of war map layer
export interface FogOfWarMapLayer extends MapLayer {
  type: MapLayerType.FOG_OF_WAR;
  data: {
    revealedAreas: {
      id: string;
      points: MapCoordinate[];
    }[];
    exploredAreas: {
      id: string;
      points: MapCoordinate[];
    }[];
  };
}

// Custom map layer
export interface CustomMapLayer extends MapLayer {
  type: MapLayerType.CUSTOM;
  data: any;
}

// Map location
export interface MapLocation {
  id: string;
  name: string;
  type: LocationType;
  position: MapCoordinate;
  description?: string;
  icon?: string;
  color?: string;
  size?: number;
  discovered?: boolean;
  visited?: boolean;
  notes?: string;
  tags?: string[];
  connections?: string[]; // IDs of connected locations
  questIds?: string[]; // IDs of associated quests
  npcIds?: string[]; // IDs of associated NPCs
  imageUrl?: string;
  details?: {
    population?: number;
    government?: string;
    economy?: string;
    religion?: string;
    threats?: string;
    secrets?: string;
    shops?: {
      id: string;
      name: string;
      type: string;
      description?: string;
      inventory?: string[];
    }[];
    buildings?: {
      id: string;
      name: string;
      type: string;
      description?: string;
    }[];
    [key: string]: any;
  };
}

// Map route
export interface MapRoute {
  id: string;
  name: string;
  type: RouteType;
  points: MapCoordinate[];
  description?: string;
  width?: number;
  color?: string;
  dashed?: boolean;
  discovered?: boolean;
  travelTime?: {
    walking: number; // In hours
    riding: number; // In hours
    sailing?: number; // In hours
    flying?: number; // In hours
  };
  difficulty?: number; // 1-10 scale
  dangers?: string[];
  notes?: string;
  tags?: string[];
}

// World map
export interface WorldMap {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  scale: {
    value: number;
    unit: string; // e.g., "miles", "kilometers", "days"
  };
  layers: MapLayer[];
  defaultView: {
    center: MapCoordinate;
    zoom: number;
  };
  settings: {
    gridEnabled: boolean;
    fogOfWarEnabled: boolean;
    defaultLayer: string; // ID of default visible layer
  };
  metadata: {
    createdAt: number;
    updatedAt: number;
    author?: string;
    version?: string;
    tags?: string[];
  };
}

// Character position on map
export interface CharacterMapPosition {
  characterId: string;
  mapId: string;
  position: MapCoordinate;
  facing?: number; // Angle in degrees
  timestamp: number;
  locationId?: string; // ID of current location if at one
}

// Travel log entry
export interface TravelLogEntry {
  id: string;
  characterId: string;
  mapId: string;
  startPosition: MapCoordinate;
  endPosition: MapCoordinate;
  startLocationId?: string;
  endLocationId?: string;
  routeId?: string;
  startTime: number;
  endTime: number;
  distance: number;
  notes?: string;
}

// Distance calculation options
export interface DistanceCalculationOptions {
  terrainFactors?: Partial<Record<TerrainType, number>>;
  routeFactors?: Partial<Record<RouteType, number>>;
  avoidTerrains?: TerrainType[];
  preferredRoutes?: RouteType[];
  includeElevation?: boolean;
}

// Travel time estimation options
export interface TravelTimeEstimationOptions extends DistanceCalculationOptions {
  speed: number; // Base speed in distance units per hour
  restHoursPerDay?: number; // Hours of rest per day
  travelHoursPerDay?: number; // Hours of travel per day
  weatherFactor?: number; // Multiplier for weather conditions (1.0 = normal)
  encumbranceFactor?: number; // Multiplier for encumbrance (1.0 = normal)
}

// Map view state
export interface MapViewState {
  center: MapCoordinate;
  zoom: number;
  rotation: number;
  visibleLayers: string[]; // IDs of visible layers
  selectedLocationId?: string;
  selectedRouteId?: string;
  mode: 'view' | 'edit' | 'measure' | 'reveal' | 'annotate';
}

// Map editor state
export interface MapEditorState {
  selectedTool: 'select' | 'pan' | 'draw' | 'erase' | 'measure' | 'text' | 'location' | 'route';
  selectedLayerId: string;
  selectedColor: string;
  brushSize: number;
  selectedItems: {
    locations: string[]; // IDs of selected locations
    routes: string[]; // IDs of selected routes
    notes: string[]; // IDs of selected notes
    terrains: string[]; // IDs of selected terrains
    regions: string[]; // IDs of selected regions
  };
  clipboard: any;
  history: {
    undoStack: any[];
    redoStack: any[];
  };
}