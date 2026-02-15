import type { Ability } from '../types';

export const CORE_ABILITIES: Ability[] = [
    {
        id: 'smite',
        name: 'Smite',
        description: 'Strike with divine force. If used after Manifest Presence, gain +1 Essence.',
        flavorText: 'An elegant solution to a complex problem.',
        baseStrainCost: 2,
        effectType: 'damage',
        synergyKeywords: ['force']
    },
    {
        id: 'manifest',
        name: 'Manifest Presence',
        description: 'Demand reverence. If used after Twist Fate, reduce current Strain by 2.',
        flavorText: 'They should know who is helping them.',
        baseStrainCost: 3,
        effectType: 'utility',
        synergyKeywords: ['presence']
    },
    {
        id: 'twist',
        name: 'Twist Fate',
        description: 'Alter the outcome. If used after Smite, the next ability costs 0 Strain.',
        flavorText: 'It was never meant to be this way. Let me fix it.',
        baseStrainCost: 4,
        effectType: 'utility',
        synergyKeywords: ['chaos']
    }
];
