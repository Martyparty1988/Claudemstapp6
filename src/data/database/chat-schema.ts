/**
 * MST Chat Database Schema
 * 
 * Dexie tabulky pro offline chat.
 */

import Dexie from 'dexie';

/**
 * Chat tabulky pro Dexie
 */
export const CHAT_TABLES = {
  // Konverzace
  conversations: '&id, type, projectId, updatedAt, isPinned',
  
  // Zprávy - compound index pro efektivní načítání
  messages: '&id, conversationId, senderId, sentAt, [conversationId+sentAt]',
  
  // Uživatelé
  chatUsers: '&id, name, isOnline',
  
  // Účastníci konverzací (many-to-many)
  conversationParticipants: '++id, conversationId, userId, [conversationId+userId]',
  
  // Nepřečtené počty
  unreadCounts: '&conversationId, count',
  
  // Typing indikátory (ephemeral, ale pro offline)
  typingIndicators: '&odst, conversationId, odst, timestamp',
  
  // Drafty zpráv
  messageDrafts: '&conversationId, text, updatedAt',
};

/**
 * Chat DB interface
 */
export interface ChatDB extends Dexie {
  conversations: Dexie.Table<ConversationRecord, string>;
  messages: Dexie.Table<MessageRecord, string>;
  chatUsers: Dexie.Table<ChatUserRecord, string>;
  conversationParticipants: Dexie.Table<ParticipantRecord, number>;
  unreadCounts: Dexie.Table<UnreadCountRecord, string>;
  messageDrafts: Dexie.Table<DraftRecord, string>;
}

/**
 * DB Records
 */
export interface ConversationRecord {
  id: string;
  type: 'direct' | 'group' | 'project';
  name?: string;
  projectId?: string;
  avatar?: string;
  lastMessageId?: string;
  lastMessageText?: string;
  lastMessageSenderId?: string;
  lastMessageAt?: number;
  unreadCount: number;
  createdAt: number;
  updatedAt: number;
  isMuted: boolean;
  isPinned: boolean;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'text' | 'image' | 'file' | 'location' | 'voice';
  text?: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  replyToId?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: number;
  deliveredAt?: number;
  readBy: string[];
  isDeleted: boolean;
  isEdited: boolean;
}

export interface ChatUserRecord {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'worker';
  isOnline: boolean;
  lastSeen?: number;
}

export interface ParticipantRecord {
  id?: number;
  conversationId: string;
  odst: string;
  joinedAt: number;
  role: 'admin' | 'member';
}

export interface UnreadCountRecord {
  conversationId: string;
  count: number;
}

export interface DraftRecord {
  conversationId: string;
  text: string;
  replyToId?: string;
  updatedAt: number;
}
