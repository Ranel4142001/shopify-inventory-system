import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import shopsRoutes from './modules/shops/shops.routes';
import rulesRoutes from './modules/rules/rules.routes';
import scoringRoutes from './modules/scoring/scoring.routes';
import activityRoutes from './modules/activity/activity.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const router = Router();

// ── Health check ─────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Tactile Lab API is running',
    timestamp: new Date().toISOString(),
  });
});

// ── Module routes ─────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/shops', shopsRoutes);
router.use('/rules', rulesRoutes);
router.use('/scoring', scoringRoutes);
router.use('/activity', activityRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;