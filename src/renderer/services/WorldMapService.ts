/**
 * WorldMapService.ts
 * Service for managing world maps, locations, and travel
 * 
 * NOTE: This service currently uses localStorage for data persistence
 * as a temporary solution until the proper database API is implemented.
 * According to the roadmap, the WorldMapService is approximately 70% complete.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  WorldMap,
  MapLayer,
  MapLayerType,
  MapLocation,
  MapRoute,
  MapCoordinate,
  LocationType,
  RouteType,
  TerrainType,
  CharacterMapPosition,
  TravelLogEntry,
  DistanceCalculationOptions,
  TravelTimeEstimationOptions,
  MapBounds
} from '../../shared/types/worldmap';

// Event types for map changes
export interface MapEvent {
  type: 'map_created' | 'map_updated' | 'map_deleted' | 'location_created' | 'location_updated' | 
        'location_deleted' | 'route_created' | 'route_updated' | 'route_deleted' | 'character_moved' |
        'layer_created' | 'layer_updated' | 'layer_deleted' | 'fog_revealed';
  mapId: string;
  data: any;
  timestamp: number;
}

export class WorldMapService {
  private static instance: WorldMapService;
  private maps: Record<string, WorldMap> = {};
  private characterPositions: Record<string, CharacterMapPosition> = {};
  private travelLogs: Record<string, TravelLogEntry[]> = {};
  private eventListeners: ((event: MapEvent) => void)[] = [];

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): WorldMapService {
    if (!WorldMapService.instance) {
      WorldMapService.instance = new WorldMapService();
    }
    return WorldMapService.instance;
  }

  /**
   * Load maps from database
   */
  public async loadMaps(): Promise<void> {
    try {
      // In a real implementation, this would load from the database
      console.log('Loading world maps...');
      
      // Temporary implementation using localStorage until API is available
      const storedMaps = localStorage.getItem('worldMaps');
      
      if (storedMaps) {
        const parsedMaps = JSON.parse(storedMaps);
        this.maps = {} as Record<string, WorldMap>;
        
        for (const map of Object.values(parsedMaps) as WorldMap[]) {
          this.maps[map.id] = map;
        }
        
        console.log(`Loaded ${Object.keys(this.maps).length} world maps from localStorage`);
      } else {
        console.log('No world maps found in localStorage');
        this.maps = {} as Record<string, WorldMap>;
      }
    } catch (error) {
      console.error('Error loading world maps:', error);
    }
  }

  /**
   * Get all maps
   */
  public async getAllMaps(): Promise<WorldMap[]> {
    if (Object.keys(this.maps).length === 0) {
      await this.loadMaps();
    }
    
    return Object.values(this.maps);
  }

  /**
   * Get a map by ID
   */
  public async getMap(mapId: string): Promise<WorldMap | null> {
    if (this.maps[mapId]) {
      return this.maps[mapId];
    }
    
    try {
      // Temporary implementation using localStorage until API is available
      const storedMaps = localStorage.getItem('worldMaps');
      
      if (storedMaps) {
        const parsedMaps = JSON.parse(storedMaps);
        
        if (parsedMaps[mapId]) {
          this.maps[mapId] = parsedMaps[mapId];
          return parsedMaps[mapId];
        }
      }
    } catch (error) {
      console.error(`Error loading world map ${mapId}:`, error);
    }
    
    return null;
  }

  /**
   * Create a new map
   */
  public async createMap(
    name: string,
    width: number,
    height: number,
    description?: string
  ): Promise<WorldMap> {
    // Create base layers
    const baseLayer: MapLayer = {
      id: uuidv4(),
      name: 'Base',
      type: MapLayerType.BASE,
      visible: true,
      opacity: 1,
      order: 0,
      data: {
        imageUrl: '',
        width,
        height,
        scale: 1
      }
    };
    
    const terrainLayer: MapLayer = {
      id: uuidv4(),
      name: 'Terrain',
      type: MapLayerType.TERRAIN,
      visible: true,
      opacity: 0.8,
      order: 1,
      data: {
        terrains: []
      }
    };
    
    const politicalLayer: MapLayer = {
      id: uuidv4(),
      name: 'Regions',
      type: MapLayerType.POLITICAL,
      visible: true,
      opacity: 0.6,
      order: 2,
      data: {
        regions: []
      }
    };
    
    const poiLayer: MapLayer = {
      id: uuidv4(),
      name: 'Locations',
      type: MapLayerType.POINTS_OF_INTEREST,
      visible: true,
      opacity: 1,
      order: 3,
      data: {
        locations: []
      }
    };
    
    const routesLayer: MapLayer = {
      id: uuidv4(),
      name: 'Routes',
      type: MapLayerType.ROUTES,
      visible: true,
      opacity: 1,
      order: 4,
      data: {
        routes: []
      }
    };
    
    const notesLayer: MapLayer = {
      id: uuidv4(),
      name: 'Notes',
      type: MapLayerType.NOTES,
      visible: true,
      opacity: 1,
      order: 5,
      data: {
        notes: []
      }
    };
    
    const gridLayer: MapLayer = {
      id: uuidv4(),
      name: 'Grid',
      type: MapLayerType.GRID,
      visible: false,
      opacity: 0.5,
      order: 6,
      data: {
        cellSize: 50,
        color: '#000000',
        opacity: 0.5,
        showCoordinates: true,
        offset: {
          x: 0,
          y: 0
        }
      }
    };
    
    const fogOfWarLayer: MapLayer = {
      id: uuidv4(),
      name: 'Fog of War',
      type: MapLayerType.FOG_OF_WAR,
      visible: false,
      opacity: 0.7,
      order: 7,
      data: {
        revealedAreas: [],
        exploredAreas: []
      }
    };
    
    // Create the map
    const newMap: WorldMap = {
      id: uuidv4(),
      name,
      description,
      width,
      height,
      scale: {
        value: 1,
        unit: 'miles'
      },
      layers: [
        baseLayer,
        terrainLayer,
        politicalLayer,
        poiLayer,
        routesLayer,
        notesLayer,
        gridLayer,
        fogOfWarLayer
      ],
      defaultView: {
        center: {
          x: width / 2,
          y: height / 2
        },
        zoom: 1
      },
      settings: {
        gridEnabled: false,
        fogOfWarEnabled: false,
        defaultLayer: poiLayer.id
      },
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: []
      }
    };
    
    // Temporary implementation using localStorage until API is available
    try {
      // Get existing maps
      const storedMaps = localStorage.getItem('worldMaps');
      const parsedMaps = storedMaps ? JSON.parse(storedMaps) : {};
      
      // Add new map
      parsedMaps[newMap.id] = newMap;
      
      // Save back to localStorage
      localStorage.setItem('worldMaps', JSON.stringify(parsedMaps));
      console.log('Saved world map to localStorage');
    } catch (error) {
      console.error('Error saving world map:', error);
    }
    
    // Add to cache
    this.maps[newMap.id] = newMap;
    
    // Emit event
    this.emitEvent({
      type: 'map_created',
      mapId: newMap.id,
      data: newMap,
      timestamp: Date.now()
    });
    
    return newMap;
  }

  /**
   * Update a map
   */
  public async updateMap(map: WorldMap): Promise<boolean> {
    // Update timestamp
    map.metadata.updatedAt = Date.now();
    
    // Temporary implementation using localStorage until API is available
    try {
      // Get existing maps
      const storedMaps = localStorage.getItem('worldMaps');
      const parsedMaps = storedMaps ? JSON.parse(storedMaps) : {};
      
      // Update map
      parsedMaps[map.id] = map;
      
      // Save back to localStorage
      localStorage.setItem('worldMaps', JSON.stringify(parsedMaps));
      console.log('Updated world map in localStorage');
    } catch (error) {
      console.error('Error saving world map:', error);
      return false;
    }
    
    // Update cache
    this.maps[map.id] = map;
    
    // Emit event
    this.emitEvent({
      type: 'map_updated',
      mapId: map.id,
      data: map,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Delete a map
   */
  public async deleteMap(mapId: string): Promise<boolean> {
    // Temporary implementation using localStorage until API is available
    try {
      // Get existing maps
      const storedMaps = localStorage.getItem('worldMaps');
      
      if (storedMaps) {
        const parsedMaps = JSON.parse(storedMaps);
        
        // Delete map
        if (parsedMaps[mapId]) {
          delete parsedMaps[mapId];
          
          // Save back to localStorage
          localStorage.setItem('worldMaps', JSON.stringify(parsedMaps));
          console.log('Deleted world map from localStorage');
        }
      }
    } catch (error) {
      console.error('Error deleting world map:', error);
      return false;
    }
    
    // Remove from cache
    delete this.maps[mapId];
    
    // Emit event
    this.emitEvent({
      type: 'map_deleted',
      mapId,
      data: { id: mapId },
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Get all locations on a map
   */
  public async getLocations(mapId: string): Promise<MapLocation[]> {
    const map = await this.getMap(mapId);
    
    if (!map) {
      return [];
    }
    
    // Find the points of interest layer
    const poiLayer = map.layers.find(layer => layer.type === MapLayerType.POINTS_OF_INTEREST);
    
    if (!poiLayer) {
      return [];
    }
    
    return poiLayer.data.locations || [];
  }

  /**
   * Get a location by ID
   */
  public async getLocation(mapId: string, locationId: string): Promise<MapLocation | null> {
    const locations = await this.getLocations(mapId);
    return locations.find(location => location.id === locationId) || null;
  }

  /**
   * Add a location to a map
   */
  public async addLocation(
    mapId: string,
    name: string,
    type: LocationType,
    position: MapCoordinate,
    description?: string
  ): Promise<MapLocation | null> {
    const map = await this.getMap(mapId);
    
    if (!map) {
      return null;
    }
    
    // Find the points of interest layer
    const poiLayer = map.layers.find(layer => layer.type === MapLayerType.POINTS_OF_INTEREST);
    
    if (!poiLayer) {
      return null;
    }
    
    // Create the location
    const newLocation: MapLocation = {
      id: uuidv4(),
      name,
      type,
      position,
      description,
      discovered: false,
      visited: false,
      tags: []
    };
    
    // Add to layer
    if (!poiLayer.data.locations) {
      poiLayer.data.locations = [];
    }
    
    poiLayer.data.locations.push(newLocation);
    
    // Save the map
    await this.updateMap(map);
    
    // Emit event
    this.emitEvent({
      type: 'location_created',
      mapId,
      data: newLocation,
      timestamp: Date.now()
    });
    
    return newLocation;
  }

  /**
   * Update a location
   */
  public async updateLocation(
    mapId: string,
    location: MapLocation
  ): Promise<boolean> {
    const map = await this.getMap(mapId);
    
    if (!map) {
      return false;
    }
    
    // Find the points of interest layer
    const poiLayer = map.layers.find(layer => layer.type === MapLayerType.POINTS_OF_INTEREST);
    
    if (!poiLayer || !poiLayer.data.locations) {
      return false;
    }
    
    // Find the location index
    const index = poiLayer.data.locations.findIndex(loc => loc.id === location.id);
    
    if (index === -1) {
      return false;
    }
    
    // Update the location
    poiLayer.data.locations[index] = location;
    
    // Save the map
    await this.updateMap(map);
    
    // Emit event
    this.emitEvent({
      type: 'location_updated',
      mapId,
      data: location,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Delete a location
   */
  public async deleteLocation(
    mapId: string,
    locationId: string
  ): Promise<boolean> {
    const map = await this.getMap(mapId);
    
    if (!map) {
      return false;
    }
    
    // Find the points of interest layer
    const poiLayer = map.layers.find(layer => layer.type === MapLayerType.POINTS_OF_INTEREST);
    
    if (!poiLayer || !poiLayer.data.locations) {
      return false;
    }
    
    // Find the location
    const location = poiLayer.data.locations.find(loc => loc.id === locationId);
    
    if (!location) {
      return false;
    }
    
    // Remove the location
    poiLayer.data.locations = poiLayer.data.locations.filter(loc => loc.id !== locationId);
    
    // Save the map
    await this.updateMap(map);
    
    // Emit event
    this.emitEvent({
      type: 'location_deleted',
      mapId,
      data: { id: locationId },
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Get all routes on a map
   */
  public async getRoutes(mapId: string): Promise<MapRoute[]> {
    const map = await this.getMap(mapId);
    
    if (!map) {
      return [];
    }
    
    // Find the routes layer
    const routesLayer = map.layers.find(layer => layer.type === MapLayerType.ROUTES);
    
    if (!routesLayer) {
      return [];
    }
    
    return routesLayer.data.routes || [];
  }

  /**
   * Get a route by ID
   */
  public async getRoute(mapId: string, routeId: string): Promise<MapRoute | null> {
    const routes = await this.getRoutes(mapId);
    return routes.find(route => route.id === routeId) || null;
  }

  /**
   * Add a route to a map
   */
  public async addRoute(
    mapId: string,
    name: string,
    type: RouteType,
    points: MapCoordinate[],
    description?: string
  ): Promise<MapRoute | null> {
    const map = await this.getMap(mapId);
    
    if (!map) {
      return null;
    }
    
    // Find the routes layer
    const routesLayer = map.layers.find(layer => layer.type === MapLayerType.ROUTES);
    
    if (!routesLayer) {
      return null;
    }
    
    // Create the route
    const newRoute: MapRoute = {
      id: uuidv4(),
      name,
      type,
      points,
      description,
      discovered: false,
      travelTime: {
        walking: this.calculateTravelTime(points, 3), // 3 miles per hour walking
        riding: this.calculateTravelTime(points, 8) // 8 miles per hour riding
      },
      tags: []
    };
    
    // Add to layer
    if (!routesLayer.data.routes) {
      routesLayer.data.routes = [];
    }
    
    routesLayer.data.routes.push(newRoute);
    
    // Save the map
    await this.updateMap(map);
    
    // Emit event
    this.emitEvent({
      type: 'route_created',
      mapId,
      data: newRoute,
      timestamp: Date.now()
    });
    
    return newRoute;
  }

  /**
   * Update a route
   */
  public async updateRoute(
    mapId: string,
    route: MapRoute
  ): Promise<boolean> {
    const map = await this.getMap(mapId);
    
    if (!map) {
      return false;
    }
    
    // Find the routes layer
    const routesLayer = map.layers.find(layer => layer.type === MapLayerType.ROUTES);
    
    if (!routesLayer || !routesLayer.data.routes) {
      return false;
    }
    
    // Find the route index
    const index = routesLayer.data.routes.findIndex(r => r.id === route.id);
    
    if (index === -1) {
      return false;
    }
    
    // Update the route
    routesLayer.data.routes[index] = route;
    
    // Save the map
    await this.updateMap(map);
    
    // Emit event
    this.emitEvent({
      type: 'route_updated',
      mapId,
      data: route,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Delete a route
   */
  public async deleteRoute(
    mapId: string,
    routeId: string
  ): Promise<boolean> {
    const map = await this.getMap(mapId);
    
    if (!map) {
      return false;
    }
    
    // Find the routes layer
    const routesLayer = map.layers.find(layer => layer.type === MapLayerType.ROUTES);
    
    if (!routesLayer || !routesLayer.data.routes) {
      return false;
    }
    
    // Find the route
    const route = routesLayer.data.routes.find(r => r.id === routeId);
    
    if (!route) {
      return false;
    }
    
    // Remove the route
    routesLayer.data.routes = routesLayer.data.routes.filter(r => r.id !== routeId);
    
    // Save the map
    await this.updateMap(map);
    
    // Emit event
    this.emitEvent({
      type: 'route_deleted',
      mapId,
      data: { id: routeId },
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Get a character's position on a map
   */
  public async getCharacterPosition(
    characterId: string,
    mapId: string
  ): Promise<CharacterMapPosition | null> {
    const key = `${characterId}_${mapId}`;
    
    if (this.characterPositions[key]) {
      return this.characterPositions[key];
    }
    
    try {
      // Temporary implementation using localStorage until database API is available
      const storedPositions = localStorage.getItem('characterMapPositions');
      
      if (storedPositions) {
        const parsedPositions = JSON.parse(storedPositions);
        
        if (parsedPositions[key]) {
          this.characterPositions[key] = parsedPositions[key];
          return parsedPositions[key];
        }
      }
    } catch (error) {
      console.error(`Error loading character position for ${characterId} on map ${mapId}:`, error);
    }
    
    return null;
  }

  /**
   * Set a character's position on a map
   */
  public async setCharacterPosition(
    characterId: string,
    mapId: string,
    position: MapCoordinate,
    locationId?: string
  ): Promise<boolean> {
    const key = `${characterId}_${mapId}`;
    
    // Get current position
    const currentPosition = await this.getCharacterPosition(characterId, mapId);
    
    // Create new position
    const newPosition: CharacterMapPosition = {
      characterId,
      mapId,
      position,
      timestamp: Date.now(),
      locationId
    };
    
    // If there was a previous position, create a travel log entry
    if (currentPosition) {
      const travelEntry: TravelLogEntry = {
        id: uuidv4(),
        characterId,
        mapId,
        startPosition: currentPosition.position,
        endPosition: position,
        startLocationId: currentPosition.locationId,
        endLocationId: locationId,
        startTime: currentPosition.timestamp,
        endTime: newPosition.timestamp,
        distance: this.calculateDistance(currentPosition.position, position)
      };
      
      // Add to travel log
      if (!this.travelLogs[characterId]) {
        this.travelLogs[characterId] = [];
      }
      
      this.travelLogs[characterId].unshift(travelEntry);
      
      // Save travel log - temporary implementation using localStorage
      try {
        const storedLogs = localStorage.getItem('characterTravelLogs');
        const parsedLogs = storedLogs ? JSON.parse(storedLogs) : {};
        
        if (!parsedLogs[characterId]) {
          parsedLogs[characterId] = [];
        }
        
        parsedLogs[characterId].unshift(travelEntry);
        localStorage.setItem('characterTravelLogs', JSON.stringify(parsedLogs));
      } catch (error) {
        console.error('Error saving travel log entry:', error);
      }
    }
    
    // Save position - temporary implementation using localStorage
    try {
      const storedPositions = localStorage.getItem('characterMapPositions');
      const parsedPositions = storedPositions ? JSON.parse(storedPositions) : {};
      
      // Save the position using the key format: characterId_mapId
      parsedPositions[key] = newPosition;
      localStorage.setItem('characterMapPositions', JSON.stringify(parsedPositions));
    } catch (error) {
      console.error('Error saving character position:', error);
      return false;
    }
    
    // Update cache
    this.characterPositions[key] = newPosition;
    
    // Emit event
    this.emitEvent({
      type: 'character_moved',
      mapId,
      data: newPosition,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Get a character's travel log
   */
  public async getCharacterTravelLog(
    characterId: string,
    mapId?: string
  ): Promise<TravelLogEntry[]> {
    if (this.travelLogs[characterId]) {
      if (mapId) {
        return this.travelLogs[characterId].filter(entry => entry.mapId === mapId);
      }
      return this.travelLogs[characterId];
    }
    
    try {
      // Temporary implementation using localStorage until database API is available
      const storedLogs = localStorage.getItem('characterTravelLogs');
      
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        
        if (parsedLogs[characterId]) {
          this.travelLogs[characterId] = parsedLogs[characterId];
          
          if (mapId) {
            return parsedLogs[characterId].filter(entry => entry.mapId === mapId);
          }
          
          return parsedLogs[characterId];
        }
      }
    } catch (error) {
      console.error(`Error loading travel log for ${characterId}:`, error);
    }
    
    return [];
  }

  /**
   * Calculate distance between two points
   */
  public calculateDistance(
    point1: MapCoordinate,
    point2: MapCoordinate
  ): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate travel time between points
   */
  private calculateTravelTime(
    points: MapCoordinate[],
    speedMilesPerHour: number
  ): number {
    if (points.length < 2) {
      return 0;
    }
    
    let totalDistance = 0;
    
    for (let i = 1; i < points.length; i++) {
      totalDistance += this.calculateDistance(points[i - 1], points[i]);
    }
    
    // Convert to hours based on speed
    return totalDistance / speedMilesPerHour;
  }

  /**
   * Calculate distance between two locations with options
   */
  public async calculateDistanceBetweenLocations(
    mapId: string,
    locationId1: string,
    locationId2: string,
    options?: DistanceCalculationOptions
  ): Promise<number> {
    const location1 = await this.getLocation(mapId, locationId1);
    const location2 = await this.getLocation(mapId, locationId2);
    
    if (!location1 || !location2) {
      return -1;
    }
    
    // Simple direct distance
    return this.calculateDistance(location1.position, location2.position);
    
    // In a real implementation, this would use pathfinding algorithms
    // and take into account terrain, routes, and other factors
  }

  /**
   * Estimate travel time between two locations
   */
  public async estimateTravelTime(
    mapId: string,
    locationId1: string,
    locationId2: string,
    options: TravelTimeEstimationOptions
  ): Promise<number> {
    const distance = await this.calculateDistanceBetweenLocations(mapId, locationId1, locationId2, options);
    
    if (distance < 0) {
      return -1;
    }
    
    // Calculate base travel time in hours
    let travelTime = distance / options.speed;
    
    // Apply factors
    if (options.weatherFactor) {
      travelTime *= options.weatherFactor;
    }
    
    if (options.encumbranceFactor) {
      travelTime *= options.encumbranceFactor;
    }
    
    // Calculate days
    if (options.travelHoursPerDay) {
      const travelDays = Math.ceil(travelTime / options.travelHoursPerDay);
      
      // Add rest time
      if (options.restHoursPerDay) {
        travelTime += travelDays * options.restHoursPerDay;
      }
    }
    
    return travelTime;
  }

  /**
   * Reveal an area on the fog of war
   */
  public async revealArea(
    mapId: string,
    characterId: string,
    points: MapCoordinate[]
  ): Promise<boolean> {
    const map = await this.getMap(mapId);
    
    if (!map) {
      return false;
    }
    
    // Find the fog of war layer
    const fogLayer = map.layers.find(layer => layer.type === MapLayerType.FOG_OF_WAR);
    
    if (!fogLayer) {
      return false;
    }
    
    // Create the revealed area
    const revealedArea = {
      id: uuidv4(),
      points
    };
    
    // Add to layer
    if (!fogLayer.data.revealedAreas) {
      fogLayer.data.revealedAreas = [];
    }
    
    fogLayer.data.revealedAreas.push(revealedArea);
    
    // Save the map
    await this.updateMap(map);
    
    // Emit event
    this.emitEvent({
      type: 'fog_revealed',
      mapId,
      data: {
        characterId,
        area: revealedArea
      },
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Create a new layer
   */
  public async createLayer(
    mapId: string,
    name: string,
    type: MapLayerType,
    data: any
  ): Promise<MapLayer | null> {
    const map = await this.getMap(mapId);
    
    if (!map) {
      return null;
    }
    
    // Create the layer
    const newLayer: MapLayer = {
      id: uuidv4(),
      name,
      type,
      visible: true,
      opacity: 1,
      order: map.layers.length,
      data
    };
    
    // Add to map
    map.layers.push(newLayer);
    
    // Save the map
    await this.updateMap(map);
    
    // Emit event
    this.emitEvent({
      type: 'layer_created',
      mapId,
      data: newLayer,
      timestamp: Date.now()
    });
    
    return newLayer;
  }

  /**
   * Update a layer
   */
  public async updateLayer(
    mapId: string,
    layer: MapLayer
  ): Promise<boolean> {
    const map = await this.getMap(mapId);
    
    if (!map) {
      return false;
    }
    
    // Find the layer index
    const index = map.layers.findIndex(l => l.id === layer.id);
    
    if (index === -1) {
      return false;
    }
    
    // Update the layer
    map.layers[index] = layer;
    
    // Save the map
    await this.updateMap(map);
    
    // Emit event
    this.emitEvent({
      type: 'layer_updated',
      mapId,
      data: layer,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Delete a layer
   */
  public async deleteLayer(
    mapId: string,
    layerId: string
  ): Promise<boolean> {
    const map = await this.getMap(mapId);
    
    if (!map) {
      return false;
    }
    
    // Find the layer
    const layer = map.layers.find(l => l.id === layerId);
    
    if (!layer) {
      return false;
    }
    
    // Remove the layer
    map.layers = map.layers.filter(l => l.id !== layerId);
    
    // Update order of remaining layers
    map.layers.forEach((l, i) => {
      l.order = i;
    });
    
    // Save the map
    await this.updateMap(map);
    
    // Emit event
    this.emitEvent({
      type: 'layer_deleted',
      mapId,
      data: { id: layerId },
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Get map bounds
   */
  public getMapBounds(map: WorldMap): MapBounds {
    return {
      minX: 0,
      minY: 0,
      maxX: map.width,
      maxY: map.height
    };
  }

  /**
   * Add an event listener
   */
  public addEventListener(listener: (event: MapEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove an event listener
   */
  public removeEventListener(listener: (event: MapEvent) => void): void {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  /**
   * Emit an event
   */
  private emitEvent(event: MapEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in map event listener:', error);
      }
    });
  }
}

// Export a singleton instance
export const worldMapService = WorldMapService.getInstance();