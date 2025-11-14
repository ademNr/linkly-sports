'use client';

import { WorkoutType } from '@/types';
import { WORKOUT_TYPES } from '@/lib/workoutData';

interface WorkoutTypeSelectorProps {
    onSelect: (workoutType: WorkoutType) => void;
}

export default function WorkoutTypeSelector({ onSelect }: WorkoutTypeSelectorProps) {
    return (
        <div className="px-4 pt-8 pb-24 max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6">Choose Workout</h2>

            <div className="grid grid-cols-2 gap-3">
                {WORKOUT_TYPES.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => onSelect(type)}
                        className="bg-gray-50 rounded-3xl p-6 text-center active:scale-95 transition-transform"
                    >
                        <div className="text-4xl mb-3">{type.emoji}</div>
                        <div className="font-bold mb-1">{type.name}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
