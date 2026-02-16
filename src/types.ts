export type StrainLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type GamePhase = 'menu' | 'draft' | 'encounter' | 'upgrade';
export type AbilityId = 'smite' | 'manifest' | 'twist' | 'condemn' | 'witness' | 'absolve' | 'stifle';
export type DoctrineId = 'dominion' | 'revelation';
export type UpgradeCategory = 'strength' | 'world';
export type ResolutionOutcome = 'perfect' | 'partial' | 'minimal' | 'catastrophic';

export interface Ability {
    id: AbilityId;
    name: string;
    description: string;
    flavorText: string;
    baseStrainCost: number;
    basePressure: number;
    baseEssence: number;
    baseConsequence: number;
}

export interface EncounterTemplate {
    id: string;
    title: string;
    description: string;
    pressureText: string;
    rewardText: string;
    consequenceText: string;
    basePressure: number;
    baseRewardPerTurn: number;
    baseConsequence: number;
    consequenceThreshold: number;
}

export interface EncounterModifierAbilityEffect {
    abilityId: AbilityId;
    strainCostDelta?: number;
    pressureDelta?: number;
    consequenceDelta?: number;
    essenceDelta?: number;
}

export interface EncounterModifier {
    id: string;
    name: string;
    description: string;
    effects: {
        strainCostDelta?: number;
        pressureDelta?: number;
        consequenceDelta?: number;
        essenceDelta?: number;
        abilityEffects?: EncounterModifierAbilityEffect[];
    };
}

export interface ActiveEncounter {
    id: string;
    templateId: string;
    modifierId: string;
    title: string;
    description: string;
    pressureText: string;
    rewardText: string;
    consequenceText: string;
    modifierName: string;
    modifierDescription: string;
    modifierEffects: EncounterModifier['effects'];
    startingPressure: number;
    pressureRemaining: number;
    rewardPerTurn: number;
    consequenceMeter: number;
    consequenceThreshold: number;
    thresholdExceeded: boolean;
    turn: number;
    turnLimit: number;
}

export interface Doctrine {
    id: DoctrineId;
    name: string;
    description: string;
    startingAbilityId: AbilityId;
    passiveDescription: string;
}

export interface Upgrade {
    id: string;
    name: string;
    description: string;
    category: UpgradeCategory;
    cost: number;
    firstCastStrainReduction?: number;
    firstCastEssenceBonus?: number;
    maxStrainBonus?: number;
    encounterWeightDelta?: {
        encounterId: string;
        amount: number;
    };
}

export interface StrengthBonuses {
    firstCastStrainReduction: number;
    firstCastEssenceBonus: number;
    maxStrainBonus: number;
}

export interface AbilityPreview {
    abilityId: AbilityId;
    baseStrainCost: number;
    strainCost: number;
    projectedStrain: number;
    projectedStrainLevel: StrainLevel;
    basePressure: number;
    pressureDelta: number;
    baseEssence: number;
    essenceDelta: number;
    baseConsequence: number;
    consequenceDelta: number;
    projectedConsequenceMeter: number;
    willExceedThreshold: boolean;
    willGrantFreeCast: boolean;
    notes: string[];
}

export interface EncounterResolution {
    outcome: ResolutionOutcome;
    pressureRemaining: number;
    finalConsequence: number;
    thresholdExceeded: boolean;
    essenceGained: number;
    carryoverAdded: number;
    flavorText: string;
}

export interface GameState {
    essence: number;
    runEssenceGained: number;
    phase: GamePhase;
    currentStrain: number;
    maxStrain: number;
    strainLevel: StrainLevel;
    abilities: Ability[];
    abilityUsage: Record<AbilityId, number>;
    history: AbilityId[];
    lastResolution: string;
    lastEncounterResolution: EncounterResolution | null;
    doctrine: Doctrine | null;
    currentEncounter: ActiveEncounter | null;
    encountersCompleted: number;
    encountersTarget: number;
    carryOverInstability: number;
    castsThisEncounter: number;
    doctrinePassiveUsed: boolean;
    nextCastFree: boolean;
    ownedUpgrades: string[];
    strengthBonuses: StrengthBonuses;
    worldWeights: Record<string, number>;
    upgradeOptions: Upgrade[];
    draftOptions: Ability[];
    hasSeenTutorial: boolean;
    encounterResolved: boolean;
    startRun: (doctrineId: DoctrineId) => void;
    selectDraftAbility: (abilityId: AbilityId) => void;
    markTutorialSeen: () => void;
    nextEncounter: () => void;
    castAbility: (abilityId: AbilityId) => void;
    getAbilityPreview: (abilityId: AbilityId) => AbilityPreview | null;
    selectUpgrade: (upgradeId: string) => void;
    skipUpgrade: () => void;
    endRun: () => void;
    resetProgress: () => void;
}
