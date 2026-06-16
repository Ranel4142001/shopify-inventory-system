import { v4 as uuidv4 } from 'uuid';
import { activityRepository } from './activity.repository';
import { buildPaginatedResult, PaginationParams } from '../../shared/utils/pagination';
import type { ActivityLog } from '../../db/schema';

// Action types matching your schema enum
export type ActionType =
  | 'group_buy_created'
  | 'group_buy_updated'
  | 'group_buy_cancelled'
  | 'stage_updated'
  | 'supplier_update_added'
  | 'alert_fired'
  | 'score_recalculated'
  | 'shop_installed'
  | 'shop_uninstalled';

export interface LogActivityInput {
  shopId: string;
  groupBuyId?: string;
  actionType: ActionType;
  description: string;
  metadata?: Record<string, unknown>;
}

export class ActivityService {

  // ─── Log a new activity (called by other services) ───────────────────────
  async log(input: LogActivityInput): Promise<ActivityLog> {
    return activityRepository.create({
      id: uuidv4(),
      shopId: input.shopId,
      groupBuyId: input.groupBuyId ?? null,
      actionType: input.actionType,
      description: input.description,
      metadata: input.metadata
        ? JSON.stringify(input.metadata)
        : null,
      createdAt: new Date(),
    });
  }

  // ─── Get paginated activity log for a shop ────────────────────────────────
  async getShopActivity(
    shopId: string,
    pagination: PaginationParams
  ) {
    const { data, total } = await activityRepository.findByShopId(
      shopId,
      pagination.page,
      pagination.limit
    );

    return buildPaginatedResult(
      data.map(this.formatLog),
      total,
      pagination
    );
  }

  // ─── Get activity log for a specific group buy ────────────────────────────
  async getGroupBuyActivity(
    shopId: string,
    groupBuyId: string,
    pagination: PaginationParams
  ) {
    const { data, total } = await activityRepository.findByGroupBuyId(
      shopId,
      groupBuyId,
      pagination.page,
      pagination.limit
    );

    return buildPaginatedResult(
      data.map(this.formatLog),
      total,
      pagination
    );
  }

  // ─── Get recent activity for dashboard widget ─────────────────────────────
  async getRecentActivity(shopId: string, limit: number = 10) {
    const logs = await activityRepository.findRecentByShopId(
      shopId,
      limit
    );
    return logs.map(this.formatLog);
  }

  // ─── Format log for API response ─────────────────────────────────────────
  private formatLog(log: ActivityLog) {
    return {
      ...log,
      metadata: log.metadata
        ? JSON.parse(log.metadata)
        : null,
    };
  }
}

export const activityService = new ActivityService();