# Project Structure

```
/
├── docs/                           # Documentation
│   ├── specifications/             # Data format specifications
│   │   ├── character-cards.md      # Character card format specification
│   │   ├── lorebooks.md            # Lorebook format specification
│   │   ├── support-tools.md        # Support tools format specification
│   │   ├── chat-logs.md            # Chat logs format specification
│   │   └── themes.md               # Theme format specification
│   └── development/                # Development documentation
│       ├── architecture.md         # System architecture
│       └── api-integration.md      # API integration details
│
├── src/                            # Source code
│   ├── main/                       # Electron main process
│   │   ├── index.ts                # Main entry point
│   │   ├── database/               # Database management
│   │   │   └── sqlite.ts           # SQLite setup and operations
│   │   └── api/                    # API services
│   │       ├── gemini.ts           # Gemini API integration
│   │       └── openrouter.ts       # OpenRouter API integration
│   │
│   ├── renderer/                   # Electron renderer process (React)
│   │   ├── index.tsx               # Renderer entry point
│   │   ├── App.tsx                 # Main application component
│   │   ├── components/             # UI components
│   │   │   ├── chat/               # Chat interface components
│   │   │   ├── character/          # Character management components
│   │   │   ├── lorebook/           # Lorebook management components
│   │   │   ├── support-tools/      # Support tools components
│   │   │   └── settings/           # Settings components
│   │   ├── contexts/               # React contexts
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── styles/                 # CSS/SCSS styles
│   │   └── utils/                  # Utility functions
│   │
│   ├── shared/                     # Shared between main and renderer
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── constants.ts            # Shared constants
│   │   └── utils/                  # Shared utility functions
│   │
│   └── preload/                    # Electron preload script
│       └── index.ts                # Preload entry point
│
├── public/                         # Static assets
│   ├── icons/                      # Application icons
│   └── themes/                     # Default themes
│
├── scripts/                        # Build and development scripts
│
├── package.json                    # Project dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── electron-builder.json           # Electron builder configuration
└── README.md                       # Project overview
```