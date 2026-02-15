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
        <div className="w-full max-w-2xl mx-auto mt-auto">
            <div className="grid grid-cols-3 gap-2 pb-safe">
                {abilities.map((ability) => {
                    const preview = getAbilityPreview(ability.id);
                    const isSelected = selectedId === ability.id;

                    return (
                        <button
                            key={ability.id}
                            onClick={() => onChoose(ability.id)}
                            disabled={!preview}
                            className={`
                                relative flex flex-col items-center p-3 rounded-lg border transition-all text-center h-24 justify-center
                                ${isSelected
                                    ? 'bg-gray-800 border-mythic-gold shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                                    : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                                }
                                ${!preview ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <span className={`
                                font-display text-sm leading-tight mb-1
                                ${isSelected ? 'text-mythic-gold' : 'text-gray-200'}
                            `}>
                                {ability.name}
                            </span>

                            {/* Concise Stats */}
                            <div className="flex gap-2 text-[10px] uppercase font-mono mt-1 opacity-80">
                                <span className={preview ? 'text-red-400' : 'text-gray-500'}>
                                    P:-{preview?.pressureDelta ?? '?'}
                                </span>
                                <span className={preview ? 'text-blue-400' : 'text-gray-500'}>
                                    S:+{preview?.strainCost ?? '?'}
                                </span>
                                {preview && preview.essenceDelta > 0 && (
                                    <span className="text-mythic-gold">
                                        E:+{preview.essenceDelta}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
