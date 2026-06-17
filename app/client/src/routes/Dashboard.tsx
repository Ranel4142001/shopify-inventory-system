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

// Helper to parse leading emojis from alert text
function cleanAlertText(alertStr: string) {
  const emojiMatch = alertStr.match(/^(\p{Extended_Pictographic})\s*(.*)$/u);
  if (emojiMatch) {
    return { icon: emojiMatch[1], text: emojiMatch[2] };
  }
  return { icon: '⚠️', text: alertStr };
}

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
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
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
        <div>
          <Link
            to="/group-buys/new"
            style={{
              background: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background 0.15s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#047857'}
            onMouseOut={(e) => e.currentTarget.style.background = '#059669'}
          >
            + New Group Buy
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {STAT_CARDS(data.stats).map(card => (
          <div key={card.label} className="tl-card tl-metric-card">
            <div className="tl-metric-card__header">
              <span className="tl-metric-card__label">
                {card.label}
              </span>
              <span className="tl-metric-card__icon-wrapper" style={{
                background: card.bg,
              }}>
                {card.icon}
              </span>
            </div>
            <div className="tl-metric-card__value" style={{
              color: card.color,
            }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '24px',
        alignItems: 'start',
      }}>

        {/* Ranked Group Buys */}
        <div className="tl-card" style={{ background: '#fff' }}>
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
              style={{ fontSize: '13px', color: '#059669', textDecoration: 'none', fontWeight: '600' }}
            >
              View all →
            </Link>
          </div>

          {data.rankedGroupBuys.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
              No active group buys yet.{' '}
              <Link to="/group-buys/new" style={{ color: '#059669', fontWeight: '600' }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <Link
                          to={`/group-buys/${item.ruleId}`}
                          style={{
                            fontWeight: '600',
                            color: '#111827',
                            textDecoration: 'none',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {item.productTitle}
                        </Link>
                        {item.delayDays > 0 && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#D82C0D',
                            background: '#FFF8F7',
                            border: '1px solid #FFF1F0',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                          }}>
                            Delayed {item.delayDays}d
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <ScoreBadge
                        score={item.urgencyScore}
                        level={item.urgencyLevel}
                      />
                    </td>
                    <td style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                      {item.daysUntilShip <= 0
                        ? <span style={{ color: '#EF4444', fontWeight: '600' }}>Overdue</span>
                        : `${item.daysUntilShip}d`
                      }
                    </td>
                    <td style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                      {item.customerCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Action Required Card */}
          <div className="tl-card" style={{ background: '#fff' }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                Action Required
              </h2>
              {criticalBuys.length > 0 && (
                <span className="pulse-icon" style={{ fontSize: '14px' }}>🚨</span>
              )}
            </div>
            
            <div className="tl-alerts-list">
              {criticalBuys.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                  <p style={{ fontWeight: '600', color: '#111827', marginBottom: '2px' }}>All systems on track</p>
                  <p style={{ fontSize: '12px', color: '#6D7175' }}>No critical group buy alerts at this time.</p>
                </div>
              ) : (
                criticalBuys.slice(0, 5).flatMap(b => 
                  b.alerts.map((alertStr, idx) => {
                    const parsed = cleanAlertText(alertStr);
                    const itemLevel = b.urgencyLevel === 'critical' ? 'critical' : 'high';
                    return (
                      <Link
                        key={`${b.ruleId}-${idx}`}
                        to={`/group-buys/${b.ruleId}`}
                        className={`tl-alert-item tl-alert-item--${itemLevel}`}
                      >
                        <span className="tl-alert-item__icon">{parsed.icon}</span>
                        <div className="tl-alert-item__content">
                          {parsed.text}
                        </div>
                        <span className="tl-alert-item__action">View →</span>
                      </Link>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}