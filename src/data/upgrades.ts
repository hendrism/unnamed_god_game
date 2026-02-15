import type { Upgrade } from '../types';

export const UPGRADE_COST = 12;

export const STRENGTH_UPGRADES: Upgrade[] = [
    {
        id: 'steady-opening',
        name: 'Steady Opening',
        description: 'First ability each encounter costs 1 less Strain.',
        category: 'strength',
        cost: UPGRADE_COST,
        firstCastStrainReduction: 1,
    },
    {
        id: 'votive-flow',
        name: 'Votive Flow',
        description: 'First ability each encounter grants +1 Essence.',
        category: 'strength',
        cost: UPGRADE_COST,
        firstCastEssenceBonus: 1,
    },
    {
        id: 'tempered-vessel',
        name: 'Tempered Vessel',
        description: 'Max Strain increases by 2.',
        category: 'strength',
        cost: UPGRADE_COST,
        maxStrainBonus: 2,
    },
];

export const WORLD_UPGRADES: Upgrade[] = [
    {
        id: 'storm-calling',
        name: 'Storm Calling',
        description: 'Storm encounters appear more often.',
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
        description: 'Shrine encounters appear more often.',
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
        description: 'Rebellion encounters appear more often.',
        category: 'world',
        cost: UPGRADE_COST,
        encounterWeightDelta: {
            encounterId: 'rebellion',
            amount: 2,
        },
    },
];
