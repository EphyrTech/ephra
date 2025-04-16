import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Get environment variables from Expo Constants
const expoConstants = Constants.expoConfig?.extra || {};

// Your web app's Firebase configuration
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
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, firestore, storage, googleProvider };
