import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ENV, EnvUtils } from '../../config/env';

// Get API base URL from environment configuration
const getApiBaseUrl = () => {
  // Use web-specific URL if available and on web platform
  if (Platform.OS === 'web' && ENV.API_BASE_URL_WEB) {
    return ENV.API_BASE_URL_WEB;
  }
  return ENV.API_BASE_URL;
};

const API_BASE_URL = getApiBaseUrl();

// Token storage keys
const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.loadTokens();

    // Log environment info in debug mode
    if (EnvUtils.isDebugEnabled()) {
      console.log('🚀 API Client initialized with:', {
        baseUrl: API_BASE_URL,
        timeout: ENV.API_TIMEOUT,
        retryAttempts: ENV.API_RETRY_ATTEMPTS,
        environment: ENV.APP_ENV,
        debug: ENV.DEBUG
      });

      // Validate critical settings
      if (!ENV.API_TIMEOUT || ENV.API_TIMEOUT <= 0) {
        console.warn('⚠️ Invalid API_TIMEOUT:', ENV.API_TIMEOUT, 'using fallback: 30000ms');
      }
      if (!ENV.API_RETRY_ATTEMPTS || ENV.API_RETRY_ATTEMPTS < 0) {
        console.warn('⚠️ Invalid API_RETRY_ATTEMPTS:', ENV.API_RETRY_ATTEMPTS, 'using fallback: 3');
      }
    }
  }

  // Load tokens from storage
  private async loadTokens() {
    try {
      this.accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      this.refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error loading auth tokens:", error);
    }
  }

  // Save tokens to storage
  private async saveTokens(accessToken: string, refreshToken?: string) {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        this.refreshToken = refreshToken;
      }
      this.accessToken = accessToken;
    } catch (error) {
      console.error("Error saving auth tokens:", error);
    }
  }

  // Clear tokens from storage
  public async clearTokens() {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      this.accessToken = null;
      this.refreshToken = null;
    } catch (error) {
      console.error("Error clearing auth tokens:", error);
    }
  }

  // Set tokens programmatically
  public setTokens(accessToken: string, refreshToken?: string) {
    this.saveTokens(accessToken, refreshToken);
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async get(endpoint: string, customHeaders?: HeadersInit) {
    console.log(`API GET request to ${endpoint}`);
    const result = await this.request(endpoint, 'GET', undefined, customHeaders);
    console.log(`API GET response from ${endpoint}:`, result);
    return result;
  }

  async post(endpoint: string, data?: any, customHeaders?: HeadersInit) {
    return this.request(endpoint, 'POST', data, customHeaders);
  }

  async put(endpoint: string, data?: any, customHeaders?: HeadersInit) {
    console.log(`API PUT request to ${endpoint} with data:`, data);
    const result = await this.request(endpoint, 'PUT', data, customHeaders);
    console.log(`API PUT response from ${endpoint}:`, result);
    return result;
  }

  async patch(endpoint: string, data?: any, customHeaders?: HeadersInit) {
    return this.request(endpoint, 'PATCH', data, customHeaders);
  }

  async delete(endpoint: string, customHeaders?: HeadersInit) {
    return this.request(endpoint, 'DELETE', undefined, customHeaders);
  }

  private async request(
    endpoint: string,
    method: string = "GET",
    data?: any,
    customHeaders?: HeadersInit,
    retryCount: number = 0
  ): Promise<any> {
    await this.loadTokens();

    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      if (EnvUtils.isDebugEnabled()) {
        console.log(`Making ${method} request to: ${url} (attempt ${retryCount + 1})`);
        console.log(`Request headers:`, headers);
        console.log(`Request body:`, data);
      }

      // Set up timeout with fallback
      const timeout = ENV.API_TIMEOUT || 30000; // 30 second fallback
      timeoutId = setTimeout(() => controller.abort(), timeout);

      // Add abort signal to config
      config.signal = controller.signal;

      // Make the request
      const response = await fetch(url, config);

      // Clear timeout if request completes
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (EnvUtils.isDebugEnabled()) {
        console.log(`Response status: ${response.status}`);
        console.log(`Response headers:`, response.headers);
      }

      const result = await this.handleResponse(response);

      // If the result is the retry symbol, retry the request
      const maxRetries = ENV.API_RETRY_ATTEMPTS || 3;
      if (result === Symbol.for("retry") && retryCount < maxRetries) {
        return this.request(endpoint, method, data, customHeaders, retryCount + 1);
      }

      return result;
    } catch (error: any) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Handle AbortError (timeout)
      if (error.name === 'AbortError') {
        const timeout = ENV.API_TIMEOUT || 30000;
        const timeoutError = new ApiError(`Request timeout after ${timeout}ms`, 408);

        // Retry on timeout if we haven't exceeded retry attempts
        const maxRetries = ENV.API_RETRY_ATTEMPTS || 3;
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          if (EnvUtils.isDebugEnabled()) {
            console.log(`Request timed out, retrying after ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
          }
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.request(endpoint, method, data, customHeaders, retryCount + 1);
        }

        throw timeoutError;
      }

      // Retry on network errors (but not on API errors)
      const maxRetries = ENV.API_RETRY_ATTEMPTS || 3;
      if (retryCount < maxRetries && this.shouldRetry(error)) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        if (EnvUtils.isDebugEnabled()) {
          console.log(`Retrying request after ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request(endpoint, method, data, customHeaders, retryCount + 1);
      }

      console.error(`API ${method} request to ${endpoint} failed after ${retryCount + 1} attempts:`, error);
      throw error;
    }
  }

  // Determine if an error should trigger a retry
  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error instanceof ApiError) {
      return error.status >= 500;
    }

    // Retry on network errors and timeouts
    return error.message === 'Request timeout' ||
           error.message === 'Network request failed' ||
           error.name === 'TypeError'; // Often indicates network issues
  }

  // Handle API response
  private async handleResponse(response: Response) {
    if (response.ok) {
      // For 204 No Content
      if (response.status === 204) {
        return null;
      }

      // For other successful responses
      const data = await response.json();

      // Handle FastAPI response format
      if (data && typeof data === 'object') {
        // If it's a standard FastAPI response with success/data structure
        if ('success' in data && data.success && 'data' in data) {
          return data.data;
        }
        // Otherwise return the data as-is
        return data;
      }

      return data;
    }

    // Handle specific error cases
    if (response.status === 401) {
      // Try to refresh token if unauthorized
      if (this.refreshToken && this.accessToken) {
        try {
          await this.refreshAccessToken();
          // Return a symbol indicating that the request should be retried
          return Symbol.for("retry");
        } catch (refreshError) {
          // If refresh fails, throw the original error
          const errorData = await response.json().catch(() => null);
          throw new ApiError("Unauthorized", 401, errorData);
        }
      }

      // No refresh token or refresh failed
      const errorData = await response.json().catch(() => null);
      throw new ApiError("Unauthorized", 401, errorData);
    }

    // Handle other errors
    const errorData = await response.json().catch(() => null);

    // Handle FastAPI error format
    let errorMessage = "API Error";
    if (errorData) {
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      }
    }

    throw new ApiError(
      errorMessage || response.statusText,
      response.status,
      errorData
    );
  }

  // Refresh token (placeholder - FastAPI doesn't seem to have refresh endpoint yet)
  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new ApiError("No refresh token available", 401);
    }

    // If there's already a refresh in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create a new refresh promise
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        });

        if (!response.ok) {
          throw new ApiError(
            "Failed to refresh token",
            response.status,
            await response.json().catch(() => null)
          );
        }

        const data = await response.json();
        const newAccessToken = data.access_token || data.accessToken;
        const newRefreshToken = data.refresh_token || data.refreshToken || this.refreshToken;

        await this.saveTokens(newAccessToken, newRefreshToken);
        return newAccessToken;
      } catch (error) {
        // Clear tokens on refresh failure
        await this.clearTokens();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // File upload helper
  public async uploadFile(
    endpoint: string,
    uri: string,
    name: string,
    type: string,
    additionalFields?: Record<string, string>
  ): Promise<any> {
    await this.loadTokens();

    const url = `${API_BASE_URL}${endpoint}`;

    const formData = new FormData();
    formData.append("file", {
      uri,
      name,
      type,
    } as any);

    // Add any additional fields
    if (additionalFields) {
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`File upload to ${endpoint} failed:`, error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;