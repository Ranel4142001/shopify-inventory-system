import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { AuthRequest } from '../../shared/types/AuthRequest';

export class DashboardController {

  // GET /api/dashboard
  // Full dashboard data — stats + ranked group buys + recent activity
  async getDashboard(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await dashboardService.getDashboardData(
        req.shopId!
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/dashboard/summary
  // Lightweight summary cards for top of dashboard UI
  async getSummary(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await dashboardService.getSummaryCards(
        req.shopId!
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();