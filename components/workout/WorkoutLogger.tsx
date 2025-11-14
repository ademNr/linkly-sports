'use client';

import { useState } from 'react';
import { WorkoutType, Exercise, WorkoutSession } from '@/types';
import { WORKOUT_TYPES } from '@/lib/workoutData';
import WorkoutTypeSelector from './WorkoutTypeSelector';
import SimpleExerciseList from './ExerciseList';
import { Save, Plus, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function WorkoutLogger() {
    const [selectedWorkoutType, setSelectedWorkoutType] = useState<WorkoutType | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [workoutName, setWorkoutName] = useState('');

    const handleWorkoutTypeSelect = (workoutType: WorkoutType) => {
        setSelectedWorkoutType(workoutType);
        setWorkoutName(workoutType.name);

        // Initialize with default exercises - SIMPLIFIED
        const defaultExercises: Exercise[] = workoutType.defaultExercises.map(exerciseName => ({
            id: uuidv4(),
            name: exerciseName,
            muscleGroup: workoutType.muscleGroups[0],
            setsCompleted: 3 // Default to 3 sets
        }));

        setExercises(defaultExercises);
    };

    const addExercise = () => {
        const newExercise: Exercise = {
            id: uuidv4(),
            name: '',
            muscleGroup: selectedWorkoutType?.muscleGroups[0] || '',
            setsCompleted: 3 // Default to 3 sets
        };
        setExercises([...exercises, newExercise]);
    };

    const removeExercise = (exerciseId: string) => {
        setExercises(exercises.filter(ex => ex.id !== exerciseId));
    };

    const updateExercise = (exerciseId: string, updates: Partial<Exercise>) => {
        setExercises(exercises.map(ex =>
            ex.id === exerciseId ? { ...ex, ...updates } : ex
        ));
    };

    const saveWorkout = () => {
        if (!selectedWorkoutType || exercises.length === 0) {
            alert('Please add at least one exercise before saving.');
            return;
        }

        // Check if all exercises have names
        const unnamedExercises = exercises.filter(ex => !ex.name.trim());
        if (unnamedExercises.length > 0) {
            alert('Please name all exercises before saving.');
            return;
        }

        const workoutSession: WorkoutSession = {
            id: uuidv4(),
            name: workoutName,
            type: selectedWorkoutType.id,
            exercises: exercises,
            date: new Date().toISOString(),
            duration: 60
        };

        // Save to localStorage
        const savedWorkouts = JSON.parse(localStorage.getItem('workoutSessions') || '[]');
        savedWorkouts.unshift(workoutSession);
        localStorage.setItem('workoutSessions', JSON.stringify(savedWorkouts));

        // Reset form
        setSelectedWorkoutType(null);
        setExercises([]);
        setWorkoutName('');

        alert('Workout saved successfully!');
    };

    if (!selectedWorkoutType) {
        return <WorkoutTypeSelector onSelect={handleWorkoutTypeSelect} />;
    }

    return (
        <div className="space-y-6 px-4 md:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold">{workoutName}</h2>
                    <p className="text-gray-600 text-sm md:text-base">{selectedWorkoutType.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Muscle groups: {selectedWorkoutType.muscleGroups.join(', ')}
                    </p>
                </div>
                <button
                    onClick={() => setSelectedWorkoutType(null)}
                    className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-2xl transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Change Type</span>
                </button>
            </div>

            {/* Use SimpleExerciseList with selectedWorkoutType prop */}
            <SimpleExerciseList
                exercises={exercises}
                selectedWorkoutType={selectedWorkoutType}
                onUpdateExercise={updateExercise}
                onRemoveExercise={removeExercise}
            />

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={addExercise}
                    className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-2xl transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Exercise</span>
                </button>

                <button
                    onClick={saveWorkout}
                    className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-2xl transition-colors"
                >
                    <Save className="h-4 w-4" />
                    <span>Save Workout</span>
                </button>
            </div>
        </div>
    );
}