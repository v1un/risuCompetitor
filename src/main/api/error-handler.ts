/**
 * @deprecated This file is kept for backward compatibility.
 * Please import directly from './ApiErrorHandler.ts' instead.
 */

import { 
  ErrorSeverity, 
  ErrorCategory as ErrorType, 
  ErrorResponse as ApiError, 
  ApiErrorHandler, 
  apiErrorHandler,
  createErrorResponse
} from './ApiErrorHandler';

export { 
  ErrorSeverity, 
  ErrorType, 
  apiErrorHandler,
  createErrorResponse
};
export type { ApiError, ApiErrorHandler };