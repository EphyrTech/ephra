import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firestore, storage } from '../../../firebase/config';

// Types
export interface JournalEntry {
  id?: string;
  userId: string;
  date: Date | Timestamp;
  mood: string; // Main mood: 'rad', 'good', 'meh', 'bad', 'awful'
  emotions?: string[]; // Detailed emotions like 'happy', 'anxious', etc.
  sleep?: string; // Sleep quality: 'good_sleep', 'medium_sleep', etc.
  notes: string;
  quickNote?: string; // Short note for quick thoughts
  photoUrls?: string[];
  voiceMemoUrls?: string[]; // URLs to stored voice memos
  voiceMemoDurations?: number[]; // Duration of each voice memo in seconds
  pdfUrls?: string[]; // URLs to stored PDF files
  pdfNames?: string[]; // Names of the PDF files
  sharedWithCoach: boolean;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

// Collection reference
const journalCollection = collection(firestore, 'journalEntries');

// Create a new journal entry
export const createJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(journalCollection, {
      ...entry,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

// Get a journal entry by ID
export const getJournalEntry = async (entryId: string) => {
  try {
    const docRef = doc(journalCollection, entryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as JournalEntry;
    } else {
      throw new Error('Journal entry not found');
    }
  } catch (error) {
    console.error('Error getting journal entry:', error);
    throw error;
  }
};

// Get all journal entries for a user
export const getUserJournalEntries = async (userId: string) => {
  try {
    const q = query(
      journalCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc') // Sort by creation time instead of date
    );

    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];

    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() } as JournalEntry);
    });

    return entries;
  } catch (error) {
    console.error('Error getting user journal entries:', error);
    throw error;
  }
};

// Update a journal entry
export const updateJournalEntry = async (entryId: string, updates: Partial<JournalEntry>) => {
  try {
    const docRef = doc(journalCollection, entryId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (entryId: string) => {
  try {
    const docRef = doc(journalCollection, entryId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

// Upload a photo for a journal entry
export const uploadJournalPhoto = async (userId: string, entryId: string, uri: string) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `journal/${userId}/${entryId}/${Date.now()}`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return { url: downloadURL, path: filename };
  } catch (error) {
    console.error('Error uploading journal photo:', error);
    throw error;
  }
};

// Delete a photo from a journal entry
export const deleteJournalPhoto = async (photoPath: string) => {
  try {
    const storageRef = ref(storage, photoPath);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting journal photo:', error);
    throw error;
  }
};
