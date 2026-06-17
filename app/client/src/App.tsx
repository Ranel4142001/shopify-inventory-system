import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { AppFrame } from './components/Layout/AppFrame';
import { Dashboard } from './routes/Dashboard';
import { RuleEditor } from './routes/RuleEditor';
import  ActivityLog from './routes/ActivityLog';
import { Settings } from './routes/Settings';
import './styles/global.css';

// Group Buys list page — must be INSIDE BrowserRouter to use useNavigate
function GroupBuysList() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate(); // ✅ correct — inside BrowserRouter

  React.useEffect(() => {
    fetch('/api/rules', { credentials: 'include' })
      .then(r => r.json())
      .then(res => { setData(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '4px',
          }}>
            Group Buys
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Manage all your group buy campaigns
          </p>
        </div>
        <button
          onClick={() => navigate('/group-buys/new')}
          style={{
            padding: '10px 20px',
            background: '#059669',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          + New Group Buy
        </button>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
            Loading...
          </div>
        ) : !data?.data?.length ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
            <p style={{ fontSize: '15px', fontWeight: '500', marginBottom: '8px' }}>
              No group buys yet
            </p>
            <button
              onClick={() => navigate('/group-buys/new')}
              style={{
                padding: '10px 20px',
                background: '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Create your first group buy
            </button>
          </div>
        ) : (
          <table className="tl-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Status</th>
                <th>Stage</th>
                <th>Ship Date</th>
                <th>Customers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((rule: any) => (
                <tr key={rule.id}>
                  <td style={{ fontWeight: '500', color: '#111827' }}>
                    {rule.productTitle}
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: '#F3F4F6',
                      color: '#374151',
                      textTransform: 'capitalize',
                    }}>
                      {rule.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#6B7280' }}>
                    {rule.currentStage}
                  </td>
                  <td style={{ fontSize: '13px', color: '#374151' }}>
                    {new Date(rule.targetShipDate).toLocaleDateString()}
                  </td>
                  <td style={{ fontSize: '13px', color: '#374151' }}>
                    {rule.customerCount.toLocaleString()}
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/group-buys/${rule.id}/edit`)}
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: '#374151',
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppFrame>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/group-buys" element={<GroupBuysList />} />
          <Route path="/group-buys/new" element={<RuleEditor />} />
          <Route path="/group-buys/:id/edit" element={<RuleEditor />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppFrame>
    </BrowserRouter>
  );
}