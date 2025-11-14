'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import { ArrowLeft, Search, Dumbbell, Clock, Users } from 'lucide-react';
import Avatar from '@/components/Avatar';

interface DashboardUser {
  id: string;
  username: string;
  avatar?: string | null;
  lastMuscleGroup: string | null;
  lastWorkoutDate: string | null;
  lastWorkoutDuration: number;
  totalSets: number;
}

export default function UsersDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendships, setFriendships] = useState<Map<string, 'friend' | 'gym_partner'>>(new Map());

  useEffect(() => {
    loadUsers();
    loadFriendships();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users/dashboard?limit=50');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const loadFriendships = async () => {
    try {
      const response = await fetch('/api/friends/list');
      if (response.ok) {
        const friends = await response.json();
        const friendshipMap = new Map<string, 'friend' | 'gym_partner'>();
        friends.forEach((friend: any) => {
          friendshipMap.set(friend.id, friend.type);
        });
        setFriendships(friendshipMap);
      }
    } catch (error) {
      console.error('Error loading friendships:', error);
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

  const displayUsers = searchQuery.trim().length >= 2 ? searchResults : users;

  return (
    <div className="min-h-screen bg-white">
      <div className="pb-24 pt-8 px-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.push('/')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Users Dashboard</h2>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Users List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : displayUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => router.push(`/users/${user.id}`)}
                      className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </button>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => router.push(`/users/${user.id}`)}
                    >
                      <h3 className="font-semibold text-gray-900 truncate mb-1">{user.username}</h3>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Dumbbell className="h-3 w-3" />
                          <span>{user.lastMuscleGroup || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(user.lastWorkoutDuration)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          <span>{user.totalSets} sets</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-xs text-gray-400">
                        {formatTimeAgo(user.lastWorkoutDate)}
                      </div>
                      <button
                        onClick={() => router.push(`/workout?partner=${user.id}`)}
                        className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-all active:scale-95"
                      >
                        <Dumbbell className="h-3 w-3" />
                        <span>Session</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navigation currentPage="home" onNavigate={(page) => {
        if (page === 'home') router.push('/');
        else if (page === 'workout') router.push('/workout');
        else if (page === 'history') router.push('/history');
        else if (page === 'profile') router.push('/profile');
        else if (page === 'notifications') router.push('/notifications');
      }} />
    </div>
  );
}

