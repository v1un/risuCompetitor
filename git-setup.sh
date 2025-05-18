#!/bin/bash

# Git setup script for Immersive RPG AI Storytelling Platform

echo "Setting up Git repository for Immersive RPG AI Storytelling Platform..."

# Initialize Git repository if it doesn't exist
if [ ! -d ".git" ]; then
  echo "Initializing Git repository..."
  git init
  echo "Git repository initialized."
else
  echo "Git repository already exists."
fi

# Add all files to staging
echo "Adding files to staging..."
git add .

# Initial commit
echo "Creating initial commit..."
git commit -m "Initial commit: Project structure and core files"

# Configure remote (uncomment and modify when ready to push to a remote repository)
# echo "Configuring remote repository..."
# git remote add origin https://github.com/yourusername/immersive-rpg-storytelling-platform.git

echo "Git setup complete!"
echo ""
echo "Next steps:"
echo "1. Review the files staged in this commit"
echo "2. Configure your Git user information if not already set:"
echo "   git config --global user.name \"Your Name\""
echo "   git config --global user.email \"your.email@example.com\""
echo "3. Set up a remote repository and push your code:"
echo "   git remote add origin https://github.com/yourusername/immersive-rpg-storytelling-platform.git"
echo "   git push -u origin main"
echo ""
echo "Happy coding!"