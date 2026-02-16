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
        <div className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h2 className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 mb-2 sm:mb-3 text-center">
                🎯 GOALS
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {/* Pressure */}
                <div className={`border-2 rounded-lg p-2 sm:p-4 text-center transition-all overflow-hidden ${getPressureColor()}`}>
                    <div className="text-[9px] sm:text-xs uppercase tracking-wider text-gray-400 mb-1 truncate">
                        Pressure
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold mb-0.5 sm:mb-1">
                        {encounter.pressureRemaining}
                    </div>
                    <div className="text-[9px] sm:text-xs opacity-70 mb-1 sm:mb-2 leading-tight">
                        of {encounter.startingPressure} left
                    </div>
                    <div className="text-[9px] sm:text-xs font-semibold truncate">
                        {getPressureStatus()}
                    </div>
                </div>

                {/* Consequence */}
                <div className={`border-2 rounded-lg p-2 sm:p-4 text-center transition-all overflow-hidden ${getConsequenceColor()}`}>
                    <div className="text-[9px] sm:text-xs uppercase tracking-wider text-gray-400 mb-1 truncate">
                        Consequence
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold mb-0.5 sm:mb-1">
                        {encounter.consequenceMeter}
                        <span className="text-sm sm:text-lg opacity-50"> / {encounter.consequenceThreshold}</span>
                    </div>
                    <div className="text-[9px] sm:text-xs opacity-70 mb-1 sm:mb-2 leading-tight">
                        max {encounter.consequenceThreshold}
                    </div>
                    <div className="text-[9px] sm:text-xs font-semibold truncate">
                        {getConsequenceStatus()}
                    </div>
                </div>

                {/* Turn */}
                <div className={`border-2 rounded-lg p-2 sm:p-4 text-center transition-all overflow-hidden ${getTurnColor()}`}>
                    <div className="text-[9px] sm:text-xs uppercase tracking-wider text-gray-400 mb-1 truncate">
                        Turn
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold mb-0.5 sm:mb-1">
                        {encounter.turn}
                        <span className="text-sm sm:text-lg opacity-50"> / {encounter.turnLimit}</span>
                    </div>
                    <div className="text-[9px] sm:text-xs opacity-70 mb-1 sm:mb-2 leading-tight">
                        limit {encounter.turnLimit}
                    </div>
                    <div className="text-[9px] sm:text-xs font-semibold truncate">
                        {getTurnStatus()}
                    </div>
                </div>
            </div>
        </div>
    );
};
