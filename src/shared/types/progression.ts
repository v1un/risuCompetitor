/**
 * progression.ts
 * Types for character progression and experience systems
 */

// Progression system types
export enum ProgressionSystem {
  LEVEL_BASED = 'level_based',
  SKILL_BASED = 'skill_based',
  MILESTONE_BASED = 'milestone_based',
  HYBRID = 'hybrid',
}

// Experience source types
export enum ExperienceSource {
  COMBAT = 'combat',
  QUEST = 'quest',
  EXPLORATION = 'exploration',
  ROLEPLAY = 'roleplay',
  CRAFTING = 'crafting',
  SOCIAL = 'social',
  CUSTOM = 'custom',
}

// Attribute types
export enum AttributeType {
  STRENGTH = 'strength',
  DEXTERITY = 'dexterity',
  CONSTITUTION = 'constitution',
  INTELLIGENCE = 'intelligence',
  WISDOM = 'wisdom',
  CHARISMA = 'charisma',
  CUSTOM = 'custom',
}

// Skill category types
export enum SkillCategory {
  COMBAT = 'combat',
  MAGIC = 'magic',
  STEALTH = 'stealth',
  SOCIAL = 'social',
  KNOWLEDGE = 'knowledge',
  CRAFTING = 'crafting',
  SURVIVAL = 'survival',
  MOVEMENT = 'movement',
  CUSTOM = 'custom',
}

// Milestone type
export enum MilestoneType {
  STORY = 'story',
  ACHIEVEMENT = 'achievement',
  DISCOVERY = 'discovery',
  RELATIONSHIP = 'relationship',
  CUSTOM = 'custom',
}

// Experience entry
export interface ExperienceEntry {
  id: string;
  source: ExperienceSource;
  amount: number;
  description: string;
  timestamp: number;
  sessionId?: string;
}

// Attribute
export interface Attribute {
  id: string;
  type: AttributeType;
  name: string;
  value: number;
  modifier: number;
  maxValue: number;
  description?: string;
}

// Skill
export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  relatedAttributes: AttributeType[];
  proficient: boolean;
  expertise: boolean;
  description?: string;
}

// Milestone
export interface Milestone {
  id: string;
  type: MilestoneType;
  name: string;
  description: string;
  completed: boolean;
  completedDate?: number;
  rewards?: {
    experience?: number;
    attributes?: Partial<Record<AttributeType, number>>;
    skills?: Record<string, number>;
    items?: string[];
    custom?: Record<string, any>;
  };
}

// Level requirements
export interface LevelRequirements {
  level: number;
  experienceRequired: number;
  attributePoints?: number;
  skillPoints?: number;
  featureUnlocks?: string[];
}

// Character progression
export interface CharacterProgression {
  id: string;
  characterId: string;
  system: ProgressionSystem;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  unspentAttributePoints: number;
  unspentSkillPoints: number;
  attributes: Attribute[];
  skills: Skill[];
  milestones: Milestone[];
  experienceHistory: ExperienceEntry[];
  levelHistory: {
    level: number;
    timestamp: number;
    sessionId?: string;
  }[];
}

// Level-up result
export interface LevelUpResult {
  success: boolean;
  previousLevel: number;
  newLevel: number;
  attributePointsGained: number;
  skillPointsGained: number;
  newFeatures: string[];
  message: string;
}

// Skill improvement result
export interface SkillImprovementResult {
  success: boolean;
  skillId: string;
  previousLevel: number;
  newLevel: number;
  pointsSpent: number;
  message: string;
}

// Attribute improvement result
export interface AttributeImprovementResult {
  success: boolean;
  attributeId: string;
  previousValue: number;
  newValue: number;
  pointsSpent: number;
  message: string;
}

// Milestone completion result
export interface MilestoneCompletionResult {
  success: boolean;
  milestoneId: string;
  experienceGained: number;
  attributesImproved: Partial<Record<AttributeType, number>>;
  skillsImproved: Record<string, number>;
  itemsGained: string[];
  message: string;
}

// Experience gain result
export interface ExperienceGainResult {
  success: boolean;
  amount: number;
  source: ExperienceSource;
  leveledUp: boolean;
  newLevel?: number;
  message: string;
}

// Character class
export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  primaryAttributes: AttributeType[];
  startingSkills: string[];
  levelFeatures: Record<number, {
    name: string;
    description: string;
    effects?: Record<string, any>;
  }[]>;
}

// Character race
export interface CharacterRace {
  id: string;
  name: string;
  description: string;
  attributeBonuses: Partial<Record<AttributeType, number>>;
  racialTraits: {
    name: string;
    description: string;
    effects?: Record<string, any>;
  }[];
}

// Character background
export interface CharacterBackground {
  id: string;
  name: string;
  description: string;
  skillProficiencies: string[];
  traits: {
    name: string;
    description: string;
    effects?: Record<string, any>;
  }[];
}

// Progression configuration
export interface ProgressionConfig {
  system: ProgressionSystem;
  maxLevel: number;
  levelRequirements: LevelRequirements[];
  skillProgression: {
    maxLevel: number;
    experiencePerLevel: number[] | ((level: number) => number);
  };
  attributeProgression: {
    minValue: number;
    maxValue: number;
    startingPoints: number;
    pointsPerLevel: number;
  };
  experienceMultipliers: Partial<Record<ExperienceSource, number>>;
  classes: CharacterClass[];
  races: CharacterRace[];
  backgrounds: CharacterBackground[];
}