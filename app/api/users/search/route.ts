import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// GET search users by username
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';

        if (!query || query.trim().length < 2) {
            return NextResponse.json([]);
        }

        const db = await getDb();
        const usersCollection = db.collection(COLLECTIONS.USERS);

        // Search users by username (case-insensitive), excluding current user
        const users = await usersCollection
            .find({
                username: { $regex: query, $options: 'i' },
                _id: { $ne: new ObjectId(session.user.id) }, // Exclude current user
            })
            .limit(20)
            .toArray();

        const formattedUsers = users.map((user: any) => ({
            id: user._id.toString(),
            username: user.username,
            avatar: user.avatar || null,
            lastMuscleGroup: user.lastMuscleGroup || null,
            lastWorkoutDate: user.lastWorkoutDate?.toISOString() || null,
            totalSets: user.totalSets || 0,
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error('Error searching users:', error);
        return NextResponse.json(
            { error: 'Failed to search users' },
            { status: 500 }
        );
    }
}

