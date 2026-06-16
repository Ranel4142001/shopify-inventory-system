import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { env } from '../../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Known operational error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // Unknown error — log it and return generic message
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: env.IS_DEV ? err.message : 'Internal server error',
      statusCode: 500,
    },
  });
}