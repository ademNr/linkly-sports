import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// GET pending friend/gym partner requests for the authenticated user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const friendRequestsCollection = db.collection(COLLECTIONS.FRIEND_REQUESTS);
        const usersCollection = db.collection(COLLECTIONS.USERS);

        // Find all pending requests sent to the current user
        const requests = await friendRequestsCollection
            .find({
                toUserId: session.user.id,
                status: 'pending',
            })
            .sort({ createdAt: -1 })
            .toArray();

        // Get sender user details
        const senderIds = requests.map(r => r.fromUserId);
        if (senderIds.length === 0) {
            return NextResponse.json([]);
        }

        const senders = await usersCollection
            .find({
                _id: { $in: senderIds.map(id => new ObjectId(id)) },
            })
            .toArray();

        const senderMap = new Map(senders.map((s: any) => [s._id.toString(), s.username]));

        const formattedRequests = requests.map((req: any) => ({
            id: req._id.toString(),
            fromUserId: req.fromUserId,
            fromUsername: senderMap.get(req.fromUserId) || 'Unknown',
            type: req.type,
            createdAt: req.createdAt.toISOString(),
        }));

        return NextResponse.json(formattedRequests);
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch friend requests' },
            { status: 500 }
        );
    }
}

