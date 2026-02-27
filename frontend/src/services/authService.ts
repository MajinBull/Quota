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
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Create user document in Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email: userCredential.user.email,
    displayName,
    isPremium: false,
    backtestExecutionCount: 0,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });
}

export async function login(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);

  // Update last login
  const user = auth.currentUser;
  if (user) {
    await setDoc(
      doc(db, 'users', user.uid),
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
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
}
