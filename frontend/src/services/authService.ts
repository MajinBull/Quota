import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import type { FirebaseUser } from '../types/firebase';

export async function signup(
  email: string,
  password: string,
  displayName: string
): Promise<void> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Create user document in Firestore
    try {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        displayName,
        isPremium: false,
        backtestExecutionCount: 0,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } catch (firestoreError) {
      console.error('Firestore document creation failed:', firestoreError);
      // Auth account was created but Firestore doc failed
      // This is OK - will be created on next login via ensureUserDocument
      throw new Error('FIRESTORE_BLOCKED');
    }
  } catch (error: any) {
    // If error is FIRESTORE_BLOCKED, re-throw with custom message
    if (error.message === 'FIRESTORE_BLOCKED') {
      throw error;
    }

    // If account already exists, check if we need to create the Firestore doc
    if (error.code === 'auth/email-already-in-use') {
      // Try to sign in and ensure document exists
      try {
        await signInWithEmailAndPassword(auth, email, password);
        const user = auth.currentUser;
        if (user) {
          await ensureUserDocument(user.uid, email, displayName);
        }
        // Successfully recovered - user is now logged in with document
        return;
      } catch (recoveryError) {
        // Re-throw original error
        throw error;
      }
    }

    throw error;
  }
}

// Helper function to ensure user document exists
async function ensureUserDocument(
  uid: string,
  email: string,
  displayName: string
): Promise<void> {
  const userDoc = await getDoc(doc(db, 'users', uid));

  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', uid), {
      email,
      displayName,
      isPremium: false,
      backtestExecutionCount: 0,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  } else {
    // Update last login
    await setDoc(
      doc(db, 'users', uid),
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export async function login(email: string, password: string): Promise<void> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  // Ensure user document exists and update last login
  const user = userCredential.user;
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // Document doesn't exist - create it (recovery from failed signup)
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          isPremium: false,
          backtestExecutionCount: 0,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      } else {
        // Update last login
        await setDoc(
          doc(db, 'users', user.uid),
          {
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (firestoreError) {
      console.error('Firestore update failed during login:', firestoreError);
      // Continue anyway - user is authenticated
    }
  }
}

export async function loginWithGoogle(): Promise<void> {
  const result = await signInWithPopup(auth, googleProvider);

  // Check if user document exists, create if not
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));

  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      displayName: result.user.displayName,
      isPremium: false,
      backtestExecutionCount: 0,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  } else {
    // Update last login
    await setDoc(
      doc(db, 'users', result.user.uid),
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function getUserData(uid: string): Promise<FirebaseUser | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    return {
      uid,
      email: data.email,
      displayName: data.displayName,
      isPremium: data.isPremium || false,
      backtestExecutionCount: data.backtestExecutionCount || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Export function to create missing user document (recovery)
export async function createMissingUserDocument(
  uid: string,
  email: string,
  displayName: string
): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    email,
    displayName,
    isPremium: false,
    backtestExecutionCount: 0,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });
}
