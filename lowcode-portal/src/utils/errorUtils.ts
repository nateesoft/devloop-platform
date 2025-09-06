import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  success?: boolean;
  statusCode?: number;
  timestamp?: string;
  path?: string;
  message?: string;
  error?: string;
  code?: string;
}

/**
 * Extract user-friendly error message from API error response
 * Handles the new backend error format with better error messages
 */
export const extractErrorMessage = (error: any, context?: 'login' | 'session' | 'general'): string => {
  // If it's an axios error with response
  if (error?.response?.data) {
    const errorData = error.response.data as ApiErrorResponse;
    
    // Handle specific HTTP status codes first
    if (error?.response?.status === 409) {
      // Handle conflict errors (409) - usually duplicate registrations
      if (errorData.message && errorData.message.includes('มี User อยู่แล้วในระบบ')) {
        return 'มี User อยู่แล้วในระบบ กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น';
      }
      return 'มี User อยู่แล้วในระบบ กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น';
    }
    
    // Handle specific error codes
    if (errorData.code) {
      switch (errorData.code) {
        case 'INVALID_CREDENTIALS':
          return 'Invalid username or password. Please try again.';
        case 'SESSION_EXPIRED':
        case 'SESSION_TERMINATED':
        case 'TOKEN_REFRESH_FAILED':
          return 'Your session has expired. Please log in again.';
        case 'USER_NOT_FOUND':
          return 'User account not found. Please check your credentials.';
        default:
          break;
      }
    }
    
    // For login context, be more specific about credential errors
    if (context === 'login' && error?.response?.status === 401) {
      return 'Invalid username or password. Please try again.';
    }
    
    // First try to get the user-friendly error message
    if (errorData.error) {
      return errorData.error;
    }
    
    // Fallback to message field
    if (errorData.message) {
      return errorData.message;
    }
    
    // If it's a string response
    if (typeof errorData === 'string') {
      return errorData;
    }
  }
  
  // If it's a direct error message from our own client
  if (error?.message) {
    // Handle session-related errors from client
    if (error.message.includes('session has expired') || 
        error.message.includes('refresh token') ||
        context === 'session') {
      return 'Your session has expired. Please log in again.';
    }
    
    // For login context, convert generic errors to credential errors
    if (context === 'login' && (
        error.message.includes('401') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid')
      )) {
      return 'Invalid username or password. Please try again.';
    }
    
    return error.message;
  }
  
  // Network or other errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  // Context-specific defaults
  if (context === 'login') {
    return 'Login failed. Please check your credentials and try again.';
  } else if (context === 'session') {
    return 'Your session has expired. Please log in again.';
  }
  
  // Default fallback
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if error is authentication related
 */
export const isAuthError = (error: any): boolean => {
  if (error?.response?.status === 401) {
    return true;
  }
  
  if (error?.response?.data?.code) {
    const code = error.response.data.code;
    return [
      'INVALID_CREDENTIALS',
      'SESSION_EXPIRED', 
      'SESSION_TERMINATED',
      'TOKEN_REFRESH_FAILED',
      'USER_NOT_FOUND',
      'AUTH_FAILED'
    ].includes(code);
  }
  
  return false;
};

/**
 * Check if error suggests user should retry login
 */
export const shouldRetryLogin = (error: any): boolean => {
  if (error?.response?.data?.code) {
    const code = error.response.data.code;
    return [
      'SESSION_EXPIRED',
      'SESSION_TERMINATED', 
      'TOKEN_REFRESH_FAILED'
    ].includes(code);
  }
  
  return false;
};