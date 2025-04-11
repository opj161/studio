/**
 * Custom error types for better error handling throughout the application
 */

// Base application error
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

// Validation errors
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// API errors
export class ApiError extends AppError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Image processing errors
export class ImageProcessingError extends AppError {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

// Network errors
export class NetworkError extends AppError {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Cache errors
export class CacheError extends AppError {
  constructor(
    message: string,
    public readonly cacheKey?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'CacheError';
  }
}

// AI model errors
export class AIModelError extends AppError {
  constructor(
    message: string,
    public readonly modelName?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AIModelError';
  }
}

// Helper function to convert unknown errors to AppError
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    // Check for specific error types based on message or properties
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new NetworkError(error.message, error);
    }
    
    if (error.message.includes('image') || error.message.includes('png') || 
        error.message.includes('jpg') || error.message.includes('webp')) {
      return new ImageProcessingError(error.message, error);
    }
    
    // Default to generic AppError
    return new AppError(error.message);
  }
  
  // For non-Error objects
  return new AppError(
    typeof error === 'string' 
      ? error 
      : 'An unknown error occurred'
  );
}

// Error response type for API responses
export type ErrorResponse = {
  code: string;
  message: string;
  details?: any;
};
