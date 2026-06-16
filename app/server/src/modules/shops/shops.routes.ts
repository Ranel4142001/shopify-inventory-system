import { Router } from 'express';
import { shopsController } from './shops.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

// All shop routes require authentication
router.use(requireAuth);

// GET /api/shops/me — get current shop info
router.get('/me', (req, res, next) =>
  shopsController.getMyShop(req, res, next)
);

// DELETE /api/shops/uninstall — deactivate shop
router.delete('/uninstall', (req, res, next) =>
  shopsController.uninstall(req, res, next)
);

export default router;