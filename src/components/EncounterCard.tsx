import type { ActiveEncounter } from '../types';

function formatModifierEffects(effects: ActiveEncounter['modifierEffects']): string {
    const lines: string[] = [];

    const global: string[] = [];
    if (effects.strainCostDelta) global.push(`${effects.strainCostDelta > 0 ? '+' : ''}${effects.strainCostDelta} strain`);
    if (effects.pressureDelta) global.push(`${effects.pressureDelta > 0 ? '+' : ''}${effects.pressureDelta} press`);
    if (effects.consequenceDelta) global.push(`${effects.consequenceDelta > 0 ? '+' : ''}${effects.consequenceDelta} conseq`);
    if (effects.essenceDelta) global.push(`${effects.essenceDelta > 0 ? '+' : ''}${effects.essenceDelta} ess`);
    if (global.length) lines.push(global.join(' · '));

    for (const ae of effects.abilityEffects ?? []) {
        const fx: string[] = [];
        if (ae.strainCostDelta) fx.push(`${ae.strainCostDelta > 0 ? '+' : ''}${ae.strainCostDelta} strain`);
        if (ae.pressureDelta) fx.push(`${ae.pressureDelta > 0 ? '+' : ''}${ae.pressureDelta} press`);
        if (ae.consequenceDelta) fx.push(`${ae.consequenceDelta > 0 ? '+' : ''}${ae.consequenceDelta} conseq`);
        if (ae.essenceDelta) fx.push(`${ae.essenceDelta > 0 ? '+' : ''}${ae.essenceDelta} ess`);
        lines.push(`${ae.abilityId}: ${fx.join(' ')}`);
    }

    return lines.join('\n');
}

export const EncounterCard = ({ encounter, resolved }: { encounter: ActiveEncounter, resolved?: boolean }) => {
    const pressurePercent = Math.min(100, Math.max(0, (encounter.pressureRemaining / encounter.startingPressure) * 100));

    const consequenceMax = Math.max(encounter.consequenceThreshold * 1.25, encounter.consequenceMeter, 10);
    const consequencePercent = Math.min(100, Math.max(0, (encounter.consequenceMeter / consequenceMax) * 100));
    const thresholdPercent = (encounter.consequenceThreshold / consequenceMax) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto bg-gray-900 border-2 border-gray-700 rounded-lg p-4 shadow-2xl relative overflow-hidden">
            {resolved && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <h2 className="text-4xl font-display text-mythic-gold tracking-[0.2em] animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                        SEVERED
                    </h2>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start mb-3 border-b border-gray-800 pb-2">
                <div className="flex-1 pr-4">
                    <h2 className="text-lg font-display text-white leading-tight">{encounter.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{encounter.description}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] bg-void-purple/20 text-void-purple px-2 py-0.5 rounded border border-void-purple/30 uppercase tracking-wider mb-1 font-bold">
                        {encounter.modifierName}
                    </span>
                    <span className="text-[10px] text-gray-300 max-w-[150px] text-right leading-snug whitespace-pre-line mb-0.5">
                        {formatModifierEffects(encounter.modifierEffects)}
                    </span>
                    <span className="text-[10px] text-gray-600 max-w-[150px] text-right leading-tight italic">
                        {encounter.modifierDescription}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* Pressure */}
                <div className="bg-black/30 p-2 rounded border border-gray-800/50">
                    <div className="flex justify-between items-end mb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Pressure</span>
                            {encounter.pressureRegen > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-950/50 text-orange-400 border border-orange-800/40 font-bold">
                                    +{encounter.pressureRegen}/cast
                                </span>
                            )}
                        </div>
                        <span className="text-sm font-mono text-white leading-none">
                            {encounter.pressureRemaining} <span className="text-gray-600 text-[10px]">/ {encounter.startingPressure}</span>
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-gradient-to-r from-red-900 to-red-600 transition-all duration-500 ease-out"
                            style={{ width: `${pressurePercent}%` }}
                        />
                    </div>
                </div>

                {/* Consequence */}
                <div className="bg-black/30 p-2 rounded border border-gray-800/50 relative">
                    <div className="flex justify-between items-end mb-1">
                        <span className={`text-xs uppercase tracking-wider font-semibold ${encounter.thresholdExceeded ? 'text-strain-red' : 'text-gray-400'}`}>
                            Consequence
                        </span>
                        <span className={`text-sm font-mono leading-none ${encounter.thresholdExceeded ? 'text-strain-red animate-pulse' : 'text-white'}`}>
                            {encounter.consequenceMeter}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden relative mb-1">
                        <div
                            className={`h-full transition-all duration-500 ease-out ${encounter.thresholdExceeded ? 'bg-strain-red' : 'bg-void-purple'}`}
                            style={{ width: `${consequencePercent}%` }}
                        />
                        {!encounter.thresholdExceeded && (
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-yellow-500/70 z-10 shadow-[0_0_4px_rgba(234,179,8,0.5)]"
                                style={{ left: `${thresholdPercent}%` }}
                            />
                        )}
                    </div>
                    <div className="text-right text-[10px] mt-0.5">
                        <span className={encounter.thresholdExceeded ? 'text-strain-red font-bold' : 'text-yellow-600/80'}>
                            Threshold: {encounter.consequenceThreshold}
                        </span>
                    </div>
                </div>

                {/* Turn & Reward */}
                <div className="col-span-1 md:col-span-2 flex items-center bg-black/30 p-2 rounded border border-gray-800/50">
                    <div className="flex items-center space-x-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Turns</span>
                            <span className="text-sm font-mono text-white leading-none">
                                {encounter.turn} <span className="text-gray-600">/ {encounter.turnLimit}</span>
                            </span>
                        </div>
                        <div className="h-6 w-px bg-gray-800" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-mythic-gold uppercase tracking-wider font-bold">Reward</span>
                            <span className="text-sm text-white leading-none">
                                +{encounter.rewardPerTurn} <span className="text-[10px] text-gray-500">Essence/turn</span>
                            </span>
                        </div>
                        {encounter.strainPerTurn > 0 && (
                            <>
                                <div className="h-6 w-px bg-gray-800" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-red-400 uppercase tracking-wider font-bold">Hazard</span>
                                    <span className="text-sm font-mono text-red-300 leading-none">
                                        +{encounter.strainPerTurn} <span className="text-[10px] text-red-500">Strain/cast</span>
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
