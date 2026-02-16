import { useState } from 'react';
import type { ActiveEncounter } from '../types';

export const EncounterCard = ({ encounter, resolved }: { encounter: ActiveEncounter, resolved?: boolean }) => {
    const [showDetails, setShowDetails] = useState(false);
    const urgencyClass = encounter.urgency === 'urgent' ? 'text-strain-red border-strain-red' : 'text-gray-400 border-gray-700';

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
                <div className="flex-1">
                    <h2 className="text-xl font-display text-white mb-1">{encounter.title}</h2>
                    <div className="flex gap-2 items-center">
                        <span className={`text-xs bg-gray-800 px-2 py-1 rounded uppercase tracking-wider border ${urgencyClass}`}>
                            {encounter.urgency === 'urgent' ? 'Urgent' : 'Steady'}
                        </span>
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 uppercase tracking-wider">
                            {encounter.modifierName}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1 rounded transition-colors"
                >
                    {showDetails ? 'Hide Details ▲' : 'Show Details ▼'}
                </button>
            </div>

            {showDetails && (
                <div className="mb-4 pb-4 border-b border-gray-800">
                    <p className="text-gray-400 italic mb-3 border-l-2 border-void-purple pl-4">
                        {encounter.description}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">{encounter.modifierDescription}</p>

                    <div className="space-y-2 mt-3">
                        <div className="bg-black/40 p-2 rounded border border-gray-800">
                            <span className="text-xs text-red-500 uppercase tracking-wider block mb-1">Pressure</span>
                            <p className="text-xs text-gray-300">{encounter.pressureText}</p>
                        </div>
                        <div className="bg-black/40 p-2 rounded border border-gray-800">
                            <span className="text-xs text-mythic-gold uppercase tracking-wider block mb-1">Reward</span>
                            <p className="text-xs text-gray-300">{encounter.rewardText}</p>
                        </div>
                        <div className="bg-black/40 p-2 rounded border border-gray-800">
                            <span className="text-xs text-void-purple uppercase tracking-wider block mb-1">Consequence</span>
                            <p className="text-xs text-gray-300">{encounter.consequenceText}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Compact Summary - Always visible */}
            <div className="bg-black/40 p-3 rounded border border-gray-800">
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="text-gray-500 uppercase tracking-wider">Essence/Turn</span>
                        <p className="text-mythic-gold font-bold">+{encounter.rewardPerTurn}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 uppercase tracking-wider">Category Impact</span>
                        <p className="text-gray-400">
                            S:{encounter.consequenceByCategory.smite} M:{encounter.consequenceByCategory.manifest} T:{encounter.consequenceByCategory.twist}
                        </p>
                    </div>
                </div>
                {encounter.thresholdExceeded && (
                    <p className="text-xs text-strain-red mt-2 animate-pulse">⚠ Threshold exceeded: instability penalties active</p>
                )}
            </div>
        </div>
    );
};
