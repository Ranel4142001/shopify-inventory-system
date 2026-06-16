import { rulesRepository } from '../rules/rules.repository';
import { activityService } from '../activity/activity.service';
import { scoringService } from '../scoring/scoring.service';

export interface DashboardStats {
  totalGroupBuys: number;
  byStatus: {
    open: number;
    closed: number;
    in_production: number;
    quality_check: number;
    shipping: number;
    fulfilled: number;
    cancelled: number;
  };
  totalCustomersWaiting: number;
  totalFundingCollected: number;
  criticalAlerts: number;
}

export interface DashboardData {
  stats: DashboardStats;
  rankedGroupBuys: Awaited<ReturnType<typeof scoringService.scoreAllRules>>;
  recentActivity: Awaited<ReturnType<typeof activityService.getRecentActivity>>;
}

export class DashboardService {

  async getDashboardData(shopId: string): Promise<DashboardData> {

    // Run all queries in parallel for performance
    const [
      { data: allRules },
      rankedGroupBuys,
      recentActivity,
    ] = await Promise.all([
      rulesRepository.findByShopId(shopId, 1, 1000),
      scoringService.scoreAllRules(shopId),
      activityService.getRecentActivity(shopId, 10),
    ]);

    // ── Compute stats from rules ──────────────────────────────────────────
    const byStatus = {
      open: 0,
      closed: 0,
      in_production: 0,
      quality_check: 0,
      shipping: 0,
      fulfilled: 0,
      cancelled: 0,
    };

    let totalCustomersWaiting = 0;
    let totalFundingCollected = 0;

    for (const rule of allRules) {
      // Count by status
      if (rule.status in byStatus) {
        byStatus[rule.status as keyof typeof byStatus]++;
      }

      // Only count active group buys
      if (!['fulfilled', 'cancelled'].includes(rule.status)) {
        totalCustomersWaiting += rule.customerCount ?? 0;
        totalFundingCollected += rule.currentFunding ?? 0;
      }
    }

    // Count critical alerts from ranked results
    const criticalAlerts = rankedGroupBuys.filter(
      (r) => r.urgencyLevel === 'critical'
    ).length;

    const stats: DashboardStats = {
      totalGroupBuys: allRules.length,
      byStatus,
      totalCustomersWaiting,
      totalFundingCollected,
      criticalAlerts,
    };

    return {
      stats,
      rankedGroupBuys,
      recentActivity,
    };
  }

  // ── Summary cards for top of dashboard ───────────────────────────────────
  async getSummaryCards(shopId: string) {
    const { data: allRules } = await rulesRepository.findByShopId(
      shopId,
      1,
      1000
    );

    const activeRules = allRules.filter(
      (r) => !['fulfilled', 'cancelled'].includes(r.status)
    );

    const ranked = await scoringService.scoreAllRules(shopId);
    const topUrgent = ranked.slice(0, 3); // Top 3 most urgent

    return {
      activeGroupBuys: activeRules.length,
      totalGroupBuys: allRules.length,
      criticalCount: ranked.filter(
        (r) => r.urgencyLevel === 'critical'
      ).length,
      highCount: ranked.filter(
        (r) => r.urgencyLevel === 'high'
      ).length,
      totalCustomersWaiting: activeRules.reduce(
        (sum, r) => sum + (r.customerCount ?? 0),
        0
      ),
      topUrgent,
    };
  }
}

export const dashboardService = new DashboardService();