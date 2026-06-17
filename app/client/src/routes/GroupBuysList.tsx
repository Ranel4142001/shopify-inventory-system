import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { DataTable, Column } from '../components/DataTable';

const PAGE_SIZE = 10;

interface GroupBuy {
  id: string;
  productTitle: string;
  status: string;
  currentStage: string;
  targetShipDate: string;
  customerCount: number;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open: { bg: '#ECFDF5', color: '#065F46' },
  closed: { bg: '#F3F4F6', color: '#374151' },
  in_production: { bg: '#EFF6FF', color: '#1D4ED8' },
  quality_check: { bg: '#FEF3C7', color: '#92400E' },
  shipping: { bg: '#EDE9FE', color: '#5B21B6' },
  fulfilled: { bg: '#ECFDF5', color: '#065F46' },
  cancelled: { bg: '#FEF2F2', color: '#991B1B' },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_COLORS[status] || { bg: '#F3F4F6', color: '#374151' };
  const label = status
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  );
}

export function GroupBuysList() {
  const navigate = useNavigate();

  const [pageItems, setPageItems] = useState<GroupBuy[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function loadPage(targetPage: number) {
    setLoading(true);
    setError(null);

    apiClient
      .get<GroupBuy[]>(`/rules?page=${targetPage}&limit=${PAGE_SIZE}`)
      .then(res => {
        if (!res.success) {
          setError(`Failed to load group buys: ${res.error?.message || 'Unknown error.'}`);
          return;
        }
        setPageItems(res.data || []);
        if (res.pagination) {
          setPage(res.pagination.page);
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.total);
        } else {
          // Backend didn't return pagination info — treat as a single page
          setPage(1);
          setTotalPages(1);
          setTotalCount(res.data?.length || 0);
        }
      })
      .catch((err: any) => {
        setError(`Failed to load group buys: ${err?.message || 'Server did not respond.'}`);
      })
      .finally(() => setLoading(false));
  }

  // Initial load
  useEffect(() => {
    loadPage(1);
  }, []);

  function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    loadPage(newPage);
  }

  const columns: Column<GroupBuy>[] = [
    {
      key: 'productTitle',
      header: 'Product',
      render: row => <span style={{ fontWeight: 600 }}>{row.productTitle}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: row => <StatusBadge status={row.status} />,
    },
    {
      key: 'currentStage',
      header: 'Stage',
      render: row => <span style={{ color: '#374151' }}>{row.currentStage}</span>,
    },
    {
      key: 'targetShipDate',
      header: 'Ship Date',
      render: row => (
        <span style={{ color: '#374151' }}>
          {row.targetShipDate ? new Date(row.targetShipDate).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'customerCount',
      header: 'Customers',
      render: row => (
        <span style={{ color: '#374151' }}>
          {row.customerCount?.toLocaleString?.() ?? row.customerCount}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: row => (
        <button
          onClick={() => navigate(`/group-buys/${row.id}/edit`)}
          style={{
            background: 'transparent',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            cursor: 'pointer',
          }}
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
            Group Buys
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Manage all your group buy campaigns
          </p>
        </div>
        <button
          onClick={() => navigate('/group-buys/new')}
          style={{
            background: '#059669',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          + New Group Buy
        </button>
      </div>

      {error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#DC2626',
            fontSize: '14px',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <DataTable
          columns={columns}
          data={pageItems}
          loading={loading}
          emptyMessage="No group buys found."
          keyExtractor={row => row.id}
        />
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#6B7280' }}>
            Page {page} of {totalPages} · {totalCount} total
          </span>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                background: '#fff',
                color: page === 1 ? '#D1D5DB' : '#374151',
                fontSize: '13px',
                fontWeight: '500',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => {
                // Show first, last, current, and neighbors of current; ellipsis elsewhere
                return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
              })
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#9CA3AF', fontSize: '13px' }}>
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: p === page ? '1px solid #059669' : '1px solid #D1D5DB',
                      background: p === page ? '#059669' : '#fff',
                      color: p === page ? '#fff' : '#374151',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                background: '#fff',
                color: page === totalPages ? '#D1D5DB' : '#374151',
                fontSize: '13px',
                fontWeight: '500',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}