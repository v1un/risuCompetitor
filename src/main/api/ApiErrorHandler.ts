import { app } from 'electron';
import fs from 'fs';
import path from 'path';

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  MODEL = 'model',
  CONTENT_FILTER = 'content_filter',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

// Error response interface
export interface ErrorResponse {
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
  suggestedAction?: string;
  originalError?: any;
  timestamp: number;
}

/**
 * ApiErrorHandler class for centralizing error handling for all API calls
 */
export class ApiErrorHandler {
  private static instance: ApiErrorHandler;
  private logPath: string;
  private maxLogSize = 5 * 1024 * 1024; // 5MB
  private maxRetries = 3;
  private retryDelays = [1000, 3000, 5000]; // Exponential backoff delays in ms

  private constructor() {
    this.logPath = path.join(app.getPath('userData'), 'logs', 'api-errors.log');
    this.ensureLogDirectory();
  }

  /**
   * Get the singleton instance of ApiErrorHandler
   */
  public static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler();
    }
    return ApiErrorHandler.instance;
  }

  /**
   * Ensure the log directory exists
   */
  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Classify an error based on its properties
   */
  public classifyError(error: any): ErrorResponse {
    const timestamp = Date.now();
    
    // Default error response
    const defaultResponse: ErrorResponse = {
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.UNKNOWN,
      message: 'An unknown error occurred',
      userMessage: 'Something went wrong. Please try again later.',
      recoverable: true,
      retryable: true,
      timestamp
    };

    if (!error) {
      return defaultResponse;
    }

    // Network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return {
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.NETWORK,
        message: `Network error: ${error.code}`,
        userMessage: 'Unable to connect to the AI service. Please check your internet connection.',
        recoverable: true,
        retryable: true,
        suggestedAction: 'Check your internet connection and try again.',
        originalError: error,
        timestamp
      };
    }

    // Authentication errors
    if (error.status === 401 || error.status === 403 || (error.response && (error.response.status === 401 || error.response.status === 403))) {
      return {
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.AUTHENTICATION,
        message: 'Authentication failed',
        userMessage: 'Your API key may be invalid or expired. Please check your API settings.',
        recoverable: true,
        retryable: false,
        suggestedAction: 'Update your API key in the settings.',
        originalError: error,
        timestamp
      };
    }

    // Rate limit errors
    if (error.status === 429 || (error.response && error.response.status === 429)) {
      return {
        severity: ErrorSeverity.WARNING,
        category: ErrorCategory.RATE_LIMIT,
        message: 'Rate limit exceeded',
        userMessage: 'You have reached the rate limit for AI requests. Please wait a moment before trying again.',
        recoverable: true,
        retryable: true,
        suggestedAction: 'Wait a few moments and try again.',
        originalError: error,
        timestamp
      };
    }

    // Server errors
    if (error.status >= 500 || (error.response && error.response.status >= 500)) {
      return {
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.SERVER,
        message: `Server error: ${error.status || error.response?.status}`,
        userMessage: 'The AI service is currently experiencing issues. Please try again later.',
        recoverable: true,
        retryable: true,
        suggestedAction: 'Try again later or switch to a different AI model.',
        originalError: error,
        timestamp
      };
    }

    // Content filter errors
    if (error.message && error.message.includes('content filter')) {
      return {
        severity: ErrorSeverity.WARNING,
        category: ErrorCategory.CONTENT_FILTER,
        message: 'Content filter triggered',
        userMessage: 'Your request was blocked by the AI service\'s content filter.',
        recoverable: true,
        retryable: false,
        suggestedAction: 'Modify your request to comply with content guidelines.',
        originalError: error,
        timestamp
      };
    }

    // Model errors
    if (error.message && (error.message.includes('model') || error.message.includes('parameter'))) {
      return {
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.MODEL,
        message: `Model error: ${error.message}`,
        userMessage: 'There was an issue with the AI model configuration.',
        recoverable: true,
        retryable: false,
        suggestedAction: 'Try a different model or adjust your generation settings.',
        originalError: error,
        timestamp
      };
    }

    // Validation errors
    if (error.status === 400 || (error.response && error.response.status === 400)) {
      return {
        severity: ErrorSeverity.WARNING,
        category: ErrorCategory.VALIDATION,
        message: `Validation error: ${error.message || 'Invalid request'}`,
        userMessage: 'Your request contained invalid parameters.',
        recoverable: true,
        retryable: false,
        suggestedAction: 'Check your input and try again.',
        originalError: error,
        timestamp
      };
    }

    // If we can't classify the error, return a generic response with the original error
    return {
      ...defaultResponse,
      message: error.message || defaultResponse.message,
      originalError: error
    };
  }

  /**
   * Log an error to the error log file
   */
  public logError(errorResponse: ErrorResponse): void {
    this.ensureLogDirectory();
    this.rotateLogIfNeeded();

    const logEntry = {
      timestamp: new Date(errorResponse.timestamp).toISOString(),
      severity: errorResponse.severity,
      category: errorResponse.category,
      message: errorResponse.message,
      originalError: errorResponse.originalError ? JSON.stringify(errorResponse.originalError) : null
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      fs.appendFileSync(this.logPath, logLine);
    } catch (err) {
      console.error('Failed to write to error log:', err);
    }
  }

  /**
   * Rotate the log file if it exceeds the maximum size
   */
  private rotateLogIfNeeded(): void {
    try {
      if (fs.existsSync(this.logPath)) {
        const stats = fs.statSync(this.logPath);
        if (stats.size > this.maxLogSize) {
          const backupPath = `${this.logPath}.${Date.now()}.backup`;
          fs.renameSync(this.logPath, backupPath);
        }
      }
    } catch (err) {
      console.error('Failed to rotate log file:', err);
    }
  }

  /**
   * Handle an API error with automatic retry if applicable
   */
  public async handleWithRetry<T>(
    apiCall: () => Promise<T>,
    onError?: (error: ErrorResponse) => void,
    maxRetries = this.maxRetries
  ): Promise<T> {
    let lastError: ErrorResponse | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        const errorResponse = this.classifyError(error);
        this.logError(errorResponse);
        
        lastError = errorResponse;
        
        // If the error is not retryable or we've reached max retries, break
        if (!errorResponse.retryable || attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying with exponential backoff
        const delay = this.retryDelays[attempt] || this.retryDelays[this.retryDelays.length - 1];
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // If we get here, all retries failed
    if (onError && lastError) {
      onError(lastError);
    }
    
    throw lastError;
  }

  /**
   * Get user-friendly error message with recovery suggestions
   */
  public getUserFriendlyMessage(errorResponse: ErrorResponse): string {
    let message = errorResponse.userMessage;
    
    if (errorResponse.suggestedAction) {
      message += ` ${errorResponse.suggestedAction}`;
    }
    
    return message;
  }

  /**
   * Check if the application is offline
   */
  public async isOffline(): Promise<boolean> {
    try {
      // Use DNS lookup to check internet connectivity
      const dns = require('dns');
      return new Promise<boolean>((resolve) => {
        dns.lookup('google.com', (err: Error) => {
          if (err) {
            resolve(true); // Offline
          } else {
            resolve(false); // Online
          }
        });
      });
    } catch (error) {
      console.error('Error checking network status:', error);
      return false; // Assume online if check fails
    }
  }

  /**
   * Get error analytics data
   */
  public async getErrorAnalytics(days = 7): Promise<any> {
    try {
      // Check if file exists first
      if (!fs.existsSync(this.logPath)) {
        return {
          totalErrors: 0,
          categoryCounts: {},
          severityCounts: {},
          hourlyDistribution: {},
          timeRange: {
            start: new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString(),
            end: new Date().toISOString()
          }
        };
      }
      
      const now = Date.now();
      const cutoff = now - (days * 24 * 60 * 60 * 1000);
      
      // Use readline interface for streaming the file instead of loading it all at once
      const readline = require('readline');
      const fileStream = fs.createReadStream(this.logPath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });
      
      const recentErrors = [];
      
      // Process the file line by line
      for await (const line of rl) {
        if (line.trim()) {
          try {
            const entry = JSON.parse(line);
            if (entry && new Date(entry.timestamp).getTime() > cutoff) {
              recentErrors.push(entry);
            }
          } catch {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
      
      // Aggregate error data
      const categoryCounts: Record<string, number> = {};
      const severityCounts: Record<string, number> = {};
      const hourlyDistribution: Record<number, number> = {};
      
      for (const error of recentErrors) {
        // Count by category
        categoryCounts[error.category] = (categoryCounts[error.category] || 0) + 1;
        
        // Count by severity
        severityCounts[error.severity] = (severityCounts[error.severity] || 0) + 1;
        
        // Count by hour of day
        const hour = new Date(error.timestamp).getHours();
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      }
      
      return {
        totalErrors: recentErrors.length,
        categoryCounts,
        severityCounts,
        hourlyDistribution,
        timeRange: {
          start: new Date(cutoff).toISOString(),
          end: new Date(now).toISOString()
        }
      };
    } catch (err) {
      console.error('Failed to generate error analytics:', err);
      return {
        totalErrors: 0,
        categoryCounts: {},
        severityCounts: {},
        hourlyDistribution: {},
        timeRange: {
          start: new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString(),
          end: new Date().toISOString()
        },
        error: 'Failed to generate error analytics'
      };
    }
  }
}

// Export singleton instance
export const apiErrorHandler = ApiErrorHandler.getInstance();