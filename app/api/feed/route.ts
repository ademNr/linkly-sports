import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// GET public feed of shared workouts to inspire the community
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const workoutsCollection = db.collection(COLLECTIONS.WORKOUTS);
        const usersCollection = db.collection(COLLECTIONS.USERS);

        // Find only group/dual workouts (workouts that have sharedWith array with at least one user)
        // This creates an inspiring feed of community group workouts
        const sharedWorkouts = await workoutsCollection
            .find({
                sharedWith: { $exists: true, $ne: [] }, // Only workouts that have been shared (group/dual)
            })
            .sort({ date: -1 }) // Most recent first
            .limit(50) // Limit to 50 most recent shared workouts
            .toArray();

        // Get all user IDs to fetch usernames
        const allUserIds = new Set<string>();
        sharedWorkouts.forEach((workout: any) => {
            allUserIds.add(workout.userId);
            if (workout.sharedWith) {
                workout.sharedWith.forEach((id: string) => allUserIds.add(id));
            }
        });

        // Fetch usernames
        const users = await usersCollection
            .find({ _id: { $in: Array.from(allUserIds).map(id => new ObjectId(id)) } })
            .toArray();
        const userMap = new Map(users.map((u: any) => [u._id.toString(), u.username]));

        // Format workouts for feed
        const feedWorkouts = sharedWorkouts.map((workout: any) => {
            const ownerUsername = userMap.get(workout.userId) || 'Unknown';
            const sharedUsernames = workout.sharedWith
                ? workout.sharedWith.map((id: string) => userMap.get(id) || 'Unknown')
                : [];

            return {
                id: workout._id.toString(),
                name: workout.name,
                type: workout.type,
                date: workout.date.toISOString(),
                duration: workout.duration,
                userId: workout.userId,
                ownerUsername: ownerUsername,
                sharedWith: workout.sharedWith || [],
                sharedUsernames: sharedUsernames,
                isShared: true,
                exercises: (workout.exercises || []).map((exercise: any) => ({
                    id: exercise._id || exercise.id || new ObjectId().toString(),
                    name: exercise.name,
                    muscleGroup: exercise.muscleGroup || '',
                    setsCompleted: exercise.sets?.length || exercise.setsCompleted || 0,
                })),
                createdAt: workout.createdAt.toISOString(),
            };
        });

        return NextResponse.json(feedWorkouts);
    } catch (error) {
        console.error('Error fetching feed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch feed' },
            { status: 500 }
        );
    }
}

