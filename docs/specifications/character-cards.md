# Character Card Specification

## Overview

Character Cards in our platform are JSON-based data structures that define characters within the RPG narrative. Unlike other platforms, our format is specifically designed to support rich RPG mechanics and series-specific attributes.

## Format Specification

```json
{
  "version": "1.0",
  "type": "character",
  "metadata": {
    "id": "unique-character-id",
    "created": "ISO-8601 timestamp",
    "modified": "ISO-8601 timestamp",
    "series": "name-of-series"
  },
  "character": {
    "name": "Character Name",
    "role": "protagonist|npc|antagonist",
    "avatar": "base64-encoded-image-data or path",
    "description": "Detailed character description",
    "background": "Character backstory and history",
    "personality": {
      "traits": ["trait1", "trait2", "..."],
      "quirks": ["quirk1", "quirk2", "..."],
      "motivations": ["motivation1", "motivation2", "..."]
    },
    "appearance": "Detailed physical description",
    "speech_patterns": "Description of how the character speaks",
    "relationships": [
      {
        "character_id": "related-character-id",
        "name": "Related Character Name",
        "relationship": "Description of relationship",
        "dynamics": "How they interact"
      }
    ]
  },
  "rpg_attributes": {
    "stats": {
      "strength": 10,
      "dexterity": 10,
      "constitution": 10,
      "intelligence": 10,
      "wisdom": 10,
      "charisma": 10
    },
    "skills": [
      {
        "name": "Skill Name",
        "description": "Skill description",
        "level": 5
      }
    ],
    "abilities": [
      {
        "name": "Ability Name",
        "description": "Ability description",
        "effects": "Game effects",
        "limitations": "Limitations or cooldowns"
      }
    ],
    "inventory": [
      {
        "name": "Item Name",
        "description": "Item description",
        "effects": "Item effects"
      }
    ]
  },
  "series_specific": {
    // This section contains attributes specific to the series
    // Example for a magic-based series:
    "magic_affinity": "Fire",
    "spell_repertoire": ["Fireball", "Heat Wave"],
    
    // Example for a sci-fi series:
    "tech_proficiency": 8,
    "augmentations": ["Neural Interface", "Optical Enhancement"]
  },
  "narrator_guidance": {
    "character_voice": "Guidelines for how the Narrator should portray this character",
    "narrative_role": "Character's role in the story",
    "development_arc": "Planned character development",
    "interaction_notes": "Notes on how this character interacts with the protagonist"
  },
  "visualization": {
    "portrait": "base64-encoded-image-data or path",
    "full_body": "base64-encoded-image-data or path",
    "expressions": [
      {
        "name": "happy",
        "image": "base64-encoded-image-data or path"
      },
      {
        "name": "sad",
        "image": "base64-encoded-image-data or path"
      }
    ]
  }
}
```

## Field Descriptions

### Metadata
- `version`: Format version for backward compatibility
- `type`: Always "character" for character cards
- `id`: Unique identifier for the character
- `created`: Creation timestamp
- `modified`: Last modification timestamp
- `series`: The series this character belongs to

### Character
- `name`: Character's full name
- `role`: Character's role in the narrative
- `avatar`: Primary visual representation
- `description`: General character description
- `background`: Character's history and backstory
- `personality`: Character's personality traits, quirks, and motivations
- `appearance`: Detailed physical description
- `speech_patterns`: How the character speaks and communicates
- `relationships`: Character's relationships with other characters

### RPG Attributes
- `stats`: Basic RPG statistics (can be customized per series)
- `skills`: Character's learned abilities
- `abilities`: Special powers or capabilities
- `inventory`: Items the character possesses

### Series Specific
This section contains attributes that are specific to the series. The structure varies based on the series type (fantasy, sci-fi, etc.).

### Narrator Guidance
- `character_voice`: Guidelines for the AI on how to portray this character
- `narrative_role`: Character's role in the overall narrative
- `development_arc`: Planned character development
- `interaction_notes`: Notes on character interactions

### Visualization
- `portrait`: Character portrait image
- `full_body`: Full body image
- `expressions`: Different character expressions for dynamic storytelling

## Usage Notes

1. Character cards should be generated at the beginning of a series, focusing on the canonical starting point.
2. The protagonist character card is typically created first and can be edited by the user.
3. NPC character cards are generated as needed and can be saved to the character library.
4. Series-specific attributes should be tailored to match the theme and mechanics of the chosen series.