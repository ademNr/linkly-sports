'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Navigation from '@/components/layout/Navigation';
import { Calendar, Dumbbell, ArrowLeft, Settings, Bell, Lock, LogOut, Users, Flame, TrendingUp, Clock, Activity, Camera, X, Award, Target, Zap, BarChart3 } from 'lucide-react';
import { WorkoutSession } from '@/types';

export default function ProfilePage() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState('profile');
    const [totalWorkouts, setTotalWorkouts] = useState(0);
    const [lastExercise, setLastExercise] = useState<string | null>(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [stats, setStats] = useState({ streak: 0, totalSets: 0, thisWeekCount: 0, totalHours: 0 });
    const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([]);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Get username from session
    const username = session?.user?.name || session?.user?.email || 'User';

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const { fetchWorkouts } = await import('@/lib/api');
                const workouts = await fetchWorkouts();
                setTotalWorkouts(workouts.length);
                setRecentWorkouts(workouts.slice(0, 5)); // Get 5 most recent
                
                // Get last exercise from most recent workout
                if (workouts.length > 0) {
                    const mostRecentWorkout = workouts[0]; // Already sorted by date
                    if (mostRecentWorkout.exercises && mostRecentWorkout.exercises.length > 0) {
                        const lastEx = mostRecentWorkout.exercises[0];
                        setLastExercise(lastEx.name);
                    }
                }

                // Load avatar
                if (session?.user?.id) {
                    const response = await fetch(`/api/users/avatar?userId=${session.user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.avatar) {
                            setAvatar(data.avatar);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };
        if (session?.user?.id) {
            loadUserData();
        }
    }, [session, username]);

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
        // Update currentPage based on pathname
        if (pathname === '/profile') {
            setCurrentPage('profile');
        }
    }, [pathname]);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/auth/signin' });
    };

    const handleNavigate = (page: string) => {
        if (page === 'home') router.push('/');
        else if (page === 'workout') router.push('/workout');
        else if (page === 'history') router.push('/history');
        else if (page === 'profile') router.push('/profile');
        else if (page === 'notifications') router.push('/notifications');
        else setCurrentPage(page);
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Validate file size (max 500KB)
        if (file.size > 500 * 1024) {
            alert('Image size must be less than 500KB');
            return;
        }

        setUploading(true);

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                
                // Upload to server
                const response = await fetch('/api/users/avatar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ avatar: base64String }),
                });

                if (response.ok) {
                    setAvatar(base64String);
                    setShowAvatarModal(false);
                } else {
                    const error = await response.json();
                    alert(error.error || 'Failed to update avatar');
                }
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload avatar');
            setUploading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        // Check if user has a custom avatar (not generated)
        const hasCustomAvatar = avatar && avatar.startsWith('data:image/') && !avatar.includes('svg+xml');
        
        if (hasCustomAvatar && !confirm('Remove your custom avatar? A unique generated avatar will be used instead.')) {
            return;
        }

        setUploading(true);
        try {
            const response = await fetch('/api/users/avatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ avatar: null }),
            });

            if (response.ok) {
                // Remove avatar
                setAvatar(null);
                setShowAvatarModal(false);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update avatar');
            }
        } catch (error) {
            console.error('Error removing avatar:', error);
            alert('Failed to update avatar');
        } finally {
            setUploading(false);
        }
    };

    // Use avatar if exists, otherwise null (will show initial)
    const displayAvatar = avatar;

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
                        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                    </div>

                    {/* Enhanced Profile Header */}
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-6 mb-6 shadow-sm">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-4 flex-1">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gray-900 rounded-full overflow-hidden shadow-xl flex items-center justify-center ring-4 ring-white">
                                        {displayAvatar ? (
                                            <img 
                                                src={displayAvatar} 
                                                alt={username}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-4xl font-bold text-white">
                                                {username.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setShowAvatarModal(true)}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-all shadow-lg hover:scale-110 active:scale-95"
                                        aria-label="Change profile picture"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1 truncate">{username}</h3>
                                    <p className="text-sm text-gray-500 mb-2">Track. Share. Inspire.</p>
                                    <div className="flex items-center space-x-3">
                                        {stats.streak > 0 && (
                                            <div className="flex items-center space-x-1 bg-orange-100 px-2.5 py-1 rounded-full">
                                                <Flame className="h-3.5 w-3.5 text-orange-600" />
                                                <span className="text-xs font-semibold text-orange-700">{stats.streak} day streak</span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                                            <Award className="h-3.5 w-3.5" />
                                            <span>{totalWorkouts} workouts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Stats Section */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
                        <div className="flex items-center justify-between mb-5">
                            <h4 className="text-lg font-bold text-gray-900">Your Stats</h4>
                            <BarChart3 className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                                        <Flame className="h-5 w-5 text-orange-600" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.streak}</div>
                                <div className="text-xs font-medium text-gray-600">Day Streak 🔥</div>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <Dumbbell className="h-5 w-5 text-gray-700" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalSets}</div>
                                <div className="text-xs font-medium text-gray-600">Total Sets</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.thisWeekCount}</div>
                                <div className="text-xs font-medium text-gray-600">This Week</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl p-4 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalHours}</div>
                                <div className="text-xs font-medium text-gray-600">Total Hours</div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-gray-900">{totalWorkouts}</div>
                                    <div className="text-xs text-gray-500 mt-1">Total Workouts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-gray-900">{stats.totalMinutes || 0}</div>
                                    <div className="text-xs text-gray-500 mt-1">Total Minutes</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Recent Workouts */}
                    {recentWorkouts.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5 text-gray-600" />
                                    <h4 className="text-lg font-bold text-gray-900">Recent Workouts</h4>
                                </div>
                                <button
                                    onClick={() => router.push('/history')}
                                    className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                >
                                    View All →
                                </button>
                            </div>
                            <div className="space-y-3">
                                {recentWorkouts.map((workout) => {
                                    const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.setsCompleted, 0);
                                    const workoutDate = new Date(workout.date);
                                    const isToday = workoutDate.toDateString() === new Date().toDateString();
                                    const isYesterday = workoutDate.toDateString() === new Date(Date.now() - 86400000).toDateString();
                                    
                                    return (
                                        <button
                                            key={workout.id}
                                            onClick={() => router.push('/history')}
                                            className="w-full text-left bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm transition-all active:scale-[0.98]"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Dumbbell className="h-4 w-4 text-white" />
                                                        </div>
                                                        <h5 className="font-bold text-gray-900 truncate">{workout.name}</h5>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-600 ml-10">
                                                        <span className="flex items-center space-x-1.5">
                                                            <Activity className="h-3.5 w-3.5" />
                                                            <span className="font-medium">{workout.exercises.length} exercises</span>
                                                        </span>
                                                        <span className="flex items-center space-x-1.5">
                                                            <Target className="h-3.5 w-3.5" />
                                                            <span className="font-medium">{totalSets} sets</span>
                                                        </span>
                                                        {workout.duration > 0 && (
                                                            <span className="flex items-center space-x-1.5">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                <span className="font-medium">{Math.floor(workout.duration / 60)}h {workout.duration % 60}m</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-xs font-medium text-gray-500 ml-3 flex-shrink-0">
                                                    {isToday ? (
                                                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">Today</span>
                                                    ) : isYesterday ? (
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">Yesterday</span>
                                                    ) : (
                                                        workoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Enhanced Settings */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center space-x-2 mb-5">
                            <Settings className="h-5 w-5 text-gray-600" />
                            <h4 className="text-lg font-bold text-gray-900">Settings & Actions</h4>
                        </div>
                        <div className="space-y-2">
                            <button 
                                onClick={() => router.push('/workout?group=true')}
                                className="w-full text-left py-4 px-4 hover:bg-gray-50 rounded-xl transition-all text-gray-900 flex items-center justify-between group active:scale-[0.98]"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                                        <Dumbbell className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Start Group Session</div>
                                        <div className="text-xs text-gray-500">Workout with friends</div>
                                    </div>
                                </div>
                                <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
                            </button>
                            <button 
                                onClick={() => router.push('/friends')}
                                className="w-full text-left py-4 px-4 hover:bg-gray-50 rounded-xl transition-all text-gray-900 flex items-center justify-between group active:scale-[0.98]"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Gym Partners</div>
                                        <div className="text-xs text-gray-500">View your partners</div>
                                    </div>
                                </div>
                                <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
                            </button>
                            <button 
                                onClick={() => router.push('/notifications')}
                                className="w-full text-left py-4 px-4 hover:bg-gray-50 rounded-xl transition-all text-gray-900 flex items-center justify-between group active:scale-[0.98]"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors relative">
                                        <Bell className="h-5 w-5 text-white" />
                                        {unreadNotifications > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Notifications</div>
                                        <div className="text-xs text-gray-500">
                                            {unreadNotifications > 0 ? `${unreadNotifications} unread` : 'No new notifications'}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
                            </button>
                            <div className="h-px bg-gray-200 my-3"></div>
                            <button 
                                onClick={handleSignOut}
                                className="w-full text-left py-4 px-4 hover:bg-red-50 rounded-xl transition-all text-red-600 flex items-center justify-between group active:scale-[0.98]"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                        <LogOut className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-red-600">Log Out</div>
                                        <div className="text-xs text-red-400">Sign out of your account</div>
                                    </div>
                                </div>
                                <span className="text-red-400 group-hover:text-red-600 transition-colors">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Avatar Change Modal */}
            {showAvatarModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 pb-24">
                    <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Change Profile Picture</h3>
                                <button
                                    onClick={() => setShowAvatarModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 pb-8">
                            {/* Current Avatar Preview */}
                            <div className="flex justify-center mb-6">
                                <div className="w-32 h-32 bg-gray-900 rounded-full overflow-hidden shadow-lg flex items-center justify-center">
                                    {displayAvatar ? (
                                        <img 
                                            src={displayAvatar} 
                                            alt={username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-5xl font-bold text-white">
                                            {username.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Upload Button */}
                            <label className="block w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl text-center transition-colors cursor-pointer mb-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    disabled={uploading}
                                />
                                {uploading ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        <span>Uploading...</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center space-x-2">
                                        <Camera className="h-5 w-5" />
                                        <span>Upload Profile Picture</span>
                                    </span>
                                )}
                            </label>

                            {/* Remove Avatar Button */}
                            {displayAvatar && (
                                <button
                                    onClick={handleRemoveAvatar}
                                    className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 rounded-xl transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    disabled={uploading}
                                >
                                    <X className="h-5 w-5" />
                                    <span>Remove Avatar</span>
                                </button>
                            )}

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
                                <p className="text-xs text-gray-600 text-center">
                                    <strong>Tip:</strong> Upload a profile picture to personalize your profile. If you don't upload one, your initial will be displayed.
                                </p>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Maximum file size: 500KB. Supported formats: JPG, PNG, GIF
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        </div>
    );
}
