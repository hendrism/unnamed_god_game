import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ALL_ABILITIES, CORE_ABILITIES, DRAFT_POOL } from '../data/abilities';
import { DOCTRINES } from '../data/doctrines';
import { ENCOUNTER_TEMPLATES } from '../data/encounters';
import { ENCOUNTER_MODIFIERS } from '../data/encounterModifiers';
import { RESOLUTION_OUTCOMES } from '../data/resolutionOutcomes';
import { STRENGTH_UPGRADES, WORLD_UPGRADES } from '../data/upgrades';
import type {
    Ability,
    AbilityCategory,
    AbilityId,
    AbilityPreview,
    ActiveEncounter,
    Doctrine,
    DoctrineId,
    EncounterForecast,
    EncounterResolution,
    GameState,
    ResolutionOutcome,
    StrainLevel,
    StrengthBonuses,
    Upgrade,
} from '../types';

const BASE_MAX_STRAIN = 20;
const ENCOUNTER_STRAIN_RELIEF = 4;
const THRESHOLD_PENALTY_STRAIN = 2;
const THRESHOLD_PENALTY_ESSENCE = 1;
const THRESHOLD_RUPTURE_ESSENCE = 1;
const CASTS_PER_BOON = 2;
const ENCOUNTER_ABILITY_POOL_MIN = 5;
const ENCOUNTER_ABILITY_POOL_MAX = 6;
const ESCALATION_INTERVAL = 2;
const URGENT_ENCOUNTER_CHANCE = 0.45;
const URGENT_PRESSURE_MULTIPLIER = 1.2;

const DEFAULT_STRENGTH_BONUSES: StrengthBonuses = {
    firstCastStrainReduction: 0,
    firstCastEssenceBonus: 0,
    maxStrainBonus: 0,
};

const DEFAULT_WORLD_WEIGHTS: Record<string, number> = ENCOUNTER_TEMPLATES.reduce(
    (acc, encounter) => {
        acc[encounter.id] = 1;
        return acc;
    },
    {} as Record<string, number>
);

const EMPTY_CONSEQUENCE_BY_CATEGORY: Record<AbilityCategory, number> = {
    smite: 0,
    manifest: 0,
    twist: 0,
};

const EMPTY_ABILITY_USAGE: Record<AbilityId, number> = {
    smite: 0,
    manifest: 0,
    twist: 0,
    condemn: 0,
    witness: 0,
    absolve: 0,
    stifle: 0,
    edict: 0,
    supplicate: 0,
    rift: 0,
};

const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

const getDoctrineById = (doctrineId: DoctrineId): Doctrine =>
    DOCTRINES.find((doctrine) => doctrine.id === doctrineId) ?? DOCTRINES[0];

const getEncounterTemplateById = (templateId: string) =>
    ENCOUNTER_TEMPLATES.find((template) => template.id === templateId) ??
    ENCOUNTER_TEMPLATES[0];

const sortAbilitiesForDoctrine = (startingAbilityId: AbilityId): Ability[] => {
    const start = CORE_ABILITIES.find((ability) => ability.id === startingAbilityId);
    const rest = CORE_ABILITIES.filter((ability) => ability.id !== startingAbilityId);
    return start ? [start, ...rest] : [...CORE_ABILITIES];
};

const getLastAbility = (history: AbilityId[]): AbilityId | null =>
    history.length === 0 ? null : history[history.length - 1];

const calculateStrainLevel = (current: number, max: number): StrainLevel => {
    const ratio = max <= 0 ? 1 : current / max;
    if (ratio < 0.45) return 'Low';
    if (ratio < 0.8) return 'Medium';
    if (ratio < 1) return 'High';
    return 'Critical';
};

const pickEncounterTemplateId = (
    weights: Record<string, number>,
    avoidTemplateId?: string
): string => {
    const candidateTemplates = ENCOUNTER_TEMPLATES.filter(
        (template) =>
            ENCOUNTER_TEMPLATES.length === 1 || template.id !== avoidTemplateId
    );

    const totalWeight = candidateTemplates.reduce(
        (sum, template) => sum + Math.max(1, weights[template.id] ?? 1),
        0
    );

    let roll = Math.random() * totalWeight;
    for (const template of candidateTemplates) {
        roll -= Math.max(1, weights[template.id] ?? 1);
        if (roll <= 0) {
            return template.id;
        }
    }

    return candidateTemplates[candidateTemplates.length - 1].id;
};

const buildEncounterQueue = (
    encountersTarget: number,
    weights: Record<string, number>
): string[] => {
    const queue: string[] = [];
    let previousTemplateId: string | undefined;

    for (let i = 0; i < encountersTarget; i += 1) {
        const templateId = pickEncounterTemplateId(weights, previousTemplateId);
        queue.push(templateId);
        previousTemplateId = templateId;
    }

    return queue;
};

const buildEncounterForecast = (queue: string[]): EncounterForecast[] => {
    const counts = new Map<string, number>();
    for (const templateId of queue) {
        counts.set(templateId, (counts.get(templateId) ?? 0) + 1);
    }

    return [...counts.entries()]
        .map(([templateId, count]) => ({
            templateId,
            title: getEncounterTemplateById(templateId).title,
            count,
        }))
        .sort((a, b) => b.count - a.count);
};

const buildEncounterAbilityPool = (abilities: Ability[]): AbilityId[] => {
    if (abilities.length === 0) return [];

    const minPool = Math.min(ENCOUNTER_ABILITY_POOL_MIN, abilities.length);
    const maxPool = Math.min(ENCOUNTER_ABILITY_POOL_MAX, abilities.length);
    const poolSize = minPool === maxPool ? maxPool : randomInt(minPool, maxPool);

    return shuffle(abilities)
        .slice(0, poolSize)
        .map((ability) => ability.id);
};

const buildBoonChoices = (ownedAbilities: Ability[], choiceCount = 2): Ability[] => {
    const ownedIds = new Set(ownedAbilities.map((ability) => ability.id));
    const available = ALL_ABILITIES.filter((ability) => !ownedIds.has(ability.id));
    if (available.length === 0) return [];

    return shuffle(available).slice(0, Math.min(choiceCount, available.length));
};

const createEncounter = (
    templateId: string,
    carryOverInstability: number
): ActiveEncounter => {
    const template = getEncounterTemplateById(templateId);
    const modifier = randomFrom(ENCOUNTER_MODIFIERS);
    const pressureFromCarryOver = Math.min(3, carryOverInstability);
    const isUrgent = Math.random() < URGENT_ENCOUNTER_CHANCE;
    const pressureScalar = isUrgent ? URGENT_PRESSURE_MULTIPLIER : 1;
    const startingPressure = Math.max(
        4,
        Math.round((template.basePressure + pressureFromCarryOver) * pressureScalar)
    );
    const rewardPerTurn = Math.max(1, template.baseRewardPerTurn);
    const startingConsequence = Math.max(0, template.baseConsequence);

    return {
        id: `${template.id}-${modifier.id}-${Math.random().toString(36).slice(2, 8)}`,
        templateId: template.id,
        modifierId: modifier.id,
        urgency: isUrgent ? 'urgent' : 'steady',
        title: template.title,
        description: template.description,
        pressureText: template.pressureText,
        rewardText: template.rewardText,
        consequenceText: template.consequenceText,
        modifierName: modifier.name,
        modifierDescription: modifier.description,
        modifierEffects: modifier.effects,
        startingPressure,
        pressureRemaining: startingPressure,
        rewardPerTurn,
        consequenceMeter: startingConsequence,
        consequenceThreshold: template.consequenceThreshold,
        consequenceByCategory: { ...EMPTY_CONSEQUENCE_BY_CATEGORY },
        thresholdExceeded: false,
        thresholdRuptureUsed: false,
        turn: 1,
        turnLimit: isUrgent ? randomInt(2, 3) : randomInt(3, 4),
    };
};

const getAvailableUpgradeByCategory = (
    upgrades: Upgrade[],
    ownedUpgradeIds: string[]
): Upgrade | null => {
    const available = upgrades.filter((upgrade) => !ownedUpgradeIds.includes(upgrade.id));
    if (available.length === 0) return null;
    return randomFrom(available);
};

const buildUpgradeChoices = (ownedUpgradeIds: string[]) => {
    const options: Upgrade[] = [];
    const strengthChoice = getAvailableUpgradeByCategory(
        STRENGTH_UPGRADES,
        ownedUpgradeIds
    );
    const worldChoice = getAvailableUpgradeByCategory(WORLD_UPGRADES, ownedUpgradeIds);

    if (strengthChoice) options.push(strengthChoice);
    if (worldChoice) options.push(worldChoice);

    return options;
};

const getDominantConsequenceCategory = (
    consequenceByCategory: Record<AbilityCategory, number>
): AbilityCategory | null => {
    const categories: AbilityCategory[] = ['smite', 'manifest', 'twist'];
    let dominant: AbilityCategory | null = null;
    let dominantValue = 0;

    for (const category of categories) {
        const value = consequenceByCategory[category];
        if (value > dominantValue) {
            dominant = category;
            dominantValue = value;
        }
    }

    return dominantValue > 0 ? dominant : null;
};

const createEncounterResolution = (
    pressureRemaining: number,
    finalConsequence: number,
    thresholdExceeded: boolean,
    startingPressure: number,
    consequenceThreshold: number,
    consequenceByCategory: Record<AbilityCategory, number>
): EncounterResolution => {
    let outcome: ResolutionOutcome;
    let flavorCategory: keyof typeof RESOLUTION_OUTCOMES;
    let essenceGained: number;
    let carryoverAdded: number;

    if (
        pressureRemaining <= 0 &&
        finalConsequence <= Math.ceil(consequenceThreshold * 0.5)
    ) {
        outcome = 'perfect';
        flavorCategory = 'perfectSuccess';
        essenceGained = 3;
        carryoverAdded = Math.max(0, Math.floor(finalConsequence / 2) - 1);
    } else if (
        pressureRemaining <= 0 ||
        (pressureRemaining <= Math.ceil(startingPressure * 0.33) &&
            finalConsequence <= consequenceThreshold)
    ) {
        outcome = 'partial';
        if (thresholdExceeded) {
            flavorCategory = 'thresholdExceeded';
        } else if (finalConsequence <= Math.ceil(consequenceThreshold * 0.5)) {
            flavorCategory = 'lowConsequence';
        } else {
            flavorCategory = 'highConsequence';
        }
        essenceGained = 2;
        carryoverAdded =
            Math.floor(finalConsequence / 2) + Math.ceil(pressureRemaining / 4);
    } else if (pressureRemaining <= Math.ceil(startingPressure * 0.67)) {
        outcome = 'minimal';
        if (thresholdExceeded) {
            flavorCategory = 'thresholdExceeded';
        } else {
            flavorCategory = 'barelySucceeded';
        }
        essenceGained = 1;
        carryoverAdded = finalConsequence + Math.ceil(pressureRemaining / 4) + 1;
    } else {
        outcome = 'catastrophic';
        flavorCategory = 'thresholdExceeded';
        essenceGained = 0;
        carryoverAdded = finalConsequence + Math.ceil(pressureRemaining / 2) + 2;
    }

    const dominantConsequenceCategory =
        getDominantConsequenceCategory(consequenceByCategory);
    let consequenceAftermath: string | null = null;

    if (dominantConsequenceCategory === 'smite') {
        carryoverAdded += 1;
        consequenceAftermath =
            'SMITE aftermath: fear spreads and refugees flee into nearby districts (+1 carryover).';
    } else if (dominantConsequenceCategory === 'manifest') {
        carryoverAdded += 1;
        essenceGained += 1;
        consequenceAftermath =
            'MANIFEST aftermath: zealot demands intensify (+1 carryover, +1 essence).';
    } else if (dominantConsequenceCategory === 'twist') {
        const fractureOverflow = randomInt(0, 2);
        carryoverAdded += fractureOverflow;
        essenceGained += 1;
        consequenceAftermath = `TWIST aftermath: reality fractures unpredictably (+${fractureOverflow} carryover, +1 essence).`;
    }

    const flavorText = randomFrom(RESOLUTION_OUTCOMES[flavorCategory]);

    return {
        outcome,
        pressureRemaining,
        finalConsequence,
        thresholdExceeded,
        essenceGained,
        carryoverAdded,
        flavorText,
        dominantConsequenceCategory,
        consequenceAftermath,
    };
};

const buildAbilityPreview = (
    state: GameState,
    abilityId: AbilityId
): AbilityPreview | null => {
    if (!state.currentEncounter) return null;
    if (!state.encounterAbilityIds.includes(abilityId)) return null;

    const ability = state.abilities.find((candidate) => candidate.id === abilityId);
    if (!ability) return null;

    const encounter = state.currentEncounter;
    const modifierEffects = encounter.modifierEffects ?? {};
    const abilityModifier = modifierEffects.abilityEffects?.find(
        (effect) => effect.abilityId === ability.id
    );

    const notes: string[] = [];
    const previousUses = state.abilityUsage[ability.id] ?? 0;
    const repeatedPowerBonus = Math.floor(previousUses / ESCALATION_INTERVAL);
    const firstCastThisEncounter = state.castsThisEncounter === 0;
    const lastAbilityId = getLastAbility(state.history);

    let strainCost =
        ability.baseStrainCost +
        repeatedPowerBonus +
        (modifierEffects.strainCostDelta ?? 0) +
        (abilityModifier?.strainCostDelta ?? 0);

    if (state.nextCastFree) {
        strainCost = 0;
        notes.push('Twist Fate or threshold rupture: this cast costs 0 Strain.');
    }

    if (
        firstCastThisEncounter &&
        state.strengthBonuses.firstCastStrainReduction > 0 &&
        strainCost > 0
    ) {
        strainCost = Math.max(
            0,
            strainCost - state.strengthBonuses.firstCastStrainReduction
        );
        notes.push(
            `Upgrade bonus: first cast costs ${state.strengthBonuses.firstCastStrainReduction} less Strain.`
        );
    }

    let strainRelief = 0;
    let pressureDelta =
        ability.basePressure +
        repeatedPowerBonus +
        (modifierEffects.pressureDelta ?? 0) +
        (abilityModifier?.pressureDelta ?? 0);
    let essenceDelta =
        encounter.rewardPerTurn +
        ability.baseEssence +
        (modifierEffects.essenceDelta ?? 0) +
        (abilityModifier?.essenceDelta ?? 0);
    let consequenceDelta =
        ability.baseConsequence +
        (modifierEffects.consequenceDelta ?? 0) +
        (abilityModifier?.consequenceDelta ?? 0);
    let willGrantFreeCast = false;
    let synergyLabel: string | null = null;

    if (state.doctrine?.id === 'dominion' && ability.basePressure > 0 && strainCost > 0) {
        strainCost = Math.max(0, strainCost - 1);
        notes.push('Doctrine of Dominion: pressure abilities cost 1 less Strain.');
    }
    strainCost = Math.max(0, strainCost);

    if (repeatedPowerBonus > 0) {
        notes.push(
            `Escalation: ${ability.name} gains +${repeatedPowerBonus} Pressure from repeated use.`
        );
    }
    if (abilityModifier) {
        notes.push(`${encounter.modifierName} alters ${ability.name} in this district.`);
    }

    if (firstCastThisEncounter && state.strengthBonuses.firstCastEssenceBonus > 0) {
        essenceDelta += state.strengthBonuses.firstCastEssenceBonus;
        notes.push(
            `Upgrade bonus: first cast grants +${state.strengthBonuses.firstCastEssenceBonus} Essence.`
        );
    }

    if (ability.id === 'smite' && lastAbilityId === 'manifest') {
        essenceDelta += 1;
        synergyLabel = 'Manifest -> Smite';
        notes.push('Synergy: Smite after Manifest Presence grants +1 Essence.');
    }

    if (ability.id === 'manifest' && lastAbilityId === 'twist') {
        strainRelief += 2;
        synergyLabel = 'Twist -> Manifest';
        notes.push('Synergy: Manifest Presence after Twist Fate reduces Strain by 2.');
    }

    if (ability.id === 'twist' && lastAbilityId === 'smite') {
        willGrantFreeCast = true;
        synergyLabel = 'Smite -> Twist';
        notes.push('Synergy: next ability will cost 0 Strain.');
    }

    if (ability.id === 'condemn' && lastAbilityId === 'witness') {
        pressureDelta += 2;
        synergyLabel = synergyLabel ?? 'Witness -> Condemn';
        notes.push('Synergy: Condemn after Witness gains +2 Pressure.');
    }

    if (ability.id === 'absolve' && lastAbilityId === 'condemn') {
        consequenceDelta -= 2;
        synergyLabel = synergyLabel ?? 'Condemn -> Absolve';
        notes.push('Synergy: Absolve after Condemn reduces Consequence by an extra 2.');
    }

    if ((ability.id === 'stifle' || ability.id === 'supplicate') && lastAbilityId === 'manifest') {
        strainRelief += 1;
        synergyLabel = synergyLabel ?? 'Manifest -> Compliance';
        notes.push('Synergy: Presence into compliance relieves 1 Strain.');
    }

    if (ability.id === 'rift' && lastAbilityId === 'twist') {
        pressureDelta += 1;
        consequenceDelta += 1;
        synergyLabel = synergyLabel ?? 'Twist -> Rift';
        notes.push('Synergy: Open Rift after Twist Fate adds +1 Pressure and +1 Consequence.');
    }

    if (state.doctrine?.id === 'revelation' && ability.baseEssence > 0) {
        pressureDelta += 1;
        essenceDelta += 1;
        notes.push('Doctrine of Revelation: essence abilities gain +1 Pressure and +1 Essence.');
    }

    if (consequenceDelta > 0) {
        if (ability.category === 'smite') {
            consequenceDelta += 1;
            notes.push('SMITE consequence: fear spreads (+1 Consequence).');
        } else if (ability.category === 'manifest') {
            consequenceDelta += 1;
            essenceDelta += 1;
            notes.push('MANIFEST consequence: zealot demands rise (+1 Consequence, +1 Essence).');
        } else if (ability.category === 'twist') {
            consequenceDelta += 1;
            const fractureHitsPressure = encounter.turn % 2 === 1;
            if (fractureHitsPressure) {
                pressureDelta += 1;
                notes.push('TWIST consequence: reality fracture surges into pressure (+1 Pressure, +1 Consequence).');
            } else {
                essenceDelta += 1;
                notes.push('TWIST consequence: reality fracture leaks power (+1 Essence, +1 Consequence).');
            }
        }
    }

    let projectedStrain = Math.max(0, state.currentStrain + strainCost - strainRelief);
    const projectedConsequence = Math.max(0, encounter.consequenceMeter + consequenceDelta);
    const thresholdTriggered =
        !encounter.thresholdExceeded &&
        projectedConsequence > encounter.consequenceThreshold;
    const willTriggerThresholdRupture =
        thresholdTriggered && !encounter.thresholdRuptureUsed;

    if (thresholdTriggered) {
        projectedStrain += THRESHOLD_PENALTY_STRAIN;
        essenceDelta -= THRESHOLD_PENALTY_ESSENCE;
        if (willTriggerThresholdRupture) {
            essenceDelta += THRESHOLD_RUPTURE_ESSENCE;
            notes.push('Threshold rupture: +1 Essence and your next cast becomes free.');
        }
        notes.push(
            `Threshold breached: +${THRESHOLD_PENALTY_STRAIN} Strain and -${THRESHOLD_PENALTY_ESSENCE} Essence.`
        );
    }

    const projectedStrainLevel = calculateStrainLevel(projectedStrain, state.maxStrain);

    if (projectedStrainLevel === 'Medium') {
        consequenceDelta += 1;
        notes.push('Distortion: Medium Instability adds +1 Consequence.');
    } else if (projectedStrainLevel === 'High') {
        consequenceDelta += 1;
        essenceDelta -= 1;
        notes.push('Backlash: High Instability adds +1 Consequence and -1 Essence.');
    } else if (projectedStrainLevel === 'Critical') {
        consequenceDelta += 2;
        essenceDelta -= 1;
        pressureDelta = Math.max(0, pressureDelta - 1);
        notes.push('Backlash: Critical Instability adds +2 Consequence, -1 Essence, and -1 Pressure.');
    }

    pressureDelta = Math.max(0, pressureDelta);
    essenceDelta = Math.max(0, essenceDelta);

    const projectedConsequenceMeter = Math.max(0, encounter.consequenceMeter + consequenceDelta);
    const willExceedThreshold = projectedConsequenceMeter > encounter.consequenceThreshold;

    if (willExceedThreshold && !encounter.thresholdExceeded) {
        notes.push(
            `WARNING: This will exceed the consequence threshold (${encounter.consequenceThreshold}).`
        );
    }

    return {
        abilityId,
        category: ability.category,
        baseStrainCost: ability.baseStrainCost,
        strainCost,
        projectedStrain,
        projectedStrainLevel,
        basePressure: ability.basePressure,
        pressureDelta,
        baseEssence: ability.baseEssence,
        essenceDelta,
        baseConsequence: ability.baseConsequence,
        consequenceDelta,
        projectedConsequenceMeter,
        willExceedThreshold,
        willTriggerThresholdRupture,
        willGrantFreeCast,
        synergyLabel,
        notes,
    };
};

const INITIAL_STATE: Omit<
    GameState,
    | 'startRun'
    | 'castAbility'
    | 'getAbilityPreview'
    | 'selectUpgrade'
    | 'skipUpgrade'
    | 'endRun'
    | 'selectDraftAbility'
    | 'selectBoonAbility'
    | 'markTutorialSeen'
    | 'nextEncounter'
    | 'resetProgress'
> = {
    essence: 0,
    runEssenceGained: 0,
    phase: 'menu',
    currentStrain: 0,
    maxStrain: BASE_MAX_STRAIN,
    strainLevel: 'Low',
    abilities: [...CORE_ABILITIES],
    encounterAbilityIds: [],
    abilityUsage: { ...EMPTY_ABILITY_USAGE },
    history: [],
    lastResolution: 'The void awaits your flawless leadership.',
    lastEncounterResolution: null,
    doctrine: null,
    currentEncounter: null,
    encountersCompleted: 0,
    encountersTarget: 0,
    runEncounterQueue: [],
    runForecast: [],
    carryOverInstability: 0,
    castsThisEncounter: 0,
    nextCastFree: false,
    boonOptions: [],
    boonPrompt: '',
    synergyStreak: 0,
    lastSynergy: '',
    ownedUpgrades: [],
    strengthBonuses: { ...DEFAULT_STRENGTH_BONUSES },
    worldWeights: { ...DEFAULT_WORLD_WEIGHTS },
    upgradeOptions: [],
    draftOptions: [],
    hasSeenTutorial: false,
    encounterResolved: false,
};

export const useGameStore = create<GameState>()(
    devtools(
        persist(
            (set, get) => ({
                ...INITIAL_STATE,

                startRun: (doctrineId) => {
                    const state = get();
                    const doctrine = getDoctrineById(doctrineId);
                    const orderedAbilities = sortAbilitiesForDoctrine(
                        doctrine.startingAbilityId
                    );
                    const encountersTarget = randomInt(3, 5);
                    const maxStrain = BASE_MAX_STRAIN + state.strengthBonuses.maxStrainBonus;
                    const runEncounterQueue = buildEncounterQueue(
                        encountersTarget,
                        state.worldWeights
                    );
                    const runForecast = buildEncounterForecast(runEncounterQueue);

                    const draftOptions = shuffle(DRAFT_POOL).slice(0, 3);

                    set({
                        phase: 'draft',
                        doctrine,
                        abilities: orderedAbilities,
                        encounterAbilityIds: [],
                        abilityUsage: { ...EMPTY_ABILITY_USAGE },
                        history: [],
                        encountersCompleted: 0,
                        encountersTarget,
                        runEncounterQueue,
                        runForecast,
                        currentEncounter: null,
                        castsThisEncounter: 0,
                        nextCastFree: false,
                        boonOptions: [],
                        boonPrompt: '',
                        synergyStreak: 0,
                        lastSynergy: '',
                        carryOverInstability: 0,
                        runEssenceGained: 0,
                        currentStrain: 0,
                        maxStrain,
                        strainLevel: 'Low',
                        upgradeOptions: [],
                        draftOptions,
                        encounterResolved: false,
                        lastEncounterResolution: null,
                        lastResolution: `${doctrine.name} chosen. Select one fragment before the first intervention.`,
                    });
                },

                markTutorialSeen: () => {
                    set({ hasSeenTutorial: true });
                },

                selectDraftAbility: (abilityId) => {
                    const state = get();
                    if (state.phase !== 'draft') return;

                    const newAbility = state.draftOptions.find((ability) => ability.id === abilityId);
                    if (!newAbility) return;

                    const updatedAbilities = [...state.abilities, newAbility];
                    const firstTemplateId =
                        state.runEncounterQueue[0] ??
                        pickEncounterTemplateId(state.worldWeights);
                    const firstEncounter = createEncounter(firstTemplateId, 0);

                    set({
                        phase: 'encounter',
                        abilities: updatedAbilities,
                        encounterAbilityIds: buildEncounterAbilityPool(updatedAbilities),
                        draftOptions: [],
                        currentEncounter: firstEncounter,
                        lastResolution: `${newAbility.name} accepted. The intervention begins.`,
                    });
                },

                selectBoonAbility: (abilityId) => {
                    const state = get();
                    if (state.phase !== 'boon') return;

                    let updatedAbilities = state.abilities;
                    let updatedEncounterAbilityIds = state.encounterAbilityIds;
                    let lastResolution = 'You reject the fragment. Restraint is a strategy.';

                    if (abilityId) {
                        const picked = state.boonOptions.find((ability) => ability.id === abilityId);
                        if (picked && !state.abilities.some((ability) => ability.id === picked.id)) {
                            updatedAbilities = [...state.abilities, picked];
                            if (
                                state.currentEncounter &&
                                !updatedEncounterAbilityIds.includes(picked.id) &&
                                updatedEncounterAbilityIds.length < ENCOUNTER_ABILITY_POOL_MAX
                            ) {
                                updatedEncounterAbilityIds = [
                                    ...updatedEncounterAbilityIds,
                                    picked.id,
                                ];
                                lastResolution = `${picked.name} absorbed. It is available immediately.`;
                            } else {
                                lastResolution = `${picked.name} absorbed. It joins your arsenal for future encounters.`;
                            }
                        }
                    }

                    set({
                        phase: 'encounter',
                        abilities: updatedAbilities,
                        encounterAbilityIds: updatedEncounterAbilityIds,
                        boonOptions: [],
                        boonPrompt: '',
                        lastResolution,
                    });
                },

                getAbilityPreview: (abilityId) => buildAbilityPreview(get(), abilityId),

                nextEncounter: () => {
                    const state = get();
                    if (!state.encounterResolved) return;

                    if (state.encountersCompleted >= state.encountersTarget) {
                        set({
                            phase: 'upgrade',
                            currentEncounter: null,
                            encounterAbilityIds: [],
                            upgradeOptions: buildUpgradeChoices(state.ownedUpgrades),
                            encounterResolved: false,
                            castsThisEncounter: 0,
                            nextCastFree: false,
                            boonOptions: [],
                            boonPrompt: '',
                            synergyStreak: 0,
                            lastSynergy: '',
                        });
                        return;
                    }

                    const templateId =
                        state.runEncounterQueue[state.encountersCompleted] ??
                        pickEncounterTemplateId(state.worldWeights);
                    const nextEncounter = createEncounter(
                        templateId,
                        state.carryOverInstability
                    );

                    set({
                        phase: 'encounter',
                        currentEncounter: nextEncounter,
                        encounterAbilityIds: buildEncounterAbilityPool(state.abilities),
                        upgradeOptions: [],
                        encounterResolved: false,
                        castsThisEncounter: 0,
                        nextCastFree: false,
                        boonOptions: [],
                        boonPrompt: '',
                        synergyStreak: 0,
                        lastSynergy: '',
                        lastEncounterResolution: null,
                    });
                },

                castAbility: (abilityId) => {
                    const state = get();
                    if (
                        state.phase !== 'encounter' ||
                        !state.currentEncounter ||
                        state.encounterResolved
                    ) {
                        return;
                    }
                    if (!state.encounterAbilityIds.includes(abilityId)) return;

                    const ability = state.abilities.find((candidate) => candidate.id === abilityId);
                    if (!ability) return;

                    const preview = buildAbilityPreview(state, abilityId);
                    if (!preview) return;

                    const abilityUsage = {
                        ...state.abilityUsage,
                        [abilityId]: (state.abilityUsage[abilityId] ?? 0) + 1,
                    };

                    const updatedPressure = Math.max(
                        0,
                        state.currentEncounter.pressureRemaining - preview.pressureDelta
                    );
                    const updatedConsequence = Math.max(
                        0,
                        state.currentEncounter.consequenceMeter + preview.consequenceDelta
                    );
                    const thresholdExceededNow =
                        !state.currentEncounter.thresholdExceeded &&
                        updatedConsequence > state.currentEncounter.consequenceThreshold;
                    const thresholdRuptureTriggered =
                        thresholdExceededNow && !state.currentEncounter.thresholdRuptureUsed;
                    const nextTurn = state.currentEncounter.turn + 1;
                    const pressureEliminated = updatedPressure <= 0;
                    const turnLimitReached = nextTurn > state.currentEncounter.turnLimit;
                    const encounterEndsNow = pressureEliminated || turnLimitReached;

                    const updatedConsequenceByCategory = {
                        ...state.currentEncounter.consequenceByCategory,
                    };
                    if (preview.consequenceDelta > 0) {
                        updatedConsequenceByCategory[ability.category] +=
                            preview.consequenceDelta;
                    }

                    const currentEncounter: ActiveEncounter = {
                        ...state.currentEncounter,
                        pressureRemaining: updatedPressure,
                        consequenceMeter: updatedConsequence,
                        consequenceByCategory: updatedConsequenceByCategory,
                        thresholdExceeded:
                            state.currentEncounter.thresholdExceeded || thresholdExceededNow,
                        thresholdRuptureUsed:
                            state.currentEncounter.thresholdRuptureUsed ||
                            thresholdRuptureTriggered,
                        turn: encounterEndsNow
                            ? state.currentEncounter.turnLimit
                            : nextTurn,
                    };

                    let phase: GameState['phase'] = 'encounter';
                    let encountersCompleted = state.encountersCompleted;
                    let carryOverInstability = state.carryOverInstability;
                    const castsThisEncounter = state.castsThisEncounter + 1;
                    let nextCastFree = preview.willGrantFreeCast || thresholdRuptureTriggered;
                    let strainAfterAction = preview.projectedStrain;
                    let lastResolution = `${ability.name}: -${preview.pressureDelta} Pressure, +${preview.essenceDelta} Essence, ${preview.consequenceDelta >= 0 ? '+' : ''}${preview.consequenceDelta} Consequence.`;
                    const upgradeOptions = state.upgradeOptions;
                    let lastEncounterResolution: EncounterResolution | null = null;
                    let encounterResolved = false;
                    let boonOptions: Ability[] = [];
                    let boonPrompt = '';

                    let synergyStreak = preview.synergyLabel ? state.synergyStreak + 1 : 0;
                    let lastSynergy = preview.synergyLabel
                        ? `${preview.synergyLabel} x${synergyStreak}`
                        : '';

                    if (thresholdRuptureTriggered) {
                        lastResolution += ' Threshold rupture grants your next cast for free.';
                    }

                    if (encounterEndsNow) {
                        encountersCompleted += 1;

                        const resolution = createEncounterResolution(
                            updatedPressure,
                            updatedConsequence,
                            currentEncounter.thresholdExceeded,
                            state.currentEncounter.startingPressure,
                            state.currentEncounter.consequenceThreshold,
                            currentEncounter.consequenceByCategory
                        );

                        lastEncounterResolution = resolution;
                        lastResolution = resolution.flavorText;

                        carryOverInstability = Math.max(
                            0,
                            Math.floor(state.carryOverInstability * 0.5) +
                                resolution.carryoverAdded
                        );

                        strainAfterAction = Math.max(
                            0,
                            strainAfterAction - ENCOUNTER_STRAIN_RELIEF
                        );
                        nextCastFree = false;
                        encounterResolved = true;
                        synergyStreak = 0;
                        lastSynergy = '';
                    }

                    if (thresholdExceededNow && !encounterEndsNow) {
                        lastResolution +=
                            ' Consequence threshold exceeded; reality objects in writing.';
                    }

                    if (!encounterEndsNow && castsThisEncounter % CASTS_PER_BOON === 0) {
                        const choices = buildBoonChoices(state.abilities, 2);
                        if (choices.length > 0) {
                            phase = 'boon';
                            boonOptions = choices;
                            boonPrompt = thresholdRuptureTriggered
                                ? 'Reality tears open. Claim one fragment before it seals.'
                                : 'A forgotten fragment surfaces. Choose one power.';
                        }
                    }

                    const resolutionEssence = lastEncounterResolution?.essenceGained ?? 0;
                    const totalEssenceGain = Math.max(
                        0,
                        preview.essenceDelta + resolutionEssence
                    );
                    const currentStrain = Math.max(0, strainAfterAction);
                    const strainLevel = calculateStrainLevel(currentStrain, state.maxStrain);

                    set({
                        phase,
                        abilityUsage,
                        history: [...state.history, abilityId],
                        currentStrain,
                        strainLevel,
                        essence: state.essence + totalEssenceGain,
                        runEssenceGained: state.runEssenceGained + totalEssenceGain,
                        currentEncounter,
                        encountersCompleted,
                        carryOverInstability,
                        castsThisEncounter,
                        nextCastFree,
                        lastResolution,
                        lastEncounterResolution,
                        upgradeOptions,
                        encounterResolved,
                        boonOptions,
                        boonPrompt,
                        synergyStreak,
                        lastSynergy,
                    });
                },

                selectUpgrade: (upgradeId) => {
                    const state = get();
                    if (state.phase !== 'upgrade') return;

                    const upgrade = state.upgradeOptions.find((option) => option.id === upgradeId);
                    if (!upgrade) return;
                    if (state.essence < upgrade.cost) return;

                    const nextStrengthBonuses: StrengthBonuses = {
                        ...state.strengthBonuses,
                    };
                    const nextWorldWeights = { ...state.worldWeights };

                    if (upgrade.firstCastStrainReduction) {
                        nextStrengthBonuses.firstCastStrainReduction +=
                            upgrade.firstCastStrainReduction;
                    }
                    if (upgrade.firstCastEssenceBonus) {
                        nextStrengthBonuses.firstCastEssenceBonus +=
                            upgrade.firstCastEssenceBonus;
                    }
                    if (upgrade.maxStrainBonus) {
                        nextStrengthBonuses.maxStrainBonus += upgrade.maxStrainBonus;
                    }
                    if (upgrade.encounterWeightDelta) {
                        const { encounterId, amount } = upgrade.encounterWeightDelta;
                        nextWorldWeights[encounterId] = Math.max(
                            1,
                            (nextWorldWeights[encounterId] ?? 1) + amount
                        );
                    }

                    set({
                        phase: 'menu',
                        doctrine: null,
                        currentEncounter: null,
                        encounterAbilityIds: [],
                        abilityUsage: { ...EMPTY_ABILITY_USAGE },
                        history: [],
                        encountersCompleted: 0,
                        encountersTarget: 0,
                        runEncounterQueue: [],
                        runForecast: [],
                        carryOverInstability: 0,
                        castsThisEncounter: 0,
                        nextCastFree: false,
                        boonOptions: [],
                        boonPrompt: '',
                        synergyStreak: 0,
                        lastSynergy: '',
                        currentStrain: 0,
                        strainLevel: 'Low',
                        maxStrain: BASE_MAX_STRAIN + nextStrengthBonuses.maxStrainBonus,
                        upgradeOptions: [],
                        draftOptions: [],
                        ownedUpgrades: [...state.ownedUpgrades, upgrade.id],
                        strengthBonuses: nextStrengthBonuses,
                        worldWeights: nextWorldWeights,
                        essence: state.essence - upgrade.cost,
                        runEssenceGained: 0,
                        lastEncounterResolution: null,
                        encounterResolved: false,
                        lastResolution: `${upgrade.name} acquired. Naturally, this will improve everything.`,
                    });
                },

                skipUpgrade: () => {
                    const state = get();
                    if (state.phase !== 'upgrade') return;

                    set({
                        phase: 'menu',
                        doctrine: null,
                        currentEncounter: null,
                        encounterAbilityIds: [],
                        abilityUsage: { ...EMPTY_ABILITY_USAGE },
                        history: [],
                        encountersCompleted: 0,
                        encountersTarget: 0,
                        runEncounterQueue: [],
                        runForecast: [],
                        carryOverInstability: 0,
                        castsThisEncounter: 0,
                        nextCastFree: false,
                        boonOptions: [],
                        boonPrompt: '',
                        synergyStreak: 0,
                        lastSynergy: '',
                        currentStrain: 0,
                        strainLevel: 'Low',
                        maxStrain: BASE_MAX_STRAIN + state.strengthBonuses.maxStrainBonus,
                        upgradeOptions: [],
                        draftOptions: [],
                        runEssenceGained: 0,
                        lastEncounterResolution: null,
                        encounterResolved: false,
                        lastResolution: 'You reserve your Essence for a future correction.',
                    });
                },

                endRun: () => {
                    const state = get();
                    set({
                        phase: 'menu',
                        doctrine: null,
                        currentEncounter: null,
                        encounterAbilityIds: [],
                        abilityUsage: { ...EMPTY_ABILITY_USAGE },
                        history: [],
                        encountersCompleted: 0,
                        encountersTarget: 0,
                        runEncounterQueue: [],
                        runForecast: [],
                        carryOverInstability: 0,
                        castsThisEncounter: 0,
                        nextCastFree: false,
                        boonOptions: [],
                        boonPrompt: '',
                        synergyStreak: 0,
                        lastSynergy: '',
                        currentStrain: 0,
                        strainLevel: 'Low',
                        maxStrain: BASE_MAX_STRAIN + state.strengthBonuses.maxStrainBonus,
                        runEssenceGained: 0,
                        upgradeOptions: [],
                        draftOptions: [],
                        lastEncounterResolution: null,
                        encounterResolved: false,
                        lastResolution:
                            'You withdraw before mortals can misunderstand your brilliance.',
                    });
                },

                resetProgress: () => {
                    set({
                        ...INITIAL_STATE,
                        abilities: [...CORE_ABILITIES],
                        worldWeights: { ...DEFAULT_WORLD_WEIGHTS },
                        strengthBonuses: { ...DEFAULT_STRENGTH_BONUSES },
                    });
                },
            }),
            {
                name: 'fallen-god-storage',
                version: 4,
            }
        )
    )
);
