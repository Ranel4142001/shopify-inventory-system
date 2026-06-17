import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AppFrameProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/group-buys', label: 'Group Buys', icon: '📦' },
  { path: '/activity', label: 'Activity Log', icon: '📋' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export function AppFrame({ children }: AppFrameProps) {
  const location = useLocation();

  return (
    <div className="app-layout-frame" style={{ display: 'flex', minHeight: '100vh', background: '#F4F6F8' }}>

      {/* Sidebar */}
      <aside className="app-sidebar" style={{
        width: '220px',
        background: '#fff',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>

        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid #E5E7EB',
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#111827',
            letterSpacing: '-0.02em',
          }}>
            <span style={{ color: '#059669' }}>Group Buy</span> Manager
          </div>
          <div style={{
            fontSize: '11px',
            color: '#6B7280',
            marginTop: '2px',
          }}>
            Tactile Lab
          </div>
        </div>

        {/* Nav */}
        <nav className="app-sidebar-nav" style={{ padding: '12px 8px', flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="app-sidebar-nav-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#059669' : '#374151',
                  background: isActive ? '#ECFDF5' : 'transparent',
                  textDecoration: 'none',
                  marginBottom: '2px',
                  transition: 'all 0.15s',
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="app-sidebar-footer" style={{
          padding: '16px',
          borderTop: '1px solid #E5E7EB',
          fontSize: '12px',
          color: '#9CA3AF',
        }}>
          v1.0.0 — Dev Mode
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>

    </div>
  );
}