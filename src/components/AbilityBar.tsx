import type { Ability, AbilityId } from '../types';
import { useGameStore } from '../store/gameStore';

interface AbilityBarProps {
    abilities: Ability[];
    selectedId: AbilityId | null;
    onChoose: (id: AbilityId) => void;
}

export const AbilityBar = ({ abilities, selectedId, onChoose }: AbilityBarProps) => {
    const { getAbilityPreview } = useGameStore();

    return (
        <div className="w-full max-w-4xl mx-auto mt-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pb-safe">
                {abilities.map((ability) => {
                    const preview = getAbilityPreview(ability.id);
                    const isSelected = selectedId === ability.id;

                    return (
                        <button
                            key={ability.id}
                            onClick={() => onChoose(ability.id)}
                            disabled={!preview}
                            className={`
                                relative flex flex-col p-3 sm:p-4 rounded-lg border-2 transition-all text-left min-h-[100px] sm:min-h-0
                                ${isSelected
                                    ? 'bg-gray-800 border-mythic-gold shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                                    : 'bg-gray-900 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                                }
                                ${!preview ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {/* Ability name */}
                            <div className="mb-2 sm:mb-3">
                                <span className={`
                                    font-display text-base sm:text-lg leading-tight block break-words
                                    ${isSelected ? 'text-mythic-gold' : 'text-gray-200'}
                                `}>
                                    {ability.name}
                                </span>
                                <span className="text-[9px] uppercase tracking-widest text-gray-500 truncate block">
                                    {ability.category}
                                </span>
                            </div>

                            {/* Clear Stats */}
                            {preview && (
                                <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-gray-400 truncate">Pressure</span>
                                        <span className="text-red-400 font-bold flex-shrink-0">-{preview.pressureDelta}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-gray-400 truncate">Strain</span>
                                        <span className="text-blue-400 font-bold flex-shrink-0">+{preview.strainCost}</span>
                                    </div>
                                    {preview.consequenceDelta !== 0 && (
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-gray-400 truncate">Consequence</span>
                                            <span className={`font-bold flex-shrink-0 ${
                                                preview.consequenceDelta > 0
                                                    ? preview.willExceedThreshold
                                                        ? 'text-strain-red animate-pulse'
                                                        : 'text-void-purple'
                                                    : 'text-green-400'
                                            }`}>
                                                {preview.consequenceDelta > 0 ? '+' : ''}{preview.consequenceDelta}
                                            </span>
                                        </div>
                                    )}
                                    {preview.essenceDelta > 0 && (
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-gray-400 truncate">Essence</span>
                                            <span className="text-mythic-gold font-bold flex-shrink-0">+{preview.essenceDelta}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Synergy indicator */}
                            {preview?.synergyLabel && (
                                <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-gray-700">
                                    <span className="text-[9px] sm:text-[10px] text-amber-400 uppercase tracking-wider truncate block">
                                        ⚡ {preview.synergyLabel}
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
