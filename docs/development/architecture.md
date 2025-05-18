# System Architecture

## Overview

This document outlines the architecture of our Local-First Immersive RPG AI Storytelling Platform. The platform is designed as a desktop application that provides an AI-driven Narrator/Game Master (GM) system for rich, customizable, and immersive Role-Playing Game (RPG) experiences.

## High-Level Architecture

The application follows a layered architecture with the following main components:

1. **User Interface Layer**: Electron-based desktop application with React frontend
2. **Application Logic Layer**: Core business logic and state management
3. **Data Access Layer**: Local database and file system operations
4. **AI Integration Layer**: Integration with Gemini SDK and OpenRouter API
5. **Support Tools Framework**: Dynamic, series-specific tools for enhancing the RPG experience

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Electron Application                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Renderer Process                      │   │
│  │                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │    React    │  │   Redux /   │  │     React       │  │   │
│  │  │  Components │◄─┤   Context   │◄─┤     Hooks       │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  │         ▲                 ▲                 ▲           │   │
│  │         │                 │                 │           │   │
│  │         ▼                 ▼                 ▼           │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │                  IPC Bridge                     │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └───────────────────────┬─────────────────────────────────┘   │
│                          │                                     │
│  ┌───────────────────────▼─────────────────────────────────┐   │
│  │                    Main Process                          │   │
│  │                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │  Electron   │  │  Express/   │  │   File System   │  │   │
│  │  │   API       │  │   Fastify   │  │     Access      │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  │         ▲                 ▲                 ▲           │   │
│  │         │                 │                 │           │   │
│  │         ▼                 ▼                 ▼           │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │                 Core Services                   │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │         ▲                 ▲                 ▲           │   │
│  │         │                 │                 │           │   │
│  │         ▼                 ▼                 ▼           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │  Database   │  │    AI       │  │  Support Tool   │  │   │
│  │  │  Service    │  │  Service    │  │    Service      │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ▲                                     │
└──────────────────────────┼─────────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────────┐
│                     External Services                           │
│                                                                 │
│  ┌─────────────────────┐        ┌───────────────────────────┐  │
│  │     Gemini API      │        │      OpenRouter API       │  │
│  └─────────────────────┘        └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### User Interface Layer

The UI layer is built with React and follows a component-based architecture. Key components include:

1. **Chat Interface**: Displays the conversation between the user (protagonist) and the AI Narrator/GM.
2. **Character Management**: Interfaces for creating, editing, and managing character cards.
3. **Lorebook Management**: Interfaces for creating, editing, and managing lorebooks.
4. **Support Tools**: Dynamic UI elements for series-specific tools.
5. **Settings**: Configuration interfaces for the application.

### Application Logic Layer

The application logic layer manages the core functionality of the application:

1. **State Management**: Using Redux or React Context to manage application state.
2. **Chat Logic**: Handling message processing, context management, and AI interactions.
3. **Character/Lorebook Logic**: Managing character and lorebook data.
4. **Support Tool Logic**: Handling the creation, updating, and interaction with support tools.
5. **Theme Management**: Applying and customizing themes.

### Data Access Layer

The data access layer handles local data storage and retrieval:

1. **SQLite Database**: Stores all structured data (character cards, lorebooks, chat logs, settings).
2. **File System Access**: Manages file operations for importing/exporting data and assets.
3. **Data Models**: Implements the proprietary data formats defined in the specifications.

### AI Integration Layer

The AI integration layer handles communication with AI services:

1. **Gemini SDK Integration**: Direct integration with Google's Gemini SDK.
2. **OpenRouter Integration**: Integration with OpenRouter for access to multiple LLMs.
3. **Prompt Management**: Handling system prompts, character instructions, and context.
4. **Response Processing**: Processing and formatting AI responses.

### Support Tools Framework

The support tools framework enables the creation and management of dynamic, series-specific tools:

1. **Tool Generation**: AI-powered generation of series-specific support tools.
2. **Tool Rendering**: Dynamic rendering of tool components based on tool specifications.
3. **Tool State Management**: Managing the state of tools and synchronizing with the narrative.
4. **Tool Interaction**: Handling user and AI interactions with tools.

## Data Flow

### Chat Flow

1. User enters a message as the protagonist
2. Message is processed and added to the chat log
3. Context is assembled from:
   - Recent chat history
   - Character cards
   - Lorebook entries
   - Support tool states
4. Context and message are sent to the AI (Gemini or OpenRouter)
5. AI generates a response
6. Response is processed and may trigger updates to support tools
7. Response is displayed to the user
8. Chat log and tool states are saved to the database

### Character Card Generation Flow

1. User selects a series and requests character card generation
2. System prompts the AI with series information and character card format
3. AI generates a character card in the proprietary format
4. Generated card is displayed to the user for review
5. User can edit and save the card
6. Card is stored in the database

### Support Tool Generation Flow

1. User selects a series and initiates a new chat
2. System prompts the AI with series information and support tool examples
3. AI suggests appropriate support tools for the series
4. User reviews, approves, or requests regeneration of tools
5. Approved tools are instantiated in the UI
6. Tool states are initialized and stored in the database

## Database Schema

The application uses SQLite for local storage with the following main tables:

1. **Characters**: Stores character cards
2. **Lorebooks**: Stores lorebooks
3. **ChatLogs**: Stores chat logs
4. **ChatMessages**: Stores individual chat messages
5. **SupportTools**: Stores support tool definitions
6. **ToolStates**: Stores the state of support tools at different points in time
7. **Settings**: Stores application settings
8. **Themes**: Stores custom themes

## API Integration

### Gemini SDK Integration

The application integrates directly with Google's Gemini SDK:

1. **Authentication**: Securely stores and manages API keys
2. **Model Selection**: Allows selection of different Gemini models
3. **Parameter Configuration**: Configurable parameters like temperature, top_k, etc.
4. **Streaming**: Support for streaming responses for a more dynamic experience

### OpenRouter Integration

The application also integrates with OpenRouter for access to multiple LLMs:

1. **Authentication**: Securely stores and manages API keys
2. **Model Selection**: Allows selection from available models
3. **Parameter Configuration**: Configurable parameters based on the selected model
4. **Fallback Mechanism**: Ability to fall back to alternative models if needed

## Security Considerations

1. **API Key Storage**: API keys are stored securely using the operating system's secure storage mechanisms
2. **Local Data**: All user data is stored locally, minimizing privacy concerns
3. **Content Filtering**: Options for content filtering to ensure appropriate content
4. **Input Validation**: Proper validation of all user inputs to prevent injection attacks

## Performance Considerations

1. **Context Management**: Efficient management of context window to optimize token usage
2. **Database Indexing**: Proper indexing of database tables for fast queries
3. **Lazy Loading**: Loading data only when needed to improve startup time
4. **Caching**: Caching frequently used data to reduce database access
5. **Background Processing**: Handling intensive tasks in background threads

## Extensibility

The architecture is designed to be extensible in several ways:

1. **Plugin System**: Future support for plugins to extend functionality
2. **Custom Support Tools**: User-created support tools
3. **Theme Customization**: Extensive theme customization options
4. **Model Flexibility**: Support for different AI models through OpenRouter
5. **Data Format Versioning**: Version support in data formats for backward compatibility

## Development Workflow

1. **Local Development**: Electron development environment with hot reloading
2. **Testing**: Unit tests for core functionality and integration tests for AI interactions
3. **Building**: Electron Builder for packaging the application for different platforms
4. **Distribution**: Self-contained executables for Windows, macOS, and Linux