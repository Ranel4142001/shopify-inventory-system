import type { UrgencyResult } from '../scoring/scoring.service';
import type { DashboardStats } from './dashboard.service';

export interface SerializedDashboardGroupBuy {
  ruleId: string;
  productTitle: string;
  urgencyScore: number;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  daysUntilShip: number;
  delayDays: number;
  customerCount: number;
  alerts: string[];
}

export interface SerializedDashboardData {
  stats: DashboardStats;
  rankedGroupBuys: SerializedDashboardGroupBuy[];
}

export class DashboardSerializer {
  serializeDashboardData(
    stats: DashboardStats,
    rankedGroupBuys: UrgencyResult[]
  ): SerializedDashboardData {
    return {
      stats,
      rankedGroupBuys: rankedGroupBuys.map((rgb) => ({
        ruleId: rgb.ruleId,
        productTitle: rgb.productTitle,
        urgencyScore: rgb.urgencyScore,
        urgencyLevel: rgb.urgencyLevel,
        daysUntilShip: rgb.daysUntilShip,
        delayDays: rgb.delayDays,
        customerCount: rgb.customerCount,
        alerts: rgb.alerts,
      })),
    };
  }
}

export const dashboardSerializer = new DashboardSerializer();
