// Plain language translations for debug mode
export const debugLabels = {
    // Resources
    essence: 'Currency',
    strain: 'Stamina',
    pressure: 'HP to Remove',
    consequence: 'Penalty',

    // Ability stats
    strainCost: 'Cost',
    pressureDelta: 'Damage',
    essenceDelta: 'Currency Gain',
    consequenceDelta: 'Penalty',

    // Game state
    carryOverInstability: 'Next Fight Difficulty',
    threshold: 'Penalty Limit',
    thresholdExceeded: 'Over Limit',

    // Outcomes
    perfect: 'Perfect',
    partial: 'Good',
    minimal: 'Okay',
    catastrophic: 'Bad',

    // Actions
    cast: 'Use',
    intervention: 'Action',
    encounter: 'Fight',
    doctrine: 'Build',
    upgrade: 'Permanent Bonus',
    boon: 'New Ability',
};

export function getDebugLabel(thematicTerm: string, debugMode: boolean): string {
    if (!debugMode) return thematicTerm;

    const lower = thematicTerm.toLowerCase();
    for (const [key, value] of Object.entries(debugLabels)) {
        if (lower.includes(key)) {
            return thematicTerm.replace(new RegExp(key, 'gi'), value);
        }
    }

    return thematicTerm;
}

// For ability names - just use generic labels in debug mode
export function getDebugAbilityName(ability: { id: string; basePressure: number; baseConsequence: number; baseEssence: number }, debugMode: boolean): string {
    if (!debugMode) return ability.id;

    // Classify by what the ability does
    const damage = ability.basePressure;
    const penalty = ability.baseConsequence;
    const currency = ability.baseEssence;

    if (damage > 0 && penalty === 0) return `Attack (${damage} dmg)`;
    if (damage > 0 && penalty > 0) return `Risky Attack (${damage} dmg, +${penalty} penalty)`;
    if (damage === 0 && currency > 0) return `Generate Currency (+${currency})`;
    if (penalty < 0) return `Reduce Penalty (${penalty})`;

    return `Ability #${ability.id}`;
}
