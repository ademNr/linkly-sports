import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';
import type { Exercise } from '@/types';

// GET all workout sessions for the authenticated user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const workoutsCollection = db.collection(COLLECTIONS.WORKOUTS);

        // Find all workouts for the user (owned, shared, or pending acceptance), sorted by date (newest first)
        const workouts = await workoutsCollection
            .find({
                $or: [
                    { userId: session.user.id },
                    { sharedWith: session.user.id },
                    { pendingAcceptance: session.user.id },
                ],
            })
            .sort({ date: -1 })
            .toArray();

        // Get usernames for shared workouts
        const usersCollection = db.collection(COLLECTIONS.USERS);
        const allUserIds = new Set<string>();
        workouts.forEach((workout: any) => {
            allUserIds.add(workout.userId);
            if (workout.sharedWith) {
                workout.sharedWith.forEach((id: string) => allUserIds.add(id));
            }
        });

        const users = await usersCollection
            .find({ _id: { $in: Array.from(allUserIds).map(id => new ObjectId(id)) } })
            .toArray();
        const userMap = new Map(users.map((u: any) => [u._id.toString(), u.username]));

        // Convert MongoDB documents to JSON format
        const workoutsWithExercises = workouts.map((workout: any) => {
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
                exercises: (workout.exercises || []).map((exercise: any) => ({
                    id: exercise._id || exercise.id || new ObjectId().toString(),
                    name: exercise.name,
                    muscleGroup: exercise.muscleGroup || '',
                    setsCompleted: exercise.sets?.length || exercise.setsCompleted || 0,
                })),
                createdAt: workout.createdAt.toISOString(),
                updatedAt: workout.updatedAt.toISOString(),
            };
        });

        return NextResponse.json(workoutsWithExercises);
    } catch (error) {
        console.error('Error fetching workouts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch workouts' },
            { status: 500 }
        );
    }
}

// POST a new workout session
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Extract userId after verification to help TypeScript
        const userId = session.user.id;

        const body = await request.json();
        const { name, type, exercises: workoutExercises, date, duration } = body;

        if (!name || !type || !workoutExercises || !Array.isArray(workoutExercises)) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const workoutsCollection = db.collection(COLLECTIONS.WORKOUTS);

        const workoutDate = date ? new Date(date) : new Date();
        const now = new Date();

        // Convert exercises to MongoDB format
        const exercises = workoutExercises.map((exercise: Exercise) => {
            // Create sets array based on setsCompleted
            const setsCount = exercise.setsCompleted || 0;
            const sets = Array.from({ length: setsCount }, (_, index) => {
                const set: any = {
                    _id: new ObjectId().toString(),
                    setNumber: index + 1,
                };
                // Only include optional fields if they have values
                // For now, we just create empty sets that can be filled later
                return set;
            });

            return {
                _id: new ObjectId().toString(),
                name: exercise.name,
                muscleGroup: exercise.muscleGroup || '',
                sets: sets,
                createdAt: now,
            };
        });

        // Check if this is a group session requiring acceptance
        const { isGroupSession, pendingAcceptance } = body;
        const requiresAcceptance = isGroupSession && pendingAcceptance && Array.isArray(pendingAcceptance) && pendingAcceptance.length > 0;

        // Create workout session
        const workout: any = {
            userId: userId,
            name,
            type,
            date: workoutDate,
            duration: duration || 0,
            exercises,
            createdAt: now,
            updatedAt: now,
        };

        if (requiresAcceptance) {
            workout.isGroupSession = true;
            workout.pendingAcceptance = pendingAcceptance;
            workout.acceptedBy = [userId]; // Creator auto-accepts
        }

        const result = await workoutsCollection.insertOne(workout);

        // Update user activity stats
        const usersCollection = db.collection(COLLECTIONS.USERS);
        const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
        const lastMuscleGroup = exercises.length > 0 ? exercises[0].muscleGroup : undefined;

        // Get user's current totalSets to calculate properly
        const currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
        const currentTotalSets = currentUser?.totalSets || 0;

        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    lastWorkoutDate: workoutDate,
                    lastMuscleGroup: lastMuscleGroup,
                    lastWorkoutDuration: duration || 0,
                    totalSets: currentTotalSets + totalSets,
                    updatedAt: now,
                },
            }
        );

        // Handle shared workouts if sharedWith is provided
        const { sharedWith } = body;
        if (sharedWith && Array.isArray(sharedWith) && sharedWith.length > 0) {
            const notificationsCollection = db.collection(COLLECTIONS.NOTIFICATIONS);
            const usersCollection = db.collection(COLLECTIONS.USERS);
            const friendshipsCollection = db.collection(COLLECTIONS.FRIENDSHIPS);
            
            // Get creator username
            const creator = await usersCollection.findOne({ _id: new ObjectId(userId) });
            const creatorUsername = creator?.username || 'User';

            // Create gym partner relationships automatically for all shared users
            for (const sharedUserId of sharedWith) {
                // Check if friendship already exists
                const existingFriendship = await friendshipsCollection.findOne({
                    $or: [
                        { userId1: userId, userId2: sharedUserId },
                        { userId1: sharedUserId, userId2: userId },
                    ],
                });

                if (!existingFriendship) {
                    // Create gym partner relationship
                    await friendshipsCollection.insertOne({
                        userId1: userId,
                        userId2: sharedUserId,
                        type: 'gym_partner',
                        createdAt: now,
                    });
                } else if (existingFriendship.type !== 'gym_partner') {
                    // Update existing friendship to gym_partner
                    await friendshipsCollection.updateOne(
                        { _id: existingFriendship._id },
                        { $set: { type: 'gym_partner' } }
                    );
                }
            }

            if (requiresAcceptance) {
                // Send notifications for group session acceptance
                const groupSessionNotifications = pendingAcceptance.map((pendingUserId: string) => ({
                    userId: pendingUserId,
                    type: 'group_session_request' as const,
                    fromUserId: userId,
                    fromUsername: creatorUsername,
                    workoutId: result.insertedId.toString(),
                    read: false,
                    createdAt: now,
                }));
                await notificationsCollection.insertMany(groupSessionNotifications);
            } else {
                // Regular shared workout notifications
                const sharedWorkoutNotifications = sharedWith.map((sharedUserId: string) => ({
                    userId: sharedUserId,
                    type: 'shared_workout' as const,
                    fromUserId: userId,
                    fromUsername: creatorUsername,
                    workoutId: result.insertedId.toString(),
                    read: false,
                    createdAt: now,
                }));
                await notificationsCollection.insertMany(sharedWorkoutNotifications);

                // Also add the workout to shared users' workout lists
                await workoutsCollection.updateOne(
                    { _id: result.insertedId },
                    { $set: { sharedWith: sharedWith } }
                );
            }
        }

        // Return the created workout with normalized exercises
        const createdWorkout = {
            id: result.insertedId.toString(),
            name: workout.name,
            type: workout.type,
            date: workout.date.toISOString(),
            duration: workout.duration,
            exercises: workout.exercises.map((exercise: any) => ({
                id: exercise._id || exercise.id || new ObjectId().toString(),
                name: exercise.name,
                muscleGroup: exercise.muscleGroup || '',
                setsCompleted: exercise.sets?.length || 0,
            })),
            createdAt: workout.createdAt.toISOString(),
            updatedAt: workout.updatedAt.toISOString(),
        };

        return NextResponse.json(createdWorkout, { status: 201 });
    } catch (error) {
        console.error('Error creating workout:', error);
        return NextResponse.json(
            { error: 'Failed to create workout' },
            { status: 500 }
        );
    }
}
