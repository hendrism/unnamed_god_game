import { useEffect, useMemo, useState } from 'react';
import type { Ability, AbilityId } from '../types';
import { DOCTRINES } from '../data/doctrines';
import { useGameStore } from '../store/gameStore';
import { AbilityBar } from './AbilityBar';
import { ActionLog } from './ActionLog';
import { ActionPreview } from './ActionPreview';
import { EncounterCard } from './EncounterCard';
import { GoalsBanner } from './GoalsBanner';
import { HelpModal } from './HelpModal';
import { ResolutionModal } from './ResolutionModal';
import { StrainMeter } from './StrainMeter';

const isDefinedAbility = (ability: Ability | undefined): ability is Ability =>
    Boolean(ability);

export const GameView = () => {
    const {
        phase,
        essence,
        runEssenceGained,
        doctrine,
        currentEncounter,
        abilities,
        encounterAbilityIds,
        encountersCompleted,
        encountersTarget,
        runForecast,
        carryOverInstability,
        actionLog,
        lastResolution,
        lastEncounterResolution,
        upgradeOptions,
        ownedUpgrades,
        draftOptions,
        boonOptions,
        boonPrompt,
        synergyStreak,
        lastSynergy,
        debugMode,
        startRun,
        castAbility,
        selectUpgrade,
        skipUpgrade,
        selectDraftAbility,
        selectBoonAbility,
        markTutorialSeen,
        hasSeenTutorial,
        endRun,
        encounterResolved,
        nextEncounter,
        toggleDebugMode,
        resetProgress,
    } = useGameStore();

    const [selectedAbilityId, setSelectedAbilityId] = useState<AbilityId | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        if (!hasSeenTutorial && phase === 'draft' && !showHelp) {
            setShowHelp(true);
        }
    }, [hasSeenTutorial, phase, showHelp]);

    useEffect(() => {
        if (phase !== 'encounter') {
            setSelectedAbilityId(null);
        }
    }, [phase]);

    const encounterAbilities = useMemo(
        () =>
            encounterAbilityIds
                .map((id) => abilities.find((ability) => ability.id === id))
                .filter(isDefinedAbility),
        [abilities, encounterAbilityIds]
    );

    const handleCloseHelp = () => {
        if (!hasSeenTutorial && phase !== 'menu') {
            markTutorialSeen();
        }
        setShowHelp(false);
    };

    const handleAbilityChoose = (id: AbilityId) => {
        if (selectedAbilityId === id) {
            setSelectedAbilityId(null);
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

    const selectedAbility = selectedAbilityId
        ? encounterAbilities.find((ability) => ability.id === selectedAbilityId)
        : null;
    const selectedPreview = selectedAbilityId
        ? useGameStore.getState().getAbilityPreview(selectedAbilityId)
        : null;

    const HelpButton = () => (
        <>
            <button
                onClick={resetProgress}
                className="absolute top-4 left-4 px-3 py-1 rounded border text-xs font-bold z-40 transition-colors bg-black/50 border-gray-600 text-gray-400 hover:text-white hover:border-red-500"
                aria-label="Reset Progress"
            >
                RESET
            </button>
            <button
                onClick={toggleDebugMode}
                className={`absolute top-4 right-14 px-3 py-1 rounded border text-xs font-bold z-40 transition-colors ${
                    debugMode
                        ? 'bg-mythic-gold text-black border-mythic-gold'
                        : 'bg-black/50 border-gray-600 text-gray-400 hover:text-white hover:border-white'
                }`}
                aria-label="Toggle Debug Mode"
            >
                {debugMode ? 'PLAIN' : 'DEBUG'}
            </button>
            <button
                onClick={() => setShowHelp(true)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-600 text-gray-400 hover:text-white hover:border-white flex items-center justify-center text-sm font-bold z-40 bg-black/50"
                aria-label="Help"
            >
                ?
            </button>
        </>
    );

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
                                Starting ability:{' '}
                                <span className="text-gray-200">{option.startingAbilityId}</span>
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4 py-8 space-y-6 relative">
                <HelpButton />
                {showHelp && <HelpModal onClose={handleCloseHelp} />}

                <h2 className="text-3xl font-display text-mythic-gold text-center">
                    A Fragment of Power Resurfaces
                </h2>
                <p className="text-gray-400 italic text-center max-w-xl">
                    Choose one ability before the first intervention.
                </p>

                {/* Starting Abilities */}
                <div className="w-full max-w-xl bg-gray-900 border border-gray-700 rounded-lg p-4 mb-2">
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Starting Arsenal</p>
                    <div className="flex flex-wrap gap-2">
                        {abilities.map((ability) => (
                            <span
                                key={ability.id}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-800 border border-gray-700 text-gray-300"
                            >
                                {ability.name}
                                <span className="ml-2 text-[10px] text-gray-500">({ability.category})</span>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="w-full max-w-xl bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                        Foresight: Encounter Mix This Run
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {runForecast.map((entry) => (
                            <div
                                key={entry.templateId}
                                className="bg-black/40 border border-gray-800 rounded p-2"
                            >
                                <p className="text-sm text-gray-200">{entry.title}</p>
                                <p className="text-xs text-gray-500">{entry.count} projected</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                    {draftOptions.map((ability) => (
                        <button
                            key={ability.id}
                            onClick={() => selectDraftAbility(ability.id)}
                            className="group flex flex-col items-center p-6 bg-gray-900 border border-gray-700 rounded-lg hover:border-mythic-gold hover:bg-gray-800 transition-all text-left"
                        >
                            <span className="font-display text-xl text-gray-200 group-hover:text-mythic-gold mb-2">
                                {ability.name}
                            </span>
                            <p className="text-sm text-gray-400 mb-4">{ability.description}</p>
                            <p className="text-xs text-gray-500 uppercase mb-4">
                                Category: {ability.category}
                            </p>

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

    if (phase === 'boon') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-3xl mx-auto px-4 py-8 space-y-6 relative">
                <HelpButton />
                {showHelp && <HelpModal onClose={handleCloseHelp} />}

                <h2 className="text-3xl font-display text-mythic-gold text-center">
                    Fragment Choice
                </h2>
                <p className="text-gray-300 text-center max-w-xl">
                    {boonPrompt || 'A fragment of your former power is available.'}
                </p>

                {/* Current Abilities - Now with Stats! */}
                <div className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Your Current Arsenal</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {abilities.map((ability) => (
                            <div
                                key={ability.id}
                                className="bg-black/40 border border-gray-800 rounded p-3"
                            >
                                <p className="text-sm text-gray-200 font-semibold mb-1 truncate">{ability.name}</p>
                                <div className="space-y-0.5 text-[10px] text-gray-500">
                                    <div className="flex justify-between">
                                        <span>Press</span>
                                        <span className="text-red-400">-{ability.basePressure}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Cons</span>
                                        <span className={ability.baseConsequence > 0 ? 'text-void-purple' : 'text-green-400'}>
                                            {ability.baseConsequence > 0 ? '+' : ''}{ability.baseConsequence}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Strain</span>
                                        <span className="text-blue-400">{ability.baseStrainCost}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    {boonOptions.map((ability) => (
                        <button
                            key={ability.id}
                            onClick={() => selectBoonAbility(ability.id)}
                            className="group flex flex-col p-5 bg-gray-900 border border-gray-700 rounded-lg hover:border-mythic-gold hover:bg-gray-800 transition-all text-left"
                        >
                            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                                {ability.category}
                            </p>
                            <h3 className="font-display text-2xl text-gray-100 group-hover:text-mythic-gold mb-2">
                                {ability.name}
                            </h3>
                            <p className="text-sm text-gray-300 mb-4">{ability.description}</p>
                            <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mt-auto">
                                <span>Pressure {ability.basePressure}</span>
                                <span>Strain {ability.baseStrainCost}</span>
                                <span>Essence +{ability.baseEssence}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => selectBoonAbility(null)}
                    className="px-5 py-2 bg-gray-800 text-gray-200 border border-gray-600 rounded hover:bg-gray-700"
                >
                    Decline Fragment
                </button>
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
                    Essence gathered this run:{' '}
                    <span className="text-mythic-gold font-bold">{runEssenceGained}</span>
                </p>
                <p className="text-gray-400 text-center">
                    Essence available: <span className="text-white font-bold">{essence}</span>
                </p>

                {upgradeOptions.length > 0 ? (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upgradeOptions.map((upgrade) => {
                            const canAfford = essence >= upgrade.cost;
                            const isStrength = upgrade.category === 'strength';
                            return (
                                <div
                                    key={upgrade.id}
                                    className={`rounded-lg p-5 text-left border-2 ${
                                        isStrength
                                            ? 'bg-gradient-to-br from-blue-950/40 to-gray-900 border-blue-700/50'
                                            : 'bg-gradient-to-br from-purple-950/40 to-gray-900 border-purple-700/50'
                                    }`}
                                >
                                    <div className={`inline-block px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold mb-2 ${
                                        isStrength
                                            ? 'bg-blue-900/50 text-blue-300 border border-blue-700/30'
                                            : 'bg-purple-900/50 text-purple-300 border border-purple-700/30'
                                    }`}>
                                        {isStrength ? '⚔️ Power' : '🌍 World'}
                                    </div>
                                    <h3 className="font-display text-2xl text-mythic-gold mb-2">
                                        {upgrade.name}
                                    </h3>
                                    <p className="text-base text-gray-200 mb-3 leading-relaxed">{upgrade.description}</p>

                                    {/* Strategic context */}
                                    <div className={`text-xs mb-4 p-2 rounded border ${
                                        isStrength
                                            ? 'bg-blue-950/30 border-blue-800/30 text-blue-200'
                                            : 'bg-purple-950/30 border-purple-800/30 text-purple-200'
                                    }`}>
                                        <span className="font-semibold">Strategy: </span>
                                        {isStrength ? (
                                            'Makes you stronger each encounter'
                                        ) : (
                                            'Changes the types of challenges you face'
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-400 mb-4 font-semibold">
                                        Cost: {upgrade.cost} Essence
                                    </p>
                                    <button
                                        onClick={() => selectUpgrade(upgrade.id)}
                                        disabled={!canAfford}
                                        className={`w-full px-4 py-3 rounded font-semibold transition-all text-base ${
                                            canAfford
                                                ? 'bg-mythic-gold text-black hover:bg-yellow-400 shadow-lg'
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

    return (
        <div className="w-full max-w-4xl mx-auto px-3 py-4 sm:p-4 flex flex-col items-center min-h-screen relative">
            <HelpButton />
            {showHelp && <HelpModal onClose={handleCloseHelp} />}

            <div className="w-full flex justify-between items-start mb-4 sm:mb-6 border-b border-gray-800 pb-3 sm:pb-4 gap-3 sm:gap-4">
                <div className="flex flex-col text-left flex-1 min-w-0">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Doctrine</span>
                    <span className="text-xs sm:text-sm text-gray-200 truncate">{doctrine?.name ?? 'Unbound'}</span>
                    <span className="hidden sm:block text-xs text-gray-500 mt-1">{doctrine?.passiveDescription}</span>
                </div>
                <div className="flex flex-col items-center flex-shrink-0">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Run Progress</span>
                    <span className="text-base sm:text-lg font-bold text-white">
                        {encountersCompleted + 1} / {encountersTarget}
                    </span>
                    <span className="text-[10px] text-gray-500">encounters</span>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Essence</span>
                    <span className="text-lg sm:text-xl font-bold text-mythic-gold">{essence}</span>
                    <span className="text-[10px] sm:text-xs text-gray-500 mt-1">+{runEssenceGained}</span>
                </div>
            </div>

            {/* Goals Banner - Primary focus */}
            {currentEncounter && <GoalsBanner encounter={currentEncounter} runEssence={runEssenceGained} totalEssence={essence} />}

            {/* Action Log - Hidden on mobile */}
            <div className="hidden sm:block w-full">
                <ActionLog log={actionLog} />
            </div>

            {/* Secondary Stats - Hidden on mobile to reduce clutter */}
            <div className="hidden sm:grid w-full grid-cols-4 gap-2 mb-4 text-center">
                <div className="bg-gray-900 border border-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Encounter</p>
                    <p className="text-sm text-gray-200">
                        {encountersCompleted + 1} / {encountersTarget}
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Carryover</p>
                    <p className="text-sm text-gray-200">{carryOverInstability}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Hand</p>
                    <p className="text-sm text-gray-200">
                        {encounterAbilityIds.length} / {abilities.length}
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded p-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500">Run Essence</p>
                    <p className="text-sm text-mythic-gold">+{runEssenceGained}</p>
                </div>
            </div>

            <StrainMeter />

            {synergyStreak > 0 && (
                <div className="w-full bg-amber-950/40 border border-mythic-gold rounded p-2 mb-3 sm:mb-4 text-center animate-pulse">
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-200">Synergy Chain</p>
                    <p className="text-xs sm:text-sm text-mythic-gold truncate">{lastSynergy}</p>
                </div>
            )}

            {/* Latest Decree - Hidden on mobile */}
            <div className="hidden sm:block w-full bg-gray-900 border border-gray-800 rounded p-3 mb-6">
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
                    <EncounterCard encounter={currentEncounter} resolved={encounterResolved} />
                ) : (
                    <div className="text-gray-500 animate-pulse">Manifesting reality...</div>
                )}
            </div>

            <div className="w-full mt-auto pb-8 z-10 bg-mythic-black pt-4">
                <h3 className="text-center text-xs text-gray-500 uppercase tracking-widest mb-2">
                    Available Interventions
                </h3>
                <AbilityBar
                    abilities={encounterAbilities}
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

            {encounterResolved && lastEncounterResolution && (
                <ResolutionModal resolution={lastEncounterResolution} onContinue={nextEncounter} />
            )}
        </div>
    );
};
