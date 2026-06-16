import { Router } from 'express';
import { authController } from './auth.controller';
import { authRateLimiter } from '../../shared/middleware/rateLimiter';

const router = Router();

// Apply stricter rate limiting to all auth routes
router.use(authRateLimiter);

// OAuth install — redirects to Shopify consent page
router.get('/install', (req, res, next) =>
  authController.install(req, res, next)
);

// OAuth callback — Shopify redirects here after consent
router.get('/callback', (req, res, next) =>
  authController.callback(req, res, next)
);

// Refresh tokens using refresh cookie
router.post('/refresh', (req, res, next) =>
  authController.refresh(req, res, next)
);

// Logout — clears cookies
router.post('/logout', (req, res) =>
  authController.logout(req, res)
);

export default router;