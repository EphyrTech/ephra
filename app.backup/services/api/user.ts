import apiClient from './client';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  photo_url?: string;
  date_of_birth?: string | null; // YYYY-MM-DD format
  country?: string | null;
  phone_number?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Legacy camelCase fields for backward compatibility
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  dob?: string | null;
  phoneNumber?: string | null;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  photo_url?: string;
  date_of_birth?: string | null; // YYYY-MM-DD format
  country?: string | null;
  phone_number?: string | null;
  // Legacy camelCase fields for backward compatibility
  firstName?: string;
  lastName?: string;
}

const userService = {
  getCurrentUser: async (): Promise<UserProfile> => {
    return await apiClient.get('/users/me');
  },

  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      return await apiClient.get(`/users/${userId}`);
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  },

  updateCurrentUser: async (data: ProfileUpdateData): Promise<UserProfile> => {
    return await apiClient.put('/users/me', data);
  },

  updateUserProfile: async (userId: string, data: ProfileUpdateData): Promise<UserProfile> => {
    return await apiClient.put(`/users/${userId}`, data);
  },

  uploadUserAvatar: async (userId: string, uri: string): Promise<{ photoURL?: string; photo_url?: string }> => {
    // Extract filename from URI
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const type = 'image/jpeg'; // Default type, could be improved to detect actual type

    const result = await apiClient.uploadFile('/media/upload', uri, filename, type, {
      user_id: userId,
      file_type: 'avatar'
    });

    return {
      photoURL: result.file_url || result.url,
      photo_url: result.file_url || result.url
    };
  },

  deleteUserAvatar: async (userId: string): Promise<void> => {
    // This would need to be implemented in the FastAPI backend
    // For now, we'll just make a placeholder call
    await apiClient.delete(`/users/${userId}/avatar`);
  },

  updateUserEmail: async (newEmail: string, password: string): Promise<UserProfile> => {
    return await apiClient.put('/users/me/update-email', {
      new_email: newEmail,
      password: password
    });
  }
};

export default userService;