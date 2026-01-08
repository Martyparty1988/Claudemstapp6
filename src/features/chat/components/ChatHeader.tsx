/**
 * Chat - ChatHeader Component
 * 
 * Header pro chat detail ve stylu WhatsApp.
 */

import React from 'react';
import type { ConversationDetailVM, TypingIndicatorVM } from '../../../application/view-models/chat-vm';

/**
 * Props
 */
export interface ChatHeaderProps {
  conversation: ConversationDetailVM;
  typing?: TypingIndicatorVM;
  onBack: () => void;
  onInfo?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  className?: string;
}

/**
 * ChatHeader Component
 */
export function ChatHeader({
  conversation,
  typing,
  onBack,
  onInfo,
  onCall,
  onVideoCall,
  className = '',
}: ChatHeaderProps) {
  return (
    <header
      className={`
        bg-white/95 backdrop-blur-ios
        border-b border-ios-gray-4
        safe-area-top
        ${className}
      `}
    >
      <div className="flex items-center gap-2 px-2 py-2">
        {/* Back button */}
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-ios-blue touch-feedback"
        >
          <BackIcon className="w-6 h-6" />
        </button>

        {/* Avatar */}
        <button
          onClick={onInfo}
          className="flex items-center gap-3 flex-1 min-w-0 touch-feedback"
        >
          <div className="relative">
            <div
              className={`
                w-10 h-10 rounded-full
                flex items-center justify-center
                text-white font-semibold
                ${conversation.avatarColor}
              `}
            >
              {conversation.avatar ? (
                <img
                  src={conversation.avatar}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                conversation.initials
              )}
            </div>

            {/* Online indicator */}
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-ios-green rounded-full border-2 border-white" />
            )}
          </div>

          {/* Title & subtitle */}
          <div className="flex-1 min-w-0">
            <h1 className="text-ios-headline text-gray-900 truncate">
              {conversation.title}
            </h1>
            <p className="text-ios-caption1 text-ios-gray truncate">
              {typing?.isTyping ? (
                <span className="text-ios-green">{typing.text}</span>
              ) : (
                conversation.subtitle ?? 
                (conversation.isOnline ? 'online' : conversation.lastSeen)
              )}
            </p>
          </div>
        </button>

        {/* Action buttons */}
        <div className="flex items-center">
          {onVideoCall && (
            <button
              onClick={onVideoCall}
              className="p-2 text-ios-blue touch-feedback"
            >
              <VideoIcon className="w-6 h-6" />
            </button>
          )}
          {onCall && (
            <button
              onClick={onCall}
              className="p-2 text-ios-blue touch-feedback"
            >
              <PhoneIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Icons
 */
function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}
