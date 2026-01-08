/**
 * MST Seed Data - Users & Chat
 * 
 * Demo uživatelé a chat konverzace.
 */

import type { ChatUser, Conversation, Message } from '../../domain/types';

/**
 * Aktuální uživatel (já)
 */
export const CURRENT_USER: ChatUser = {
  id: 'user-current',
  name: 'Martin Dvořák',
  role: 'worker',
  isOnline: true,
};

/**
 * Demo uživatelé
 */
export const SEED_USERS: ChatUser[] = [
  CURRENT_USER,
  {
    id: 'user-1',
    name: 'Jan Novák',
    role: 'manager',
    isOnline: true,
  },
  {
    id: 'user-2',
    name: 'Petr Svoboda',
    role: 'worker',
    isOnline: true,
  },
  {
    id: 'user-3',
    name: 'Marie Dvořáková',
    role: 'admin',
    isOnline: false,
    lastSeen: new Date(Date.now() - 7200000), // Před 2h
  },
  {
    id: 'user-4',
    name: 'Karel Procházka',
    role: 'worker',
    isOnline: false,
    lastSeen: new Date(Date.now() - 86400000), // Včera
  },
  {
    id: 'user-5',
    name: 'Eva Černá',
    role: 'worker',
    isOnline: true,
  },
];

/**
 * Demo konverzace
 */
export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-project-1',
    type: 'project',
    participantIds: ['user-current', 'user-1', 'user-2', 'user-5'],
    name: 'Solar Park Alpha',
    projectId: 'project-1',
    unreadCount: 3,
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date(),
    isMuted: false,
    isPinned: true,
  },
  {
    id: 'conv-direct-1',
    type: 'direct',
    participantIds: ['user-current', 'user-1'],
    unreadCount: 0,
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date(Date.now() - 86400000),
    isMuted: false,
    isPinned: false,
  },
  {
    id: 'conv-group-1',
    type: 'group',
    participantIds: ['user-current', 'user-1', 'user-2', 'user-4', 'user-5'],
    name: 'Tým montáže',
    unreadCount: 0,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date(Date.now() - 172800000),
    isMuted: true,
    isPinned: false,
  },
  {
    id: 'conv-project-2',
    type: 'project',
    participantIds: ['user-current', 'user-3'],
    name: 'Rodinný dům Nováků',
    projectId: 'project-2',
    unreadCount: 1,
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date(Date.now() - 3600000),
    isMuted: false,
    isPinned: false,
  },
  {
    id: 'conv-direct-2',
    type: 'direct',
    participantIds: ['user-current', 'user-3'],
    unreadCount: 0,
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date(Date.now() - 604800000),
    isMuted: false,
    isPinned: false,
  },
];

/**
 * Demo zprávy pro konverzaci Solar Park Alpha
 */
export const SEED_MESSAGES_PROJECT_1: Message[] = [
  {
    id: 'msg-1-1',
    conversationId: 'conv-project-1',
    senderId: 'user-1',
    text: 'Dobré ráno všichni! Dnes začínáme s řadou E.',
    status: 'read',
    sentAt: new Date(Date.now() - 7200000),
    readBy: ['user-current', 'user-2', 'user-5'],
    isDeleted: false,
    isEdited: false,
  },
  {
    id: 'msg-1-2',
    conversationId: 'conv-project-1',
    senderId: 'user-2',
    text: 'Jasně, jsem na místě. Nářadí připraveno.',
    status: 'read',
    sentAt: new Date(Date.now() - 7000000),
    readBy: ['user-current', 'user-1', 'user-5'],
    isDeleted: false,
    isEdited: false,
  },
  {
    id: 'msg-1-3',
    conversationId: 'conv-project-1',
    senderId: 'user-current',
    text: 'Dobrý, jedu. Budu tam za 15 minut.',
    status: 'read',
    sentAt: new Date(Date.now() - 6800000),
    readBy: ['user-1', 'user-2', 'user-5'],
    isDeleted: false,
    isEdited: false,
  },
  {
    id: 'msg-1-4',
    conversationId: 'conv-project-1',
    senderId: 'user-5',
    text: 'Nezapomeňte na bezpečnostní vesty, dnes je na stavbě kontrola.',
    status: 'read',
    sentAt: new Date(Date.now() - 6500000),
    readBy: ['user-current', 'user-1', 'user-2'],
    isDeleted: false,
    isEdited: false,
  },
  {
    id: 'msg-1-5',
    conversationId: 'conv-project-1',
    senderId: 'user-1',
    text: 'Dokončil jsem E1-E4, jdu na E5.',
    status: 'read',
    sentAt: new Date(Date.now() - 3600000),
    readBy: ['user-2', 'user-5'],
    isDeleted: false,
    isEdited: false,
  },
  {
    id: 'msg-1-6',
    conversationId: 'conv-project-1',
    senderId: 'user-2',
    text: 'Super! Já mám E5-E8 hotové. 👍',
    status: 'delivered',
    sentAt: new Date(Date.now() - 1800000),
    readBy: [],
    isDeleted: false,
    isEdited: false,
  },
  {
    id: 'msg-1-7',
    conversationId: 'conv-project-1',
    senderId: 'user-1',
    text: 'Výborně! Dnes to stihneme celou řadu E.',
    status: 'delivered',
    sentAt: new Date(Date.now() - 900000),
    readBy: [],
    isDeleted: false,
    isEdited: false,
  },
  {
    id: 'msg-1-8',
    conversationId: 'conv-project-1',
    senderId: 'user-5',
    text: 'Kontrola proběhla OK, můžeme pokračovat normálně.',
    status: 'sent',
    sentAt: new Date(Date.now() - 300000),
    readBy: [],
    isDeleted: false,
    isEdited: false,
  },
];

/**
 * Demo zprávy pro direct chat s Janem
 */
export const SEED_MESSAGES_DIRECT_1: Message[] = [
  {
    id: 'msg-d1-1',
    conversationId: 'conv-direct-1',
    senderId: 'user-current',
    text: 'Ahoj Honzo, můžeš mi zítra pomoct s projektem v Brně?',
    status: 'read',
    sentAt: new Date(Date.now() - 90000000),
    readBy: ['user-1'],
    isDeleted: false,
    isEdited: false,
  },
  {
    id: 'msg-d1-2',
    conversationId: 'conv-direct-1',
    senderId: 'user-1',
    text: 'Jasně, v kolik tam máme být?',
    status: 'read',
    sentAt: new Date(Date.now() - 89000000),
    readBy: ['user-current'],
    isDeleted: false,
    isEdited: false,
  },
  {
    id: 'msg-d1-3',
    conversationId: 'conv-direct-1',
    senderId: 'user-current',
    text: 'V 8:00 ráno. Vyzvednu tě po cestě.',
    status: 'read',
    sentAt: new Date(Date.now() - 88500000),
    readBy: ['user-1'],
    isDeleted: false,
    isEdited: false,
  },
  {
    id: 'msg-d1-4',
    conversationId: 'conv-direct-1',
    senderId: 'user-1',
    text: 'Ok, budu tam v 8 👍',
    status: 'read',
    sentAt: new Date(Date.now() - 86400000),
    readBy: ['user-current'],
    isDeleted: false,
    isEdited: false,
  },
];

/**
 * Všechny seed zprávy
 */
export const SEED_MESSAGES: Message[] = [
  ...SEED_MESSAGES_PROJECT_1,
  ...SEED_MESSAGES_DIRECT_1,
];

/**
 * Získat zprávy pro konverzaci
 */
export function getSeedMessagesForConversation(conversationId: string): Message[] {
  return SEED_MESSAGES
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
}

/**
 * Získat uživatele podle ID
 */
export function getSeedUserById(userId: string): ChatUser | undefined {
  return SEED_USERS.find((u) => u.id === userId);
}

/**
 * Získat detail konverzace s rozšířenými informacemi
 */
export function getSeedConversationWithDetails(conversationId: string) {
  const conv = SEED_CONVERSATIONS.find((c) => c.id === conversationId);
  if (!conv) return null;

  const participants = conv.participantIds
    .map((id) => getSeedUserById(id))
    .filter(Boolean) as ChatUser[];

  const messages = getSeedMessagesForConversation(conversationId);
  const lastMessage = messages[messages.length - 1];

  return {
    ...conv,
    participants,
    lastMessage,
  };
}
