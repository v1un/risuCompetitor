/**
 * ErrorContext.tsx
 * Context for managing and displaying errors throughout the application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  apiErrorHandler, 
  ErrorDetails, 
  UserFriendlyError 
} from '../../shared/services/ApiErrorHandler';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { Box } from '@mui/material';

interface ErrorContextType {
  // Show an error with the given details
  showError: (error: UserFriendlyError | ErrorDetails | Error | string) => void;
  
  // Clear all displayed errors
  clearErrors: () => void;
  
  // Get current errors
  errors: UserFriendlyError[];
  
  // Show a toast notification
  showToast: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: React.ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<UserFriendlyError[]>([]);
  const [toasts, setToasts] = useState<Array<UserFriendlyError & { id: string }>>([]);

  // Listen for API errors
  useEffect(() => {
    const handleApiError = (errorDetails: ErrorDetails) => {
      // Only automatically show errors with medium or higher severity
      if (errorDetails.severity !== 'low') {
        const userFriendlyError = apiErrorHandler.createUserFriendlyError(errorDetails);
        showError(userFriendlyError);
      }
    };

    apiErrorHandler.addErrorListener(handleApiError);
    
    return () => {
      apiErrorHandler.removeErrorListener(handleApiError);
    };
  }, []);

  // Convert various error types to UserFriendlyError
  const normalizeError = (error: UserFriendlyError | ErrorDetails | Error | string): UserFriendlyError => {
    if (typeof error === 'string') {
      return {
        title: 'Error',
        message: error,
        recoverySuggestions: ['Try again', 'Restart the application if the problem persists'],
      };
    } else if (error instanceof Error) {
      return {
        title: 'Application Error',
        message: error.message,
        recoverySuggestions: ['Try again', 'Restart the application if the problem persists'],
        technicalDetails: error.stack,
      };
    } else if ('category' in error) { // ErrorDetails
      return apiErrorHandler.createUserFriendlyError(error);
    } else { // Already UserFriendlyError
      return error;
    }
  };

  const showError = (error: UserFriendlyError | ErrorDetails | Error | string) => {
    const normalizedError = normalizeError(error);
    setErrors(prev => [...prev, normalizedError]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const removeError = (index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  };

  const showToast = (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const toast: UserFriendlyError & { id: string } = {
      title: severity === 'error' ? 'Error' : 
             severity === 'warning' ? 'Warning' : 
             severity === 'success' ? 'Success' : 'Information',
      message,
      recoverySuggestions: [],
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const value = {
    showError,
    clearErrors,
    errors,
    showToast,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      
      {/* Display inline errors */}
      {errors.map((error, index) => (
        <ErrorDisplay
          key={`error-${index}`}
          error={error}
          variant="dialog"
          onClose={() => removeError(index)}
        />
      ))}
      
      {/* Toast container */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: '100%',
          width: 400,
        }}
      >
        {toasts.map((toast) => (
          <ErrorDisplay
            key={toast.id}
            error={toast}
            variant="toast"
            autoHideDuration={5000}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </Box>
    </ErrorContext.Provider>
  );
};

export default ErrorContext;