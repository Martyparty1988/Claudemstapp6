/**
 * Chat - ConversationList Component
 * 
 * Seznam konverzací ve stylu WhatsApp.
 */

import React from 'react';
import type { ConversationListItemVM } from '../../../application/view-models/chat-vm';

/**
 * Props
 */
export interface ConversationListProps {
  conversations: readonly ConversationListItemVM[];
  onSelect: (conversationId: string) => void;
  onLongPress?: (conversationId: string) => void;
  className?: string;
}

/**
 * ConversationList Component
 */
export function ConversationList({
  conversations,
  onSelect,
  onLongPress,
  className = '',
}: ConversationListProps) {
  // Rozdělit na připnuté a ostatní
  const pinned = conversations.filter((c) => c.isPinned);
  const unpinned = conversations.filter((c) => !c.isPinned);

  return (
    <div className={className}>
      {/* Připnuté */}
      {pinned.length > 0 && (
        <div className="mb-2">
          <p className="px-4 py-1 text-ios-caption2 text-ios-gray uppercase">
            Připnuté
          </p>
          {pinned.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              onPress={() => onSelect(conv.id)}
              onLongPress={() => onLongPress?.(conv.id)}
            />
          ))}
        </div>
      )}

      {/* Ostatní */}
      {unpinned.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          onPress={() => onSelect(conv.id)}
          onLongPress={() => onLongPress?.(conv.id)}
        />
      ))}
    </div>
  );
}

/**
 * ConversationItem Component
 */
interface ConversationItemProps {
  conversation: ConversationListItemVM;
  onPress: () => void;
  onLongPress?: () => void;
}

function ConversationItem({ conversation, onPress, onLongPress }: ConversationItemProps) {
  return (
    <button
      onClick={onPress}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress?.();
      }}
      className="w-full flex items-center gap-3 px-4 py-3 touch-feedback"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`
            w-12 h-12 rounded-full
            flex items-center justify-center
            text-white font-semibold text-lg
            ${conversation.avatarColor}
          `}
        >
          {conversation.initials}
        </div>

        {/* Online indicator */}
        {conversation.isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-ios-green rounded-full border-2 border-white" />
        )}

        {/* Group/Project icon */}
        {conversation.type !== 'direct' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
            {conversation.type === 'project' ? (
              <ProjectIcon className="w-3 h-3 text-ios-blue" />
            ) : (
              <GroupIcon className="w-3 h-3 text-ios-gray" />
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          {/* Title */}
          <h3 className="text-ios-body font-medium text-gray-900 truncate">
            {conversation.title}
          </h3>

          {/* Time */}
          <span
            className={`
              text-ios-caption1 flex-shrink-0 ml-2
              ${conversation.unreadCount > 0 ? 'text-ios-blue font-medium' : 'text-ios-gray'}
            `}
          >
            {conversation.lastMessageTime}
          </span>
        </div>

        <div className="flex items-center justify-between">
          {/* Preview */}
          <p className="text-ios-subhead text-ios-gray truncate pr-2">
            {conversation.isTyping ? (
              <span className="text-ios-green italic">píše...</span>
            ) : (
              <>
                {conversation.lastMessageSender && (
                  <span className="text-gray-600">
                    {conversation.lastMessageSender}:{' '}
                  </span>
                )}
                {conversation.lastMessagePreview}
              </>
            )}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Muted */}
            {conversation.isMuted && (
              <MutedIcon className="w-4 h-4 text-ios-gray" />
            )}

            {/* Unread count */}
            {conversation.unreadCount > 0 && (
              <span
                className={`
                  min-w-[20px] h-5 px-1.5
                  rounded-full text-xs font-semibold
                  flex items-center justify-center
                  ${conversation.isMuted
                    ? 'bg-ios-gray-3 text-white'
                    : 'bg-ios-blue text-white'}
                `}
              >
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Icons
 */
function GroupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  );
}

function ProjectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
    </svg>
  );
}

function MutedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  );
}
