import { Request, Response, NextFunction } from 'express';
import { scoringService } from './scoring.service';
import { BadRequestError } from '../../shared/errors/AppError';
import { AuthRequest } from '../../shared/types/AuthRequest';

export class ScoringController {

  // GET /api/scoring/ranked — all group buys ranked by urgency
  async getRankedGroupBuys(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const ranked = await scoringService.scoreAllRules(req.shopId!);
      res.json({
        success: true,
        data: ranked,
        meta: {
          total: ranked.length,
          critical: ranked.filter((r) => r.urgencyLevel === 'critical').length,
          high: ranked.filter((r) => r.urgencyLevel === 'high').length,
          medium: ranked.filter((r) => r.urgencyLevel === 'medium').length,
          low: ranked.filter((r) => r.urgencyLevel === 'low').length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/scoring/:ruleId/score — score a specific group buy
  async scoreRule(
    req: AuthRequest & { params: { ruleId: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { ruleId } = req.params;
      const { delayDays = 0 } = req.body;

      if (typeof delayDays !== 'number' || delayDays < 0) {
        throw new BadRequestError('delayDays must be a non-negative number');
      }

      const result = await scoringService.scoreRule(
        req.shopId!,
        ruleId,
        delayDays
      );

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/scoring/:ruleId/history — score history for a group buy
  async getScoreHistory(
    req: AuthRequest & { params: { ruleId: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const history = await scoringService.getScoreHistory(
        req.shopId!,
        req.params.ruleId
      );
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }
}

export const scoringController = new ScoringController();