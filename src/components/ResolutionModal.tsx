import { useEffect } from 'react';
import type { EncounterResolution } from '../types';

interface ResolutionModalProps {
    resolution: EncounterResolution;
    onContinue: () => void;
}

export const ResolutionModal = ({ resolution, onContinue }: ResolutionModalProps) => {
    // Auto-close after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onContinue();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onContinue]);

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
                        <span className="text-gray-200">{resolution.pressureRemaining}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Final Consequence:</span>
                        <span className={resolution.thresholdExceeded ? 'text-strain-red font-bold' : 'text-gray-200'}>
                            {resolution.finalConsequence}
                            {resolution.thresholdExceeded && ' (EXCEEDED)'}
                        </span>
                    </div>
                </div>

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

                <button
                    onClick={onContinue}
                    className="w-full py-3 bg-void-purple text-white font-semibold rounded hover:bg-void-purple-dark transition-all"
                >
                    Continue
                </button>

                <p className="text-xs text-gray-600 text-center mt-3">Auto-advancing in 3 seconds...</p>
            </div>
        </div>
    );
};
