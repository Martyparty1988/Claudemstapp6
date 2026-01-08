/**
 * MST useAuth Hook
 * 
 * React hook pro autentizaci.
 */

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { authService, type MSTUser, type AuthState, isFirebaseConfigured } from '../../firebase';

/**
 * Auth Context
 */
interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  // Listen to auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // Firebase není nakonfigurován - použít demo uživatele
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: 'demo-user',
          email: 'demo@mst.app',
          name: 'Demo Uživatel',
          photoUrl: null,
          role: 'worker',
        },
        error: null,
      });
      return;
    }

    const unsubscribe = authService.onAuthStateChanged((user) => {
      setState({
        isAuthenticated: user !== null,
        isLoading: false,
        user,
        error: null,
      });
    });

    // Check for redirect result (Google Sign-In on mobile)
    authService.handleRedirectResult().then((user) => {
      if (user) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          user,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  // Sign in with email
  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await authService.signInWithEmail(email, password);
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Chyba přihlášení',
      }));
      throw error;
    }
  }, []);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await authService.signUp(email, password, name);
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Chyba registrace',
      }));
      throw error;
    }
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await authService.signInWithGoogle();
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null,
      });
    } catch (error: any) {
      // Redirect started - nejedná se o chybu
      if (error.message === 'REDIRECT_STARTED') {
        return;
      }
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Chyba přihlášení',
      }));
      throw error;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await authService.signOut();
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Chyba odhlášení',
      }));
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

/**
 * useRequireAuth - redirect pokud není přihlášen
 */
export function useRequireAuth(): AuthContextValue & { isReady: boolean } {
  const auth = useAuth();
  
  return {
    ...auth,
    isReady: !auth.isLoading,
  };
}
