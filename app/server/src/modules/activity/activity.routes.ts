import { Router } from 'express';
import { activityController } from './activity.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

// All activity routes require authentication
router.use(requireAuth);

// GET /api/activity
// Full paginated activity log for the shop
router.get('/', (req, res, next) =>
  activityController.getShopActivity(req, res, next)
);

// GET /api/activity/recent
// Last N activities — used by dashboard widget
router.get('/recent', (req, res, next) =>
  activityController.getRecentActivity(req, res, next)
);

// GET /api/activity/group-buy/:groupBuyId
// Activity timeline for a specific group buy
router.get('/group-buy/:groupBuyId', (req, res, next) =>
  activityController.getGroupBuyActivity(req, res, next)
);

export default router;