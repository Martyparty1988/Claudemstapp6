/**
 * Chat Feature - ChatScreen
 * 
 * Hlavní obrazovka chatu - seznam konverzací.
 * Firemní chat ve stylu WhatsApp.
 * 
 * Podporuje:
 * - Direct messages (1:1)
 * - Skupinové chaty
 * - Projektové chaty
 */

import React, { useEffect, useState } from 'react';
import {
  Screen,
  ScreenHeader,
  ScreenContent,
  LoadingScreen,
  ErrorState,
  EmptyState,
  IconButton,
} from '../../shared';
import { useConversations } from '../../application/hooks/useChat';
import { ConversationList, NewConversationModal } from './components';
import { ConversationDetailScreen } from './ConversationDetailScreen';

/**
 * ChatScreen Component
 */
export function ChatScreen() {
  const {
    conversations,
    loadConversations,
    refresh,
    markAsRead,
  } = useConversations();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);

  // Load on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Pokud je vybraná konverzace, zobrazit detail
  if (selectedConversationId) {
    return (
      <ConversationDetailScreen
        conversationId={selectedConversationId}
        onBack={() => setSelectedConversationId(null)}
      />
    );
  }

  // Loading
  if (conversations.status === 'loading' && !conversations.data) {
    return <LoadingScreen message="Načítám konverzace..." />;
  }

  // Error
  if (conversations.status === 'error' && !conversations.data) {
    return (
      <Screen>
        <ErrorState
          title="Nepodařilo se načíst"
          message={conversations.error ?? 'Zkuste to prosím znovu'}
          onRetry={refresh}
          className="h-full"
        />
      </Screen>
    );
  }

  const conversationList = conversations.data ?? [];

  // Filter by search
  const filteredConversations = searchQuery
    ? conversationList.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversationList;

  const handleSelectConversation = (conversationId: string) => {
    markAsRead(conversationId);
    setSelectedConversationId(conversationId);
  };

  const handleNewConversationCreated = (conversationId: string) => {
    setShowNewConversation(false);
    setSelectedConversationId(conversationId);
    // Refresh list
    loadConversations();
  };

  return (
    <Screen
      header={
        <ScreenHeader
          title="Chat"
          largeTitle
          rightAction={
            <IconButton
              icon={<ComposeIcon />}
              label="Nová konverzace"
              onClick={() => setShowNewConversation(true)}
            />
          }
        />
      }
    >
      <ScreenContent>
        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledat konverzaci..."
              className="
                w-full pl-10 pr-4 py-2.5
                bg-slate-100 dark:bg-slate-800 rounded-xl
                text-slate-900 dark:text-white
                placeholder-slate-400 dark:placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-brand-500/30
                transition-all
              "
            />
          </div>
        </div>

        {/* Conversation list */}
        {filteredConversations.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'Nic nenalezeno' : 'Žádné konverzace'}
            description={
              searchQuery
                ? 'Zkuste jiný hledaný výraz'
                : 'Začněte novou konverzaci s kolegy'
            }
            icon={<ChatEmptyIcon />}
            action={
              !searchQuery && (
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="px-4 py-2 bg-brand-500 text-white rounded-xl font-medium"
                >
                  Nová konverzace
                </button>
              )
            }
            className="py-12"
          />
        ) : (
          <ConversationList
            conversations={filteredConversations}
            onSelect={handleSelectConversation}
          />
        )}
      </ScreenContent>

      {/* New conversation modal */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onCreated={handleNewConversationCreated}
      />
    </Screen>
  );
}

/**
 * Icons
 */
function ComposeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ChatEmptyIcon() {
  return (
    <svg className="w-16 h-16 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

export default ChatScreen;
