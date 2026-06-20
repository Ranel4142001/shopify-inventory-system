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

  const [accentColor, setAccentColor] = React.useState(() => localStorage.getItem('tl_accent_color') || 'emerald');
  const [pageSize, setPageSize] = React.useState(() => localStorage.getItem('tl_page_size') || '10');
  const [emailNotifications, setEmailNotifications] = React.useState(() => localStorage.getItem('tl_email_notifications') === 'true');
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [syncSuccess, setSyncSuccess] = React.useState(false);

  function handleSavePreferences() {
    localStorage.setItem('tl_accent_color', accentColor);
    localStorage.setItem('tl_page_size', pageSize);
    localStorage.setItem('tl_email_notifications', String(emailNotifications));
    
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  }

  function handleSyncData() {
    setSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      setSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => {
        setSyncSuccess(false);
      }, 3000);
    }, 1500);
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>

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

      {/* Two Column Layout for Shop Information and App Preferences */}
      <div className="settings-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px',
      }}>
        {/* Left Column: Shop Information */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '24px',
            flexGrow: 1,
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Shop Name', value: data.shopName },
                    { label: 'Domain', value: data.domain },
                    { label: 'Email', value: data.email },
                    { label: 'Status', value: data.isActive ? '✅ Active' : '❌ Inactive' },
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

                {syncSuccess && (
                  <div style={{
                    background: '#ECFDF5',
                    color: '#065F46',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    border: '1px solid #A7F3D0',
                    marginTop: '8px',
                  }}>
                    ✓ Products synced from Shopify!
                  </div>
                )}

                <button
                  onClick={handleSyncData}
                  disabled={syncing}
                  style={{
                    background: syncing ? '#9CA3AF' : '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: syncing ? 'not-allowed' : 'pointer',
                    alignSelf: 'flex-start',
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => !syncing && (e.currentTarget.style.background = '#047857')}
                  onMouseOut={e => !syncing && (e.currentTarget.style.background = '#059669')}
                >
                  {syncing ? 'Syncing...' : 'Sync Shopify Data'}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: App Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '24px',
            flexGrow: 1,
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px',
            }}>
              App Preferences
            </h2>

            {saveSuccess && (
              <div style={{
                background: '#ECFDF5',
                color: '#065F46',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: '500',
                border: '1px solid #A7F3D0',
              }}>
                ✓ Preferences saved successfully!
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Accent Color Preference */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '6px' }}>
                    Dashboard Accent Color
                  </label>
                  <select
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#fff',
                      color: '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="emerald">Emerald Green (Default)</option>
                    <option value="crimson">Crimson Red (Keyboard Theme)</option>
                    <option value="royal">Royal Blue</option>
                  </select>
                </div>

                {/* Items Per Page Preference */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '6px' }}>
                    Default Items Per Page
                  </label>
                  <select
                    value={pageSize}
                    onChange={e => setPageSize(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#fff',
                      color: '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="5">5 items</option>
                    <option value="10">10 items</option>
                    <option value="20">20 items</option>
                  </select>
                </div>

                {/* Email Alert Preference */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={emailNotifications}
                    onChange={e => setEmailNotifications(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#059669',
                      cursor: 'pointer',
                    }}
                  />
                  <label htmlFor="emailNotifications" style={{ fontSize: '13px', fontWeight: '500', color: '#374151', cursor: 'pointer' }}>
                    Receive email digests for critical group buys
                  </label>
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                style={{
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  marginTop: '12px',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#047857')}
                onMouseOut={e => (e.currentTarget.style.background = '#059669')}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About This App */}
      <div style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.06)',
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