const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Get the electron version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const electronVersion = packageJson.devDependencies.electron.replace('^', '');

console.log(`Rebuilding sqlite3 for Electron version ${electronVersion}`);

// Determine platform-specific settings
const platform = os.platform();

try {
  // First, try using electron-rebuild
  console.log('Attempting to rebuild with electron-rebuild...');
  try {
    execSync(`npx electron-rebuild -f -w sqlite3 -v ${electronVersion}`, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  } catch (rebuildError) {
    console.warn('electron-rebuild failed, trying alternative method...');
    
    // If electron-rebuild fails, try using node-gyp directly
    if (platform === 'win32') {
      // Windows
      execSync('npm rebuild sqlite3 --build-from-source --runtime=electron --target=' + 
        electronVersion + ' --dist-url=https://electronjs.org/headers --msvs_version=2019', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
    } else {
      // macOS and Linux
      execSync('npm rebuild sqlite3 --build-from-source --runtime=electron --target=' + 
        electronVersion + ' --dist-url=https://electronjs.org/headers', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
    }
  }
  
  // Create a symbolic link to the compiled module in the dist directory
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  const distPath = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  // Find the compiled sqlite3 binary
  const sqlite3Path = path.join(nodeModulesPath, 'sqlite3', 'lib', 'binding');
  
  if (fs.existsSync(sqlite3Path)) {
    const bindingDirs = fs.readdirSync(sqlite3Path);
    
    if (bindingDirs.length > 0) {
      const bindingDir = bindingDirs[0]; // Use the first binding directory found
      const sourcePath = path.join(sqlite3Path, bindingDir, 'node_sqlite3.node');
      const targetPath = path.join(distPath, 'node_sqlite3.node');
      
      if (fs.existsSync(sourcePath)) {
        // Copy the file instead of creating a symlink (more reliable)
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied SQLite3 binary from ${sourcePath} to ${targetPath}`);
      } else {
        console.warn(`SQLite3 binary not found at ${sourcePath}`);
      }
    } else {
      console.warn('No binding directories found in sqlite3/lib/binding');
    }
  } else {
    console.warn(`SQLite3 binding path not found at ${sqlite3Path}`);
  }
  
  console.log('SQLite3 rebuild process completed!');
} catch (error) {
  console.error('Failed to rebuild SQLite3:', error);
  process.exit(1);
}