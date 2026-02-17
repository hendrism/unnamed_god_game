import type { Upgrade } from '../types';

export const UPGRADE_COST = 18;

export const STRENGTH_UPGRADES: Upgrade[] = [
    {
        id: 'steady-opening',
        name: 'Steady Opening',
        description: 'First ability each encounter costs 1 less Strain. (Lets you cast more per encounter)',
        category: 'strength',
        cost: UPGRADE_COST,
        firstCastStrainReduction: 1,
    },
    {
        id: 'votive-flow',
        name: 'Votive Flow',
        description: 'First ability each encounter grants +1 Essence. (More upgrades over time)',
        category: 'strength',
        cost: UPGRADE_COST,
        firstCastEssenceBonus: 1,
    },
    {
        id: 'tempered-vessel',
        name: 'Tempered Vessel',
        description: 'Max Strain increases by 3. (Cast more abilities before running out)',
        category: 'strength',
        cost: UPGRADE_COST,
        maxStrainBonus: 3,
    },
    {
        id: 'lingering-authority',
        name: 'Lingering Authority',
        description: 'Your presence echoes forward. Reduces carryover instability by 4 at the start of each new encounter.',
        category: 'strength',
        cost: UPGRADE_COST,
        carryoverDecayBonus: 4,
    },
    {
        id: 'resonant-chains',
        name: 'Resonant Chains',
        description: 'Synergies accumulate power. Each triggered synergy grants +1 Essence.',
        category: 'strength',
        cost: UPGRADE_COST,
        synergyEssenceBonus: 1,
    },
];

export const WORLD_UPGRADES: Upgrade[] = [
    {
        id: 'storm-calling',
        name: 'Storm Calling',
        description: 'Storm encounters appear more often. (Moderate challenge, 1 essence/turn)',
        category: 'world',
        cost: UPGRADE_COST,
        encounterWeightDelta: {
            encounterId: 'storm',
            amount: 2,
        },
    },
    {
        id: 'shrine-claim',
        name: 'Shrine Claim',
        description: 'Shrine encounters appear more often. (Easiest encounters, 2 essence/turn)',
        category: 'world',
        cost: UPGRADE_COST,
        encounterWeightDelta: {
            encounterId: 'shrine',
            amount: 2,
        },
    },
    {
        id: 'zeal-incitement',
        name: 'Zeal Incitement',
        description: 'Rebellion encounters appear more often. (Harder + risky, but 2 essence/turn)',
        category: 'world',
        cost: UPGRADE_COST,
        encounterWeightDelta: {
            encounterId: 'rebellion',
            amount: 2,
        },
    },
    {
        id: 'drought-dominion',
        name: 'Drought Dominion',
        description: 'Sanctioned Drought encounters appear more often. (Lower essence but builds consequence slowly)',
        category: 'world',
        cost: UPGRADE_COST,
        encounterWeightDelta: {
            encounterId: 'drought',
            amount: 2,
        },
    },
    {
        id: 'miracle-watch',
        name: 'Miracle Watch',
        description: 'Surplus of Miracles encounters appear more often. (Fast rewards, tight consequence threshold)',
        category: 'world',
        cost: UPGRADE_COST,
        encounterWeightDelta: {
            encounterId: 'miracles',
            amount: 2,
        },
    },
    {
        id: 'philosopher-silence',
        name: "Philosopher's Silence",
        description: 'Reasonable Philosopher encounters appear more often. (Lower reward, manageable if handled cleanly)',
        category: 'world',
        cost: UPGRADE_COST,
        encounterWeightDelta: {
            encounterId: 'heresy',
            amount: 2,
        },
    },
    {
        id: 'mountain-accord',
        name: 'Mountain Accord',
        description: 'Geological Opinion encounters appear more often. (Hardest encounters, 2 essence/turn)',
        category: 'world',
        cost: UPGRADE_COST,
        encounterWeightDelta: {
            encounterId: 'volcano',
            amount: 2,
        },
    },
];
