import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// GET user statistics for a specific user
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
        const workoutsCollection = db.collection(COLLECTIONS.WORKOUTS);
        const usersCollection = db.collection(COLLECTIONS.USERS);

        // Get all user workouts
        const workouts = await workoutsCollection
            .find({ userId: userId })
            .sort({ date: -1 })
            .toArray();

        // Calculate streak
        let streak = 0;
        if (workouts.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let checkDate = new Date(today);
            let foundWorkout = false;

            // Check if there's a workout today
            const todayWorkout = workouts.find((w: any) => {
                const workoutDate = new Date(w.date);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() === checkDate.getTime();
            });

            if (todayWorkout) {
                streak = 1;
                foundWorkout = true;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                checkDate.setDate(checkDate.getDate() - 1);
            }

            // Continue checking previous days
            while (true) {
                const dayWorkouts = workouts.filter((w: any) => {
                    const workoutDate = new Date(w.date);
                    workoutDate.setHours(0, 0, 0, 0);
                    return workoutDate.getTime() === checkDate.getTime();
                });

                if (dayWorkouts.length > 0) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        // Get user stats
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        
        // Calculate this week workouts
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisWeekCount = workouts.filter((w: any) => {
            const workoutDate = new Date(w.date);
            return workoutDate >= weekAgo;
        }).length;

        // Calculate total time spent
        const totalMinutes = workouts.reduce((sum: number, w: any) => sum + (w.duration || 0), 0);
        const totalHours = Math.floor(totalMinutes / 60);

        return NextResponse.json({
            streak,
            totalWorkouts: workouts.length,
            thisWeekCount,
            totalSets: user?.totalSets || 0,
            totalHours,
            totalMinutes,
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user stats' },
            { status: 500 }
        );
    }
}

