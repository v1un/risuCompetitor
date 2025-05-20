/**
 * inventory.ts
 * Types for the inventory management system
 */

// Item rarity levels
export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  ARTIFACT = 'artifact',
}

// Item categories
export enum ItemCategory {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  QUEST = 'quest',
  MATERIAL = 'material',
  MISCELLANEOUS = 'miscellaneous',
}

// Equipment slots
export enum EquipmentSlot {
  HEAD = 'head',
  NECK = 'neck',
  SHOULDERS = 'shoulders',
  CHEST = 'chest',
  BACK = 'back',
  WRISTS = 'wrists',
  HANDS = 'hands',
  WAIST = 'waist',
  LEGS = 'legs',
  FEET = 'feet',
  FINGER_1 = 'finger_1',
  FINGER_2 = 'finger_2',
  TRINKET_1 = 'trinket_1',
  TRINKET_2 = 'trinket_2',
  MAIN_HAND = 'main_hand',
  OFF_HAND = 'off_hand',
  TWO_HAND = 'two_hand',
  RANGED = 'ranged',
}

// Item property types
export enum ItemPropertyType {
  DAMAGE = 'damage',
  DEFENSE = 'defense',
  ATTRIBUTE = 'attribute',
  SKILL = 'skill',
  RESISTANCE = 'resistance',
  SPECIAL = 'special',
}

// Item property
export interface ItemProperty {
  type: ItemPropertyType;
  name: string;
  value: number | string;
  description?: string;
}

// Base item interface
export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  value: number; // Gold value
  weight: number; // Weight in pounds/kg
  imageUrl?: string;
  properties: ItemProperty[];
  stackable: boolean;
  maxStackSize?: number;
  usable: boolean;
  consumable: boolean;
  questItem: boolean;
  tags: string[];
  lore?: string;
  requiredLevel?: number;
}

// Equipment item interface
export interface EquipmentItem extends Item {
  equipmentSlot: EquipmentSlot;
  durability?: {
    current: number;
    max: number;
  };
  requirements?: {
    strength?: number;
    dexterity?: number;
    intelligence?: number;
    level?: number;
    class?: string[];
    race?: string[];
  };
}

// Weapon item interface
export interface WeaponItem extends EquipmentItem {
  category: ItemCategory.WEAPON;
  damage: {
    min: number;
    max: number;
    type: string;
  };
  attackSpeed: number;
  range: number;
  twoHanded: boolean;
}

// Armor item interface
export interface ArmorItem extends EquipmentItem {
  category: ItemCategory.ARMOR;
  defense: number;
  armorType: 'light' | 'medium' | 'heavy';
}

// Consumable item interface
export interface ConsumableItem extends Item {
  category: ItemCategory.CONSUMABLE;
  usable: true;
  consumable: true;
  effects: {
    type: string;
    value: number;
    duration?: number;
  }[];
  cooldown?: number;
}

// Inventory slot interface
export interface InventorySlot {
  id: string;
  item: Item | null;
  quantity: number;
  locked: boolean;
}

// Character inventory interface
export interface CharacterInventory {
  id: string;
  characterId: string;
  gold: number;
  maxSlots: number;
  slots: InventorySlot[];
  equipped: Partial<Record<EquipmentSlot, EquipmentItem>>;
}

// Loot table interface
export interface LootTableEntry {
  itemId: string;
  weight: number; // Probability weight
  minQuantity: number;
  maxQuantity: number;
  condition?: {
    minLevel?: number;
    maxLevel?: number;
    requiredTags?: string[];
    chance: number; // 0-1 probability
  };
}

export interface LootTable {
  id: string;
  name: string;
  description?: string;
  entries: LootTableEntry[];
  guaranteedDrops?: string[]; // Item IDs that always drop
  minDrops: number;
  maxDrops: number;
  tags: string[];
}

// Item database interface
export interface ItemDatabase {
  items: Record<string, Item>;
  lootTables: Record<string, LootTable>;
}

// Item generation options
export interface ItemGenerationOptions {
  category?: ItemCategory;
  rarity?: ItemRarity;
  level?: number;
  tags?: string[];
}

// Inventory action types
export enum InventoryActionType {
  ADD_ITEM = 'add_item',
  REMOVE_ITEM = 'remove_item',
  MOVE_ITEM = 'move_item',
  EQUIP_ITEM = 'equip_item',
  UNEQUIP_ITEM = 'unequip_item',
  USE_ITEM = 'use_item',
  STACK_ITEM = 'stack_item',
  SPLIT_STACK = 'split_stack',
  ADD_GOLD = 'add_gold',
  REMOVE_GOLD = 'remove_gold',
  SORT_INVENTORY = 'sort_inventory',
  LOCK_SLOT = 'lock_slot',
  UNLOCK_SLOT = 'unlock_slot',
}