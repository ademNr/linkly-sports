'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
    const router = useRouter();
    
    useEffect(() => {
        // Redirect to history page (unified page that shows all workouts)
        router.replace('/history');
    }, [router]);
    
    return null;
}
