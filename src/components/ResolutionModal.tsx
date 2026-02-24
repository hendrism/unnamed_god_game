import type { EncounterResolution, ResolutionOutcome } from '../types';
import { getAbilityCategoryLabel } from '../utils/categoryLabels';

interface ResolutionModalProps {
    resolution: EncounterResolution;
    onContinue: () => void;
    carryOver: number;
    encountersCompleted: number;
    encountersTarget: number;
}

// Pim's filed notes: earnest, professional, genuinely believes he's contributing.
// He records what happened. He means every word.
const PIM_NOTES: Record<ResolutionOutcome, string[]> = {
    perfect: [
        'Notes filed. A strong session, my lord. The preparation held up throughout.',
        'Session complete. Everything proceeded as coordinated. Pim notes the bag was well-chosen.',
        'Recorded. The god\'s approach was decisive. Pim\'s groundwork appears to have supported the outcome.',
        'Filed. This one went well. Pim considers the briefing adequate to the occasion.',
    ],
    partial: [
        'Session logged. A good result, overall. A few items will carry forward.',
        'Filed. The god handled it, which was always the expectation. Some residuals noted.',
        'Notes updated. The outcome was within the range Pim had hoped for.',
        'Recorded. The intervention held. Pim will note the variables that ran a little hot.',
    ],
    minimal: [
        'Filed. The situation was managed. Pim will review a few of the preparation notes before next session.',
        'Session logged. The intervention held. It was close in places, but it held.',
        'Recorded. There are some residuals. Pim takes this as useful information.',
        'Notes submitted. Technically complete. Pim has added a clarifying note to the official account.',
    ],
    catastrophic: [
        'Filed. A difficult session, my lord. Pim is making notes.',
        'Session logged under complications. Pim notes that several of his assumptions may need revisiting.',
        'Recorded. The outcome was not what Pim had anticipated. He is looking into this.',
        'Filed. Pim has submitted the official account. He will have the supplementary notes ready shortly.',
    ],
};

// The god's decree: never accepts blame. Good outcome = genius. Bad outcome = Pim's fault, somehow.
const GOD_DECREES: Record<ResolutionOutcome, string[]> = {
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

export const ResolutionModal = ({ resolution, onContinue, carryOver, encountersCompleted, encountersTarget }: ResolutionModalProps) => {
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
                        <p className="text-sm text-green-300 font-semibold">✓ Pressure fully resolved. Pim has noted this in the record.</p>
                        <p className="text-xs text-green-400 mt-1">The next matter is already in the queue.</p>
                    </div>
                )}

                {resolution.thresholdExceeded && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded">
                        <p className="text-sm text-red-300 font-semibold">Consequence threshold exceeded. Pim has filed a note.</p>
                        <p className="text-xs text-red-400 mt-1">The instability carries forward. Pim is aware of this.</p>
                    </div>
                )}

                {(() => {
                    const seed = resolution.finalConsequence + resolution.essenceGained;
                    const pimNote = pickQuote(PIM_NOTES[resolution.outcome], seed);
                    const godDecree = pickQuote(GOD_DECREES[resolution.outcome], seed + 1);
                    return (
                        <div className="space-y-2 mb-4">
                            <div className="p-3 rounded border bg-amber-950/30 border-amber-700/40">
                                <p className="text-[10px] uppercase tracking-widest text-amber-600 mb-1">Pim's Filed Notes</p>
                                <p className="text-xs text-amber-300">{pimNote}</p>
                            </div>
                            <div className="p-3 rounded border bg-gray-800/60 border-gray-700">
                                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Official Decree</p>
                                <p className="text-xs italic text-gray-400">"{godDecree}"</p>
                            </div>
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
                        {isLastEncounter ? 'Session Complete' : `Next: Matter ${nextEncounterNum} of ${encountersTarget}`}
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
                    {isLastEncounter ? 'File the Session' : `On to Matter ${nextEncounterNum}`}
                </button>
            </div>
            </div>
        </div>
    );
};
