/**
 * MST Firebase Auth Service
 * 
 * Služba pro autentizaci uživatelů.
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
  type UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './config';

/**
 * MST User typ
 */
export interface MSTUser {
  id: string;
  email: string | null;
  name: string | null;
  photoUrl: string | null;
  role: 'admin' | 'manager' | 'worker';
}

/**
 * Auth state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: MSTUser | null;
  error: string | null;
}

/**
 * Mapovat Firebase User na MST User
 */
function mapFirebaseUser(user: User): MSTUser {
  return {
    id: user.uid,
    email: user.email,
    name: user.displayName,
    photoUrl: user.photoURL,
    role: 'worker', // Default role, načte se z Firestore
  };
}

/**
 * Auth Service
 */
export const authService = {
  /**
   * Přihlásit email/heslo
   */
  async signInWithEmail(email: string, password: string): Promise<MSTUser> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase není nakonfigurován');
    }

    try {
      const auth = getFirebaseAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      return mapFirebaseUser(result.user);
    } catch (error: any) {
      throw new Error(mapAuthError(error.code));
    }
  },

  /**
   * Registrovat nového uživatele
   */
  async signUp(email: string, password: string, name: string): Promise<MSTUser> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase není nakonfigurován');
    }

    try {
      const auth = getFirebaseAuth();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Nastavit jméno
      await updateProfile(result.user, { displayName: name });
      
      return mapFirebaseUser(result.user);
    } catch (error: any) {
      throw new Error(mapAuthError(error.code));
    }
  },

  /**
   * Přihlásit přes Google
   */
  async signInWithGoogle(): Promise<MSTUser> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase není nakonfigurován');
    }

    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      
      // Na mobilu použít redirect, na desktopu popup
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        // Výsledek bude zpracován v getRedirectResult
        throw new Error('REDIRECT_STARTED');
      } else {
        const result = await signInWithPopup(auth, provider);
        return mapFirebaseUser(result.user);
      }
    } catch (error: any) {
      if (error.message === 'REDIRECT_STARTED') {
        throw error;
      }
      throw new Error(mapAuthError(error.code));
    }
  },

  /**
   * Zpracovat výsledek Google redirect
   */
  async handleRedirectResult(): Promise<MSTUser | null> {
    if (!isFirebaseConfigured()) {
      return null;
    }

    try {
      const auth = getFirebaseAuth();
      const result = await getRedirectResult(auth);
      
      if (result?.user) {
        return mapFirebaseUser(result.user);
      }
      return null;
    } catch (error: any) {
      console.error('[Auth] Redirect error:', error);
      return null;
    }
  },

  /**
   * Odhlásit
   */
  async signOut(): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(mapAuthError(error.code));
    }
  },

  /**
   * Reset hesla
   */
  async resetPassword(email: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase není nakonfigurován');
    }

    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(mapAuthError(error.code));
    }
  },

  /**
   * Získat aktuálního uživatele
   */
  getCurrentUser(): MSTUser | null {
    if (!isFirebaseConfigured()) {
      return null;
    }

    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }
    
    return mapFirebaseUser(user);
  },

  /**
   * Poslouchat změny auth stavu
   */
  onAuthStateChanged(callback: (user: MSTUser | null) => void): () => void {
    if (!isFirebaseConfigured()) {
      callback(null);
      return () => {};
    }

    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (user) => {
      callback(user ? mapFirebaseUser(user) : null);
    });
  },

  /**
   * Aktualizovat profil
   */
  async updateUserProfile(updates: { name?: string; photoUrl?: string }): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase není nakonfigurován');
    }

    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Uživatel není přihlášen');
    }

    await updateProfile(user, {
      displayName: updates.name,
      photoURL: updates.photoUrl,
    });
  },
};

/**
 * Mapovat Firebase error kódy na české zprávy
 */
function mapAuthError(code: string): string {
  const errors: Record<string, string> = {
    'auth/invalid-email': 'Neplatná emailová adresa',
    'auth/user-disabled': 'Účet byl zablokován',
    'auth/user-not-found': 'Uživatel nenalezen',
    'auth/wrong-password': 'Nesprávné heslo',
    'auth/email-already-in-use': 'Email je již registrován',
    'auth/weak-password': 'Heslo je příliš slabé (min. 6 znaků)',
    'auth/too-many-requests': 'Příliš mnoho pokusů, zkuste to později',
    'auth/network-request-failed': 'Chyba připojení k internetu',
    'auth/popup-closed-by-user': 'Přihlášení bylo zrušeno',
    'auth/cancelled-popup-request': 'Přihlášení bylo zrušeno',
  };

  return errors[code] || `Chyba přihlášení (${code})`;
}

export type AuthService = typeof authService;
