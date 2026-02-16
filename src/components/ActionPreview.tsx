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
                {preview.synergyLabel && (
                    <div className="mt-2 inline-block px-3 py-1 bg-amber-900/30 border border-amber-600/50 rounded">
                        <p className="text-xs text-amber-400">⚡ {preview.synergyLabel}</p>
                    </div>
                )}
            </div>

            <div className="space-y-2 mb-6">
                {/* 1. PRESSURE (Goal 1) */}
                <div className="bg-black/40 p-3 rounded border border-red-900/30">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-red-400 uppercase tracking-wider font-semibold">
                            {debugMode ? 'Damage' : '🎯 Pressure'}
                        </span>
                        <span className="text-red-400 font-bold text-lg">-{preview.pressureDelta}</span>
                    </div>
                    {currentEncounter && (
                        <div className="text-xs text-gray-500">
                            {currentEncounter.pressureRemaining} → <span className="text-white font-semibold">{projectedPressure}</span>
                        </div>
                    )}
                </div>

                {/* 2. CONSEQUENCE (Goal 2) */}
                {preview.consequenceDelta !== 0 && (
                    <div className={`bg-black/40 p-3 rounded border ${preview.willExceedThreshold ? 'border-strain-red animate-pulse' : 'border-purple-900/30'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-void-purple uppercase tracking-wider font-semibold">
                                {debugMode ? 'Penalty' : '🎯 Consequence'}
                            </span>
                            <span className={`font-bold text-lg ${preview.willExceedThreshold ? 'text-strain-red' : 'text-void-purple'}`}>
                                {preview.consequenceDelta > 0 ? '+' : ''}{preview.consequenceDelta}
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

                {/* 3. STRAIN (Cost) */}
                <div className="bg-black/40 p-3 rounded border border-blue-900/30">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-blue-400 uppercase tracking-wider font-semibold">
                            {debugMode ? 'Stamina Cost' : 'Strain Cost'}
                        </span>
                        <span className="text-blue-400 font-bold text-lg">+{preview.strainCost}</span>
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

                {/* 4. ESSENCE (Reward) */}
                <div className="bg-black/40 p-3 rounded border border-yellow-900/30">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-mythic-gold uppercase tracking-wider font-semibold">
                            {debugMode ? 'Currency Gain' : 'Essence Gain'}
                        </span>
                        <span className="text-mythic-gold font-bold text-lg">+{preview.essenceDelta}</span>
                    </div>
                </div>
            </div>

            {/* Simplified Notes */}
            {preview.notes.length > 0 && (
                <div className="mb-4 p-2 bg-blue-900/10 border border-blue-900/30 rounded">
                    <p className="text-[10px] text-blue-300 uppercase tracking-wide mb-1">Modifiers</p>
                    {preview.notes.map((note, idx) => (
                        <p key={idx} className="text-xs text-blue-200">• {note}</p>
                    ))}
                </div>
            )}

            <button
                onClick={onConfirm}
                className="w-full py-4 bg-mythic-gold text-black font-display font-bold text-xl rounded hover:bg-yellow-400 transition-all shadow-lg hover:shadow-mythic-gold/20"
            >
                {debugMode ? 'USE ABILITY' : 'CONFIRM INTERVENTION'}
            </button>
        </div>
    );
};
