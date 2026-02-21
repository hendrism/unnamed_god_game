import { ALL_ABILITIES, CORE_ABILITIES } from '../data/abilities';
import { DOCTRINES } from '../data/doctrines';
import { ENCOUNTER_MODIFIERS } from '../data/encounterModifiers';
import { ENCOUNTER_TEMPLATES } from '../data/encounters';
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
    EncounterTemplate,
    GameState,
    ResolutionOutcome,
    StrainLevel,
    StrengthBonuses,
    Upgrade,
} from '../types';

// ─── Game Balance Constants ─────────────────────────────────────────────────

export const BASE_MAX_STRAIN = 20;
export const ENCOUNTER_STRAIN_RELIEF = 4;
export const THRESHOLD_PENALTY_STRAIN = 2;
export const THRESHOLD_PENALTY_ESSENCE = 1;
export const THRESHOLD_RUPTURE_ESSENCE = 1;
export const CASTS_PER_BOON = 2;
export const ENCOUNTER_ABILITY_POOL_MIN = 5;
export const ENCOUNTER_ABILITY_POOL_MAX = 6;
export const ESCALATION_INTERVAL = 2;
export const URGENT_ENCOUNTER_CHANCE = 0.45;
export const URGENT_PRESSURE_MULTIPLIER = 1.2;

// ─── Default State Shapes ────────────────────────────────────────────────────

export const DEFAULT_STRENGTH_BONUSES: StrengthBonuses = {
    firstCastStrainReduction: 0,
    firstCastEssenceBonus: 0,
    maxStrainBonus: 0,
    carryoverDecayBonus: 0,
    synergyEssenceBonus: 0,
};

export const DEFAULT_WORLD_WEIGHTS: Record<string, number> = ENCOUNTER_TEMPLATES.reduce(
    (acc, encounter) => {
        acc[encounter.id] = 1;
        return acc;
    },
    {} as Record<string, number>
);

export const EMPTY_CONSEQUENCE_BY_CATEGORY: Record<AbilityCategory, number> = {
    smite: 0,
    manifest: 0,
    twist: 0,
};

export const EMPTY_ABILITY_USAGE: Record<AbilityId, number> = {
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
    ordain: 0,
    invoke: 0,
    unravel: 0,
    coerce: 0,
};

// ─── Utility ─────────────────────────────────────────────────────────────────

export const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

export const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

// ─── Data Lookups ─────────────────────────────────────────────────────────────

export const getDoctrineById = (doctrineId: DoctrineId): Doctrine =>
    DOCTRINES.find((doctrine) => doctrine.id === doctrineId) ?? DOCTRINES[0];

export const getEncounterTemplateById = (templateId: string) =>
    ENCOUNTER_TEMPLATES.find((template) => template.id === templateId) ??
    ENCOUNTER_TEMPLATES[0];

export const sortAbilitiesForDoctrine = (startingAbilityId: AbilityId): Ability[] => {
    const start = CORE_ABILITIES.find((ability) => ability.id === startingAbilityId);
    const rest = CORE_ABILITIES.filter((ability) => ability.id !== startingAbilityId);
    return start ? [start, ...rest] : [...CORE_ABILITIES];
};

export const getLastAbility = (history: AbilityId[]): AbilityId | null =>
    history.length === 0 ? null : history[history.length - 1];

// ─── Calculations ─────────────────────────────────────────────────────────────

export const calculateStrainLevel = (current: number, max: number): StrainLevel => {
    const ratio = max <= 0 ? 1 : current / max;
    if (ratio < 0.45) return 'Low';
    if (ratio < 0.8) return 'Medium';
    if (ratio < 1) return 'High';
    return 'Critical';
};

// ─── Encounter Generation ────────────────────────────────────────────────────

export const pickEncounterTemplateId = (
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

export const buildEncounterQueue = (
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

export const buildEncounterForecast = (queue: string[]): EncounterForecast[] => {
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

export const buildEncounterAbilityPool = (abilities: Ability[]): AbilityId[] => {
    if (abilities.length === 0) return [];

    const minPool = Math.min(ENCOUNTER_ABILITY_POOL_MIN, abilities.length);
    const maxPool = Math.min(ENCOUNTER_ABILITY_POOL_MAX, abilities.length);
    const poolSize = minPool === maxPool ? maxPool : randomInt(minPool, maxPool);

    return shuffle(abilities)
        .slice(0, poolSize)
        .map((ability) => ability.id);
};

export const buildBoonChoices = (ownedAbilities: Ability[], choiceCount = 2): Ability[] => {
    const ownedIds = new Set(ownedAbilities.map((ability) => ability.id));
    const available = ALL_ABILITIES.filter((ability) => !ownedIds.has(ability.id));
    if (available.length === 0) return [];

    return shuffle(available).slice(0, Math.min(choiceCount, available.length));
};

export const createEncounter = (
    templateId: string,
    carryOverInstability: number
): ActiveEncounter => {
    const template = getEncounterTemplateById(templateId);
    const modifier = randomFrom(ENCOUNTER_MODIFIERS);
    const pressureFromCarryOver = Math.min(15, carryOverInstability);
    const isUrgent = Math.random() < URGENT_ENCOUNTER_CHANCE;
    const pressureScalar = isUrgent ? URGENT_PRESSURE_MULTIPLIER : 1;
    const startingPressure = Math.max(
        20,
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

// ─── Upgrade Selection ───────────────────────────────────────────────────────

const getAvailableUpgradeByCategory = (
    upgrades: Upgrade[],
    ownedUpgradeIds: string[]
): Upgrade | null => {
    const available = upgrades.filter((upgrade) => !ownedUpgradeIds.includes(upgrade.id));
    if (available.length === 0) return null;
    return randomFrom(available);
};

export const buildUpgradeChoices = (ownedUpgradeIds: string[]) => {
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

// ─── Resolution ──────────────────────────────────────────────────────────────

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

export const createEncounterResolution = (
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
        carryoverAdded = Math.floor(finalConsequence / 2) + Math.ceil(pressureRemaining / 4) + 1;
    } else {
        outcome = 'catastrophic';
        flavorCategory = 'thresholdExceeded';
        essenceGained = 0;
        carryoverAdded = Math.floor(finalConsequence / 2) + Math.ceil(pressureRemaining / 2) + 2;
    }

    const dominantConsequenceCategory =
        getDominantConsequenceCategory(consequenceByCategory);
    let consequenceAftermath: string | null = null;

    if (dominantConsequenceCategory === 'smite') {
        carryoverAdded += 1;
        consequenceAftermath =
            'Smite aftermath: the righteous fear you inspired has spread into neighboring districts. You consider this bonus coverage.';
    } else if (dominantConsequenceCategory === 'manifest') {
        carryoverAdded += 1;
        essenceGained += 1;
        consequenceAftermath =
            'Manifest aftermath: your followers have become emphatic. This is their decision to manage.';
    } else if (dominantConsequenceCategory === 'twist') {
        const fractureOverflow = randomInt(0, 2);
        carryoverAdded += fractureOverflow;
        essenceGained += 1;
        consequenceAftermath = `Twist aftermath: reality has formed strong opinions about what you did. The details remain under review.`;
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

// ─── Ability Preview ─────────────────────────────────────────────────────────

export const buildAbilityPreview = (
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
        notes.push('Rupture in effect: this cast is free. The cosmos is being cooperative.');
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
        notes.push('Dominion passive: force is discounted. This is correct and expected.');
    }
    strainCost = Math.max(0, strainCost);

    if (repeatedPowerBonus > 0) {
        notes.push(
            `Repetition: ${ability.name} has grown accustomed to being deployed. +${repeatedPowerBonus} Pressure.`
        );
    }
    if (abilityModifier) {
        notes.push(`${encounter.modifierName}: local conditions affect ${ability.name}.`);
    }

    if (firstCastThisEncounter && state.strengthBonuses.firstCastEssenceBonus > 0) {
        essenceDelta += state.strengthBonuses.firstCastEssenceBonus;
        notes.push(
            `Upgrade bonus: first cast grants +${state.strengthBonuses.firstCastEssenceBonus} Essence.`
        );
    }

    if (ability.id === 'smite' && lastAbilityId === 'manifest') {
        consequenceDelta = Math.min(0, consequenceDelta);
        synergyLabel = 'Manifest -> Smite';
        notes.push('Synergy: Smite after Manifest Presence causes 0 Consequence (immunity).');
    }

    if (ability.id === 'manifest' && lastAbilityId === 'twist') {
        strainRelief += 2;
        pressureDelta += 2;
        synergyLabel = 'Twist -> Manifest';
        notes.push('Synergy: Manifest Presence after Twist Fate reduces Strain by 2 and gains +2 Pressure.');
    }

    if (ability.id === 'twist' && lastAbilityId === 'smite') {
        willGrantFreeCast = true;
        synergyLabel = 'Smite -> Twist';
        notes.push('Synergy: next ability will cost 0 Strain and cause 0 Consequence.');
    }

    if (ability.id === 'condemn' && lastAbilityId === 'witness') {
        pressureDelta += 2;
        synergyLabel = synergyLabel ?? 'Witness -> Condemn';
        notes.push('Synergy: Condemn after Witness gains +2 Pressure.');
    }

    if (ability.id === 'absolve' && lastAbilityId === 'condemn') {
        consequenceDelta -= 4;
        essenceDelta += 1;
        synergyLabel = synergyLabel ?? 'Condemn -> Absolve';
        notes.push('Synergy: Absolve after Condemn reduces Consequence by an extra 4 and grants +1 Essence.');
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

    if (ability.id === 'ordain' && lastAbilityId === 'manifest') {
        essenceDelta += 2;
        synergyLabel = synergyLabel ?? 'Manifest -> Ordain';
        notes.push('Synergy: Ordain after Manifest Presence grants +2 Essence. Legitimacy is lucrative.');
    }

    if (ability.id === 'invoke' && lastAbilityId === 'witness') {
        pressureDelta += 1;
        consequenceDelta -= 2;
        synergyLabel = synergyLabel ?? 'Witness -> Invoke';
        notes.push('Synergy: Invoke after Witness converts observation into +1 Pressure and -2 Consequence.');
    }

    if (ability.id === 'unravel' && lastAbilityId === 'smite') {
        consequenceDelta -= 3;
        synergyLabel = synergyLabel ?? 'Smite -> Unravel';
        notes.push('Synergy: Unravel after Smite revises the aftermath. -3 Consequence.');
    }

    if (ability.id === 'coerce' && lastAbilityId === 'ordain') {
        pressureDelta += 3;
        synergyLabel = synergyLabel ?? 'Ordain -> Coerce';
        notes.push('Synergy: Coerce after Ordain backs the mandate with force. +3 Pressure.');
    }

    if (state.doctrine?.id === 'revelation' && ability.baseEssence > 0) {
        pressureDelta += 1;
        essenceDelta += 1;
        notes.push('Revelation passive: presence compounds into pressure and tribute.');
    }

    if (state.nextCastFree) {
        consequenceDelta = Math.min(0, consequenceDelta);
    }

    if (consequenceDelta > 0) {
        if (ability.category === 'smite') {
            consequenceDelta += 1;
            notes.push('Smite consequence: the fear has spread further than planned. You had a plan.');
        } else if (ability.category === 'manifest') {
            consequenceDelta += 1;
            essenceDelta += 1;
            notes.push('Manifest consequence: the devout have become demanding. Their faith is excessive.');
        } else if (ability.category === 'twist') {
            consequenceDelta += 1;
            const fractureHitsPressure = encounter.turn % 2 === 1;
            if (fractureHitsPressure) {
                pressureDelta += 1;
                notes.push('Twist consequence: reality fractures. Additional pressure surfaces, unannounced.');
            } else {
                essenceDelta += 1;
                notes.push('Twist consequence: reality fractures. Power escapes through the gap.');
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
            notes.push('Threshold ruptured: something gave way. Take the bonus and the free cast.');
        }
        notes.push(
            `Threshold breached: +${THRESHOLD_PENALTY_STRAIN} Strain and -${THRESHOLD_PENALTY_ESSENCE} Essence.`
        );
    }

    const projectedStrainLevel = calculateStrainLevel(projectedStrain, state.maxStrain);

    // STRAIN PENALTY: Higher strain = sloppier interventions = more consequences
    if (projectedStrainLevel === 'Medium') {
        consequenceDelta += 5;
        notes.push('Strain (Medium): the intervention grows sloppy. +5 Consequence.');
    } else if (projectedStrainLevel === 'High') {
        consequenceDelta += 8;
        essenceDelta -= 1;
        notes.push('Strain (High): divine overreach. The execution suffers. +8 Consequence, -1 Essence.');
    } else if (projectedStrainLevel === 'Critical') {
        consequenceDelta += 12;
        essenceDelta -= 1;
        pressureDelta = Math.max(0, pressureDelta - 5);
        notes.push('Strain (Critical): the god is pushing too hard. Reality is resisting. +12 Consequence, -1 Essence, -5 Pressure.');
    }

    pressureDelta = Math.max(0, pressureDelta);
    essenceDelta = Math.max(0, essenceDelta);

    const projectedConsequenceMeter = Math.max(0, encounter.consequenceMeter + consequenceDelta);
    const willExceedThreshold = projectedConsequenceMeter > encounter.consequenceThreshold;

    if (willExceedThreshold && !encounter.thresholdExceeded) {
        notes.push(
            'Warning: this will exceed the consequence threshold. The cosmos will file a complaint.'
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

// ─── Return-to-Menu State Builder (M1) ───────────────────────────────────────

export const buildReturnToMenuState = (maxStrain: number, lastResolution: string) => ({
    phase: 'menu' as const,
    doctrine: null,
    currentEncounter: null,
    encounterAbilityIds: [] as AbilityId[],
    abilityUsage: { ...EMPTY_ABILITY_USAGE },
    history: [] as AbilityId[],
    actionLog: [] as GameState['actionLog'],
    encountersCompleted: 0,
    encountersTarget: 0,
    runEncounterQueue: [] as string[],
    runForecast: [] as EncounterForecast[],
    carryOverInstability: 0,
    castsThisEncounter: 0,
    nextCastFree: false,
    boonOptions: [] as Ability[],
    boonPrompt: '',
    petitionOptions: [] as EncounterTemplate[],
    synergyStreak: 0,
    lastSynergy: '',
    currentStrain: 0,
    strainLevel: 'Low' as StrainLevel,
    maxStrain,
    upgradeOptions: [] as Upgrade[],
    draftOptions: [] as Ability[],
    runEssenceGained: 0,
    lastEncounterResolution: null,
    encounterResolved: false,
    lastResolution,
});
