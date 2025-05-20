/**
 * ApiErrorHandler.ts
 * Centralized error handling for all API calls with classification, logging, and standardized responses
 */

import { AxiosError } from 'axios';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories for better organization and handling
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  CLIENT = 'client',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

// Structure for error details
export interface ErrorDetails {
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  recoverable: boolean;
  retryable: boolean;
  context?: Record<string, any>;
  originalError?: any;
  timestamp: number;
  id: string;
}

// User-friendly error messages with recovery suggestions
export interface UserFriendlyError {
  title: string;
  message: string;
  recoverySuggestions: string[];
  technicalDetails?: string;
}

export class ApiErrorHandler {
  private static instance: ApiErrorHandler;
  private errorLog: ErrorDetails[] = [];
  private maxLogSize = 100;
  private errorListeners: ((error: ErrorDetails) => void)[] = [];

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler();
    }
    return ApiErrorHandler.instance;
  }

  /**
   * Handle API errors with proper classification and logging
   */
  public handleError(error: any, context?: Record<string, any>): ErrorDetails {
    const errorDetails = this.classifyError(error, context);
    this.logError(errorDetails);
    this.notifyListeners(errorDetails);
    return errorDetails;
  }

  /**
   * Classify the error based on its type and properties
   */
  private classifyError(error: any, context?: Record<string, any>): ErrorDetails {
    let category = ErrorCategory.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let message = 'An unknown error occurred';
    let recoverable = true;
    let retryable = true;

    // Handle Axios errors
    if (error instanceof AxiosError || (error && error.isAxiosError)) {
      const axiosError = error as AxiosError;
      
      // Network errors
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        category = ErrorCategory.TIMEOUT;
        severity = ErrorSeverity.MEDIUM;
        message = 'Request timed out. Please check your internet connection and try again.';
      } else if (!axiosError.response) {
        category = ErrorCategory.NETWORK;
        severity = ErrorSeverity.HIGH;
        message = 'Network error. Please check your internet connection.';
      } else {
        // HTTP status code based classification
        const status = axiosError.response.status;
        
        if (status === 401) {
          category = ErrorCategory.AUTHENTICATION;
          severity = ErrorSeverity.HIGH;
          message = 'Authentication failed. Please check your API key.';
          recoverable = true;
          retryable = false;
        } else if (status === 403) {
          category = ErrorCategory.AUTHORIZATION;
          severity = ErrorSeverity.HIGH;
          message = 'You are not authorized to perform this action.';
          recoverable = false;
          retryable = false;
        } else if (status === 429) {
          category = ErrorCategory.RATE_LIMIT;
          severity = ErrorSeverity.MEDIUM;
          message = 'Rate limit exceeded. Please try again later.';
          recoverable = true;
          retryable = true;
        } else if (status >= 500) {
          category = ErrorCategory.SERVER;
          severity = ErrorSeverity.HIGH;
          message = 'Server error. Please try again later.';
          recoverable = true;
          retryable = true;
        } else if (status >= 400) {
          category = ErrorCategory.CLIENT;
          severity = ErrorSeverity.MEDIUM;
          message = 'Request error. Please check your input and try again.';
          recoverable = true;
          retryable = true;
        }

        // Try to get more specific error message from response
        try {
          const responseData = axiosError.response.data;
          if (responseData && responseData.error && responseData.error.message) {
            message = responseData.error.message;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    } else if (error instanceof Error) {
      message = error.message;
      
      // Classify based on error message content
      if (message.includes('network') || message.includes('connection')) {
        category = ErrorCategory.NETWORK;
        severity = ErrorSeverity.HIGH;
      } else if (message.includes('timeout')) {
        category = ErrorCategory.TIMEOUT;
        severity = ErrorSeverity.MEDIUM;
      } else if (message.includes('auth')) {
        category = ErrorCategory.AUTHENTICATION;
        severity = ErrorSeverity.HIGH;
        recoverable = true;
        retryable = false;
      }
    }

    // Generate a unique ID for this error
    const id = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      message,
      severity,
      category,
      recoverable,
      retryable,
      context,
      originalError: error,
      timestamp: Date.now(),
      id,
    };
  }

  /**
   * Log the error to the internal log and console
   */
  private logError(errorDetails: ErrorDetails): void {
    // Add to internal log with size limit
    this.errorLog.unshift(errorDetails);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }

    // Log to console with appropriate level
    console.error(`[API Error] [${errorDetails.category}] [${errorDetails.severity}]: ${errorDetails.message}`, {
      errorId: errorDetails.id,
      timestamp: new Date(errorDetails.timestamp).toISOString(),
      context: errorDetails.context,
    });
  }

  /**
   * Create a user-friendly error message with recovery suggestions
   */
  public createUserFriendlyError(errorDetails: ErrorDetails): UserFriendlyError {
    let title = 'Error';
    let recoverySuggestions: string[] = [];
    
    // Set title based on category
    switch (errorDetails.category) {
      case ErrorCategory.NETWORK:
        title = 'Connection Error';
        recoverySuggestions = [
          'Check your internet connection',
          'Try again in a few moments',
          'If the problem persists, try restarting the application'
        ];
        break;
      case ErrorCategory.AUTHENTICATION:
        title = 'Authentication Error';
        recoverySuggestions = [
          'Check your API key in the settings',
          'Make sure your subscription is active',
          'Try regenerating your API key from the provider\'s website'
        ];
        break;
      case ErrorCategory.AUTHORIZATION:
        title = 'Authorization Error';
        recoverySuggestions = [
          'Your account may not have access to this feature',
          'Check your subscription tier',
          'Contact support if you believe this is an error'
        ];
        break;
      case ErrorCategory.RATE_LIMIT:
        title = 'Rate Limit Exceeded';
        recoverySuggestions = [
          'Wait a few minutes before trying again',
          'Consider upgrading your subscription for higher limits',
          'Try using a different AI model with higher rate limits'
        ];
        break;
      case ErrorCategory.SERVER:
        title = 'Server Error';
        recoverySuggestions = [
          'This is likely a temporary issue with the AI service',
          'Try again in a few minutes',
          'Check the service status page for any outages'
        ];
        break;
      case ErrorCategory.TIMEOUT:
        title = 'Request Timeout';
        recoverySuggestions = [
          'Check your internet connection',
          'Try a shorter prompt or request',
          'The AI service might be experiencing high demand'
        ];
        break;
      default:
        title = 'Unexpected Error';
        recoverySuggestions = [
          'Try again',
          'Restart the application',
          'If the problem persists, please report this issue'
        ];
    }

    return {
      title,
      message: errorDetails.message,
      recoverySuggestions,
      technicalDetails: `Error ID: ${errorDetails.id}, Category: ${errorDetails.category}, Severity: ${errorDetails.severity}`,
    };
  }

  /**
   * Implement automatic retry with exponential backoff
   * @param operation Function to retry
   * @param maxRetries Maximum number of retry attempts
   * @param baseDelay Base delay in milliseconds
   */
  public async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    context?: Record<string, any>
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Classify the error
        const errorDetails = this.classifyError(error, context);
        
        // Log the retry attempt
        console.warn(`Retry attempt ${attempt + 1}/${maxRetries} for operation`, {
          errorId: errorDetails.id,
          category: errorDetails.category,
          message: errorDetails.message,
        });
        
        // Don't retry if the error is not retryable
        if (!errorDetails.retryable || attempt >= maxRetries) {
          break;
        }
        
        // Calculate exponential backoff delay with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        
        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // If we've exhausted all retries, handle the last error
    const finalErrorDetails = this.handleError(lastError, {
      ...context,
      retriesExhausted: true,
      maxRetries,
    });
    
    throw new Error(`Operation failed after ${maxRetries} retries: ${finalErrorDetails.message}`);
  }

  /**
   * Add a listener for error events
   */
  public addErrorListener(listener: (error: ErrorDetails) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove a listener
   */
  public removeErrorListener(listener: (error: ErrorDetails) => void): void {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners of a new error
   */
  private notifyListeners(error: ErrorDetails): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener', e);
      }
    });
  }

  /**
   * Get recent errors for display or analytics
   */
  public getRecentErrors(limit: number = 10): ErrorDetails[] {
    return this.errorLog.slice(0, limit);
  }

  /**
   * Clear the error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Export a singleton instance
export const apiErrorHandler = ApiErrorHandler.getInstance();