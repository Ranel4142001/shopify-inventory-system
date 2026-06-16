import { Request, Response, NextFunction } from 'express';
import { activityService } from './activity.service';
import { parsePagination } from '../../shared/utils/pagination';
import { AuthRequest } from '../../shared/types/AuthRequest';
export class ActivityController {

  // GET /api/activity — full shop activity log (paginated)
  async getShopActivity(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const pagination = parsePagination(req.query as any);
      const result = await activityService.getShopActivity(
        req.shopId!,
        pagination
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/activity/recent — last 10 activities for dashboard
  async getRecentActivity(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string ?? '10');
      const logs = await activityService.getRecentActivity(
        req.shopId!,
        limit
      );
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/activity/group-buy/:groupBuyId — activity for one group buy
  async getGroupBuyActivity(
    req: AuthRequest & { params: { groupBuyId: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const pagination = parsePagination(req.query as any);
      const result = await activityService.getGroupBuyActivity(
        req.shopId!,
        req.params.groupBuyId,
        pagination
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const activityController = new ActivityController();