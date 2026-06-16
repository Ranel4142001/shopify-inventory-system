import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

// All dashboard routes require authentication
router.use(requireAuth);

// GET /api/dashboard
// Full dashboard — stats + ranked group buys + recent activity
router.get('/', (req, res, next) =>
  dashboardController.getDashboard(req, res, next)
);

// GET /api/dashboard/summary
// Lightweight summary cards only
router.get('/summary', (req, res, next) =>
  dashboardController.getSummary(req, res, next)
);

export default router;