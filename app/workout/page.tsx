'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WorkoutType, Exercise, WorkoutSession } from '@/types';
import { WORKOUT_TYPES, getExerciseNamesByMuscleGroups } from '@/lib/workoutData';
import Navigation from '@/components/layout/Navigation';
import { ArrowLeft, Plus, Check, Dumbbell, Trash2, Clock, X, Users, Search, Edit2, Copy } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { getUserAvatarUrl } from '@/lib/avatar';

interface GymPartner {
  id: string;
  username: string;
  avatar?: string | null;
}

function WorkoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const { toasts, showError, removeToast } = useToast();
    const [currentPage, setCurrentPage] = useState('workout');
    const [selectedWorkoutType, setSelectedWorkoutType] = useState<WorkoutType | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [workoutName, setWorkoutName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [showDurationModal, setShowDurationModal] = useState(false);
    const [durationHours, setDurationHours] = useState(0);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [gymPartners, setGymPartners] = useState<GymPartner[]>([]);
    const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
    const [selectedUsersInfo, setSelectedUsersInfo] = useState<GymPartner[]>([]); // Store full user info
    const [isGroupSession, setIsGroupSession] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<GymPartner[]>([]);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        const partnerParam = searchParams?.get('partner');
        const groupParam = searchParams?.get('group');
        if (partnerParam) {
            setIsGroupSession(true);
            setSelectedPartners([partnerParam]);
            // We'll fetch the user info when gym partners load
        } else if (groupParam === 'true') {
            setIsGroupSession(true);
        }
    }, [searchParams]);

    useEffect(() => {
        loadGymPartners();
    }, []);

    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.trim().length >= 2) {
                try {
                    const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
                    if (response.ok) {
                        const data = await response.json();
                        setSearchResults(data.map((u: any) => ({ id: u.id, username: u.username })));
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

    const handleNavigate = (page: string) => {
        if (page === 'home') router.push('/');
        else if (page === 'workout') router.push('/workout');
        else if (page === 'history') router.push('/history');
        else if (page === 'profile') router.push('/profile');
        else if (page === 'notifications') router.push('/notifications');
        else setCurrentPage(page);
    };

    const handleWorkoutTypeSelect = (type: WorkoutType) => {
        setSelectedWorkoutType(type);
        setWorkoutName(type.name);
        setExercises([]);
        setDurationHours(0);
        setDurationMinutes(0);
    };

    const addExercise = () => {
        const newEx: Exercise = {
            id: Math.random().toString(36).substring(2, 9),
            name: '',
            muscleGroup: selectedWorkoutType?.muscleGroups[0] || '',
            setsCompleted: 3
        };
        setExercises([...exercises, newEx]);
    };

    const updateExercise = (id: string, updates: Partial<Exercise>) => {
        setExercises(exercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
    };

    const removeExercise = (id: string) => {
        setExercises(exercises.filter(ex => ex.id !== id));
    };

    const duplicateExercise = (id: string) => {
        const exerciseToCopy = exercises.find(ex => ex.id === id);
        if (exerciseToCopy) {
            const newExercise: Exercise = {
                id: Math.random().toString(36).substring(2, 9),
                name: exerciseToCopy.name,
                muscleGroup: exerciseToCopy.muscleGroup,
                setsCompleted: exerciseToCopy.setsCompleted
            };
            const index = exercises.findIndex(ex => ex.id === id);
            setExercises([
                ...exercises.slice(0, index + 1),
                newExercise,
                ...exercises.slice(index + 1)
            ]);
        }
    };

    // Get filtered exercises based on selected workout type
    const availableExercises = useMemo(() => {
        if (!selectedWorkoutType || !selectedWorkoutType.muscleGroups) {
            return [];
        }
        return getExerciseNamesByMuscleGroups(selectedWorkoutType.muscleGroups).sort();
    }, [selectedWorkoutType]);

    const handleSaveClick = async () => {
        if (exercises.length === 0) {
            showError('Add at least one exercise');
            return;
        }
        if (exercises.some(ex => !ex.name.trim())) {
            showError('Name all exercises');
            return;
        }
        // Load gym partners
        await loadGymPartners();
        // Show duration modal
        setShowDurationModal(true);
    };

    const loadGymPartners = async () => {
        try {
            const response = await fetch('/api/friends/gym-partners');
            if (response.ok) {
                const data = await response.json();
                setGymPartners(data);
                
                // Update selectedUsersInfo if we have a partner from URL
                const partnerParam = searchParams?.get('partner');
                if (partnerParam && selectedPartners.includes(partnerParam)) {
                    const partnerInfo = data.find((p: GymPartner) => p.id === partnerParam);
                    if (partnerInfo) {
                        setSelectedUsersInfo([partnerInfo]);
                    } else {
                        // Fetch user info if not in gym partners
                        fetchUserInfo(partnerParam);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading gym partners:', error);
        }
    };

    const fetchUserInfo = async (userId: string) => {
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
                const user = await response.json();
                const userInfo: GymPartner = { id: user.id, username: user.username, avatar: user.avatar || null };
                setSelectedUsersInfo(prev => {
                    if (!prev.find(u => u.id === userId)) {
                        return [...prev, userInfo];
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const addUserToSession = (userId: string, username: string, avatar?: string | null) => {
        if (!selectedPartners.includes(userId)) {
            setSelectedPartners([...selectedPartners, userId]);
            const userInfo: GymPartner = { id: userId, username, avatar: avatar || null };
            setSelectedUsersInfo(prev => [...prev, userInfo]);
        }
        setSearchQuery('');
        setShowSearch(false);
    };

    const removeUserFromSession = (userId: string) => {
        setSelectedPartners(selectedPartners.filter(id => id !== userId));
        setSelectedUsersInfo(selectedUsersInfo.filter(u => u.id !== userId));
    };

    const saveWorkout = async () => {
        try {
            // Calculate total duration in minutes
            const totalMinutes = durationHours * 60 + durationMinutes;
            
            const session = {
                name: workoutName,
                type: selectedWorkoutType!.id,
                exercises: exercises.map(ex => ({
                    name: ex.name,
                    muscleGroup: ex.muscleGroup,
                    setsCompleted: ex.setsCompleted
                })),
                date: new Date().toISOString(),
                duration: totalMinutes || 0,
                sharedWith: selectedPartners.length > 0 ? selectedPartners : undefined,
                isGroupSession: isGroupSession && selectedPartners.length > 0,
                pendingAcceptance: isGroupSession && selectedPartners.length > 0 ? selectedPartners : undefined
            };

            // Save to database via API
            const { createWorkout } = await import('@/lib/api');
            await createWorkout(session);

            setShowDurationModal(false);
            router.push('/history');
        } catch (error) {
            console.error('Error saving workout:', error);
            showError('Failed to save workout. Please try again.');
        }
    };

    // Workout Type Selection Screen
    if (!selectedWorkoutType) {
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
                            <h2 className="text-2xl font-bold text-gray-900">Choose Workout Type</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {WORKOUT_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => handleWorkoutTypeSelect(type)}
                                    className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:border-gray-300 hover:shadow-md transition-all active:scale-95"
                                >
                                    <div className="text-4xl mb-3">{type.emoji}</div>
                                    <div className="font-bold text-gray-900 mb-1">{type.name}</div>
                                    <div className="text-xs text-gray-500">{type.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
            </div>
        );
    }

    // Workout Logging Screen
    return (
        <div className="min-h-screen bg-white">
            <div className="pb-32">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-md mx-auto px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                <button
                                    onClick={() => setSelectedWorkoutType(null)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
                                >
                                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                <div className="min-w-0 flex-1">
                                    {isEditingName ? (
                                        <input
                                            type="text"
                                            value={workoutName}
                                            onChange={(e) => setWorkoutName(e.target.value)}
                                            onBlur={() => setIsEditingName(false)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    setIsEditingName(false);
                                                }
                                            }}
                                            className="text-lg sm:text-xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-900 focus:outline-none w-full"
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{workoutName}</h1>
                                            <button
                                                onClick={() => setIsEditingName(true)}
                                                className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                                aria-label="Edit workout name"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-xs sm:text-sm text-gray-500">Log your workout</p>
                                </div>
                            </div>
                            <div className="bg-gray-100 px-2.5 sm:px-3 py-1 rounded-full flex-shrink-0">
                                <span className="text-xs sm:text-sm font-medium text-gray-700">{exercises.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exercises */}
                <div className="max-w-md mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    {exercises.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-white border border-gray-200 rounded-2xl p-8">
                                <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Your First Exercise</h3>
                                <p className="text-gray-500 mb-6">Start building your workout</p>
                                <button
                                    onClick={addExercise}
                                    className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl inline-flex items-center space-x-2 transition-all active:scale-95"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>Add Exercise</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 mb-6">
                            {exercises.map((ex, idx) => (
                                <div key={ex.id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-4 gap-3">
                                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs sm:text-sm font-bold text-white">{idx + 1}</span>
                                            </div>
                                            <select
                                                value={ex.name}
                                                onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                                                className="flex-1 min-w-0 bg-gray-50 font-semibold text-sm sm:text-base p-2.5 sm:p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                            >
                                                <option value="">Select exercise</option>
                                                {availableExercises.map((name, index) => (
                                                    <option key={`${name}-${index}`} value={name}>{name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => duplicateExercise(ex.id)}
                                                className="p-2.5 sm:p-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex-shrink-0"
                                                aria-label="Duplicate exercise"
                                                title="Duplicate exercise"
                                            >
                                                <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </button>
                                            <button
                                                onClick={() => removeExercise(ex.id)}
                                                className="p-2.5 sm:p-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex-shrink-0"
                                                aria-label="Remove exercise"
                                            >
                                                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Sets completed</label>
                                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => updateExercise(ex.id, { setsCompleted: num })}
                                                    className={`py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all active:scale-95 ${ex.setsCompleted === num
                                                        ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <span className="text-xs sm:text-sm font-semibold">{num}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Fixed Buttons */}
                <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 py-3 sm:py-4 px-4 sm:px-6 z-40 shadow-lg">
                    <div className="max-w-md mx-auto flex space-x-2 sm:space-x-3">
                        <button
                            onClick={addExercise}
                            className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-semibold py-3 sm:py-4 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 text-sm sm:text-base"
                        >
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">Add Exercise</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                        <button
                            onClick={handleSaveClick}
                            disabled={exercises.length === 0}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold py-3 sm:py-4 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">Save Workout</span>
                            <span className="sm:hidden">Save</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Duration Input Modal */}
            {showDurationModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 pb-24">
                    <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
                        {/* Header - Sticky */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Workout Duration</h3>
                                    <p className="text-sm text-gray-500 mt-1">How long did your workout take?</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDurationModal(false);
                                        setDurationHours(0);
                                        setDurationMinutes(0);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 pb-8 space-y-4">
                            {/* Hours Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Hours</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[0, 1, 2, 3].map(hour => (
                                        <button
                                            key={hour}
                                            onClick={() => setDurationHours(hour)}
                                            className={`py-3 rounded-xl border-2 transition-all active:scale-95 ${
                                                durationHours === hour
                                                    ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <span className="text-sm font-semibold">{hour}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Minutes Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Minutes</label>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(min => (
                                        <button
                                            key={min}
                                            onClick={() => setDurationMinutes(min)}
                                            className={`py-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                                                durationMinutes === min
                                                    ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <span className="text-xs sm:text-sm font-semibold">{min}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Display Total Duration */}
                            {(durationHours > 0 || durationMinutes > 0) && (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center justify-center space-x-2">
                                        <Clock className="h-5 w-5 text-gray-600" />
                                        <span className="text-gray-900 font-semibold text-base">
                                            {durationHours > 0 && `${durationHours}h `}
                                            {durationMinutes > 0 && `${durationMinutes}m`}
                                            {durationHours === 0 && durationMinutes === 0 && '0m'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Group Session - Add Users */}
                            {isGroupSession && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Add Users to Session
                                    </label>
                                    
                                    {/* Search Input */}
                                    <div className="relative mb-3">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users by username..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        />
                                        {showSearch && searchResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                                                {searchResults
                                                    .filter(user => !selectedPartners.includes(user.id))
                                                    .map((user) => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => addUserToSession(user.id, user.username, user.avatar)}
                                                            className="w-full p-3 hover:bg-gray-50 flex items-center space-x-2 text-left border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="w-8 h-8 bg-gray-900 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                                                                {getUserAvatarUrl({ username: user.username, avatar: user.avatar }) ? (
                                                                    <img 
                                                                        src={getUserAvatarUrl({ username: user.username, avatar: user.avatar })!} 
                                                                        alt={user.username}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-xs font-bold text-white">
                                                                        {user.username.charAt(0).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-sm text-gray-700">{user.username}</span>
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Users */}
                                    {selectedPartners.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-500 mb-2">Selected users ({selectedPartners.length}):</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUsersInfo.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5"
                                                    >
                                                        <div className="w-6 h-6 bg-gray-900 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                                                            {getUserAvatarUrl({ username: user.username, avatar: user.avatar }) ? (
                                                                <img 
                                                                    src={getUserAvatarUrl({ username: user.username, avatar: user.avatar })!} 
                                                                    alt={user.username}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-white">
                                                                    {user.username.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-700">{user.username}</span>
                                                        <button
                                                            onClick={() => removeUserFromSession(user.id)}
                                                            className="text-gray-500 hover:text-red-500"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Share with Gym Partners (for non-group sessions) */}
                            {!isGroupSession && gymPartners.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Share with Gym Partners (optional)
                                    </label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {gymPartners.map((partner) => (
                                            <label
                                                key={partner.id}
                                                className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPartners.includes(partner.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedPartners([...selectedPartners, partner.id]);
                                                        } else {
                                                            setSelectedPartners(selectedPartners.filter(id => id !== partner.id));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                                />
                                                <div className="w-8 h-8 bg-gray-900 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                                                    {getUserAvatarUrl({ username: partner.username, avatar: partner.avatar }) ? (
                                                        <img 
                                                            src={getUserAvatarUrl({ username: partner.username, avatar: partner.avatar })!} 
                                                            alt={partner.username}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-bold text-white">
                                                            {partner.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-700">{partner.username}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <button
                                onClick={saveWorkout}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg mt-4"
                            >
                                <Check className="h-5 w-5" />
                                <span>Save Workout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}

export default function WorkoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 animate-pulse">
                        <Dumbbell className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">Loading workout page...</p>
                </div>
            </div>
        }>
            <WorkoutContent />
        </Suspense>
    );
}