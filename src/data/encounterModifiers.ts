import type { EncounterModifier } from '../types';

export const ENCOUNTER_MODIFIERS: EncounterModifier[] = [
    {
        id: 'leyline-fracture',
        name: 'Leyline Fracture',
        description: 'The local leylines are split open. More power fits through than reality requested.',
        effects: {
            pressureDelta: 1,
            consequenceDelta: 1,
        },
    },
    {
        id: 'sacred-site',
        name: 'Sacred Site',
        description: 'The shrine still remembers your old name. Reality is merely cooperative today.',
        effects: {
            strainCostDelta: -1,
        },
    },
    {
        id: 'fragile-reality',
        name: 'Fragile Reality',
        description: 'This district is held together by prayer and wet timber. Your certainty may void both warranties.',
        effects: {
            consequenceDelta: 1,
        },
    },
    {
        id: 'devout-crowd',
        name: 'Devout Crowd',
        description: 'They arrived pre-kneeling. Manifest commands carry twice the weight here.',
        effects: {
            abilityEffects: [
                {
                    abilityId: 'manifest',
                    pressureDelta: 2,
                    essenceDelta: 2,
                },
            ],
        },
    },
    {
        id: 'stormsurge',
        name: 'Stormsurge',
        description: 'Wind and divinity argue over jurisdiction. Loudly.',
        effects: {
            abilityEffects: [
                {
                    abilityId: 'smite',
                    strainCostDelta: 1,
                    pressureDelta: 1,
                },
                {
                    abilityId: 'twist',
                    strainCostDelta: 1,
                    pressureDelta: 1,
                },
            ],
        },
    },
    {
        id: 'ritual-precision',
        name: 'Ritual Precision',
        description: 'Every motion must be exact. Precision is expensive, but paperwork is cleaner.',
        effects: {
            strainCostDelta: 1,
            consequenceDelta: -1,
        },
    },
    {
        id: 'penitent-procession',
        name: 'Penitent Procession',
        description: 'Forgiveness flows like water here. Absolve cleanses consequence completely.',
        effects: {
            abilityEffects: [
                {
                    abilityId: 'absolve',
                    consequenceDelta: -4,
                    essenceDelta: 2,
                },
            ],
        },
    },
    {
        id: 'tribunal-square',
        name: 'Tribunal Square',
        description: 'Judgment delivered here resonates across districts. Condemn becomes devastating.',
        effects: {
            abilityEffects: [
                {
                    abilityId: 'condemn',
                    pressureDelta: 4,
                    consequenceDelta: -1,
                },
            ],
        },
    },
    {
        id: 'hush-of-ash',
        name: 'Hush of Ash',
        description: 'The air is thick and quiet. Even rebellion whispers.',
        effects: {
            abilityEffects: [
                {
                    abilityId: 'stifle',
                    strainCostDelta: -1,
                    consequenceDelta: -1,
                },
            ],
        },
    },
    {
        id: 'echoing-vault',
        name: 'Echoing Vault',
        description: 'Decrees reverberate through stone and bureaucracy. Results multiply. So do side effects.',
        effects: {
            essenceDelta: 1,
            consequenceDelta: 1,
        },
    },
    {
        id: 'iron-doubt',
        name: 'Iron Doubt',
        description: 'Skepticism has been organized into a municipal policy.',
        effects: {
            abilityEffects: [
                {
                    abilityId: 'manifest',
                    strainCostDelta: 1,
                    pressureDelta: -1,
                },
                {
                    abilityId: 'witness',
                    essenceDelta: -1,
                },
            ],
        },
    },
    {
        id: 'cooperative-cosmos',
        name: 'Cooperative Cosmos',
        description: 'The stars filed your request in advance. You assume this is normal.',
        effects: {
            strainCostDelta: -1,
            pressureDelta: 1,
        },
    },
    {
        id: 'bureaucratic-ledger',
        name: 'Bureaucratic Ledger',
        description: 'All miracles must be audited. Compliance is mandatory and strangely inspiring.',
        effects: {
            pressureDelta: 1,
            essenceDelta: -1,
        },
    },
    {
        id: 'midnight-vigil',
        name: 'Midnight Vigil',
        description: 'Observation becomes power itself. Witness generates essence; force becomes amplified.',
        effects: {
            abilityEffects: [
                {
                    abilityId: 'witness',
                    strainCostDelta: -1,
                    essenceDelta: 3,
                },
                {
                    abilityId: 'smite',
                    pressureDelta: 3,
                },
            ],
        },
    },
    {
        id: 'broken-idols',
        name: 'Broken Idols',
        description: 'Your statues are in pieces. The message is mixed, but volume remains high.',
        effects: {
            abilityEffects: [
                {
                    abilityId: 'condemn',
                    pressureDelta: 1,
                },
                {
                    abilityId: 'manifest',
                    strainCostDelta: 1,
                },
            ],
        },
    },
    {
        id: 'festival-of-vows',
        name: 'Festival of Vows',
        description: 'Everyone promised something dramatic today. You approve of this energy.',
        effects: {
            essenceDelta: 1,
            consequenceDelta: 1,
            abilityEffects: [
                {
                    abilityId: 'manifest',
                    essenceDelta: 1,
                },
            ],
        },
    },
    {
        id: 'ash-choked-air',
        name: 'Ash-Choked Air',
        description: 'The horizon is gray and irritable. Fate work is messy in this weather.',
        effects: {
            abilityEffects: [
                {
                    abilityId: 'twist',
                    consequenceDelta: 1,
                },
                {
                    abilityId: 'stifle',
                    pressureDelta: 1,
                },
            ],
        },
    },
    {
        id: 'absolution-window',
        name: 'Absolution Window',
        description: 'For one blessed hour, forgiveness is fashionable and enforcement is optional.',
        effects: {
            abilityEffects: [
                {
                    abilityId: 'absolve',
                    strainCostDelta: -1,
                    pressureDelta: 1,
                },
                {
                    abilityId: 'condemn',
                    consequenceDelta: -1,
                },
            ],
        },
    },
];
