import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// POST accept friend or gym partner request
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { requestId } = body;

        if (!requestId) {
            return NextResponse.json(
                { error: 'Request ID is required' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const friendRequestsCollection = db.collection(COLLECTIONS.FRIEND_REQUESTS);
        const friendshipsCollection = db.collection(COLLECTIONS.FRIENDSHIPS);
        const notificationsCollection = db.collection(COLLECTIONS.NOTIFICATIONS);
        const usersCollection = db.collection(COLLECTIONS.USERS);

        // Find the friend request
        const friendRequest = await friendRequestsCollection.findOne({
            _id: new ObjectId(requestId),
            toUserId: session.user.id, // Ensure user can only accept requests sent to them
            status: 'pending',
        });

        if (!friendRequest) {
            return NextResponse.json(
                { error: 'Request not found or already processed' },
                { status: 404 }
            );
        }

        // Update request status
        await friendRequestsCollection.updateOne(
            { _id: new ObjectId(requestId) },
            {
                $set: {
                    status: 'accepted',
                    updatedAt: new Date(),
                },
            }
        );

        // Create friendship
        const friendship = {
            userId1: friendRequest.fromUserId,
            userId2: friendRequest.toUserId,
            type: friendRequest.type,
            createdAt: new Date(),
        };

        await friendshipsCollection.insertOne(friendship);

        // Get current user username
        const currentUser = await usersCollection.findOne({ _id: new ObjectId(session.user.id) });
        const currentUsername = currentUser?.username || 'User';

        // Create notification for the requester
        const notification = {
            userId: friendRequest.fromUserId,
            type: 'gym_partner_accepted' as const,
            fromUserId: session.user.id,
            fromUsername: currentUsername,
            read: false,
            createdAt: new Date(),
        };

        await notificationsCollection.insertOne(notification);

        return NextResponse.json({ success: true, message: 'Request accepted!' });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        return NextResponse.json(
            { error: 'Failed to accept request' },
            { status: 500 }
        );
    }
}

