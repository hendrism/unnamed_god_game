export const HelpModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="flex min-h-full items-start justify-center p-4 py-8">
                <div className="bg-gray-900 border-2 border-void-purple rounded-lg max-w-lg w-full p-5 shadow-2xl relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>

                    <h2 className="text-xl font-display text-mythic-gold mb-3 text-center">
                        Divine Guidance
                    </h2>

                    <div className="space-y-4 text-gray-300 text-sm">
                        <section>
                            <h3 className="text-void-purple font-bold uppercase tracking-wider mb-2">The Goal</h3>
                            <p>
                                You must survive a series of <span className="text-gray-200 font-bold">Encounters</span> (3-5 per run).
                                Survive long enough to gather <span className="text-mythic-gold">Essence</span> and grow stronger.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-void-purple font-bold uppercase tracking-wider mb-2">The Meters</h3>
                            <ul className="space-y-2">
                                <li>
                                    <span className="text-red-400 font-bold">Pressure:</span> The immediate threat.
                                    Reduce this to 0 to flawlessly solve the encounter. Unresolved Pressure becomes Consequence.
                                </li>
                                <li>
                                    <span className="text-blue-400 font-bold">Strain:</span> Your divine limit.
                                    Using abilities adds Strain. If Strain gets too high, you suffer <span className="text-orange-400">Backlash</span> (negative side effects).
                                </li>
                                <li>
                                    <span className="text-void-purple font-bold">Consequence:</span> Long-term damage to the world.
                                    Avoid this. It carries over between encounters.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-void-purple font-bold uppercase tracking-wider mb-2">How to Act</h3>
                            <p>
                                1. <span className="text-gray-200 font-bold">Select</span> an ability from your hand to see its prediction.
                            </p>
                            <p>
                                2. <span className="text-gray-200 font-bold">Confirm</span> to cast it.
                            </p>
                            <p className="italic text-xs mt-2 text-gray-500">
                                Tip: Look for specific Synergies (e.g., "Use X after Y") to maximize efficiency.
                            </p>
                        </section>
                    </div>

                    <div className="mt-5">
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 bg-void-purple text-white font-bold rounded hover:bg-void-purple-dark transition-all"
                        >
                            I UNDERSTAND
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
