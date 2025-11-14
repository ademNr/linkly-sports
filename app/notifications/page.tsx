'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/layout/Navigation';
import { ArrowLeft, Bell, UserPlus, Users, Dumbbell, Check } from 'lucide-react';

interface Notification {
  id: string;
  type: 'gym_partner_request' | 'gym_partner_accepted' | 'shared_workout' | 'group_session_request';
  fromUserId: string;
  fromUsername: string;
  workoutId?: string;
  read: boolean;
  accepted?: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    if (pathname === '/notifications') {
      setCurrentPage('notifications');
    }
  }, [pathname]);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const handleAcceptRequest = async (notification: Notification) => {
    if (accepting) return;
    setAccepting(notification.id);
    try {
      // Get the actual request ID from the friend requests
      const requestsResponse = await fetch('/api/friends/requests');
      if (!requestsResponse.ok) {
        throw new Error('Failed to fetch requests');
      }
      const requests = await requestsResponse.json();
      const request = requests.find((r: any) => r.fromUserId === notification.fromUserId);
      
      if (!request) {
        alert('Request not found');
        setAccepting(null);
        return;
      }

      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request.id }),
      });
      if (response.ok) {
        // Mark notification as read immediately
        await markAsRead(notification.id);
        // Update local state to remove the button
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, read: true, type: 'gym_partner_accepted' as const } : n
        ));
        // Reload notifications to get updated state
        await loadNotifications();
        // Redirect to user profile
        router.push(`/users/${notification.fromUserId}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to accept request');
        setAccepting(null);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
      setAccepting(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'gym_partner_request':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'gym_partner_accepted':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'shared_workout':
      case 'group_session_request':
        return <Dumbbell className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'gym_partner_request':
        return `${notification.fromUsername} wants to be your gym partner`;
      case 'gym_partner_accepted':
        return `${notification.fromUsername} accepted your gym partner request`;
      case 'shared_workout':
        return `${notification.fromUsername} shared a workout with you`;
      case 'group_session_request':
        return `${notification.fromUsername} wants to log a group workout session with you`;
      default:
        return 'New notification';
    }
  };

  const formatTimeAgo = (dateString: string) => {
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

  const handleNotificationClick = async (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.type === 'shared_workout' && notification.workoutId) {
      router.push(`/history?workout=${notification.workoutId}`);
    } else if (notification.type === 'group_session_request' && notification.workoutId) {
      // Show accept/reject dialog
      const accept = confirm(`${notification.fromUsername} wants to log a group workout session with you. Accept?`);
      if (accept) {
        try {
          const response = await fetch('/api/workouts/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workoutId: notification.workoutId }),
          });
          if (response.ok) {
            alert('Group session accepted!');
            loadNotifications();
            router.push('/history');
          } else {
            const error = await response.json();
            alert(error.error || 'Failed to accept session');
          }
        } catch (error) {
          console.error('Error accepting session:', error);
          alert('Failed to accept session');
        }
      }
    } else if (notification.type === 'gym_partner_request') {
      router.push(`/users/${notification.fromUserId}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="pb-24 pt-8 px-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            </div>
            {unreadCount > 0 && (
              <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white border rounded-xl p-4 shadow-sm ${
                    notification.read ? 'border-gray-200' : 'border-orange-300 bg-orange-50/50'
                  } cursor-pointer hover:shadow-md transition-all`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                  {notification.type === 'gym_partner_request' && !notification.read && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptRequest(notification);
                        }}
                        disabled={accepting === notification.id}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {accepting === notification.id ? 'Accepting...' : 'Accept'}
                      </button>
                    </div>
                  )}
                  {notification.type === 'group_session_request' && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!notification.workoutId || notification.accepted) return;
                          setAccepting(notification.id);
                          try {
                            const response = await fetch('/api/workouts/accept', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ workoutId: notification.workoutId }),
                            });
                            if (response.ok) {
                              // Mark notification as read immediately
                              await markAsRead(notification.id);
                              // Update local state to show accepted
                              setNotifications(notifications.map(n => 
                                n.id === notification.id ? { ...n, read: true, accepted: true } : n
                              ));
                              // Reload notifications to get updated state
                              await loadNotifications();
                              // Redirect to history
                              router.push('/history');
                            } else {
                              const error = await response.json();
                              alert(error.error || 'Failed to accept session');
                              setAccepting(null);
                            }
                          } catch (error) {
                            console.error('Error accepting session:', error);
                            alert('Failed to accept session');
                            setAccepting(null);
                          }
                        }}
                        disabled={accepting === notification.id || notification.accepted}
                        className={`flex-1 text-sm font-medium py-2 px-4 rounded-lg transition-all ${
                          notification.accepted
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {accepting === notification.id 
                          ? 'Accepting...' 
                          : notification.accepted 
                          ? 'Session Accepted ✓' 
                          : 'Accept Session'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navigation currentPage={currentPage} onNavigate={(page) => {
        if (page === 'home') router.push('/');
        else if (page === 'workout') router.push('/workout');
        else if (page === 'history') router.push('/history');
        else if (page === 'profile') router.push('/profile');
        else if (page === 'notifications') router.push('/notifications');
      }} />
    </div>
  );
}

