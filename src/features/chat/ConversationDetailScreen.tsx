/**
 * Chat - ConversationDetailScreen
 * 
 * Detail konverzace se zprávami.
 */

import React, { useEffect, useRef } from 'react';
import { LoadingScreen, ErrorState } from '../../shared';
import { useConversation } from '../../application/hooks/useChat';
import { ChatHeader, MessageBubble, ChatInput } from './components';

/**
 * Props
 */
export interface ConversationDetailScreenProps {
  conversationId: string;
  onBack: () => void;
}

/**
 * ConversationDetailScreen Component
 */
export function ConversationDetailScreen({
  conversationId,
  onBack,
}: ConversationDetailScreenProps) {
  const {
    conversation,
    messages,
    input,
    loadConversation,
    loadMessages,
    sendMessage,
    updateText,
    setReplyTo,
    cancelReply,
  } = useConversation(conversationId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    loadConversation();
    loadMessages();
  }, [loadConversation, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.data]);

  // Loading
  if (conversation.status === 'loading' && !conversation.data) {
    return <LoadingScreen message="Načítám konverzaci..." />;
  }

  // Error
  if (conversation.status === 'error' || !conversation.data) {
    return (
      <div className="h-full flex flex-col">
        <header className="bg-white border-b border-ios-gray-4 safe-area-top">
          <div className="flex items-center px-4 py-3">
            <button onClick={onBack} className="text-ios-blue">
              ← Zpět
            </button>
          </div>
        </header>
        <ErrorState
          title="Chyba"
          message={conversation.error ?? 'Konverzace nenalezena'}
          onRetry={loadConversation}
          className="flex-1"
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-ios-gray-6">
      {/* Header */}
      <ChatHeader
        conversation={conversation.data}
        onBack={onBack}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.data?.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onReply={() => setReplyTo(message)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        value={input.text}
        replyTo={input.replyTo}
        onChange={updateText}
        onSend={sendMessage}
        onCancelReply={cancelReply}
      />
    </div>
  );
}
