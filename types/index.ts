// types/index.ts
export interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    setsCompleted: number;
}

export interface WorkoutSession {
    id: string;
    name: string;
    type: string;
    exercises: Exercise[];
    date: string;
    duration: number;
    userId?: string;
    ownerUsername?: string;
    sharedWith?: string[];
    sharedUsernames?: string[];
}

export interface WorkoutType {
    id: string;
    name: string;
    description: string;
    emoji: string;
    muscleGroups: string[];
    defaultExercises: string[];
}

export type TemplateType = 'minimal' | 'modern' | 'bold';