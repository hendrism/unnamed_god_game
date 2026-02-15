import type { Ability, AbilityId } from '../types';
import { useGameStore } from '../store/gameStore';

interface AbilityBarProps {
    abilities: Ability[];
    onChoose: (id: AbilityId) => void;
}

export const AbilityBar = ({ abilities, onChoose }: AbilityBarProps) => {
    const { getAbilityPreview } = useGameStore();

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {abilities.map((ability) => {
                    const preview = getAbilityPreview(ability.id);
                    const headlineNote = preview?.notes[0] ?? null;

                    return (
                        <button
                            key={ability.id}
                            onClick={() => onChoose(ability.id)}
                            disabled={!preview}
                            className="group relative flex flex-col items-center p-4 bg-gray-900 border border-gray-700 rounded-lg hover:border-mythic-gold hover:bg-gray-800 transition-all text-left"
                        >
                            {headlineNote && (
                                <div className="absolute -top-3 bg-mythic-gold text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg animate-bounce">
                                    {headlineNote}
                                </div>
                            )}
                            <span className="font-display text-lg text-gray-200 group-hover:text-mythic-gold mb-1">
                                {ability.name}
                            </span>
                            <p className="text-xs text-gray-400 mb-2">{ability.description}</p>

                            {preview && (
                                <div className="w-full text-xs text-gray-300 space-y-1 mb-3">
                                    <p>Pressure: -{preview.pressureDelta}</p>
                                    <p>Essence: +{preview.essenceDelta}</p>
                                    <p>
                                        Consequence:{' '}
                                        {preview.consequenceDelta >= 0 ? '+' : ''}
                                        {preview.consequenceDelta}
                                    </p>
                                    <p>
                                        Strain: +{preview.strainCost} {'->'} {preview.projectedStrain} ({preview.projectedStrainLevel})
                                    </p>
                                </div>
                            )}

                            <div className="mt-auto pt-2 border-t border-gray-800 w-full">
                                <p className="text-[10px] text-gray-600 italic">"{ability.flavorText}"</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
