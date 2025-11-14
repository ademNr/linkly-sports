'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WorkoutSession } from '@/types';
import Navigation from '@/components/layout/Navigation';
import { Plus, Users, TrendingUp, Clock, Dumbbell, Bell, Search, X, Calendar, Flame } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Avatar from '@/components/Avatar';

interface ActiveUser {
  id: string;
  username: string;
  avatar?: string | null;
  lastMuscleGroup: string;
  lastWorkoutDate: string | null;
  lastWorkoutDuration: number;
  totalSets: number;
}

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState('home');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ActiveUser[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [stats, setStats] = useState({ streak: 0, totalWorkouts: 0, thisWeekCount: 0 });

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const { fetchWorkouts } = await import('@/lib/api');
        const data = await fetchWorkouts();
        setSessions(data);
      } catch (error) {
        console.error('Error loading workouts:', error);
      }
    };
    loadSessions();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    const loadActiveUsers = async () => {
      try {
        const response = await fetch('/api/users/active');
        if (response.ok) {
          const data = await response.json();
          setActiveUsers(data);
        }
      } catch (error) {
        console.error('Error loading active users:', error);
      }
    };
    loadActiveUsers();
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          const unread = data.filter((n: any) => !n.read).length;
          setUnreadNotifications(unread);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
            setShowSearch(true);
          }
        } catch (error) {
          console.error('Error searching users:', error);
        }
      } else {
        setSearchResults([]);
        setShowSearch(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    // Update currentPage based on pathname
    if (pathname === '/') {
      setCurrentPage('home');
    }
  }, [pathname]);

  const handleNavigate = (page: string) => {
    if (page === 'workout') router.push('/workout');
    else if (page === 'history') router.push('/history');
    else if (page === 'profile') router.push('/profile');
    else if (page === 'notifications') router.push('/notifications');
    else if (page === 'home') router.push('/');
    else setCurrentPage(page);
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

  return (
    <div className="min-h-screen bg-white">
      <div className="pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 pt-12 pb-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Linkly</h1>
                <p className="text-sm text-gray-500">Track. Share. Inspire.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push('/history')}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <TrendingUp className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={() => router.push('/notifications')}
                  className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Bell className="h-5 w-5 text-gray-700" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Dumbbell className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalWorkouts}</div>
                <div className="text-xs text-gray-500 font-medium">Total</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.thisWeekCount}</div>
                <div className="text-xs text-gray-500 font-medium">This Week</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Flame className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.streak}</div>
                <div className="text-xs text-gray-500 font-medium">Streak 🔥</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 pt-6">
          {/* User Search */}
          <div className="mb-6 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearch(false);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {showSearch && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      router.push(`/users/${user.id}`);
                      setSearchQuery('');
                      setShowSearch(false);
                    }}
                    className="w-full p-4 hover:bg-gray-50 flex items-center space-x-3 text-left border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{user.username}</h3>
                      {user.lastMuscleGroup && (
                        <p className="text-xs text-gray-500 truncate">{user.lastMuscleGroup}</p>
                      )}
                    </div>
                    <Dumbbell className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action */}
          <button
            onClick={() => router.push('/workout')}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-3 transition-all active:scale-95 mb-6"
          >
            <Plus className="h-5 w-5" />
            <span>Start New Workout</span>
          </button>

          {/* Active Users */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Active Users</h2>
              <button
                onClick={() => router.push('/users')}
                className="text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
              >
                Show All →
              </button>
            </div>
            <div className="space-y-2">
              {activeUsers.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-gray-500">No active users found</p>
                </div>
              ) : (
                activeUsers.slice(0, 5).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => router.push(`/users/${user.id}`)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition-all text-left shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar username={user.username} avatar={user.avatar} size="md" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">{user.username}</h3>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Dumbbell className="h-3 w-3" />
                            <span>{user.lastMuscleGroup}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(user.lastWorkoutDuration)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 flex-shrink-0">
                        {formatTimeAgo(user.lastWorkoutDate)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}