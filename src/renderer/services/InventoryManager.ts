/**
 * InventoryManager.ts
 * Service for managing character inventories, items, and equipment
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Item,
  EquipmentItem,
  InventorySlot,
  CharacterInventory,
  EquipmentSlot,
  ItemCategory,
  ItemRarity,
  LootTable,
  LootTableEntry,
  ItemGenerationOptions,
  InventoryActionType,
  ItemDatabase
} from '../../shared/types/inventory';

// Event types for inventory changes
export interface InventoryEvent {
  type: InventoryActionType;
  inventoryId: string;
  characterId: string;
  itemId?: string;
  slotId?: string;
  targetSlotId?: string;
  equipmentSlot?: EquipmentSlot;
  quantity?: number;
  gold?: number;
  timestamp: number;
}

export class InventoryManager {
  private static instance: InventoryManager;
  private itemDatabase: ItemDatabase = { items: {}, lootTables: {} };
  private inventories: Record<string, CharacterInventory> = {};
  private eventListeners: ((event: InventoryEvent) => void)[] = [];

  private constructor() {
    // Private constructor for singleton pattern
    this.loadItemDatabase();
  }

  public static getInstance(): InventoryManager {
    if (!InventoryManager.instance) {
      InventoryManager.instance = new InventoryManager();
    }
    return InventoryManager.instance;
  }

  /**
   * Load the item database from storage
   */
  private async loadItemDatabase(): Promise<void> {
    try {
      // In a real implementation, this would load from the database
      // For now, we'll use a placeholder
      console.log('Loading item database...');
      
      // We would fetch this from the database in a real implementation
      this.itemDatabase = {
        items: {},
        lootTables: {}
      };
      
      // Load from database using IPC
      const result = await window.api.inventory.getItems();
      if (result.success) {
        this.itemDatabase.items = result.items;
      }
      
      const lootTablesResult = await window.api.inventory.getLootTables();
      if (lootTablesResult.success) {
        this.itemDatabase.lootTables = lootTablesResult.lootTables;
      }
      
      console.log(`Loaded ${Object.keys(this.itemDatabase.items).length} items and ${Object.keys(this.itemDatabase.lootTables).length} loot tables`);
    } catch (error) {
      console.error('Error loading item database:', error);
    }
  }

  /**
   * Get an inventory by character ID, creating it if it doesn't exist
   */
  public async getInventory(characterId: string): Promise<CharacterInventory> {
    // Check if we already have it in memory
    const existingInventory = Object.values(this.inventories).find(
      inv => inv.characterId === characterId
    );
    
    if (existingInventory) {
      return existingInventory;
    }
    
    // Try to load from database
    try {
      const result = await window.api.inventory.getInventory(characterId);
      
      if (result.success && result.inventory) {
        this.inventories[result.inventory.id] = result.inventory;
        return result.inventory;
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
    
    // Create a new inventory if not found
    const newInventory: CharacterInventory = {
      id: uuidv4(),
      characterId,
      gold: 0,
      maxSlots: 20,
      slots: Array(20).fill(null).map(() => ({
        id: uuidv4(),
        item: null,
        quantity: 0,
        locked: false
      })),
      equipped: {}
    };
    
    this.inventories[newInventory.id] = newInventory;
    
    // Save to database
    try {
      await window.api.inventory.saveInventory(newInventory);
    } catch (error) {
      console.error('Error saving new inventory:', error);
    }
    
    return newInventory;
  }

  /**
   * Save an inventory to the database
   */
  private async saveInventory(inventory: CharacterInventory): Promise<void> {
    try {
      await window.api.inventory.saveInventory(inventory);
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  }

  /**
   * Add an item to a character's inventory
   */
  public async addItem(
    characterId: string,
    itemId: string,
    quantity: number = 1
  ): Promise<boolean> {
    const inventory = await this.getInventory(characterId);
    const item = this.getItem(itemId);
    
    if (!item) {
      console.error(`Item with ID ${itemId} not found`);
      return false;
    }
    
    // Check if the item is stackable and if we already have it
    if (item.stackable) {
      const existingSlot = inventory.slots.find(
        slot => slot.item && slot.item.id === itemId && slot.quantity < (item.maxStackSize || 99)
      );
      
      if (existingSlot) {
        const newQuantity = Math.min(
          existingSlot.quantity + quantity,
          item.maxStackSize || 99
        );
        const added = newQuantity - existingSlot.quantity;
        existingSlot.quantity = newQuantity;
        
        // If we couldn't add all items, try to add the rest to a new slot
        if (added < quantity) {
          return this.addItem(characterId, itemId, quantity - added);
        }
        
        await this.saveInventory(inventory);
        this.emitEvent({
          type: InventoryActionType.STACK_ITEM,
          inventoryId: inventory.id,
          characterId,
          itemId,
          slotId: existingSlot.id,
          quantity: added,
          timestamp: Date.now()
        });
        
        return true;
      }
    }
    
    // Find an empty slot
    const emptySlot = inventory.slots.find(slot => !slot.item && !slot.locked);
    
    if (!emptySlot) {
      console.error('No empty slots in inventory');
      return false;
    }
    
    // Add the item to the empty slot
    emptySlot.item = item;
    emptySlot.quantity = quantity;
    
    await this.saveInventory(inventory);
    this.emitEvent({
      type: InventoryActionType.ADD_ITEM,
      inventoryId: inventory.id,
      characterId,
      itemId,
      slotId: emptySlot.id,
      quantity,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Remove an item from a character's inventory
   */
  public async removeItem(
    characterId: string,
    slotId: string,
    quantity: number = 1
  ): Promise<boolean> {
    const inventory = await this.getInventory(characterId);
    const slot = inventory.slots.find(s => s.id === slotId);
    
    if (!slot || !slot.item) {
      console.error(`Slot ${slotId} not found or empty`);
      return false;
    }
    
    const itemId = slot.item.id;
    
    if (slot.quantity <= quantity) {
      // Remove the entire stack
      slot.item = null;
      slot.quantity = 0;
    } else {
      // Remove part of the stack
      slot.quantity -= quantity;
    }
    
    await this.saveInventory(inventory);
    this.emitEvent({
      type: InventoryActionType.REMOVE_ITEM,
      inventoryId: inventory.id,
      characterId,
      itemId,
      slotId,
      quantity,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Move an item from one slot to another
   */
  public async moveItem(
    characterId: string,
    sourceSlotId: string,
    targetSlotId: string,
    quantity: number = 0 // 0 means all
  ): Promise<boolean> {
    const inventory = await this.getInventory(characterId);
    const sourceSlot = inventory.slots.find(s => s.id === sourceSlotId);
    const targetSlot = inventory.slots.find(s => s.id === targetSlotId);
    
    if (!sourceSlot || !targetSlot) {
      console.error('Source or target slot not found');
      return false;
    }
    
    if (!sourceSlot.item) {
      console.error('Source slot is empty');
      return false;
    }
    
    if (targetSlot.locked) {
      console.error('Target slot is locked');
      return false;
    }
    
    // If quantity is 0, move all
    const moveQuantity = quantity === 0 ? sourceSlot.quantity : Math.min(quantity, sourceSlot.quantity);
    
    // If target slot is empty, simply move the item
    if (!targetSlot.item) {
      targetSlot.item = sourceSlot.item;
      targetSlot.quantity = moveQuantity;
      
      if (moveQuantity === sourceSlot.quantity) {
        sourceSlot.item = null;
        sourceSlot.quantity = 0;
      } else {
        sourceSlot.quantity -= moveQuantity;
      }
    } else {
      // If target slot has the same item and is stackable, stack them
      if (targetSlot.item.id === sourceSlot.item.id && targetSlot.item.stackable) {
        const maxStack = targetSlot.item.maxStackSize || 99;
        const spaceInTarget = maxStack - targetSlot.quantity;
        const amountToMove = Math.min(moveQuantity, spaceInTarget);
        
        targetSlot.quantity += amountToMove;
        
        if (amountToMove === sourceSlot.quantity) {
          sourceSlot.item = null;
          sourceSlot.quantity = 0;
        } else {
          sourceSlot.quantity -= amountToMove;
        }
      } else {
        // Swap the items
        const tempItem = targetSlot.item;
        const tempQuantity = targetSlot.quantity;
        
        targetSlot.item = sourceSlot.item;
        targetSlot.quantity = sourceSlot.quantity;
        
        sourceSlot.item = tempItem;
        sourceSlot.quantity = tempQuantity;
      }
    }
    
    await this.saveInventory(inventory);
    this.emitEvent({
      type: InventoryActionType.MOVE_ITEM,
      inventoryId: inventory.id,
      characterId,
      slotId: sourceSlotId,
      targetSlotId,
      quantity: moveQuantity,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Equip an item from inventory
   */
  public async equipItem(
    characterId: string,
    slotId: string
  ): Promise<boolean> {
    const inventory = await this.getInventory(characterId);
    const slot = inventory.slots.find(s => s.id === slotId);
    
    if (!slot || !slot.item) {
      console.error('Slot not found or empty');
      return false;
    }
    
    const item = slot.item as EquipmentItem;
    
    // Check if the item is equipment
    if (
      item.category !== ItemCategory.WEAPON &&
      item.category !== ItemCategory.ARMOR &&
      item.category !== ItemCategory.ACCESSORY
    ) {
      console.error('Item is not equipment');
      return false;
    }
    
    // Get the equipment slot
    const equipSlot = (item as EquipmentItem).equipmentSlot;
    
    // Handle two-handed weapons
    if (equipSlot === EquipmentSlot.TWO_HAND) {
      // Unequip main hand and off hand if they exist
      if (inventory.equipped[EquipmentSlot.MAIN_HAND]) {
        await this.unequipItem(characterId, EquipmentSlot.MAIN_HAND);
      }
      if (inventory.equipped[EquipmentSlot.OFF_HAND]) {
        await this.unequipItem(characterId, EquipmentSlot.OFF_HAND);
      }
    } else if (
      (equipSlot === EquipmentSlot.MAIN_HAND || equipSlot === EquipmentSlot.OFF_HAND) &&
      inventory.equipped[EquipmentSlot.TWO_HAND]
    ) {
      // Unequip two-handed weapon if equipping main or off hand
      await this.unequipItem(characterId, EquipmentSlot.TWO_HAND);
    }
    
    // Unequip current item in that slot if any
    if (inventory.equipped[equipSlot]) {
      await this.unequipItem(characterId, equipSlot);
    }
    
    // Equip the new item
    inventory.equipped[equipSlot] = item;
    
    // Remove from inventory
    slot.item = null;
    slot.quantity = 0;
    
    await this.saveInventory(inventory);
    this.emitEvent({
      type: InventoryActionType.EQUIP_ITEM,
      inventoryId: inventory.id,
      characterId,
      itemId: item.id,
      slotId,
      equipmentSlot: equipSlot,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Unequip an item to inventory
   */
  public async unequipItem(
    characterId: string,
    equipmentSlot: EquipmentSlot
  ): Promise<boolean> {
    const inventory = await this.getInventory(characterId);
    const equippedItem = inventory.equipped[equipmentSlot];
    
    if (!equippedItem) {
      console.error(`No item equipped in ${equipmentSlot}`);
      return false;
    }
    
    // Find an empty slot in inventory
    const emptySlot = inventory.slots.find(slot => !slot.item && !slot.locked);
    
    if (!emptySlot) {
      console.error('No empty slots in inventory');
      return false;
    }
    
    // Move item to inventory
    emptySlot.item = equippedItem;
    emptySlot.quantity = 1;
    
    // Remove from equipped
    delete inventory.equipped[equipmentSlot];
    
    await this.saveInventory(inventory);
    this.emitEvent({
      type: InventoryActionType.UNEQUIP_ITEM,
      inventoryId: inventory.id,
      characterId,
      itemId: equippedItem.id,
      slotId: emptySlot.id,
      equipmentSlot,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Use an item from inventory
   */
  public async useItem(
    characterId: string,
    slotId: string
  ): Promise<boolean> {
    const inventory = await this.getInventory(characterId);
    const slot = inventory.slots.find(s => s.id === slotId);
    
    if (!slot || !slot.item) {
      console.error('Slot not found or empty');
      return false;
    }
    
    const item = slot.item;
    
    if (!item.usable) {
      console.error('Item is not usable');
      return false;
    }
    
    // Apply item effects (this would be handled by the game system)
    console.log(`Using item: ${item.name}`);
    
    // If consumable, reduce quantity
    if (item.consumable) {
      if (slot.quantity <= 1) {
        slot.item = null;
        slot.quantity = 0;
      } else {
        slot.quantity -= 1;
      }
    }
    
    await this.saveInventory(inventory);
    this.emitEvent({
      type: InventoryActionType.USE_ITEM,
      inventoryId: inventory.id,
      characterId,
      itemId: item.id,
      slotId,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Split a stack of items
   */
  public async splitStack(
    characterId: string,
    slotId: string,
    quantity: number
  ): Promise<boolean> {
    const inventory = await this.getInventory(characterId);
    const slot = inventory.slots.find(s => s.id === slotId);
    
    if (!slot || !slot.item) {
      console.error('Slot not found or empty');
      return false;
    }
    
    if (!slot.item.stackable) {
      console.error('Item is not stackable');
      return false;
    }
    
    if (slot.quantity <= quantity) {
      console.error('Not enough items to split');
      return false;
    }
    
    // Find an empty slot
    const emptySlot = inventory.slots.find(s => !s.item && !s.locked);
    
    if (!emptySlot) {
      console.error('No empty slots in inventory');
      return false;
    }
    
    // Split the stack
    emptySlot.item = slot.item;
    emptySlot.quantity = quantity;
    slot.quantity -= quantity;
    
    await this.saveInventory(inventory);
    this.emitEvent({
      type: InventoryActionType.SPLIT_STACK,
      inventoryId: inventory.id,
      characterId,
      itemId: slot.item.id,
      slotId,
      targetSlotId: emptySlot.id,
      quantity,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Add gold to a character's inventory
   */
  public async addGold(
    characterId: string,
    amount: number
  ): Promise<boolean> {
    if (amount <= 0) {
      console.error('Amount must be positive');
      return false;
    }
    
    const inventory = await this.getInventory(characterId);
    inventory.gold += amount;
    
    await this.saveInventory(inventory);
    this.emitEvent({
      type: InventoryActionType.ADD_GOLD,
      inventoryId: inventory.id,
      characterId,
      gold: amount,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Remove gold from a character's inventory
   */
  public async removeGold(
    characterId: string,
    amount: number
  ): Promise<boolean> {
    if (amount <= 0) {
      console.error('Amount must be positive');
      return false;
    }
    
    const inventory = await this.getInventory(characterId);
    
    if (inventory.gold < amount) {
      console.error('Not enough gold');
      return false;
    }
    
    inventory.gold -= amount;
    
    await this.saveInventory(inventory);
    this.emitEvent({
      type: InventoryActionType.REMOVE_GOLD,
      inventoryId: inventory.id,
      characterId,
      gold: amount,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Sort inventory by category, rarity, and name
   */
  public async sortInventory(
    characterId: string
  ): Promise<boolean> {
    const inventory = await this.getInventory(characterId);
    
    // Create a copy of slots with items
    const itemSlots = inventory.slots
      .filter(slot => slot.item)
      .sort((a, b) => {
        if (!a.item || !b.item) return 0;
        
        // Sort by category
        if (a.item.category !== b.item.category) {
          return a.item.category.localeCompare(b.item.category);
        }
        
        // Sort by rarity (highest first)
        const rarityOrder = Object.values(ItemRarity).reverse();
        const aRarityIndex = rarityOrder.indexOf(a.item.rarity);
        const bRarityIndex = rarityOrder.indexOf(b.item.rarity);
        
        if (aRarityIndex !== bRarityIndex) {
          return aRarityIndex - bRarityIndex;
        }
        
        // Sort by name
        return a.item.name.localeCompare(b.item.name);
      });
    
    // Create a copy of empty slots
    const emptySlots = inventory.slots.filter(slot => !slot.item);
    
    // Combine sorted items with empty slots
    const newSlots = [...itemSlots, ...emptySlots];
    
    // Update inventory slots
    inventory.slots = newSlots;
    
    await this.saveInventory(inventory);
    this.emitEvent({
      type: InventoryActionType.SORT_INVENTORY,
      inventoryId: inventory.id,
      characterId,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Lock a slot to prevent items from being placed in it
   */
  public async lockSlot(
    characterId: string,
    slotId: string
  ): Promise<boolean> {
    const inventory = await this.getInventory(characterId);
    const slot = inventory.slots.find(s => s.id === slotId);
    
    if (!slot) {
      console.error('Slot not found');
      return false;
    }
    
    slot.locked = true;
    
    await this.saveInventory(inventory);
    this.emitEvent({
      type: InventoryActionType.LOCK_SLOT,
      inventoryId: inventory.id,
      characterId,
      slotId,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Unlock a slot
   */
  public async unlockSlot(
    characterId: string,
    slotId: string
  ): Promise<boolean> {
    const inventory = await this.getInventory(characterId);
    const slot = inventory.slots.find(s => s.id === slotId);
    
    if (!slot) {
      console.error('Slot not found');
      return false;
    }
    
    slot.locked = false;
    
    await this.saveInventory(inventory);
    this.emitEvent({
      type: InventoryActionType.UNLOCK_SLOT,
      inventoryId: inventory.id,
      characterId,
      slotId,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Generate loot from a loot table
   */
  public generateLoot(
    lootTableId: string,
    characterLevel: number = 1
  ): Item[] {
    const lootTable = this.getLootTable(lootTableId);
    
    if (!lootTable) {
      console.error(`Loot table ${lootTableId} not found`);
      return [];
    }
    
    const loot: Item[] = [];
    
    // Add guaranteed drops
    if (lootTable.guaranteedDrops) {
      for (const itemId of lootTable.guaranteedDrops) {
        const item = this.getItem(itemId);
        if (item) {
          loot.push(item);
        }
      }
    }
    
    // Determine number of drops
    const numDrops = Math.floor(
      Math.random() * (lootTable.maxDrops - lootTable.minDrops + 1) + lootTable.minDrops
    );
    
    // Calculate total weight
    const totalWeight = lootTable.entries.reduce((sum, entry) => {
      // Check level conditions
      if (
        entry.condition &&
        ((entry.condition.minLevel && characterLevel < entry.condition.minLevel) ||
         (entry.condition.maxLevel && characterLevel > entry.condition.maxLevel))
      ) {
        return sum;
      }
      
      return sum + entry.weight;
    }, 0);
    
    // Generate random drops
    for (let i = 0; i < numDrops; i++) {
      let randomValue = Math.random() * totalWeight;
      let selectedEntry: LootTableEntry | null = null;
      
      for (const entry of lootTable.entries) {
        // Check level conditions
        if (
          entry.condition &&
          ((entry.condition.minLevel && characterLevel < entry.condition.minLevel) ||
           (entry.condition.maxLevel && characterLevel > entry.condition.maxLevel))
        ) {
          continue;
        }
        
        // Check chance condition
        if (entry.condition && entry.condition.chance < Math.random()) {
          continue;
        }
        
        randomValue -= entry.weight;
        
        if (randomValue <= 0) {
          selectedEntry = entry;
          break;
        }
      }
      
      if (selectedEntry) {
        const item = this.getItem(selectedEntry.itemId);
        
        if (item) {
          // Determine quantity
          const quantity = Math.floor(
            Math.random() * (selectedEntry.maxQuantity - selectedEntry.minQuantity + 1) + selectedEntry.minQuantity
          );
          
          // Add to loot multiple times for quantity
          for (let j = 0; j < quantity; j++) {
            loot.push(item);
          }
        }
      }
    }
    
    return loot;
  }

  /**
   * Generate a random item based on options
   */
  public generateRandomItem(options: ItemGenerationOptions = {}): Item | null {
    // Filter items based on options
    let filteredItems = Object.values(this.itemDatabase.items);
    
    if (options.category) {
      filteredItems = filteredItems.filter(item => item.category === options.category);
    }
    
    if (options.rarity) {
      filteredItems = filteredItems.filter(item => item.rarity === options.rarity);
    }
    
    if (options.level) {
      filteredItems = filteredItems.filter(
        item => !item.requiredLevel || item.requiredLevel <= options.level!
      );
    }
    
    if (options.tags && options.tags.length > 0) {
      filteredItems = filteredItems.filter(
        item => options.tags!.some(tag => item.tags.includes(tag))
      );
    }
    
    if (filteredItems.length === 0) {
      return null;
    }
    
    // Select a random item
    const randomIndex = Math.floor(Math.random() * filteredItems.length);
    return filteredItems[randomIndex];
  }

  /**
   * Get an item by ID
   */
  public getItem(itemId: string): Item | null {
    return this.itemDatabase.items[itemId] || null;
  }

  /**
   * Get a loot table by ID
   */
  public getLootTable(lootTableId: string): LootTable | null {
    return this.itemDatabase.lootTables[lootTableId] || null;
  }

  /**
   * Get all items
   */
  public getAllItems(): Item[] {
    return Object.values(this.itemDatabase.items);
  }

  /**
   * Get all loot tables
   */
  public getAllLootTables(): LootTable[] {
    return Object.values(this.itemDatabase.lootTables);
  }

  /**
   * Add an event listener
   */
  public addEventListener(listener: (event: InventoryEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove an event listener
   */
  public removeEventListener(listener: (event: InventoryEvent) => void): void {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  /**
   * Emit an inventory event
   */
  private emitEvent(event: InventoryEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in inventory event listener:', error);
      }
    });
  }
}

// Export a singleton instance
export const inventoryManager = InventoryManager.getInstance();