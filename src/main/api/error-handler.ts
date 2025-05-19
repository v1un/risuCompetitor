// This file is kept for backward compatibility
// It re-exports everything from ApiErrorHandler.ts to avoid breaking existing imports

import { 
  ErrorSeverity, 
  ErrorCategory as ErrorType, 
  ErrorResponse as ApiError, 
  ApiErrorHandler, 
  apiErrorHandler 
} from './ApiErrorHandler';

export { 
  ErrorSeverity, 
  ErrorType, 
  apiErrorHandler 
};
export type { ApiError, ApiErrorHandler };

// Helper function to create a standardized error response
export function createErrorResponse(error: any, source: string, requestInfo?: any): { success: false, error: string, details: ApiError } {
  const errorResponse = apiErrorHandler.classifyError(error);
  apiErrorHandler.logError(errorResponse);
  
  return {
    success: false,
    error: errorResponse.userMessage,
    details: errorResponse
  };
}