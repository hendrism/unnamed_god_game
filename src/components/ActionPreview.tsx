import type { Ability, AbilityPreview } from '../types';

interface ActionPreviewProps {
    ability: Ability;
    preview: AbilityPreview;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ActionPreview = ({ ability, preview, onConfirm, onCancel }: ActionPreviewProps) => {
    return (
        <div className="w-full max-w-md mx-auto bg-gray-900 border-2 border-mythic-gold rounded-lg p-6 shadow-2xl animate-fade-in relative">
            <button
                onClick={onCancel}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-300"
            >
                ✕
            </button>

            <div className="text-center mb-6">
                <h3 className="text-2xl font-display text-mythic-gold mb-1">{ability.name}</h3>
                <p className="text-sm text-gray-400 italic">"{ability.flavorText}"</p>
            </div>

            <div className="space-y-4 mb-8">
                <div className="bg-black/40 p-3 rounded border border-gray-800 flex justify-between items-center">
                    <span className="text-sm text-red-400 uppercase tracking-wider">Pressure Impact</span>
                    <span className="text-lg font-bold text-gray-200">-{preview.pressureDelta}</span>
                </div>

                <div className="bg-black/40 p-3 rounded border border-gray-800 flex justify-between items-center">
                    <span className="text-sm text-blue-400 uppercase tracking-wider">Strain Cost</span>
                    <div className="text-right">
                        <span className="text-lg font-bold text-gray-200 block">
                            {preview.strainCost} <span className="text-gray-500 text-xs">→</span> {preview.projectedStrain}
                        </span>
                        <span className={`text-[10px] uppercase ${preview.projectedStrainLevel === 'Critical' ? 'text-strain-red animate-pulse' :
                                preview.projectedStrainLevel === 'High' ? 'text-orange-500' : 'text-gray-500'
                            }`}>
                            {preview.projectedStrainLevel}
                        </span>
                    </div>
                </div>

                {preview.consequenceDelta !== 0 && (
                    <div className="bg-black/40 p-3 rounded border border-gray-800 flex justify-between items-center">
                        <span className="text-sm text-void-purple uppercase tracking-wider">Consequence</span>
                        <span className="text-lg font-bold text-gray-200">
                            {preview.consequenceDelta > 0 ? '+' : ''}{preview.consequenceDelta}
                        </span>
                    </div>
                )}

                {preview.notes.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-900/50 rounded">
                        <ul className="text-xs text-blue-200 space-y-1">
                            {preview.notes.map((note, idx) => (
                                <li key={idx}>• {note}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <button
                onClick={onConfirm}
                className="w-full py-4 bg-mythic-gold text-black font-display font-bold text-xl rounded hover:bg-yellow-400 transition-all shadow-lg hover:shadow-mythic-gold/20"
            >
                CONFIRM INTERVENTION
            </button>
        </div>
    );
};
