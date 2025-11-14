'use client';

import { Trash2 } from 'lucide-react';

// This interface is no longer used in the main app but kept for reference
interface Set {
    id: string;
    weight: number;
    reps: number;
    completed: boolean;
}

interface SetInputProps {
    set: Set;
    setNumber: number;
    onUpdate: (updates: Partial<Set>) => void;
    onRemove?: () => void;
}

export default function SetInput({ set, setNumber, onUpdate }: SetInputProps) {
    return (
        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
            <span className="text-sm font-medium w-8 flex-shrink-0">
                Set {setNumber}
            </span>

            <div className="flex-1 min-w-0">
                <label htmlFor={`weight-${set.id}`} className="sr-only">
                    Weight for set {setNumber}
                </label>
                <input
                    id={`weight-${set.id}`}
                    type="number"
                    placeholder="0"
                    value={set.weight || ''}
                    onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white rounded-xl px-4 py-3 text-center outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
                    min="0"
                    step="0.5"
                />
                <div className="text-xs text-gray-500 text-center mt-1">kg</div>
            </div>

            <span className="text-gray-400 font-medium flex-shrink-0">×</span>

            <div className="flex-1 min-w-0">
                <label htmlFor={`reps-${set.id}`} className="sr-only">
                    Reps for set {setNumber}
                </label>
                <input
                    id={`reps-${set.id}`}
                    type="number"
                    placeholder="0"
                    value={set.reps || ''}
                    onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white rounded-xl px-4 py-3 text-center outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
                    min="0"
                />
                <div className="text-xs text-gray-500 text-center mt-1">reps</div>
            </div>

            <button
                onClick={() => onUpdate({ completed: !set.completed })}
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${set.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 hover:border-green-400'
                    } transition-colors`}
                aria-label={set.completed ? "Mark as incomplete" : "Mark as complete"}
            >
                {set.completed && (
                    <svg className="w-4 h-4 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>
        </div>
    );
}