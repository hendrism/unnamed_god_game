import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CORE_ABILITIES, DRAFT_POOL } from '../data/abilities';
import { DOCTRINES } from '../data/doctrines';
import { ENCOUNTER_MODIFIERS, ENCOUNTER_TEMPLATES } from '../data/encounters';
import { STRENGTH_UPGRADES, WORLD_UPGRADES } from '../data/upgrades';
import type {
    Ability,
    AbilityId,
    AbilityPreview,
    ActiveEncounter,
    Doctrine,
    DoctrineId,
    GameState,
    StrainLevel,
    StrengthBonuses,
    Upgrade,
} from '../types';

const BASE_MAX_STRAIN = 20;
const ENCOUNTER_STRAIN_RELIEF = 4;

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

const EMPTY_ABILITY_USAGE: Record<AbilityId, number> = {
    smite: 0,
    manifest: 0,
    twist: 0,
    condemn: 0,
    witness: 0,
    absolve: 0,
    stifle: 0,
};

const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getDoctrineById = (doctrineId: DoctrineId): Doctrine =>
    DOCTRINES.find((doctrine) => doctrine.id === doctrineId) ?? DOCTRINES[0];

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

const pickEncounterTemplate = (weights: Record<string, number>) => {
    const totalWeight = ENCOUNTER_TEMPLATES.reduce(
        (sum, template) => sum + Math.max(1, weights[template.id] ?? 1),
        0
    );

    let roll = Math.random() * totalWeight;
    for (const template of ENCOUNTER_TEMPLATES) {
        roll -= Math.max(1, weights[template.id] ?? 1);
        if (roll <= 0) {
            return template;
        }
    }

    return ENCOUNTER_TEMPLATES[ENCOUNTER_TEMPLATES.length - 1];
};

const createEncounter = (
    carryOverInstability: number,
    worldWeights: Record<string, number>
): ActiveEncounter => {
    const template = pickEncounterTemplate(worldWeights);
    const modifier = randomFrom(ENCOUNTER_MODIFIERS);
    const pressureFromCarryOver = Math.min(3, carryOverInstability);
    const startingPressure = Math.max(
        4,
        template.basePressure + modifier.pressureDelta + pressureFromCarryOver
    );
    const rewardPerTurn = Math.max(1, template.baseRewardPerTurn + modifier.rewardDelta);
    const startingConsequence = Math.max(0, template.baseConsequence + modifier.consequenceDelta);

    return {
        id: `${template.id}-${modifier.id}-${Math.random().toString(36).slice(2, 8)}`,
        templateId: template.id,
        title: template.title,
        description: template.description,
        pressureText: template.pressureText,
        rewardText: template.rewardText,
        consequenceText: template.consequenceText,
        modifierName: modifier.name,
        modifierDescription: modifier.description,
        startingPressure,
        pressureRemaining: startingPressure,
        rewardPerTurn,
        consequenceMeter: startingConsequence,
        turn: 1,
        turnLimit: randomInt(3, 5),
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
    const strengthChoice = getAvailableUpgradeByCategory(STRENGTH_UPGRADES, ownedUpgradeIds);
    const worldChoice = getAvailableUpgradeByCategory(WORLD_UPGRADES, ownedUpgradeIds);

    if (strengthChoice) options.push(strengthChoice);
    if (worldChoice) options.push(worldChoice);

    return options;
};

const buildAbilityPreview = (state: GameState, abilityId: AbilityId): AbilityPreview | null => {
    if (!state.currentEncounter) return null;
    const ability = state.abilities.find((candidate) => candidate.id === abilityId);
    if (!ability) return null;

    const notes: string[] = [];
    const previousUses = state.abilityUsage[ability.id] ?? 0;
    const repeatedPowerBonus = Math.floor(previousUses / 3);
    const firstCastThisEncounter = state.castsThisEncounter === 0;
    const lastAbilityId = getLastAbility(state.history);

    let strainCost = state.nextCastFree ? 0 : ability.baseStrainCost + repeatedPowerBonus;
    if (state.nextCastFree) {
        notes.push('Twist Fate synergy: this cast costs 0 Strain.');
    }
    if (firstCastThisEncounter && state.strengthBonuses.firstCastStrainReduction > 0 && strainCost > 0) {
        strainCost = Math.max(0, strainCost - state.strengthBonuses.firstCastStrainReduction);
        notes.push(
            `Upgrade bonus: first cast costs ${state.strengthBonuses.firstCastStrainReduction} less Strain.`
        );
    }

    let strainRelief = 0;
    let pressureDelta = ability.basePressure + repeatedPowerBonus;
    let essenceDelta = state.currentEncounter.rewardPerTurn + ability.baseEssence;
    let consequenceDelta = ability.baseConsequence;
    let willGrantFreeCast = false;

    if (repeatedPowerBonus > 0) {
        notes.push(`Escalation: ${ability.name} gains +${repeatedPowerBonus} Pressure from repeated use.`);
    }

    if (firstCastThisEncounter && state.strengthBonuses.firstCastEssenceBonus > 0) {
        essenceDelta += state.strengthBonuses.firstCastEssenceBonus;
        notes.push(`Upgrade bonus: first cast grants +${state.strengthBonuses.firstCastEssenceBonus} Essence.`);
    }

    if (ability.id === 'smite' && lastAbilityId === 'manifest') {
        essenceDelta += 1;
        notes.push('Synergy: Smite after Manifest Presence grants +1 Essence.');
    }

    if (ability.id === 'manifest' && lastAbilityId === 'twist') {
        strainRelief += 2;
        notes.push('Synergy: Manifest Presence after Twist Fate reduces Strain by 2.');
    }

    if (ability.id === 'twist' && lastAbilityId === 'smite') {
        willGrantFreeCast = true;
        notes.push('Synergy: next ability will cost 0 Strain.');
    }

    if (
        state.doctrine?.id === 'dominion' &&
        ability.id === 'smite' &&
        !state.doctrinePassiveUsed
    ) {
        pressureDelta += 1;
        notes.push('Doctrine bonus: first Smite each encounter deals +1 Pressure.');
    }

    if (
        state.doctrine?.id === 'revelation' &&
        ability.id === 'manifest' &&
        !state.doctrinePassiveUsed
    ) {
        essenceDelta += 1;
        notes.push('Doctrine bonus: first Manifest Presence each encounter grants +1 Essence.');
    }

    const projectedStrain = Math.max(0, state.currentStrain + strainCost - strainRelief);
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

    essenceDelta = Math.max(0, essenceDelta);

    return {
        abilityId,
        strainCost,
        projectedStrain,
        projectedStrainLevel,
        pressureDelta,
        essenceDelta,
        consequenceDelta,
        willGrantFreeCast,
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
    | 'markTutorialSeen'
    | 'resetProgress'
> = {
    essence: 0,
    runEssenceGained: 0,
    phase: 'menu',
    currentStrain: 0,
    maxStrain: BASE_MAX_STRAIN,
    strainLevel: 'Low',
    abilities: [...CORE_ABILITIES],
    abilityUsage: { ...EMPTY_ABILITY_USAGE },
    history: [],
    lastResolution: 'The void awaits your flawless leadership.',
    doctrine: null,
    currentEncounter: null,
    encountersCompleted: 0,
    encountersTarget: 0,
    carryOverInstability: 0,
    castsThisEncounter: 0,
    doctrinePassiveUsed: false,
    nextCastFree: false,
    ownedUpgrades: [],
    strengthBonuses: { ...DEFAULT_STRENGTH_BONUSES },
    worldWeights: { ...DEFAULT_WORLD_WEIGHTS },
    upgradeOptions: [],
    draftOptions: [],
    hasSeenTutorial: false,
};

export const useGameStore = create<GameState>()(
    devtools(
        persist(
            (set, get) => ({
                ...INITIAL_STATE,

                startRun: (doctrineId) => {
                    const state = get();
                    const doctrine = getDoctrineById(doctrineId);
                    const orderedAbilities = sortAbilitiesForDoctrine(doctrine.startingAbilityId);
                    const encountersTarget = randomInt(3, 5);
                    const maxStrain = BASE_MAX_STRAIN + state.strengthBonuses.maxStrainBonus;

                    // Draft Phase Logic
                    const shuffledDraft = [...DRAFT_POOL].sort(() => 0.5 - Math.random());
                    const draftOptions = shuffledDraft.slice(0, 3);

                    set({
                        phase: 'draft',
                        doctrine,
                        abilities: orderedAbilities,
                        abilityUsage: { ...EMPTY_ABILITY_USAGE },
                        history: [],
                        encountersCompleted: 0,
                        encountersTarget,
                        currentEncounter: null, // Don't start encounter yet
                        castsThisEncounter: 0,
                        doctrinePassiveUsed: false,
                        nextCastFree: false,
                        carryOverInstability: 0,
                        runEssenceGained: 0,
                        currentStrain: 0,
                        maxStrain,
                        strainLevel: 'Low',
                        upgradeOptions: [],
                        draftOptions,
                        lastResolution: `${doctrine.name} chosen. Now, a minor addition to your arsenal.`,
                    });
                },

                markTutorialSeen: () => {
                    set({ hasSeenTutorial: true });
                },

                selectDraftAbility: (abilityId) => {
                    const state = get();
                    if (state.phase !== 'draft') return;

                    const newAbility = state.draftOptions.find((a) => a.id === abilityId);
                    if (!newAbility) return;

                    set({
                        phase: 'encounter',
                        abilities: [...state.abilities, newAbility],
                        draftOptions: [],
                        currentEncounter: createEncounter(0, state.worldWeights),
                        lastResolution: `${newAbility.name} accepted. The intervention begins.`,
                    });
                },

                getAbilityPreview: (abilityId) => buildAbilityPreview(get(), abilityId),

                castAbility: (abilityId) => {
                    const state = get();
                    if (state.phase !== 'encounter' || !state.currentEncounter) return;

                    const preview = buildAbilityPreview(state, abilityId);
                    if (!preview) return;

                    const abilityUsage = {
                        ...state.abilityUsage,
                        [abilityId]: (state.abilityUsage[abilityId] ?? 0) + 1,
                    };

                    const doctrineTriggered =
                        (state.doctrine?.id === 'dominion' &&
                            abilityId === 'smite' &&
                            !state.doctrinePassiveUsed) ||
                        (state.doctrine?.id === 'revelation' &&
                            abilityId === 'manifest' &&
                            !state.doctrinePassiveUsed);

                    const updatedPressure = Math.max(
                        0,
                        state.currentEncounter.pressureRemaining - preview.pressureDelta
                    );
                    const updatedConsequence = Math.max(
                        0,
                        state.currentEncounter.consequenceMeter + preview.consequenceDelta
                    );
                    const nextTurn = state.currentEncounter.turn + 1;
                    const encounterEndsNow = nextTurn > state.currentEncounter.turnLimit;

                    let phase: GameState['phase'] = 'encounter';
                    let encountersCompleted = state.encountersCompleted;
                    let carryOverInstability = state.carryOverInstability;
                    let currentEncounter: ActiveEncounter | null = {
                        ...state.currentEncounter,
                        pressureRemaining: updatedPressure,
                        consequenceMeter: updatedConsequence,
                        turn: nextTurn,
                    };
                    let castsThisEncounter = state.castsThisEncounter + 1;
                    let doctrinePassiveUsed = state.doctrinePassiveUsed || doctrineTriggered;
                    const nextCastFree = preview.willGrantFreeCast;
                    let extraEssence = 0;
                    let strainAfterAction = preview.projectedStrain;
                    let lastResolution = `${abilityId.toUpperCase()}: -${preview.pressureDelta} Pressure, +${preview.essenceDelta} Essence, ${preview.consequenceDelta >= 0 ? '+' : ''}${preview.consequenceDelta} Consequence.`;
                    let upgradeOptions = state.upgradeOptions;

                    if (encounterEndsNow) {
                        encountersCompleted += 1;

                        const unresolvedPressure = updatedPressure;
                        let carryGain = updatedConsequence + Math.ceil(unresolvedPressure / 4);

                        if (unresolvedPressure <= 0) {
                            extraEssence += 1;
                            carryGain = Math.max(0, carryGain - 1);
                            lastResolution =
                                'Intervention triumphant. Order restored. Side effects remain theoretical.';
                        } else if (unresolvedPressure <= Math.ceil(state.currentEncounter.startingPressure / 2)) {
                            carryGain += 1;
                            lastResolution =
                                'Partial success. The district survives, and complains in equal measure.';
                        } else {
                            carryGain += 2;
                            strainAfterAction += 1;
                            lastResolution =
                                'Backlash. Reality accepted your ruling with visible reluctance.';
                        }

                        carryOverInstability =
                            Math.max(0, Math.floor(state.carryOverInstability * 0.5) + carryGain);
                        strainAfterAction = Math.max(0, strainAfterAction - ENCOUNTER_STRAIN_RELIEF);

                        if (encountersCompleted >= state.encountersTarget) {
                            phase = 'upgrade';
                            currentEncounter = null;
                            castsThisEncounter = 0;
                            doctrinePassiveUsed = false;
                            upgradeOptions = buildUpgradeChoices(state.ownedUpgrades);
                        } else {
                            phase = 'encounter';
                            currentEncounter = createEncounter(carryOverInstability, state.worldWeights);
                            castsThisEncounter = 0;
                            doctrinePassiveUsed = false;
                        }
                    }

                    const totalEssenceGain = preview.essenceDelta + extraEssence;
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
                        doctrinePassiveUsed,
                        nextCastFree,
                        lastResolution,
                        upgradeOptions,
                    });
                },

                selectUpgrade: (upgradeId) => {
                    const state = get();
                    if (state.phase !== 'upgrade') return;

                    const upgrade = state.upgradeOptions.find((option) => option.id === upgradeId);
                    if (!upgrade) return;
                    if (state.essence < upgrade.cost) return;

                    const nextStrengthBonuses: StrengthBonuses = { ...state.strengthBonuses };
                    const nextWorldWeights = { ...state.worldWeights };

                    if (upgrade.firstCastStrainReduction) {
                        nextStrengthBonuses.firstCastStrainReduction += upgrade.firstCastStrainReduction;
                    }
                    if (upgrade.firstCastEssenceBonus) {
                        nextStrengthBonuses.firstCastEssenceBonus += upgrade.firstCastEssenceBonus;
                    }
                    if (upgrade.maxStrainBonus) {
                        nextStrengthBonuses.maxStrainBonus += upgrade.maxStrainBonus;
                    }
                    if (upgrade.encounterWeightDelta) {
                        const { encounterId, amount } = upgrade.encounterWeightDelta;
                        nextWorldWeights[encounterId] = Math.max(1, (nextWorldWeights[encounterId] ?? 1) + amount);
                    }

                    set({
                        phase: 'menu',
                        doctrine: null,
                        currentEncounter: null,
                        abilityUsage: { ...EMPTY_ABILITY_USAGE },
                        history: [],
                        encountersCompleted: 0,
                        encountersTarget: 0,
                        carryOverInstability: 0,
                        castsThisEncounter: 0,
                        doctrinePassiveUsed: false,
                        nextCastFree: false,
                        currentStrain: 0,
                        strainLevel: 'Low',
                        maxStrain: BASE_MAX_STRAIN + nextStrengthBonuses.maxStrainBonus,
                        upgradeOptions: [],
                        ownedUpgrades: [...state.ownedUpgrades, upgrade.id],
                        strengthBonuses: nextStrengthBonuses,
                        worldWeights: nextWorldWeights,
                        essence: state.essence - upgrade.cost,
                        runEssenceGained: 0,
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
                        abilityUsage: { ...EMPTY_ABILITY_USAGE },
                        history: [],
                        encountersCompleted: 0,
                        encountersTarget: 0,
                        carryOverInstability: 0,
                        castsThisEncounter: 0,
                        doctrinePassiveUsed: false,
                        nextCastFree: false,
                        currentStrain: 0,
                        strainLevel: 'Low',
                        maxStrain: BASE_MAX_STRAIN + state.strengthBonuses.maxStrainBonus,
                        upgradeOptions: [],
                        runEssenceGained: 0,
                        lastResolution: 'You reserve your Essence for a future correction.',
                    });
                },

                endRun: () => {
                    const state = get();
                    set({
                        phase: 'menu',
                        doctrine: null,
                        currentEncounter: null,
                        abilityUsage: { ...EMPTY_ABILITY_USAGE },
                        history: [],
                        encountersCompleted: 0,
                        encountersTarget: 0,
                        carryOverInstability: 0,
                        castsThisEncounter: 0,
                        doctrinePassiveUsed: false,
                        nextCastFree: false,
                        currentStrain: 0,
                        strainLevel: 'Low',
                        maxStrain: BASE_MAX_STRAIN + state.strengthBonuses.maxStrainBonus,
                        runEssenceGained: 0,
                        upgradeOptions: [],
                        lastResolution: 'You withdraw before mortals can misunderstand your brilliance.',
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
                version: 2,
            }
        )
    )
);
