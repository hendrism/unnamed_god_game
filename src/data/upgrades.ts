import type { Upgrade } from '../types';

export const T1_COST = 18;
export const T2_COST = 36;
export const T3_COST = 54;

export const STRENGTH_UPGRADES: Upgrade[] = [
    {
        id: 'steady-opening',
        name: 'Steady Opening',
        description: 'First ability each encounter costs 1 less Strain. (Lets you cast more per encounter)',
        category: 'strength',
        tier: 1,
        cost: T1_COST,
        firstCastStrainReduction: 1,
    },
    {
        id: 'votive-flow',
        name: 'Votive Flow',
        description: 'First ability each encounter grants +1 Essence. (More upgrades over time)',
        category: 'strength',
        tier: 1,
        cost: T1_COST,
        firstCastEssenceBonus: 1,
    },
    {
        id: 'tempered-vessel',
        name: 'Tempered Vessel',
        description: 'Max Strain increases by 3. (Cast more abilities before running out)',
        category: 'strength',
        tier: 1,
        cost: T1_COST,
        maxStrainBonus: 3,
    },
    {
        id: 'lingering-authority',
        name: 'Lingering Authority',
        description: 'Your presence echoes forward. Reduces carryover instability by 4 at the start of each new encounter.',
        category: 'strength',
        tier: 1,
        cost: T1_COST,
        carryoverDecayBonus: 4,
    },
    {
        id: 'resonant-chains',
        name: 'Resonant Chains',
        description: 'Synergies accumulate power. Each triggered synergy grants +1 Essence.',
        category: 'strength',
        tier: 1,
        cost: T1_COST,
        synergyEssenceBonus: 1,
    },
];

export const WORLD_UPGRADES: Upgrade[] = [
    {
        id: 'storm-calling',
        name: 'Storm Calling',
        description: 'Storm encounters appear more often. Hazard: +1 Strain per cast — every action costs more. Pair with high max-Strain upgrades.',
        category: 'world',
        tier: 1,
        cost: T1_COST,
        encounterWeightDelta: {
            encounterId: 'storm',
            amount: 2,
        },
    },
    {
        id: 'shrine-claim',
        name: 'Shrine Claim',
        description: 'Shrine encounters appear more often. Easiest encounter type — low pressure, clean consequence threshold, 2 ess/turn. Good for recovering between difficult crises.',
        category: 'world',
        tier: 1,
        cost: T1_COST,
        encounterWeightDelta: {
            encounterId: 'shrine',
            amount: 2,
        },
    },
    {
        id: 'zeal-incitement',
        name: 'Zeal Incitement',
        description: 'Rebellion encounters appear more often. Pressure regenerates at +6/cast — it fights back. High risk, 2 ess/turn. Rewards casting efficiently.',
        category: 'world',
        tier: 1,
        cost: T1_COST,
        encounterWeightDelta: {
            encounterId: 'rebellion',
            amount: 2,
        },
    },
    {
        id: 'drought-dominion',
        name: 'Drought Dominion',
        description: 'Sanctioned Drought encounters appear more often. Pressure builds slowly; moderate consequence risk. Reliable but low-yield at 1 ess/turn.',
        category: 'world',
        tier: 1,
        cost: T1_COST,
        encounterWeightDelta: {
            encounterId: 'drought',
            amount: 2,
        },
    },
    {
        id: 'miracle-watch',
        name: 'Miracle Watch',
        description: 'Surplus of Miracles encounters appear more often. Tight consequence threshold (35) but low starting pressure. 2 ess/turn if you stay clean. Punishes sloppy casts.',
        category: 'world',
        tier: 1,
        cost: T1_COST,
        encounterWeightDelta: {
            encounterId: 'miracles',
            amount: 2,
        },
    },
    {
        id: 'resentment-harvest',
        name: 'Resentment Harvest',
        description: 'Unanswered Prayers encounters appear more often. Consequence trap — starts at 15 with a threshold of 40. 2 ess/turn but zero margin for reckless casts.',
        category: 'world',
        tier: 1,
        cost: T1_COST,
        encounterWeightDelta: {
            encounterId: 'prayers',
            amount: 2,
        },
    },
    {
        id: 'philosopher-silence',
        name: "Philosopher's Silence",
        description: 'Reasonable Philosopher encounters appear more often. Pressure regenerates at +3/cast — ideas spread. 2 ess/turn. Moderate difficulty.',
        category: 'world',
        tier: 1,
        cost: T1_COST,
        encounterWeightDelta: {
            encounterId: 'heresy',
            amount: 2,
        },
    },
    {
        id: 'blight-dominion',
        name: 'Blight Dominion',
        description: 'Harvest Blight encounters appear more often. Highest base pressure (60) but generous threshold (70). High consequence floor, high reward. 2 ess/turn.',
        category: 'world',
        tier: 1,
        cost: T1_COST,
        encounterWeightDelta: {
            encounterId: 'blight',
            amount: 2,
        },
    },
    {
        id: 'mountain-accord',
        name: 'Mountain Accord',
        description: 'Geological Opinion encounters appear more often. Hardest encounter — pressure regenerates at +12/cast. Very high numbers. 2 ess/turn if you can handle it.',
        category: 'world',
        tier: 1,
        cost: T1_COST,
        encounterWeightDelta: {
            encounterId: 'volcano',
            amount: 2,
        },
    },
];

export const T2_UPGRADES: Upgrade[] = [
    // Strength T2
    {
        id: 'resonant-mastery',
        name: 'Resonant Mastery',
        description: 'Synergies are increasingly persuasive. Each triggered synergy grants +2 additional Essence. (Stacks with Resonant Chains.)',
        category: 'strength',
        tier: 2,
        cost: T2_COST,
        synergyEssenceBonus: 2,
    },
    {
        id: 'expanded-vessel',
        name: 'Expanded Vessel',
        description: 'Max Strain increases by 6. Notably more room for error. (Stacks with Tempered Vessel.)',
        category: 'strength',
        tier: 2,
        cost: T2_COST,
        maxStrainBonus: 6,
    },
    {
        id: 'flawless-record',
        name: 'Flawless Record',
        description: 'When an encounter ends with Pressure fully eliminated, gain +3 Essence. The cosmos rewards thoroughness.',
        category: 'strength',
        tier: 2,
        cost: T2_COST,
        perfectClearEssenceBonus: 3,
    },
    {
        id: 'covenant-of-pressure',
        name: 'Covenant of Pressure',
        description: 'Each encounter begins with 8 more pressure. First ability each encounter grants +3 Essence. Front-load the benefit, deal with the consequences.',
        category: 'strength',
        tier: 2,
        cost: T2_COST,
        pressureStartReduction: -8,
        firstCastEssenceBonus: 3,
    },
    // World T2
    {
        id: 'generous-threshold',
        name: 'Generous Threshold',
        description: 'All encounter Consequence thresholds increase by 15. More margin before things become officially problematic.',
        category: 'world',
        tier: 2,
        cost: T2_COST,
        conseqThresholdBonus: 15,
    },
    {
        id: 'extended-jurisdiction',
        name: 'Extended Jurisdiction',
        description: 'Each run lasts one additional encounter (4–6 instead of 3–5). More crises, more Essence.',
        category: 'world',
        tier: 2,
        cost: T2_COST,
        runLengthBonus: 1,
    },
];

export const T3_UPGRADES: Upgrade[] = [
    // Strength T3
    {
        id: 'sovereign-composure',
        name: 'Sovereign Composure',
        description: 'Begin every encounter with half your accumulated Strain. Whatever happened before is still somewhat relevant.',
        category: 'strength',
        tier: 3,
        cost: T3_COST,
        resetStrainOnEncounterStart: true,
    },
    {
        id: 'open-channel',
        name: 'Open Channel',
        description: 'First ability each encounter costs 3 less Strain and grants +2 Essence. An exceptionally good opening.',
        category: 'strength',
        tier: 3,
        cost: T3_COST,
        firstCastStrainReduction: 3,
        firstCastEssenceBonus: 2,
    },
    // World T3
    {
        id: 'eternal-patience',
        name: 'Eternal Patience',
        description: 'All encounters have +2 turns. The divine timeline is flexible when it benefits you.',
        category: 'world',
        tier: 3,
        cost: T3_COST,
        turnLimitBonus: 2,
    },
    {
        id: 'favorable-providence',
        name: 'Favorable Providence',
        description: 'All encounters begin with 10 less Pressure. Reality accommodates your schedule.',
        category: 'world',
        tier: 3,
        cost: T3_COST,
        pressureStartReduction: 10,
    },
];
