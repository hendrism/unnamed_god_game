import type { Doctrine } from '../types';

export const DOCTRINES: Doctrine[] = [
    {
        id: 'dominion',
        name: 'Doctrine of Dominion',
        description: 'Order is restored by force applied with confidence.',
        startingAbilityId: 'smite',
        passiveDescription: 'Pressure abilities cost 1 less Strain.',
    },
    {
        id: 'revelation',
        name: 'Doctrine of Revelation',
        description: 'Presence is power. Let them witness certainty.',
        startingAbilityId: 'manifest',
        passiveDescription: 'Essence-focused abilities gain +1 Pressure and +1 Essence.',
    },
];
