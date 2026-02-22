import type { Dispatch, SetStateAction } from 'react';

interface HeaderControlsProps {
    resetConfirming: boolean;
    setResetConfirming: Dispatch<SetStateAction<boolean>>;
    onResetConfirm: () => void;
    onShowHelp: () => void;
}

export const HeaderControls = ({
    resetConfirming,
    setResetConfirming,
    onResetConfirm,
    onShowHelp,
}: HeaderControlsProps) => (
    <>
        {resetConfirming ? (
            <div className="absolute top-4 left-4 flex gap-1 z-40">
                <button
                    onClick={() => { onResetConfirm(); setResetConfirming(false); }}
                    className="px-3 py-1 rounded border text-xs font-bold transition-colors bg-red-900 border-red-500 text-red-200 hover:bg-red-700"
                    aria-label="Confirm Reset"
                >
                    CONFIRM
                </button>
                <button
                    onClick={() => setResetConfirming(false)}
                    className="px-3 py-1 rounded border text-xs font-bold transition-colors bg-black/50 border-gray-600 text-gray-400 hover:text-white"
                    aria-label="Cancel Reset"
                >
                    CANCEL
                </button>
            </div>
        ) : (
            <button
                onClick={() => setResetConfirming(true)}
                className="absolute top-4 left-4 px-3 py-1 rounded border text-xs font-bold z-40 transition-colors bg-black/50 border-gray-600 text-gray-400 hover:text-white hover:border-red-500"
                aria-label="Reset Progress"
            >
                RESET
            </button>
        )}
        <button
            onClick={onShowHelp}
            className="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-600 text-gray-400 hover:text-white hover:border-white flex items-center justify-center text-sm font-bold z-40 bg-black/50"
            aria-label="Help"
        >
            ?
        </button>
    </>
);
