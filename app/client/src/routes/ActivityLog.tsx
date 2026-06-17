import React from 'react';
import { useApi } from '../hooks/useApi';

const ACTION_ICONS: Record<string, string> = {
  group_buy_created: '✨',
  group_buy_updated: '✏️',
  group_buy_cancelled: '❌',
  stage_updated: '🔄',
  supplier_update_added: '📩',
  alert_fired: '🚨',
  score_recalculated: '📊',
  shop_installed: '🛍️',
  shop_uninstalled: '👋',
};

const ACTION_COLORS: Record<string, string> = {
  group_buy_created: '#059669',
  group_buy_updated: '#3B82F6',
  group_buy_cancelled: '#EF4444',
  stage_updated: '#8B5CF6',
  supplier_update_added: '#F59E0B',
  alert_fired: '#EF4444',
  score_recalculated: '#6B7280',
  shop_installed: '#059669',
  shop_uninstalled: '#6B7280',
};

interface ActivityLog {
  id: string;
  actionType: string;
  description: string;
  groupBuyId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface ActivityResponse {
  data: ActivityLog[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export default function ActivityLog() {
  const { data, loading, error } = useApi<ActivityLog[]>('/activity?limit=50');

  console.log("Raw API Response:", { data, error, loading });
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
          Activity Log
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          Complete history of all group buy actions and system events
        </p>
      </div>

      {/* Log */}
      <div style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
            Loading activity...
          </div>
        )}

        {error && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
            {error}
          </div>
        )}

        {!loading && (!data || data.length === 0) && (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
            <p style={{ fontSize: '15px', fontWeight: '500' }}>No activity yet</p>
            <p style={{ fontSize: '14px', marginTop: '4px' }}>
              Actions you take will appear here
            </p>
          </div>
        )}

        {data?.map((log, index) => (
          <div
            key={log.id}
            style={{
              display: 'flex',
              gap: '16px',
              padding: '16px 20px',
              borderBottom: index < data.length - 1
                ? '1px solid #F3F4F6'
                : 'none',
              alignItems: 'flex-start',
            }}
          >
            {/* Icon */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: `${ACTION_COLORS[log.actionType] || '#6B7280'}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              flexShrink: 0,
            }}>
              {ACTION_ICONS[log.actionType] || '📌'}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
                flexWrap: 'wrap',
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: ACTION_COLORS[log.actionType] || '#374151',
                  textTransform: 'capitalize',
                }}>
                  {log.actionType.replace(/_/g, ' ')}
                </span>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#374151',
                lineHeight: 1.5,
                marginBottom: '4px',
              }}>
                {log.description}
              </p>
              <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>

          </div>
        ))}

      </div>

      {/* Pagination info */}
      {data && (
   <div style={{
          marginTop: '16px',
          fontSize: '13px',
          color: '#6B7280',
          textAlign: 'center',
        }}>
          Showing {data.length} of {data.length} entries
        </div>
      )}

    </div>
  );
}