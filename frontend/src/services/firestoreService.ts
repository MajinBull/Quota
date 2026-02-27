import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { SavedBacktest } from '../stores/comparisonStore';
import type { Portfolio, BacktestResult } from '../types';

export async function saveBacktest(
  userId: string,
  name: string,
  portfolio: Portfolio,
  result: BacktestResult,
  isFavorite: boolean = false
): Promise<string> {
  const docRef = await addDoc(collection(db, 'backtests'), {
    userId,
    name: name.trim(),
    savedAt: serverTimestamp(),
    isFavorite,
    portfolio,
    result, // Already compressed by comparisonStore
  });

  return docRef.id;
}

export async function getUserBacktests(userId: string): Promise<SavedBacktest[]> {
  const q = query(
    collection(db, 'backtests'),
    where('userId', '==', userId),
    orderBy('savedAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      savedAt: (data.savedAt as Timestamp).toDate().toISOString(),
      isFavorite: data.isFavorite,
      portfolio: data.portfolio as Portfolio,
      result: data.result as BacktestResult,
    };
  });
}

export async function deleteBacktest(backtestId: string): Promise<void> {
  await deleteDoc(doc(db, 'backtests', backtestId));
}

export async function renameBacktest(backtestId: string, newName: string): Promise<void> {
  await updateDoc(doc(db, 'backtests', backtestId), {
    name: newName.trim(),
  });
}

export async function toggleFavorite(backtestId: string, isFavorite: boolean): Promise<void> {
  await updateDoc(doc(db, 'backtests', backtestId), {
    isFavorite,
  });
}
