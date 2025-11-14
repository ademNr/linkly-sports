import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// GET list of friends and gym partners for the authenticated user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const friendshipsCollection = db.collection(COLLECTIONS.FRIENDSHIPS);
        const usersCollection = db.collection(COLLECTIONS.USERS);

        // Find all friendships for the user
        const friendships = await friendshipsCollection
            .find({
                $or: [
                    { userId1: session.user.id },
                    { userId2: session.user.id },
                ],
            })
            .toArray();

        // Get friend user IDs
        const friendIds = friendships.map(f =>
            f.userId1 === session.user!.id ? f.userId2 : f.userId1
        );

        if (friendIds.length === 0) {
            return NextResponse.json([]);
        }

        // Get friend user details
        const friends = await usersCollection
            .find({
                _id: { $in: friendIds.map(id => new ObjectId(id)) },
            })
            .toArray();

        // Map friendships to include type
        const friendshipMap = new Map(
            friendships.map(f => [
                f.userId1 === session.user!.id ? f.userId2 : f.userId1,
                f.type
            ])
        );

        const formattedFriends = friends.map((friend: any) => ({
            id: friend._id.toString(),
            username: friend.username,
            type: friendshipMap.get(friend._id.toString()) || 'gym_partner',
            lastMuscleGroup: friend.lastMuscleGroup || null,
            lastWorkoutDate: friend.lastWorkoutDate?.toISOString() || null,
            totalSets: friend.totalSets || 0,
        }));

        return NextResponse.json(formattedFriends);
    } catch (error) {
        console.error('Error fetching friends:', error);
        return NextResponse.json(
            { error: 'Failed to fetch friends' },
            { status: 500 }
        );
    }
}

