import React from 'react';
import { useApi } from '../hooks/useApi';

interface ShopData {
  id: string;
  domain: string;
  shopName: string;
  email: string;
  scope: string;
  isActive: string;
  installedAt: string;
}

export function Settings() {
  const { data, loading } = useApi<ShopData>('/shops/me');

  return (
    <div style={{ padding: '24px', maxWidth: '600px' }}>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '4px',
        }}>
          Settings
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          Shop information and app configuration
        </p>
      </div>

      {/* Shop Info Card */}
      <div style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '16px',
      }}>
        <h2 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '16px',
        }}>
          Shop Information
        </h2>

        {loading ? (
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading...</p>
        ) : data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Shop Name', value: data.shopName },
              { label: 'Domain', value: data.domain },
              { label: 'Email', value: data.email },
              { label: 'Status', value: data.isActive === 'true' ? '✅ Active' : '❌ Inactive' },
              { label: 'Installed', value: new Date(data.installedAt).toLocaleDateString() },
              { label: 'Scopes', value: data.scope },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid #F3F4F6',
                gap: '16px',
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#6B7280',
                  flexShrink: 0,
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#111827',
                  textAlign: 'right',
                  wordBreak: 'break-all',
                }}>
                  {item.value || '—'}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* App Info */}
      <div style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <h2 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '16px',
        }}>
          About This App
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'App Name', value: 'Group Buy Manager' },
            { label: 'Version', value: '1.0.0' },
            { label: 'Built for', value: 'Tactile Lab — Mechanical Keyboard Store' },
            { label: 'Stack', value: 'Node.js · Vite · Drizzle ORM · MySQL' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: '1px solid #F3F4F6',
              gap: '16px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280' }}>
                {item.label}
              </span>
              <span style={{ fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}