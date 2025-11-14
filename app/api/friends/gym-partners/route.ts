import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// GET gym partners for the authenticated user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const friendshipsCollection = db.collection(COLLECTIONS.FRIENDSHIPS);
        const usersCollection = db.collection(COLLECTIONS.USERS);

        // Find all gym partner relationships
        const friendships = await friendshipsCollection
            .find({
                type: 'gym_partner',
                $or: [
                    { userId1: session.user.id },
                    { userId2: session.user.id },
                ],
            })
            .toArray();

        // Get partner user IDs
        const partnerIds = friendships.map(f => 
            f.userId1 === session.user!.id ? f.userId2 : f.userId1
        );

        if (partnerIds.length === 0) {
            return NextResponse.json([]);
        }

        // Get partner user details
        const partners = await usersCollection
            .find({
                _id: { $in: partnerIds.map(id => new ObjectId(id)) },
            })
            .toArray();

        const formattedPartners = partners.map((partner: any) => ({
            id: partner._id.toString(),
            username: partner.username,
            avatar: partner.avatar || null,
        }));

        return NextResponse.json(formattedPartners);
    } catch (error) {
        console.error('Error fetching gym partners:', error);
        return NextResponse.json(
            { error: 'Failed to fetch gym partners' },
            { status: 500 }
        );
    }
}

