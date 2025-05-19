import { v4 as uuidv4 } from 'uuid';
import { 
  CombatEncounter, 
  CombatParticipant, 
  CombatCondition, 
  CombatLogEntry,
  CombatAction,
  CombatLoot,
  DiceRoll,
  AttackRoll,
  DamageRoll,
  SavingThrowRoll,
  CombatSettings,
  CombatState
} from '../../shared/types';

/**
 * CombatManager handles all combat-related functionality
 */
class CombatManager {
  private state: CombatState;
  private listeners: Array<(state: CombatState) => void> = [];

  constructor() {
    // Initialize with default settings
    this.state = {
      encounters: {},
      settings: {
        initiativeType: 'individual',
        autoEndTurn: false,
        showDiceRolls: true,
        confirmActions: true,
        trackResources: true,
        trackConditions: true,
        useGrid: true,
        useRealTimeTracking: false,
        allowPlayerRolls: true,
        narratorControlsNPCs: true
      }
    };
  }

  /**
   * Subscribe to state changes
   * @param listener Function to call when state changes
   * @returns Unsubscribe function
   */
  subscribe(listener: (state: CombatState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get the current combat state
   * @returns Current combat state
   */
  getState(): CombatState {
    return this.state;
  }

  /**
   * Get the active encounter
   * @returns Active encounter or undefined if none
   */
  getActiveEncounter(): CombatEncounter | undefined {
    if (!this.state.activeEncounterId) return undefined;
    return this.state.encounters[this.state.activeEncounterId];
  }

  /**
   * Create a new combat encounter
   * @param name Encounter name
   * @param description Encounter description
   * @returns ID of the created encounter
   */
  createEncounter(name: string, description?: string): string {
    const id = uuidv4();
    const encounter: CombatEncounter = {
      id,
      name,
      description,
      participants: [],
      currentRound: 0,
      currentTurn: -1,
      initiativeOrder: [],
      status: 'preparing',
      log: []
    };

    this.state = {
      ...this.state,
      encounters: {
        ...this.state.encounters,
        [id]: encounter
      }
    };

    this.notifyListeners();
    return id;
  }

  /**
   * Set the active encounter
   * @param encounterId ID of the encounter to set as active
   */
  setActiveEncounter(encounterId: string): void {
    if (!this.state.encounters[encounterId]) {
      throw new Error(`Encounter with ID ${encounterId} not found`);
    }

    this.state = {
      ...this.state,
      activeEncounterId: encounterId
    };

    this.notifyListeners();
  }

  /**
   * Delete an encounter
   * @param encounterId ID of the encounter to delete
   */
  deleteEncounter(encounterId: string): void {
    const { [encounterId]: _, ...remainingEncounters } = this.state.encounters;
    
    this.state = {
      ...this.state,
      encounters: remainingEncounters,
      activeEncounterId: this.state.activeEncounterId === encounterId 
        ? undefined 
        : this.state.activeEncounterId
    };

    this.notifyListeners();
  }

  /**
   * Add a participant to an encounter
   * @param encounterId ID of the encounter
   * @param participant Participant to add
   * @returns ID of the added participant
   */
  addParticipant(encounterId: string, participant: Omit<CombatParticipant, 'id'>): string {
    const encounter = this.state.encounters[encounterId];
    if (!encounter) {
      throw new Error(`Encounter with ID ${encounterId} not found`);
    }

    const id = uuidv4();
    const newParticipant: CombatParticipant = {
      ...participant,
      id,
      isActive: false,
      hasActed: false,
      hasMovedThisTurn: false,
      hasUsedBonusAction: false,
      hasUsedReaction: false
    };

    const updatedEncounter: CombatEncounter = {
      ...encounter,
      participants: [...encounter.participants, newParticipant]
    };

    this.state = {
      ...this.state,
      encounters: {
        ...this.state.encounters,
        [encounterId]: updatedEncounter
      }
    };

    this.notifyListeners();
    return id;
  }

  /**
   * Remove a participant from an encounter
   * @param encounterId ID of the encounter
   * @param participantId ID of the participant to remove
   */
  removeParticipant(encounterId: string, participantId: string): void {
    const encounter = this.state.encounters[encounterId];
    if (!encounter) {
      throw new Error(`Encounter with ID ${encounterId} not found`);
    }

    const updatedParticipants = encounter.participants.filter(p => p.id !== participantId);
    const updatedInitiativeOrder = encounter.initiativeOrder.filter(id => id !== participantId);
    
    const updatedEncounter: CombatEncounter = {
      ...encounter,
      participants: updatedParticipants,
      initiativeOrder: updatedInitiativeOrder
    };

    this.state = {
      ...this.state,
      encounters: {
        ...this.state.encounters,
        [encounterId]: updatedEncounter
      }
    };

    this.notifyListeners();
  }

  /**
   * Update a participant in an encounter
   * @param encounterId ID of the encounter
   * @param participantId ID of the participant to update
   * @param updates Updates to apply to the participant
   */
  updateParticipant(encounterId: string, participantId: string, updates: Partial<CombatParticipant>): void {
    const encounter = this.state.encounters[encounterId];
    if (!encounter) {
      throw new Error(`Encounter with ID ${encounterId} not found`);
    }

    const participantIndex = encounter.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      throw new Error(`Participant with ID ${participantId} not found in encounter ${encounterId}`);
    }

    const updatedParticipant = {
      ...encounter.participants[participantIndex],
      ...updates
    };

    const updatedParticipants = [...encounter.participants];
    updatedParticipants[participantIndex] = updatedParticipant;

    const updatedEncounter: CombatEncounter = {
      ...encounter,
      participants: updatedParticipants
    };

    this.state = {
      ...this.state,
      encounters: {
        ...this.state.encounters,
        [encounterId]: updatedEncounter
      }
    };

    this.notifyListeners();
  }
}
