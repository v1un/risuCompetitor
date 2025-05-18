# Support Tools Specification

## Overview

Support Tools in our platform are dynamic UI elements tailored to specific series that enhance the RPG experience by providing visual and interactive elements for tracking game state, character progression, and narrative events. These tools are used by both the AI Narrator/GM and the player.

## Format Specification

```json
{
  "version": "1.0",
  "type": "support-tool",
  "metadata": {
    "id": "unique-tool-id",
    "created": "ISO-8601 timestamp",
    "modified": "ISO-8601 timestamp",
    "series": "name-of-series",
    "title": "Tool Title"
  },
  "tool": {
    "name": "Tool Name",
    "description": "Tool description and purpose",
    "type": "tracker|meter|log|map|inventory|custom",
    "visibility": "player|narrator|both",
    "update_triggers": ["player-action", "narrator-action", "time-based", "event-based"],
    "ui_position": "sidebar|main|floating|bottom",
    "style": {
      "theme": "fantasy|sci-fi|horror|custom",
      "color_scheme": ["#HEX1", "#HEX2", "#HEX3"],
      "icon": "base64-encoded-image-data or path",
      "custom_css": "Custom CSS rules"
    }
  },
  "components": [
    {
      "id": "component-id",
      "type": "numeric|text|progress|toggle|list|grid|custom",
      "name": "Component Name",
      "description": "Component description",
      "default_value": "Default value",
      "current_value": "Current value",
      "history": [
        {
          "value": "Previous value",
          "timestamp": "ISO-8601 timestamp",
          "cause": "Cause of change",
          "narrator_note": "Note from narrator about this change"
        }
      ],
      "display": {
        "format": "Format specification",
        "min": "Minimum value (for numeric)",
        "max": "Maximum value (for numeric)",
        "steps": "Step size (for numeric)",
        "options": ["Option 1", "Option 2"] // For selection components
      },
      "triggers": {
        "on_change": [
          {
            "condition": "Condition for trigger",
            "action": "Action to take",
            "target": "Target component or system",
            "message": "Message to display"
          }
        ],
        "on_threshold": [
          {
            "threshold": "Threshold value",
            "condition": "above|below|equal",
            "action": "Action to take",
            "target": "Target component or system",
            "message": "Message to display"
          }
        ]
      },
      "narrator_guidance": {
        "usage": "How the narrator should use this component",
        "narrative_impact": "How this affects the narrative",
        "update_frequency": "How often this should be updated"
      }
    }
  ],
  "layouts": {
    "default": {
      "grid": [
        ["component-id-1", "component-id-2"],
        ["component-id-3", "component-id-4"]
      ],
      "responsive_behavior": "stack|scroll|hide"
    },
    "compact": {
      "grid": [
        ["component-id-1"],
        ["component-id-2"]
      ],
      "responsive_behavior": "stack|scroll|hide"
    }
  },
  "interactions": {
    "player_permissions": {
      "view": ["component-id-1", "component-id-2"],
      "edit": ["component-id-3"]
    },
    "narrator_commands": [
      {
        "command": "Command syntax",
        "description": "Command description",
        "target": "Target component",
        "action": "Action to perform",
        "parameters": ["param1", "param2"]
      }
    ],
    "api": {
      "get_state": "Method to get tool state",
      "update_component": "Method to update component",
      "trigger_event": "Method to trigger event"
    }
  },
  "series_specific": {
    // This section contains elements specific to the series
    // Example for Re:Zero:
    "return_by_death": {
      "active": true,
      "death_count": 0,
      "last_checkpoint": "Description of last save point",
      "memories_retained": ["Memory 1", "Memory 2"]
    },
    
    // Example for Lovecraftian:
    "sanity_system": {
      "sanity_threshold": 30,
      "hallucination_triggers": ["Trigger 1", "Trigger 2"],
      "recovery_methods": ["Method 1", "Method 2"]
    }
  },
  "narrator_guidance": {
    "tool_purpose": "Overall purpose of this tool",
    "integration_points": "How to integrate this tool into the narrative",
    "update_guidance": "When and how to update this tool",
    "narrative_hooks": [
      {
        "component": "component-id",
        "state": "Component state",
        "narrative_suggestion": "Suggested narrative development"
      }
    ]
  }
}
```

## Field Descriptions

### Metadata
- `version`: Format version for backward compatibility
- `type`: Always "support-tool" for support tools
- `id`: Unique identifier for the tool
- `created`: Creation timestamp
- `modified`: Last modification timestamp
- `series`: The series this tool belongs to
- `title`: Title of the tool

### Tool
- `name`: Name of the tool
- `description`: Description and purpose of the tool
- `type`: Type of tool (tracker, meter, log, map, inventory, custom)
- `visibility`: Who can see the tool (player, narrator, both)
- `update_triggers`: What triggers updates to the tool
- `ui_position`: Where the tool appears in the UI
- `style`: Visual styling of the tool

### Components
Array of individual components that make up the tool:
- `id`: Unique identifier for the component
- `type`: Type of component (numeric, text, progress, toggle, list, grid, custom)
- `name`: Name of the component
- `description`: Description of the component
- `default_value`: Initial value
- `current_value`: Current value
- `history`: History of value changes
- `display`: Display configuration
- `triggers`: Actions triggered by component changes
- `narrator_guidance`: Guidance for the narrator on using this component

### Layouts
Different layouts for displaying the tool:
- `default`: Default layout
- `compact`: Compact layout for limited space
- Each layout includes a grid configuration and responsive behavior

### Interactions
How the tool interacts with the player and narrator:
- `player_permissions`: What components the player can view or edit
- `narrator_commands`: Commands the narrator can use to interact with the tool
- `api`: Methods for programmatic interaction with the tool

### Series Specific
This section contains elements specific to the series. The structure varies based on the series type.

### Narrator Guidance
- `tool_purpose`: Overall purpose of this tool
- `integration_points`: How to integrate this tool into the narrative
- `update_guidance`: When and how to update this tool
- `narrative_hooks`: Suggested narrative developments based on tool state

## Example Support Tools

### Re:Zero Timeline Tracker

```json
{
  "version": "1.0",
  "type": "support-tool",
  "metadata": {
    "id": "rezero-timeline-tracker",
    "created": "2023-05-18T12:00:00Z",
    "modified": "2023-05-18T12:00:00Z",
    "series": "Re:Zero",
    "title": "Return by Death Tracker"
  },
  "tool": {
    "name": "Return by Death Tracker",
    "description": "Tracks the protagonist's deaths, resets, and timeline variations",
    "type": "tracker",
    "visibility": "both",
    "update_triggers": ["narrator-action", "event-based"],
    "ui_position": "sidebar",
    "style": {
      "theme": "fantasy",
      "color_scheme": ["#6a0dad", "#000000", "#ffffff"],
      "icon": "path/to/witch-icon.png"
    }
  },
  "components": [
    {
      "id": "death-counter",
      "type": "numeric",
      "name": "Death Counter",
      "description": "Number of times the protagonist has died",
      "default_value": "0",
      "current_value": "0",
      "display": {
        "format": "Deaths: {value}",
        "min": "0",
        "max": "unlimited"
      },
      "narrator_guidance": {
        "usage": "Increment when the protagonist dies",
        "narrative_impact": "Higher death counts should increase the emotional weight of deaths",
        "update_frequency": "On death events only"
      }
    },
    {
      "id": "current-checkpoint",
      "type": "text",
      "name": "Current Checkpoint",
      "description": "The current 'save point' the protagonist returns to upon death",
      "default_value": "Arrival in Lugnica",
      "current_value": "Arrival in Lugnica",
      "narrator_guidance": {
        "usage": "Update when the checkpoint changes",
        "narrative_impact": "Defines the starting point after each death",
        "update_frequency": "When significant story progress occurs"
      }
    },
    {
      "id": "timeline-log",
      "type": "list",
      "name": "Timeline Log",
      "description": "Log of significant events across timelines",
      "default_value": [],
      "current_value": [
        "Timeline 1: Arrived in Lugnica"
      ],
      "narrator_guidance": {
        "usage": "Add entries for major events in each timeline",
        "narrative_impact": "Helps track what the protagonist has learned across timelines",
        "update_frequency": "When significant events occur"
      }
    },
    {
      "id": "witch-factor",
      "type": "progress",
      "name": "Witch Factor Influence",
      "description": "Level of the Witch's influence on the protagonist",
      "default_value": "10",
      "current_value": "10",
      "display": {
        "format": "Witch's Influence: {value}%",
        "min": "0",
        "max": "100"
      },
      "triggers": {
        "on_threshold": [
          {
            "threshold": "50",
            "condition": "above",
            "action": "notify",
            "message": "The Witch's scent is becoming noticeable to others"
          },
          {
            "threshold": "75",
            "condition": "above",
            "action": "notify",
            "message": "The Witch's influence is affecting the protagonist's mind"
          }
        ]
      },
      "narrator_guidance": {
        "usage": "Increase when Return by Death is used or discussed",
        "narrative_impact": "Higher levels should affect how others perceive the protagonist",
        "update_frequency": "After deaths or when attempting to reveal Return by Death"
      }
    }
  ],
  "layouts": {
    "default": {
      "grid": [
        ["death-counter", "witch-factor"],
        ["current-checkpoint"],
        ["timeline-log"]
      ],
      "responsive_behavior": "stack"
    },
    "compact": {
      "grid": [
        ["death-counter"],
        ["current-checkpoint"]
      ],
      "responsive_behavior": "stack"
    }
  },
  "interactions": {
    "player_permissions": {
      "view": ["death-counter", "current-checkpoint", "timeline-log", "witch-factor"],
      "edit": []
    },
    "narrator_commands": [
      {
        "command": "/death",
        "description": "Register a death and reset to checkpoint",
        "target": "death-counter",
        "action": "increment",
        "parameters": ["cause_of_death"]
      },
      {
        "command": "/checkpoint",
        "description": "Update the current checkpoint",
        "target": "current-checkpoint",
        "action": "update",
        "parameters": ["new_checkpoint_description"]
      },
      {
        "command": "/event",
        "description": "Add an event to the timeline log",
        "target": "timeline-log",
        "action": "append",
        "parameters": ["event_description"]
      }
    ]
  },
  "series_specific": {
    "return_by_death": {
      "active": true,
      "death_count": 0,
      "last_checkpoint": "Arrival in Lugnica",
      "memories_retained": []
    }
  },
  "narrator_guidance": {
    "tool_purpose": "Track the protagonist's deaths and timeline variations to maintain narrative consistency",
    "integration_points": "Reference the death counter when describing the emotional impact of deaths. Use the timeline log to remind the protagonist of knowledge gained in previous loops.",
    "update_guidance": "Update after each death and at significant story milestones",
    "narrative_hooks": [
      {
        "component": "witch-factor",
        "state": "> 50",
        "narrative_suggestion": "Have characters with supernatural sensitivity react to the Witch's scent"
      },
      {
        "component": "death-counter",
        "state": "> 5",
        "narrative_suggestion": "Increase signs of psychological trauma in the protagonist"
      }
    ]
  }
}
```

### Lovecraftian Sanity Meter

```json
{
  "version": "1.0",
  "type": "support-tool",
  "metadata": {
    "id": "lovecraft-sanity-meter",
    "created": "2023-05-18T12:00:00Z",
    "modified": "2023-05-18T12:00:00Z",
    "series": "Lovecraftian Horror",
    "title": "Sanity Meter"
  },
  "tool": {
    "name": "Sanity Meter",
    "description": "Tracks the protagonist's mental state as they encounter cosmic horrors",
    "type": "meter",
    "visibility": "both",
    "update_triggers": ["player-action", "narrator-action", "event-based"],
    "ui_position": "sidebar",
    "style": {
      "theme": "horror",
      "color_scheme": ["#1a472a", "#000000", "#5d5d5d"],
      "icon": "path/to/elder-sign.png"
    }
  },
  "components": [
    {
      "id": "sanity-level",
      "type": "progress",
      "name": "Sanity Level",
      "description": "Current mental stability of the protagonist",
      "default_value": "100",
      "current_value": "100",
      "display": {
        "format": "Sanity: {value}%",
        "min": "0",
        "max": "100"
      },
      "triggers": {
        "on_threshold": [
          {
            "threshold": "70",
            "condition": "below",
            "action": "notify",
            "message": "The protagonist begins experiencing mild hallucinations"
          },
          {
            "threshold": "40",
            "condition": "below",
            "action": "notify",
            "message": "The protagonist has difficulty distinguishing reality from delusion"
          },
          {
            "threshold": "20",
            "condition": "below",
            "action": "notify",
            "message": "The protagonist is on the verge of complete mental breakdown"
          }
        ]
      },
      "narrator_guidance": {
        "usage": "Decrease when the protagonist encounters eldritch horrors or forbidden knowledge",
        "narrative_impact": "Lower levels should manifest as increasingly severe psychological symptoms",
        "update_frequency": "After significant encounters or revelations"
      }
    },
    {
      "id": "eldritch-knowledge",
      "type": "numeric",
      "name": "Eldritch Knowledge",
      "description": "Amount of forbidden knowledge accumulated",
      "default_value": "0",
      "current_value": "0",
      "display": {
        "format": "Forbidden Knowledge: {value}",
        "min": "0",
        "max": "100"
      },
      "triggers": {
        "on_change": [
          {
            "condition": "increase",
            "action": "update",
            "target": "sanity-level",
            "message": "Sanity decreases as knowledge increases"
          }
        ]
      },
      "narrator_guidance": {
        "usage": "Increase when the protagonist learns cosmic truths",
        "narrative_impact": "Higher knowledge should provide both advantages and mental risks",
        "update_frequency": "When discovering significant lore or artifacts"
      }
    },
    {
      "id": "hallucination-log",
      "type": "list",
      "name": "Hallucination Log",
      "description": "Record of hallucinations experienced",
      "default_value": [],
      "current_value": [],
      "narrator_guidance": {
        "usage": "Add entries when the protagonist experiences hallucinations",
        "narrative_impact": "Use these as recurring motifs in the narrative",
        "update_frequency": "When sanity drops below thresholds or after traumatic events"
      }
    },
    {
      "id": "coping-mechanisms",
      "type": "list",
      "name": "Coping Mechanisms",
      "description": "Methods the protagonist uses to maintain sanity",
      "default_value": ["Rational thinking"],
      "current_value": ["Rational thinking"],
      "narrator_guidance": {
        "usage": "Add or remove based on protagonist's actions",
        "narrative_impact": "These provide ways for the protagonist to recover sanity",
        "update_frequency": "When the protagonist develops new coping strategies"
      }
    }
  ],
  "layouts": {
    "default": {
      "grid": [
        ["sanity-level", "eldritch-knowledge"],
        ["hallucination-log"],
        ["coping-mechanisms"]
      ],
      "responsive_behavior": "stack"
    },
    "compact": {
      "grid": [
        ["sanity-level"],
        ["eldritch-knowledge"]
      ],
      "responsive_behavior": "stack"
    }
  },
  "interactions": {
    "player_permissions": {
      "view": ["sanity-level", "eldritch-knowledge", "hallucination-log", "coping-mechanisms"],
      "edit": []
    },
    "narrator_commands": [
      {
        "command": "/sanity",
        "description": "Adjust sanity level",
        "target": "sanity-level",
        "action": "adjust",
        "parameters": ["amount", "reason"]
      },
      {
        "command": "/knowledge",
        "description": "Add eldritch knowledge",
        "target": "eldritch-knowledge",
        "action": "adjust",
        "parameters": ["amount", "knowledge_gained"]
      },
      {
        "command": "/hallucinate",
        "description": "Add a hallucination",
        "target": "hallucination-log",
        "action": "append",
        "parameters": ["hallucination_description"]
      },
      {
        "command": "/cope",
        "description": "Add a coping mechanism",
        "target": "coping-mechanisms",
        "action": "append",
        "parameters": ["mechanism_description"]
      }
    ]
  },
  "series_specific": {
    "sanity_system": {
      "sanity_threshold": 30,
      "hallucination_triggers": ["Eldritch sight", "Forbidden text", "Ritual observation"],
      "recovery_methods": ["Sleep", "Human connection", "Rational analysis"]
    }
  },
  "narrator_guidance": {
    "tool_purpose": "Track the protagonist's mental deterioration as they delve into cosmic horrors",
    "integration_points": "Use sanity levels to determine the nature and frequency of hallucinations. Incorporate eldritch knowledge as both a benefit and a curse.",
    "update_guidance": "Decrease sanity after encounters with the unknown. Allow recovery through coping mechanisms.",
    "narrative_hooks": [
      {
        "component": "sanity-level",
        "state": "< 70",
        "narrative_suggestion": "Introduce minor visual or auditory hallucinations"
      },
      {
        "component": "sanity-level",
        "state": "< 40",
        "narrative_suggestion": "Have the protagonist question their own perceptions and memories"
      },
      {
        "component": "sanity-level",
        "state": "< 20",
        "narrative_suggestion": "Create scenarios where reality and hallucination are indistinguishable"
      },
      {
        "component": "eldritch-knowledge",
        "state": "> 50",
        "narrative_suggestion": "Allow the protagonist to understand eldritch languages or symbols"
      }
    ]
  }
}
```

## Usage Notes

1. Support Tools should be generated at the beginning of a series, tailored to the specific mechanics and themes of that series.
2. The AI Narrator/GM should reference and update these tools throughout the narrative.
3. Tools should be visually integrated into the UI in a way that enhances immersion.
4. The Narrator/GM can update tool states through special commands or structured data in its responses.
5. Players should be able to see tool states that are relevant to their character's knowledge.