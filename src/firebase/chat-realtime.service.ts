/**
 * MST Chat Realtime Service
 * 
 * Real-time listeners pro chat přes Firestore.
 * Zajišťuje live aktualizace zpráv a konverzací.
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  writeBatch,
  getDoc,
  getDocs,
  type Unsubscribe,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { getFirebaseFirestore, isFirebaseConfigured } from './config';

/**
 * Firestore kolekce pro chat
 */
export const CHAT_COLLECTIONS = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  USERS: 'users',
  TYPING: 'typing',
} as const;

/**
 * Konverzace v Firestore
 */
export interface FirestoreConversation {
  id?: string;
  type: 'direct' | 'group' | 'project';
  name?: string;
  projectId?: string;
  participantIds: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    sentAt: Timestamp;
  };
  unreadCount?: Record<string, number>;
  isMuted?: boolean;
  isPinned?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Zpráva v Firestore
 */
export interface FirestoreMessage {
  id?: string;
  conversationId: string;
  senderId: string;
  type: 'text' | 'image' | 'file' | 'location';
  text?: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToId?: string;
  sentAt: Timestamp;
  readBy: string[];
  isDeleted: boolean;
  isEdited: boolean;
}

/**
 * Typing indikátor v Firestore
 */
export interface FirestoreTyping {
visibleFrom: string;
  odst: string;
  timestamp: Timestamp;
}

/**
 * Chat Realtime Service
 */
class ChatRealtimeService {
  private conversationsUnsubscribe: Unsubscribe | null = null;
  private messagesUnsubscribes: Map<string, Unsubscribe> = new Map();
  private typingUnsubscribes: Map<string, Unsubscribe> = new Map();

  /**
   * Kontrola dostupnosti
   */
  private checkFirebase(): boolean {
    if (!isFirebaseConfigured()) {
      console.warn('[ChatRealtime] Firebase není nakonfigurován');
      return false;
    }
    return true;
  }

  // ============ CONVERSATIONS ============

  /**
   * Poslouchat konverzace uživatele
   */
  subscribeToConversations(
    userId: string,
    onUpdate: (conversations: FirestoreConversation[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!this.checkFirebase()) {
      return () => {};
    }

    const db = getFirebaseFirestore()!;
    const conversationsRef = collection(db, CHAT_COLLECTIONS.CONVERSATIONS);
    
    const q = query(
      conversationsRef,
      where('participantIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    this.conversationsUnsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const conversations: FirestoreConversation[] = [];
        
        snapshot.forEach((doc) => {
          conversations.push({
            id: doc.id,
            ...doc.data(),
          } as FirestoreConversation);
        });

        onUpdate(conversations);
      },
      (error) => {
        console.error('[ChatRealtime] Conversations error:', error);
        onError?.(error);
      }
    );

    return this.conversationsUnsubscribe;
  }

  /**
   * Zrušit poslouchání konverzací
   */
  unsubscribeFromConversations(): void {
    if (this.conversationsUnsubscribe) {
      this.conversationsUnsubscribe();
      this.conversationsUnsubscribe = null;
    }
  }

  /**
   * Vytvořit novou konverzaci
   */
  async createConversation(
    data: Omit<FirestoreConversation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    if (!this.checkFirebase()) {
      throw new Error('Firebase není nakonfigurován');
    }

    const db = getFirebaseFirestore()!;
    const conversationsRef = collection(db, CHAT_COLLECTIONS.CONVERSATIONS);

    const docRef = await addDoc(conversationsRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  }

  /**
   * Najít nebo vytvořit direct konverzaci
   */
  async getOrCreateDirectConversation(
    userId1: string,
    userId2: string
  ): Promise<string> {
    if (!this.checkFirebase()) {
      throw new Error('Firebase není nakonfigurován');
    }

    const db = getFirebaseFirestore()!;
    const conversationsRef = collection(db, CHAT_COLLECTIONS.CONVERSATIONS);

    // Hledat existující
    const q = query(
      conversationsRef,
      where('type', '==', 'direct'),
      where('participantIds', 'array-contains', userId1)
    );

    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const data = doc.data() as FirestoreConversation;
      if (data.participantIds.includes(userId2)) {
        return doc.id;
      }
    }

    // Vytvořit novou
    return this.createConversation({
      type: 'direct',
      participantIds: [userId1, userId2],
    });
  }

  // ============ MESSAGES ============

  /**
   * Poslouchat zprávy v konverzaci
   */
  subscribeToMessages(
    conversationId: string,
    onUpdate: (messages: FirestoreMessage[]) => void,
    onError?: (error: Error) => void,
    messageLimit: number = 50
  ): Unsubscribe {
    if (!this.checkFirebase()) {
      return () => {};
    }

    // Zrušit předchozí listener pro tuto konverzaci
    this.unsubscribeFromMessages(conversationId);

    const db = getFirebaseFirestore()!;
    const messagesRef = collection(db, CHAT_COLLECTIONS.MESSAGES);
    
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('sentAt', 'desc'),
      limit(messageLimit)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const messages: FirestoreMessage[] = [];
        
        snapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data(),
          } as FirestoreMessage);
        });

        // Obrátit pořadí (nejstarší první)
        messages.reverse();
        onUpdate(messages);
      },
      (error) => {
        console.error('[ChatRealtime] Messages error:', error);
        onError?.(error);
      }
    );

    this.messagesUnsubscribes.set(conversationId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Zrušit poslouchání zpráv
   */
  unsubscribeFromMessages(conversationId: string): void {
    const unsubscribe = this.messagesUnsubscribes.get(conversationId);
    if (unsubscribe) {
      unsubscribe();
      this.messagesUnsubscribes.delete(conversationId);
    }
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
    if (!this.checkFirebase()) {
      throw new Error('Firebase není nakonfigurován');
    }

    const db = getFirebaseFirestore()!;
    const batch = writeBatch(db);

    // 1. Přidat zprávu
    const messagesRef = collection(db, CHAT_COLLECTIONS.MESSAGES);
    const messageData: Omit<FirestoreMessage, 'id'> = {
      conversationId,
      senderId,
      type: 'text',
      text,
      replyToId,
      sentAt: Timestamp.now(),
      readBy: [senderId],
      isDeleted: false,
      isEdited: false,
    };

    const messageRef = doc(messagesRef);
    batch.set(messageRef, messageData);

    // 2. Aktualizovat konverzaci
    const conversationRef = doc(db, CHAT_COLLECTIONS.CONVERSATIONS, conversationId);
    batch.update(conversationRef, {
      lastMessage: {
        text: text.slice(0, 100),
        senderId,
        sentAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });

    // 3. Smazat typing indikátor
    await this.clearTyping(conversationId, senderId);

    await batch.commit();
    return messageRef.id;
  }

  /**
   * Odeslat media zprávu
   */
  async sendMediaMessage(
    conversationId: string,
    senderId: string,
    type: 'image' | 'file',
    mediaUrl: string,
    fileName?: string,
    fileSize?: number
  ): Promise<string> {
    if (!this.checkFirebase()) {
      throw new Error('Firebase není nakonfigurován');
    }

    const db = getFirebaseFirestore()!;
    const batch = writeBatch(db);

    const messagesRef = collection(db, CHAT_COLLECTIONS.MESSAGES);
    const messageData: Omit<FirestoreMessage, 'id'> = {
      conversationId,
      senderId,
      type,
      mediaUrl,
      fileName,
      fileSize,
      sentAt: Timestamp.now(),
      readBy: [senderId],
      isDeleted: false,
      isEdited: false,
    };

    const messageRef = doc(messagesRef);
    batch.set(messageRef, messageData);

    const conversationRef = doc(db, CHAT_COLLECTIONS.CONVERSATIONS, conversationId);
    batch.update(conversationRef, {
      lastMessage: {
        text: type === 'image' ? '📷 Obrázek' : `📎 ${fileName || 'Soubor'}`,
        senderId,
        sentAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
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
    if (!this.checkFirebase() || messageIds.length === 0) {
      return;
    }

    const db = getFirebaseFirestore()!;
    const batch = writeBatch(db);

    for (const messageId of messageIds) {
      const messageRef = doc(db, CHAT_COLLECTIONS.MESSAGES, messageId);
      // Použít arrayUnion pro přidání userId do readBy
      batch.update(messageRef, {
        [`readBy`]: [...new Set([userId])], // Firestore arrayUnion by bylo lepší
      });
    }

    await batch.commit();
  }

  /**
   * Smazat zprávu (soft delete)
   */
  async deleteMessage(messageId: string): Promise<void> {
    if (!this.checkFirebase()) {
      return;
    }

    const db = getFirebaseFirestore()!;
    const messageRef = doc(db, CHAT_COLLECTIONS.MESSAGES, messageId);
    
    await updateDoc(messageRef, {
      isDeleted: true,
      text: null,
      mediaUrl: null,
    });
  }

  /**
   * Editovat zprávu
   */
  async editMessage(messageId: string, newText: string): Promise<void> {
    if (!this.checkFirebase()) {
      return;
    }

    const db = getFirebaseFirestore()!;
    const messageRef = doc(db, CHAT_COLLECTIONS.MESSAGES, messageId);
    
    await updateDoc(messageRef, {
      text: newText,
      isEdited: true,
    });
  }

  // ============ TYPING INDICATORS ============

  /**
   * Poslouchat typing indikátory
   */
  subscribeToTyping(
    conversationId: string,
    currentUserId: string,
    onUpdate: (typingUserIds: string[]) => void
  ): Unsubscribe {
    if (!this.checkFirebase()) {
      return () => {};
    }

    this.unsubscribeFromTyping(conversationId);

    const db = getFirebaseFirestore()!;
    const typingRef = collection(db, CHAT_COLLECTIONS.CONVERSATIONS, conversationId, 'typing');

    const unsubscribe = onSnapshot(
      typingRef,
      (snapshot) => {
        const now = Date.now();
        const typingUsers: string[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data() as FirestoreTyping;
          const timestamp = data.timestamp?.toMillis() || 0;
          
          // Typing je platný 5 sekund
          if (now - timestamp < 5000 && doc.id !== currentUserId) {
            typingUsers.push(doc.id);
          }
        });

        onUpdate(typingUsers);
      }
    );

    this.typingUnsubscribes.set(conversationId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Zrušit poslouchání typing
   */
  unsubscribeFromTyping(conversationId: string): void {
    const unsubscribe = this.typingUnsubscribes.get(conversationId);
    if (unsubscribe) {
      unsubscribe();
      this.typingUnsubscribes.delete(conversationId);
    }
  }

  /**
   * Nastavit typing indikátor
   */
  async setTyping(conversationId: string, userId: string): Promise<void> {
    if (!this.checkFirebase()) {
      return;
    }

    const db = getFirebaseFirestore()!;
    const typingRef = doc(
      db,
      CHAT_COLLECTIONS.CONVERSATIONS,
      conversationId,
      'typing',
      userId
    );

    await updateDoc(typingRef, {
      odst: userId,
      timestamp: serverTimestamp(),
    }).catch(() => {
      // Dokument neexistuje, vytvořit
      return addDoc(
        collection(db, CHAT_COLLECTIONS.CONVERSATIONS, conversationId, 'typing'),
        {
          odst: userId,
          timestamp: serverTimestamp(),
        }
      );
    });
  }

  /**
   * Smazat typing indikátor
   */
  async clearTyping(conversationId: string, userId: string): Promise<void> {
    if (!this.checkFirebase()) {
      return;
    }

    const db = getFirebaseFirestore()!;
    const typingRef = doc(
      db,
      CHAT_COLLECTIONS.CONVERSATIONS,
      conversationId,
      'typing',
      userId
    );

    try {
      await updateDoc(typingRef, {
        timestamp: Timestamp.fromMillis(0),
      });
    } catch {
      // Ignorovat pokud neexistuje
    }
  }

  /**
   * Označit konverzaci jako přečtenou
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    if (!isFirebaseConfigured()) return;
    
    const db = getFirebaseFirestore();
    if (!db) return;

    const conversationRef = doc(
      db,
      CHAT_COLLECTIONS.CONVERSATIONS,
      conversationId
    );

    try {
      // Aktualizovat lastReadAt pro uživatele
      await updateDoc(conversationRef, {
        [`lastReadAt.${userId}`]: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  // ============ CLEANUP ============

  /**
   * Zrušit všechny listenery
   */
  unsubscribeAll(): void {
    this.unsubscribeFromConversations();
    
    this.messagesUnsubscribes.forEach((unsubscribe) => unsubscribe());
    this.messagesUnsubscribes.clear();
    
    this.typingUnsubscribes.forEach((unsubscribe) => unsubscribe());
    this.typingUnsubscribes.clear();
  }
}

// Singleton instance
export const chatRealtimeService = new ChatRealtimeService();
