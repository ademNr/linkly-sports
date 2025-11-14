import { WorkoutType } from '@/types';



// Muscle groups
export const MUSCLE_GROUPS = {
    CHEST: 'chest',
    BACK: 'back',
    SHOULDERS: 'shoulders',
    BICEPS: 'biceps',
    TRICEPS: 'triceps',
    QUADS: 'quads',
    HAMSTRINGS: 'hamstrings',
    GLUTES: 'glutes',
    CALVES: 'calves',
    ABS: 'abs',
    CORE: 'core',
    FOREARMS: 'forearms',
    TRAPS: 'traps',
    OBLIQUES: 'obliques'
} as const;

// Expanded exercise database
export const EXERCISE_DATABASE = [
    // Chest
    { name: 'Barbell Bench Press', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.TRICEPS, MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Dumbbell Bench Press', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.TRICEPS, MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Incline Barbell Press', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Incline Dumbbell Press', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Decline Bench Press', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Chest Fly Machine', muscleGroups: [MUSCLE_GROUPS.CHEST] },
    { name: 'Dumbbell Flyes', muscleGroups: [MUSCLE_GROUPS.CHEST] },
    { name: 'Cable Crossovers', muscleGroups: [MUSCLE_GROUPS.CHEST] },
    { name: 'Push Ups', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.TRICEPS, MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Weighted Dips', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Pec Deck', muscleGroups: [MUSCLE_GROUPS.CHEST] },
    { name: 'Close Grip Bench Press', muscleGroups: [MUSCLE_GROUPS.TRICEPS, MUSCLE_GROUPS.CHEST] },
    { name: 'Smith Machine Press', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Floor Press', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Incline Cable Fly', muscleGroups: [MUSCLE_GROUPS.CHEST] },
    { name: 'Decline Dumbbell Fly', muscleGroups: [MUSCLE_GROUPS.CHEST] },
    { name: 'Dumbbell Pullover', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.BACK] },
    { name: 'Medicine Ball Push-Up', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Weighted Push-Up', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Landmine Chest Press', muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Dumbbell Squeeze Press', muscleGroups: [MUSCLE_GROUPS.CHEST] },
    { name: 'Cable Single Arm Fly', muscleGroups: [MUSCLE_GROUPS.CHEST] },

    // Back
    { name: 'Pull Ups', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'Chin Ups', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'Lat Pulldowns', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'Bent Over Barbell Rows', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'Seated Cable Rows', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'T-Bar Rows', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'Deadlifts', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.HAMSTRINGS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Romanian Deadlifts', muscleGroups: [MUSCLE_GROUPS.HAMSTRINGS, MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.BACK] },
    { name: 'Single Arm Dumbbell Rows', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'Straight Arm Pulldowns', muscleGroups: [MUSCLE_GROUPS.BACK] },
    { name: 'Hyperextensions', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.GLUTES] },
    { name: 'Good Mornings', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.HAMSTRINGS] },
    { name: 'Cable Pullovers', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.CHEST] },
    { name: 'Inverted Rows', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'Wide Grip Pull Ups', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'Close Grip Pull Ups', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'Machine Rows', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'Rack Pulls', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.TRAPS] },
    { name: 'Shrugs', muscleGroups: [MUSCLE_GROUPS.TRAPS, MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Meadows Row', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'Renegade Row', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.CORE, MUSCLE_GROUPS.BICEPS] },
    { name: 'Trap Bar Deadlift', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.HAMSTRINGS, MUSCLE_GROUPS.GLUTES] },
    { name: 'One-Arm Cable Row', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS] },
    { name: 'Kettlebell Deadlift', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.HAMSTRINGS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Pull-Over Machine', muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.CHEST] },

    // Shoulders
    { name: 'Overhead Barbell Press', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Dumbbell Shoulder Press', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Arnold Press', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Lateral Raises', muscleGroups: [MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Front Raises', muscleGroups: [MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Rear Delt Flyes', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.BACK] },
    { name: 'Upright Rows', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRAPS] },
    { name: 'Face Pulls', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.BACK] },
    { name: 'Cable Lateral Raises', muscleGroups: [MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Reverse Pec Deck', muscleGroups: [MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Push Press', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Single Arm Dumbbell Press', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Behind Neck Press', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Machine Shoulder Press', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Dumbbell Front Raise', muscleGroups: [MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Cable Front Raise', muscleGroups: [MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Machine Lateral Raise', muscleGroups: [MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Kettlebell Overhead Press', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRICEPS] },
    { name: 'Cuban Press', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRAPS] },
    { name: 'Dumbbell Reverse Fly', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.BACK] },
    { name: 'Plate Raise', muscleGroups: [MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Y-Raise', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.BACK] },
    { name: 'Z-Press', muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRICEPS] },

    // Arms
    { name: 'Barbell Bicep Curls', muscleGroups: [MUSCLE_GROUPS.BICEPS] },
    { name: 'Dumbbell Bicep Curls', muscleGroups: [MUSCLE_GROUPS.BICEPS] },
    { name: 'Hammer Curls', muscleGroups: [MUSCLE_GROUPS.BICEPS, MUSCLE_GROUPS.FOREARMS] },
    { name: 'Preacher Curls', muscleGroups: [MUSCLE_GROUPS.BICEPS] },
    { name: 'Concentration Curls', muscleGroups: [MUSCLE_GROUPS.BICEPS] },
    { name: 'Cable Curls', muscleGroups: [MUSCLE_GROUPS.BICEPS] },
    { name: 'Spider Curls', muscleGroups: [MUSCLE_GROUPS.BICEPS] },
    { name: 'Incline Dumbbell Curls', muscleGroups: [MUSCLE_GROUPS.BICEPS] },
    { name: 'Tricep Pushdowns', muscleGroups: [MUSCLE_GROUPS.TRICEPS] },
    { name: 'Overhead Tricep Extensions', muscleGroups: [MUSCLE_GROUPS.TRICEPS] },
    { name: 'Skull Crushers', muscleGroups: [MUSCLE_GROUPS.TRICEPS] },
    { name: 'Diamond Push Ups', muscleGroups: [MUSCLE_GROUPS.TRICEPS, MUSCLE_GROUPS.CHEST] },
    { name: 'Tricep Dips', muscleGroups: [MUSCLE_GROUPS.TRICEPS, MUSCLE_GROUPS.CHEST] },
    { name: 'Single Arm Tricep Extensions', muscleGroups: [MUSCLE_GROUPS.TRICEPS] },
    { name: 'Zottman Curl', muscleGroups: [MUSCLE_GROUPS.BICEPS, MUSCLE_GROUPS.FOREARMS] },
    { name: 'Cable Hammer Curl', muscleGroups: [MUSCLE_GROUPS.BICEPS, MUSCLE_GROUPS.FOREARMS] },
    { name: 'Overhead Cable Tricep Extension', muscleGroups: [MUSCLE_GROUPS.TRICEPS] },
    { name: 'Dumbbell Kickbacks', muscleGroups: [MUSCLE_GROUPS.TRICEPS] },
    { name: 'Reverse Grip Tricep Pushdown', muscleGroups: [MUSCLE_GROUPS.TRICEPS] },
    { name: 'Rope Pushdown', muscleGroups: [MUSCLE_GROUPS.TRICEPS] },
    { name: 'Spider Curl (EZ Bar)', muscleGroups: [MUSCLE_GROUPS.BICEPS] },
    { name: 'Close Grip Push-Up', muscleGroups: [MUSCLE_GROUPS.TRICEPS, MUSCLE_GROUPS.CHEST] },
    { name: 'Barbell Reverse Curl', muscleGroups: [MUSCLE_GROUPS.BICEPS, MUSCLE_GROUPS.FOREARMS] },

    // Legs
    { name: 'Barbell Squats', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.HAMSTRINGS] },
    { name: 'Front Squats', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Leg Press', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Walking Lunges', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.HAMSTRINGS] },
    { name: 'Bulgarian Split Squats', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Leg Extensions', muscleGroups: [MUSCLE_GROUPS.QUADS] },
    { name: 'Leg Curls', muscleGroups: [MUSCLE_GROUPS.HAMSTRINGS] },
    { name: 'Stiff Leg Deadlifts', muscleGroups: [MUSCLE_GROUPS.HAMSTRINGS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Hip Thrusts', muscleGroups: [MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.HAMSTRINGS] },
    { name: 'Glute Bridges', muscleGroups: [MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.HAMSTRINGS] },
    { name: 'Calf Raises', muscleGroups: [MUSCLE_GROUPS.CALVES] },
    { name: 'Seated Calf Raises', muscleGroups: [MUSCLE_GROUPS.CALVES] },
    { name: 'Hack Squats', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Goblet Squats', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Sumo Squats', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.HAMSTRINGS] },
    { name: 'Step Ups', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Pistol Squats', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Box Jumps', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Nordic Hamstring Curls', muscleGroups: [MUSCLE_GROUPS.HAMSTRINGS] },
    { name: 'Sissy Squats', muscleGroups: [MUSCLE_GROUPS.QUADS] },
    { name: 'Reverse Lunges', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Curtsy Lunges', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Donkey Kicks', muscleGroups: [MUSCLE_GROUPS.GLUTES] },
    { name: 'Romanian Deadlift (single-leg)', muscleGroups: [MUSCLE_GROUPS.HAMSTRINGS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Step-Up with Dumbbells', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Seated Leg Curl', muscleGroups: [MUSCLE_GROUPS.HAMSTRINGS] },
    { name: 'Standing Leg Curl', muscleGroups: [MUSCLE_GROUPS.HAMSTRINGS] },
    { name: 'Glute Kickbacks (cable)', muscleGroups: [MUSCLE_GROUPS.GLUTES] },
    { name: 'Lying Hip Abduction', muscleGroups: [MUSCLE_GROUPS.GLUTES] },
    { name: 'Adductor Machine', muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES] },
    { name: 'Calf Press (Leg Press Machine)', muscleGroups: [MUSCLE_GROUPS.CALVES] },

    // Core
    { name: 'Planks', muscleGroups: [MUSCLE_GROUPS.CORE, MUSCLE_GROUPS.ABS] },
    { name: 'Hanging Knee Raises', muscleGroups: [MUSCLE_GROUPS.CORE, MUSCLE_GROUPS.ABS] },
    { name: 'Cable Woodchoppers', muscleGroups: [MUSCLE_GROUPS.CORE, MUSCLE_GROUPS.OBLIQUES] },
    { name: 'Side Bends', muscleGroups: [MUSCLE_GROUPS.CORE, MUSCLE_GROUPS.OBLIQUES] },
    { name: 'Ab Wheel Rollout', muscleGroups: [MUSCLE_GROUPS.CORE, MUSCLE_GROUPS.ABS] },
    { name: 'Stability Ball Crunch', muscleGroups: [MUSCLE_GROUPS.ABS] },
    { name: 'Cable Crunch', muscleGroups: [MUSCLE_GROUPS.ABS] },
    { name: 'Dragon Flag', muscleGroups: [MUSCLE_GROUPS.CORE, MUSCLE_GROUPS.ABS] },
    { name: 'Toe to Bar', muscleGroups: [MUSCLE_GROUPS.CORE, MUSCLE_GROUPS.ABS] },
    { name: 'Lying Windshield Wipers', muscleGroups: [MUSCLE_GROUPS.CORE, MUSCLE_GROUPS.OBLIQUES] },
    { name: 'Pallof Press', muscleGroups: [MUSCLE_GROUPS.CORE] },

    // Traps / Other
    { name: 'Dumbbell Shrugs', muscleGroups: [MUSCLE_GROUPS.TRAPS] },
    { name: 'Barbell Shrugs', muscleGroups: [MUSCLE_GROUPS.TRAPS] },
    { name: 'Upright Row (EZ Bar)', muscleGroups: [MUSCLE_GROUPS.TRAPS, MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Farmer’s Carry', muscleGroups: [MUSCLE_GROUPS.TRAPS, MUSCLE_GROUPS.FOREARMS] },
    { name: 'Trap Bar Shrugs', muscleGroups: [MUSCLE_GROUPS.TRAPS] },
    { name: 'Face Pull with Rope', muscleGroups: [MUSCLE_GROUPS.TRAPS, MUSCLE_GROUPS.SHOULDERS] },
    { name: 'Kettlebell Shrugs', muscleGroups: [MUSCLE_GROUPS.TRAPS] },
    { name: 'Cable High Row', muscleGroups: [MUSCLE_GROUPS.TRAPS, MUSCLE_GROUPS.BACK] },
];


// Get all exercise names (remove duplicates)
export const ALL_EXERCISES = Array.from(new Set(EXERCISE_DATABASE.map(ex => ex.name))).sort();

// Filter exercises by muscle groups
export const getExercisesByMuscleGroups = (muscleGroups: string[]) => {
    if (!muscleGroups || muscleGroups.length === 0) return [];

    return EXERCISE_DATABASE.filter(exercise =>
        exercise.muscleGroups.some(mg => muscleGroups.includes(mg))
    );
};

export const getExerciseNamesByMuscleGroups = (muscleGroups: string[]) => {
    return getExercisesByMuscleGroups(muscleGroups).map(ex => ex.name);
};
export const WORKOUT_TYPES: WorkoutType[] = [
    // Single Muscle Focus
    {
        id: 'chest',
        name: 'Chest Day',
        description: 'Chest isolation and compound presses',
        emoji: '💪',
        muscleGroups: [MUSCLE_GROUPS.CHEST],
        defaultExercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Dumbbell Flyes', 'Cable Crossovers', 'Push Ups']
    },
    {
        id: 'back',
        name: 'Back Day',
        description: 'Back width and thickness',
        emoji: '🏋️',
        muscleGroups: [MUSCLE_GROUPS.BACK],
        defaultExercises: ['Pull Ups', 'Lat Pulldowns', 'Bent Over Barbell Rows', 'Seated Cable Rows', 'T-Bar Rows', 'Face Pulls']
    },
    {
        id: 'shoulders',
        name: 'Shoulders Day',
        description: 'Delts and traps',
        emoji: '👤',
        muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRAPS],
        defaultExercises: ['Overhead Barbell Press', 'Dumbbell Shoulder Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes', 'Shrugs']
    },
    {
        id: 'arms',
        name: 'Arms Day',
        description: 'Biceps and triceps',
        emoji: '💥',
        muscleGroups: [MUSCLE_GROUPS.BICEPS, MUSCLE_GROUPS.TRICEPS],
        defaultExercises: ['Barbell Bicep Curls', 'Hammer Curls', 'Preacher Curls', 'Tricep Pushdowns', 'Overhead Tricep Extensions', 'Close Grip Bench Press']
    },
    {
        id: 'legs',
        name: 'Leg Day',
        description: 'Full leg development',
        emoji: '🦵',
        muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.HAMSTRINGS, MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.CALVES],
        defaultExercises: ['Barbell Squats', 'Leg Press', 'Romanian Deadlifts', 'Leg Curls', 'Calf Raises', 'Walking Lunges', 'Hip Thrusts']
    },

    // Classic Combos
    {
        id: 'chest-triceps',
        name: 'Chest & Triceps',
        description: 'Push movement focus',
        emoji: '🔥',
        muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.TRICEPS],
        defaultExercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Close Grip Bench Press', 'Tricep Pushdowns', 'Dips']
    },
    {
        id: 'back-biceps',
        name: 'Back & Biceps',
        description: 'Pull movement focus',
        emoji: '🚀',
        muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS],
        defaultExercises: ['Pull Ups', 'Bent Over Barbell Rows', 'Barbell Bicep Curls', 'Hammer Curls', 'Seated Cable Rows']
    },
    {
        id: 'chest-back',
        name: 'Chest & Back',
        description: 'Push & pull combined',
        emoji: '💪',
        muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.BACK],
        defaultExercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Pull Ups', 'Bent Over Barbell Rows', 'Dumbbell Flyes']
    },
    {
        id: 'shoulders-arms',
        name: 'Shoulders & Arms',
        description: 'Delts and arm focus',
        emoji: '💥',
        muscleGroups: [MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.BICEPS, MUSCLE_GROUPS.TRICEPS],
        defaultExercises: ['Overhead Barbell Press', 'Lateral Raises', 'Barbell Bicep Curls', 'Tricep Pushdowns', 'Hammer Curls']
    },
    {
        id: 'legs-glutes',
        name: 'Quads & Glutes',
        description: 'Front leg emphasis',
        emoji: '🏋️',
        muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES],
        defaultExercises: ['Barbell Squats', 'Leg Press', 'Hip Thrusts', 'Bulgarian Split Squats', 'Goblet Squats']
    },
    {
        id: 'hamstrings-glutes',
        name: 'Hamstrings & Glutes',
        description: 'Posterior chain focus',
        emoji: '🌟',
        muscleGroups: [MUSCLE_GROUPS.HAMSTRINGS, MUSCLE_GROUPS.GLUTES],
        defaultExercises: ['Romanian Deadlifts', 'Hip Thrusts', 'Leg Curls', 'Glute Bridges', 'Good Mornings']
    },

    // Splits
    {
        id: 'push-day',
        name: 'Push Day',
        description: 'Chest, shoulders, triceps',
        emoji: '⬆️',
        muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.TRICEPS],
        defaultExercises: ['Barbell Bench Press', 'Overhead Barbell Press', 'Incline Dumbbell Press', 'Tricep Pushdowns', 'Lateral Raises']
    },
    {
        id: 'pull-day',
        name: 'Pull Day',
        description: 'Back, biceps, rear delts',
        emoji: '⬇️',
        muscleGroups: [MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.BICEPS, MUSCLE_GROUPS.SHOULDERS],
        defaultExercises: ['Pull Ups', 'Bent Over Barbell Rows', 'Face Pulls', 'Barbell Bicep Curls', 'Hammer Curls']
    },
    {
        id: 'upper-body',
        name: 'Upper Body',
        description: 'Chest, back, shoulders, arms',
        emoji: '🏋️‍♂️',
        muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.BICEPS, MUSCLE_GROUPS.TRICEPS],
        defaultExercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Pull Ups', 'Bent Over Barbell Rows', 'Overhead Barbell Press', 'Barbell Bicep Curls', 'Tricep Pushdowns']
    },
    {
        id: 'lower-body',
        name: 'Lower Body',
        description: 'Legs and glutes',
        emoji: '🦵',
        muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.HAMSTRINGS, MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.CALVES],
        defaultExercises: ['Barbell Squats', 'Leg Press', 'Romanian Deadlifts', 'Leg Curls', 'Hip Thrusts', 'Walking Lunges', 'Calf Raises']
    },

    // Full Body & Athletic
    {
        id: 'full-body-strength',
        name: 'Full Body Strength',
        description: 'Compound movements',
        emoji: '🏋️‍♂️',
        muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.SHOULDERS],
        defaultExercises: ['Barbell Squats', 'Barbell Bench Press', 'Bent Over Barbell Rows', 'Overhead Barbell Press', 'Deadlifts']
    },
    {
        id: 'full-body-hypertrophy',
        name: 'Full Body Hypertrophy',
        description: 'Muscle building',
        emoji: '💪',
        muscleGroups: [MUSCLE_GROUPS.CHEST, MUSCLE_GROUPS.BACK, MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.SHOULDERS, MUSCLE_GROUPS.BICEPS, MUSCLE_GROUPS.TRICEPS],
        defaultExercises: ['Dumbbell Bench Press', 'Lat Pulldowns', 'Leg Press', 'Dumbbell Shoulder Press', 'Barbell Bicep Curls', 'Tricep Pushdowns', 'Incline Dumbbell Press']
    },
    {
        id: 'core-strength',
        name: 'Core Strength',
        description: 'Abdominal and core focus',
        emoji: '🎯',
        muscleGroups: [MUSCLE_GROUPS.ABS, MUSCLE_GROUPS.CORE],
        defaultExercises: ['Planks', 'Russian Twists', 'Leg Raises', 'Hanging Knee Raises', 'Ab Wheel Rollouts']
    },
    {
        id: 'athletic-performance',
        name: 'Athletic Performance',
        description: 'Power and agility',
        emoji: '🏃‍♂️',
        muscleGroups: [MUSCLE_GROUPS.QUADS, MUSCLE_GROUPS.GLUTES, MUSCLE_GROUPS.CORE, MUSCLE_GROUPS.SHOULDERS],
        defaultExercises: ['Front Squats', 'Box Jumps', 'Push Press', 'Planks', 'Step Ups']
    }
];
export const NEARBY_GYMS = [
    { name: 'PowerHouse Gym', distance: '0.5 km', members: 12 },
    { name: 'FitZone Elite', distance: '1.2 km', members: 8 },
    { name: 'Iron Paradise', distance: '2.1 km', members: 15 }
];

export const NEARBY_USERS = [
    { name: 'Alex Johnson', gym: 'PowerHouse Gym', lastWorkout: '2 hours ago' },
    { name: 'Sarah Miller', gym: 'FitZone Elite', lastWorkout: '5 hours ago' },
    { name: 'Mike Chen', gym: 'PowerHouse Gym', lastWorkout: 'Yesterday' }
];