import './globals.css';
import type { Metadata } from 'next';
import SessionProvider from '@/components/providers/SessionProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Linkly - Workout Logger',
  description: 'Track. Share. Inspire. Your fitness journey starts here.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <SessionProvider>{children}</SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}