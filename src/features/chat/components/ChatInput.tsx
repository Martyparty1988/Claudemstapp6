/**
 * Chat - ChatInput Component
 * 
 * Input bar pro psaní zpráv ve stylu WhatsApp.
 */

import React, { useRef, useEffect } from 'react';
import type { ChatInputVM, MessageReplyVM } from '../../../application/view-models/chat-vm';

/**
 * Props
 */
export interface ChatInputProps {
  value: string;
  replyTo?: MessageReplyVM;
  onChange: (text: string) => void;
  onSend: () => void;
  onCancelReply?: () => void;
  onAttachment?: () => void;
  onCamera?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * ChatInput Component
 */
export function ChatInput({
  value,
  replyTo,
  onChange,
  onSend,
  onCancelReply,
  onAttachment,
  onCamera,
  placeholder = 'Napište zprávu...',
  disabled = false,
  className = '',
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0;

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        onSend();
      }
    }
  };

  return (
    <div className={`bg-ios-gray-6 border-t border-ios-gray-4 ${className}`}>
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-ios-gray-5 border-b border-ios-gray-4">
          <div className="flex-1 min-w-0 pl-2 border-l-2 border-ios-blue">
            <p className="text-ios-caption1 font-semibold text-ios-blue">
              {replyTo.senderName}
            </p>
            <p className="text-ios-caption2 text-ios-gray truncate">
              {replyTo.preview}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 text-ios-gray touch-feedback"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-4 py-2 safe-area-bottom">
        {/* Attachment button */}
        {onAttachment && (
          <button
            onClick={onAttachment}
            disabled={disabled}
            className="p-2 text-ios-gray touch-feedback disabled:opacity-50"
          >
            <AttachmentIcon className="w-6 h-6" />
          </button>
        )}

        {/* Input container */}
        <div className="flex-1 flex items-end bg-white rounded-2xl shadow-sm">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="
              flex-1 px-4 py-2
              bg-transparent
              text-ios-body text-gray-900
              placeholder-ios-gray
              resize-none
              focus:outline-none
              disabled:opacity-50
            "
            style={{ maxHeight: '120px' }}
          />

          {/* Camera button (inside input) */}
          {onCamera && !canSend && (
            <button
              onClick={onCamera}
              disabled={disabled}
              className="p-2 text-ios-gray touch-feedback disabled:opacity-50"
            >
              <CameraIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Send / Voice button */}
        {canSend ? (
          <button
            onClick={onSend}
            disabled={disabled}
            className="
              w-10 h-10 rounded-full
              bg-ios-blue text-white
              flex items-center justify-center
              touch-feedback
              disabled:opacity-50
            "
          >
            <SendIcon className="w-5 h-5" />
          </button>
        ) : (
          <button
            disabled={disabled}
            className="
              w-10 h-10 rounded-full
              bg-ios-blue text-white
              flex items-center justify-center
              touch-feedback
              disabled:opacity-50
            "
          >
            <MicIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Icons
 */
function AttachmentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
