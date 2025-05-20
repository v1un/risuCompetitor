#!/bin/bash

# Script to rebuild native modules for Electron on Linux
# This is particularly useful for Arch Linux and other distributions

# Get the electron version
ELECTRON_VERSION=$(npm list electron | grep electron | cut -d@ -f2 | cut -d' ' -f1)

if [ -z "$ELECTRON_VERSION" ]; then
  echo "Error: Could not determine Electron version"
  exit 1
fi

echo "Rebuilding native modules for Electron version $ELECTRON_VERSION"

# Install build dependencies if needed
if [ -f /etc/arch-release ]; then
  echo "Arch Linux detected, checking for build dependencies..."
  
  # Check if base-devel is installed
  if ! pacman -Q base-devel &> /dev/null; then
    echo "base-devel package group is required. Please install it with:"
    echo "sudo pacman -S base-devel"
    exit 1
  fi
  
  # Check for other dependencies
  for pkg in python nodejs npm electron; do
    if ! pacman -Q $pkg &> /dev/null; then
      echo "$pkg is required. Please install it with:"
      echo "sudo pacman -S $pkg"
      exit 1
    fi
  done
fi

# Rebuild sqlite3
echo "Rebuilding sqlite3..."
npm rebuild sqlite3 --build-from-source --runtime=electron --target=$ELECTRON_VERSION --dist-url=https://electronjs.org/headers

echo "Native modules rebuilt successfully!"