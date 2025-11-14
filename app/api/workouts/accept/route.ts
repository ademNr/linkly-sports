import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// POST accept a group workout session
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { workoutId } = body;

        if (!workoutId) {
            return NextResponse.json(
                { error: 'Workout ID is required' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const workoutsCollection = db.collection(COLLECTIONS.WORKOUTS);
        const usersCollection = db.collection(COLLECTIONS.USERS);

        // Find the workout
        const workout = await workoutsCollection.findOne({
            _id: new ObjectId(workoutId),
            pendingAcceptance: session.user!.id, // User must be in pending acceptance list
        });

        if (!workout) {
            return NextResponse.json(
                { error: 'Workout not found or already accepted' },
                { status: 404 }
            );
        }

        // Update workout: remove from pending, add to accepted, add to sharedWith
        const updatedPending = (workout.pendingAcceptance || []).filter(
            (id: string) => id !== session.user!.id
        );
        const updatedAccepted = [...(workout.acceptedBy || []), session.user!.id];
        const updatedSharedWith = [...(workout.sharedWith || []), session.user!.id];

        await workoutsCollection.updateOne(
            { _id: new ObjectId(workoutId) },
            {
                $set: {
                    pendingAcceptance: updatedPending,
                    acceptedBy: updatedAccepted,
                    sharedWith: updatedSharedWith,
                    updatedAt: new Date(),
                },
            }
        );

        // Create gym partner relationship automatically if it doesn't exist
        const friendshipsCollection = db.collection(COLLECTIONS.FRIENDSHIPS);
        const existingFriendship = await friendshipsCollection.findOne({
            $or: [
                { userId1: session.user!.id, userId2: workout.userId },
                { userId1: workout.userId, userId2: session.user!.id },
            ],
        });

        if (!existingFriendship) {
            // Create gym partner relationship
            await friendshipsCollection.insertOne({
                userId1: session.user!.id,
                userId2: workout.userId,
                type: 'gym_partner',
                createdAt: new Date(),
            });
        } else if (existingFriendship.type !== 'gym_partner') {
            // Update existing friendship to gym_partner
            await friendshipsCollection.updateOne(
                { _id: existingFriendship._id },
                { $set: { type: 'gym_partner' } }
            );
        }

        // Update user stats for the accepting user
        const totalSets = (workout.exercises || []).reduce(
            (sum: number, ex: any) => sum + (ex.sets?.length || 0),
            0
        );
        const lastMuscleGroup = workout.exercises?.length > 0 ? workout.exercises[0].muscleGroup : undefined;

        const currentUser = await usersCollection.findOne({ _id: new ObjectId(session.user!.id) });
        const currentTotalSets = currentUser?.totalSets || 0;

        await usersCollection.updateOne(
            { _id: new ObjectId(session.user!.id) },
            {
                $set: {
                    lastWorkoutDate: workout.date,
                    lastMuscleGroup: lastMuscleGroup,
                    lastWorkoutDuration: workout.duration || 0,
                    totalSets: currentTotalSets + totalSets,
                    updatedAt: new Date(),
                },
            }
        );

        // If all users have accepted, mark as complete
        if (updatedPending.length === 0) {
            await workoutsCollection.updateOne(
                { _id: new ObjectId(workoutId) },
                {
                    $unset: { pendingAcceptance: '' },
                }
            );
        }

        return NextResponse.json({ success: true, message: 'Workout session accepted!' });
    } catch (error) {
        console.error('Error accepting workout session:', error);
        return NextResponse.json(
            { error: 'Failed to accept workout session' },
            { status: 500 }
        );
    }
}

