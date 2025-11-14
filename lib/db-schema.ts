// MongoDB Schema Types
// These are TypeScript interfaces that represent the structure of documents in MongoDB

export interface User {
  _id?: string;
  username: string;
  password: string; // hashed password
  avatar?: string; // base64 encoded image or URL
  lastWorkoutDate?: Date;
  lastMuscleGroup?: string;
  lastWorkoutDuration?: number;
  totalSets?: number; // total sets logged across all workouts
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSession {
  _id?: string;
  userId: string;
  sharedWith?: string[]; // array of user IDs who share this workout
  pendingAcceptance?: string[]; // array of user IDs who need to accept the workout
  acceptedBy?: string[]; // array of user IDs who have accepted the workout
  isGroupSession?: boolean; // true if this is a group workout session
  name: string;
  type: string;
  date: Date;
  duration: number; // duration in minutes
  exercises: Exercise[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  _id?: string;
  name: string;
  muscleGroup: string;
  sets: Set[];
  createdAt: Date;
}

export interface Set {
  _id?: string;
  setNumber?: number;
  reps?: number;
  weight?: number;
  duration?: number; // for time-based exercises
  notes?: string;
}

export interface Notification {
  _id?: string;
  userId: string; // recipient user ID
  type: 'gym_partner_request' | 'gym_partner_accepted' | 'shared_workout' | 'group_session_request';
  fromUserId: string; // sender user ID
  fromUsername: string; // sender username for quick display
  workoutId?: string; // for shared_workout type
  read: boolean;
  createdAt: Date;
}

export interface FriendRequest {
  _id?: string;
  fromUserId: string;
  toUserId: string;
  type: 'friend' | 'gym_partner';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  _id?: string;
  userId1: string;
  userId2: string;
  type: 'friend' | 'gym_partner';
  createdAt: Date;
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  WORKOUTS: 'workout_sessions',
  NOTIFICATIONS: 'notifications',
  FRIEND_REQUESTS: 'friend_requests',
  FRIENDSHIPS: 'friendships',
} as const;
