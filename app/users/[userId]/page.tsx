'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/layout/Navigation';
import { ArrowLeft, Dumbbell, Clock, Flame, Calendar, Activity, Target, BarChart3, Award, Users as UsersIcon } from 'lucide-react';
import { getUserAvatarUrl } from '@/lib/avatar';

interface UserProfile {
  id: string;
  username: string;
  avatar?: string | null;
  lastMuscleGroup: string | null;
  lastWorkoutDate: string | null;
  lastWorkoutDuration: number;
  totalSets: number;
  lastWorkout: {
    id: string;
    name: string;
    type: string;
    date: string;
    duration: number;
    exercises: Array<{
      id: string;
      name: string;
      muscleGroup: string;
      setsCompleted: number;
    }>;
  } | null;
  friendshipType: 'friend' | 'gym_partner' | null;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const userId = params?.userId as string;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState({ streak: 0, totalWorkouts: 0, thisWeekCount: 0, totalSets: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      // If user is viewing their own profile, redirect to /profile
      if (session?.user?.id === userId) {
        router.push('/profile');
        return;
      }
      loadUserProfile();
    }
  }, [userId, session?.user?.id, router]);

  const loadUserProfile = async () => {
    try {
      const [profileResponse, statsResponse] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/users/${userId}/stats`)
      ]);
      
      if (profileResponse.ok) {
        const data = await profileResponse.json();
        setUserProfile(data);
      }
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
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

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes === 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">User not found</h3>
          <p className="text-gray-500 mb-6">The user you're looking for doesn't exist</p>
          <button
            onClick={() => router.back()}
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === userId;

  return (
    <div className="min-h-screen bg-white">
      <div className="pb-24 pt-8 px-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
          </div>

          {/* Enhanced Profile Header */}
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-6 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-24 h-24 bg-gray-900 rounded-full overflow-hidden shadow-xl flex items-center justify-center ring-4 ring-white">
                  {(() => {
                    const avatarUrl = getUserAvatarUrl({ username: userProfile.username, avatar: userProfile.avatar });
                    return avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={userProfile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-white">
                        {userProfile.username.charAt(0).toUpperCase()}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1 truncate">{userProfile.username}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {userProfile.friendshipType === 'gym_partner' ? '🏋️ Gym Partner' : '👤 User'}
                  </p>
                  <div className="flex items-center space-x-3">
                    {userStats.streak > 0 && (
                      <div className="flex items-center space-x-1 bg-orange-100 px-2.5 py-1 rounded-full">
                        <Flame className="h-3.5 w-3.5 text-orange-600" />
                        <span className="text-xs font-semibold text-orange-700">{userStats.streak} day streak</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Award className="h-3.5 w-3.5" />
                      <span>{userStats.totalWorkouts} workouts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-lg font-bold text-gray-900">Statistics</h4>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                    <Flame className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.streak}</div>
                <div className="text-xs font-medium text-gray-600">Day Streak 🔥</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Dumbbell className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.totalSets}</div>
                <div className="text-xs font-medium text-gray-600">Total Sets</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.thisWeekCount}</div>
                <div className="text-xs font-medium text-gray-600">This Week</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.totalHours}</div>
                <div className="text-xs font-medium text-gray-600">Total Hours</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{userStats.totalWorkouts}</div>
                  <div className="text-xs text-gray-500 mt-1">Total Workouts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{userProfile.lastMuscleGroup || 'N/A'}</div>
                  <div className="text-xs text-gray-500 mt-1">Last Muscle Group</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          {!isOwnProfile && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-4">
              <button
                onClick={() => router.push(`/workout?partner=${userId}`)}
                className="w-full flex items-center justify-center space-x-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all active:scale-95 shadow-lg"
              >
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <span className="text-base">Start Session Together</span>
              </button>
            </div>
          )}

          {/* Enhanced Last Workout */}
          {userProfile.lastWorkout && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
              <div className="flex items-center space-x-2 mb-5">
                <Activity className="h-5 w-5 text-gray-600" />
                <h4 className="text-lg font-bold text-gray-900">Last Workout</h4>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 mb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-900 text-lg mb-1 truncate">{userProfile.lastWorkout.name}</h5>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatTimeAgo(userProfile.lastWorkout.date)}</span>
                      </span>
                      {userProfile.lastWorkout.duration > 0 && (
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDuration(userProfile.lastWorkout.duration)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Exercises ({userProfile.lastWorkout.exercises.length}):</p>
                  <div className="grid grid-cols-1 gap-2">
                    {userProfile.lastWorkout.exercises.map((exercise) => (
                      <div key={exercise.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{exercise.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">{exercise.setsCompleted} sets</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Activity Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-5">
              <Activity className="h-5 w-5 text-gray-600" />
              <h4 className="text-lg font-bold text-gray-900">Activity Summary</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Last Workout</div>
                    <div className="font-semibold text-gray-900">{formatTimeAgo(userProfile.lastWorkoutDate)}</div>
                  </div>
                </div>
              </div>
              {userProfile.lastMuscleGroup && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Last Muscle Group</div>
                      <div className="font-semibold text-gray-900">{userProfile.lastMuscleGroup}</div>
                    </div>
                  </div>
                </div>
              )}
              {userProfile.lastWorkoutDuration > 0 && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Last Workout Duration</div>
                      <div className="font-semibold text-gray-900">{formatDuration(userProfile.lastWorkoutDuration)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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

