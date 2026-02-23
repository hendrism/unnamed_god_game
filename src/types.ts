export type StrainLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type GamePhase = 'menu' | 'draft' | 'boon' | 'encounter' | 'upgrade' | 'petition';
export type AbilityId =
    | 'smite'
    | 'manifest'
    | 'twist'
    | 'condemn'
    | 'witness'
    | 'absolve'
    | 'stifle'
    | 'edict'
    | 'supplicate'
    | 'rift'
    | 'ordain'
    | 'invoke'
    | 'unravel'
    | 'coerce';
export type AbilityCategory = 'smite' | 'manifest' | 'twist';
export type DoctrineId = 'dominion' | 'revelation';
export type UpgradeCategory = 'strength' | 'world';
export type ResolutionOutcome = 'perfect' | 'partial' | 'minimal' | 'catastrophic';

export interface Ability {
    id: AbilityId;
    category: AbilityCategory;
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
    pressureRegen?: number;
    strainPerTurn?: number;
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
    urgency: 'steady' | 'urgent';
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
    consequenceByCategory: Record<AbilityCategory, number>;
    thresholdExceeded: boolean;
    thresholdRuptureUsed: boolean;
    turn: number;
    turnLimit: number;
    pressureRegen: number;
    strainPerTurn: number;
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
    tier: 1 | 2 | 3;
    cost: number;
    firstCastStrainReduction?: number;
    firstCastEssenceBonus?: number;
    maxStrainBonus?: number;
    carryoverDecayBonus?: number;
    synergyEssenceBonus?: number;
    encounterWeightDelta?: {
        encounterId: string;
        amount: number;
    };
    // T2/T3 new mechanic fields
    perfectClearEssenceBonus?: number;
    conseqThresholdBonus?: number;
    runLengthBonus?: number;
    turnLimitBonus?: number;
    pressureStartReduction?: number;
    resetStrainOnEncounterStart?: boolean;
}

export interface StrengthBonuses {
    firstCastStrainReduction: number;
    firstCastEssenceBonus: number;
    maxStrainBonus: number;
    carryoverDecayBonus: number;
    synergyEssenceBonus: number;
    // T2/T3 bonuses
    perfectClearEssenceBonus: number;
    conseqThresholdBonus: number;
    runLengthBonus: number;
    turnLimitBonus: number;
    pressureStartReduction: number;
    resetStrainOnEncounterStart: boolean;
}

export interface AbilityPreview {
    abilityId: AbilityId;
    category: AbilityCategory;
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
    willTriggerThresholdRupture: boolean;
    willGrantFreeCast: boolean;
    synergyLabel: string | null;
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
    dominantConsequenceCategory: AbilityCategory | null;
    consequenceAftermath: string | null;
}

export interface EncounterForecast {
    templateId: string;
    title: string;
    count: number;
}

export interface ActionLogEntry {
    turn: number;
    abilityId: AbilityId;
    abilityName: string;
    pressureDelta: number;
    consequenceDelta: number;
    essenceDelta: number;
    synergyLabel: string | null;
}

export interface GameState {
    essence: number;
    runEssenceGained: number;
    phase: GamePhase;
    currentStrain: number;
    maxStrain: number;
    strainLevel: StrainLevel;
    abilities: Ability[];
    encounterAbilityIds: AbilityId[];
    abilityUsage: Record<AbilityId, number>;
    history: AbilityId[];
    actionLog: ActionLogEntry[];
    lastResolution: string;
    lastEncounterResolution: EncounterResolution | null;
    doctrine: Doctrine | null;
    currentEncounter: ActiveEncounter | null;
    encountersCompleted: number;
    encountersTarget: number;
    runEncounterQueue: string[];
    runForecast: EncounterForecast[];
    carryOverInstability: number;
    castsThisEncounter: number;
    nextCastFree: boolean;
    boonOptions: Ability[];
    boonPrompt: string;
    petitionOptions: EncounterTemplate[];
    pimPetitionTemplateId: string | null;
    lastPetitionWasPim: boolean;
    pimEncountersChosen: number;
    synergyStreak: number;
    lastSynergy: string;
    ownedUpgrades: string[];
    strengthBonuses: StrengthBonuses;
    worldWeights: Record<string, number>;
    upgradeOptions: Upgrade[];
    draftOptions: Ability[];
    hasSeenTutorial: boolean;
    encounterResolved: boolean;
    debugMode: boolean;
    startRun: (doctrineId: DoctrineId) => void;
    selectDraftAbility: (abilityId: AbilityId) => void;
    selectBoonAbility: (abilityId: AbilityId | null) => void;
    markTutorialSeen: () => void;
    nextEncounter: () => void;
    castAbility: (abilityId: AbilityId) => void;
    getAbilityPreview: (abilityId: AbilityId) => AbilityPreview | null;
    selectPetition: (templateId: string) => void;
    selectUpgrade: (upgradeId: string) => void;
    skipUpgrade: () => void;
    endRun: () => void;
    resetProgress: () => void;
    toggleDebugMode: () => void;
}
