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
                        Pim's Briefing Notes
                    </h2>

                    <div className="space-y-4 text-gray-300 text-sm">
                        <section>
                            <h3 className="text-void-purple font-bold uppercase tracking-wider mb-2">The Situation</h3>
                            <p>
                                A series of <span className="text-gray-200 font-bold">Matters</span> require intervention (3–5 per session).
                                Each resolved matter yields <span className="text-mythic-gold">Essence</span>, which funds improvements.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-void-purple font-bold uppercase tracking-wider mb-2">The Meters</h3>
                            <ul className="space-y-2">
                                <li>
                                    <span className="text-red-400 font-bold">Pressure:</span> The immediate crisis level.
                                    Reduce to 0 for a clean resolution. Unresolved Pressure contributes to Consequence.
                                </li>
                                <li>
                                    <span className="text-blue-400 font-bold">Herald's Strain:</span> The operational limit.
                                    Each cast adds Strain. High Strain increases <span className="text-orange-400">Consequence</span> per cast significantly.
                                </li>
                                <li>
                                    <span className="text-void-purple font-bold">Consequence:</span> Long-term instability.
                                    Pim notes this carefully. It carries over between encounters.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-void-purple font-bold uppercase tracking-wider mb-2">How Interventions Work</h3>
                            <p>
                                1. <span className="text-gray-200 font-bold">Select</span> an ability to see the projected outcome.
                            </p>
                            <p>
                                2. <span className="text-gray-200 font-bold">Confirm</span> to execute it.
                            </p>
                            <p className="italic text-xs mt-2 text-gray-500">
                                Pim's note: Specific Synergies (e.g., "Use X after Y") improve efficiency considerably. He has flagged these in the previews.
                            </p>
                        </section>
                    </div>

                    <div className="mt-5">
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 bg-void-purple text-white font-bold rounded hover:bg-void-purple-dark transition-all"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
