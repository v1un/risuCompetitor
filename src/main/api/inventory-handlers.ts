import { ipcMain } from 'electron';
import { getDatabase } from '../database/sqlite';
import { v4 as uuidv4 } from 'uuid';

// Setup inventory handlers
export function setupInventoryHandlers(): void {
  // Get all items
  ipcMain.handle('inventory:get-items', async () => {
    try {
      const db = getDatabase();
      const items = await db.all('SELECT * FROM items');
      
      // Convert to a record with item ID as key
      const itemsRecord: Record<string, any> = {};
      items.forEach(item => {
        // Parse JSON data
        const parsedItem = {
          ...item,
          properties: item.properties ? JSON.parse(item.properties) : [],
          tags: item.tags ? JSON.parse(item.tags) : []
        };
        itemsRecord[item.id] = parsedItem;
      });
      
      return { success: true, items: itemsRecord };
    } catch (error) {
      console.error('Error getting items:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Get all loot tables
  ipcMain.handle('inventory:get-loot-tables', async () => {
    try {
      const db = getDatabase();
      const lootTables = await db.all('SELECT * FROM loot_tables');
      
      // Convert to a record with loot table ID as key
      const lootTablesRecord: Record<string, any> = {};
      lootTables.forEach(table => {
        // Parse JSON data
        const parsedTable = {
          ...table,
          entries: table.entries ? JSON.parse(table.entries) : [],
          guaranteedDrops: table.guaranteed_drops ? JSON.parse(table.guaranteed_drops) : [],
          tags: table.tags ? JSON.parse(table.tags) : []
        };
        lootTablesRecord[table.id] = parsedTable;
      });
      
      return { success: true, lootTables: lootTablesRecord };
    } catch (error) {
      console.error('Error getting loot tables:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Get inventory by character ID
  ipcMain.handle('inventory:get', async (_, characterId: string) => {
    try {
      const db = getDatabase();
      const inventory = await db.get('SELECT * FROM inventories WHERE character_id = ?', characterId);
      
      if (!inventory) {
        return { success: true, inventory: null };
      }
      
      // Get inventory slots
      const slots = await db.all('SELECT * FROM inventory_slots WHERE inventory_id = ?', inventory.id);
      
      // Get equipped items
      const equipped = await db.all('SELECT * FROM equipped_items WHERE inventory_id = ?', inventory.id);
      
      // Parse JSON data and format the inventory
      const formattedInventory = {
        id: inventory.id,
        characterId: inventory.character_id,
        gold: inventory.gold,
        maxSlots: inventory.max_slots,
        slots: slots.map(slot => ({
          id: slot.id,
          item: slot.item_id ? JSON.parse(slot.item_data) : null,
          quantity: slot.quantity,
          locked: Boolean(slot.locked)
        })),
        equipped: {}
      };
      
      // Add equipped items
      equipped.forEach(item => {
        formattedInventory.equipped[item.slot] = JSON.parse(item.item_data);
      });
      
      return { success: true, inventory: formattedInventory };
    } catch (error) {
      console.error('Error getting inventory:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Save inventory
  ipcMain.handle('inventory:save', async (_, inventory: any) => {
    try {
      const db = getDatabase();
      
      // Check if inventory exists
      const existingInventory = await db.get(
        'SELECT id FROM inventories WHERE id = ?', 
        inventory.id
      );
      
      if (existingInventory) {
        // Update existing inventory
        await db.run(
          `UPDATE inventories SET
            character_id = ?, gold = ?, max_slots = ?,
            modified_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          inventory.characterId,
          inventory.gold,
          inventory.maxSlots,
          inventory.id
        );
      } else {
        // Create new inventory
        await db.run(
          `INSERT INTO inventories (
            id, character_id, gold, max_slots, created_at, modified_at
          ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          inventory.id,
          inventory.characterId,
          inventory.gold,
          inventory.maxSlots
        );
      }
      
      // Delete existing slots and equipped items
      await db.run('DELETE FROM inventory_slots WHERE inventory_id = ?', inventory.id);
      await db.run('DELETE FROM equipped_items WHERE inventory_id = ?', inventory.id);
      
      // Insert slots
      for (const slot of inventory.slots) {
        await db.run(
          `INSERT INTO inventory_slots (
            id, inventory_id, item_id, item_data, quantity, locked
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          slot.id,
          inventory.id,
          slot.item ? slot.item.id : null,
          slot.item ? JSON.stringify(slot.item) : null,
          slot.quantity,
          slot.locked ? 1 : 0
        );
      }
      
      // Insert equipped items
      for (const [slotName, item] of Object.entries(inventory.equipped)) {
        await db.run(
          `INSERT INTO equipped_items (
            inventory_id, slot, item_id, item_data
          ) VALUES (?, ?, ?, ?)`,
          inventory.id,
          slotName,
          (item as any).id,
          JSON.stringify(item)
        );
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error saving inventory:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
}