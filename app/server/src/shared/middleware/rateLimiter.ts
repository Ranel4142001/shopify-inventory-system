import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';
import { TooManyRequestsError } from '../errors/AppError';

// Global rate limiter
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => false,
  keyGenerator: (req) => {
    // Use shop domain as key — never falls back to IP
    const shop =
      (req.cookies?.tl_shop as string) ||
      (req.query?.shop as string) ||
      'global';
    return shop;
  },
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many requests, please slow down'));
  },
});

// Stricter limiter for auth routes
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => false,
  keyGenerator: (req) => {
    const shop =
      (req.query?.shop as string) ||
      'global';
    return shop;
  },
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many auth attempts, please wait'));
  },
});