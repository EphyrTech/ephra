/**
 * Utility functions for handling API errors and extracting user-friendly error messages
 */

/**
 * Extract a user-friendly error message from an API error response
 * @param error - The error object from an API call
 * @param fallbackMessage - Default message to show if no specific error message is found
 * @returns A user-friendly error message string
 */
export const extractErrorMessage = (error: any, fallbackMessage: string = 'An error occurred'): string => {
  // Handle ApiError instances with message property
  if (error?.message) {
    return error.message;
  }
  
  // Handle FastAPI error format with detail field
  if (error?.data?.detail) {
    return error.data.detail;
  }
  
  // Handle nested error structure
  if (error?.data?.error?.message) {
    return error.data.error.message;
  }
  
  // Handle response data directly
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  // Handle response data with nested error
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }
  
  // Return fallback message
  return fallbackMessage;
};

/**
 * Common error messages for different types of operations
 */
export const ErrorMessages = {
  APPOINTMENT: {
    CREATE_FAILED: 'Failed to create appointment. Please try again.',
    CANCEL_FAILED: 'Failed to cancel appointment',
    LOAD_FAILED: 'Failed to load appointment details',
    UPDATE_FAILED: 'Failed to update appointment',
  },
  USER: {
    LOAD_FAILED: 'Failed to load user information',
    UPDATE_FAILED: 'Failed to update user information',
  },
  JOURNAL: {
    CREATE_FAILED: 'Failed to create journal entry',
    UPDATE_FAILED: 'Failed to update journal entry',
    DELETE_FAILED: 'Failed to delete journal entry',
    LOAD_FAILED: 'Failed to load journal entries',
  },
  AUTH: {
    LOGIN_FAILED: 'Login failed. Please check your credentials.',
    LOGOUT_FAILED: 'Failed to logout',
    REGISTER_FAILED: 'Registration failed. Please try again.',
    TOKEN_REFRESH_FAILED: 'Session expired. Please login again.',
  },
  NETWORK: {
    CONNECTION_FAILED: 'Network connection failed. Please check your internet connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
  },
  GENERAL: {
    UNKNOWN_ERROR: 'An unexpected error occurred',
    PERMISSION_DENIED: 'You do not have permission to perform this action',
    NOT_FOUND: 'The requested resource was not found',
  }
};

/**
 * Handle common API error scenarios and return appropriate user messages
 * @param error - The error object from an API call
 * @param operation - The type of operation that failed (for context-specific messages)
 * @returns A user-friendly error message string
 */
export const handleApiError = (error: any, operation?: keyof typeof ErrorMessages): string => {
  // Extract the basic error message
  const baseMessage = extractErrorMessage(error);
  
  // Handle specific HTTP status codes
  if (error?.status || error?.response?.status) {
    const status = error.status || error.response.status;
    
    switch (status) {
      case 400:
        return baseMessage || 'Invalid request. Please check your input.';
      case 401:
        return baseMessage || ErrorMessages.AUTH.TOKEN_REFRESH_FAILED;
      case 403:
        return baseMessage || ErrorMessages.GENERAL.PERMISSION_DENIED;
      case 404:
        return baseMessage || ErrorMessages.GENERAL.NOT_FOUND;
      case 408:
        return ErrorMessages.NETWORK.TIMEOUT;
      case 409:
        return baseMessage || 'Conflict occurred. Please try again.';
      case 422:
        return baseMessage || 'Validation failed. Please check your input.';
      case 500:
        return ErrorMessages.NETWORK.SERVER_ERROR;
      default:
        return baseMessage || ErrorMessages.GENERAL.UNKNOWN_ERROR;
    }
  }
  
  // Handle network errors
  if (error?.name === 'AbortError') {
    return ErrorMessages.NETWORK.TIMEOUT;
  }
  
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
    return ErrorMessages.NETWORK.CONNECTION_FAILED;
  }
  
  // Return the extracted message or operation-specific fallback
  if (operation && ErrorMessages[operation]) {
    const operationMessages = ErrorMessages[operation] as Record<string, string>;
    const fallback = Object.values(operationMessages)[0] || ErrorMessages.GENERAL.UNKNOWN_ERROR;
    return baseMessage || fallback;
  }
  
  return baseMessage || ErrorMessages.GENERAL.UNKNOWN_ERROR;
};
