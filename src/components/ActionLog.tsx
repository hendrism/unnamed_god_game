import type { ActionLogEntry } from '../types';

interface ActionLogProps {
    log: ActionLogEntry[];
}

export const ActionLog = ({ log }: ActionLogProps) => {
    if (log.length === 0) {
        return null;
    }

    return (
        <div className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 mb-4">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                📜 Recent Actions
            </h3>
            <div className="space-y-1">
                {log.slice().reverse().map((entry, idx) => (
                    <div
                        key={`${entry.turn}-${entry.abilityId}-${idx}`}
                        className="text-sm bg-black/40 rounded px-3 py-2 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-mono text-xs">
                                T{entry.turn}
                            </span>
                            <span className="text-gray-200 font-semibold">
                                {entry.abilityName}
                            </span>
                            {entry.synergyLabel && (
                                <span className="text-[10px] text-amber-400 uppercase">
                                    ⚡ {entry.synergyLabel}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="text-red-400">
                                -{entry.pressureDelta}P
                            </span>
                            {entry.consequenceDelta !== 0 && (
                                <span className={entry.consequenceDelta > 0 ? 'text-void-purple' : 'text-green-400'}>
                                    {entry.consequenceDelta > 0 ? '+' : ''}{entry.consequenceDelta}C
                                </span>
                            )}
                            {entry.essenceDelta > 0 && (
                                <span className="text-mythic-gold">
                                    +{entry.essenceDelta}E
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
