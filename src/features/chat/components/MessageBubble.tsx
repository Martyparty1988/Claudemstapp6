/**
 * Chat - MessageBubble Component
 * 
 * Jednotlivá zpráva ve stylu WhatsApp.
 */

import React from 'react';
import type { MessageVM } from '../../../application/view-models/chat-vm';

/**
 * Props
 */
export interface MessageBubbleProps {
  message: MessageVM;
  onReply?: () => void;
  onLongPress?: () => void;
  className?: string;
}

/**
 * MessageBubble Component
 */
export function MessageBubble({
  message,
  onReply,
  onLongPress,
  className = '',
}: MessageBubbleProps) {
  // Smazaná zpráva
  if (message.isDeleted) {
    return (
      <div className={`flex ${message.isMine ? 'justify-end' : 'justify-start'} ${className}`}>
        <div className="px-3 py-2 rounded-2xl bg-ios-gray-5 italic text-ios-gray text-ios-subhead">
          Zpráva byla smazána
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Date separator */}
      {message.showDate && message.date && (
        <div className="flex justify-center my-4">
          <span className="px-3 py-1 bg-ios-gray-5 rounded-full text-ios-caption1 text-ios-gray">
            {message.date}
          </span>
        </div>
      )}

      {/* Message */}
      <div
        className={`flex ${message.isMine ? 'justify-end' : 'justify-start'} mb-1`}
        onContextMenu={(e) => {
          e.preventDefault();
          onLongPress?.();
        }}
      >
        {/* Avatar (pro skupiny) */}
        {message.showAvatar && !message.isMine && (
          <div
            className={`
              w-8 h-8 rounded-full mr-2 flex-shrink-0
              flex items-center justify-center
              text-white text-xs font-medium
              ${message.sender.avatarColor}
            `}
          >
            {message.sender.avatar ? (
              <img
                src={message.sender.avatar}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              message.sender.initials
            )}
          </div>
        )}

        {/* Placeholder pro avatar alignment */}
        {!message.showAvatar && !message.isMine && (
          <div className="w-8 mr-2 flex-shrink-0" />
        )}

        {/* Bubble */}
        <div
          className={`
            max-w-[75%] rounded-2xl px-3 py-2
            ${message.isMine
              ? 'bg-ios-blue text-white rounded-br-md'
              : 'bg-white text-gray-900 rounded-bl-md shadow-sm'}
          `}
        >
          {/* Sender name (pro skupiny) */}
          {message.showName && !message.isMine && (
            <p className="text-ios-caption1 font-semibold text-ios-blue mb-1">
              {message.sender.name}
            </p>
          )}

          {/* Reply preview */}
          {message.replyTo && (
            <div
              className={`
                mb-2 pl-2 border-l-2
                ${message.isMine ? 'border-white/50' : 'border-ios-blue'}
              `}
            >
              <p
                className={`
                  text-ios-caption1 font-medium
                  ${message.isMine ? 'text-white/80' : 'text-ios-blue'}
                `}
              >
                {message.replyTo.senderName}
              </p>
              <p
                className={`
                  text-ios-caption2 truncate
                  ${message.isMine ? 'text-white/60' : 'text-ios-gray'}
                `}
              >
                {message.replyTo.preview}
              </p>
            </div>
          )}

          {/* Text content */}
          <p className="text-ios-body whitespace-pre-wrap break-words">
            {message.text}
          </p>

          {/* Footer - time & status */}
          <div
            className={`
              flex items-center justify-end gap-1 mt-1
              ${message.isMine ? 'text-white/60' : 'text-ios-gray'}
            `}
          >
            {message.isEdited && (
              <span className="text-ios-caption2">upraveno</span>
            )}
            <span className="text-ios-caption2">{message.time}</span>
            {message.isMine && <StatusIcon status={message.statusIcon} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Status icon
 */
function StatusIcon({ status }: { status: MessageVM['statusIcon'] }) {
  switch (status) {
    case 'clock':
      return <ClockIcon className="w-3.5 h-3.5" />;
    case 'check':
      return <CheckIcon className="w-3.5 h-3.5" />;
    case 'check-double':
      return <CheckDoubleIcon className="w-3.5 h-3.5" />;
    case 'check-double-blue':
      return <CheckDoubleIcon className="w-3.5 h-3.5 text-white" />;
    case 'error':
      return <ErrorIcon className="w-3.5 h-3.5 text-ios-red" />;
    default:
      return null;
  }
}

/**
 * Icons
 */
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CheckDoubleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7M5 19l4 4L19 13" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
