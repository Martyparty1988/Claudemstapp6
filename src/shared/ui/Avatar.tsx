/**
 * MST Avatar Component - 2026 Glassmorphism Edition
 * 
 * Modern avatars with gradients and status indicators.
 */

import React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  ring?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', status: 'w-2 h-2 border' },
  sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2.5 h-2.5 border-[1.5px]' },
  md: { container: 'w-10 h-10', text: 'text-sm', status: 'w-3 h-3 border-2' },
  lg: { container: 'w-12 h-12', text: 'text-base', status: 'w-3.5 h-3.5 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-lg', status: 'w-4 h-4 border-2' },
  '2xl': { container: 'w-20 h-20', text: 'text-xl', status: 'w-5 h-5 border-2' },
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-success-500',
  offline: 'bg-slate-400',
  busy: 'bg-error-500',
  away: 'bg-warning-500',
};

// Gradient combinations for initials
const gradients = [
  'from-brand-400 to-brand-600',
  'from-accent-400 to-accent-600',
  'from-success-400 to-success-600',
  'from-warning-400 to-warning-600',
  'from-error-400 to-error-600',
  'from-cyan-400 to-cyan-600',
  'from-violet-400 to-violet-600',
  'from-pink-400 to-pink-600',
];

function getGradientForName(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Avatar component
 */
export function Avatar({
  src,
  name = '',
  size = 'md',
  status,
  ring = false,
  className = '',
  onClick,
}: AvatarProps) {
  const styles = sizeStyles[size];
  const initials = getInitials(name || '?');
  const gradient = getGradientForName(name);

  return (
    <div
      className={`
        relative inline-flex
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Avatar circle */}
      <div
        className={`
          ${styles.container}
          rounded-full overflow-hidden
          flex items-center justify-center
          ${ring ? 'ring-2 ring-white dark:ring-slate-900 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''}
          ${!src ? `bg-gradient-to-br ${gradient}` : ''}
          transition-transform duration-200
          ${onClick ? 'hover:scale-105 active:scale-95' : ''}
        `}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials on error
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className={`font-semibold text-white ${styles.text}`}>
            {initials}
          </span>
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${styles.status}
            ${statusColors[status]}
            rounded-full
            border-white dark:border-slate-900
          `}
        />
      )}
    </div>
  );
}

/**
 * AvatarGroup - stack of avatars
 */
export interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name: string }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;
  const styles = sizeStyles[size];

  // Overlap calculation
  const overlap: Record<AvatarSize, string> = {
    xs: '-ml-1.5',
    sm: '-ml-2',
    md: '-ml-2.5',
    lg: '-ml-3',
    xl: '-ml-4',
    '2xl': '-ml-5',
  };

  return (
    <div className={`flex items-center ${className}`}>
      {displayed.map((avatar, index) => (
        <div
          key={index}
          className={`
            ${index > 0 ? overlap[size] : ''}
            relative
          `}
          style={{ zIndex: displayed.length - index }}
        >
          <Avatar
            src={avatar.src}
            name={avatar.name}
            size={size}
            ring
          />
        </div>
      ))}
      
      {remaining > 0 && (
        <div
          className={`
            ${overlap[size]}
            ${styles.container}
            rounded-full
            bg-slate-200 dark:bg-slate-700
            flex items-center justify-center
            ring-2 ring-white dark:ring-slate-900
          `}
          style={{ zIndex: 0 }}
        >
          <span className={`font-semibold text-slate-600 dark:text-slate-300 ${styles.text}`}>
            +{remaining}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * UserAvatar - avatar with name and subtitle
 */
export interface UserAvatarProps {
  src?: string | null;
  name: string;
  subtitle?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  onClick?: () => void;
  className?: string;
}

export function UserAvatar({
  src,
  name,
  subtitle,
  size = 'md',
  status,
  onClick,
  className = '',
}: UserAvatarProps) {
  const textSizes: Record<AvatarSize, { name: string; subtitle: string }> = {
    xs: { name: 'text-xs', subtitle: 'text-[10px]' },
    sm: { name: 'text-sm', subtitle: 'text-xs' },
    md: { name: 'text-sm', subtitle: 'text-xs' },
    lg: { name: 'text-base', subtitle: 'text-sm' },
    xl: { name: 'text-lg', subtitle: 'text-sm' },
    '2xl': { name: 'text-xl', subtitle: 'text-base' },
  };

  const styles = textSizes[size];

  return (
    <div
      className={`
        flex items-center gap-3
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <Avatar src={src} name={name} size={size} status={status} />
      <div className="min-w-0">
        <p className={`font-medium text-slate-900 dark:text-white truncate ${styles.name}`}>
          {name}
        </p>
        {subtitle && (
          <p className={`text-slate-500 dark:text-slate-400 truncate ${styles.subtitle}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default Avatar;
