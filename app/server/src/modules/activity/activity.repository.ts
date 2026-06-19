import { eq, desc, and, count } from 'drizzle-orm';
import { db } from '../../db/client';
import { activityLogs } from '../../db/schema';
import type { ActivityLog, NewActivityLog, DbActivityLog, DbNewActivityLog } from '../../db/schema';
import { getOffset } from '../../shared/utils/pagination';
import { mapDbActivityLogToActivityLog, mapActivityLogToDbNewActivityLog } from '../../db/schema/mappers';

export class ActivityRepository {

  async create(data: NewActivityLog): Promise<ActivityLog> {
    const dbData = mapActivityLogToDbNewActivityLog(data) as DbNewActivityLog;
    await db.insert(activityLogs).values(dbData);
    const result = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.publicId, dbData.publicId))
      .limit(1);
    return mapDbActivityLogToActivityLog(result[0]);
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
        .where(eq(activityLogs.shopPublicId, shopId))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(activityLogs)
        .where(eq(activityLogs.shopPublicId, shopId)),
    ]);

    return { 
      data: data.map(mapDbActivityLogToActivityLog), 
      total: totalResult[0]?.count ?? 0 
    };
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
            eq(activityLogs.shopPublicId, shopId),
            eq(activityLogs.groupBuyPublicId, groupBuyId)
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
            eq(activityLogs.shopPublicId, shopId),
            eq(activityLogs.groupBuyPublicId, groupBuyId)
          )
        ),
    ]);

    return { 
      data: data.map(mapDbActivityLogToActivityLog), 
      total: totalResult[0]?.count ?? 0 
    };
  }

  async findRecentByShopId(
    shopId: string,
    limit: number = 10
  ): Promise<ActivityLog[]> {
    const result = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.shopPublicId, shopId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
    return result.map(mapDbActivityLogToActivityLog);
  }
}

export const activityRepository = new ActivityRepository();