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

  const [allRules, setAllRules] = useState<GroupBuy[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateSortOrder, setDateSortOrder] = useState<'desc' | 'asc'>('desc');

  function loadData() {
    setLoading(true);
    setError(null);

    apiClient
      .get<GroupBuy[]>(`/rules?page=1&limit=100`)
      .then(res => {
        if (!res.success) {
          setError(`Failed to load group buys: ${res.error?.message || 'Unknown error.'}`);
          return;
        }
        setAllRules(res.data || []);
      })
      .catch((err: any) => {
        setError(`Failed to load group buys: ${err?.message || 'Server did not respond.'}`);
      })
      .finally(() => setLoading(false));
  }

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  const filteredAndSortedRules = React.useMemo(() => {
    let result = [...allRules];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.productTitle.toLowerCase().includes(q));
    }

    // 2. Status filter
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    // 3. Date sorting (Latest to Oldest by default)
    result.sort((a, b) => {
      const dateA = a.targetShipDate ? new Date(a.targetShipDate).getTime() : 0;
      const dateB = b.targetShipDate ? new Date(b.targetShipDate).getTime() : 0;
      return dateSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [allRules, searchQuery, statusFilter, dateSortOrder]);

  const totalCount = filteredAndSortedRules.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);

  const pageItems = React.useMemo(() => {
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedRules.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredAndSortedRules, currentPage]);

  function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setPage(newPage);
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

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px',
          alignItems: 'center',
        }}
      >
        {/* Search Input */}
        <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              color: '#374151',
            }}
            onFocus={e => (e.target.style.borderColor = '#059669')}
            onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
          />
          <svg
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: '#9CA3AF',
              pointerEvents: 'none',
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: '#fff',
              color: '#374151',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = '#059669')}
            onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="in_production">In Production</option>
            <option value="quality_check">Quality Check</option>
            <option value="shipping">Shipping</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Date Sorting */}
        <div style={{ minWidth: '180px' }}>
          <select
            value={dateSortOrder}
            onChange={e => {
              setDateSortOrder(e.target.value as 'desc' | 'asc');
              setPage(1);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: '#fff',
              color: '#374151',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = '#059669')}
            onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
          >
            <option value="desc">Date: Latest to Oldest</option>
            <option value="asc">Date: Oldest to Latest</option>
          </select>
        </div>
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
            Page {currentPage} of {totalPages} · {totalCount} total
          </span>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                background: '#fff',
                color: currentPage === 1 ? '#D1D5DB' : '#374151',
                fontSize: '13px',
                fontWeight: '500',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => {
                // Show first, last, current, and neighbors of current; ellipsis elsewhere
                return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
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
                      border: p === currentPage ? '1px solid #059669' : '1px solid #D1D5DB',
                      background: p === currentPage ? '#059669' : '#fff',
                      color: p === currentPage ? '#fff' : '#374151',
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
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                background: '#fff',
                color: currentPage === totalPages ? '#D1D5DB' : '#374151',
                fontSize: '13px',
                fontWeight: '500',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
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