# Chat Logs Specification

## Overview

Chat Logs in our platform are structured data that record the interactions between the user (protagonist) and the AI Narrator/GM, including all narrative descriptions, character dialogues, and actions. They also capture the state of Support Tools at various points in the narrative.

## Format Specification

```json
{
  "version": "1.0",
  "type": "chat-log",
  "metadata": {
    "id": "unique-chat-log-id",
    "created": "ISO-8601 timestamp",
    "modified": "ISO-8601 timestamp",
    "series": "name-of-series",
    "title": "Chat Log Title"
  },
  "session": {
    "start_time": "ISO-8601 timestamp",
    "end_time": "ISO-8601 timestamp",
    "duration_seconds": 3600,
    "message_count": 42,
    "protagonist": {
      "name": "Protagonist Name",
      "character_card_id": "character-card-id"
    },
    "lorebook_id": "lorebook-id",
    "support_tools": [
      {
        "id": "support-tool-id",
        "name": "Support Tool Name"
      }
    ],
    "settings": {
      "model": "gemini-pro",
      "temperature": 0.7,
      "max_tokens": 1024,
      "narrator_prompt": "Narrator prompt text",
      "system_prompt": "System prompt text",
      "theme_id": "theme-id"
    }
  },
  "messages": [
    {
      "id": "message-id",
      "timestamp": "ISO-8601 timestamp",
      "type": "system|narrator|protagonist|npc|ooc",
      "sender": {
        "id": "sender-id",
        "name": "Sender Name",
        "avatar": "base64-encoded-image-data or path"
      },
      "content": {
        "text": "Message text",
        "formatted_text": "HTML formatted text",
        "attachments": [
          {
            "type": "image|audio|file",
            "url": "URL or path",
            "description": "Attachment description"
          }
        ],
        "actions": [
          {
            "type": "emote|action|thought",
            "text": "Action text"
          }
        ]
      },
      "metadata": {
        "is_edited": false,
        "edit_history": [],
        "is_regenerated": false,
        "regeneration_history": [],
        "tokens": 150,
        "processing_time_ms": 1200
      }
    }
  ],
  "tool_snapshots": [
    {
      "timestamp": "ISO-8601 timestamp",
      "message_id": "message-id",
      "tool_id": "support-tool-id",
      "state": {
        // Complete state of the tool at this point
        "components": [
          {
            "id": "component-id",
            "current_value": "Value at this point"
          }
        ]
      },
      "changes": [
        {
          "component_id": "component-id",
          "previous_value": "Previous value",
          "new_value": "New value",
          "cause": "Cause of change"
        }
      ]
    }
  ],
  "bookmarks": [
    {
      "id": "bookmark-id",
      "name": "Bookmark Name",
      "description": "Bookmark description",
      "message_id": "message-id",
      "timestamp": "ISO-8601 timestamp",
      "tool_snapshot_ids": ["tool-snapshot-id"]
    }
  ],
  "narrative_markers": [
    {
      "id": "marker-id",
      "type": "chapter|scene|event|decision",
      "name": "Marker Name",
      "description": "Marker description",
      "message_id": "message-id",
      "timestamp": "ISO-8601 timestamp"
    }
  ],
  "context_window": {
    "size": 16384,
    "strategy": "sliding|fixed|adaptive",
    "included_messages": ["message-id-1", "message-id-2"],
    "included_tool_snapshots": ["tool-snapshot-id-1"],
    "included_character_cards": ["character-card-id-1", "character-card-id-2"],
    "included_lorebook_entries": ["lorebook-entry-id-1", "lorebook-entry-id-2"]
  },
  "export": {
    "formats": ["txt", "html", "pdf", "json"],
    "last_exported": "ISO-8601 timestamp",
    "export_settings": {
      "include_metadata": true,
      "include_tool_snapshots": true,
      "include_ooc_messages": false,
      "formatting_style": "minimal|rich|custom"
    }
  }
}
```

## Field Descriptions

### Metadata
- `version`: Format version for backward compatibility
- `type`: Always "chat-log" for chat logs
- `id`: Unique identifier for the chat log
- `created`: Creation timestamp
- `modified`: Last modification timestamp
- `series`: The series this chat log belongs to
- `title`: Title of the chat log

### Session
- `start_time`: When the session started
- `end_time`: When the session ended
- `duration_seconds`: Session duration in seconds
- `message_count`: Total number of messages
- `protagonist`: Information about the protagonist character
- `lorebook_id`: ID of the lorebook used
- `support_tools`: List of support tools used
- `settings`: Session settings including model, temperature, etc.

### Messages
Array of individual messages in the chat:
- `id`: Unique identifier for the message
- `timestamp`: When the message was sent
- `type`: Type of message (system, narrator, protagonist, npc, ooc)
- `sender`: Information about the message sender
- `content`: Message content including text, formatting, attachments, and actions
- `metadata`: Additional information about the message

### Tool Snapshots
Snapshots of support tool states at various points in the narrative:
- `timestamp`: When the snapshot was taken
- `message_id`: ID of the message that triggered the snapshot
- `tool_id`: ID of the support tool
- `state`: Complete state of the tool at this point
- `changes`: Changes made to the tool since the last snapshot

### Bookmarks
User-created bookmarks in the chat:
- `id`: Unique identifier for the bookmark
- `name`: Bookmark name
- `description`: Bookmark description
- `message_id`: ID of the bookmarked message
- `timestamp`: When the bookmark was created
- `tool_snapshot_ids`: IDs of tool snapshots associated with this bookmark

### Narrative Markers
Markers for significant points in the narrative:
- `id`: Unique identifier for the marker
- `type`: Type of marker (chapter, scene, event, decision)
- `name`: Marker name
- `description`: Marker description
- `message_id`: ID of the marked message
- `timestamp`: When the marker was created

### Context Window
Information about the context window used by the AI:
- `size`: Size of the context window in tokens
- `strategy`: Strategy for managing the context window
- `included_messages`: IDs of messages included in the context
- `included_tool_snapshots`: IDs of tool snapshots included in the context
- `included_character_cards`: IDs of character cards included in the context
- `included_lorebook_entries`: IDs of lorebook entries included in the context

### Export
Information about exporting the chat log:
- `formats`: Available export formats
- `last_exported`: When the chat log was last exported
- `export_settings`: Settings for exporting the chat log

## Example Chat Log

```json
{
  "version": "1.0",
  "type": "chat-log",
  "metadata": {
    "id": "cl-rezero-2023-05-18",
    "created": "2023-05-18T12:00:00Z",
    "modified": "2023-05-18T14:30:00Z",
    "series": "Re:Zero",
    "title": "Beginning Life in Another World"
  },
  "session": {
    "start_time": "2023-05-18T12:00:00Z",
    "end_time": "2023-05-18T14:30:00Z",
    "duration_seconds": 9000,
    "message_count": 42,
    "protagonist": {
      "name": "Subaru Natsuki",
      "character_card_id": "cc-subaru-natsuki"
    },
    "lorebook_id": "lb-rezero",
    "support_tools": [
      {
        "id": "rezero-timeline-tracker",
        "name": "Return by Death Tracker"
      }
    ],
    "settings": {
      "model": "gemini-pro",
      "temperature": 0.7,
      "max_tokens": 1024,
      "narrator_prompt": "You are the Narrator for a Re:Zero RPG experience...",
      "system_prompt": "This is an immersive RPG experience set in the world of Re:Zero...",
      "theme_id": "theme-fantasy-dark"
    }
  },
  "messages": [
    {
      "id": "msg-001",
      "timestamp": "2023-05-18T12:00:00Z",
      "type": "system",
      "sender": {
        "id": "system",
        "name": "System",
        "avatar": "path/to/system-avatar.png"
      },
      "content": {
        "text": "Welcome to Re:Zero - Beginning Life in Another World. You are playing as Subaru Natsuki, a shut-in who has been suddenly transported to a fantasy world."
      },
      "metadata": {
        "is_edited": false,
        "edit_history": [],
        "is_regenerated": false,
        "regeneration_history": [],
        "tokens": 35,
        "processing_time_ms": 100
      }
    },
    {
      "id": "msg-002",
      "timestamp": "2023-05-18T12:01:00Z",
      "type": "narrator",
      "sender": {
        "id": "narrator",
        "name": "Narrator",
        "avatar": "path/to/narrator-avatar.png"
      },
      "content": {
        "text": "The bustling sounds of a marketplace fill your ears as you blink in confusion. One moment, you were leaving the convenience store with a bag of snacks, and the next... you're standing in the middle of a medieval fantasy town. People in strange clothing walk past, some with animal-like features. The architecture is unlike anything you've seen before, with stone buildings and colorful banners hanging from windows.\n\nYou look down at yourself - you're still wearing your tracksuit and carrying your plastic shopping bag. A few passersby give you curious glances, but most simply go about their business.\n\nWhat do you do, Subaru?",
        "formatted_text": "<p>The bustling sounds of a marketplace fill your ears as you blink in confusion. One moment, you were leaving the convenience store with a bag of snacks, and the next... you're standing in the middle of a medieval fantasy town. People in strange clothing walk past, some with animal-like features. The architecture is unlike anything you've seen before, with stone buildings and colorful banners hanging from windows.</p><p>You look down at yourself - you're still wearing your tracksuit and carrying your plastic shopping bag. A few passersby give you curious glances, but most simply go about their business.</p><p>What do you do, Subaru?</p>"
      },
      "metadata": {
        "is_edited": false,
        "edit_history": [],
        "is_regenerated": false,
        "regeneration_history": [],
        "tokens": 150,
        "processing_time_ms": 1200
      }
    },
    {
      "id": "msg-003",
      "timestamp": "2023-05-18T12:03:00Z",
      "type": "protagonist",
      "sender": {
        "id": "protagonist",
        "name": "Subaru Natsuki",
        "avatar": "path/to/subaru-avatar.png"
      },
      "content": {
        "text": "I look around in amazement, trying to take in everything at once. \"What the... is this some kind of elaborate prank? Or am I in one of those hidden camera shows?\" I spin around, looking for cameras or anything familiar. After a moment, I approach one of the less intimidating passersby, someone who doesn't have animal features. \"Excuse me! Could you tell me where I am right now?\"",
        "actions": [
          {
            "type": "action",
            "text": "looks around in amazement"
          },
          {
            "type": "thought",
            "text": "Is this some kind of elaborate prank?"
          }
        ]
      },
      "metadata": {
        "is_edited": false,
        "edit_history": [],
        "is_regenerated": false,
        "regeneration_history": [],
        "tokens": 120,
        "processing_time_ms": 0
      }
    }
  ],
  "tool_snapshots": [
    {
      "timestamp": "2023-05-18T12:00:00Z",
      "message_id": "msg-001",
      "tool_id": "rezero-timeline-tracker",
      "state": {
        "components": [
          {
            "id": "death-counter",
            "current_value": "0"
          },
          {
            "id": "current-checkpoint",
            "current_value": "Arrival in Lugnica"
          },
          {
            "id": "timeline-log",
            "current_value": [
              "Timeline 1: Arrived in Lugnica"
            ]
          },
          {
            "id": "witch-factor",
            "current_value": "10"
          }
        ]
      },
      "changes": []
    }
  ],
  "bookmarks": [
    {
      "id": "bm-001",
      "name": "Starting Point",
      "description": "Subaru's arrival in Lugnica",
      "message_id": "msg-002",
      "timestamp": "2023-05-18T12:05:00Z",
      "tool_snapshot_ids": ["tool-snapshot-id-1"]
    }
  ],
  "narrative_markers": [
    {
      "id": "nm-001",
      "type": "chapter",
      "name": "Chapter 1: Arrival",
      "description": "Subaru arrives in the fantasy world",
      "message_id": "msg-002",
      "timestamp": "2023-05-18T12:01:00Z"
    }
  ],
  "context_window": {
    "size": 16384,
    "strategy": "sliding",
    "included_messages": ["msg-001", "msg-002", "msg-003"],
    "included_tool_snapshots": ["tool-snapshot-id-1"],
    "included_character_cards": ["cc-subaru-natsuki"],
    "included_lorebook_entries": ["lb-entry-lugnica", "lb-entry-return-by-death"]
  },
  "export": {
    "formats": ["txt", "html", "pdf", "json"],
    "last_exported": "2023-05-18T14:35:00Z",
    "export_settings": {
      "include_metadata": true,
      "include_tool_snapshots": true,
      "include_ooc_messages": false,
      "formatting_style": "rich"
    }
  }
}
```

## Usage Notes

1. Chat logs should automatically save during sessions to prevent data loss.
2. Tool snapshots should be taken whenever a support tool's state changes.
3. The context window information helps debug and optimize AI performance.
4. Bookmarks and narrative markers help users navigate long chat logs.
5. Export functionality should support multiple formats for sharing and archiving.