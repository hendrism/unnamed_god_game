import { useEffect, useMemo, useState } from 'react';
import type { Ability, AbilityId } from '../types';
import { DOCTRINES } from '../data/doctrines';
import { useGameStore } from '../store/gameStore';
import { getAbilityCategoryLabel } from '../utils/categoryLabels';
import { AbilityBar } from './AbilityBar';
import { ActionLog } from './ActionLog';
import { ActionPreview } from './ActionPreview';
import { EncounterCard } from './EncounterCard';
import { HeaderControls } from './HeaderControls';
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
        petitionOptions,
        synergyStreak,
        lastSynergy,
        startRun,
        castAbility,
        selectUpgrade,
        skipUpgrade,
        selectDraftAbility,
        selectBoonAbility,
        selectPetition,
        markTutorialSeen,
        hasSeenTutorial,
        endRun,
        encounterResolved,
        castsThisEncounter,
        nextEncounter,
        resetProgress,
        getAbilityPreview,
    } = useGameStore();

    const [selectedAbilityId, setSelectedAbilityId] = useState<AbilityId | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [resetConfirming, setResetConfirming] = useState(false);

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
        ? getAbilityPreview(selectedAbilityId)
        : null;

    const headerControls = (
        <HeaderControls
            resetConfirming={resetConfirming}
            setResetConfirming={setResetConfirming}
            onResetConfirm={resetProgress}
            onShowHelp={() => setShowHelp(true)}
        />
    );

    if (phase === 'menu') {
        return (
            <div key={phase} className="phase-enter flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4 py-8 space-y-8 relative">
                {headerControls}
                {showHelp && <HelpModal onClose={handleCloseHelp} />}

                <h1 className="text-5xl font-display text-mythic-gold">FALLEN GOD</h1>
                <p className="text-gray-400 italic max-w-xl text-center">
                    You are a fallen god making obviously correct decisions that, for some reason, keep causing problems.
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
            <div key={phase} className="phase-enter flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4 py-8 space-y-6 relative">
                {headerControls}
                {showHelp && <HelpModal onClose={handleCloseHelp} />}

                <h2 className="text-3xl font-display text-mythic-gold text-center">
                    A Fragment of Power Resurfaces
                </h2>
                <p className="text-gray-400 italic text-center max-w-xl">
                    One fragment must be reclaimed before the first crisis.
                </p>

                {/* Compact Reference Strip */}
                <div className="w-full max-w-xl bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 space-y-2">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 items-baseline">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 shrink-0 w-16">Arsenal</span>
                        {abilities.map((ability) => (
                            <span key={ability.id} className="text-xs">
                                <span className="text-gray-300">{ability.name}</span>
                                <span className="text-[10px] ml-1.5 space-x-1">
                                    <span className="text-red-400">−{ability.basePressure}p</span>
                                    <span className={ability.baseConsequence > 0 ? 'text-void-purple' : ability.baseConsequence < 0 ? 'text-green-400' : 'text-gray-600'}>
                                        {ability.baseConsequence > 0 ? '+' : ''}{ability.baseConsequence}c
                                    </span>
                                    <span className="text-blue-400">{ability.baseStrainCost}s</span>
                                </span>
                            </span>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 items-baseline border-t border-gray-800 pt-2">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 shrink-0 w-16">Forecast</span>
                        {runForecast.map((entry) => (
                            <span key={entry.templateId} className="text-xs text-gray-400">
                                {entry.title} <span className="text-gray-600">×{entry.count}</span>
                            </span>
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
                                Category: {getAbilityCategoryLabel(ability.category)}
                            </p>

                            <div className="w-full space-y-1 mb-4 text-xs text-gray-500">
                                <div className="flex justify-between">
                                    <span>Pressure</span>
                                    <span className="text-red-400">-{ability.basePressure}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Consequence</span>
                                    <span className={ability.baseConsequence > 0 ? 'text-void-purple' : ability.baseConsequence < 0 ? 'text-green-400' : 'text-gray-300'}>
                                        {ability.baseConsequence > 0 ? '+' : ''}{ability.baseConsequence}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Strain Cost</span>
                                    <span className="text-blue-400">{ability.baseStrainCost}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Essence</span>
                                    <span className="text-mythic-gold">+{ability.baseEssence}</span>
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
            <div key={phase} className="phase-enter flex flex-col items-center justify-center min-h-[60vh] w-full max-w-3xl mx-auto px-4 py-8 space-y-6 relative">
                {headerControls}
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
                                {getAbilityCategoryLabel(ability.category)}
                            </p>
                            <h3 className="font-display text-2xl text-gray-100 group-hover:text-mythic-gold mb-2">
                                {ability.name}
                            </h3>
                            <p className="text-sm text-gray-300 mb-4">{ability.description}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400 mt-auto">
                                <span>Pressure <span className="text-red-400">-{ability.basePressure}</span></span>
                                <span>Strain <span className="text-blue-400">{ability.baseStrainCost}</span></span>
                                <span>Essence <span className="text-mythic-gold">+{ability.baseEssence}</span></span>
                                <span>Consequence <span className={ability.baseConsequence > 0 ? 'text-void-purple' : ability.baseConsequence < 0 ? 'text-green-400' : 'text-gray-300'}>
                                    {ability.baseConsequence > 0 ? '+' : ''}{ability.baseConsequence}
                                </span></span>
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

    if (phase === 'petition') {
        return (
            <div key={phase} className="phase-enter flex flex-col items-center justify-center min-h-[60vh] w-full max-w-3xl mx-auto px-4 py-8 space-y-6 relative">
                {headerControls}
                {showHelp && <HelpModal onClose={handleCloseHelp} />}

                <h2 className="text-3xl font-display text-mythic-gold text-center">
                    Petitions Await
                </h2>
                <p className="text-gray-400 italic text-center max-w-xl">
                    Two matters require your divine attention. You will hear one.
                </p>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    {petitionOptions.map((template) => {
                        const isUrgent = template.basePressure > 40;
                        return (
                            <div
                                key={template.id}
                                className="flex flex-col p-5 bg-gray-900 border border-gray-700 rounded-lg text-left"
                            >
                                <div className={`inline-block self-start px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold mb-3 ${
                                    isUrgent
                                        ? 'bg-red-950/50 text-red-300 border border-red-800/40'
                                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                                }`}>
                                    {isUrgent ? 'Urgent' : 'Steady'}
                                </div>
                                <h3 className="font-display text-2xl text-gray-100 mb-2">
                                    {template.title}
                                </h3>
                                <p className="text-sm text-gray-300 mb-4 flex-1">
                                    {template.description}
                                </p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400 mb-4 bg-black/30 rounded p-2 border border-gray-800">
                                    <span>Pressure <span className="text-red-400">{template.basePressure}</span></span>
                                    <span>Essence <span className="text-mythic-gold">+{template.baseRewardPerTurn}/turn</span></span>
                                    <span>Consequence limit <span className="text-void-purple">{template.consequenceThreshold}</span></span>
                                    <span>Consequence cost <span className={template.baseConsequence > 0 ? 'text-red-400' : 'text-green-400'}>{template.baseConsequence > 0 ? '+' : ''}{template.baseConsequence}</span></span>
                                </div>
                                <button
                                    onClick={() => selectPetition(template.id)}
                                    className="w-full px-4 py-2 bg-void-purple text-white rounded hover:bg-void-purple-dark transition-all font-semibold"
                                >
                                    Hear This Petition
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (phase === 'upgrade') {
        return (
            <div key={phase} className="phase-enter flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4 py-8 space-y-6 relative">
                {headerControls}
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
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                        {upgradeOptions.map((upgrade) => {
                            const canAfford = essence >= upgrade.cost;
                            const isStrength = upgrade.category === 'strength';
                            const tierLabel = upgrade.tier === 3 ? 'Dominion' : upgrade.tier === 2 ? 'Aspect' : 'Fragment';
                            const tierBadgeClass = upgrade.tier === 3
                                ? 'bg-yellow-900/50 text-mythic-gold border border-yellow-700/40'
                                : upgrade.tier === 2
                                ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/40'
                                : 'bg-gray-800/50 text-gray-400 border border-gray-700/40';
                            const cardBorderClass = upgrade.tier === 3
                                ? (isStrength ? 'border-yellow-600/60' : 'border-yellow-700/50')
                                : (isStrength ? 'border-blue-700/50' : 'border-purple-700/50');
                            const cardBgClass = upgrade.tier === 3
                                ? 'bg-gradient-to-br from-yellow-950/30 to-gray-900'
                                : isStrength
                                ? 'bg-gradient-to-br from-blue-950/40 to-gray-900'
                                : 'bg-gradient-to-br from-purple-950/40 to-gray-900';
                            return (
                                <div
                                    key={upgrade.id}
                                    className={`rounded-lg p-5 text-left border-2 ${cardBgClass} ${cardBorderClass}`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`inline-block px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold ${
                                            isStrength
                                                ? 'bg-blue-900/50 text-blue-300 border border-blue-700/30'
                                                : 'bg-purple-900/50 text-purple-300 border border-purple-700/30'
                                        }`}>
                                            {isStrength ? '⚔️ Power' : '🌍 World'}
                                        </div>
                                        <div className={`inline-block px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold ${tierBadgeClass}`}>
                                            {tierLabel}
                                        </div>
                                    </div>
                                    <h3 className="font-display text-2xl text-mythic-gold mb-2">
                                        {upgrade.name}
                                    </h3>
                                    <p className="text-base text-gray-200 mb-3 leading-relaxed">{upgrade.description}</p>

                                    <p className={`text-sm mb-4 font-semibold ${canAfford ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Cost: <span className={canAfford ? 'text-mythic-gold' : 'text-gray-600'}>{upgrade.cost}</span> Essence
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
                    <p className="text-sm text-gray-500">No further refinements are available at this time.</p>
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
        <div key={phase} className="phase-enter w-full max-w-4xl mx-auto px-3 py-4 sm:p-4 flex flex-col items-center min-h-screen relative">
            {headerControls}
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
                        {Math.min(encountersCompleted + 1, encountersTarget)} / {encountersTarget}
                    </span>
                    <span className="text-[10px] text-gray-500">encounters</span>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Essence</span>
                    <span className="text-lg sm:text-xl font-bold text-mythic-gold">{essence}</span>
                    <span className="text-[10px] sm:text-xs text-gray-500 mt-1">+{runEssenceGained}</span>
                </div>
            </div>

            {/* Action Log */}
            <div className="w-full">
                <ActionLog log={actionLog} />
            </div>

            {/* Secondary Stats — unique values only (encounter# and run essence are already in header) */}
            <div className="w-full grid grid-cols-2 gap-2 mb-4 text-center">
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
            </div>

            <StrainMeter />

            {synergyStreak > 0 && (
                <div className="w-full bg-amber-950/40 border border-mythic-gold rounded p-2 mb-3 sm:mb-4 text-center animate-pulse">
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-200">Synergy Chain</p>
                    <p className="text-xs sm:text-sm text-mythic-gold truncate">{lastSynergy}</p>
                </div>
            )}

            {/* Latest Decree */}
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
                    <div key={currentEncounter.id} className="phase-enter w-full">
                        <EncounterCard encounter={currentEncounter} resolved={encounterResolved} />
                    </div>
                ) : (
                    <div className="text-gray-500 animate-pulse">Manifesting reality...</div>
                )}
            </div>

            <div className="w-full mt-auto pb-8 z-10 bg-mythic-black pt-4">
                <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-xs text-gray-500 uppercase tracking-widest">
                        Available Interventions
                    </h3>
                    {!encounterResolved && (
                        <span className="text-xs text-gray-700 tracking-wide">
                            {2 - (castsThisEncounter % 2) === 1
                                ? 'Fragment surfaces next cast'
                                : 'Fragment surfaces in 2 casts'}
                        </span>
                    )}
                </div>
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
                        Withdraw
                    </button>
                </div>
            </div>

            {encounterResolved && lastEncounterResolution && (
                <ResolutionModal
                    resolution={lastEncounterResolution}
                    onContinue={nextEncounter}
                    carryOver={carryOverInstability}
                    encountersCompleted={encountersCompleted}
                    encountersTarget={encountersTarget}
                />
            )}
        </div>
    );
};
