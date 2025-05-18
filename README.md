# Immersive RPG AI Storytelling Platform

A local-first desktop application functioning as a dedicated AI-driven Narrator/Game Master (GM) system designed for rich, customizable, and immersive Role-Playing Game (RPG) experiences.

## Project Overview

This platform establishes its own unique ecosystem with well-documented specifications for all core data structures:
- Character cards
- Lorebooks
- Support tools
- Chat logs
- Themes

Key features include:
- AI-generated series-specific Character Cards and Lorebooks
- Dynamic, series-tailored "Support Tools" for the Narrator/GM and player
- Integration with Gemini's AI SDK API and OpenRouter API
- RPG-focused design with thematic styling
- Local-first architecture with no cloud dependencies (except API calls)

## Technical Stack

- **Application Framework**: Electron
- **Frontend**: React with TypeScript
- **Backend Logic**: Node.js with Express.js
- **Local Database**: SQLite
- **API Interaction**: Gemini SDK and Axios for OpenRouter
- **Packaging**: Electron Builder

## Development Status

This project is currently in active development with the following components implemented:

- Core application structure with Electron and React
- Database schema and SQLite integration
- API integration with Google's Gemini and OpenRouter
- Character, Lorebook, and Support Tool generation using AI
- Narrator/GM chat functionality with context-aware responses
- Support Tool state management and updates
- Secure API key storage

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Google Gemini API key (required for AI generation)
- OpenRouter API key (optional, provides access to additional models)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/immersive-rpg-storytelling-platform.git
   cd immersive-rpg-storytelling-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   npm run package
   ```

## Usage

1. Launch the application
2. Set up your API keys in the Settings page
3. Create or select a series (e.g., "Star Wars", "Lord of the Rings")
4. Use the AI Generation page to create characters, lorebooks, and support tools
5. Start a new chat session with your generated content
6. Enjoy an immersive RPG experience with the AI Narrator/GM

## Documentation

For detailed documentation on the project architecture, data structures, and API integration, see the `docs` directory:

- [API Integration Guide](docs/development/api-integration-guide.md)
- [Database Schema](docs/development/database-schema.md)
- [Character Cards Specification](docs/specifications/character-cards.md)
- [Lorebooks Specification](docs/specifications/lorebooks.md)
- [Support Tools Specification](docs/specifications/support-tools.md)
- [Chat Logs Specification](docs/specifications/chat-logs.md)
- [Themes Specification](docs/specifications/themes.md)

## Project Roadmap

For a detailed view of our development plans, completed features, and upcoming work, see:

- [Project Roadmap](ROADMAP.md) - Comprehensive development roadmap
- [Implementation Status](IMPLEMENTATION_STATUS.md) - Current implementation status and priorities

## Contributing

We welcome contributions to the Immersive RPG AI Storytelling Platform! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Git Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Conventions

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Write unit tests for new features
- Update documentation for any changed functionality
- Reference issue numbers in commit messages when applicable

## License

This project is licensed under the MIT License - see the LICENSE file for details.