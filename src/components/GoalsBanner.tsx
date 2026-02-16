import type { ActiveEncounter } from '../types';

interface GoalsBannerProps {
    encounter: ActiveEncounter;
}

export const GoalsBanner = ({ encounter }: GoalsBannerProps) => {
    // Calculate urgency states
    const pressurePercent = encounter.startingPressure > 0
        ? (encounter.pressureRemaining / encounter.startingPressure) * 100
        : 0;
    const consequencePercent = encounter.consequenceThreshold > 0
        ? (encounter.consequenceMeter / encounter.consequenceThreshold) * 100
        : 0;
    const turnsLeft = encounter.turnLimit - encounter.turn + 1;

    // Color coding
    const getPressureColor = () => {
        if (pressurePercent <= 0) return 'text-green-400 border-green-500';
        if (pressurePercent <= 30) return 'text-green-400 border-green-500';
        if (pressurePercent <= 60) return 'text-yellow-400 border-yellow-500';
        return 'text-red-400 border-red-500';
    };

    const getConsequenceColor = () => {
        if (consequencePercent <= 50) return 'text-green-400 border-green-500';
        if (consequencePercent <= 80) return 'text-yellow-400 border-yellow-500';
        return 'text-red-400 border-red-500 animate-pulse';
    };

    const getTurnColor = () => {
        if (turnsLeft > 1) return 'text-gray-300 border-gray-600';
        if (turnsLeft === 1) return 'text-orange-400 border-orange-500 animate-pulse';
        return 'text-red-400 border-red-500 animate-pulse';
    };

    const getPressureStatus = () => {
        if (pressurePercent <= 0) return 'ELIMINATED ✓';
        if (pressurePercent <= 30) return 'Nearly done!';
        if (pressurePercent <= 60) return 'Making progress';
        return 'High pressure';
    };

    const getConsequenceStatus = () => {
        if (encounter.thresholdExceeded) return 'BREACHED!';
        if (consequencePercent <= 50) return 'Safe zone';
        if (consequencePercent <= 80) return 'Approaching limit';
        return 'DANGER ZONE';
    };

    const getTurnStatus = () => {
        if (turnsLeft > 1) return `${turnsLeft} turns left`;
        if (turnsLeft === 1) return 'FINAL TURN!';
        return 'TIME UP';
    };

    return (
        <div className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg p-4 mb-6">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3 text-center">
                🎯 GOALS
            </h2>
            <div className="grid grid-cols-3 gap-4">
                {/* Pressure */}
                <div className={`border-2 rounded-lg p-4 text-center transition-all ${getPressureColor()}`}>
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                        Pressure
                    </div>
                    <div className="text-4xl font-bold mb-1">
                        {encounter.pressureRemaining}
                    </div>
                    <div className="text-xs opacity-70 mb-2">
                        of {encounter.startingPressure} remaining
                    </div>
                    <div className="text-xs font-semibold">
                        {getPressureStatus()}
                    </div>
                </div>

                {/* Consequence */}
                <div className={`border-2 rounded-lg p-4 text-center transition-all ${getConsequenceColor()}`}>
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                        Consequence
                    </div>
                    <div className="text-4xl font-bold mb-1">
                        {encounter.consequenceMeter}
                        <span className="text-lg opacity-50"> / {encounter.consequenceThreshold}</span>
                    </div>
                    <div className="text-xs opacity-70 mb-2">
                        threshold at {encounter.consequenceThreshold}
                    </div>
                    <div className="text-xs font-semibold">
                        {getConsequenceStatus()}
                    </div>
                </div>

                {/* Turn */}
                <div className={`border-2 rounded-lg p-4 text-center transition-all ${getTurnColor()}`}>
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                        Turn
                    </div>
                    <div className="text-4xl font-bold mb-1">
                        {encounter.turn}
                        <span className="text-lg opacity-50"> / {encounter.turnLimit}</span>
                    </div>
                    <div className="text-xs opacity-70 mb-2">
                        limit at {encounter.turnLimit}
                    </div>
                    <div className="text-xs font-semibold">
                        {getTurnStatus()}
                    </div>
                </div>
            </div>
        </div>
    );
};
