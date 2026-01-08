/**
 * MST Firestore Service
 * 
 * Služba pro přístup k Firestore databázi.
 * Používá se pro sync mezi zařízeními.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type DocumentReference,
  type CollectionReference,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseFirestore, isFirebaseConfigured } from './config';

/**
 * Firestore kolekce
 */
export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  TABLES: 'tables',
  WORK_RECORDS: 'workRecords',
  WORK_STATES: 'workStates',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  SYNC_LOG: 'syncLog',
} as const;

/**
 * Sync metadata pro offline-first
 */
export interface SyncMetadata {
  localId: string;
  syncedAt: Date | null;
  version: number;
  isDeleted: boolean;
}

/**
 * Base document s metadata
 */
export interface FirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

/**
 * Firestore Service
 */
export const firestoreService = {
  /**
   * Získat kolekci
   */
  getCollection<T = DocumentData>(collectionName: string): CollectionReference<T> {
    const db = getFirebaseFirestore();
    return collection(db, collectionName) as CollectionReference<T>;
  },

  /**
   * Získat dokument reference
   */
  getDocRef<T = DocumentData>(collectionName: string, docId: string): DocumentReference<T> {
    const db = getFirebaseFirestore();
    return doc(db, collectionName, docId) as DocumentReference<T>;
  },

  /**
   * Načíst dokument
   */
  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    if (!isFirebaseConfigured()) {
      return null;
    }

    try {
      const docRef = this.getDocRef<T>(collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`[Firestore] Error getting ${collectionName}/${docId}:`, error);
      throw error;
    }
  },

  /**
   * Načíst kolekci s filtry
   */
  async getDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    if (!isFirebaseConfigured()) {
      return [];
    }

    try {
      const collectionRef = this.getCollection<T>(collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnap = await getDocs(q);
      
      return querySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`[Firestore] Error getting ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Vytvořit/přepsat dokument
   */
  async setDocument<T extends DocumentData>(
    collectionName: string,
    docId: string,
    data: T,
    userId: string
  ): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const docRef = this.getDocRef(collectionName, docId);
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      });
    } catch (error) {
      console.error(`[Firestore] Error setting ${collectionName}/${docId}:`, error);
      throw error;
    }
  },

  /**
   * Vytvořit nový dokument
   */
  async createDocument<T extends DocumentData>(
    collectionName: string,
    docId: string,
    data: T,
    userId: string
  ): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const docRef = this.getDocRef(collectionName, docId);
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId,
      });
    } catch (error) {
      console.error(`[Firestore] Error creating ${collectionName}/${docId}:`, error);
      throw error;
    }
  },

  /**
   * Aktualizovat dokument
   */
  async updateDocument<T extends Partial<DocumentData>>(
    collectionName: string,
    docId: string,
    data: T,
    userId: string
  ): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const docRef = this.getDocRef(collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      });
    } catch (error) {
      console.error(`[Firestore] Error updating ${collectionName}/${docId}:`, error);
      throw error;
    }
  },

  /**
   * Smazat dokument
   */
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const docRef = this.getDocRef(collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`[Firestore] Error deleting ${collectionName}/${docId}:`, error);
      throw error;
    }
  },

  /**
   * Soft delete - označit jako smazané
   */
  async softDeleteDocument(
    collectionName: string,
    docId: string,
    userId: string
  ): Promise<void> {
    await this.updateDocument(collectionName, docId, { isDeleted: true }, userId);
  },

  /**
   * Batch write - více operací najednou
   */
  async batchWrite(
    operations: Array<{
      type: 'set' | 'update' | 'delete';
      collection: string;
      docId: string;
      data?: DocumentData;
      userId?: string;
    }>
  ): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const db = getFirebaseFirestore();
      const batch = writeBatch(db);

      for (const op of operations) {
        const docRef = doc(db, op.collection, op.docId);

        switch (op.type) {
          case 'set':
            batch.set(docRef, {
              ...op.data,
              updatedAt: serverTimestamp(),
              updatedBy: op.userId,
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...op.data,
              updatedAt: serverTimestamp(),
              updatedBy: op.userId,
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('[Firestore] Batch write error:', error);
      throw error;
    }
  },

  /**
   * Realtime listener na dokument
   */
  subscribeToDocument<T>(
    collectionName: string,
    docId: string,
    callback: (data: T | null) => void
  ): () => void {
    if (!isFirebaseConfigured()) {
      callback(null);
      return () => {};
    }

    const docRef = this.getDocRef<T>(collectionName, docId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Realtime listener na kolekci
   */
  subscribeToCollection<T>(
    collectionName: string,
    constraints: QueryConstraint[],
    callback: (data: T[]) => void
  ): () => void {
    if (!isFirebaseConfigured()) {
      callback([]);
      return () => {};
    }

    const collectionRef = this.getCollection<T>(collectionName);
    const q = query(collectionRef, ...constraints);
    
    return onSnapshot(q, (querySnap) => {
      const data = querySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      callback(data);
    });
  },

  /**
   * Query helpers
   */
  query: {
    where,
    orderBy,
    limit,
    startAfter,
  },
};

export type FirestoreService = typeof firestoreService;
