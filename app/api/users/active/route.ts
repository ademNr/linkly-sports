import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// GET active users (users who have logged workouts recently)
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const usersCollection = db.collection(COLLECTIONS.USERS);

        // Find users with recent workouts (within last 7 days), sorted by last workout date
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeUsers = await usersCollection
            .find({
                lastWorkoutDate: { $gte: sevenDaysAgo },
                _id: { $ne: new ObjectId(session.user.id) }, // Exclude current user
            })
            .sort({ lastWorkoutDate: -1 })
            .limit(10)
            .toArray();

        const formattedUsers = activeUsers.map((user: any) => ({
            id: user._id.toString(),
            username: user.username,
            avatar: user.avatar || null,
            lastMuscleGroup: user.lastMuscleGroup || 'N/A',
            lastWorkoutDate: user.lastWorkoutDate?.toISOString() || null,
            lastWorkoutDuration: user.lastWorkoutDuration || 0,
            totalSets: user.totalSets || 0,
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching active users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch active users' },
            { status: 500 }
        );
    }
}

