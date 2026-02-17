import type { Ability, AbilityPreview } from '../types';
import { useGameStore } from '../store/gameStore';

interface ActionPreviewProps {
    ability: Ability;
    preview: AbilityPreview;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ActionPreview = ({ ability, preview, onConfirm, onCancel }: ActionPreviewProps) => {
    const debugMode = useGameStore((state) => state.debugMode);
    const currentEncounter = useGameStore((state) => state.currentEncounter);
    const currentStrain = useGameStore((state) => state.currentStrain);

    // Calculate projected values
    const projectedPressure = currentEncounter ? Math.max(0, currentEncounter.pressureRemaining - preview.pressureDelta) : 0;

    return (
        <div className="w-full max-w-md mx-auto bg-gray-900 border-2 border-mythic-gold rounded-lg p-6 shadow-2xl animate-fade-in relative">
            <button
                onClick={onCancel}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 text-xl"
            >
                ✕
            </button>

            <div className="text-center mb-6">
                <h3 className="text-2xl font-display text-mythic-gold mb-1">
                    {debugMode
                        ? `Ability: ${preview.pressureDelta} dmg, ${preview.consequenceDelta >= 0 ? '+' : ''}${preview.consequenceDelta} penalty`
                        : ability.name
                    }
                </h3>
                {!debugMode && <p className="text-sm text-gray-400 italic">"{ability.flavorText}"</p>}
            </div>

            {/* Synergy Banner - More prominent */}
            {preview.synergyLabel && (
                <div className="mb-4 p-3 bg-gradient-to-r from-amber-900/40 to-amber-800/40 border-2 border-amber-500 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-amber-400 text-xl">⚡</span>
                        <p className="text-sm font-bold text-amber-300 uppercase tracking-wide">{preview.synergyLabel}</p>
                        <span className="text-amber-400 text-xl">⚡</span>
                    </div>
                    {preview.notes.filter(note => note.startsWith('Synergy:')).map((note, idx) => (
                        <p key={idx} className="text-sm text-amber-200 text-center">
                            {note.replace('Synergy: ', '')}
                        </p>
                    ))}
                </div>
            )}

            <div className="space-y-2 mb-6">
                {/* 1. PRESSURE (Goal 1) - Clearer wording */}
                <div className="bg-black/40 p-3 rounded border border-red-900/30">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-red-400 uppercase tracking-wider font-semibold">
                            {debugMode ? 'Damage' : '🎯 Pressure (reduce to 0)'}
                        </span>
                        <span className="text-green-400 font-bold text-lg">↓ {preview.pressureDelta}</span>
                    </div>
                    {currentEncounter && (
                        <div className="text-xs text-gray-500">
                            {currentEncounter.pressureRemaining} → <span className="text-white font-semibold">{projectedPressure}</span>
                        </div>
                    )}
                </div>

                {/* 2. CONSEQUENCE (Goal 2) - Clearer wording */}
                {preview.consequenceDelta !== 0 && (
                    <div className={`bg-black/40 p-3 rounded border ${preview.willExceedThreshold ? 'border-strain-red animate-pulse' : 'border-purple-900/30'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs uppercase tracking-wider font-semibold ${preview.consequenceDelta > 0 ? 'text-void-purple' : 'text-green-400'}`}>
                                {debugMode ? 'Penalty' : '🎯 Consequence (keep low)'}
                            </span>
                            <span className={`font-bold text-lg ${preview.willExceedThreshold ? 'text-strain-red' : preview.consequenceDelta > 0 ? 'text-void-purple' : 'text-green-400'}`}>
                                {preview.consequenceDelta > 0 ? '↑' : '↓'} {Math.abs(preview.consequenceDelta)}
                            </span>
                        </div>
                        {currentEncounter && (
                            <div className="text-xs text-gray-500">
                                {currentEncounter.consequenceMeter} → <span className={`font-semibold ${preview.willExceedThreshold ? 'text-strain-red' : 'text-white'}`}>{preview.projectedConsequenceMeter}</span>
                                {preview.willExceedThreshold && <span className="text-strain-red ml-2">⚠ BREACHED</span>}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. STRAIN (Cost) - Clearer wording */}
                <div className="bg-black/40 p-3 rounded border border-blue-900/30">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-blue-400 uppercase tracking-wider font-semibold">
                            {debugMode ? 'Stamina Cost' : '⚡ Strain Cost'}
                        </span>
                        <span className="text-orange-400 font-bold text-lg">↑ {preview.strainCost}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {currentStrain} → <span className={`font-semibold ${
                            preview.projectedStrainLevel === 'Critical' ? 'text-strain-red' :
                            preview.projectedStrainLevel === 'High' ? 'text-orange-500' : 'text-white'
                        }`}>{preview.projectedStrain}</span>
                        <span className={`ml-2 uppercase text-[10px] ${
                            preview.projectedStrainLevel === 'Critical' ? 'text-strain-red' :
                            preview.projectedStrainLevel === 'High' ? 'text-orange-500' : 'text-gray-500'
                        }`}>({preview.projectedStrainLevel})</span>
                    </div>
                </div>

                {/* 4. ESSENCE (Reward) - Clearer wording */}
                <div className="bg-black/40 p-3 rounded border border-yellow-900/30">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-mythic-gold uppercase tracking-wider font-semibold">
                            {debugMode ? 'Currency Gain' : '✨ Essence Gain'}
                        </span>
                        <span className="text-mythic-gold font-bold text-lg">↑ {preview.essenceDelta}</span>
                    </div>
                </div>
            </div>

            {/* Other Modifiers - Clearer display */}
            {(() => {
                const otherNotes = preview.notes.filter(note => !note.startsWith('Synergy:'));
                if (otherNotes.length === 0) return null;

                return (
                    <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                        <p className="text-xs text-blue-300 uppercase tracking-wide mb-2 font-semibold">Active Modifiers</p>
                        <div className="space-y-1.5">
                            {otherNotes.map((note, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                                    <p className="text-sm text-blue-100 leading-snug">{note}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}

            <button
                onClick={onConfirm}
                className="w-full py-4 bg-mythic-gold text-black font-display font-bold text-xl rounded hover:bg-yellow-400 transition-all shadow-lg hover:shadow-mythic-gold/20"
            >
                {debugMode ? 'USE ABILITY' : 'CONFIRM INTERVENTION'}
            </button>
        </div>
    );
};
