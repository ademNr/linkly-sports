import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Check if authentication is working
export async function GET() {
  try {
    const session = await auth();
    
    return NextResponse.json({
      authenticated: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      userName: session?.user?.name || null,
      error: null,
    });
  } catch (error: any) {
    return NextResponse.json({
      authenticated: false,
      hasUser: false,
      userId: null,
      userEmail: null,
      userName: null,
      error: error?.message || 'Unknown error',
    }, { status: 500 });
  }
}

