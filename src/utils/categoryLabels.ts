import type { AbilityCategory } from '../types';

const CATEGORY_LABELS: Record<AbilityCategory, string> = {
    smite: 'Force',
    manifest: 'Presence',
    twist: 'Fate',
};

export const getAbilityCategoryLabel = (category: AbilityCategory): string =>
    CATEGORY_LABELS[category];

