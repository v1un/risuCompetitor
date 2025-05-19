import { safeStorage, ipcMain } from 'electron';
import { getDatabase } from '../database/sqlite';
import { v4 as uuidv4 } from 'uuid';

// Service types
export type ApiService = 'gemini' | 'openrouter';

// Setup IPC handlers for API key management
export function setupApiKeyManager(): void {
  // Save API key
  ipcMain.handle('api-key:save', async (_, service: ApiService, apiKey: string) => {
    try {
      await saveApiKey(service, apiKey);
      return { success: true };
    } catch (error) {
      console.error(`Error saving ${service} API key:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Check if API key exists
  ipcMain.handle('api-key:exists', async (_, service: ApiService) => {
    try {
      const exists = await apiKeyExists(service);
      return { success: true, exists };
    } catch (error) {
      console.error(`Error checking if ${service} API key exists:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
  
  // Delete API key
  ipcMain.handle('api-key:delete', async (_, service: ApiService) => {
    try {
      await deleteApiKey(service);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting ${service} API key:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  });
}

// Save API key to the database
export async function saveApiKey(service: ApiService, apiKey: string): Promise<void> {
  // Validate inputs
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('API key cannot be empty');
  }
  
  if (!['gemini', 'openrouter'].includes(service)) {
    throw new Error('Invalid service type');
  }
  
  const db = getDatabase();
  
  // Encrypt the API key
  const encryptedKey = safeStorage.encryptString(apiKey.trim());
  
  // Convert the encrypted Buffer to a hex string for storage
  const encryptedKeyHex = encryptedKey.toString('hex');
  
  // Check if the key already exists
  const existingKey = await db.get('SELECT service FROM api_keys WHERE service = ?', service);
  
  if (existingKey) {
    // Update existing key
    await db.run(
      'UPDATE api_keys SET encrypted_key = ?, modified_at = CURRENT_TIMESTAMP WHERE service = ?',
      encryptedKeyHex, service
    );
  } else {
    // Insert new key
    await db.run(
      'INSERT INTO api_keys (service, encrypted_key) VALUES (?, ?)',
      service, encryptedKeyHex
    );
  }
}

// Check if API key exists
export async function apiKeyExists(service: ApiService): Promise<boolean> {
  const db = getDatabase();
  const result = await db.get('SELECT service FROM api_keys WHERE service = ?', service);
  return !!result;
}

// Delete API key
export async function deleteApiKey(service: ApiService): Promise<void> {
  const db = getDatabase();
  await db.run('DELETE FROM api_keys WHERE service = ?', service);
}

// Get API key (for internal use only)
export async function getApiKey(service: ApiService): Promise<string | null> {
  const db = getDatabase();
  
  const result = await db.get('SELECT encrypted_key FROM api_keys WHERE service = ?', service);
  
  if (!result) {
    return null;
  }
  
  try {
    // Convert the hex string back to a Buffer
    const encryptedKey = Buffer.from(result.encrypted_key, 'hex');
    
    // Decrypt the API key
    return safeStorage.decryptString(encryptedKey);
  } catch (error) {
    console.error(`Error decrypting ${service} API key:`, error);
    return null;
  }
}