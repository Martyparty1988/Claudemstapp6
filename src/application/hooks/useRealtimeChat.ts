/**
 * MST useRealtimeChat Hook
 * 
 * Hook pro real-time chat přes Firebase.
 * Kombinuje lokální data (seed/Dexie) s Firebase real-time updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  chatRealtimeService,
  isFirebaseConfigured,
  type FirestoreConversation,
  type FirestoreMessage,
} from '../../firebase';
import { CURRENT_USER } from '../../data/seed';
import type {
  ConversationListItemVM,
  ConversationDetailVM,
  MessageVM,
  TypingIndicatorVM,
} from '../view-models/chat-vm';

// ============ HELPERS ============

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(id: string): string {
  const colors = [
    'bg-ios-blue',
    'bg-ios-green',
    'bg-ios-orange',
    'bg-ios-purple',
    'bg-ios-red',
    'bg-ios-teal',
  ];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function formatTime(timestamp: any): string {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
}

function formatRelativeTime(timestamp: any): string {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return formatTime(timestamp);
  if (days === 1) return 'včera';
  if (days < 7) return ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'][date.getDay()];
  return date.toLocaleDateString('cs-CZ');
}

function getStatusIcon(isMine: boolean, readBy: string[], participantCount: number): MessageVM['statusIcon'] {
  if (!isMine) return 'check';
  if (readBy.length >= participantCount) return 'check-double-blue';
  if (readBy.length > 1) return 'check-double';
  return 'check';
}

// ============ HOOKS ============

/**
 * useRealtimeConversations - seznam konverzací s real-time updates
 */
export function useRealtimeConversations() {
  const userId = CURRENT_USER.id;
  const [conversations, setConversations] = useState<ConversationListItemVM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !isFirebaseConfigured()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = chatRealtimeService.subscribeToConversations(
      userId,
      (firestoreConversations) => {
        const mapped: ConversationListItemVM[] = firestoreConversations.map((conv) => {
          const isGroup = conv.type !== 'direct';
          const title = conv.name || conv.participantIds.filter(id => id !== userId).join(', ');
          
          // Získat unreadCount pro aktuálního uživatele
          const unreadCount = conv.unreadCount?.[userId] || 0;
          
          return {
            id: conv.id!,
            type: conv.type,
            title,
            initials: getInitials(title),
            avatarColor: conv.type === 'project' ? 'bg-ios-blue' : 
                        conv.type === 'group' ? 'bg-ios-orange' : 
                        getAvatarColor(conv.id!),
            lastMessagePreview: conv.lastMessage?.text,
            lastMessageSender: isGroup && conv.lastMessage?.senderId !== userId 
              ? conv.lastMessage?.senderId.slice(0, 8) 
              : undefined,
            lastMessageTime: conv.lastMessage?.sentAt 
              ? formatRelativeTime(conv.lastMessage.sentAt) 
              : undefined,
            unreadCount,
            isOnline: false, // Presence systém vyžaduje Realtime Database
            isMuted: conv.isMuted || false,
            isPinned: conv.isPinned || false,
          };
        });

        setConversations(mapped);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createDirectConversation = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!userId) return null;
    
    try {
      return await chatRealtimeService.getOrCreateDirectConversation(userId, otherUserId);
    } catch (err) {
      console.error('[useRealtimeConversations] Create error:', err);
      return null;
    }
  }, [userId]);

  return {
    conversations,
    isLoading,
    error,
    createDirectConversation,
  };
}

/**
 * useRealtimeMessages - zprávy v konverzaci s real-time updates
 */
export function useRealtimeMessages(conversationId: string) {
  const userId = CURRENT_USER.id;
  const [messages, setMessages] = useState<MessageVM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to messages
  useEffect(() => {
    if (!conversationId || !userId || !isFirebaseConfigured()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = chatRealtimeService.subscribeToMessages(
      conversationId,
      (firestoreMessages) => {
        let lastDate = '';
        
        const mapped: MessageVM[] = firestoreMessages.map((msg, index) => {
          const isMine = msg.senderId === userId;
          const msgDate = msg.sentAt?.toDate?.()?.toLocaleDateString('cs-CZ') || '';
          const showDate = msgDate !== lastDate;
          lastDate = msgDate;

          const prevMsg = firestoreMessages[index - 1];
          const showAvatar = !isMine && prevMsg?.senderId !== msg.senderId;

          return {
            id: msg.id!,
            isMine,
            sender: {
              id: msg.senderId,
              name: msg.senderId === userId ? 'Já' : msg.senderId.slice(0, 8),
              initials: getInitials(msg.senderId),
              avatarColor: getAvatarColor(msg.senderId),
            },
            text: msg.text,
            time: formatTime(msg.sentAt),
            status: isMine ? 'delivered' : 'read',
            statusIcon: getStatusIcon(isMine, msg.readBy, 2),
            isDeleted: msg.isDeleted,
            isEdited: msg.isEdited,
            showAvatar,
            showName: showAvatar,
            showDate,
            date: showDate ? formatDate(msg.sentAt) : undefined,
          };
        });

        setMessages(mapped);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversationId, userId]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!conversationId || !userId || !isFirebaseConfigured()) {
      return;
    }

    const unsubscribe = chatRealtimeService.subscribeToTyping(
      conversationId,
      userId,
      setTypingUsers
    );

    return () => unsubscribe();
  }, [conversationId, userId]);

  // Send message
  const sendMessage = useCallback(async (text: string, replyToId?: string): Promise<boolean> => {
    if (!conversationId || !userId || !text.trim()) {
      return false;
    }

    try {
      await chatRealtimeService.sendMessage(conversationId, userId, text, replyToId);
      return true;
    } catch (err) {
      console.error('[useRealtimeMessages] Send error:', err);
      return false;
    }
  }, [conversationId, userId]);

  // Set typing
  const setTyping = useCallback(() => {
    if (!conversationId || !userId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing
    chatRealtimeService.setTyping(conversationId, userId);

    // Clear after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      chatRealtimeService.clearTyping(conversationId, userId);
    }, 3000);
  }, [conversationId, userId]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Typing indicator VM
  const typingIndicator: TypingIndicatorVM = {
    isTyping: typingUsers.length > 0,
    text: typingUsers.length === 1 
      ? `${typingUsers[0].slice(0, 8)} píše...`
      : typingUsers.length > 1
        ? `${typingUsers.length} lidí píše...`
        : '',
  };

  // Mark conversation as read
  const markAsRead = useCallback(async () => {
    if (!conversationId || !userId) return;
    await chatRealtimeService.markAsRead(conversationId, userId);
  }, [conversationId, userId]);

  return {
    messages,
    isLoading,
    error,
    typingIndicator,
    sendMessage,
    setTyping,
    markAsRead,
  };
}

/**
 * Helper - format date
 */
function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return 'Dnes';
  if (msgDate.getTime() === yesterday.getTime()) return 'Včera';
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' });
}
