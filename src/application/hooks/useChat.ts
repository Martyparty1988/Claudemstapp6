/**
 * MST useChat Hook
 * 
 * Hook pro správu chatu - seznam konverzací, zprávy, odesílání.
 * Používá chatRepository pro přístup k Dexie databázi.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  ConversationListItemVM,
  ConversationDetailVM,
  MessageVM,
  ChatInputVM,
  ChatUserVM,
} from '../view-models/chat-vm';
import { chatRepository, getChatRepository } from '../../data/repositories/chat-repository';
import { CURRENT_USER } from '../../data/seed';

/**
 * Async state helper
 */
interface AsyncState<T> {
  data: T | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

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
    'bg-brand-500',
    'bg-success-500',
    'bg-warning-500',
    'bg-accent-500',
    'bg-error-500',
    'bg-slate-500',
  ];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'právě teď';
  if (minutes < 60) return `před ${minutes}m`;
  if (hours < 24) return `před ${hours}h`;
  if (days === 1) return 'včera';
  if (days < 7) {
    const date = new Date(timestamp);
    return ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'][date.getDay()];
  }
  return new Date(timestamp).toLocaleDateString('cs-CZ');
}

function formatMessageTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / 86400000);
  const date = new Date(timestamp);

  if (days === 0) {
    return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  }
  if (days === 1) {
    return 'včera ' + date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  }
  if (days < 7) {
    const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    return dayNames[date.getDay()] + ' ' + date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('cs-CZ') + ' ' + date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
}

function getStatusIcon(status: string, isMine: boolean): MessageVM['statusIcon'] {
  if (!isMine) return 'check';
  switch (status) {
    case 'sending': return 'clock';
    case 'sent': return 'check';
    case 'delivered': return 'check-double';
    case 'read': return 'check-double-blue';
    case 'failed': return 'error';
    default: return 'check';
  }
}

/**
 * useConversations - seznam konverzací
 */
export function useConversations() {
  const [conversations, setConversations] = useState<AsyncState<ConversationListItemVM[]>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const loadConversations = useCallback(async () => {
    setConversations((prev) => ({ ...prev, status: 'loading' }));

    try {
      const repo = getChatRepository();
      const conversationRecords = await repo.getConversations();
      const users = await repo.getUsers();

      const userMap = new Map(users.map((u) => [u.id, u]));

      const mapped: ConversationListItemVM[] = await Promise.all(
        conversationRecords.map(async (conv) => {
          let title = conv.name ?? '';
          let initials = '';
          let avatarColor = 'bg-slate-400';
          let isOnline = false;

          if (conv.type === 'direct') {
            // Pro direct konverzace - najít druhého účastníka
            // ID direct konverzace typicky obsahuje ID obou účastníků
            const otherUser = users.find((u) => u.id !== CURRENT_USER.id && conv.id.includes(u.id));
            if (otherUser) {
              title = otherUser.name;
              initials = getInitials(otherUser.name);
              avatarColor = getAvatarColor(otherUser.id);
              isOnline = otherUser.isOnline;
            }
          } else {
            initials = getInitials(title);
            avatarColor = conv.type === 'project' ? 'bg-brand-500' : 'bg-warning-500';
          }

          const lastSender = conv.lastMessageSenderId
            ? userMap.get(conv.lastMessageSenderId)
            : null;

          return {
            id: conv.id,
            type: conv.type,
            title,
            initials,
            avatarColor,
            avatar: conv.avatar,
            lastMessagePreview: conv.lastMessageText?.slice(0, 50),
            lastMessageSender:
              lastSender && lastSender.id !== CURRENT_USER.id
                ? lastSender.name.split(' ')[0]
                : undefined,
            lastMessageTime: conv.lastMessageAt
              ? formatMessageTime(conv.lastMessageAt)
              : undefined,
            lastMessageTimeRelative: conv.lastMessageAt
              ? getRelativeTime(conv.lastMessageAt)
              : undefined,
            unreadCount: conv.unreadCount,
            isOnline: conv.type === 'direct' ? isOnline : undefined,
            isMuted: conv.isMuted,
            isPinned: conv.isPinned,
          };
        })
      );

      setConversations({
        data: mapped,
        status: 'success',
        error: null,
      });
    } catch (error) {
      setConversations({
        data: null,
        status: 'error',
        error: String(error),
      });
    }
  }, []);

  const refresh = useCallback(() => {
    return loadConversations();
  }, [loadConversations]);

  const markAsRead = useCallback(async (conversationId: string) => {
    await chatRepository.markConversationAsRead(conversationId);
    // Refresh list
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loadConversations,
    refresh,
    markAsRead,
  };
}

/**
 * useConversation - detail konverzace se zprávami
 */
export function useConversation(conversationId: string) {
  const [conversation, setConversation] = useState<AsyncState<ConversationDetailVM>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const [messages, setMessages] = useState<AsyncState<MessageVM[]>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const [input, setInput] = useState<ChatInputVM>({
    text: '',
    isRecording: false,
    isSending: false,
    replyTo: undefined,
    attachments: [],
  });

  // Load conversation detail
  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    setConversation((prev) => ({ ...prev, status: 'loading' }));

    try {
      const repo = getChatRepository();
      const conv = await repo.getConversationById(conversationId);

      if (!conv) {
        setConversation({
          data: null,
          status: 'error',
          error: 'Konverzace nenalezena',
        });
        return;
      }

      const users = await repo.getUsers();
      const userMap = new Map(users.map((u) => [u.id, u]));

      let title = conv.name ?? '';
      let subtitle = '';
      let initials = '';
      let avatarColor = 'bg-slate-400';
      let isOnline = false;
      const participants: ChatUserVM[] = [];

      if (conv.type === 'direct') {
        const otherUser = users.find((u) => u.id !== CURRENT_USER.id);
        if (otherUser) {
          title = otherUser.name;
          initials = getInitials(otherUser.name);
          avatarColor = getAvatarColor(otherUser.id);
          isOnline = otherUser.isOnline;
          subtitle = isOnline ? 'online' : otherUser.lastSeen
            ? `naposledy ${getRelativeTime(otherUser.lastSeen)}`
            : '';
          participants.push({
            id: otherUser.id,
            name: otherUser.name,
            initials: getInitials(otherUser.name),
            avatarColor: getAvatarColor(otherUser.id),
            avatar: otherUser.avatar,
            isOnline: otherUser.isOnline,
            role: otherUser.role,
          });
        }
      } else {
        initials = getInitials(title);
        avatarColor = conv.type === 'project' ? 'bg-brand-500' : 'bg-warning-500';
        subtitle = `${users.length} účastníků`;
        
        users.forEach((u) => {
          participants.push({
            id: u.id,
            name: u.name,
            initials: getInitials(u.name),
            avatarColor: getAvatarColor(u.id),
            avatar: u.avatar,
            isOnline: u.isOnline,
            role: u.role,
          });
        });
      }

      setConversation({
        data: {
          id: conv.id,
          type: conv.type,
          title,
          subtitle,
          initials,
          avatarColor,
          avatar: conv.avatar,
          isOnline,
          isMuted: conv.isMuted,
          isPinned: conv.isPinned,
          participants,
          projectId: conv.projectId,
        },
        status: 'success',
        error: null,
      });

      // Mark as read
      await repo.markConversationAsRead(conversationId);
    } catch (error) {
      setConversation({
        data: null,
        status: 'error',
        error: String(error),
      });
    }
  }, [conversationId]);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    setMessages((prev) => ({ ...prev, status: 'loading' }));

    try {
      const repo = getChatRepository();
      const messageRecords = await repo.getMessagesForConversation(conversationId, 50);
      const users = await repo.getUsers();
      const userMap = new Map(users.map((u) => [u.id, u]));

      let lastSenderId = '';
      let lastDate = '';

      const mapped: MessageVM[] = messageRecords.map((msg, index) => {
        const sender = userMap.get(msg.senderId);
        const isMine = msg.senderId === CURRENT_USER.id;
        
        const msgDate = new Date(msg.sentAt).toLocaleDateString('cs-CZ');
        const showDate = msgDate !== lastDate;
        lastDate = msgDate;

        const showAvatar = !isMine && msg.senderId !== lastSenderId;
        const showName = !isMine && msg.senderId !== lastSenderId;
        lastSenderId = msg.senderId;

        return {
          id: msg.id,
          isMine,
          sender: {
            id: msg.senderId,
            name: sender?.name ?? 'Neznámý',
            initials: sender ? getInitials(sender.name) : '?',
            avatarColor: sender ? getAvatarColor(sender.id) : 'bg-slate-400',
          },
          text: msg.isDeleted ? 'Zpráva byla smazána' : msg.text,
          replyTo: msg.replyToId ? { 
            id: msg.replyToId, 
            senderName: 'Někdo',
            preview: '...' 
          } : undefined,
          time: formatMessageTime(msg.sentAt),
          status: msg.status,
          statusIcon: getStatusIcon(msg.status, isMine),
          isDeleted: msg.isDeleted,
          isEdited: msg.isEdited,
          showAvatar,
          showName,
          showDate,
          date: showDate ? msgDate : undefined,
        };
      });

      setMessages({
        data: mapped,
        status: 'success',
        error: null,
      });
    } catch (error) {
      setMessages({
        data: null,
        status: 'error',
        error: String(error),
      });
    }
  }, [conversationId]);

  // Send message
  const sendMessage = useCallback(async () => {
    if (!input.text.trim() || input.isSending) return;

    setInput((prev) => ({ ...prev, isSending: true }));

    try {
      const repo = getChatRepository();
      
      await repo.sendMessage({
        conversationId,
        senderId: CURRENT_USER.id,
        type: 'text',
        text: input.text.trim(),
        replyToId: input.replyTo?.id,
      });

      setInput({
        text: '',
        isRecording: false,
        isSending: false,
        replyTo: undefined,
        attachments: [],
      });

      // Reload messages
      loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      setInput((prev) => ({ ...prev, isSending: false }));
    }
  }, [conversationId, input.text, input.replyTo, input.isSending, loadMessages]);

  // Update input text
  const updateText = useCallback((text: string) => {
    setInput((prev) => ({ ...prev, text }));
  }, []);

  // Set reply
  const setReplyTo = useCallback((message: MessageVM | null) => {
    setInput((prev) => ({
      ...prev,
      replyTo: message
        ? { id: message.id, preview: message.text ?? '', senderName: message.sender.name }
        : undefined,
    }));
  }, []);

  // Cancel reply
  const cancelReply = useCallback(() => {
    setInput((prev) => ({ ...prev, replyTo: undefined }));
  }, []);

  // Load on mount
  useEffect(() => {
    loadConversation();
    loadMessages();
  }, [loadConversation, loadMessages]);

  return {
    conversation,
    messages,
    input,
    loadConversation,
    loadMessages,
    sendMessage,
    updateText,
    setReplyTo,
    cancelReply,
    refresh: loadMessages,
  };
}

/**
 * useChatUsers - seznam uživatelů pro novou konverzaci
 */
export function useChatUsers() {
  const [users, setUsers] = useState<AsyncState<ChatUserVM[]>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const loadUsers = useCallback(async () => {
    setUsers((prev) => ({ ...prev, status: 'loading' }));

    try {
      const repo = getChatRepository();
      const userRecords = await repo.getUsers();

      const mapped: ChatUserVM[] = userRecords
        .filter((u) => u.id !== CURRENT_USER.id)
        .map((u) => ({
          id: u.id,
          name: u.name,
          initials: getInitials(u.name),
          avatarColor: getAvatarColor(u.id),
          avatar: u.avatar,
          isOnline: u.isOnline,
          role: u.role,
        }));

      setUsers({
        data: mapped,
        status: 'success',
        error: null,
      });
    } catch (error) {
      setUsers({
        data: null,
        status: 'error',
        error: String(error),
      });
    }
  }, []);

  return {
    users,
    loadUsers,
  };
}

/**
 * useCreateConversation - vytvoření nové konverzace
 */
export function useCreateConversation() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDirectConversation = useCallback(async (userId: string): Promise<string | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const repo = getChatRepository();
      const user = await repo.getUserById(userId);

      if (!user) {
        setError('Uživatel nenalezen');
        setIsCreating(false);
        return null;
      }

      // Vytvořit konverzaci
      const conversation = await repo.createConversation({
        type: 'direct',
        name: user.name,
        isMuted: false,
        isPinned: false,
      });

      setIsCreating(false);
      return conversation.id;
    } catch (err) {
      setError(String(err));
      setIsCreating(false);
      return null;
    }
  }, []);

  const createGroupConversation = useCallback(
    async (name: string, userIds: string[]): Promise<string | null> => {
      setIsCreating(true);
      setError(null);

      try {
        const repo = getChatRepository();

        const conversation = await repo.createConversation({
          type: 'group',
          name,
          isMuted: false,
          isPinned: false,
        });

        setIsCreating(false);
        return conversation.id;
      } catch (err) {
        setError(String(err));
        setIsCreating(false);
        return null;
      }
    },
    []
  );

  return {
    isCreating,
    error,
    createDirectConversation,
    createGroupConversation,
  };
}

/**
 * Hook pro NewConversationModal
 */
export function useNewConversation() {
  const [users, setUsers] = useState<ChatUserVM[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const repo = getChatRepository();
      const allUsers = await repo.getUsers();
      setUsers(allUsers.map(u => ({
        id: u.id,
        name: u.name,
        initials: u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        avatarColor: 'bg-brand-500',
        role: 'Pracovník',
        isOnline: u.isOnline,
      })));
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleUser = useCallback((userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUserIds([]);
  }, []);

  const createConversation = useCallback(async (
    type: 'direct' | 'group' | 'project',
    name?: string,
    projectId?: string
  ): Promise<string | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const repo = getChatRepository();
      const conversation = await repo.createConversation({
        type,
        name: name || 'Nová konverzace',
        projectId,
        isMuted: false,
        isPinned: false,
      });
      setIsCreating(false);
      return conversation.id;
    } catch (err) {
      setError(String(err));
      setIsCreating(false);
      return null;
    }
  }, []);

  return {
    users,
    selectedUserIds,
    isLoading,
    isCreating,
    error,
    loadUsers,
    toggleUser,
    createConversation,
    clearSelection,
  };
}

/**
 * Export current user pro použití v komponentách
 */
export { CURRENT_USER };
