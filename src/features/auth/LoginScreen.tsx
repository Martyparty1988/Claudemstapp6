/**
 * MST Login Screen
 * 
 * Přihlašovací obrazovka.
 */

import React, { useState } from 'react';
import { Button, Input } from '../../shared';
import { useAuth } from './AuthContext';

/**
 * Login mode
 */
type LoginMode = 'login' | 'register' | 'reset';

/**
 * LoginScreen Component
 */
export function LoginScreen() {
  const { signIn, signUp, signInWithGoogle, resetPassword, isLoading, error } = useAuth();
  
  const [mode, setMode] = useState<LoginMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form validation
  const isEmailValid = email.includes('@') && email.includes('.');
  const isPasswordValid = password.length >= 6;
  const isNameValid = name.trim().length >= 2;

  const canSubmit = mode === 'reset'
    ? isEmailValid
    : mode === 'register'
      ? isEmailValid && isPasswordValid && isNameValid
      : isEmailValid && isPasswordValid;

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    try {
      switch (mode) {
        case 'login':
          await signIn(email, password);
          break;
        case 'register':
          await signUp(email, password, name);
          break;
        case 'reset':
          await resetPassword(email);
          setSuccessMessage('Email pro obnovení hesla byl odeslán');
          break;
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Neznámá chyba');
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setLocalError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.message !== 'REDIRECT_STARTED') {
        setLocalError(err instanceof Error ? err.message : 'Chyba přihlášení');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col safe-area-top safe-area-bottom relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-aurora opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-float-delayed" />
      
      {/* Header */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600 flex items-center justify-center shadow-glass-glow mb-8 animate-glow page-enter">
          <span className="text-4xl font-bold text-white drop-shadow-lg">MST</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 page-enter">
          {mode === 'login' && 'Přihlášení'}
          {mode === 'register' && 'Registrace'}
          {mode === 'reset' && 'Obnovení hesla'}
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-center page-enter">
          {mode === 'login' && 'Přihlaste se do své aplikace'}
          {mode === 'register' && 'Vytvořte si nový účet'}
          {mode === 'reset' && 'Zadejte email pro obnovení hesla'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 stagger-enter">
          {/* Name (only for register) */}
          {mode === 'register' && (
            <Input
              label="Jméno"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan Novák"
              autoComplete="name"
              required
            />
          )}

          {/* Email */}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vas@email.cz"
            autoComplete="email"
            required
          />

          {/* Password (not for reset) */}
          {mode !== 'reset' && (
            <Input
              label="Heslo"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              helperText={mode === 'register' ? 'Minimálně 6 znaků' : undefined}
              required
            />
          )}

          {/* Error message */}
          {(localError || error) && (
            <div className="bg-ios-red/10 text-ios-red text-ios-footnote p-3 rounded-ios">
              {localError || error}
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="bg-ios-green/10 text-ios-green text-ios-footnote p-3 rounded-ios">
              {successMessage}
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canSubmit || isLoading}
            loading={isLoading}
          >
            {mode === 'login' && 'Přihlásit se'}
            {mode === 'register' && 'Zaregistrovat se'}
            {mode === 'reset' && 'Odeslat email'}
          </Button>

          {/* Divider */}
          {mode !== 'reset' && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ios-gray-4" />
              </div>
              <div className="relative flex justify-center text-ios-caption1">
                <span className="px-2 bg-ios-gray-6 text-ios-gray">nebo</span>
              </div>
            </div>
          )}

          {/* Google sign in */}
          {mode !== 'reset' && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <GoogleIcon className="w-5 h-5 mr-2" />
              Pokračovat s Google
            </Button>
          )}
        </form>

        {/* Mode switcher */}
        <div className="mt-8 text-center">
          {mode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-ios-blue text-ios-footnote touch-feedback"
              >
                Zapomněli jste heslo?
              </button>
              <p className="mt-4 text-ios-footnote text-ios-gray">
                Nemáte účet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-ios-blue font-medium touch-feedback"
                >
                  Zaregistrujte se
                </button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <p className="text-ios-footnote text-ios-gray">
              Již máte účet?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-ios-blue font-medium touch-feedback"
              >
                Přihlaste se
              </button>
            </p>
          )}

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-ios-blue text-ios-footnote touch-feedback"
            >
              ← Zpět na přihlášení
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center">
        <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3 mb-3">
          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-1">
            Demo přihlášení:
          </p>
          <p className="text-xs text-brand-700 dark:text-brand-300">
            admin@mst.app / admin123
          </p>
        </div>
        <p className="text-ios-caption2 text-ios-gray">
          Marty Solar Tracker v0.1.0
        </p>
      </div>
    </div>
  );
}

/**
 * Google Icon
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default LoginScreen;
