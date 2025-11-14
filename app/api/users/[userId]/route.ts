import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// GET user profile by userId
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await params;
        const db = await getDb();
        const usersCollection = db.collection(COLLECTIONS.USERS);
        const workoutsCollection = db.collection(COLLECTIONS.WORKOUTS);

        // Get user info
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get user's last workout
        const lastWorkout = await workoutsCollection
            .findOne(
                { userId: userId },
                { sort: { date: -1 } }
            );

        // Get friendship status
        const friendshipsCollection = db.collection(COLLECTIONS.FRIENDSHIPS);
        const friendship = await friendshipsCollection.findOne({
            $or: [
                { userId1: session.user.id, userId2: userId },
                { userId1: userId, userId2: session.user.id },
            ],
        });

        const formattedUser = {
            id: user._id.toString(),
            username: user.username,
            avatar: user.avatar || null,
            lastMuscleGroup: user.lastMuscleGroup || null,
            lastWorkoutDate: user.lastWorkoutDate?.toISOString() || null,
            lastWorkoutDuration: user.lastWorkoutDuration || 0,
            totalSets: user.totalSets || 0,
            lastWorkout: lastWorkout ? {
                id: lastWorkout._id.toString(),
                name: lastWorkout.name,
                type: lastWorkout.type,
                date: lastWorkout.date.toISOString(),
                duration: lastWorkout.duration,
                exercises: (lastWorkout.exercises || []).map((exercise: any) => ({
                    id: exercise._id || exercise.id || new ObjectId().toString(),
                    name: exercise.name,
                    muscleGroup: exercise.muscleGroup || '',
                    setsCompleted: exercise.sets?.length || 0,
                })),
            } : null,
            friendshipType: friendship?.type || null,
        };

        return NextResponse.json(formattedUser);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user profile' },
            { status: 500 }
        );
    }
}

