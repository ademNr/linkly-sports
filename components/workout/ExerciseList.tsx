'use client';

import { Exercise } from '@/types';
import { getExerciseNamesByMuscleGroups } from '@/lib/workoutData';
import { Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SimpleExerciseListProps {
    exercises: Exercise[];
    selectedWorkoutType: any;
    onUpdateExercise: (exerciseId: string, updates: Partial<Exercise>) => void;
    onRemoveExercise: (exerciseId: string) => void;
}

export default function SimpleExerciseList({
    exercises,
    selectedWorkoutType,
    onUpdateExercise,
    onRemoveExercise
}: SimpleExerciseListProps) {
    const [filteredExercises, setFilteredExercises] = useState<string[]>([]);

    useEffect(() => {
        if (selectedWorkoutType && selectedWorkoutType.muscleGroups) {
            console.log('🔍 Filtering exercises for:', selectedWorkoutType.name);
            console.log('Muscle Groups:', selectedWorkoutType.muscleGroups);

            const exercises = getExerciseNamesByMuscleGroups(selectedWorkoutType.muscleGroups);
            console.log('Found exercises:', exercises);

            setFilteredExercises(exercises);
        } else {
            console.log('❌ No workout type selected or no muscle groups');
            setFilteredExercises([]);
        }
    }, [selectedWorkoutType]);

    const updateExerciseName = (exerciseId: string, name: string) => {
        onUpdateExercise(exerciseId, { name });
    };

    const updateSetsCompleted = (exerciseId: string, sets: number) => {
        onUpdateExercise(exerciseId, { setsCompleted: sets });
    };

    return (
        <div className="space-y-4">
            {/* Debug info */}
            <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-800">
                    <strong>Workout:</strong> {selectedWorkoutType?.name || 'None'} <br />
                    <strong>Muscle Groups:</strong> {selectedWorkoutType?.muscleGroups?.join(', ') || 'None'} <br />
                    <strong>Available Exercises:</strong> {filteredExercises.length}
                </div>
            </div>

            {exercises.map((exercise, index) => (
                <div
                    key={exercise.id}
                    className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm"
                >
                    {/* Exercise Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600">
                                    {index + 1}
                                </span>
                            </div>
                            <select
                                value={exercise.name}
                                onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                                className="flex-1 bg-gray-50 font-semibold text-lg p-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
                            >
                                <option value="">Select exercise</option>
                                {filteredExercises.length > 0 ? (
                                    filteredExercises.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))
                                ) : (
                                    <option value="" disabled>
                                        Loading exercises...
                                    </option>
                                )}
                            </select>
                        </div>
                        <button
                            onClick={() => onRemoveExercise(exercise.id)}
                            className="flex-shrink-0 p-3 text-red-500 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-2xl transition-colors ml-3"
                            aria-label="Remove exercise"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Sets Completed Selector */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Sets completed
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => updateSetsCompleted(exercise.id, num)}
                                    className={`py-3 rounded-xl border-2 transition-all active:scale-95 ${exercise.setsCompleted === num
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                        }`}
                                >
                                    <span className="text-sm font-semibold">
                                        {num}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}