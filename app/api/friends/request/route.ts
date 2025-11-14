import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// POST send friend or gym partner request
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, type } = body; // type: 'gym_partner' only

        if (!userId || !type) {
            return NextResponse.json(
                { error: 'User ID and type are required' },
                { status: 400 }
            );
        }

        if (type !== 'gym_partner') {
            return NextResponse.json(
                { error: 'Only gym partner requests are allowed' },
                { status: 400 }
            );
        }

        if (userId === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot send request to yourself' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const usersCollection = db.collection(COLLECTIONS.USERS);
        const friendRequestsCollection = db.collection(COLLECTIONS.FRIEND_REQUESTS);
        const notificationsCollection = db.collection(COLLECTIONS.NOTIFICATIONS);

        // Verify target user exists
        const targetUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if request already exists
        const existingRequest = await friendRequestsCollection.findOne({
            fromUserId: session.user.id,
            toUserId: userId,
            status: 'pending',
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: 'Request already sent' },
                { status: 400 }
            );
        }

        // Get sender username
        const sender = await usersCollection.findOne({ _id: new ObjectId(session.user.id) });
        const senderUsername = sender?.username || 'User';

        // Create friend request
        const now = new Date();
        const friendRequest = {
            fromUserId: session.user.id,
            toUserId: userId,
            type: type,
            status: 'pending' as const,
            createdAt: now,
            updatedAt: now,
        };

        await friendRequestsCollection.insertOne(friendRequest);

        // Create notification
        const notification = {
            userId: userId,
            type: 'gym_partner_request' as const,
            fromUserId: session.user.id,
            fromUsername: senderUsername,
            read: false,
            createdAt: now,
        };

        await notificationsCollection.insertOne(notification);

        return NextResponse.json({ success: true, message: 'Request sent!' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        return NextResponse.json(
            { error: 'Failed to send request' },
            { status: 500 }
        );
    }
}

