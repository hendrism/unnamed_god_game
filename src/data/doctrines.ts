import type { Doctrine } from '../types';

export const DOCTRINES: Doctrine[] = [
    {
        id: 'dominion',
        name: 'Doctrine of Dominion',
        description: 'Order is restored by force applied with confidence.',
        startingAbilityId: 'smite',
        passiveDescription: 'First Smite each encounter deals +1 Pressure.',
    },
    {
        id: 'revelation',
        name: 'Doctrine of Revelation',
        description: 'Presence is power. Let them witness certainty.',
        startingAbilityId: 'manifest',
        passiveDescription: 'First Manifest Presence each encounter grants +1 Essence.',
    },
];
