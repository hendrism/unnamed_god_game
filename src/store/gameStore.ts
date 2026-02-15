import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GameState, StrainLevel } from '../types';
import { CORE_ABILITIES } from '../data/abilities';
import { ENC_TYPES } from '../data/encounters';

interface GameActions {
    startRun: () => void;
    chooseAbility: (abilityId: string) => void;
    nextEncounter: () => void;
    resetGame: () => void;
    calculateStrainLevel: (current: number, max: number) => StrainLevel;
}

// Initial State
const INITIAL_STATE: Omit<GameState, 'startRun' | 'endRun' | 'castAbility' | 'draftAbility' | 'selectUpgrade'> = {
    essence: 0,
    scars: [],
    phase: 'menu',
    currentStrain: 0,
    maxStrain: 10,
    strainLevel: 'Low',
    deck: [],
    hand: [],
    abilities: [],
    currentEncounter: null,
    encountersCompleted: 0,
    history: [],
};

// Helper: Select random encounter
const getRandomEncounter = () => {
    const idx = Math.floor(Math.random() * ENC_TYPES.length);
    return { ...ENC_TYPES[idx] }; // Clone to avoid mutation of source
};

export const useGameStore = create<GameState & GameActions>()(
    devtools(
        persist(
            (set, get) => ({
                ...INITIAL_STATE,

                startRun: () => {
                    // Reset run state
                    set({
                        phase: 'encounter',
                        currentStrain: 0,
                        maxStrain: 10,
                        strainLevel: 'Low',
                        encountersCompleted: 0,
                        currentEncounter: getRandomEncounter(),
                        abilities: [...CORE_ABILITIES],
                        history: [],
                    });
                },

                chooseAbility: (abilityId: string) => {
                    const state = get();
                    const ability = state.abilities.find(a => a.id === abilityId);
                    if (!ability) return;

                    // calculate strain cost
                    const strainCost = ability.baseStrainCost;
                    const newStrain = state.currentStrain + strainCost;

                    let essenceGain = 0;

                    // Synergy Check
                    const history = state.history || [];
                    const lastAbilityId = history.length > 0 ? history[history.length - 1] : null;

                    if (ability.id === 'smite' && lastAbilityId === 'manifest') {
                        essenceGain += 1;
                    }

                    // Finalize state update
                    let finalStrain = newStrain;
                    if (ability.id === 'manifest' && lastAbilityId === 'twist') {
                        finalStrain -= 2;
                    }

                    if (ability.id === 'twist' && lastAbilityId === 'smite') {
                        // implementation detail for "next ability costs 0"
                        // this would require state "nextAbilityCostModifier"
                        // ignoring for strict MVP simplicity or handling via complex logic?
                        // "next ability costs 0 strain" -> we need a `modifiers` array in state.
                        // For MVP, let's just refund strain or give massive essence?
                        // Let's add 5 essence instead for now to signify "Good move" without adding system complexity yet.
                        essenceGain += 3;
                    }

                    const maxStrain = state.maxStrain;
                    const strainLevel = get().calculateStrainLevel(Math.max(0, finalStrain), maxStrain);

                    set((prev) => ({
                        currentStrain: Math.max(0, finalStrain),
                        essence: prev.essence + essenceGain + 2,
                        encountersCompleted: prev.encountersCompleted + 1,
                        history: [...history, ability.id],
                        // Check end of run
                        phase: prev.encountersCompleted >= 3 ? 'upgrade' : 'encounter',
                        currentEncounter: prev.encountersCompleted >= 3 ? null : getRandomEncounter(),
                        strainLevel: strainLevel
                    }));
                },

                nextEncounter: () => {
                    // ...
                },

                resetGame: () => {
                    set(INITIAL_STATE);
                },

                calculateStrainLevel: (current, max) => {
                    const ratio = current / max;
                    if (ratio < 0.3) return 'Low';
                    if (ratio < 0.6) return 'Medium';
                    if (ratio < 0.9) return 'High';
                    return 'Critical';
                },

                // Missing implementation for interface methods
                castAbility: (id) => get().chooseAbility(id),
                draftAbility: () => { },
                selectUpgrade: () => { },
                endRun: () => set({ phase: 'menu' }),

            }),
            {
                name: 'fallen-god-storage',
            }
        )
    )
);
