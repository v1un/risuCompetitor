# Contributing to the Immersive RPG AI Storytelling Platform

Thank you for your interest in contributing to the Immersive RPG AI Storytelling Platform! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Environment](#development-environment)
4. [Project Structure](#project-structure)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Testing](#testing)
9. [Documentation](#documentation)
10. [Issue Reporting](#issue-reporting)
11. [Feature Requests](#feature-requests)
12. [Communication](#communication)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/immersive-rpg-storytelling-platform.git`
3. Add the upstream repository: `git remote add upstream https://github.com/originalowner/immersive-rpg-storytelling-platform.git`
4. Create a branch for your work: `git checkout -b feature/your-feature-name`

## Development Environment

### Prerequisites

- Node.js 16+ and npm
- Git
- A code editor (VS Code recommended)
- Google Gemini API key (for AI features)
- OpenRouter API key (optional)

### Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   npm run package
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
```

## Project Structure

The project follows this structure:

```
/
├── docs/                  # Documentation
│   ├── development/       # Developer documentation
│   └── specifications/    # Data structure specifications
├── src/
│   ├── main/              # Electron main process
│   │   ├── api/           # API integrations
│   │   ├── database/      # Database operations
│   │   └── services/      # Business logic services
│   ├── preload/           # Preload scripts for IPC
│   └── renderer/          # React frontend
│       ├── components/    # Reusable UI components
│       ├── contexts/      # React contexts
│       ├── pages/         # Page components
│       └── styles/        # CSS/SCSS styles
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
├── package.json           # Project dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Coding Standards

This project uses:

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

### TypeScript Guidelines

- Use explicit typing where possible
- Avoid `any` types unless absolutely necessary
- Use interfaces for object shapes
- Use enums for fixed sets of values

### React Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use React Context for state that needs to be shared
- Follow the container/presentational pattern where appropriate

### Electron Guidelines

- Keep main process code separate from renderer
- Use IPC for communication between processes
- Handle errors appropriately in both processes

## Commit Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

Example: `feat: add character generation with Gemini API`

## Pull Request Process

1. Update your fork with the latest upstream changes
2. Ensure your code follows the project's coding standards
3. Add tests for new functionality
4. Update documentation as necessary
5. Submit a pull request with a clear description of the changes
6. Address any feedback from code reviews

## Testing

### Running Tests

```
npm test
```

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for API interactions
- Write component tests for UI components
- Mock external dependencies appropriately

## Documentation

### Code Documentation

- Use JSDoc comments for functions and classes
- Document complex algorithms and business logic
- Keep comments up-to-date with code changes

### Project Documentation

- Update README.md with new features or changes
- Update API documentation when endpoints change
- Create or update guides for new functionality

## Issue Reporting

When reporting issues, please include:

1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Environment information (OS, Node.js version, etc.)

## Feature Requests

Feature requests are welcome! Please provide:

1. A clear description of the feature
2. The problem it solves
3. Any alternatives you've considered
4. Any implementation details you can provide

## Communication

- Use GitHub Issues for bug reports and feature requests
- Use Pull Requests for code contributions
- Join our [Discord server](https://discord.gg/example) for discussions

## Areas for Contribution

We particularly welcome contributions in these areas:

### AI Integration

- Improving prompt engineering
- Adding support for new AI models
- Enhancing error handling and fallbacks

### User Interface

- Accessibility improvements
- Performance optimizations
- New UI components

### Documentation

- User guides
- API documentation
- Example projects

### Testing

- Unit tests
- Integration tests
- UI tests

## Acknowledgments

Thank you to all contributors who help make this project better!

---

By contributing to this project, you agree to abide by its terms and conditions as outlined in the [LICENSE](LICENSE) file.