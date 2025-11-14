'use client';

import { useState } from 'react';
import { getUserAvatarUrl } from '@/lib/avatar';

interface AvatarProps {
  username: string;
  avatar?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
};

export default function Avatar({ username, avatar, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const avatarUrl = getUserAvatarUrl({ username, avatar });
  const sizeClass = sizeClasses[size];

  // If no avatar or image fails to load, show initial
  if (!avatarUrl || imageError) {
    return (
      <div className={`${sizeClass} bg-gray-900 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}>
        <span className="font-bold text-white">
          {username.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeClass} bg-gray-900 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}>
      <img 
        src={avatarUrl} 
        alt={username}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

