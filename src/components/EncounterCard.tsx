import type { ActiveEncounter } from '../types';



export const EncounterCard = ({ encounter, resolved }: { encounter: ActiveEncounter, resolved?: boolean }) => {
    return (
        <div className="w-full max-w-md mx-auto bg-gray-900 border-2 border-gray-700 rounded-lg p-6 shadow-2xl relative overflow-hidden">
            {/* Resolved Overlay */}
            {resolved && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <h2 className="text-4xl font-display text-mythic-gold tracking-[0.2em] animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                        SEVERED
                    </h2>
                </div>
            )}

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
