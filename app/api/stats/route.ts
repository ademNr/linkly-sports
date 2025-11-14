import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// GET user statistics including streak
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const workoutsCollection = db.collection(COLLECTIONS.WORKOUTS);
        const usersCollection = db.collection(COLLECTIONS.USERS);

        // Get all user workouts
        const workouts = await workoutsCollection
            .find({ userId: session.user.id })
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
                // If no workout today, start from yesterday
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
                    // If we started checking from today and found today's workout, 
                    // but no workout yesterday, streak is 1
                    // Otherwise, streak is broken
                    break;
                }
            }
        }

        // Get user stats
        const user = await usersCollection.findOne({ _id: new ObjectId(session.user.id) });
        
        // Calculate this week workouts
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisWeekCount = workouts.filter((w: any) => {
            const workoutDate = new Date(w.date);
            return workoutDate >= weekAgo;
        }).length;

        // Calculate this month workouts
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const thisMonthCount = workouts.filter((w: any) => {
            const workoutDate = new Date(w.date);
            return workoutDate >= monthAgo;
        }).length;

        // Calculate total time spent
        const totalMinutes = workouts.reduce((sum: number, w: any) => sum + (w.duration || 0), 0);
        const totalHours = Math.floor(totalMinutes / 60);

        return NextResponse.json({
            streak,
            totalWorkouts: workouts.length,
            thisWeekCount,
            thisMonthCount,
            totalSets: user?.totalSets || 0,
            totalHours,
            totalMinutes,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}

