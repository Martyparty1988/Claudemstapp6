/**
 * MST Chat Repository
 * 
 * Přístup k chat datům přes Dexie.
 * Offline-first - všechna data lokálně v IndexedDB.
 */

import { getDatabase } from '../database';
import type {
  ConversationRecord,
  MessageRecord,
  ChatUserRecord,
  DraftRecord,
} from '../database/chat-schema';
import { SEED_USERS, SEED_CONVERSATIONS, SEED_MESSAGES } from '../seed';

/**
 * Generování unikátního ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Chat Repository - Singleton
 */
class ChatRepositoryImpl {
  private initialized = false;

  /**
   * Inicializace se seed daty (pouze pokud je DB prázdná)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const db = getDatabase();
    
    try {
      // Kontrola, zda už máme data
      const existingConversations = await db.conversations.count();
      
      if (existingConversations === 0) {
        console.log('[ChatRepo] Initializing with seed data...');
        
        // Seed users
        const userRecords: ChatUserRecord[] = SEED_USERS.map((u) => ({
          id: u.id,
          name: u.name,
          avatar: undefined,
          role: u.role,
          isOnline: u.isOnline,
          lastSeen: u.lastSeen ? u.lastSeen.getTime() : undefined,
        }));
        await db.chatUsers.bulkPut(userRecords);

        // Seed conversations
        const now = Date.now();
        const conversationRecords: ConversationRecord[] = SEED_CONVERSATIONS.map((c) => ({
          id: c.id,
          type: c.type,
          name: c.name,
          projectId: c.projectId,
          avatar: undefined,
          lastMessageText: c.lastMessage?.text,
          lastMessageSenderId: c.lastMessage?.senderId,
          lastMessageAt: c.lastMessage?.sentAt ? c.lastMessage.sentAt.getTime() : undefined,
          unreadCount: c.unreadCount,
          createdAt: c.createdAt.getTime(),
          updatedAt: c.updatedAt.getTime(),
          isMuted: c.isMuted,
          isPinned: c.isPinned,
        }));
        await db.conversations.bulkPut(conversationRecords);

        // Seed messages
        const messageRecords: MessageRecord[] = SEED_MESSAGES.map((m) => ({
          id: m.id,
          conversationId: m.conversationId,
          senderId: m.senderId,
          type: 'text',
          text: m.text,
          status: 'read',
          sentAt: m.sentAt.getTime(),
          readBy: [],
          isDeleted: false,
          isEdited: false,
        }));
        await db.messages.bulkPut(messageRecords);

        console.log('[ChatRepo] Seed data initialized');
      }

      this.initialized = true;
    } catch (error) {
      console.error('[ChatRepo] Failed to initialize:', error);
    }
  }

  // ============ CONVERSATIONS ============

  /**
   * Získat všechny konverzace seřazené podle poslední aktivity
   */
  async getConversations(): Promise<ConversationRecord[]> {
    await this.initialize();
    const db = getDatabase();
    
    const conversations = await db.conversations.toArray();
    
    return conversations.sort((a, b) => {
      // Připnuté první
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Pak podle poslední aktivity
      return b.updatedAt - a.updatedAt;
    });
  }

  /**
   * Získat konverzaci podle ID
   */
  async getConversationById(id: string): Promise<ConversationRecord | undefined> {
    await this.initialize();
    const db = getDatabase();
    return db.conversations.get(id);
  }

  /**
   * Získat konverzace pro projekt
   */
  async getConversationsByProjectId(projectId: string): Promise<ConversationRecord[]> {
    await this.initialize();
    const db = getDatabase();
    return db.conversations.where('projectId').equals(projectId).toArray();
  }

  /**
   * Vytvořit konverzaci
   */
  async createConversation(
    conversation: Omit<ConversationRecord, 'id' | 'createdAt' | 'updatedAt' | 'unreadCount'>
  ): Promise<ConversationRecord> {
    const db = getDatabase();
    const now = Date.now();
    
    const newConversation: ConversationRecord = {
      ...conversation,
      id: generateId(),
      unreadCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.conversations.add(newConversation);
    return newConversation;
  }

  /**
   * Aktualizovat konverzaci
   */
  async updateConversation(
    id: string,
    updates: Partial<Omit<ConversationRecord, 'id' | 'createdAt'>>
  ): Promise<ConversationRecord | undefined> {
    const db = getDatabase();
    
    await db.conversations.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return db.conversations.get(id);
  }

  /**
   * Smazat konverzaci a všechny její zprávy
   */
  async deleteConversation(id: string): Promise<void> {
    const db = getDatabase();
    
    await db.transaction('rw', [db.conversations, db.messages, db.messageDrafts], async () => {
      await db.messages.where('conversationId').equals(id).delete();
      await db.messageDrafts.delete(id);
      await db.conversations.delete(id);
    });
  }

  /**
   * Označit konverzaci jako přečtenou
   */
  async markConversationAsRead(id: string): Promise<void> {
    const db = getDatabase();
    await db.conversations.update(id, { unreadCount: 0 });
  }

  /**
   * Připnout/odepnout konverzaci
   */
  async togglePinConversation(id: string): Promise<void> {
    const db = getDatabase();
    const conversation = await db.conversations.get(id);
    if (conversation) {
      await db.conversations.update(id, { isPinned: !conversation.isPinned });
    }
  }

  /**
   * Ztlumit/odtlumit konverzaci
   */
  async toggleMuteConversation(id: string): Promise<void> {
    const db = getDatabase();
    const conversation = await db.conversations.get(id);
    if (conversation) {
      await db.conversations.update(id, { isMuted: !conversation.isMuted });
    }
  }

  // ============ MESSAGES ============

  /**
   * Získat zprávy pro konverzaci
   */
  async getMessagesForConversation(
    conversationId: string,
    limit = 50,
    beforeTimestamp?: number
  ): Promise<MessageRecord[]> {
    await this.initialize();
    const db = getDatabase();

    let messages: MessageRecord[];

    if (beforeTimestamp) {
      messages = await db.messages
        .where('conversationId')
        .equals(conversationId)
        .filter((m) => m.sentAt < beforeTimestamp)
        .reverse()
        .limit(limit)
        .toArray();
    } else {
      messages = await db.messages
        .where('conversationId')
        .equals(conversationId)
        .reverse()
        .limit(limit)
        .toArray();
    }

    // Vrátit v chronologickém pořadí
    return messages.sort((a, b) => a.sentAt - b.sentAt);
  }

  /**
   * Získat zprávu podle ID
   */
  async getMessageById(id: string): Promise<MessageRecord | undefined> {
    const db = getDatabase();
    return db.messages.get(id);
  }

  /**
   * Odeslat zprávu
   */
  async sendMessage(
    message: Omit<MessageRecord, 'id' | 'sentAt' | 'status' | 'readBy' | 'isDeleted' | 'isEdited'>
  ): Promise<MessageRecord> {
    const db = getDatabase();
    const now = Date.now();

    const newMessage: MessageRecord = {
      ...message,
      id: generateId(),
      status: 'sent',
      sentAt: now,
      readBy: [],
      isDeleted: false,
      isEdited: false,
    };

    await db.transaction('rw', [db.messages, db.conversations], async () => {
      // Uložit zprávu
      await db.messages.add(newMessage);

      // Aktualizovat konverzaci
      await db.conversations.update(message.conversationId, {
        lastMessageId: newMessage.id,
        lastMessageText: message.text ?? '[Příloha]',
        lastMessageSenderId: message.senderId,
        lastMessageAt: now,
        updatedAt: now,
      });
    });

    // Smazat draft
    await this.deleteDraft(message.conversationId);

    return newMessage;
  }

  /**
   * Aktualizovat zprávu (editace)
   */
  async updateMessage(
    id: string,
    text: string
  ): Promise<MessageRecord | undefined> {
    const db = getDatabase();

    await db.messages.update(id, {
      text,
      isEdited: true,
    });

    return db.messages.get(id);
  }

  /**
   * Smazat zprávu (soft delete)
   */
  async deleteMessage(id: string): Promise<void> {
    const db = getDatabase();
    await db.messages.update(id, { isDeleted: true, text: undefined });
  }

  /**
   * Označit zprávy jako přečtené
   */
  async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const db = getDatabase();

    const messages = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .filter((m) => m.senderId !== userId && !m.readBy.includes(userId))
      .toArray();

    await db.transaction('rw', [db.messages, db.conversations], async () => {
      for (const message of messages) {
        await db.messages.update(message.id, {
          readBy: [...message.readBy, userId],
          status: 'read',
        });
      }

      // Reset unread count
      await db.conversations.update(conversationId, { unreadCount: 0 });
    });
  }

  // ============ USERS ============

  /**
   * Získat všechny chat uživatele
   */
  async getUsers(): Promise<ChatUserRecord[]> {
    await this.initialize();
    const db = getDatabase();
    return db.chatUsers.toArray();
  }

  /**
   * Získat uživatele podle ID
   */
  async getUserById(id: string): Promise<ChatUserRecord | undefined> {
    await this.initialize();
    const db = getDatabase();
    return db.chatUsers.get(id);
  }

  /**
   * Získat více uživatelů podle ID
   */
  async getUsersByIds(ids: string[]): Promise<ChatUserRecord[]> {
    await this.initialize();
    const db = getDatabase();
    const users = await db.chatUsers.bulkGet(ids);
    return users.filter((u): u is ChatUserRecord => u !== undefined);
  }

  /**
   * Aktualizovat online status uživatele
   */
  async updateUserOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    const db = getDatabase();
    await db.chatUsers.update(id, {
      isOnline,
      lastSeen: isOnline ? undefined : Date.now(),
    });
  }

  // ============ DRAFTS ============

  /**
   * Získat draft pro konverzaci
   */
  async getDraft(conversationId: string): Promise<DraftRecord | undefined> {
    const db = getDatabase();
    return db.messageDrafts.get(conversationId);
  }

  /**
   * Uložit draft
   */
  async saveDraft(
    conversationId: string,
    text: string,
    replyToId?: string
  ): Promise<void> {
    const db = getDatabase();

    if (!text.trim()) {
      await this.deleteDraft(conversationId);
      return;
    }

    await db.messageDrafts.put({
      conversationId,
      text,
      replyToId,
      updatedAt: Date.now(),
    });
  }

  /**
   * Smazat draft
   */
  async deleteDraft(conversationId: string): Promise<void> {
    const db = getDatabase();
    await db.messageDrafts.delete(conversationId);
  }

  // ============ SEARCH ============

  /**
   * Vyhledat zprávy
   */
  async searchMessages(
    query: string,
    conversationId?: string
  ): Promise<MessageRecord[]> {
    const db = getDatabase();
    const lowerQuery = query.toLowerCase();

    let messages: MessageRecord[];

    if (conversationId) {
      messages = await db.messages
        .where('conversationId')
        .equals(conversationId)
        .filter((m) => m.text?.toLowerCase().includes(lowerQuery) ?? false)
        .toArray();
    } else {
      messages = await db.messages
        .filter((m) => m.text?.toLowerCase().includes(lowerQuery) ?? false)
        .toArray();
    }

    return messages.sort((a, b) => b.sentAt - a.sentAt);
  }

  // ============ STATS ============

  /**
   * Získat celkový počet nepřečtených zpráv
   */
  async getTotalUnreadCount(): Promise<number> {
    await this.initialize();
    const db = getDatabase();
    const conversations = await db.conversations.toArray();
    return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  }
}

/**
 * Singleton instance
 */
let instance: ChatRepositoryImpl | null = null;

/**
 * Získá instanci Chat repository
 */
export function getChatRepository(): ChatRepositoryImpl {
  if (!instance) {
    instance = new ChatRepositoryImpl();
  }
  return instance;
}

/**
 * Export pro kompatibilitu
 */
export const chatRepository = {
  getConversations: () => getChatRepository().getConversations(),
  getConversationById: (id: string) => getChatRepository().getConversationById(id),
  getConversationsByProjectId: (projectId: string) => getChatRepository().getConversationsByProjectId(projectId),
  createConversation: (conv: Omit<ConversationRecord, 'id' | 'createdAt' | 'updatedAt' | 'unreadCount'>) => 
    getChatRepository().createConversation(conv),
  updateConversation: (id: string, updates: Partial<Omit<ConversationRecord, 'id' | 'createdAt'>>) =>
    getChatRepository().updateConversation(id, updates),
  deleteConversation: (id: string) => getChatRepository().deleteConversation(id),
  markConversationAsRead: (id: string) => getChatRepository().markConversationAsRead(id),
  togglePinConversation: (id: string) => getChatRepository().togglePinConversation(id),
  toggleMuteConversation: (id: string) => getChatRepository().toggleMuteConversation(id),
  getMessagesForConversation: (id: string, limit?: number, before?: number) =>
    getChatRepository().getMessagesForConversation(id, limit, before),
  getMessageById: (id: string) => getChatRepository().getMessageById(id),
  sendMessage: (msg: Omit<MessageRecord, 'id' | 'sentAt' | 'status' | 'readBy' | 'isDeleted' | 'isEdited'>) =>
    getChatRepository().sendMessage(msg),
  updateMessage: (id: string, text: string) => getChatRepository().updateMessage(id, text),
  deleteMessage: (id: string) => getChatRepository().deleteMessage(id),
  markMessagesAsRead: (convId: string, userId: string) => getChatRepository().markMessagesAsRead(convId, userId),
  getUsers: () => getChatRepository().getUsers(),
  getUserById: (id: string) => getChatRepository().getUserById(id),
  getUsersByIds: (ids: string[]) => getChatRepository().getUsersByIds(ids),
  updateUserOnlineStatus: (id: string, isOnline: boolean) => getChatRepository().updateUserOnlineStatus(id, isOnline),
  getDraft: (convId: string) => getChatRepository().getDraft(convId),
  saveDraft: (convId: string, text: string, replyToId?: string) => getChatRepository().saveDraft(convId, text, replyToId),
  deleteDraft: (convId: string) => getChatRepository().deleteDraft(convId),
  searchMessages: (query: string, convId?: string) => getChatRepository().searchMessages(query, convId),
  getTotalUnreadCount: () => getChatRepository().getTotalUnreadCount(),
};

export type ChatRepository = ChatRepositoryImpl;
