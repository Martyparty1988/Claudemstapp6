/**
 * MST Real-time Chat Service
 * 
 * Firebase Firestore real-time listeners pro chat.
 * Synchronizace zpráv a konverzací v reálném čase.
 */

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { getFirebaseFirestore, isFirebaseConfigured } from './config';
import type { Conversation, Message, ChatUser } from '../domain/types';

/**
 * Firestore kolekce
 */
const CHAT_COLLECTIONS = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  USERS: 'users',
  TYPING: 'typing',
} as const;

/**
 * Callback typy
 */
type ConversationsCallback = (conversations: Conversation[]) => void;
type MessagesCallback = (messages: Message[]) => void;
type TypingCallback = (typingUsers: string[]) => void;
type ErrorCallback = (error: Error) => void;

/**
 * Mapovat Firestore dokument na Conversation
 */
function mapDocToConversation(doc: DocumentData, id: string): Conversation {
  const data = doc;
  return {
    id,
    type: data.type || 'direct',
    participantIds: data.participantIds || [],
    name: data.name,
    projectId: data.projectId,
    lastMessage: data.lastMessage,
    unreadCount: data.unreadCount || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    isMuted: data.isMuted || false,
    isPinned: data.isPinned || false,
  };
}

/**
 * Mapovat Firestore dokument na Message
 */
function mapDocToMessage(doc: DocumentData, id: string): Message {
  const data = doc;
  return {
    id,
    conversationId: data.conversationId,
    senderId: data.senderId,
    text: data.text || '',
    replyTo: data.replyToId,
    status: data.status || 'sent',
    sentAt: data.sentAt?.toDate() || new Date(),
    deliveredAt: data.deliveredAt?.toDate(),
    readBy: data.readBy || [],
    isDeleted: data.isDeleted || false,
    isEdited: data.isEdited || false,
  } as Message;
}

/**
 * Real-time Chat Service
 */
class RealtimeChatService {
  private conversationsUnsubscribe: Unsubscribe | null = null;
  private messagesUnsubscribes: Map<string, Unsubscribe> = new Map();
  private typingUnsubscribes: Map<string, Unsubscribe> = new Map();

  /**
   * Kontrola dostupnosti
   */
  isAvailable(): boolean {
    return isFirebaseConfigured();
  }

  /**
   * Poslouchat konverzace uživatele
   */
  subscribeToConversations(
    userId: string,
    onData: ConversationsCallback,
    onError?: ErrorCallback
  ): Unsubscribe {
    if (!this.isAvailable()) {
      console.warn('[RealtimeChat] Firebase not configured');
      return () => {};
    }

    const firestore = getFirebaseFirestore();
    if (!firestore) return () => {};

    // Zrušit předchozí subscription
    this.conversationsUnsubscribe?.();

    const q = query(
      collection(firestore, CHAT_COLLECTIONS.CONVERSATIONS),
      where('participantIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    this.conversationsUnsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const conversations = snapshot.docs.map((doc) =>
          mapDocToConversation(doc.data(), doc.id)
        );
        onData(conversations);
      },
      (error) => {
        console.error('[RealtimeChat] Conversations error:', error);
        onError?.(error);
      }
    );

    return this.conversationsUnsubscribe;
  }

  /**
   * Poslouchat zprávy v konverzaci
   */
  subscribeToMessages(
    conversationId: string,
    onData: MessagesCallback,
    onError?: ErrorCallback,
    messageLimit: number = 50
  ): Unsubscribe {
    if (!this.isAvailable()) {
      console.warn('[RealtimeChat] Firebase not configured');
      return () => {};
    }

    const firestore = getFirebaseFirestore();
    if (!firestore) return () => {};

    // Zrušit předchozí subscription pro tuto konverzaci
    this.messagesUnsubscribes.get(conversationId)?.();

    const q = query(
      collection(firestore, CHAT_COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId),
      orderBy('sentAt', 'desc'),
      limit(messageLimit)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const messages = snapshot.docs
          .map((doc) => mapDocToMessage(doc.data(), doc.id))
          .reverse(); // Obrátit pořadí - nejstarší první
        onData(messages);
      },
      (error) => {
        console.error('[RealtimeChat] Messages error:', error);
        onError?.(error);
      }
    );

    this.messagesUnsubscribes.set(conversationId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Poslouchat typing indikátory
   */
  subscribeToTyping(
    conversationId: string,
    currentUserId: string,
    onData: TypingCallback
  ): Unsubscribe {
    if (!this.isAvailable()) {
      return () => {};
    }

    const firestore = getFirebaseFirestore();
    if (!firestore) return () => {};

    // Zrušit předchozí subscription
    this.typingUnsubscribes.get(conversationId)?.();

    const typingRef = doc(
      firestore,
      CHAT_COLLECTIONS.CONVERSATIONS,
      conversationId,
      CHAT_COLLECTIONS.TYPING,
      'status'
    );

    const unsubscribe = onSnapshot(
      typingRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          onData([]);
          return;
        }

        const data = snapshot.data();
        const typingUsers: string[] = [];

        // Filtrovat uživatele co píší (kromě sebe)
        Object.entries(data || {}).forEach(([odUserId, timestamp]) => {
          if (odUserId === currentUserId) return;

          // Ignorovat staré typing (> 5s)
          const ts = timestamp as Timestamp;
          if (ts && Date.now() - ts.toMillis() < 5000) {
            typingUsers.push(odUserId);
          }
        });

        onData(typingUsers);
      },
      (error) => {
        console.error('[RealtimeChat] Typing error:', error);
      }
    );

    this.typingUnsubscribes.set(conversationId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Odeslat zprávu
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    text: string,
    replyToId?: string
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Firebase not configured');
    }

    const firestore = getFirebaseFirestore();
    if (!firestore) throw new Error('Firestore not available');

    const messageData = {
      conversationId,
      senderId,
      type: 'text',
      text,
      replyToId: replyToId || null,
      status: 'sent',
      sentAt: serverTimestamp(),
      readBy: [senderId],
      isDeleted: false,
      isEdited: false,
    };

    // Přidat zprávu
    const messageRef = await addDoc(
      collection(firestore, CHAT_COLLECTIONS.MESSAGES),
      messageData
    );

    // Aktualizovat konverzaci
    const convRef = doc(firestore, CHAT_COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(convRef, {
      lastMessageId: messageRef.id,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return messageRef.id;
  }

  /**
   * Označit zprávy jako přečtené
   */
  async markMessagesAsRead(
    conversationId: string,
    userId: string,
    messageIds: string[]
  ): Promise<void> {
    if (!this.isAvailable() || messageIds.length === 0) {
      return;
    }

    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    // Aktualizovat zprávy
    const updatePromises = messageIds.map((messageId) => {
      const messageRef = doc(firestore, CHAT_COLLECTIONS.MESSAGES, messageId);
      return updateDoc(messageRef, {
        status: 'read',
        readAt: serverTimestamp(),
        [`readBy`]: [...new Set([userId])], // Přidat userId do readBy
      });
    });

    await Promise.all(updatePromises);

    // Reset unread count na konverzaci
    const convRef = doc(firestore, CHAT_COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(convRef, {
      [`unreadCount.${userId}`]: 0,
    });
  }

  /**
   * Nastavit typing status
   */
  async setTyping(
    conversationId: string,
    odId: string,
    isTyping: boolean
  ): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    const typingRef = doc(
      firestore,
      CHAT_COLLECTIONS.CONVERSATIONS,
      conversationId,
      CHAT_COLLECTIONS.TYPING,
      'status'
    );

    if (isTyping) {
      await updateDoc(typingRef, {
        [odId]: serverTimestamp(),
      }).catch(() => {
        // Dokument neexistuje, vytvořit
        // Pro jednoduchost ignorujeme chybu
      });
    } else {
      await updateDoc(typingRef, {
        [odId]: null,
      }).catch(() => {});
    }
  }

  /**
   * Vytvořit konverzaci
   */
  async createConversation(
    type: 'direct' | 'group' | 'project',
    participantIds: string[],
    name?: string,
    projectId?: string
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Firebase not configured');
    }

    const firestore = getFirebaseFirestore();
    if (!firestore) throw new Error('Firestore not available');

    // Pro direct chat - zkontrolovat jestli už existuje
    if (type === 'direct' && participantIds.length === 2) {
      const existingConversation = await this.findExistingDirectConversation(
        participantIds[0],
        participantIds[1]
      );
      if (existingConversation) {
        return existingConversation;
      }
    }

    const conversationData = {
      type,
      participantIds,
      name: name || null,
      projectId: projectId || null,
      unreadCount: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isMuted: false,
      isPinned: false,
    };

    const convRef = await addDoc(
      collection(firestore, CHAT_COLLECTIONS.CONVERSATIONS),
      conversationData
    );

    return convRef.id;
  }

  /**
   * Najít existující direct konverzaci mezi dvěma uživateli
   */
  private async findExistingDirectConversation(
    userId1: string,
    userId2: string
  ): Promise<string | null> {
    const firestore = getFirebaseFirestore();
    if (!firestore) return null;

    try {
      // Hledáme konverzaci kde jsou oba uživatelé
      const q = query(
        collection(firestore, CHAT_COLLECTIONS.CONVERSATIONS),
        where('type', '==', 'direct'),
        where('participantIds', 'array-contains', userId1)
      );

      const snapshot = await getDocs(q);
      
      // Filtrujeme podle druhého uživatele
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (
          data.participantIds?.length === 2 &&
          data.participantIds.includes(userId2)
        ) {
          return doc.id;
        }
      }

      return null;
    } catch (error) {
      console.error('[ChatRealtime] Find existing conversation error:', error);
      return null;
    }
  }

  /**
   * Připnout/odepnout konverzaci
   */
  async togglePin(conversationId: string, isPinned: boolean): Promise<void> {
    if (!this.isAvailable()) return;

    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    const convRef = doc(firestore, CHAT_COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(convRef, { isPinned });
  }

  /**
   * Ztlumit/odtlumit konverzaci
   */
  async toggleMute(conversationId: string, isMuted: boolean): Promise<void> {
    if (!this.isAvailable()) return;

    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    const convRef = doc(firestore, CHAT_COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(convRef, { isMuted });
  }

  /**
   * Smazat zprávu (soft delete)
   */
  async deleteMessage(messageId: string): Promise<void> {
    if (!this.isAvailable()) return;

    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    const messageRef = doc(firestore, CHAT_COLLECTIONS.MESSAGES, messageId);
    await updateDoc(messageRef, {
      isDeleted: true,
      text: null,
      fileUrl: null,
    });
  }

  /**
   * Upravit zprávu
   */
  async editMessage(messageId: string, newText: string): Promise<void> {
    if (!this.isAvailable()) return;

    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    const messageRef = doc(firestore, CHAT_COLLECTIONS.MESSAGES, messageId);
    await updateDoc(messageRef, {
      text: newText,
      isEdited: true,
      editedAt: serverTimestamp(),
    });
  }

  /**
   * Označit konverzaci jako přečtenou pro uživatele
   */
  async markAsRead(conversationId: string, oderId: string): Promise<void> {
    if (!this.isAvailable()) return;

    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    try {
      const convRef = doc(firestore, CHAT_COLLECTIONS.CONVERSATIONS, conversationId);
      await updateDoc(convRef, {
        [`unreadCount.${oderId}`]: 0,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('[ChatRealtime] Mark as read error:', error);
    }
  }

  /**
   * Zrušit všechny subscriptions
   */
  unsubscribeAll(): void {
    this.conversationsUnsubscribe?.();
    this.conversationsUnsubscribe = null;

    this.messagesUnsubscribes.forEach((unsubscribe) => unsubscribe());
    this.messagesUnsubscribes.clear();

    this.typingUnsubscribes.forEach((unsubscribe) => unsubscribe());
    this.typingUnsubscribes.clear();
  }
}

// Singleton instance
export const realtimeChatService = new RealtimeChatService();

export type { RealtimeChatService };
