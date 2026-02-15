export type StrainLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Ability {
    id: string;
    name: string;
    description: string;
    flavorText?: string;
    baseStrainCost: number;
    // We'll use a simple effect system for MVP. 
    // Real implementation might need a more complex effect engine.
    // For now, these are markers for the resolver.
    effectType: 'damage' | 'heal' | 'utility' | 'buff';
    synergyKeywords: string[]; // e.g. ["storm", "void"]
}

export interface Encounter {
    id: string;
    title: string;
    description: string;
    pressure: string; // What bad thing is happening
    reward: string; // What you get
    consequence: string; // Secondary effect
    // Internal state for the encounter logic
    difficulty: number;
    type: 'combat' | 'social' | 'puzzle' | 'bizarre';
}

export interface Doctrine {
    id: string;
    name: string;
    description: string;
    startingAbilityId: string;
    passiveDescription: string;
}

export interface GameState {
    // Session State
    essence: number;
    scars: string[]; // For v2, but keeping structure ready

    // Run State
    phase: 'menu' | 'drafting' | 'encounter' | 'resolution' | 'upgrade' | 'victory' | 'defeat';
    currentStrain: number;
    maxStrain: number;
    strainLevel: StrainLevel;

    deck: Ability[]; // Current draft pool for the run
    hand: Ability[]; // Abilities available this turn (if we do card draw, otherwise just list)
    // Design says "Abilities are always available". So no deck/hand in traditional sense.
    // just "abilities" list.
    abilities: Ability[];

    currentEncounter: Encounter | null;
    encountersCompleted: number;
    history: string[]; // List of ability IDs used in this run

    // Actions
    startRun: (doctrineId: string) => void;
    endRun: () => void;
    castAbility: (abilityId: string) => void;
    draftAbility: (abilityId: string) => void;
    selectUpgrade: (upgradeId: string) => void;
}
