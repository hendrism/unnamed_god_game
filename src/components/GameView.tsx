import { useGameStore } from '../store/gameStore';
import { StrainMeter } from './StrainMeter';
import { EncounterCard } from './EncounterCard';
import { AbilityBar } from './AbilityBar';

export const GameView = () => {
    const { currentEncounter, abilities, chooseAbility, phase, startRun, essence, encountersCompleted, endRun } = useGameStore();

    if (phase === 'menu') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                <h1 className="text-5xl font-display text-mythic-gold animate-pulse">FALLEN GOD</h1>
                <p className="text-gray-400 italic max-w-md text-center">
                    "I am a fallen god making obviously correct decisions that, for some reason, keep causing problems."
                </p>
                <button
                    onClick={() => startRun('dominion')}
                    className="px-8 py-3 bg-void-purple text-white rounded hover:bg-void-purple-dark transition-all text-lg font-bold shadow-lg shadow-void-purple/50"
                >
                    Begin Intervention
                </button>
            </div>
        );
    }

    if (phase === 'upgrade') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <h2 className="text-3xl font-display text-mythic-gold">Intervention Complete</h2>
                <div className="p-6 bg-gray-900 rounded border border-gray-700 text-center">
                    <p className="text-gray-400 mb-2">Total Essence Gathered</p>
                    <span className="text-4xl font-bold text-white">{essence}</span>
                </div>
                <p className="text-sm text-gray-500">Order restored. Mostly.</p>
                <button
                    onClick={endRun}
                    className="px-6 py-2 bg-gray-800 text-gray-200 border border-gray-600 rounded hover:bg-gray-700"
                >
                    Return to Void
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center min-h-screen">

            {/* Top Bar */}
            <div className="w-full flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Essence</span>
                    <span className="text-xl font-bold text-mythic-gold">{essence}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Encounter</span>
                    <span className="text-xl font-bold text-gray-200">{encountersCompleted + 1} / 5</span>
                </div>
            </div>

            <StrainMeter />

            <div className="flex-1 w-full flex flex-col items-center justify-center py-8">
                {currentEncounter ? (
                    <EncounterCard encounter={currentEncounter} />
                ) : (
                    <div className="text-gray-500 animate-pulse">Manifesting reality...</div>
                )}
            </div>

            <div className="w-full mt-auto pb-8">
                <h3 className="text-center text-xs text-gray-500 uppercase tracking-widest mb-2">Available Interventions</h3>
                <AbilityBar abilities={abilities} onChoose={chooseAbility} />
            </div>

        </div>
    );
};
