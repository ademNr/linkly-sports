/**
 * Get avatar URL for a user
 * Returns the avatar URL if user has uploaded one, otherwise returns null
 */
export function getUserAvatarUrl(user: { username: string; avatar?: string | null }): string | null {
  if (!user.avatar) {
    return null;
  }

  // If avatar is already a data URL, return it
  if (user.avatar.startsWith('data:')) {
    return user.avatar;
  }
  
  // If avatar is base64 without prefix, add it
  if (user.avatar.startsWith('/9j/') || user.avatar.startsWith('iVBOR')) {
    return `data:image/png;base64,${user.avatar}`;
  }
  
  // Otherwise assume it's a full data URL
  return user.avatar;
}

