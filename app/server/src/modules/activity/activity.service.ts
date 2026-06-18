import { v4 as uuidv4 } from "uuid";
import { activityRepository } from "./activity.repository";
import {
  buildPaginatedResult,
  PaginationParams,
} from "../../shared/utils/pagination";
import type { ActivityLog, ActionType } from "../../db/schema";

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
      // metadata is a json column — pass the object directly, no JSON.stringify needed
      metadata: input.metadata ?? null,
      createdAt: new Date(),
    });
  }

  // ─── Get paginated activity log for a shop ────────────────────────────────
  async getShopActivity(shopId: string, pagination: PaginationParams) {
    const { data, total } = await activityRepository.findByShopId(
      shopId,
      pagination.page,
      pagination.limit,
    );

    return buildPaginatedResult(data.map(this.formatLog), total, pagination);
  }

  // ─── Get activity log for a specific group buy ────────────────────────────
  async getGroupBuyActivity(
    shopId: string,
    groupBuyId: string,
    pagination: PaginationParams,
  ) {
    const { data, total } = await activityRepository.findByGroupBuyId(
      shopId,
      groupBuyId,
      pagination.page,
      pagination.limit,
    );

    return buildPaginatedResult(data.map(this.formatLog), total, pagination);
  }

  // ─── Get recent activity for dashboard widget ─────────────────────────────
  async getRecentActivity(shopId: string, limit: number = 10) {
    const logs = await activityRepository.findRecentByShopId(shopId, limit);
    return logs.map(this.formatLog);
  }

  // ─── Format log for API response ─────────────────────────────────────────
  private formatLog(log: ActivityLog) {
    return {
      ...log,
      // metadata is already a parsed object from Drizzle's json column — no JSON.parse needed
      metadata: log.metadata ?? null,
    };
  }
}

export const activityService = new ActivityService();

/**
 * Helper: Standalone export to fix "module has no exported member" errors
 * Use this in your other services like ScoringService.
 */
export const logActivity = async (
  shopId: string,
  actionType: ActionType,
  description: string,
  groupBuyId?: string
) => {
  return activityService.log({
    shopId,
    actionType,
    description,
    groupBuyId,
  });
};