import type { Ability, AbilityId } from '../types';
import { useGameStore } from '../store/gameStore';
import { getAbilityCategoryLabel } from '../utils/categoryLabels';

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
                                relative flex flex-col p-3 rounded-lg border-2 transition-all text-left
                                ${isSelected
                                    ? 'bg-gray-800 border-mythic-gold shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                                    : 'bg-gray-900 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                                }
                                ${!preview ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {/* Ability name + category */}
                            <span className={`font-display text-base leading-tight block break-words mb-1 ${isSelected ? 'text-mythic-gold' : 'text-gray-200'}`}>
                                {ability.name}
                            </span>
                            <span className="text-[9px] uppercase tracking-widest text-gray-500 block mb-2">
                                {getAbilityCategoryLabel(ability.category)}
                            </span>

                            {/* Compact stats: −Xp  +Yc  +Zs  +We */}
                            {preview && (
                                <div className="flex flex-wrap gap-x-2 gap-y-0 text-xs font-mono">
                                    <span className="text-red-400">−{preview.pressureDelta}p</span>
                                    <span className={
                                        preview.consequenceDelta > 0
                                            ? preview.willExceedThreshold ? 'text-strain-red' : 'text-void-purple'
                                            : preview.consequenceDelta < 0 ? 'text-green-400' : 'text-gray-600'
                                    }>
                                        {preview.consequenceDelta > 0 ? '+' : ''}{preview.consequenceDelta}c
                                    </span>
                                    <span className="text-blue-400">+{preview.strainCost}s</span>
                                    <span className={preview.essenceDelta > 0 ? 'text-mythic-gold' : 'text-gray-600'}>
                                        +{preview.essenceDelta}e
                                    </span>
                                </div>
                            )}

                            {/* Synergy indicator */}
                            {preview?.synergyLabel && (
                                <div className="mt-1.5 pt-1.5 border-t border-gray-700">
                                    <span className="text-[9px] text-amber-400 uppercase tracking-wider truncate block">
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
