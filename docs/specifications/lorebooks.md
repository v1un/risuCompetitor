# Lorebook Specification

## Overview

Lorebooks in our platform are JSON-based data structures that define the world, settings, rules, and lore of a series. They provide context for the AI Narrator/GM to create consistent and immersive narratives.

## Format Specification

```json
{
  "version": "1.0",
  "type": "lorebook",
  "metadata": {
    "id": "unique-lorebook-id",
    "created": "ISO-8601 timestamp",
    "modified": "ISO-8601 timestamp",
    "series": "name-of-series",
    "title": "Lorebook Title"
  },
  "world": {
    "overview": "General description of the world/setting",
    "history": "Historical timeline and significant events",
    "geography": {
      "regions": [
        {
          "name": "Region Name",
          "description": "Region description",
          "notable_locations": [
            {
              "name": "Location Name",
              "description": "Location description",
              "significance": "Location's importance to the story"
            }
          ],
          "climate": "Climate description",
          "culture": "Cultural aspects of this region"
        }
      ],
      "maps": [
        {
          "name": "Map Name",
          "description": "Map description",
          "image": "base64-encoded-image-data or path"
        }
      ]
    },
    "factions": [
      {
        "name": "Faction Name",
        "description": "Faction description",
        "goals": "Faction goals and motivations",
        "notable_members": ["Character Name 1", "Character Name 2"],
        "relationships": [
          {
            "faction": "Other Faction Name",
            "status": "ally|enemy|neutral",
            "details": "Details about the relationship"
          }
        ]
      }
    ]
  },
  "rules": {
    "magic_system": {
      "overview": "Overview of how magic works",
      "types": [
        {
          "name": "Magic Type",
          "description": "Description of this magic type",
          "capabilities": "What this magic can do",
          "limitations": "Limitations of this magic"
        }
      ],
      "acquisition": "How magic is learned or acquired",
      "societal_view": "How society views magic"
    },
    "technology": {
      "level": "General technology level",
      "notable_tech": [
        {
          "name": "Technology Name",
          "description": "Technology description",
          "impact": "Impact on society"
        }
      ]
    },
    "social_structure": {
      "overview": "Overview of social hierarchy",
      "classes": [
        {
          "name": "Social Class",
          "description": "Description of this social class",
          "privileges": "Class privileges",
          "limitations": "Class limitations"
        }
      ],
      "governance": "Description of governance systems"
    },
    "combat": {
      "overview": "Overview of combat in this world",
      "systems": "Description of combat systems",
      "weapons": "Common weapons and their effectiveness",
      "tactics": "Common tactics and strategies"
    }
  },
  "narrative_elements": {
    "themes": ["Theme 1", "Theme 2"],
    "tone": "Overall tone of the narrative",
    "pacing": "Guidance on narrative pacing",
    "plot_points": [
      {
        "name": "Plot Point Name",
        "description": "Plot point description",
        "triggers": "What triggers this plot point",
        "consequences": "Potential consequences"
      }
    ],
    "story_arcs": [
      {
        "name": "Story Arc Name",
        "description": "Story arc description",
        "phases": [
          {
            "name": "Phase Name",
            "description": "Phase description",
            "key_events": ["Event 1", "Event 2"]
          }
        ]
      }
    ]
  },
  "series_specific": {
    // This section contains elements specific to the series
    // Example for a fantasy series:
    "prophecies": [
      {
        "text": "Prophecy text",
        "interpretation": "Common interpretation",
        "true_meaning": "Actual meaning (for Narrator only)"
      }
    ],
    
    // Example for a sci-fi series:
    "alien_species": [
      {
        "name": "Species Name",
        "description": "Species description",
        "biology": "Biological characteristics",
        "culture": "Cultural aspects",
        "relations": "Relations with humans/other species"
      }
    ]
  },
  "narrator_guidance": {
    "starting_point": "Canonical starting point for the narrative",
    "key_npcs": ["NPC 1", "NPC 2"],
    "narrative_hooks": [
      {
        "description": "Hook description",
        "potential_developments": ["Development 1", "Development 2"]
      }
    ],
    "secrets": [
      {
        "description": "Secret description",
        "revelation_timing": "When/how this should be revealed",
        "impact": "Impact on the narrative"
      }
    ],
    "challenge_balance": "Guidance on balancing challenges for the protagonist",
    "world_consistency": "Notes on maintaining world consistency"
  },
  "visualization": {
    "style_guide": "Visual style guidance",
    "key_visuals": [
      {
        "name": "Visual Name",
        "description": "Visual description",
        "image": "base64-encoded-image-data or path"
      }
    ],
    "color_palette": ["#HEX1", "#HEX2", "#HEX3"]
  }
}
```

## Field Descriptions

### Metadata
- `version`: Format version for backward compatibility
- `type`: Always "lorebook" for lorebooks
- `id`: Unique identifier for the lorebook
- `created`: Creation timestamp
- `modified`: Last modification timestamp
- `series`: The series this lorebook belongs to
- `title`: Title of the lorebook

### World
- `overview`: General description of the world/setting
- `history`: Historical timeline and significant events
- `geography`: Regions, locations, and maps
- `factions`: Groups, organizations, and their relationships

### Rules
- `magic_system`: Rules and details about magic in the world
- `technology`: Technology level and notable technologies
- `social_structure`: Social hierarchy and governance
- `combat`: Combat systems and mechanics

### Narrative Elements
- `themes`: Major themes of the narrative
- `tone`: Overall tone of the narrative
- `pacing`: Guidance on narrative pacing
- `plot_points`: Key plot points and their triggers
- `story_arcs`: Major story arcs and their phases

### Series Specific
This section contains elements specific to the series. The structure varies based on the series type (fantasy, sci-fi, etc.).

### Narrator Guidance
- `starting_point`: Canonical starting point for the narrative
- `key_npcs`: Important NPCs for the narrative
- `narrative_hooks`: Potential hooks for the Narrator to use
- `secrets`: Hidden elements to be revealed at appropriate times
- `challenge_balance`: Guidance on balancing challenges
- `world_consistency`: Notes on maintaining world consistency

### Visualization
- `style_guide`: Visual style guidance
- `key_visuals`: Important visual elements
- `color_palette`: Color scheme for the series

## Usage Notes

1. Lorebooks should be generated at the beginning of a series, focusing on the canonical starting point.
2. The lorebook provides the AI Narrator/GM with the necessary context to create a consistent and immersive narrative.
3. Users can edit and expand the lorebook as the narrative progresses.
4. Series-specific elements should be tailored to match the theme and mechanics of the chosen series.