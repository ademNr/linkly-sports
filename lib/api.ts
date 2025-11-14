// API utility functions for client-side use

export async function fetchWorkouts() {
    const response = await fetch('/api/workouts');
    if (!response.ok) {
        if (response.status === 401) {
            // Redirect to sign in if unauthorized
            window.location.href = '/auth/signin';
            return [];
        }
        throw new Error('Failed to fetch workouts');
    }
    return response.json();
}

export async function createWorkout(workout: {
    name: string;
    type: string;
    exercises: Array<{
        name: string;
        muscleGroup: string;
        setsCompleted: number;
    }>;
    date: string;
    duration: number;
    sharedWith?: string[];
    isGroupSession?: boolean;
    pendingAcceptance?: string[];
}) {
    const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(workout),
    });

    if (!response.ok) {
        if (response.status === 401) {
            window.location.href = '/auth/signin';
            throw new Error('Unauthorized');
        }
        throw new Error('Failed to create workout');
    }

    return response.json();
}

export async function deleteWorkout(id: string) {
    const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        if (response.status === 401) {
            window.location.href = '/auth/signin';
            throw new Error('Unauthorized');
        }
        throw new Error('Failed to delete workout');
    }

    return response.json();
}

