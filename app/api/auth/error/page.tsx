'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Please check your environment variables (NEXTAUTH_SECRET, MONGODB_URI).';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'CredentialsSignin':
        return 'Invalid username or password. Please try again.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600">{getErrorMessage(error)}</p>
        </div>

        {error === 'Configuration' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">
              Required Environment Variables:
            </h3>
            <div className="text-sm text-yellow-800 space-y-3">
              <p className="font-semibold mb-2">Make sure these are set in your .env.local file:</p>
              <ul className="space-y-1 list-disc list-inside mb-3">
                <li>MONGODB_URI</li>
                <li>NEXTAUTH_SECRET</li>
                <li>NEXTAUTH_URL</li>
              </ul>
              <div className="bg-yellow-100 p-3 rounded border border-yellow-300">
                <p className="font-semibold mb-2">Troubleshooting Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Check that `.env.local` is in the root directory (same level as `package.json`)</li>
                  <li>Verify there are NO spaces around the `=` sign in `.env.local`</li>
                  <li><Link href="/api/test-env" className="text-blue-600 underline">Check if environment variables are loaded</Link></li>
                  <li><strong>Restart your dev server</strong> (stop with Ctrl+C, then run `pnpm dev` again)</li>
                  <li>Environment variables are only loaded when the server starts!</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {error === 'CredentialsSignin' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Invalid Credentials</h3>
            <p className="text-sm text-blue-800 mb-3">
              The username or password you entered is incorrect. Please check your credentials and try again.
            </p>
            <p className="text-xs text-blue-700">
              Don&apos;t have an account? <Link href="/auth/signup" className="underline font-semibold">Sign up here</Link>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/api/test-env"
            className="block w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 font-semibold py-3 rounded-2xl text-center transition-colors"
          >
            Check Environment Variables
          </Link>
          <Link
            href="/auth/signin"
            className="block w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-2xl text-center transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 animate-pulse">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
