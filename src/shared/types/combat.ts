// Combat system types
export interface CombatParticipant {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'enemy';
  initiative: number;
  currentHp: number;
  maxHp: number;
  armorClass?: number;
  stats: Record<string, number>;
  conditions: CombatCondition[];
  position?: CombatPosition;
  portrait?: string;
  actions: CombatAction[];
  reactions?: CombatAction[];
  bonusActions?: CombatAction[];
  resources?: Record<string, {
    current: number;
    max: number;
    name: string;
  }>;
  notes?: string;
  isActive: boolean;
  hasActed: boolean;
  hasMovedThisTurn: boolean;
  hasUsedBonusAction: boolean;
  hasUsedReaction: boolean;
}

export interface CombatAction {
  id: string;
  name: string;
  description: string;
  actionType: 'action' | 'bonus' | 'reaction' | 'movement' | 'special';
  attackBonus?: number;
  damageFormula?: string;
  damageType?: string;
  range?: string;
  areaOfEffect?: {
    type: 'cone' | 'cube' | 'cylinder' | 'line' | 'sphere';
    size: number;
  };
  savingThrow?: {
    attribute: string;
    dc: number;
    effect: string;
  };
  resourceCost?: {
    resourceName: string;
    amount: number;
  };
  conditions?: {
    name: string;
    duration: number;
    savingThrow?: {
      attribute: string;
      dc: number;
    };
  }[];
  cooldown?: number;
  currentCooldown?: number;
  tags?: string[];
}

export interface CombatCondition {
  id: string;
  name: string;
  description: string;
  duration: number | 'permanent';
  effect: string;
  icon?: string;
  savingThrow?: {
    attribute: string;
    dc: number;
    frequency: 'turnStart' | 'turnEnd' | 'roundEnd';
    removeOnSuccess: boolean;
  };
  appliedAt: number; // Round number when applied
}

export interface CombatPosition {
  x: number;
  y: number;
  z?: number;
  size?: number; // Size in grid squares (1 = standard)
}

export interface CombatMap {
  id: string;
  name: string;
  description?: string;
  gridSize: {
    width: number;
    height: number;
  };
  gridScale: number; // feet per grid square
  background?: string;
  terrain: CombatTerrain[];
  objects: CombatObject[];
  fogOfWar?: boolean[][];
  visibility?: 'all' | 'players' | 'dm';
}

export interface CombatTerrain {
  id: string;
  type: 'difficult' | 'impassable' | 'hazard' | 'cover' | 'custom';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  elevation?: number;
  description?: string;
  effect?: string;
  texture?: string;
  visibility?: 'all' | 'players' | 'dm';
}

export interface CombatObject {
  id: string;
  name: string;
  description?: string;
  position: CombatPosition;
  interactable: boolean;
  effect?: string;
  texture?: string;
  visibility?: 'all' | 'players' | 'dm';
}

export interface CombatEncounter {
  id: string;
  name: string;
  description?: string;
  participants: CombatParticipant[];
  map?: CombatMap;
  currentRound: number;
  currentTurn: number;
  initiativeOrder: string[]; // Array of participant IDs in initiative order
  status: 'preparing' | 'active' | 'paused' | 'completed';
  log: CombatLogEntry[];
  startTime?: string;
  endTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'deadly' | 'custom';
  xpAwarded?: number;
  loot?: CombatLoot[];
  notes?: string;
  visibility?: 'all' | 'players' | 'dm';
}

export interface CombatLogEntry {
  id: string;
  round: number;
  turn: number;
  timestamp: string;
  actorId?: string;
  targetIds?: string[];
  actionType: 'attack' | 'damage' | 'heal' | 'condition' | 'movement' | 'special' | 'system';
  description: string;
  details?: Record<string, any>;
  visibility?: 'all' | 'players' | 'dm';
}

export interface CombatLoot {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  value?: number;
  type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'wand' | 'ring' | 'currency' | 'gem' | 'misc';
  rarity?: 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact';
  properties?: Record<string, any>;
  claimed?: boolean;
  claimedBy?: string;
}

export interface DiceRoll {
  formula: string;
  results: number[];
  total: number;
  breakdown: string;
  success?: boolean;
  critical?: 'success' | 'failure';
}

export interface AttackRoll extends DiceRoll {
  attacker: string;
  target: string;
  attackBonus: number;
  targetAC: number;
  hit: boolean;
  isCriticalHit: boolean; // Renamed from 'critical' to avoid type conflict with DiceRoll.critical
  damageRolls?: DamageRoll[];
}

export interface DamageRoll extends DiceRoll {
  damageType: string;
  isCritical?: boolean;
}

export interface SavingThrowRoll extends DiceRoll {
  character: string;
  attribute: string;
  dc: number;
  success: boolean;
}

export interface CombatSettings {
  initiativeType: 'group' | 'individual';
  turnTimer?: number; // seconds
  autoEndTurn: boolean;
  showDiceRolls: boolean;
  confirmActions: boolean;
  trackResources: boolean;
  trackConditions: boolean;
  useGrid: boolean;
  useRealTimeTracking: boolean;
  allowPlayerRolls: boolean;
  narratorControlsNPCs: boolean;
}

export interface CombatState {
  encounters: Record<string, CombatEncounter>;
  activeEncounterId?: string;
  settings: CombatSettings;
}

export interface CombatActionDispatch {
  type: 'START_COMBAT' | 'END_COMBAT' | 'NEXT_TURN' | 'PREVIOUS_TURN' | 'ADD_PARTICIPANT' | 
    'REMOVE_PARTICIPANT' | 'UPDATE_PARTICIPANT' | 'ROLL_INITIATIVE' | 'SET_INITIATIVE' | 
    'ADD_CONDITION' | 'REMOVE_CONDITION' | 'PERFORM_ACTION' | 'MOVE_PARTICIPANT' | 
    'DEAL_DAMAGE' | 'HEAL_DAMAGE' | 'ADD_LOG_ENTRY' | 'UPDATE_MAP' | 'TOGGLE_FOG_OF_WAR' |
    'ADD_LOOT' | 'CLAIM_LOOT' | 'UPDATE_SETTINGS';
  payload: any;
}