import { NextResponse } from 'next/server';

// Route to check if environment variables are loaded
export async function GET() {
  const mongodbUri = process.env.MONGODB_URI?.trim();
  const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim();
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();

  const envCheck = {
    status: 'ok',
    variables: {
      MONGODB_URI: {
        exists: !!mongodbUri,
        length: mongodbUri?.length || 0,
        preview: mongodbUri ? `${mongodbUri.substring(0, 30)}...` : 'missing',
        isValid: mongodbUri?.startsWith('mongodb') || false,
      },
      NEXTAUTH_SECRET: {
        exists: !!nextAuthSecret,
        length: nextAuthSecret?.length || 0,
        preview: nextAuthSecret ? '***' : 'missing',
      },
      NEXTAUTH_URL: {
        exists: !!nextAuthUrl,
        value: nextAuthUrl || 'missing',
      },
    },
    allPresent: !!(mongodbUri && nextAuthSecret && nextAuthUrl),
    missing: [
      !mongodbUri && 'MONGODB_URI',
      !nextAuthSecret && 'NEXTAUTH_SECRET',
      !nextAuthUrl && 'NEXTAUTH_URL',
    ].filter(Boolean) as string[],
  };

  return NextResponse.json(envCheck, { status: envCheck.allPresent ? 200 : 500 });
}
