import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import * as authService from '../services/authService';
import type { AuthContextType, FirebaseUser } from '../types/firebase';
import { useToastStore } from '../stores/toastStore';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await authService.getUserData(firebaseUser.uid);
          setUser(userData);

          // Clear localStorage on first login (data migration)
          const hasCleared = localStorage.getItem('firebase_migration_done');
          if (!hasCleared) {
            localStorage.removeItem('saved_backtests');
            localStorage.setItem('firebase_migration_done', 'true');
            addToast('Account creato! I tuoi backtest saranno salvati nel cloud.', 'success');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [addToast]);

  const login = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      addToast('Login effettuato con successo!', 'success');
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      addToast(errorMessage, 'error');
      throw error;
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      await authService.signup(email, password, displayName);
      addToast('Account creato con successo!', 'success');
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      addToast(errorMessage, 'error');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await authService.loginWithGoogle();
      addToast('Login con Google effettuato!', 'success');
    } catch (error: any) {
      // Don't show error if user closes popup
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        const errorMessage = getFirebaseErrorMessage(error.code);
        addToast(errorMessage, 'error');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      addToast('Logout effettuato', 'info');
    } catch (error: any) {
      addToast('Errore durante il logout', 'error');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
      addToast('Email di reset inviata! Controlla la tua casella.', 'success');
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      addToast(errorMessage, 'error');
      throw error;
    }
  };

  const incrementBacktestCount = async () => {
    if (!user) throw new Error('User not authenticated');

    await updateDoc(doc(db, 'users', user.uid), {
      backtestExecutionCount: increment(1),
    });

    // Update local state
    setUser((prev) =>
      prev
        ? {
            ...prev,
            backtestExecutionCount: prev.backtestExecutionCount + 1,
          }
        : null
    );
  };

  const canRunBacktest = (): boolean => {
    if (!user) return false;
    if (user.isPremium) return true;
    return user.backtestExecutionCount < 5; // Free tier: 5 backtests
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    resetPassword,
    incrementBacktestCount,
    canRunBacktest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Helper function to translate Firebase error codes to Italian messages
function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Email non valida';
    case 'auth/user-disabled':
      return 'Account disabilitato';
    case 'auth/user-not-found':
      return 'Email o password non corretti';
    case 'auth/wrong-password':
      return 'Email o password non corretti';
    case 'auth/email-already-in-use':
      return 'Email già registrata. Prova a fare login.';
    case 'auth/weak-password':
      return 'Password troppo debole. Usa almeno 6 caratteri.';
    case 'auth/too-many-requests':
      return 'Troppi tentativi. Riprova più tardi.';
    case 'auth/network-request-failed':
      return 'Errore di connessione. Verifica la tua rete.';
    default:
      return 'Errore durante l\'autenticazione. Riprova.';
  }
}
