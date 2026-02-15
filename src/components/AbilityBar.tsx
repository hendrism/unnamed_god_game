import type { Ability } from '../types';
import { useGameStore } from '../store/gameStore';

interface AbilityBarProps {
    abilities: Ability[];
    onChoose: (id: string) => void;
}

export const AbilityBar = ({ abilities, onChoose }: AbilityBarProps) => {
    const { history } = useGameStore();

    const getSynergyStatus = (ability: Ability) => {
        // Simple client-side check for visual feedback
        // This duplicates logic in store, which is not ideal, but fine for MVP
        const lastId = history[history.length - 1];
        if (ability.id === 'smite' && lastId === 'manifest') return 'High Synergy';
        if (ability.id === 'manifest' && lastId === 'twist') return 'Strain Relief';
        if (ability.id === 'twist' && lastId === 'smite') return 'Free Cast';
        return null;
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {abilities.map((ability) => {
                    const synergy = getSynergyStatus(ability);
                    return (
                        <button
                            key={ability.id}
                            onClick={() => onChoose(ability.id)}
                            className="group relative flex flex-col items-center p-4 bg-gray-900 border border-gray-700 rounded-lg hover:border-mythic-gold hover:bg-gray-800 transition-all text-left"
                        >
                            {synergy && (
                                <div className="absolute -top-3 bg-mythic-gold text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg animate-bounce">
                                    {synergy}
                                </div>
                            )}
                            <span className="font-display text-lg text-gray-200 group-hover:text-mythic-gold mb-1">
                                {ability.name}
                            </span>
                            <span className="text-xs text-gray-500 mb-2">Strain: {ability.baseStrainCost}</span>
                            <p className="text-xs text-gray-400 mb-2">{ability.description}</p>
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
