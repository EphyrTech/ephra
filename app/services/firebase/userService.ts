import {
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { auth, firestore, storage } from '../../../firebase/config';

// Types
export interface UserProfile {
  displayName?: string;
  photoURL?: string;
  email?: string;
  dob?: string | null;
  country?: string | null;
  phoneNumber?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Update user profile in Firebase Auth and Firestore
export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Update Auth profile (only supports displayName and photoURL)
    if (profileData.displayName || profileData.photoURL) {
      await updateProfile(currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });
    }

    // Update Firestore profile (supports all fields)
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new document
      await setDoc(userRef, {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Upload user avatar to Firebase Storage with image optimization
export const uploadUserAvatar = async (userId: string, uri: string): Promise<string> => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `avatars/${userId}/${Date.now()}.jpg`);

    // Fetch the image and convert to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload the blob
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          // Handle errors
          reject(error);
        },
        async () => {
          // Upload completed successfully, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Update user profile with new photo URL
          await updateProfile(currentUser, {
            photoURL: downloadURL
          });

          // Update Firestore profile
          const userRef = doc(firestore, 'users', userId);
          await updateDoc(userRef, {
            photoURL: downloadURL,
            updatedAt: serverTimestamp()
          });

          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

// Delete all user avatars from storage
export const deleteUserAvatars = async (userId: string) => {
  try {
    const avatarsRef = ref(storage, `avatars/${userId}`);

    // List all files in the user's avatar directory
    const filesList = await listAll(avatarsRef);

    // Delete each file
    const deletePromises = filesList.items.map(fileRef => deleteObject(fileRef));
    await Promise.all(deletePromises);

    return { success: true };
  } catch (error) {
    console.error('Error deleting user avatars:', error);
    // Don't throw here, as this is a cleanup operation
    // and we want to continue with account deletion even if this fails
    return { success: false };
  }
};

// Update user email
export const updateUserEmail = async (newEmail: string, password: string) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.email) {
      throw new Error('User not authenticated or missing email');
    }

    // Re-authenticate user before changing email
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);

    // Update email
    await updateEmail(currentUser, newEmail);

    // Update Firestore profile
    const userRef = doc(firestore, 'users', currentUser.uid);
    await updateDoc(userRef, {
      email: newEmail,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

// Update user password
export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.email) {
      throw new Error('User not authenticated or missing email');
    }

    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);

    // Update password
    await updatePassword(currentUser, newPassword);

    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset:', error);
    throw error;
  }
};

// Delete user account
export const deleteUserAccount = async (password: string) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser?.email) {
      throw new Error('User not authenticated or missing email');
    }

    // Re-authenticate user before deleting account
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);

    // Get user ID for cleanup operations
    const userId = currentUser.uid;

    // Delete user data from Firestore
    try {
      // Delete user profile document
      const userRef = doc(firestore, 'users', userId);
      await deleteDoc(userRef);

      // Delete user journal entries
      const journalRef = collection(firestore, 'journal');
      const journalQuery = query(journalRef, where('userId', '==', userId));
      const journalSnapshot = await getDocs(journalQuery);

      const journalDeletePromises = journalSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(journalDeletePromises);

      // Delete user appointments
      const appointmentsRef = collection(firestore, 'appointments');
      const appointmentsQuery = query(appointmentsRef, where('userId', '==', userId));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);

      const appointmentsDeletePromises = appointmentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(appointmentsDeletePromises);
    } catch (error) {
      console.error('Error deleting user data from Firestore:', error);
      // Continue with account deletion even if Firestore cleanup fails
    }

    // Delete user avatars from Storage
    await deleteUserAvatars(userId);

    // Delete the user account from Firebase Auth
    await deleteUser(currentUser);

    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};
