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
];
