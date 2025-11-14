import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// DELETE a workout session
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const workoutId = id;

        // Validate ObjectId format
        if (!ObjectId.isValid(workoutId)) {
            return NextResponse.json(
                { error: 'Invalid workout ID' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const workoutsCollection = db.collection(COLLECTIONS.WORKOUTS);

        // Verify the workout belongs to the user and delete it
        const result = await workoutsCollection.deleteOne({
            _id: new ObjectId(workoutId),
            userId: session.user.id,
        });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Workout not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Workout deleted successfully' });
    } catch (error) {
        console.error('Error deleting workout:', error);
        return NextResponse.json(
            { error: 'Failed to delete workout' },
            { status: 500 }
        );
    }
}
