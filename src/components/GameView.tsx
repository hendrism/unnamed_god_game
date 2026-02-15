import { useState, useEffect } from 'react';
import type { AbilityId } from '../types';
import { DOCTRINES } from '../data/doctrines';
import { useGameStore } from '../store/gameStore';
import { AbilityBar } from './AbilityBar';
import { ActionPreview } from './ActionPreview';
import { EncounterCard } from './EncounterCard';
import { HelpModal } from './HelpModal';
import { StrainMeter } from './StrainMeter';

export const GameView = () => {
    const {
        phase,
        essence,
        runEssenceGained,
        doctrine,
        currentEncounter,
        abilities,
        encountersCompleted,
        encountersTarget,
        carryOverInstability,
        lastResolution,
        upgradeOptions,
        ownedUpgrades,
        startRun,
        castAbility,
        selectUpgrade,
        skipUpgrade,
        selectDraftAbility,
        markTutorialSeen,
        hasSeenTutorial,
        endRun,
    } = useGameStore();

    // --- HOOKS (Must be at top level) ---
    const [selectedAbilityId, setSelectedAbilityId] = useState<AbilityId | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    // Auto-show tutorial when entering the first draft phase of a new save
    useEffect(() => {
        if (!hasSeenTutorial && phase === 'draft' && !showHelp) {
            setShowHelp(true);
        }
    }, [hasSeenTutorial, phase]);

    // --- HANDLERS ---
    const handleCloseHelp = () => {
        // Mark seen if we are in a run
        if (!hasSeenTutorial && phase !== 'menu') {
            markTutorialSeen();
        }
        setShowHelp(false);
    };

    const handleAbilityChoose = (id: AbilityId) => {
        if (selectedAbilityId === id) {
            setSelectedAbilityId(null); // Deselect if clicking again
        } else {
            setSelectedAbilityId(id);
        }
    };

    const handleConfirmCast = () => {
        if (selectedAbilityId) {
            castAbility(selectedAbilityId);
            setSelectedAbilityId(null);
        }
    };

    // --- DERIVED STATE ---
    const selectedAbility = selectedAbilityId ? abilities.find(a => a.id === selectedAbilityId) : null;
    const selectedPreview = selectedAbilityId ? useGameStore.getState().getAbilityPreview(selectedAbilityId) : null;

    // --- SHARED COMPONENTS ---
    const HelpButton = () => (
        <button
            onClick={() => setShowHelp(true)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-600 text-gray-400 hover:text-white hover:border-white flex items-center justify-center text-sm font-bold z-40 bg-black/50"
            aria-label="Help"
        >
            ?
        </button>
    );

    // --- RENDER PHASES ---

    if (phase === 'menu') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4 py-8 space-y-8 relative">
                <HelpButton />
                {showHelp && <HelpModal onClose={handleCloseHelp} />}

                <h1 className="text-5xl font-display text-mythic-gold">FALLEN GOD</h1>
                <p className="text-gray-400 italic max-w-xl text-center">
                    You are a fallen god making flawless decisions with entirely unreasonable consequences.
                </p>

                <div className="w-full max-w-xl bg-gray-900 border border-gray-700 rounded-lg p-4 text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Essence Bank</p>
                    <p className="text-3xl font-bold text-mythic-gold">{essence}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        Purchased upgrades: {ownedUpgrades.length}
                    </p>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DOCTRINES.map((option) => (
                        <div
                            key={option.id}
                            className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-left"
                        >
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Doctrine</p>
                            <h2 className="font-display text-xl text-mythic-gold mb-2">{option.name}</h2>
                            <p className="text-sm text-gray-300 mb-2">{option.description}</p>
                            <p className="text-xs text-gray-400 mb-1">
                                Starting ability: <span className="text-gray-200">{option.startingAbilityId}</span>
                            </p>
                            <p className="text-xs text-gray-400 mb-4">{option.passiveDescription}</p>
                            <button
                                onClick={() => startRun(option.id)}
                                className="w-full px-4 py-2 bg-void-purple text-white rounded hover:bg-void-purple-dark transition-all font-semibold"
                            >
                                Begin Intervention
                            </button>
                        </div>
                    ))}
                </div>

                <p className="text-sm text-gray-500 italic text-center max-w-xl">{lastResolution}</p>
            </div>
        );
    }

    if (phase === 'draft') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4 py-8 space-y-8 relative">
                <HelpButton />
                {showHelp && <HelpModal onClose={handleCloseHelp} />}

                <h2 className="text-3xl font-display text-mythic-gold text-center">
                    A Fragment of Power Resurfaces
                </h2>
                <p className="text-gray-400 italic text-center max-w-xl">
                    As you reassert your will, forgotten capabilities return to your hand.
                    Choose one to shape the coming intervention.
                </p>

                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                    {useGameStore.getState().draftOptions.map((ability) => (
                        <button
                            key={ability.id}
                            //@ts-ignore - ability.id is verified to be AbilityId
                            onClick={() => selectDraftAbility(ability.id)}
                            className="group flex flex-col items-center p-6 bg-gray-900 border border-gray-700 rounded-lg hover:border-mythic-gold hover:bg-gray-800 transition-all text-left"
                        >
                            <span className="font-display text-xl text-gray-200 group-hover:text-mythic-gold mb-2">
                                {ability.name}
                            </span>
                            <p className="text-sm text-gray-400 mb-4">{ability.description}</p>

                            <div className="w-full space-y-1 mb-4 text-xs text-gray-500">
                                <div className="flex justify-between">
                                    <span>Pressure</span>
                                    <span className="text-gray-300">{ability.basePressure}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Strain Cost</span>
                                    <span className="text-gray-300">{ability.baseStrainCost}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Essence</span>
                                    <span className="text-gray-300">+{ability.baseEssence}</span>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-800 w-full">
                                <p className="text-xs text-gray-600 italic">"{ability.flavorText}"</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (phase === 'upgrade') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4 py-8 space-y-6 relative">
                <HelpButton />
                {showHelp && <HelpModal onClose={handleCloseHelp} />}

                <h2 className="text-3xl font-display text-mythic-gold">Intervention Complete</h2>
                <p className="text-gray-400 text-center max-w-xl">
                    Essence gathered this run: <span className="text-mythic-gold font-bold">{runEssenceGained}</span>
                </p>
                <p className="text-gray-400 text-center">
                    Essence available: <span className="text-white font-bold">{essence}</span>
                </p>

                {upgradeOptions.length > 0 ? (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upgradeOptions.map((upgrade) => {
                            const canAfford = essence >= upgrade.cost;
                            return (
                                <div
                                    key={upgrade.id}
                                    className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-left"
                                >
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                                        {upgrade.category === 'strength' ? 'Strength Upgrade' : 'World-Shaping Upgrade'}
                                    </p>
                                    <h3 className="font-display text-xl text-mythic-gold mb-2">{upgrade.name}</h3>
                                    <p className="text-sm text-gray-300 mb-4">{upgrade.description}</p>
                                    <p className="text-xs text-gray-500 mb-4">Cost: {upgrade.cost} Essence</p>
                                    <button
                                        onClick={() => selectUpgrade(upgrade.id)}
                                        disabled={!canAfford}
                                        className={`w-full px-4 py-2 rounded font-semibold transition-all ${canAfford
                                            ? 'bg-void-purple text-white hover:bg-void-purple-dark'
                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {canAfford ? 'Purchase Upgrade' : 'Insufficient Essence'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No new upgrades are available.</p>
                )}

                <button
                    onClick={skipUpgrade}
                    className="px-5 py-2 bg-gray-800 text-gray-200 border border-gray-600 rounded hover:bg-gray-700"
                >
                    Skip and Return to Void
                </button>
            </div>
        );
    }

    // Default: Encounter Phase
    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center min-h-screen relative">
            <HelpButton />
            {showHelp && <HelpModal onClose={handleCloseHelp} />}

            <div className="w-full flex justify-between items-start mb-6 border-b border-gray-800 pb-4 gap-4">
                <div className="flex flex-col text-left">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Doctrine</span>
                    <span className="text-sm text-gray-200">{doctrine?.name ?? 'Unbound'}</span>
                    <span className="text-xs text-gray-500 mt-1">{doctrine?.passiveDescription}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Essence</span>
                    <span className="text-xl font-bold text-mythic-gold">{essence}</span>
                    <span className="text-xs text-gray-500 mt-1">Run gain: +{runEssenceGained}</span>
                </div>
            </div>

            <div className="w-full grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-gray-900 border border-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Encounter</p>
                    <p className="text-sm text-gray-200">
                        {encountersCompleted + 1} / {encountersTarget}
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Turn</p>
                    <p className="text-sm text-gray-200">
                        {currentEncounter?.turn ?? 0} / {currentEncounter?.turnLimit ?? 0}
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Carryover</p>
                    <p className="text-sm text-gray-200">{carryOverInstability}</p>
                </div>
            </div>

            <StrainMeter />

            <div className="w-full bg-gray-900 border border-gray-800 rounded p-3 mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Latest Decree</p>
                <p className="text-sm text-gray-300">{lastResolution}</p>
            </div>

            <div className="flex-1 w-full flex flex-col items-center justify-center py-4 relative">
                {selectedAbility && selectedPreview ? (
                    <ActionPreview
                        ability={selectedAbility}
                        preview={selectedPreview}
                        onConfirm={handleConfirmCast}
                        onCancel={() => setSelectedAbilityId(null)}
                    />
                ) : currentEncounter ? (
                    <EncounterCard encounter={currentEncounter} />
                ) : (
                    <div className="text-gray-500 animate-pulse">Manifesting reality...</div>
                )}
            </div>

            <div className="w-full mt-auto pb-8 z-10 bg-mythic-black pt-4">
                <h3 className="text-center text-xs text-gray-500 uppercase tracking-widest mb-2">
                    Available Interventions
                </h3>
                <AbilityBar
                    abilities={abilities}
                    selectedId={selectedAbilityId}
                    onChoose={handleAbilityChoose}
                />
                <div className="flex justify-center mt-4">
                    <button
                        onClick={endRun}
                        className="px-4 py-2 bg-gray-800 text-gray-200 border border-gray-600 rounded hover:bg-gray-700 text-sm"
                    >
                        End Run Early
                    </button>
                </div>
            </div>
        </div>
    );
};
