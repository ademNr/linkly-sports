'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/layout/Navigation';
import { ArrowLeft, Users, Dumbbell } from 'lucide-react';

interface GymPartner {
  id: string;
  username: string;
  type: 'gym_partner';
  lastMuscleGroup: string | null;
  lastWorkoutDate: string | null;
  totalSets: number;
}

export default function FriendsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [gymPartners, setGymPartners] = useState<GymPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGymPartners();
  }, []);

  const loadGymPartners = async () => {
    try {
      const response = await fetch('/api/friends/list');
      if (response.ok) {
        const data = await response.json();
        // Filter to only show gym partners
        setGymPartners(data.filter((f: any) => f.type === 'gym_partner'));
      }
    } catch (error) {
      console.error('Error loading gym partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="pb-24 pt-8 px-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.push('/profile')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Gym Partners</h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : gymPartners.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No gym partners yet</p>
              <p className="text-sm text-gray-400 mt-2">Become gym partners with someone to start sessions together!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {gymPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                      {partner.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate mb-1">{partner.username}</h4>
                      <div className="flex items-center space-x-3">
                        {partner.lastMuscleGroup && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Dumbbell className="h-3 w-3" />
                            <span>{partner.lastMuscleGroup}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {formatTimeAgo(partner.lastWorkoutDate)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/workout?partner=${partner.id}`)}
                      className="flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-xl transition-all active:scale-95"
                    >
                      <Dumbbell className="h-4 w-4" />
                      <span>Session</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navigation currentPage="profile" onNavigate={(page) => {
        if (page === 'home') router.push('/');
        else if (page === 'workout') router.push('/workout');
        else if (page === 'history') router.push('/history');
        else if (page === 'profile') router.push('/profile');
        else if (page === 'notifications') router.push('/notifications');
      }} />
    </div>
  );
}

