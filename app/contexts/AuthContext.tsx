import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { Platform, Alert } from "react-native";
import { authService, userService, User } from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<User>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signUp: async () => {
    throw new Error("Not implemented");
  },
  signIn: async () => {
    throw new Error("Not implemented");
  },
  signInWithGoogle: async () => {
    throw new Error("Not implemented");
  },
  signOut: async () => {
    throw new Error("Not implemented");
  },
  clearError: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register a new user
  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      setError(null);

      // Register the user
      const user = await authService.register({
        email,
        password,
        name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName,
        firstName,
        lastName,
      });

      // Update local state
      setUser(user);

      return user;
    } catch (error: any) {
      setError(error.message || error.detail || "Registration failed");
      throw error;
    }
  };

  // Login with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);

      // Login the user
      const authResponse = await authService.login({ email, password });

      // Get the current user after login
      const user = await authService.getCurrentUser();

      // Update local state
      setUser(user);
    } catch (error: any) {
      setError(error.message || error.detail || "Login failed");
      throw error;
    }
  };

  // Login with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      console.log("Starting Google sign in process...");

      // Web platforms use Google Sign-In
      if (Platform.OS === "web") {
        console.log("Using web Google sign in flow");

        try {
          // This is a placeholder for the actual Google Sign-In implementation
          // You would need to implement this using Google's OAuth API
          // For now, we'll just show an error
          setError(
            "Google Sign In is not yet implemented for the REST API version"
          );
          throw new Error(
            "Google Sign In is not yet implemented for the REST API version"
          );

          // When implemented, it would look something like this:
          // 1. Get Google ID token
          // 2. Send it to your backend
          // const idToken = "..."; // From Google Sign-In
          // const user = await authService.loginWithGoogle(idToken);
          // setUser(user);
        } catch (webAuthError: any) {
          console.error("Web Google sign in error:", webAuthError);
          setError(
            webAuthError.message ??
              "Failed to sign in with Google. Please try again."
          );
          throw webAuthError;
        }
      } else {
        // For mobile, we should use Expo Google Auth
        Alert.alert(
          "Google Sign In",
          "Google Sign In is currently only available on web. Please use email/password authentication on mobile.",
          [{ text: "OK" }]
        );
        throw new Error("Google Sign In is not implemented for mobile yet");
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);
      setError(
        error.message ?? "An unknown error occurred during Google sign in"
      );
      throw error;
    }
  };

  // Logout
  const signOut = async () => {
    try {
      console.log("Signing out user...");

      // Add a small delay to ensure any pending operations complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Call the auth service to logout
      await authService.logout();

      // Update local state
      setUser(null);

      console.log("User signed out successfully");
    } catch (error: any) {
      console.error("Error signing out:", error);

      // Force local signout even if the API call fails
      setUser(null);

      setError(error.message);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Use useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      loading,
      error,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      clearError,
    }),
    [
      user,
      loading,
      error,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      clearError,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
