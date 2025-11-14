import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db-schema';
import { ObjectId } from 'mongodb';

// GET user avatar
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    const db = await getDb();
    const usersCollection = db.collection(COLLECTIONS.USERS);

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      avatar: user.avatar || null,
      username: user.username 
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch avatar' },
      { status: 500 }
    );
  }
}

// POST/UPDATE user avatar
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { avatar } = body; // Expecting base64 data URL

    if (!avatar || typeof avatar !== 'string') {
      return NextResponse.json(
        { error: 'Avatar data is required' },
        { status: 400 }
      );
    }

    // Validate that it's a data URL
    if (!avatar.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format. Please upload a valid image.' },
        { status: 400 }
      );
    }

    // Limit size (max 500KB for base64)
    if (avatar.length > 700000) { // ~500KB base64 encoded
      return NextResponse.json(
        { error: 'Image is too large. Maximum size is 500KB.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection(COLLECTIONS.USERS);

    // Update user avatar
    await usersCollection.updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        $set: { 
          avatar: avatar,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Avatar updated successfully' 
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'Failed to update avatar' },
      { status: 500 }
    );
  }
}

