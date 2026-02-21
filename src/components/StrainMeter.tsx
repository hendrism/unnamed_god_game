import { useGameStore } from '../store/gameStore';

export const StrainMeter = () => {
    const { currentStrain, maxStrain, strainLevel } = useGameStore();
    const percentage = Math.min(100, (currentStrain / maxStrain) * 100);

    let colorClass = 'bg-blue-500';
    if (strainLevel === 'Medium') colorClass = 'bg-yellow-500';
    if (strainLevel === 'High') colorClass = 'bg-orange-500';
    if (strainLevel === 'Critical') colorClass = 'bg-strain-red animate-pulse';

    let effectText = 'Stable: no backlash effects.';
    if (strainLevel === 'Medium') effectText = 'Distortion: each cast adds +5 Consequence.';
    if (strainLevel === 'High') effectText = 'Backlash: each cast adds +8 Consequence and -1 Essence.';
    if (strainLevel === 'Critical') effectText = 'Critical Backlash: +12 Consequence, -1 Essence, -5 Pressure.';

    return (
        <div className="w-full max-w-md mx-auto mb-6">
            <div className="flex justify-between text-sm uppercase tracking-widest text-gray-400 mb-1">
                <span>Divine Instability</span>
                <span className={strainLevel === 'Critical' ? 'text-strain-red' : ''}>{strainLevel}</span>
            </div>
            <div className="h-4 bg-gray-900 border border-gray-700 rounded-full overflow-hidden relative">
                <div
                    className={`h-full transition-all duration-500 ease-out ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                />
                {/* Threshold Markers */}
                <div className="absolute top-0 bottom-0 left-[45%] w-0.5 bg-black/50" />
                <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-black/50" />
                <div className="absolute top-0 bottom-0 left-[99%] w-0.5 bg-black/50" />
            </div>
            <p className="text-xs text-center mt-1 text-gray-600">
                {effectText}
            </p>
        </div>
    );
};
