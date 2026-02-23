import type { EncounterResolution, ResolutionOutcome } from '../types';
import { getAbilityCategoryLabel } from '../utils/categoryLabels';

interface ResolutionModalProps {
    resolution: EncounterResolution;
    onContinue: () => void;
    carryOver: number;
    encountersCompleted: number;
    encountersTarget: number;
    petitionWasPim?: boolean;
}

// Pim is earnest, eager, and slightly oblivious to how much he's being blamed.
const PIM_QUOTES: Record<ResolutionOutcome, string[]> = {
    perfect: [
        '"A triumph, my lord. I had a feeling about this one." — Pim, who did not have a feeling about this one',
        '"Exactly as I predicted, my lord." — Pim, who predicted nothing',
        '"My instincts were sound on this occasion." — Pim, filing this away for future self-promotion',
        '"I believe my briefing was a contributing factor." — Pim, whose briefing was approximate at best',
    ],
    partial: [
        '"A solid outcome, my lord. Largely as hoped." — Pim, who had not hoped',
        '"Better than my estimates suggested." — Pim, who made no estimates',
        '"I feel this reflects well on the preparation." — Pim, who prepared nothing',
    ],
    minimal: [
        '"In hindsight, some of my figures may have been approximate." — Pim, who used no figures',
        '"I accept partial responsibility, my lord. The partial that is not mine." — Pim',
        '"I believe the situation was more nuanced than I communicated." — Pim, who communicated nothing',
        '"The intelligence I had was also incomplete." — Pim, who gathered no intelligence',
    ],
    catastrophic: [
        '"My lord, I can explain. Several of the explanations are quite good." — Pim',
        '"I may have misjudged the severity. I accept full responsibility." — Pim, who will not',
        '"In my defense, the information I had was also wrong." — Pim',
        '"I take comfort in knowing this was not entirely foreseeable." — Pim, it was entirely foreseeable',
    ],
};

// The god never accepts blame regardless of source. Good outcome = genius. Bad outcome = Pim's fault somehow.
const GOD_QUOTES: Record<ResolutionOutcome, string[]> = {
    perfect: [
        'Precisely as expected. Pim, note this for the record.',
        'The outcome reflects the quality of the intervention. Which was mine.',
        'A flawless result. One of many.',
        'My instincts continue to be correct. This is unsurprising.',
    ],
    partial: [
        'Acceptable. The situation was more cooperative than Pim\'s briefing suggested.',
        'We\'ve seen worse. Not often. But we have seen worse.',
        'Adequate. The cosmos will understand in time.',
        'Not my finest work. Pim\'s briefing was, again, optimistic.',
    ],
    minimal: [
        'The result is satisfactory, given the inadequacy of the preparation.',
        'We succeeded. Questions about the method are premature.',
        'A narrower margin than anticipated. Pim had something to do with that.',
        'Sufficient. The bar was admittedly low. We cleared it.',
    ],
    catastrophic: [
        'I don\'t blame you, Pim. (I do blame you, Pim.)',
        'Pim\'s briefing was, characteristically, optimistic.',
        'This is not a reflection of the intervention. It is a reflection of the briefing.',
        'The situation was misrepresented to me. Pim will hear about this.',
    ],
};

function pickQuote(quotes: string[], seed: number): string {
    return quotes[Math.abs(seed) % quotes.length];
}

export const ResolutionModal = ({ resolution, onContinue, carryOver, encountersCompleted, encountersTarget, petitionWasPim }: ResolutionModalProps) => {
    const isLastEncounter = encountersCompleted >= encountersTarget;
    const nextEncounterNum = encountersCompleted + 1;

    const getOutcomeClass = () => {
        switch (resolution.outcome) {
            case 'perfect':
                return 'text-mythic-gold';
            case 'partial':
                return 'text-blue-400';
            case 'minimal':
                return 'text-yellow-500';
            case 'catastrophic':
                return 'text-strain-red';
            default:
                return 'text-gray-200';
        }
    };

    const getOutcomeTitle = () => {
        switch (resolution.outcome) {
            case 'perfect':
                return 'Flawless, As Expected';
            case 'partial':
                return 'Acceptable Outcome';
            case 'minimal':
                return 'Technically Successful';
            case 'catastrophic':
                return 'Significant Feedback Received';
            default:
                return 'Intervention Complete';
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={onContinue}
        >
            <div className="flex min-h-full items-center justify-center p-4">
            <div
                className="w-full max-w-md bg-gray-900 border-2 border-gray-700 rounded-lg p-6 shadow-2xl"
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
                                {getAbilityCategoryLabel(resolution.dominantConsequenceCategory)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Goal Achievement Feedback */}
                {resolution.pressureRemaining === 0 && (
                    <div className="mb-4 p-3 bg-green-900/20 border border-green-600/50 rounded">
                        <p className="text-sm text-green-300 font-semibold">✓ Pressure eliminated. The situation accepted your intervention.</p>
                        <p className="text-xs text-green-400 mt-1">Efficiency noted. The next matter is already in queue.</p>
                    </div>
                )}

                {resolution.thresholdExceeded && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded">
                        <p className="text-sm text-red-300 font-semibold">Threshold exceeded. The cosmos has registered a concern.</p>
                        <p className="text-xs text-red-400 mt-1">The instability will be someone else's problem. Soon.</p>
                    </div>
                )}

                {(() => {
                    const seed = resolution.finalConsequence + resolution.essenceGained;
                    const quote = petitionWasPim
                        ? pickQuote(PIM_QUOTES[resolution.outcome], seed)
                        : pickQuote(GOD_QUOTES[resolution.outcome], seed);
                    const isPimQuote = !!petitionWasPim;
                    return (
                        <div className={`mb-4 p-3 rounded border ${isPimQuote ? 'bg-amber-950/30 border-amber-700/40' : 'bg-gray-800/60 border-gray-700'}`}>
                            <p className={`text-xs italic ${isPimQuote ? 'text-amber-400' : 'text-gray-400'}`}>
                                {quote}
                            </p>
                        </div>
                    );
                })()}

                <div className="space-y-2 mb-6 p-4 bg-black/40 rounded border border-gray-800">
                    <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Essence Gained:</span>
                        <span className="text-mythic-gold font-bold">+{resolution.essenceGained}</span>
                    </div>
                    {resolution.carryoverAdded > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">Mortal Grievances Added:</span>
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
                        <span className="text-gray-500">Mortal Grievances:</span>
                        <span className={carryOver > 8 ? 'text-orange-400 font-semibold' : carryOver > 0 ? 'text-yellow-500' : 'text-gray-500'}>
                            {carryOver > 0 ? `+${carryOver} starting pressure` : 'None — a mercifully quiet populace'}
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
        </div>
    );
};
