import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

// Error types
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

// Error severity
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error interface
export interface ApiError {
  type: ErrorType;
  message: string;
  severity: ErrorSeverity;
  timestamp: string;
  source: string;
  originalError?: any;
  requestInfo?: {
    url?: string;
    method?: string;
    params?: any;
  };
  retryable: boolean;
}

// Error log entry
interface ErrorLogEntry extends ApiError {
  id: string;
  sessionId?: string;
}

// Class to handle API errors
export class ApiErrorHandler {
  private static instance: ApiErrorHandler;
  private logPath: string;
  private errorCallbacks: ((error: ApiError) => void)[] = [];
  
  private constructor() {
    const userDataPath = app.getPath('userData');
    this.logPath = path.join(userDataPath, 'logs', 'api-errors.log');
    
    // Ensure log directory exists
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  
  // Get singleton instance
  public static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler();
    }
    return ApiErrorHandler.instance;
  }
  
  // Handle an API error
  public handleError(error: any, source: string, requestInfo?: any): ApiError {
    // Determine error type
    const apiError = this.classifyError(error, source, requestInfo);
    
    // Log the error
    this.logError(apiError);
    
    // Notify subscribers
    this.notifyErrorCallbacks(apiError);
    
    return apiError;
  }
  
  // Classify the error
  private classifyError(error: any, source: string, requestInfo?: any): ApiError {
    let type = ErrorType.UNKNOWN;
    let message = 'An unknown error occurred';
    let severity = ErrorSeverity.ERROR;
    let retryable = false;
    
    // Network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('network')) {
      type = ErrorType.NETWORK;
      message = 'Network connection error. Please check your internet connection.';
      severity = ErrorSeverity.WARNING;
      retryable = true;
    }
    // Authentication errors
    else if (error.status === 401 || error.response?.status === 401 || error.message?.includes('authentication') || error.message?.includes('auth')) {
      type = ErrorType.AUTHENTICATION;
      message = 'Authentication failed. Please check your API key.';
      severity = ErrorSeverity.ERROR;
      retryable = false;
    }
    // Rate limit errors
    else if (error.status === 429 || error.response?.status === 429 || error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
      type = ErrorType.RATE_LIMIT;
      message = 'Rate limit exceeded. Please try again later.';
      severity = ErrorSeverity.WARNING;
      retryable = true;
    }
    // Server errors
    else if ((error.status >= 500 && error.status < 600) || (error.response?.status >= 500 && error.response?.status < 600)) {
      type = ErrorType.SERVER;
      message = 'Server error. Please try again later.';
      severity = ErrorSeverity.ERROR;
      retryable = true;
    }
    // Validation errors
    else if ((error.status >= 400 && error.status < 500) || (error.response?.status >= 400 && error.response?.status < 500)) {
      type = ErrorType.VALIDATION;
      message = error.message || 'Invalid request. Please check your inputs.';
      severity = ErrorSeverity.WARNING;
      retryable = false;
    }
    // Timeout errors
    else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      type = ErrorType.TIMEOUT;
      message = 'Request timed out. Please try again.';
      severity = ErrorSeverity.WARNING;
      retryable = true;
    }
    // Unknown errors
    else {
      message = error.message || 'An unknown error occurred';
    }
    
    return {
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
      source,
      originalError: error,
      requestInfo,
      retryable
    };
  }
  
  // Log the error to file
  private logError(error: ApiError): void {
    try {
      const logEntry: ErrorLogEntry = {
        ...error,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
      };
      
      // Remove sensitive information
      if (logEntry.requestInfo?.params?.api_key) {
        logEntry.requestInfo.params.api_key = '[REDACTED]';
      }
      
      // Append to log file
      fs.appendFileSync(
        this.logPath,
        JSON.stringify(logEntry) + '\n',
        { encoding: 'utf8' }
      );
    } catch (err) {
      console.error('Failed to log API error:', err);
    }
  }
  
  // Subscribe to error notifications
  public subscribeToErrors(callback: (error: ApiError) => void): () => void {
    this.errorCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Notify all subscribers
  private notifyErrorCallbacks(error: ApiError): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('Error in error callback:', err);
      }
    });
  }
  
  // Get recent errors
  public getRecentErrors(count: number = 10): ErrorLogEntry[] {
    try {
      if (!fs.existsSync(this.logPath)) {
        return [];
      }
      
      const logContent = fs.readFileSync(this.logPath, 'utf8');
      const lines = logContent.trim().split('\n');
      
      // Get the last 'count' lines
      const recentLines = lines.slice(-count);
      
      // Parse each line as JSON
      return recentLines.map(line => JSON.parse(line));
    } catch (err) {
      console.error('Failed to read error log:', err);
      return [];
    }
  }
  
  // Clear error log
  public clearErrorLog(): boolean {
    try {
      fs.writeFileSync(this.logPath, '', 'utf8');
      return true;
    } catch (err) {
      console.error('Failed to clear error log:', err);
      return false;
    }
  }
}

// Helper function to create a standardized error response
export function createErrorResponse(error: any, source: string, requestInfo?: any): { success: false, error: string, details: ApiError } {
  const apiError = ApiErrorHandler.getInstance().handleError(error, source, requestInfo);
  
  return {
    success: false,
    error: apiError.message,
    details: apiError
  };
}

// Export singleton instance
export const apiErrorHandler = ApiErrorHandler.getInstance();