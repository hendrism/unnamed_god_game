import type { EncounterResolution } from '../types';

interface ResolutionModalProps {
    resolution: EncounterResolution;
    onContinue: () => void;
    carryOver: number;
    encountersCompleted: number;
    encountersTarget: number;
}

export const ResolutionModal = ({ resolution, onContinue, carryOver, encountersCompleted, encountersTarget }: ResolutionModalProps) => {
    const isLastEncounter = encountersCompleted + 1 >= encountersTarget;
    const nextEncounterNum = encountersCompleted + 2;

    const getOutcomeClass = () => {
        switch (resolution.outcome) {
            case 'perfect':
                return 'text-mythic-gold';
            case 'partial':
                return 'text-blue-400';
            case 'minimal':
                return 'text-yellow-400';
            case 'catastrophic':
                return 'text-strain-red';
            default:
                return 'text-gray-200';
        }
    };

    const getOutcomeTitle = () => {
        switch (resolution.outcome) {
            case 'perfect':
                return 'Perfect Intervention';
            case 'partial':
                return 'Partial Success';
            case 'minimal':
                return 'Minimal Success';
            case 'catastrophic':
                return 'Catastrophic Outcome';
            default:
                return 'Intervention Complete';
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={onContinue}
        >
            <div
                className="w-full max-w-md mx-4 bg-gray-900 border-2 border-gray-700 rounded-lg p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-2xl font-display ${getOutcomeClass()} mb-4 text-center`}>
                    {getOutcomeTitle()}
                </h2>

                <p className="text-gray-300 italic text-center mb-6 border-l-2 border-void-purple pl-4">
                    {resolution.flavorText}
                </p>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Pressure Remaining:</span>
                        <span className={resolution.pressureRemaining === 0 ? 'text-green-400 font-bold' : 'text-gray-200'}>
                            {resolution.pressureRemaining}
                            {resolution.pressureRemaining === 0 && ' ✓ ELIMINATED'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Final Consequence:</span>
                        <span className={resolution.thresholdExceeded ? 'text-strain-red font-bold' : 'text-gray-200'}>
                            {resolution.finalConsequence}
                            {resolution.thresholdExceeded && ' (EXCEEDED)'}
                        </span>
                    </div>
                    {resolution.dominantConsequenceCategory && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Dominant Consequence:</span>
                            <span className="text-gray-200 uppercase">
                                {resolution.dominantConsequenceCategory}
                            </span>
                        </div>
                    )}
                </div>

                {/* Goal Achievement Feedback */}
                {resolution.pressureRemaining === 0 && (
                    <div className="mb-4 p-3 bg-green-900/20 border border-green-600/50 rounded">
                        <p className="text-sm text-green-300 font-semibold">🎯 Goal 1 Achieved: Pressure Eliminated</p>
                        <p className="text-xs text-green-400 mt-1">Next encounter starts with lower pressure and grants bonus essence.</p>
                    </div>
                )}

                {resolution.thresholdExceeded && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded">
                        <p className="text-sm text-red-300 font-semibold">⚠ Goal 2 Failed: Consequences Breached</p>
                        <p className="text-xs text-red-400 mt-1">Next encounter starts with higher pressure and reduced max turns.</p>
                    </div>
                )}

                <div className="space-y-2 mb-6 p-4 bg-black/40 rounded border border-gray-800">
                    <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Essence Gained:</span>
                        <span className="text-mythic-gold font-bold">+{resolution.essenceGained}</span>
                    </div>
                    {resolution.carryoverAdded > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">Carryover Instability:</span>
                            <span className="text-orange-400">+{resolution.carryoverAdded}</span>
                        </div>
                    )}
                </div>

                {resolution.consequenceAftermath && (
                    <div className="mb-4 p-3 bg-purple-900/20 border border-purple-900/50 rounded">
                        <p className="text-xs text-purple-200">{resolution.consequenceAftermath}</p>
                    </div>
                )}

                {/* Carry-forward preview */}
                <div className="mb-6 p-3 bg-gray-800/60 border border-gray-700 rounded space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                        {isLastEncounter ? 'Run Complete' : `Proceeding to Intervention ${nextEncounterNum} of ${encountersTarget}`}
                    </p>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Residual Instability:</span>
                        <span className={carryOver > 8 ? 'text-orange-400 font-semibold' : carryOver > 0 ? 'text-yellow-500' : 'text-gray-500'}>
                            {carryOver > 0 ? `+${carryOver} starting pressure` : 'None — clean approach'}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Strain:</span>
                        <span className="text-gray-400">Carries forward unchanged</span>
                    </div>
                </div>

                <button
                    onClick={onContinue}
                    className="w-full py-3 bg-void-purple text-white font-semibold rounded hover:bg-void-purple-dark transition-all"
                >
                    {isLastEncounter ? 'Conclude the Session' : `Proceed to Intervention ${nextEncounterNum}`}
                </button>
            </div>
        </div>
    );
};
