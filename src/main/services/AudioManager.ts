import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Audio categories
export enum AudioCategory {
  AMBIENT = 'ambient',
  SOUND_EFFECT = 'sound_effect',
  VOICE = 'voice',
  MUSIC = 'music'
}

// Audio file metadata
export interface AudioMetadata {
  id: string;
  name: string;
  category: AudioCategory;
  duration: number;
  path: string;
  isBuiltIn: boolean;
  tags: string[];
  volume?: number;
  loop?: boolean;
  createdAt: Date;
}

// TTS voice options
export interface TTSVoice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  language: string;
  accent?: string;
  provider: string;
}

// TTS parameters
export interface TTSParams {
  text: string;
  voice: string;
  speed?: number;
  pitch?: number;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'excited';
}

/**
 * Service for managing audio playback, sound effects, and text-to-speech
 */
export class AudioManager {
  private static instance: AudioManager;
  private audioPath: string;
  private builtInAudioPath: string;
  private audioCache: Map<string, AudioMetadata> = new Map();
  private availableVoices: TTSVoice[] = [];
  private apiKeys: Record<string, string | null> = {
    'elevenlabs': null,
    'google': null,
    'azure': null
  };
  private globalVolume: number = 1.0;
  private categoryVolumes: Record<AudioCategory, number> = {
    [AudioCategory.AMBIENT]: 0.5,
    [AudioCategory.SOUND_EFFECT]: 0.7,
    [AudioCategory.VOICE]: 1.0,
    [AudioCategory.MUSIC]: 0.6
  };
  private muted: boolean = false;

  private constructor() {
    this.audioPath = path.join(app.getPath('userData'), 'audio');
    this.builtInAudioPath = path.join(app.getAppPath(), 'assets', 'audio');
    this.ensureAudioDirectory();
    this.initializeBuiltInAudio();
    this.initializeVoices();
  }

  /**
   * Get the singleton instance of AudioManager
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Ensure the audio directory exists
   */
  private ensureAudioDirectory(): void {
    if (!fs.existsSync(this.audioPath)) {
      fs.mkdirSync(this.audioPath, { recursive: true });
    }
  }

  /**
   * Initialize built-in audio files
   */
  private initializeBuiltInAudio(): void {
    // In a real implementation, this would scan the built-in audio directory
    // For now, we'll add some mock built-in audio files
    
    // Ambient sounds
    this.addBuiltInAudio('forest_ambient', 'Forest Ambience', AudioCategory.AMBIENT, 180, ['nature', 'forest', 'peaceful']);
    this.addBuiltInAudio('tavern_ambient', 'Tavern Ambience', AudioCategory.AMBIENT, 240, ['medieval', 'tavern', 'crowd']);
    this.addBuiltInAudio('space_ambient', 'Space Ambience', AudioCategory.AMBIENT, 200, ['space', 'sci-fi', 'quiet']);
    this.addBuiltInAudio('rain_ambient', 'Rainstorm', AudioCategory.AMBIENT, 300, ['weather', 'rain', 'storm']);
    
    // Sound effects
    this.addBuiltInAudio('sword_clash', 'Sword Clash', AudioCategory.SOUND_EFFECT, 2, ['combat', 'weapon', 'medieval']);
    this.addBuiltInAudio('fireball', 'Fireball', AudioCategory.SOUND_EFFECT, 3, ['magic', 'fire', 'spell']);
    this.addBuiltInAudio('door_open', 'Door Opening', AudioCategory.SOUND_EFFECT, 1.5, ['door', 'wood', 'creak']);
    this.addBuiltInAudio('dice_roll', 'Dice Roll', AudioCategory.SOUND_EFFECT, 2, ['dice', 'game', 'roll']);
    this.addBuiltInAudio('victory', 'Victory Fanfare', AudioCategory.SOUND_EFFECT, 4, ['success', 'achievement', 'fanfare']);
    
    // Music
    this.addBuiltInAudio('epic_battle', 'Epic Battle Theme', AudioCategory.MUSIC, 180, ['battle', 'orchestral', 'intense']);
    this.addBuiltInAudio('peaceful_village', 'Peaceful Village', AudioCategory.MUSIC, 210, ['peaceful', 'village', 'calm']);
    this.addBuiltInAudio('mysterious_dungeon', 'Mysterious Dungeon', AudioCategory.MUSIC, 195, ['dungeon', 'mysterious', 'tense']);
    this.addBuiltInAudio('victory_theme', 'Victory Theme', AudioCategory.MUSIC, 45, ['victory', 'celebration', 'upbeat']);
  }

  /**
   * Add a built-in audio file to the cache
   */
  private addBuiltInAudio(id: string, name: string, category: AudioCategory, duration: number, tags: string[]): void {
    const audioPath = path.join(this.builtInAudioPath, `${id}.mp3`);
    
    const metadata: AudioMetadata = {
      id,
      name,
      category,
      duration,
      path: audioPath,
      isBuiltIn: true,
      tags,
      loop: category === AudioCategory.AMBIENT || category === AudioCategory.MUSIC,
      createdAt: new Date()
    };
    
    this.audioCache.set(id, metadata);
  }

  /**
   * Initialize available TTS voices
   */
  private initializeVoices(): void {
    // ElevenLabs voices
    this.availableVoices.push(
      {
        id: 'elevenlabs-adam',
        name: 'Adam',
        gender: 'male',
        language: 'en-US',
        provider: 'elevenlabs'
      },
      {
        id: 'elevenlabs-rachel',
        name: 'Rachel',
        gender: 'female',
        language: 'en-US',
        provider: 'elevenlabs'
      },
      {
        id: 'elevenlabs-sam',
        name: 'Sam',
        gender: 'male',
        language: 'en-US',
        accent: 'british',
        provider: 'elevenlabs'
      }
    );
    
    // Google voices
    this.availableVoices.push(
      {
        id: 'google-en-US-Standard-D',
        name: 'Standard Male',
        gender: 'male',
        language: 'en-US',
        provider: 'google'
      },
      {
        id: 'google-en-US-Standard-F',
        name: 'Standard Female',
        gender: 'female',
        language: 'en-US',
        provider: 'google'
      },
      {
        id: 'google-en-GB-Standard-B',
        name: 'British Male',
        gender: 'male',
        language: 'en-GB',
        provider: 'google'
      }
    );
    
    // Azure voices
    this.availableVoices.push(
      {
        id: 'azure-en-US-GuyNeural',
        name: 'Guy',
        gender: 'male',
        language: 'en-US',
        provider: 'azure'
      },
      {
        id: 'azure-en-US-JennyNeural',
        name: 'Jenny',
        gender: 'female',
        language: 'en-US',
        provider: 'azure'
      },
      {
        id: 'azure-en-GB-RyanNeural',
        name: 'Ryan',
        gender: 'male',
        language: 'en-GB',
        provider: 'azure'
      }
    );
  }

  /**
   * Set API key for a provider
   */
  public setApiKey(provider: string, apiKey: string): void {
    if (this.apiKeys.hasOwnProperty(provider)) {
      this.apiKeys[provider] = apiKey;
    }
  }

  /**
   * Get all available audio files
   */
  public getAllAudio(): AudioMetadata[] {
    return Array.from(this.audioCache.values());
  }

  /**
   * Get audio by category
   */
  public getAudioByCategory(category: AudioCategory): AudioMetadata[] {
    return Array.from(this.audioCache.values())
      .filter(audio => audio.category === category);
  }

  /**
   * Get audio by ID
   */
  public getAudioById(id: string): AudioMetadata | undefined {
    return this.audioCache.get(id);
  }

  /**
   * Search audio by name or tags
   */
  public searchAudio(query: string): AudioMetadata[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.audioCache.values())
      .filter(audio => 
        audio.name.toLowerCase().includes(lowerQuery) ||
        audio.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
  }

  /**
   * Add a new audio file
   */
  public addAudio(
    name: string,
    category: AudioCategory,
    filePath: string,
    duration: number,
    tags: string[] = [],
    loop: boolean = false
  ): AudioMetadata {
    const id = uuidv4();
    const fileName = `${id}${path.extname(filePath)}`;
    const destPath = path.join(this.audioPath, fileName);
    
    // Copy file to audio directory
    fs.copyFileSync(filePath, destPath);
    
    const metadata: AudioMetadata = {
      id,
      name,
      category,
      duration,
      path: destPath,
      isBuiltIn: false,
      tags,
      loop,
      createdAt: new Date()
    };
    
    this.audioCache.set(id, metadata);
    return metadata;
  }

  /**
   * Delete an audio file
   */
  public deleteAudio(id: string): boolean {
    const audio = this.audioCache.get(id);
    
    if (!audio) {
      return false;
    }
    
    // Can't delete built-in audio
    if (audio.isBuiltIn) {
      return false;
    }
    
    try {
      // Delete file
      if (fs.existsSync(audio.path)) {
        fs.unlinkSync(audio.path);
      }
      
      // Remove from cache
      this.audioCache.delete(id);
      return true;
    } catch (error) {
      console.error('Failed to delete audio:', error);
      return false;
    }
  }

  /**
   * Get all available TTS voices
   */
  public getAvailableVoices(): TTSVoice[] {
    return [...this.availableVoices];
  }

  /**
   * Get voices for a specific provider
   */
  public getVoicesForProvider(provider: string): TTSVoice[] {
    return this.availableVoices.filter(voice => voice.provider === provider);
  }

  /**
   * Generate speech from text
   * 
   * NOTE: This is a placeholder implementation. In a production environment,
   * this would connect to a TTS service API.
   */
  public async generateSpeech(params: TTSParams): Promise<AudioMetadata> {
    const voice = this.availableVoices.find(v => v.id === params.voice);
    
    if (!voice) {
      throw new Error(`Voice ${params.voice} not found`);
    }
    
    // Check if API key is set
    if (!this.apiKeys[voice.provider]) {
      throw new Error(`API key for ${voice.provider} is not set`);
    }
    
    try {
      // FEATURE NOT YET IMPLEMENTED
      // Display a user-friendly message
      console.warn('TTS functionality is not yet fully implemented');
      
      const id = uuidv4();
      const fileName = `${id}.mp3`;
      const filePath = path.join(this.audioPath, fileName);
      
      // Create a placeholder file with a note about the feature being in development
      fs.writeFileSync(filePath, 'This is a placeholder file. Text-to-speech functionality is currently in development.');
      
      // Estimate duration based on text length (very rough estimate)
      const wordCount = params.text.split(/\s+/).length;
      const duration = wordCount * 0.3; // Roughly 3 words per second
      
      const metadata: AudioMetadata = {
        id,
        name: `Generated Speech (${voice.name}) [PLACEHOLDER]`,
        category: AudioCategory.VOICE,
        duration,
        path: filePath,
        isBuiltIn: false,
        tags: ['generated', 'speech', voice.gender, voice.language, 'placeholder'],
        createdAt: new Date()
      };
      
      this.audioCache.set(id, metadata);
      
      // Return the metadata but also inform the caller about the placeholder status
      return {
        ...metadata,
        // @ts-ignore - Adding a non-standard property to indicate placeholder status
        isPlaceholder: true
      } as AudioMetadata;
    } catch (error) {
      console.error('Failed to generate speech:', error);
      throw new Error(`Speech generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set global volume
   */
  public setGlobalVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get global volume
   */
  public getGlobalVolume(): number {
    return this.globalVolume;
  }

  /**
   * Set volume for a category
   */
  public setCategoryVolume(category: AudioCategory, volume: number): void {
    this.categoryVolumes[category] = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get volume for a category
   */
  public getCategoryVolume(category: AudioCategory): number {
    return this.categoryVolumes[category];
  }

  /**
   * Set muted state
   */
  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  /**
   * Get muted state
   */
  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Get effective volume for an audio file
   */
  public getEffectiveVolume(audio: AudioMetadata): number {
    if (this.muted) {
      return 0;
    }
    
    const categoryVolume = this.categoryVolumes[audio.category];
    const audioVolume = audio.volume !== undefined ? audio.volume : 1.0;
    
    return this.globalVolume * categoryVolume * audioVolume;
  }

  /**
   * Download an audio file from a URL
   * 
   * NOTE: This is a partially implemented feature. In a production environment,
   * this would include proper audio file validation and metadata extraction.
   */
  public async downloadAudio(
    url: string,
    name: string,
    category: AudioCategory,
    tags: string[] = [],
    loop: boolean = false
  ): Promise<AudioMetadata> {
    try {
      // FEATURE PARTIALLY IMPLEMENTED
      console.warn('Audio download functionality is partially implemented');
      
      // Attempt to download the file
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      
      const id = uuidv4();
      const extension = this.getFileExtensionFromUrl(url) || 'mp3';
      const fileName = `${id}.${extension}`;
      const filePath = path.join(this.audioPath, fileName);
      
      fs.writeFileSync(filePath, buffer);
      
      // TODO: Implement proper audio duration detection
      // For now, we'll use a placeholder value and mark it as such
      const duration = 60; // 1 minute placeholder
      
      const metadata: AudioMetadata = {
        id,
        name: `${name} [Duration Estimate]`,
        category,
        duration,
        path: filePath,
        isBuiltIn: false,
        tags: [...tags, 'duration-estimate'],
        loop,
        createdAt: new Date()
      };
      
      this.audioCache.set(id, metadata);
      
      // Return the metadata with a note about the duration being estimated
      return {
        ...metadata,
        // @ts-ignore - Adding a non-standard property to indicate duration is estimated
        durationEstimated: true
      } as AudioMetadata;
    } catch (error) {
      console.error('Failed to download audio:', error);
      throw new Error(`Failed to download audio: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get file extension from URL
   */
  private getFileExtensionFromUrl(url: string): string | null {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
    return match ? match[1].toLowerCase() : null;
  }

  /**
   * Create a playlist
   */
  public createPlaylist(
    name: string,
    audioIds: string[],
    shuffle: boolean = false,
    crossfadeDuration: number = 2
  ): string {
    // In a real implementation, this would create a playlist in the database
    // For now, we'll just return a mock playlist ID
    return uuidv4();
  }

  /**
   * Get audio duration
   */
  public getAudioDuration(filePath: string): Promise<number> {
    // In a real implementation, this would analyze the audio file to get its duration
    // For now, we'll return a placeholder value
    return Promise.resolve(60); // 1 minute
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();