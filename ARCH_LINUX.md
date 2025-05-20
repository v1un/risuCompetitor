# Arch Linux Installation and Troubleshooting Guide

This guide provides specific instructions for installing and running the Immersive RPG Storytelling Platform on Arch Linux and its derivatives (like Manjaro, EndeavourOS, etc.).

## Prerequisites

Ensure you have the following packages installed:

```bash
sudo pacman -S base-devel nodejs npm electron git
```

For native module support:

```bash
sudo pacman -S python sqlite
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/immersive-rpg-storytelling-platform.git
   cd immersive-rpg-storytelling-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Rebuild native modules for Electron:
   ```bash
   npm run rebuild-native
   ```

4. Start the application in development mode:
   ```bash
   npm run dev
   ```

## Building for Arch Linux

To create a pacman package:

```bash
npm run package:arch
```

The package will be available in the `dist` directory.

## Troubleshooting

### SQLite3 Native Module Issues

If you encounter issues with SQLite3 native modules, try:

```bash
npm run rebuild-native
```

If that doesn't work, you can try installing the sqlite3 module globally:

```bash
npm install -g sqlite3
```

### Hardware Acceleration Issues

If you experience graphical glitches or performance issues, try running the application with hardware acceleration disabled:

```bash
DISABLE_GPU=1 npm run dev
```

### Encryption Not Available

On some Linux distributions, the keyring service might not be available. The application will fall back to a simpler encoding method for storing API keys in development mode.

### Wayland Issues

If you're using Wayland and experiencing window decoration issues, try setting the following environment variable:

```bash
export ELECTRON_OZONE_PLATFORM_HINT=auto
```

## System Integration

### Desktop Entry

After installing the application, you can create a desktop entry for easier access:

```bash
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/immersive-rpg-storytelling.desktop << EOL
[Desktop Entry]
Name=Immersive RPG Storytelling Platform
Comment=AI-driven RPG Storytelling Platform
Exec=/path/to/immersive-rpg-storytelling-platform
Icon=/path/to/immersive-rpg-storytelling-platform/assets/icons/png/512x512.png
Terminal=false
Type=Application
Categories=Game;Entertainment;
EOL
```

Replace `/path/to/` with the actual path to the application.

## Support

If you encounter any Arch Linux-specific issues, please report them on our GitHub issues page with the tag "Arch Linux".