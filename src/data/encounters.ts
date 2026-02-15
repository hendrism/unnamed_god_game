import type { Encounter } from '../types';

export const ENC_TYPES: Encounter[] = [
    {
        id: 'storm',
        type: 'combat',
        title: 'A Raging Storm',
        description: 'A tempest threatens the coastal villages. Probably not your fault.',
        pressure: 'Local faith decreases by 10%.',
        reward: 'Gain +2 Essence.',
        consequence: 'The region will be flooded for 3 turns.',
        difficulty: 1
    },
    {
        id: 'rebellion',
        type: 'social',
        title: 'Heretical Whispers',
        description: 'They say you are not listening. They are wrong. You are just busy.',
        pressure: 'Lose 1 Influence.',
        reward: 'Gain +3 Essence.',
        consequence: 'You must Smite the next encounter.',
        difficulty: 2
    },
    {
        id: 'shrine',
        type: 'puzzle',
        title: 'Crumbling Shrine',
        description: 'Your glorious monument is falling apart. Budget cuts.',
        pressure: 'Max Strain reduced by 5.',
        reward: 'Gain +5 Essence.',
        consequence: 'Next ability costs double Strain.',
        difficulty: 1
    }
];
