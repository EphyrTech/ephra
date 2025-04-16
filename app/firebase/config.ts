import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Get environment variables from Expo Constants
const expoConstants = Constants.expoConfig?.extra || {};

// Firebase configuration
const firebaseConfig = {
  apiKey: expoConstants.FIREBASE_API_KEY,
  authDomain: expoConstants.FIREBASE_AUTH_DOMAIN,
  databaseURL: expoConstants.FIREBASE_DATABASE_URL,
  projectId: expoConstants.FIREBASE_PROJECT_ID,
  storageBucket: expoConstants.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: expoConstants.FIREBASE_MESSAGING_SENDER_ID,
  appId: expoConstants.FIREBASE_APP_ID,
  measurementId: expoConstants.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;
