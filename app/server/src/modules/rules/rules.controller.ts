import { Request, Response, NextFunction } from 'express';
import { rulesService } from './rules.service';
import { parsePagination } from '../../shared/utils/pagination';
import {
  createRuleSchema,
  updateRuleSchema,
} from './rules.validation';
import { BadRequestError } from '../../shared/errors/AppError';
import { AuthRequest } from '../../shared/types/AuthRequest';

export class RulesController {

  async getAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const pagination = parsePagination(req.query as any);
      const result = await rulesService.getAllRules(
        req.shopId!,
        pagination
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: AuthRequest & { params: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const rule = await rulesService.getRuleWithDetails(
        req.shopId!,
        req.params.id
      );
      res.json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsed = createRuleSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError(
          parsed.error.issues.map((e) => e.message).join(', ')
        );
      }
      const rule = await rulesService.createRule(
        req.shopId!,
        parsed.data
      );
      res.status(201).json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: AuthRequest & { params: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsed = updateRuleSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError(
          parsed.error.issues.map((e) => e.message).join(', ')
        );
      }
      const rule = await rulesService.updateRule(
        req.shopId!,
        req.params.id,
        parsed.data
      );
      res.json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  }

  async remove(
    req: AuthRequest & { params: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await rulesService.deleteRule(req.shopId!, req.params.id);
      res.json({ success: true, message: 'Group buy deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const rulesController = new RulesController();