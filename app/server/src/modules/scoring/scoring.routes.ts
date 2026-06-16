import { Router } from 'express';
import { scoringController } from './scoring.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

// All scoring routes require authentication
router.use(requireAuth);

// GET  /api/scoring/ranked
// Returns all group buys ranked by urgency score (highest first)
router.get('/ranked', (req, res, next) =>
  scoringController.getRankedGroupBuys(req, res, next)
);

// POST /api/scoring/:ruleId/score
// Recalculate urgency score for a specific group buy
router.post('/:ruleId/score', (req, res, next) =>
  scoringController.scoreRule(req, res, next)
);

// GET  /api/scoring/:ruleId/history
// Get score history for a specific group buy
router.get('/:ruleId/history', (req, res, next) =>
  scoringController.getScoreHistory(req, res, next)
);

export default router;