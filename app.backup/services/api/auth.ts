import apiClient from './client';

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  is_active?: boolean;
  role?: 'USER' | 'CARE_PROVIDER' | 'ADMIN' | 'user' | 'care' | 'admin'; // Support both formats
  specialty?: 'MENTAL' | 'PHYSICAL' | 'mental' | 'physical'; // Support both formats
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

const authService = {
  register: async (credentials: RegisterCredentials): Promise<User> => {
    const user = await apiClient.post('/auth/register', credentials);
    return user;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    await apiClient.setTokens(response.access_token);
    return response;
  },

  googleLogin: async (idToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/google', { id_token: idToken });
    await apiClient.setTokens(response.access_token);
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      // FastAPI doesn't have a logout endpoint yet, so just clear tokens locally
      await apiClient.clearTokens();
    } catch (error) {
      // Always clear tokens even if logout fails
      await apiClient.clearTokens();
      throw error;
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { email });
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      if (!apiClient.isAuthenticated()) {
        return null;
      }
      return await apiClient.get('/users/me');
    } catch (error) {
      await apiClient.clearTokens();
      return null;
    }
  },

  deleteAccount: async (password: string): Promise<void> => {
    await apiClient.delete('/users/me');
    await apiClient.clearTokens();
  }
};

export default authService;