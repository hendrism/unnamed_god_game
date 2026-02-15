import type { ActiveEncounter } from '../types';

interface EncounterCardProps {
    encounter: ActiveEncounter;
}

export const EncounterCard = ({ encounter }: EncounterCardProps) => {
    return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-display text-white">{encounter.title}</h2>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 uppercase tracking-wider">
                    {encounter.modifierName}
                </span>
            </div>

            <p className="text-gray-400 italic mb-6 border-l-2 border-void-purple pl-4">
                {encounter.description}
            </p>
            <p className="text-xs text-gray-500 mb-4">{encounter.modifierDescription}</p>

            <div className="space-y-4">
                <div className="bg-black/40 p-3 rounded border border-gray-800">
                    <span className="text-xs text-red-500 uppercase tracking-wider block mb-1">Pressure</span>
                    <p className="text-sm text-gray-300">{encounter.pressureText}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        Remaining: {encounter.pressureRemaining} / {encounter.startingPressure}
                    </p>
                </div>

                <div className="bg-black/40 p-3 rounded border border-gray-800">
                    <span className="text-xs text-mythic-gold uppercase tracking-wider block mb-1">Reward</span>
                    <p className="text-sm text-gray-300">{encounter.rewardText}</p>
                    <p className="text-xs text-gray-500 mt-2">Current gain per cast: +{encounter.rewardPerTurn} Essence</p>
                </div>

                <div className="bg-black/40 p-3 rounded border border-gray-800">
                    <span className="text-xs text-void-purple uppercase tracking-wider block mb-1">Consequence</span>
                    <p className="text-sm text-gray-300">{encounter.consequenceText}</p>
                    <p className="text-xs text-gray-500 mt-2">Current consequence meter: {encounter.consequenceMeter}</p>
                </div>
            </div>
        </div>
    );
};
