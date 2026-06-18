import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { env } from '../../config/env';
import { ApiResponse } from './responseInterceptor';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Known operational error
  if (err instanceof AppError) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    };
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Unknown error — log it and return generic message
  console.error('Unhandled error:', err);
  
  const internalErrorResponse: ApiResponse = {
    success: false,
    error: {
      message: env.IS_DEV ? err.message : 'Internal server error',
      statusCode: 500,
    },
  };
  
  res.status(500).json(internalErrorResponse);
}