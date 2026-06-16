import { Request, Response, NextFunction } from 'express';
import { shopsService } from './shops.service';
import { AuthRequest } from '../../shared/types/AuthRequest';

export class ShopsController {

  async getMyShop(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const shop = await shopsService.getShopById(req.shopId!);
      res.json({
        success: true,
        data: shopsService.sanitizeShop(shop),
      });
    } catch (error) {
      next(error);
    }
  }

  async uninstall(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await shopsService.deactivateShop(req.shopId!);
      res.json({
        success: true,
        message: 'Shop uninstalled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const shopsController = new ShopsController();