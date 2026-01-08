/**
 * MST Auth Context
 * 
 * React context pro autentizaci.
 * Poskytuje auth stav a metody celé aplikaci.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  authService,
  isFirebaseConfigured,
  type MSTUser,
  type AuthState,
} from '../../firebase';

/**
 * Auth Context value
 */
export interface AuthContextValue extends AuthState {
  // Auth metody
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  // Stav
  isConfigured: boolean;
}

/**
 * Default hodnoty
 */
const defaultAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
};

const defaultContextValue: AuthContextValue = {
  ...defaultAuthState,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  isConfigured: false,
};

/**
 * Context
 */
const AuthContext = createContext<AuthContextValue>(defaultContextValue);

/**
 * Auth Provider Props
 */
export interface AuthProviderProps {
  children: ReactNode;
  /** Přeskočit auth v development módu */
  skipAuth?: boolean;
}

/**
 * Demo credentials
 */
const DEMO_CREDENTIALS = {
  email: 'admin@mst.app',
  password: 'admin123',
  user: {
    id: 'demo-admin',
    email: 'admin@mst.app',
    name: 'Admin MST',
    photoUrl: null,
    role: 'admin' as const,
  },
};

/**
 * Auth Provider Component
 */
export function AuthProvider({ children, skipAuth = false }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(defaultAuthState);
  const isConfigured = isFirebaseConfigured();

  // Inicializace - poslouchat auth změny
  useEffect(() => {
    // Pokud skipAuth, přeskočit
    if (skipAuth) {
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: 'dev-user',
          email: 'dev@example.com',
          name: 'Developer',
          photoUrl: null,
          role: 'admin',
        },
        error: null,
      });
      return;
    }

    // Pokud není Firebase konfigurován, čekáme na demo login
    if (!isConfigured) {
      console.log('[Auth] Firebase not configured - demo mode available');
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
      return;
    }

    // Zpracovat případný Google redirect
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

    // Poslouchat změny auth stavu
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setState({
        isAuthenticated: user !== null,
        isLoading: false,
        user,
        error: null,
      });
    });

    return () => unsubscribe();
  }, [isConfigured, skipAuth]);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Demo login - funguje i bez Firebase
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      console.log('[Auth] Demo login successful');
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: DEMO_CREDENTIALS.user,
        error: null,
      });
      return;
    }

    // Pokud není Firebase, odmítnout jiné přihlášení
    if (!isConfigured) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Použijte demo přihlášení: admin@mst.app / admin123',
      }));
      throw new Error('Použijte demo přihlášení: admin@mst.app / admin123');
    }

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
  }, [isConfigured]);

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
      // Ignorovat REDIRECT_STARTED - to není chyba
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
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

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
      throw error;
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authService.resetPassword(email);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Chyba resetování hesla',
      }));
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
    isConfigured,
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
 * withAuth HOC - pro class komponenty (legacy)
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P & AuthContextValue>
) {
  return function WithAuthComponent(props: P) {
    const auth = useAuth();
    return <Component {...props} {...auth} />;
  };
}
