import { app, BrowserWindow, ipcMain, dialog, session } from 'electron';
import * as path from 'path';
import * as os from 'os';
import { initializeDatabase } from './database/sqlite';
import { setupApiHandlers } from './api/api-handlers';
import { setupGeminiService } from './api/gemini';
import { setupOpenRouterService } from './api/openrouter';
import { setupAiGenerationService } from './api/ai-generation';
import { setupApiKeyManager } from './services/api-key-manager';

// Set app name for Linux
if (process.platform === 'linux') {
  app.setName('immersive-rpg-storytelling-platform');
  
  // Fix for Wayland on some Linux distributions
  app.commandLine.appendSwitch('enable-features', 'WaylandWindowDecorations');
  app.commandLine.appendSwitch('ozone-platform-hint', 'auto');
  
  // Fix for hardware acceleration issues on some Linux systems
  if (process.env.DISABLE_GPU) {
    app.disableHardwareAcceleration();
    app.commandLine.appendSwitch('disable-gpu');
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
try {
  if (process.platform === 'win32' && require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (error) {
  console.warn('electron-squirrel-startup not available:', error);
}

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
    },
    show: false,
    // Linux-specific options
    ...(process.platform === 'linux' ? {
      icon: path.join(__dirname, '../../assets/icons/png/512x512.png'),
      // Better integration with desktop environments
      autoHideMenuBar: false,
    } : {}),
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Show window when ready to prevent flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  // Handle Linux-specific window behavior
  if (process.platform === 'linux') {
    // Fix for some Linux window managers
    mainWindow.setMenuBarVisibility(true);
    
    // Fix for screen tearing on some Linux distributions
    mainWindow.on('resize', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.invalidate();
      }
    });
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Setup API key manager
    setupApiKeyManager();
    
    // Setup API services
    setupGeminiService();
    setupOpenRouterService();
    
    // Setup AI generation service
    setupAiGenerationService();
    
    // Setup IPC handlers
    setupApiHandlers();
    
    // Create the main window
    createWindow();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    dialog.showErrorBox(
      'Initialization Error',
      `Failed to initialize the application: ${error instanceof Error ? error.message : String(error)}`
    );
    app.quit();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle IPC messages from the renderer process
ipcMain.handle('app:get-path', (_, name: string) => {
  return app.getPath(name as any);
});

// Exit cleanly on request from parent process in development mode.
if (process.env.NODE_ENV === 'development') {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}