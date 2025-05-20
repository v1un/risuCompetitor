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

  /**
   * Start combat for an encounter
   * @param encounterId ID of the encounter to start
   */
  startCombat(encounterId: string): void {
    const encounter = this.state.encounters[encounterId];
    if (!encounter) {
      throw new Error(`Encounter with ID ${encounterId} not found`);
    }

    // Can't start combat if it's already active
    if (encounter.status === 'active') {
      return;
    }

    // Sort initiative order if it's empty
    let initiativeOrder = [...encounter.initiativeOrder];
    if (initiativeOrder.length === 0) {
      // Sort participants by initiative
      initiativeOrder = encounter.participants
        .sort((a, b) => b.initiative - a.initiative)
        .map(p => p.id);
    }

    const updatedEncounter: CombatEncounter = {
      ...encounter,
      status: 'active',
      currentRound: 1,
      currentTurn: 0,
      initiativeOrder,
      startTime: new Date().toISOString(),
      log: [
        ...encounter.log,
        {
          id: uuidv4(),
          round: 1,
          turn: 0,
          timestamp: new Date().toISOString(),
          actionType: 'system',
          description: 'Combat started',
          visibility: 'all'
        }
      ]
    };

    // Set the first participant as active
    if (initiativeOrder.length > 0) {
      const firstParticipantId = initiativeOrder[0];
      const participants = updatedEncounter.participants.map(p => ({
        ...p,
        isActive: p.id === firstParticipantId,
        hasActed: false,
        hasMovedThisTurn: false,
        hasUsedBonusAction: false,
        hasUsedReaction: false
      }));

      updatedEncounter.participants = participants;
    }

    this.state = {
      ...this.state,
      encounters: {
        ...this.state.encounters,
        [encounterId]: updatedEncounter
      },
      activeEncounterId: encounterId
    };

    this.notifyListeners();
  }

  /**
   * End combat for an encounter
   * @param encounterId ID of the encounter to end
   */
  endCombat(encounterId: string): void {
    const encounter = this.state.encounters[encounterId];
    if (!encounter) {
      throw new Error(`Encounter with ID ${encounterId} not found`);
    }

    // Can't end combat if it's not active
    if (encounter.status !== 'active' && encounter.status !== 'paused') {
      return;
    }

    const updatedEncounter: CombatEncounter = {
      ...encounter,
      status: 'completed',
      endTime: new Date().toISOString(),
      log: [
        ...encounter.log,
        {
          id: uuidv4(),
          round: encounter.currentRound,
          turn: encounter.currentTurn,
          timestamp: new Date().toISOString(),
          actionType: 'system',
          description: 'Combat ended',
          visibility: 'all'
        }
      ]
    };

    // Reset active state for all participants
    const participants = updatedEncounter.participants.map(p => ({
      ...p,
      isActive: false
    }));

    updatedEncounter.participants = participants;

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
   * Move to the next turn in combat
   * @param encounterId ID of the encounter
   */
  nextTurn(encounterId: string): void {
    const encounter = this.state.encounters[encounterId];
    if (!encounter) {
      throw new Error(`Encounter with ID ${encounterId} not found`);
    }

    // Can't advance turn if combat is not active
    if (encounter.status !== 'active') {
      return;
    }

    // If there are no participants, do nothing
    if (encounter.initiativeOrder.length === 0) {
      return;
    }

    let nextTurn = encounter.currentTurn + 1;
    let nextRound = encounter.currentRound;

    // If we've reached the end of the initiative order, start a new round
    if (nextTurn >= encounter.initiativeOrder.length) {
      nextTurn = 0;
      nextRound += 1;
    }

    const currentParticipantId = encounter.initiativeOrder[encounter.currentTurn];
    const nextParticipantId = encounter.initiativeOrder[nextTurn];

    // Update participants
    const participants = encounter.participants.map(p => {
      if (p.id === currentParticipantId) {
        // Current participant is no longer active and has acted
        return {
          ...p,
          isActive: false,
          hasActed: true
        };
      } else if (p.id === nextParticipantId) {
        // Next participant becomes active
        return {
          ...p,
          isActive: true,
          hasActed: false,
          hasMovedThisTurn: false,
          hasUsedBonusAction: false,
          hasUsedReaction: false
        };
      }
      return p;
    });

    // Process conditions at the end of turn
    const updatedParticipants = this.processConditions(participants, nextRound, nextTurn);

    const updatedEncounter: CombatEncounter = {
      ...encounter,
      currentRound: nextRound,
      currentTurn: nextTurn,
      participants: updatedParticipants,
      log: [
        ...encounter.log,
        {
          id: uuidv4(),
          round: nextRound,
          turn: nextTurn,
          timestamp: new Date().toISOString(),
          actionType: 'system',
          description: nextRound > encounter.currentRound 
            ? `Round ${nextRound} started` 
            : `Turn moved to ${updatedParticipants.find(p => p.id === nextParticipantId)?.name || 'Unknown'}`,
          visibility: 'all'
        }
      ]
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
   * Process conditions for all participants
   * @param participants Participants to process conditions for
   * @param round Current round
   * @param turn Current turn
   * @returns Updated participants
   */
  private processConditions(participants: CombatParticipant[], round: number, turn: number): CombatParticipant[] {
    return participants.map(participant => {
      // Filter out expired conditions
      const updatedConditions = participant.conditions.filter(condition => {
        if (typeof condition.duration === 'number') {
          // Check if condition has expired
          return condition.appliedAt + condition.duration >= round;
        }
        // 'permanent' conditions don't expire
        return true;
      });

      return {
        ...participant,
        conditions: updatedConditions
      };
    });
  }

  /**
   * Roll initiative for all participants in an encounter
   * @param encounterId ID of the encounter
   */
  rollInitiative(encounterId: string): void {
    const encounter = this.state.encounters[encounterId];
    if (!encounter) {
      throw new Error(`Encounter with ID ${encounterId} not found`);
    }

    // Roll initiative for each participant
    const participants = encounter.participants.map(p => {
      // In a real implementation, this would use the participant's stats
      // For now, we'll just use a simple d20 roll
      const initiative = Math.floor(Math.random() * 20) + 1 + (p.stats.dexterity || 0);
      return {
        ...p,
        initiative
      };
    });

    // Sort by initiative
    const initiativeOrder = participants
      .sort((a, b) => {
        // Sort by initiative, then by dexterity if tied
        if (b.initiative === a.initiative) {
          return (b.stats.dexterity || 0) - (a.stats.dexterity || 0);
        }
        return b.initiative - a.initiative;
      })
      .map(p => p.id);

    const updatedEncounter: CombatEncounter = {
      ...encounter,
      participants,
      initiativeOrder,
      log: [
        ...encounter.log,
        {
          id: uuidv4(),
          round: encounter.currentRound,
          turn: encounter.currentTurn,
          timestamp: new Date().toISOString(),
          actionType: 'system',
          description: 'Initiative rolled',
          visibility: 'all'
        }
      ]
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
   * Add a condition to a participant
   * @param encounterId ID of the encounter
   * @param participantId ID of the participant
   * @param condition Condition to add
   */
  addCondition(encounterId: string, participantId: string, condition: Omit<CombatCondition, 'id' | 'appliedAt'>): void {
    const encounter = this.state.encounters[encounterId];
    if (!encounter) {
      throw new Error(`Encounter with ID ${encounterId} not found`);
    }

    const participantIndex = encounter.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      throw new Error(`Participant with ID ${participantId} not found in encounter ${encounterId}`);
    }

    const newCondition: CombatCondition = {
      ...condition,
      id: uuidv4(),
      appliedAt: encounter.currentRound
    };

    const participant = encounter.participants[participantIndex];
    const updatedParticipant = {
      ...participant,
      conditions: [...participant.conditions, newCondition]
    };

    const updatedParticipants = [...encounter.participants];
    updatedParticipants[participantIndex] = updatedParticipant;

    const updatedEncounter: CombatEncounter = {
      ...encounter,
      participants: updatedParticipants,
      log: [
        ...encounter.log,
        {
          id: uuidv4(),
          round: encounter.currentRound,
          turn: encounter.currentTurn,
          timestamp: new Date().toISOString(),
          actionType: 'condition',
          actorId: participantId,
          description: `${participant.name} gained condition: ${condition.name}`,
          details: { condition: newCondition },
          visibility: 'all'
        }
      ]
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
   * Remove a condition from a participant
   * @param encounterId ID of the encounter
   * @param participantId ID of the participant
   * @param conditionId ID of the condition to remove
   */
  removeCondition(encounterId: string, participantId: string, conditionId: string): void {
    const encounter = this.state.encounters[encounterId];
    if (!encounter) {
      throw new Error(`Encounter with ID ${encounterId} not found`);
    }

    const participantIndex = encounter.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      throw new Error(`Participant with ID ${participantId} not found in encounter ${encounterId}`);
    }

    const participant = encounter.participants[participantIndex];
    const conditionIndex = participant.conditions.findIndex(c => c.id === conditionId);
    
    if (conditionIndex === -1) {
      throw new Error(`Condition with ID ${conditionId} not found on participant ${participantId}`);
    }

    const condition = participant.conditions[conditionIndex];
    const updatedConditions = participant.conditions.filter(c => c.id !== conditionId);
    
    const updatedParticipant = {
      ...participant,
      conditions: updatedConditions
    };

    const updatedParticipants = [...encounter.participants];
    updatedParticipants[participantIndex] = updatedParticipant;

    const updatedEncounter: CombatEncounter = {
      ...encounter,
      participants: updatedParticipants,
      log: [
        ...encounter.log,
        {
          id: uuidv4(),
          round: encounter.currentRound,
          turn: encounter.currentTurn,
          timestamp: new Date().toISOString(),
          actionType: 'condition',
          actorId: participantId,
          description: `${participant.name} lost condition: ${condition.name}`,
          visibility: 'all'
        }
      ]
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
   * Deal damage to a participant
   * @param encounterId ID of the encounter
   * @param participantId ID of the participant
   * @param damage Amount of damage to deal
   * @param damageType Type of damage
   * @param source Source of the damage
   */
  dealDamage(
    encounterId: string, 
    participantId: string, 
    damage: number, 
    damageType: string, 
    source?: string
  ): void {
    const encounter = this.state.encounters[encounterId];
    if (!encounter) {
      throw new Error(`Encounter with ID ${encounterId} not found`);
    }

    const participantIndex = encounter.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      throw new Error(`Participant with ID ${participantId} not found in encounter ${encounterId}`);
    }

    const participant = encounter.participants[participantIndex];
    const newHp = Math.max(0, participant.currentHp - damage);
    
    const updatedParticipant = {
      ...participant,
      currentHp: newHp
    };

    const updatedParticipants = [...encounter.participants];
    updatedParticipants[participantIndex] = updatedParticipant;

    const updatedEncounter: CombatEncounter = {
      ...encounter,
      participants: updatedParticipants,
      log: [
        ...encounter.log,
        {
          id: uuidv4(),
          round: encounter.currentRound,
          turn: encounter.currentTurn,
          timestamp: new Date().toISOString(),
          actionType: 'damage',
          actorId: source,
          targetIds: [participantId],
          description: `${participant.name} took ${damage} ${damageType} damage${source ? ` from ${source}` : ''}`,
          details: { damage, damageType, newHp },
          visibility: 'all'
        }
      ]
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
   * Heal a participant
   * @param encounterId ID of the encounter
   * @param participantId ID of the participant
   * @param healing Amount of healing to apply
   * @param source Source of the healing
   */
  healDamage(
    encounterId: string, 
    participantId: string, 
    healing: number, 
    source?: string
  ): void {
    const encounter = this.state.encounters[encounterId];
    if (!encounter) {
      throw new Error(`Encounter with ID ${encounterId} not found`);
    }

    const participantIndex = encounter.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      throw new Error(`Participant with ID ${participantId} not found in encounter ${encounterId}`);
    }

    const participant = encounter.participants[participantIndex];
    const newHp = Math.min(participant.maxHp, participant.currentHp + healing);
    
    const updatedParticipant = {
      ...participant,
      currentHp: newHp
    };

    const updatedParticipants = [...encounter.participants];
    updatedParticipants[participantIndex] = updatedParticipant;

    const updatedEncounter: CombatEncounter = {
      ...encounter,
      participants: updatedParticipants,
      log: [
        ...encounter.log,
        {
          id: uuidv4(),
          round: encounter.currentRound,
          turn: encounter.currentTurn,
          timestamp: new Date().toISOString(),
          actionType: 'heal',
          actorId: source,
          targetIds: [participantId],
          description: `${participant.name} healed ${healing} hit points${source ? ` from ${source}` : ''}`,
          details: { healing, newHp },
          visibility: 'all'
        }
      ]
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
   * Update combat settings
   * @param settings New settings
   */
  updateSettings(settings: Partial<CombatSettings>): void {
    this.state = {
      ...this.state,
      settings: {
        ...this.state.settings,
        ...settings
      }
    };

    this.notifyListeners();
  }
}
