import { eq, desc, and, count } from 'drizzle-orm';
import { db } from '../../db/client';
import { activityLogs } from '../../db/schema';
import type { ActivityLog, NewActivityLog } from '../../db/schema';
import { getOffset } from '../../shared/utils/pagination';

export class ActivityRepository {

  async create(data: NewActivityLog): Promise<ActivityLog> {
    await db.insert(activityLogs).values(data);
    const result = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.id, data.id))
      .limit(1);
    return result[0];
  }

  async findByShopId(
    shopId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: ActivityLog[]; total: number }> {
    const offset = getOffset(page, limit);

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.shopId, shopId))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(activityLogs)
        .where(eq(activityLogs.shopId, shopId)),
    ]);

    return { data, total: totalResult[0]?.count ?? 0 };
  }

  async findByGroupBuyId(
    shopId: string,
    groupBuyId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: ActivityLog[]; total: number }> {
    const offset = getOffset(page, limit);

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(activityLogs)
        .where(
          and(
            eq(activityLogs.shopId, shopId),
            eq(activityLogs.groupBuyId, groupBuyId)
          )
        )
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(activityLogs)
        .where(
          and(
            eq(activityLogs.shopId, shopId),
            eq(activityLogs.groupBuyId, groupBuyId)
          )
        ),
    ]);

    return { data, total: totalResult[0]?.count ?? 0 };
  }

  async findRecentByShopId(
    shopId: string,
    limit: number = 10
  ): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.shopId, shopId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }
}

export const activityRepository = new ActivityRepository();