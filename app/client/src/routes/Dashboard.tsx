import React from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { ScoreBadge } from '../components/ScoreBadge';
import { AlertBanner } from '../components/AlertBanner';

interface DashboardData {
  stats: {
    totalGroupBuys: number;
    byStatus: Record<string, number>;
    totalCustomersWaiting: number;
    totalFundingCollected: number;
    criticalAlerts: number;
  };
  rankedGroupBuys: Array<{
    ruleId: string;
    productTitle: string;
    urgencyScore: number;
    urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
    daysUntilShip: number;
    delayDays: number;
    customerCount: number;
    alerts: string[];
    recommendation: string;
  }>;
  recentActivity: Array<{
    id: string;
    actionType: string;
    description: string;
    createdAt: string;
  }>;
}

const STAT_CARDS = (stats: DashboardData['stats']) => [
  {
    label: 'Total Group Buys',
    value: stats.totalGroupBuys,
    icon: '📦',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    label: 'Critical Alerts',
    value: stats.criticalAlerts,
    icon: '🚨',
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  {
    label: 'Customers Waiting',
    value: stats.totalCustomersWaiting.toLocaleString(),
    icon: '👥',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    label: 'Funding Collected',
    value: `$${(stats.totalFundingCollected / 100).toLocaleString()}`,
    icon: '💰',
    color: '#059669',
    bg: '#ECFDF5',
  },
];

export function Dashboard() {
  const { data, loading, error } = useApi<DashboardData>('/dashboard');

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', color: '#EF4444' }}>
        Error: {error}
      </div>
    );
  }

  if (!data) return null;

  const criticalBuys = data.rankedGroupBuys.filter(
    r => r.urgencyLevel === 'critical' || r.urgencyLevel === 'high'
  );

  return (
    <div style={{ padding: '24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '4px',
        }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          Group buy fulfillment overview — ranked by urgency
        </p>
      </div>

      {/* Critical Alerts */}
      {criticalBuys.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <AlertBanner
            alerts={criticalBuys
              .slice(0, 3)
              .flatMap(b => b.alerts)
              .slice(0, 3)}
            level="critical"
          />
        </div>
      )}

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {STAT_CARDS(data.stats).map(card => (
          <div key={card.label} style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#6B7280',
              }}>
                {card.label}
              </span>
              <span style={{
                width: '32px', height: '32px',
                background: card.bg,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}>
                {card.icon}
              </span>
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: card.color,
              lineHeight: 1,
            }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '24px',
        alignItems: 'start',
      }}>

        {/* Ranked Group Buys */}
        <div style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
              Group Buys by Urgency
            </h2>
            <Link
              to="/group-buys"
              style={{ fontSize: '13px', color: '#059669', textDecoration: 'none' }}
            >
              View all →
            </Link>
          </div>

          {data.rankedGroupBuys.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
              No group buys yet.{' '}
              <Link to="/group-buys/new" style={{ color: '#059669' }}>
                Create one
              </Link>
            </div>
          ) : (
            <table className="tl-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Product</th>
                  <th>Urgency</th>
                  <th>Ships In</th>
                  <th>Customers</th>
                </tr>
              </thead>
              <tbody>
                {data.rankedGroupBuys.slice(0, 8).map((item, index) => (
                  <tr key={item.ruleId}>
                    <td>
                      <span className={`rank-number rank-number--${index + 1}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/group-buys/${item.ruleId}`}
                        style={{
                          fontWeight: '500',
                          color: '#111827',
                          textDecoration: 'none',
                        }}
                      >
                        {item.productTitle}
                      </Link>
                      {item.delayDays > 0 && (
                        <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '2px' }}>
                          Delayed {item.delayDays}d
                        </div>
                      )}
                    </td>
                    <td>
                      <ScoreBadge
                        score={item.urgencyScore}
                        level={item.urgencyLevel}
                      />
                    </td>
                    <td style={{ fontSize: '13px', color: '#374151' }}>
                      {item.daysUntilShip <= 0
                        ? <span style={{ color: '#EF4444', fontWeight: '600' }}>Overdue</span>
                        : `${item.daysUntilShip}d`
                      }
                    </td>
                    <td style={{ fontSize: '13px', color: '#374151' }}>
                      {item.customerCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Activity */}
        <div style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
              Recent Activity
            </h2>
            <Link
              to="/activity"
              style={{ fontSize: '13px', color: '#059669', textDecoration: 'none' }}
            >
              View all →
            </Link>
          </div>

          <div style={{ padding: '8px 0' }}>
            {data.recentActivity.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                No activity yet
              </div>
            ) : (
              data.recentActivity.map(log => (
                <div key={log.id} style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid #F3F4F6',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    background: '#059669',
                    marginTop: '6px',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: '#111827', lineHeight: 1.4 }}>
                      {log.description}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}