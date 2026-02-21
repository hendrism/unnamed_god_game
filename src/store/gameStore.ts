import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CORE_ABILITIES, DRAFT_POOL } from '../data/abilities';
import type {
    Ability,
    GameState,
    StrengthBonuses,
} from '../types';
import {
    BASE_MAX_STRAIN,
    CASTS_PER_BOON,
    DEFAULT_STRENGTH_BONUSES,
    DEFAULT_WORLD_WEIGHTS,
    EMPTY_ABILITY_USAGE,
    ENCOUNTER_STRAIN_RELIEF,
    buildAbilityPreview,
    buildBoonChoices,
    buildEncounterAbilityPool,
    buildEncounterForecast,
    buildEncounterQueue,
    buildReturnToMenuState,
    buildUpgradeChoices,
    calculateStrainLevel,
    createEncounter,
    createEncounterResolution,
    getDoctrineById,
    getEncounterTemplateById,
    pickEncounterTemplateId,
    shuffle,
    sortAbilitiesForDoctrine,
} from '../utils/gameLogic';

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
    | 'selectPetition'
    | 'resetProgress'
    | 'toggleDebugMode'
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
    actionLog: [],
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
    petitionOptions: [],
    synergyStreak: 0,
    lastSynergy: '',
    ownedUpgrades: [],
    strengthBonuses: { ...DEFAULT_STRENGTH_BONUSES },
    worldWeights: { ...DEFAULT_WORLD_WEIGHTS },
    upgradeOptions: [],
    draftOptions: [],
    hasSeenTutorial: false,
    encounterResolved: false,
    debugMode: false,
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
                    const encountersTarget = Math.floor(Math.random() * 3) + 3;
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
                        actionLog: [],
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
                                updatedEncounterAbilityIds.length < 6
                            ) {
                                updatedEncounterAbilityIds = [
                                    ...updatedEncounterAbilityIds,
                                    picked.id,
                                ];
                                lastResolution = `${picked.name} reclaimed. Deploy it at your earliest inconvenience.`;
                            } else {
                                lastResolution = `${picked.name} reclaimed. It will be useful when the time is appropriate.`;
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
                            petitionOptions: [],
                            synergyStreak: 0,
                            lastSynergy: '',
                        });
                        return;
                    }

                    // Show petition when there are 2+ encounters remaining
                    if (state.encountersCompleted + 1 < state.encountersTarget) {
                        const templateIdA =
                            state.runEncounterQueue[state.encountersCompleted] ??
                            pickEncounterTemplateId(state.worldWeights);
                        const templateIdB = pickEncounterTemplateId(
                            state.worldWeights,
                            templateIdA
                        );
                        const petitionOptions = [
                            getEncounterTemplateById(templateIdA),
                            getEncounterTemplateById(templateIdB),
                        ];

                        set({
                            phase: 'petition',
                            petitionOptions,
                            currentEncounter: null,
                            encounterResolved: false,
                            castsThisEncounter: 0,
                            nextCastFree: false,
                            boonOptions: [],
                            boonPrompt: '',
                            synergyStreak: 0,
                            lastSynergy: '',
                            lastEncounterResolution: null,
                        });
                        return;
                    }

                    const templateId =
                        state.runEncounterQueue[state.encountersCompleted] ??
                        pickEncounterTemplateId(state.worldWeights);
                    const adjustedCarryover = Math.max(
                        0,
                        state.carryOverInstability - state.strengthBonuses.carryoverDecayBonus
                    );
                    const nextEnc = createEncounter(templateId, adjustedCarryover);

                    set({
                        phase: 'encounter',
                        currentEncounter: nextEnc,
                        encounterAbilityIds: buildEncounterAbilityPool(state.abilities),
                        upgradeOptions: [],
                        petitionOptions: [],
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

                selectPetition: (templateId) => {
                    const state = get();
                    if (state.phase !== 'petition') return;

                    const adjustedCarryover = Math.max(
                        0,
                        state.carryOverInstability - state.strengthBonuses.carryoverDecayBonus
                    );
                    const nextEnc = createEncounter(templateId, adjustedCarryover);

                    set({
                        phase: 'encounter',
                        currentEncounter: nextEnc,
                        encounterAbilityIds: buildEncounterAbilityPool(state.abilities),
                        petitionOptions: [],
                        upgradeOptions: [],
                        encounterResolved: false,
                        castsThisEncounter: 0,
                        nextCastFree: false,
                        boonOptions: [],
                        boonPrompt: '',
                        synergyStreak: 0,
                        lastSynergy: '',
                        lastEncounterResolution: null,
                        lastResolution: 'The petition has been heard. Begin the intervention.',
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

                    const currentEncounter = {
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
                    let lastEncounterResolution = null;
                    let encounterResolved = false;
                    let boonOptions: Ability[] = [];
                    let boonPrompt = '';

                    let synergyStreak = preview.synergyLabel ? state.synergyStreak + 1 : 0;
                    let lastSynergy = preview.synergyLabel
                        ? `${preview.synergyLabel} x${synergyStreak}`
                        : '';

                    const synergyBonus = (preview.synergyLabel && state.strengthBonuses.synergyEssenceBonus > 0)
                        ? state.strengthBonuses.synergyEssenceBonus
                        : 0;

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

                        // STRAIN CARRYOVER: Ending encounter at high strain affects next encounter
                        const endingStrainLevel = calculateStrainLevel(strainAfterAction, state.maxStrain);
                        if (endingStrainLevel === 'High') {
                            carryOverInstability += 5;
                        } else if (endingStrainLevel === 'Critical') {
                            carryOverInstability += 10;
                        }
                        nextCastFree = false;
                        encounterResolved = true;
                        synergyStreak = 0;
                        lastSynergy = '';
                    }

                    if (thresholdExceededNow && !encounterEndsNow) {
                        lastResolution +=
                            ' Consequence threshold breached. Reality has lodged a formal objection.';
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
                        preview.essenceDelta + resolutionEssence + synergyBonus
                    );
                    const currentStrain = Math.max(0, strainAfterAction);
                    const strainLevel = calculateStrainLevel(currentStrain, state.maxStrain);

                    const newActionLogEntry = {
                        turn: state.currentEncounter.turn,
                        abilityId: ability.id,
                        abilityName: ability.name,
                        pressureDelta: preview.pressureDelta,
                        consequenceDelta: preview.consequenceDelta,
                        essenceDelta: totalEssenceGain,
                        synergyLabel: preview.synergyLabel,
                    };
                    const updatedActionLog = [...state.actionLog, newActionLogEntry].slice(-5);

                    set({
                        phase,
                        abilityUsage,
                        history: [...state.history, abilityId],
                        actionLog: encounterEndsNow ? [] : updatedActionLog,
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
                    if (upgrade.carryoverDecayBonus) {
                        nextStrengthBonuses.carryoverDecayBonus += upgrade.carryoverDecayBonus;
                    }
                    if (upgrade.synergyEssenceBonus) {
                        nextStrengthBonuses.synergyEssenceBonus += upgrade.synergyEssenceBonus;
                    }
                    if (upgrade.encounterWeightDelta) {
                        const { encounterId, amount } = upgrade.encounterWeightDelta;
                        nextWorldWeights[encounterId] = Math.max(
                            1,
                            (nextWorldWeights[encounterId] ?? 1) + amount
                        );
                    }

                    set({
                        ...buildReturnToMenuState(
                            BASE_MAX_STRAIN + nextStrengthBonuses.maxStrainBonus,
                            `${upgrade.name} acquired. Naturally, this will improve everything.`
                        ),
                        ownedUpgrades: [...state.ownedUpgrades, upgrade.id],
                        strengthBonuses: nextStrengthBonuses,
                        worldWeights: nextWorldWeights,
                        essence: state.essence - upgrade.cost,
                    });
                },

                skipUpgrade: () => {
                    const state = get();
                    if (state.phase !== 'upgrade') return;

                    set(buildReturnToMenuState(
                        BASE_MAX_STRAIN + state.strengthBonuses.maxStrainBonus,
                        'You reserve your Essence for a future correction.'
                    ));
                },

                endRun: () => {
                    const state = get();
                    set(buildReturnToMenuState(
                        BASE_MAX_STRAIN + state.strengthBonuses.maxStrainBonus,
                        'You withdraw before mortals can misunderstand your brilliance.'
                    ));
                },

                resetProgress: () => {
                    set({
                        ...INITIAL_STATE,
                        abilities: [...CORE_ABILITIES],
                        worldWeights: { ...DEFAULT_WORLD_WEIGHTS },
                        strengthBonuses: { ...DEFAULT_STRENGTH_BONUSES },
                    });
                },

                toggleDebugMode: () => {
                    const state = get();
                    set({ debugMode: !state.debugMode });
                },
            }),
            {
                name: 'fallen-god-storage',
                version: 5,
                migrate: (persistedState: unknown, _version: number) => {
                    const s = (persistedState ?? {}) as Partial<Record<string, unknown>>;
                    return {
                        ...INITIAL_STATE,
                        abilities: [...CORE_ABILITIES],
                        essence: typeof s.essence === 'number' ? s.essence : 0,
                        ownedUpgrades: Array.isArray(s.ownedUpgrades)
                            ? (s.ownedUpgrades as string[])
                            : [],
                        strengthBonuses:
                            s.strengthBonuses && typeof s.strengthBonuses === 'object'
                                ? (s.strengthBonuses as StrengthBonuses)
                                : { ...DEFAULT_STRENGTH_BONUSES },
                        worldWeights:
                            s.worldWeights &&
                            typeof s.worldWeights === 'object' &&
                            !Array.isArray(s.worldWeights)
                                ? (s.worldWeights as Record<string, number>)
                                : { ...DEFAULT_WORLD_WEIGHTS },
                        hasSeenTutorial:
                            typeof s.hasSeenTutorial === 'boolean'
                                ? s.hasSeenTutorial
                                : false,
                    };
                },
            }
        )
    )
);
