/**
 * CharacterProgressionService.ts
 * Service for managing character progression, experience, and advancement
 */

import { v4 as uuidv4 } from 'uuid';
import {
  CharacterProgression,
  ProgressionSystem,
  ExperienceSource,
  AttributeType,
  SkillCategory,
  MilestoneType,
  Attribute,
  Skill,
  Milestone,
  ExperienceEntry,
  LevelUpResult,
  SkillImprovementResult,
  AttributeImprovementResult,
  MilestoneCompletionResult,
  ExperienceGainResult,
  ProgressionConfig
} from '../../shared/types/progression';
import { InventoryManager } from './InventoryManager';

// Event types for progression changes
export interface ProgressionEvent {
  type: 'experience_gain' | 'level_up' | 'attribute_improvement' | 'skill_improvement' | 'milestone_completion';
  characterId: string;
  data: any;
  timestamp: number;
}

export class CharacterProgressionService {
  private static instance: CharacterProgressionService;
  private progressions: Record<string, CharacterProgression> = {};
  private config: ProgressionConfig;
  private eventListeners: ((event: ProgressionEvent) => void)[] = [];

  private constructor() {
    // Private constructor for singleton pattern
    this.initializeConfig();
  }

  public static getInstance(): CharacterProgressionService {
    if (!CharacterProgressionService.instance) {
      CharacterProgressionService.instance = new CharacterProgressionService();
    }
    return CharacterProgressionService.instance;
  }

  /**
   * Initialize the progression configuration
   */
  private initializeConfig(): void {
    // Default configuration
    this.config = {
      system: ProgressionSystem.LEVEL_BASED,
      maxLevel: 20,
      levelRequirements: Array.from({ length: 20 }, (_, i) => ({
        level: i + 1,
        experienceRequired: this.calculateExperienceForLevel(i + 1),
        attributePoints: i % 4 === 0 ? 1 : 0,
        skillPoints: 2,
        featureUnlocks: []
      })),
      skillProgression: {
        maxLevel: 5,
        experiencePerLevel: [100, 300, 600, 1000, 1500]
      },
      attributeProgression: {
        minValue: 1,
        maxValue: 20,
        startingPoints: 6,
        pointsPerLevel: 1
      },
      experienceMultipliers: {
        [ExperienceSource.COMBAT]: 1.0,
        [ExperienceSource.QUEST]: 1.2,
        [ExperienceSource.EXPLORATION]: 0.8,
        [ExperienceSource.ROLEPLAY]: 1.1,
        [ExperienceSource.CRAFTING]: 0.9,
        [ExperienceSource.SOCIAL]: 0.7,
        [ExperienceSource.CUSTOM]: 1.0
      },
      classes: [],
      races: [],
      backgrounds: []
    };

    // Load from database or settings in a real implementation
    this.loadConfigFromDatabase();
  }

  /**
   * Load configuration from database
   */
  private async loadConfigFromDatabase(): Promise<void> {
    try {
      // In a real implementation, this would load from the database
      console.log('Loading progression configuration...');
      
      // We would fetch this from the database in a real implementation
      // Using settings API since there's no dedicated progression API
      const result = await window.api.settings.getByCategory('progression');
      
      if (result.success && result.settings) {
        // Parse the configuration from settings
        try {
          const configData = result.settings.find(s => s.key === 'progressionConfig');
          if (configData && configData.value) {
            this.config = JSON.parse(configData.value);
          }
        } catch (parseError) {
          console.error('Error parsing progression configuration:', parseError);
        }
      }
      
      console.log('Progression configuration loaded');
    } catch (error) {
      console.error('Error loading progression configuration:', error);
    }
  }

  /**
   * Calculate experience required for a level
   */
  private calculateExperienceForLevel(level: number): number {
    // Common D&D-style experience curve
    return Math.round(level * level * 500);
  }

  /**
   * Get a character's progression, creating it if it doesn't exist
   */
  public async getProgression(characterId: string): Promise<CharacterProgression> {
    // Check if we already have it in memory
    const existingProgression = this.progressions[characterId];
    
    if (existingProgression) {
      return existingProgression;
    }
    
    // Try to load from database
    try {
      // Use character API to get character data
      const result = await window.api.character.get(characterId);
      
      if (result.success && result.character && result.character.progression) {
        this.progressions[characterId] = result.character.progression;
        return result.character.progression;
      }
    } catch (error) {
      console.error('Error loading character progression:', error);
    }
    
    // Create a new progression if not found
    const newProgression = this.createDefaultProgression(characterId);
    this.progressions[characterId] = newProgression;
    
    // Save to database
    try {
      // Get the character first
      const characterResult = await window.api.character.get(characterId);
      
      if (characterResult.success && characterResult.character) {
        // Update the character with the new progression
        const character = characterResult.character;
        character.progression = newProgression;
        
        // Save the updated character
        await window.api.character.update(characterId, character);
      } else {
        console.error('Character not found, cannot save progression');
      }
    } catch (error) {
      console.error('Error saving new character progression:', error);
    }
    
    return newProgression;
  }

  /**
   * Create a default progression for a new character
   */
  private createDefaultProgression(characterId: string): CharacterProgression {
    // Create default attributes
    const attributes: Attribute[] = [
      {
        id: uuidv4(),
        type: AttributeType.STRENGTH,
        name: 'Strength',
        value: 10,
        modifier: 0,
        maxValue: this.config.attributeProgression.maxValue,
        description: 'Physical power and carrying capacity'
      },
      {
        id: uuidv4(),
        type: AttributeType.DEXTERITY,
        name: 'Dexterity',
        value: 10,
        modifier: 0,
        maxValue: this.config.attributeProgression.maxValue,
        description: 'Agility, reflexes, and balance'
      },
      {
        id: uuidv4(),
        type: AttributeType.CONSTITUTION,
        name: 'Constitution',
        value: 10,
        modifier: 0,
        maxValue: this.config.attributeProgression.maxValue,
        description: 'Endurance, stamina, and health'
      },
      {
        id: uuidv4(),
        type: AttributeType.INTELLIGENCE,
        name: 'Intelligence',
        value: 10,
        modifier: 0,
        maxValue: this.config.attributeProgression.maxValue,
        description: 'Knowledge, reasoning, and memory'
      },
      {
        id: uuidv4(),
        type: AttributeType.WISDOM,
        name: 'Wisdom',
        value: 10,
        modifier: 0,
        maxValue: this.config.attributeProgression.maxValue,
        description: 'Perception, intuition, and insight'
      },
      {
        id: uuidv4(),
        type: AttributeType.CHARISMA,
        name: 'Charisma',
        value: 10,
        modifier: 0,
        maxValue: this.config.attributeProgression.maxValue,
        description: 'Force of personality, persuasiveness, and leadership'
      }
    ];

    // Create default skills
    const skills: Skill[] = [
      // Combat skills
      {
        id: uuidv4(),
        name: 'Melee Combat',
        category: SkillCategory.COMBAT,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.STRENGTH, AttributeType.DEXTERITY],
        proficient: false,
        expertise: false,
        description: 'Skill with melee weapons and close combat'
      },
      {
        id: uuidv4(),
        name: 'Ranged Combat',
        category: SkillCategory.COMBAT,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.DEXTERITY],
        proficient: false,
        expertise: false,
        description: 'Skill with ranged weapons and attacks'
      },
      {
        id: uuidv4(),
        name: 'Defense',
        category: SkillCategory.COMBAT,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.DEXTERITY, AttributeType.CONSTITUTION],
        proficient: false,
        expertise: false,
        description: 'Ability to avoid and mitigate damage'
      },
      
      // Magic skills
      {
        id: uuidv4(),
        name: 'Arcana',
        category: SkillCategory.MAGIC,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.INTELLIGENCE],
        proficient: false,
        expertise: false,
        description: 'Knowledge of arcane magic and magical phenomena'
      },
      {
        id: uuidv4(),
        name: 'Spellcasting',
        category: SkillCategory.MAGIC,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.INTELLIGENCE, AttributeType.WISDOM],
        proficient: false,
        expertise: false,
        description: 'Ability to cast and control magical spells'
      },
      
      // Stealth skills
      {
        id: uuidv4(),
        name: 'Stealth',
        category: SkillCategory.STEALTH,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.DEXTERITY],
        proficient: false,
        expertise: false,
        description: 'Ability to move quietly and remain unseen'
      },
      {
        id: uuidv4(),
        name: 'Sleight of Hand',
        category: SkillCategory.STEALTH,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.DEXTERITY],
        proficient: false,
        expertise: false,
        description: 'Manual dexterity and fine motor skills'
      },
      
      // Social skills
      {
        id: uuidv4(),
        name: 'Persuasion',
        category: SkillCategory.SOCIAL,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.CHARISMA],
        proficient: false,
        expertise: false,
        description: 'Ability to influence others through logic and charm'
      },
      {
        id: uuidv4(),
        name: 'Deception',
        category: SkillCategory.SOCIAL,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.CHARISMA],
        proficient: false,
        expertise: false,
        description: 'Ability to lie convincingly and mislead others'
      },
      {
        id: uuidv4(),
        name: 'Intimidation',
        category: SkillCategory.SOCIAL,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.CHARISMA, AttributeType.STRENGTH],
        proficient: false,
        expertise: false,
        description: 'Ability to influence others through threats and fear'
      },
      
      // Knowledge skills
      {
        id: uuidv4(),
        name: 'History',
        category: SkillCategory.KNOWLEDGE,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.INTELLIGENCE],
        proficient: false,
        expertise: false,
        description: 'Knowledge of past events, cultures, and figures'
      },
      {
        id: uuidv4(),
        name: 'Nature',
        category: SkillCategory.KNOWLEDGE,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.INTELLIGENCE, AttributeType.WISDOM],
        proficient: false,
        expertise: false,
        description: 'Knowledge of the natural world, plants, and animals'
      },
      
      // Survival skills
      {
        id: uuidv4(),
        name: 'Survival',
        category: SkillCategory.SURVIVAL,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.WISDOM],
        proficient: false,
        expertise: false,
        description: 'Ability to survive in the wilderness and track creatures'
      },
      {
        id: uuidv4(),
        name: 'Medicine',
        category: SkillCategory.SURVIVAL,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        relatedAttributes: [AttributeType.WISDOM],
        proficient: false,
        expertise: false,
        description: 'Knowledge of healing, diseases, and injuries'
      }
    ];

    // Create default milestones
    const milestones: Milestone[] = [
      {
        id: uuidv4(),
        type: MilestoneType.STORY,
        name: 'Begin Your Journey',
        description: 'Start your adventure and establish your character in the world.',
        completed: false,
        rewards: {
          experience: 100,
          attributes: {
            [AttributeType.WISDOM]: 1
          }
        }
      },
      {
        id: uuidv4(),
        type: MilestoneType.ACHIEVEMENT,
        name: 'First Victory',
        description: 'Win your first combat encounter.',
        completed: false,
        rewards: {
          experience: 150,
          skills: {
            'Melee Combat': 1
          }
        }
      },
      {
        id: uuidv4(),
        type: MilestoneType.DISCOVERY,
        name: 'Explore the Unknown',
        description: 'Discover a new location of significance.',
        completed: false,
        rewards: {
          experience: 200,
          skills: {
            'Survival': 1
          }
        }
      }
    ];

    // Create the progression object
    return {
      id: uuidv4(),
      characterId,
      system: this.config.system,
      level: 1,
      experience: 0,
      experienceToNextLevel: this.calculateExperienceForLevel(2),
      unspentAttributePoints: this.config.attributeProgression.startingPoints,
      unspentSkillPoints: 0,
      attributes,
      skills,
      milestones,
      experienceHistory: [],
      levelHistory: [
        {
          level: 1,
          timestamp: Date.now()
        }
      ]
    };
  }

  /**
   * Save a character's progression to the database
   */
  private async saveProgression(progression: CharacterProgression): Promise<void> {
    try {
      // Get the character first
      const characterResult = await window.api.character.get(progression.characterId);
      
      if (characterResult.success && characterResult.character) {
        // Update the character with the new progression
        const character = characterResult.character;
        character.progression = progression;
        
        // Save the updated character
        await window.api.character.update(progression.characterId, character);
      } else {
        console.error('Character not found, cannot save progression');
      }
    } catch (error) {
      console.error('Error saving character progression:', error);
    }
  }

  /**
   * Add experience to a character
   */
  public async addExperience(
    characterId: string,
    amount: number,
    source: ExperienceSource,
    description: string,
    sessionId?: string
  ): Promise<ExperienceGainResult> {
    const progression = await this.getProgression(characterId);
    
    // Apply experience multiplier based on source
    const multiplier = this.config.experienceMultipliers[source] || 1.0;
    const adjustedAmount = Math.round(amount * multiplier);
    
    // Create experience entry
    const entry: ExperienceEntry = {
      id: uuidv4(),
      source,
      amount: adjustedAmount,
      description,
      timestamp: Date.now(),
      sessionId
    };
    
    // Add to history
    progression.experienceHistory.unshift(entry);
    
    // Update total experience
    const oldExperience = progression.experience;
    progression.experience += adjustedAmount;
    
    // Check for level up
    let leveledUp = false;
    let newLevel = progression.level;
    
    // Find the next level requirement
    const nextLevelReq = this.config.levelRequirements.find(
      req => req.level === progression.level + 1
    );
    
    if (nextLevelReq && progression.experience >= nextLevelReq.experienceRequired) {
      // Level up
      const levelUpResult = await this.levelUp(characterId);
      leveledUp = levelUpResult.success;
      newLevel = levelUpResult.newLevel;
    } else if (nextLevelReq) {
      // Update experience to next level
      progression.experienceToNextLevel = nextLevelReq.experienceRequired - progression.experience;
    }
    
    // Save progression
    await this.saveProgression(progression);
    
    // Create result
    const result: ExperienceGainResult = {
      success: true,
      amount: adjustedAmount,
      source,
      leveledUp,
      message: `Gained ${adjustedAmount} experience from ${source.replace('_', ' ')}.`
    };
    
    if (leveledUp) {
      result.newLevel = newLevel;
      result.message += ` Leveled up to ${newLevel}!`;
    }
    
    // Emit event
    this.emitEvent({
      type: 'experience_gain',
      characterId,
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  }

  /**
   * Level up a character
   */
  public async levelUp(characterId: string): Promise<LevelUpResult> {
    const progression = await this.getProgression(characterId);
    
    // Check if at max level
    if (progression.level >= this.config.maxLevel) {
      return {
        success: false,
        previousLevel: progression.level,
        newLevel: progression.level,
        attributePointsGained: 0,
        skillPointsGained: 0,
        newFeatures: [],
        message: `Already at maximum level (${this.config.maxLevel}).`
      };
    }
    
    // Find the next level requirement
    const nextLevelReq = this.config.levelRequirements.find(
      req => req.level === progression.level + 1
    );
    
    if (!nextLevelReq) {
      return {
        success: false,
        previousLevel: progression.level,
        newLevel: progression.level,
        attributePointsGained: 0,
        skillPointsGained: 0,
        newFeatures: [],
        message: 'Level requirements not found.'
      };
    }
    
    // Check if enough experience
    if (progression.experience < nextLevelReq.experienceRequired) {
      return {
        success: false,
        previousLevel: progression.level,
        newLevel: progression.level,
        attributePointsGained: 0,
        skillPointsGained: 0,
        newFeatures: [],
        message: `Not enough experience to level up. Need ${nextLevelReq.experienceRequired - progression.experience} more.`
      };
    }
    
    // Level up
    const oldLevel = progression.level;
    progression.level = nextLevelReq.level;
    
    // Add to level history
    progression.levelHistory.unshift({
      level: progression.level,
      timestamp: Date.now()
    });
    
    // Award attribute points
    const attributePointsGained = nextLevelReq.attributePoints || 0;
    progression.unspentAttributePoints += attributePointsGained;
    
    // Award skill points
    const skillPointsGained = nextLevelReq.skillPoints || 0;
    progression.unspentSkillPoints += skillPointsGained;
    
    // Update experience to next level
    const nextNextLevelReq = this.config.levelRequirements.find(
      req => req.level === progression.level + 1
    );
    
    if (nextNextLevelReq) {
      progression.experienceToNextLevel = nextNextLevelReq.experienceRequired - progression.experience;
    } else {
      progression.experienceToNextLevel = 0; // At max level
    }
    
    // Save progression
    await this.saveProgression(progression);
    
    // Create result
    const result: LevelUpResult = {
      success: true,
      previousLevel: oldLevel,
      newLevel: progression.level,
      attributePointsGained,
      skillPointsGained,
      newFeatures: nextLevelReq.featureUnlocks || [],
      message: `Leveled up to ${progression.level}!`
    };
    
    // Emit event
    this.emitEvent({
      type: 'level_up',
      characterId,
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  }

  /**
   * Improve an attribute
   */
  public async improveAttribute(
    characterId: string,
    attributeId: string,
    points: number = 1
  ): Promise<AttributeImprovementResult> {
    const progression = await this.getProgression(characterId);
    
    // Find the attribute
    const attribute = progression.attributes.find(attr => attr.id === attributeId);
    
    if (!attribute) {
      return {
        success: false,
        attributeId,
        previousValue: 0,
        newValue: 0,
        pointsSpent: 0,
        message: 'Attribute not found.'
      };
    }
    
    // Check if enough points
    if (progression.unspentAttributePoints < points) {
      return {
        success: false,
        attributeId,
        previousValue: attribute.value,
        newValue: attribute.value,
        pointsSpent: 0,
        message: `Not enough attribute points. Have ${progression.unspentAttributePoints}, need ${points}.`
      };
    }
    
    // Check if at max value
    if (attribute.value + points > attribute.maxValue) {
      return {
        success: false,
        attributeId,
        previousValue: attribute.value,
        newValue: attribute.value,
        pointsSpent: 0,
        message: `Cannot exceed maximum value of ${attribute.maxValue}.`
      };
    }
    
    // Improve attribute
    const oldValue = attribute.value;
    attribute.value += points;
    
    // Update modifier (D&D style: (value - 10) / 2, rounded down)
    attribute.modifier = Math.floor((attribute.value - 10) / 2);
    
    // Spend points
    progression.unspentAttributePoints -= points;
    
    // Save progression
    await this.saveProgression(progression);
    
    // Create result
    const result: AttributeImprovementResult = {
      success: true,
      attributeId,
      previousValue: oldValue,
      newValue: attribute.value,
      pointsSpent: points,
      message: `Improved ${attribute.name} from ${oldValue} to ${attribute.value}.`
    };
    
    // Emit event
    this.emitEvent({
      type: 'attribute_improvement',
      characterId,
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  }

  /**
   * Improve a skill
   */
  public async improveSkill(
    characterId: string,
    skillId: string,
    points: number = 1
  ): Promise<SkillImprovementResult> {
    const progression = await this.getProgression(characterId);
    
    // Find the skill
    const skill = progression.skills.find(s => s.id === skillId);
    
    if (!skill) {
      return {
        success: false,
        skillId,
        previousLevel: 0,
        newLevel: 0,
        pointsSpent: 0,
        message: 'Skill not found.'
      };
    }
    
    // Check if enough points
    if (progression.unspentSkillPoints < points) {
      return {
        success: false,
        skillId,
        previousLevel: skill.level,
        newLevel: skill.level,
        pointsSpent: 0,
        message: `Not enough skill points. Have ${progression.unspentSkillPoints}, need ${points}.`
      };
    }
    
    // Check if at max level
    if (skill.level + points > this.config.skillProgression.maxLevel) {
      return {
        success: false,
        skillId,
        previousLevel: skill.level,
        newLevel: skill.level,
        pointsSpent: 0,
        message: `Cannot exceed maximum level of ${this.config.skillProgression.maxLevel}.`
      };
    }
    
    // Improve skill
    const oldLevel = skill.level;
    skill.level += points;
    
    // Update experience to next level
    if (typeof this.config.skillProgression.experiencePerLevel === 'function') {
      skill.experienceToNextLevel = this.config.skillProgression.experiencePerLevel(skill.level);
    } else if (Array.isArray(this.config.skillProgression.experiencePerLevel) && 
               skill.level < this.config.skillProgression.experiencePerLevel.length) {
      skill.experienceToNextLevel = this.config.skillProgression.experiencePerLevel[skill.level - 1];
    } else {
      skill.experienceToNextLevel = skill.level * 100; // Fallback
    }
    
    // Spend points
    progression.unspentSkillPoints -= points;
    
    // Save progression
    await this.saveProgression(progression);
    
    // Create result
    const result: SkillImprovementResult = {
      success: true,
      skillId,
      previousLevel: oldLevel,
      newLevel: skill.level,
      pointsSpent: points,
      message: `Improved ${skill.name} from level ${oldLevel} to ${skill.level}.`
    };
    
    // Emit event
    this.emitEvent({
      type: 'skill_improvement',
      characterId,
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  }

  /**
   * Complete a milestone
   */
  public async completeMilestone(
    characterId: string,
    milestoneId: string
  ): Promise<MilestoneCompletionResult> {
    const progression = await this.getProgression(characterId);
    
    // Find the milestone
    const milestone = progression.milestones.find(m => m.id === milestoneId);
    
    if (!milestone) {
      return {
        success: false,
        milestoneId,
        experienceGained: 0,
        attributesImproved: {},
        skillsImproved: {},
        itemsGained: [],
        message: 'Milestone not found.'
      };
    }
    
    // Check if already completed
    if (milestone.completed) {
      return {
        success: false,
        milestoneId,
        experienceGained: 0,
        attributesImproved: {},
        skillsImproved: {},
        itemsGained: [],
        message: 'Milestone already completed.'
      };
    }
    
    // Complete milestone
    milestone.completed = true;
    milestone.completedDate = Date.now();
    
    // Apply rewards
    let experienceGained = 0;
    const attributesImproved: Partial<Record<AttributeType, number>> = {};
    const skillsImproved: Record<string, number> = {};
    const itemsGained: string[] = [];
    
    if (milestone.rewards) {
      // Experience
      if (milestone.rewards.experience) {
        const expResult = await this.addExperience(
          characterId,
          milestone.rewards.experience,
          ExperienceSource.CUSTOM,
          `Milestone: ${milestone.name}`
        );
        experienceGained = expResult.amount;
      }
      
      // Attributes
      if (milestone.rewards.attributes) {
        for (const [attrType, value] of Object.entries(milestone.rewards.attributes)) {
          const attribute = progression.attributes.find(a => a.type === attrType);
          
          if (attribute) {
            const oldValue = attribute.value;
            attribute.value = Math.min(attribute.value + value, attribute.maxValue);
            attribute.modifier = Math.floor((attribute.value - 10) / 2);
            
            attributesImproved[attrType as AttributeType] = attribute.value - oldValue;
          }
        }
      }
      
      // Skills
      if (milestone.rewards.skills) {
        for (const [skillName, value] of Object.entries(milestone.rewards.skills)) {
          const skill = progression.skills.find(s => s.name === skillName);
          
          if (skill) {
            const oldLevel = skill.level;
            skill.level = Math.min(skill.level + value, this.config.skillProgression.maxLevel);
            
            // Update experience to next level
            if (typeof this.config.skillProgression.experiencePerLevel === 'function') {
              skill.experienceToNextLevel = this.config.skillProgression.experiencePerLevel(skill.level);
            } else if (Array.isArray(this.config.skillProgression.experiencePerLevel) && 
                      skill.level < this.config.skillProgression.experiencePerLevel.length) {
              skill.experienceToNextLevel = this.config.skillProgression.experiencePerLevel[skill.level - 1];
            } else {
              skill.experienceToNextLevel = skill.level * 100; // Fallback
            }
            
            skillsImproved[skillName] = skill.level - oldLevel;
          }
        }
      }
      
      // Items
      if (milestone.rewards.items) {
        // Push items to the itemsGained array instead of reassigning
        itemsGained.push(...milestone.rewards.items);
        
        // Add items to inventory using the InventoryManager service
        const inventoryManager = InventoryManager.getInstance();
        for (const itemId of milestone.rewards.items) {
          try {
            await inventoryManager.addItem(characterId, itemId, 1);
          } catch (error) {
            console.error(`Error adding item ${itemId} to inventory:`, error);
          }
        }
      }
    }
    
    // Save progression
    await this.saveProgression(progression);
    
    // Create result
    const result: MilestoneCompletionResult = {
      success: true,
      milestoneId,
      experienceGained,
      attributesImproved,
      skillsImproved,
      itemsGained,
      message: `Completed milestone: ${milestone.name}`
    };
    
    // Emit event
    this.emitEvent({
      type: 'milestone_completion',
      characterId,
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  }

  /**
   * Add a new skill to a character
   */
  public async addSkill(
    characterId: string,
    name: string,
    category: SkillCategory,
    relatedAttributes: AttributeType[],
    description?: string
  ): Promise<Skill | null> {
    const progression = await this.getProgression(characterId);
    
    // Check if skill already exists
    if (progression.skills.some(s => s.name === name)) {
      console.error(`Skill ${name} already exists`);
      return null;
    }
    
    // Create new skill
    const newSkill: Skill = {
      id: uuidv4(),
      name,
      category,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      relatedAttributes,
      proficient: false,
      expertise: false,
      description
    };
    
    // Add to skills
    progression.skills.push(newSkill);
    
    // Save progression
    await this.saveProgression(progression);
    
    return newSkill;
  }

  /**
   * Add a new milestone to a character
   */
  public async addMilestone(
    characterId: string,
    type: MilestoneType,
    name: string,
    description: string,
    rewards?: Milestone['rewards']
  ): Promise<Milestone | null> {
    const progression = await this.getProgression(characterId);
    
    // Create new milestone
    const newMilestone: Milestone = {
      id: uuidv4(),
      type,
      name,
      description,
      completed: false,
      rewards
    };
    
    // Add to milestones
    progression.milestones.push(newMilestone);
    
    // Save progression
    await this.saveProgression(progression);
    
    return newMilestone;
  }

  /**
   * Get a character's level
   */
  public async getCharacterLevel(characterId: string): Promise<number> {
    const progression = await this.getProgression(characterId);
    return progression.level;
  }

  /**
   * Get a character's experience
   */
  public async getCharacterExperience(characterId: string): Promise<{
    current: number;
    toNextLevel: number;
    total: number;
  }> {
    const progression = await this.getProgression(characterId);
    
    return {
      current: progression.experience,
      toNextLevel: progression.experienceToNextLevel,
      total: progression.experience
    };
  }

  /**
   * Get a character's attributes
   */
  public async getCharacterAttributes(characterId: string): Promise<Attribute[]> {
    const progression = await this.getProgression(characterId);
    return progression.attributes;
  }

  /**
   * Get a character's skills
   */
  public async getCharacterSkills(characterId: string): Promise<Skill[]> {
    const progression = await this.getProgression(characterId);
    return progression.skills;
  }

  /**
   * Get a character's milestones
   */
  public async getCharacterMilestones(characterId: string): Promise<Milestone[]> {
    const progression = await this.getProgression(characterId);
    return progression.milestones;
  }

  /**
   * Get a character's unspent points
   */
  public async getUnspentPoints(characterId: string): Promise<{
    attributePoints: number;
    skillPoints: number;
  }> {
    const progression = await this.getProgression(characterId);
    
    return {
      attributePoints: progression.unspentAttributePoints,
      skillPoints: progression.unspentSkillPoints
    };
  }

  /**
   * Add an event listener
   */
  public addEventListener(listener: (event: ProgressionEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove an event listener
   */
  public removeEventListener(listener: (event: ProgressionEvent) => void): void {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  /**
   * Emit an event
   */
  private emitEvent(event: ProgressionEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in progression event listener:', error);
      }
    });
  }
}

// Export a singleton instance
export const characterProgressionService = CharacterProgressionService.getInstance();