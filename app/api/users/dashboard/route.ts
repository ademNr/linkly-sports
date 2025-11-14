import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// GET users dashboard sorted by total sets
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = parseInt(searchParams.get('skip') || '0');

        const db = await getDb();
        const usersCollection = db.collection(COLLECTIONS.USERS);

        // Get users sorted by total sets (descending), excluding current user
        const users = await usersCollection
            .find({
                _id: { $ne: new ObjectId(session.user.id) }, // Exclude current user
                totalSets: { $exists: true, $gt: 0 }, // Only users with sets
            })
            .sort({ totalSets: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const formattedUsers = users.map((user: any) => ({
            id: user._id.toString(),
            username: user.username,
            avatar: user.avatar || null,
            lastMuscleGroup: user.lastMuscleGroup || null,
            lastWorkoutDate: user.lastWorkoutDate?.toISOString() || null,
            lastWorkoutDuration: user.lastWorkoutDuration || 0,
            totalSets: user.totalSets || 0,
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching users dashboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users dashboard' },
            { status: 500 }
        );
    }
}

