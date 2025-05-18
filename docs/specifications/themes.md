# Theme Specification

## Overview

Themes in our platform are JSON-based data structures that define the visual appearance and styling of the application. They allow for customization of colors, fonts, layouts, and other visual elements to match the aesthetic of different RPG series and user preferences.

## Format Specification

```json
{
  "version": "1.0",
  "type": "theme",
  "metadata": {
    "id": "unique-theme-id",
    "created": "ISO-8601 timestamp",
    "modified": "ISO-8601 timestamp",
    "name": "Theme Name",
    "author": "Theme Author",
    "description": "Theme description",
    "tags": ["fantasy", "dark", "sci-fi", "etc"],
    "series_compatibility": ["series1", "series2", "any"]
  },
  "base": {
    "type": "light|dark|custom",
    "extends": "theme-id-to-extend or null"
  },
  "colors": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "tertiary": "#HEX",
    "accent": "#HEX",
    "background": {
      "primary": "#HEX",
      "secondary": "#HEX",
      "tertiary": "#HEX"
    },
    "text": {
      "primary": "#HEX",
      "secondary": "#HEX",
      "accent": "#HEX",
      "inverse": "#HEX"
    },
    "ui": {
      "header": "#HEX",
      "sidebar": "#HEX",
      "footer": "#HEX",
      "card": "#HEX",
      "dialog": "#HEX",
      "tooltip": "#HEX"
    },
    "status": {
      "info": "#HEX",
      "success": "#HEX",
      "warning": "#HEX",
      "error": "#HEX"
    },
    "chat": {
      "narrator": {
        "background": "#HEX",
        "text": "#HEX",
        "border": "#HEX"
      },
      "protagonist": {
        "background": "#HEX",
        "text": "#HEX",
        "border": "#HEX"
      },
      "npc": {
        "background": "#HEX",
        "text": "#HEX",
        "border": "#HEX"
      },
      "system": {
        "background": "#HEX",
        "text": "#HEX",
        "border": "#HEX"
      },
      "ooc": {
        "background": "#HEX",
        "text": "#HEX",
        "border": "#HEX"
      }
    },
    "tools": {
      "background": "#HEX",
      "border": "#HEX",
      "header": "#HEX",
      "component": {
        "background": "#HEX",
        "border": "#HEX",
        "text": "#HEX"
      }
    },
    "gradients": {
      "primary": {
        "colors": ["#HEX1", "#HEX2"],
        "direction": "to bottom|to right|45deg|etc"
      },
      "secondary": {
        "colors": ["#HEX1", "#HEX2"],
        "direction": "to bottom|to right|45deg|etc"
      }
    }
  },
  "typography": {
    "fontFamily": {
      "primary": "Font name, fallback1, fallback2",
      "secondary": "Font name, fallback1, fallback2",
      "monospace": "Font name, fallback1, fallback2"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "md": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    },
    "fontWeight": {
      "light": 300,
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.25,
      "normal": 1.5,
      "relaxed": 1.75
    },
    "letterSpacing": {
      "tight": "-0.025em",
      "normal": "0",
      "wide": "0.025em"
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },
  "borders": {
    "radius": {
      "sm": "0.125rem",
      "md": "0.25rem",
      "lg": "0.5rem",
      "xl": "1rem",
      "full": "9999px"
    },
    "width": {
      "thin": "1px",
      "medium": "2px",
      "thick": "4px"
    },
    "style": {
      "solid": "solid",
      "dashed": "dashed",
      "dotted": "dotted"
    }
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  },
  "animations": {
    "timing": {
      "fast": "150ms",
      "normal": "300ms",
      "slow": "500ms"
    },
    "easing": {
      "ease": "ease",
      "easeIn": "ease-in",
      "easeOut": "ease-out",
      "easeInOut": "ease-in-out",
      "linear": "linear"
    },
    "transitions": {
      "default": "all 300ms ease",
      "fast": "all 150ms ease",
      "slow": "all 500ms ease"
    },
    "keyframes": {
      "fadeIn": {
        "0%": {
          "opacity": 0
        },
        "100%": {
          "opacity": 1
        }
      },
      "slideIn": {
        "0%": {
          "transform": "translateY(20px)",
          "opacity": 0
        },
        "100%": {
          "transform": "translateY(0)",
          "opacity": 1
        }
      }
    }
  },
  "components": {
    "button": {
      "primary": {
        "background": "#HEX",
        "text": "#HEX",
        "border": "#HEX",
        "hover": {
          "background": "#HEX",
          "text": "#HEX",
          "border": "#HEX"
        },
        "active": {
          "background": "#HEX",
          "text": "#HEX",
          "border": "#HEX"
        },
        "disabled": {
          "background": "#HEX",
          "text": "#HEX",
          "border": "#HEX"
        }
      },
      "secondary": {
        "background": "#HEX",
        "text": "#HEX",
        "border": "#HEX",
        "hover": {
          "background": "#HEX",
          "text": "#HEX",
          "border": "#HEX"
        },
        "active": {
          "background": "#HEX",
          "text": "#HEX",
          "border": "#HEX"
        },
        "disabled": {
          "background": "#HEX",
          "text": "#HEX",
          "border": "#HEX"
        }
      }
    },
    "input": {
      "background": "#HEX",
      "text": "#HEX",
      "border": "#HEX",
      "placeholder": "#HEX",
      "focus": {
        "background": "#HEX",
        "text": "#HEX",
        "border": "#HEX"
      },
      "disabled": {
        "background": "#HEX",
        "text": "#HEX",
        "border": "#HEX"
      }
    },
    "card": {
      "background": "#HEX",
      "text": "#HEX",
      "border": "#HEX",
      "header": {
        "background": "#HEX",
        "text": "#HEX"
      },
      "footer": {
        "background": "#HEX",
        "text": "#HEX"
      }
    },
    "dialog": {
      "background": "#HEX",
      "text": "#HEX",
      "border": "#HEX",
      "overlay": "rgba(0, 0, 0, 0.5)"
    },
    "tooltip": {
      "background": "#HEX",
      "text": "#HEX",
      "border": "#HEX"
    },
    "tabs": {
      "background": "#HEX",
      "text": "#HEX",
      "active": {
        "background": "#HEX",
        "text": "#HEX",
        "border": "#HEX"
      },
      "hover": {
        "background": "#HEX",
        "text": "#HEX"
      }
    }
  },
  "layouts": {
    "chat": {
      "messageSpacing": "1rem",
      "avatarSize": "40px",
      "maxWidth": "800px",
      "bubbleStyle": "rounded|angular|custom",
      "timestampPosition": "inline|above|below"
    },
    "sidebar": {
      "width": "300px",
      "collapsedWidth": "60px"
    },
    "header": {
      "height": "60px"
    },
    "footer": {
      "height": "40px"
    },
    "tools": {
      "width": "350px",
      "collapsedWidth": "40px",
      "position": "right|left|bottom"
    }
  },
  "assets": {
    "backgrounds": {
      "main": "path/to/background.jpg or base64",
      "chat": "path/to/chat-background.jpg or base64",
      "sidebar": "path/to/sidebar-background.jpg or base64"
    },
    "icons": {
      "logo": "path/to/logo.svg or base64",
      "favicon": "path/to/favicon.ico or base64",
      "custom": {
        "icon1": "path/to/icon1.svg or base64",
        "icon2": "path/to/icon2.svg or base64"
      }
    },
    "sounds": {
      "notification": "path/to/notification.mp3",
      "message": "path/to/message.mp3",
      "error": "path/to/error.mp3"
    }
  },
  "customCSS": "/* Custom CSS rules */\n.custom-class { property: value; }"
}
```

## Field Descriptions

### Metadata
- `version`: Format version for backward compatibility
- `type`: Always "theme" for themes
- `id`: Unique identifier for the theme
- `created`: Creation timestamp
- `modified`: Last modification timestamp
- `name`: Name of the theme
- `author`: Creator of the theme
- `description`: Description of the theme
- `tags`: Tags for categorizing the theme
- `series_compatibility`: Series this theme is designed for

### Base
- `type`: Base theme type (light, dark, custom)
- `extends`: Optional theme ID to extend (for inheritance)

### Colors
- `primary`, `secondary`, `tertiary`, `accent`: Main theme colors
- `background`: Background colors for different UI elements
- `text`: Text colors for different contexts
- `ui`: Colors for UI elements
- `status`: Colors for status indicators
- `chat`: Colors for different message types
- `tools`: Colors for support tools
- `gradients`: Gradient definitions

### Typography
- `fontFamily`: Font families for different text types
- `fontSize`: Font size scale
- `fontWeight`: Font weight scale
- `lineHeight`: Line height scale
- `letterSpacing`: Letter spacing scale

### Spacing
Spacing scale for margins, padding, etc.

### Borders
- `radius`: Border radius scale
- `width`: Border width scale
- `style`: Border style options

### Shadows
Shadow definitions for different elevations

### Animations
- `timing`: Animation duration scale
- `easing`: Easing function options
- `transitions`: Transition presets
- `keyframes`: Keyframe animation definitions

### Components
Styling for specific UI components:
- `button`: Button styles
- `input`: Input field styles
- `card`: Card styles
- `dialog`: Dialog/modal styles
- `tooltip`: Tooltip styles
- `tabs`: Tab styles

### Layouts
Layout configurations for different UI sections:
- `chat`: Chat layout settings
- `sidebar`: Sidebar layout settings
- `header`: Header layout settings
- `footer`: Footer layout settings
- `tools`: Support tools layout settings

### Assets
- `backgrounds`: Background images
- `icons`: Icon assets
- `sounds`: Sound effects

### CustomCSS
Custom CSS rules for advanced customization

## Example Themes

### Fantasy Theme

```json
{
  "version": "1.0",
  "type": "theme",
  "metadata": {
    "id": "theme-fantasy-dark",
    "created": "2023-05-18T12:00:00Z",
    "modified": "2023-05-18T12:00:00Z",
    "name": "Fantasy Dark",
    "author": "RPG Platform Team",
    "description": "A dark fantasy theme with medieval aesthetics",
    "tags": ["fantasy", "dark", "medieval"],
    "series_compatibility": ["Re:Zero", "The Witcher", "Dragon Age", "any"]
  },
  "base": {
    "type": "dark",
    "extends": null
  },
  "colors": {
    "primary": "#6a0dad",
    "secondary": "#4b0082",
    "tertiary": "#800080",
    "accent": "#ffd700",
    "background": {
      "primary": "#1a1a1a",
      "secondary": "#2a2a2a",
      "tertiary": "#333333"
    },
    "text": {
      "primary": "#ffffff",
      "secondary": "#cccccc",
      "accent": "#ffd700",
      "inverse": "#000000"
    },
    "ui": {
      "header": "#1a1a1a",
      "sidebar": "#2a2a2a",
      "footer": "#1a1a1a",
      "card": "#2a2a2a",
      "dialog": "#2a2a2a",
      "tooltip": "#333333"
    },
    "status": {
      "info": "#3498db",
      "success": "#2ecc71",
      "warning": "#f39c12",
      "error": "#e74c3c"
    },
    "chat": {
      "narrator": {
        "background": "#2a2a2a",
        "text": "#ffffff",
        "border": "#4b0082"
      },
      "protagonist": {
        "background": "#4b0082",
        "text": "#ffffff",
        "border": "#6a0dad"
      },
      "npc": {
        "background": "#333333",
        "text": "#ffffff",
        "border": "#555555"
      },
      "system": {
        "background": "#1a1a1a",
        "text": "#cccccc",
        "border": "#333333"
      },
      "ooc": {
        "background": "#3a3a3a",
        "text": "#cccccc",
        "border": "#555555"
      }
    },
    "tools": {
      "background": "#2a2a2a",
      "border": "#4b0082",
      "header": "#1a1a1a",
      "component": {
        "background": "#333333",
        "border": "#4b0082",
        "text": "#ffffff"
      }
    },
    "gradients": {
      "primary": {
        "colors": ["#6a0dad", "#4b0082"],
        "direction": "to bottom"
      },
      "secondary": {
        "colors": ["#2a2a2a", "#1a1a1a"],
        "direction": "to bottom"
      }
    }
  },
  "typography": {
    "fontFamily": {
      "primary": "\"Cinzel\", \"Times New Roman\", serif",
      "secondary": "\"Lato\", \"Arial\", sans-serif",
      "monospace": "\"Courier New\", monospace"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "md": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    },
    "fontWeight": {
      "light": 300,
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.25,
      "normal": 1.5,
      "relaxed": 1.75
    },
    "letterSpacing": {
      "tight": "-0.025em",
      "normal": "0",
      "wide": "0.025em"
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },
  "borders": {
    "radius": {
      "sm": "0.125rem",
      "md": "0.25rem",
      "lg": "0.5rem",
      "xl": "1rem",
      "full": "9999px"
    },
    "width": {
      "thin": "1px",
      "medium": "2px",
      "thick": "4px"
    },
    "style": {
      "solid": "solid",
      "dashed": "dashed",
      "dotted": "dotted"
    }
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
  },
  "animations": {
    "timing": {
      "fast": "150ms",
      "normal": "300ms",
      "slow": "500ms"
    },
    "easing": {
      "ease": "ease",
      "easeIn": "ease-in",
      "easeOut": "ease-out",
      "easeInOut": "ease-in-out",
      "linear": "linear"
    },
    "transitions": {
      "default": "all 300ms ease",
      "fast": "all 150ms ease",
      "slow": "all 500ms ease"
    },
    "keyframes": {
      "fadeIn": {
        "0%": {
          "opacity": 0
        },
        "100%": {
          "opacity": 1
        }
      },
      "slideIn": {
        "0%": {
          "transform": "translateY(20px)",
          "opacity": 0
        },
        "100%": {
          "transform": "translateY(0)",
          "opacity": 1
        }
      }
    }
  },
  "components": {
    "button": {
      "primary": {
        "background": "#6a0dad",
        "text": "#ffffff",
        "border": "#4b0082",
        "hover": {
          "background": "#800080",
          "text": "#ffffff",
          "border": "#6a0dad"
        },
        "active": {
          "background": "#4b0082",
          "text": "#ffffff",
          "border": "#6a0dad"
        },
        "disabled": {
          "background": "#555555",
          "text": "#aaaaaa",
          "border": "#666666"
        }
      },
      "secondary": {
        "background": "transparent",
        "text": "#ffffff",
        "border": "#6a0dad",
        "hover": {
          "background": "rgba(106, 13, 173, 0.2)",
          "text": "#ffffff",
          "border": "#800080"
        },
        "active": {
          "background": "rgba(106, 13, 173, 0.3)",
          "text": "#ffffff",
          "border": "#800080"
        },
        "disabled": {
          "background": "transparent",
          "text": "#aaaaaa",
          "border": "#666666"
        }
      }
    },
    "input": {
      "background": "#333333",
      "text": "#ffffff",
      "border": "#4b0082",
      "placeholder": "#aaaaaa",
      "focus": {
        "background": "#333333",
        "text": "#ffffff",
        "border": "#6a0dad"
      },
      "disabled": {
        "background": "#2a2a2a",
        "text": "#aaaaaa",
        "border": "#555555"
      }
    },
    "card": {
      "background": "#2a2a2a",
      "text": "#ffffff",
      "border": "#4b0082",
      "header": {
        "background": "#1a1a1a",
        "text": "#ffffff"
      },
      "footer": {
        "background": "#1a1a1a",
        "text": "#cccccc"
      }
    },
    "dialog": {
      "background": "#2a2a2a",
      "text": "#ffffff",
      "border": "#4b0082",
      "overlay": "rgba(0, 0, 0, 0.7)"
    },
    "tooltip": {
      "background": "#333333",
      "text": "#ffffff",
      "border": "#4b0082"
    },
    "tabs": {
      "background": "#1a1a1a",
      "text": "#cccccc",
      "active": {
        "background": "#2a2a2a",
        "text": "#ffffff",
        "border": "#6a0dad"
      },
      "hover": {
        "background": "#333333",
        "text": "#ffffff"
      }
    }
  },
  "layouts": {
    "chat": {
      "messageSpacing": "1rem",
      "avatarSize": "40px",
      "maxWidth": "800px",
      "bubbleStyle": "rounded",
      "timestampPosition": "below"
    },
    "sidebar": {
      "width": "300px",
      "collapsedWidth": "60px"
    },
    "header": {
      "height": "60px"
    },
    "footer": {
      "height": "40px"
    },
    "tools": {
      "width": "350px",
      "collapsedWidth": "40px",
      "position": "right"
    }
  },
  "assets": {
    "backgrounds": {
      "main": "path/to/fantasy-background.jpg",
      "chat": "path/to/parchment-background.jpg",
      "sidebar": "path/to/dark-wood-background.jpg"
    },
    "icons": {
      "logo": "path/to/fantasy-logo.svg",
      "favicon": "path/to/fantasy-favicon.ico",
      "custom": {
        "sword": "path/to/sword-icon.svg",
        "shield": "path/to/shield-icon.svg",
        "scroll": "path/to/scroll-icon.svg"
      }
    },
    "sounds": {
      "notification": "path/to/bell-sound.mp3",
      "message": "path/to/quill-sound.mp3",
      "error": "path/to/error-sound.mp3"
    }
  },
  "customCSS": "/* Custom scrollbar */\n::-webkit-scrollbar { width: 8px; }\n::-webkit-scrollbar-track { background: #1a1a1a; }\n::-webkit-scrollbar-thumb { background: #4b0082; border-radius: 4px; }\n::-webkit-scrollbar-thumb:hover { background: #6a0dad; }"
}
```

### Sci-Fi Theme

```json
{
  "version": "1.0",
  "type": "theme",
  "metadata": {
    "id": "theme-scifi-neon",
    "created": "2023-05-18T12:00:00Z",
    "modified": "2023-05-18T12:00:00Z",
    "name": "Sci-Fi Neon",
    "author": "RPG Platform Team",
    "description": "A futuristic neon-inspired sci-fi theme",
    "tags": ["sci-fi", "cyberpunk", "neon", "futuristic"],
    "series_compatibility": ["Cyberpunk", "Ghost in the Shell", "Altered Carbon", "any"]
  },
  "base": {
    "type": "dark",
    "extends": null
  },
  "colors": {
    "primary": "#00ffff",
    "secondary": "#ff00ff",
    "tertiary": "#00ff00",
    "accent": "#ffff00",
    "background": {
      "primary": "#0a0a0a",
      "secondary": "#1a1a1a",
      "tertiary": "#2a2a2a"
    },
    "text": {
      "primary": "#ffffff",
      "secondary": "#cccccc",
      "accent": "#00ffff",
      "inverse": "#000000"
    },
    "ui": {
      "header": "#0a0a0a",
      "sidebar": "#1a1a1a",
      "footer": "#0a0a0a",
      "card": "#1a1a1a",
      "dialog": "#1a1a1a",
      "tooltip": "#2a2a2a"
    },
    "status": {
      "info": "#00ffff",
      "success": "#00ff00",
      "warning": "#ffff00",
      "error": "#ff0000"
    },
    "chat": {
      "narrator": {
        "background": "#1a1a1a",
        "text": "#ffffff",
        "border": "#00ffff"
      },
      "protagonist": {
        "background": "#2a2a2a",
        "text": "#ffffff",
        "border": "#ff00ff"
      },
      "npc": {
        "background": "#1a1a1a",
        "text": "#ffffff",
        "border": "#00ff00"
      },
      "system": {
        "background": "#0a0a0a",
        "text": "#cccccc",
        "border": "#333333"
      },
      "ooc": {
        "background": "#2a2a2a",
        "text": "#cccccc",
        "border": "#555555"
      }
    },
    "tools": {
      "background": "#1a1a1a",
      "border": "#00ffff",
      "header": "#0a0a0a",
      "component": {
        "background": "#2a2a2a",
        "border": "#00ffff",
        "text": "#ffffff"
      }
    },
    "gradients": {
      "primary": {
        "colors": ["#00ffff", "#0000ff"],
        "direction": "to right"
      },
      "secondary": {
        "colors": ["#ff00ff", "#ff0000"],
        "direction": "to right"
      }
    }
  },
  "typography": {
    "fontFamily": {
      "primary": "\"Orbitron\", \"Arial\", sans-serif",
      "secondary": "\"Roboto\", \"Arial\", sans-serif",
      "monospace": "\"Share Tech Mono\", monospace"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "md": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    },
    "fontWeight": {
      "light": 300,
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.25,
      "normal": 1.5,
      "relaxed": 1.75
    },
    "letterSpacing": {
      "tight": "-0.025em",
      "normal": "0",
      "wide": "0.05em"
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },
  "borders": {
    "radius": {
      "sm": "0.125rem",
      "md": "0.25rem",
      "lg": "0.5rem",
      "xl": "1rem",
      "full": "9999px"
    },
    "width": {
      "thin": "1px",
      "medium": "2px",
      "thick": "4px"
    },
    "style": {
      "solid": "solid",
      "dashed": "dashed",
      "dotted": "dotted"
    }
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgba(0, 255, 255, 0.2)",
    "md": "0 4px 6px -1px rgba(0, 255, 255, 0.2), 0 2px 4px -1px rgba(0, 255, 255, 0.1)",
    "lg": "0 10px 15px -3px rgba(0, 255, 255, 0.2), 0 4px 6px -2px rgba(0, 255, 255, 0.1)",
    "xl": "0 20px 25px -5px rgba(0, 255, 255, 0.2), 0 10px 10px -5px rgba(0, 255, 255, 0.1)",
    "neon": "0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3), 0 0 30px rgba(0, 255, 255, 0.1)"
  },
  "animations": {
    "timing": {
      "fast": "150ms",
      "normal": "300ms",
      "slow": "500ms"
    },
    "easing": {
      "ease": "ease",
      "easeIn": "ease-in",
      "easeOut": "ease-out",
      "easeInOut": "ease-in-out",
      "linear": "linear"
    },
    "transitions": {
      "default": "all 300ms ease",
      "fast": "all 150ms ease",
      "slow": "all 500ms ease"
    },
    "keyframes": {
      "fadeIn": {
        "0%": {
          "opacity": 0
        },
        "100%": {
          "opacity": 1
        }
      },
      "pulse": {
        "0%": {
          "opacity": 1
        },
        "50%": {
          "opacity": 0.5
        },
        "100%": {
          "opacity": 1
        }
      },
      "glitch": {
        "0%": {
          "transform": "translate(0)"
        },
        "20%": {
          "transform": "translate(-2px, 2px)"
        },
        "40%": {
          "transform": "translate(-2px, -2px)"
        },
        "60%": {
          "transform": "translate(2px, 2px)"
        },
        "80%": {
          "transform": "translate(2px, -2px)"
        },
        "100%": {
          "transform": "translate(0)"
        }
      }
    }
  },
  "components": {
    "button": {
      "primary": {
        "background": "#00ffff",
        "text": "#000000",
        "border": "transparent",
        "hover": {
          "background": "#00cccc",
          "text": "#000000",
          "border": "transparent"
        },
        "active": {
          "background": "#009999",
          "text": "#000000",
          "border": "transparent"
        },
        "disabled": {
          "background": "#555555",
          "text": "#aaaaaa",
          "border": "transparent"
        }
      },
      "secondary": {
        "background": "transparent",
        "text": "#00ffff",
        "border": "#00ffff",
        "hover": {
          "background": "rgba(0, 255, 255, 0.1)",
          "text": "#00ffff",
          "border": "#00ffff"
        },
        "active": {
          "background": "rgba(0, 255, 255, 0.2)",
          "text": "#00ffff",
          "border": "#00ffff"
        },
        "disabled": {
          "background": "transparent",
          "text": "#aaaaaa",
          "border": "#555555"
        }
      }
    },
    "input": {
      "background": "#2a2a2a",
      "text": "#ffffff",
      "border": "#00ffff",
      "placeholder": "#aaaaaa",
      "focus": {
        "background": "#2a2a2a",
        "text": "#ffffff",
        "border": "#00ffff"
      },
      "disabled": {
        "background": "#1a1a1a",
        "text": "#aaaaaa",
        "border": "#555555"
      }
    },
    "card": {
      "background": "#1a1a1a",
      "text": "#ffffff",
      "border": "#00ffff",
      "header": {
        "background": "#0a0a0a",
        "text": "#00ffff"
      },
      "footer": {
        "background": "#0a0a0a",
        "text": "#cccccc"
      }
    },
    "dialog": {
      "background": "#1a1a1a",
      "text": "#ffffff",
      "border": "#00ffff",
      "overlay": "rgba(0, 0, 0, 0.8)"
    },
    "tooltip": {
      "background": "#2a2a2a",
      "text": "#00ffff",
      "border": "#00ffff"
    },
    "tabs": {
      "background": "#0a0a0a",
      "text": "#cccccc",
      "active": {
        "background": "#1a1a1a",
        "text": "#00ffff",
        "border": "#00ffff"
      },
      "hover": {
        "background": "#2a2a2a",
        "text": "#ffffff"
      }
    }
  },
  "layouts": {
    "chat": {
      "messageSpacing": "1rem",
      "avatarSize": "40px",
      "maxWidth": "800px",
      "bubbleStyle": "angular",
      "timestampPosition": "inline"
    },
    "sidebar": {
      "width": "300px",
      "collapsedWidth": "60px"
    },
    "header": {
      "height": "60px"
    },
    "footer": {
      "height": "40px"
    },
    "tools": {
      "width": "350px",
      "collapsedWidth": "40px",
      "position": "right"
    }
  },
  "assets": {
    "backgrounds": {
      "main": "path/to/cyberpunk-city.jpg",
      "chat": "path/to/digital-grid.jpg",
      "sidebar": "path/to/circuit-pattern.jpg"
    },
    "icons": {
      "logo": "path/to/neon-logo.svg",
      "favicon": "path/to/neon-favicon.ico",
      "custom": {
        "chip": "path/to/chip-icon.svg",
        "network": "path/to/network-icon.svg",
        "terminal": "path/to/terminal-icon.svg"
      }
    },
    "sounds": {
      "notification": "path/to/digital-notification.mp3",
      "message": "path/to/keyboard-sound.mp3",
      "error": "path/to/error-sound.mp3"
    }
  },
  "customCSS": "/* Neon text effect */\n.neon-text { text-shadow: 0 0 5px rgba(0, 255, 255, 0.8), 0 0 10px rgba(0, 255, 255, 0.5), 0 0 15px rgba(0, 255, 255, 0.3); }\n\n/* Glitch animation */\n.glitch { animation: glitch 0.5s infinite; }\n\n/* Custom scrollbar */\n::-webkit-scrollbar { width: 8px; }\n::-webkit-scrollbar-track { background: #0a0a0a; }\n::-webkit-scrollbar-thumb { background: #00ffff; border-radius: 0; }\n::-webkit-scrollbar-thumb:hover { background: #00cccc; }"
}
```

## Usage Notes

1. Themes should be selectable from a theme library or customizable by the user.
2. Series-specific themes should be automatically suggested when starting a new series.
3. Themes should be exportable and importable for sharing.
4. The application should provide a theme editor for users to create and modify themes.
5. Custom CSS should be validated to prevent malicious code.