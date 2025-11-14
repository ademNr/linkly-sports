import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// GET all notifications for the authenticated user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();
        const notificationsCollection = db.collection(COLLECTIONS.NOTIFICATIONS);
        const workoutsCollection = db.collection(COLLECTIONS.WORKOUTS);

        const notifications = await notificationsCollection
            .find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        // Check if group session requests have been accepted
        const formattedNotifications = await Promise.all(
            notifications.map(async (notif: any) => {
                let accepted = false;
                
                // For group_session_request, check if the workout has been accepted
                if (notif.type === 'group_session_request' && notif.workoutId) {
                    try {
                        const workout = await workoutsCollection.findOne({
                            _id: new ObjectId(notif.workoutId),
                        });
                        
                        if (workout && workout.acceptedBy) {
                            accepted = workout.acceptedBy.includes(session.user!.id);
                        }
                    } catch (error) {
                        console.error('Error checking workout acceptance:', error);
                    }
                }

                return {
                    id: notif._id.toString(),
                    type: notif.type,
                    fromUserId: notif.fromUserId,
                    fromUsername: notif.fromUsername,
                    workoutId: notif.workoutId || null,
                    read: notif.read,
                    accepted: accepted,
                    createdAt: notif.createdAt.toISOString(),
                };
            })
        );

        return NextResponse.json(formattedNotifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// PATCH mark notification as read
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { notificationId } = body;

        if (!notificationId) {
            return NextResponse.json(
                { error: 'Notification ID is required' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const notificationsCollection = db.collection(COLLECTIONS.NOTIFICATIONS);

        await notificationsCollection.updateOne(
            {
                _id: new ObjectId(notificationId),
                userId: session.user.id, // Ensure user can only mark their own notifications
            },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark notification as read' },
            { status: 500 }
        );
    }
}

