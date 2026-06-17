import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { ScoreBadge } from '../components/ScoreBadge';
import { AlertBanner } from '../components/AlertBanner';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'in_production', label: 'In Production' },
  { value: 'quality_check', label: 'Quality Check' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STAGES = [
  'Funding', 'Design Review', 'Tooling',
  'Injection Molding', 'Assembly', 'QC', 'Shipping',
];

interface FormData {
  productTitle: string;
  status: string;
  targetShipDate: string;
  currentStage: string;
  customerCount: string;
  fundingGoal: string;
  currentFunding: string;
  notes: string;
  delayDays: string;
}

const DEFAULT_FORM: FormData = {
  productTitle: '',
  status: 'open',
  targetShipDate: '',
  currentStage: 'Funding',
  customerCount: '0',
  fundingGoal: '0',
  currentFunding: '0',
  notes: '',
  delayDays: '0',
};

export function RuleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<any>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  // Load existing rule if editing
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    apiClient.get<any>(`/rules/${id}`)
      .then(res => {
        if (res.success && res.data) {
          const rule = res.data;
          setForm({
            productTitle: rule.productTitle || '',
            status: rule.status || 'open',
            targetShipDate: rule.targetShipDate
              ? new Date(rule.targetShipDate).toISOString().split('T')[0]
              : '',
            currentStage: rule.currentStage || 'Funding',
            customerCount: String(rule.customerCount ?? 0),
            fundingGoal: String(rule.fundingGoal ?? 0),
            currentFunding: String(rule.currentFunding ?? 0),
            notes: rule.notes || '',
            delayDays: String(rule.latestScore?.delayDays ?? 0),
          });
        }
      })
      .catch((err: any) => setError(`Failed to load group buy: ${err?.message || 'Server did not respond.'}`))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    if (type === 'text' && ['customerCount', 'fundingGoal', 'currentFunding', 'delayDays'].includes(name)) {
      // Only allow digits for numeric fields
      if (value !== '' && !/^\d*$/.test(value)) return;
      setForm(prev => ({ ...prev, [name]: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  }

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      productTitle: form.productTitle,
      status: form.status,
      targetShipDate: form.targetShipDate,
      currentStage: form.currentStage,
      customerCount: Number(form.customerCount) || 0,
      fundingGoal: Number(form.fundingGoal) || 0,
      currentFunding: Number(form.currentFunding) || 0,
      notes: form.notes,
    };

    let ruleId = id;

    // Step 1: Save the group buy
    try {
      if (isEdit) {
        await apiClient.put(`/rules/${id}`, payload);
      } else {
        const res = await apiClient.post<any>('/rules', payload);
        ruleId = res.data?.id;
        if (!ruleId) throw new Error('No ID returned from server after creating group buy.');
      }
    } catch (err: any) {
      const msg = isEdit
        ? `Failed to update group buy: ${err?.message || 'Server did not respond.'}`
        : `Failed to create group buy: ${err?.message || 'Server did not respond.'}`;
      setError(msg);
      showToast(msg, 'error');
      setSaving(false);
      return;
    }

    // Step 2: Score the rule
    try {
      if (ruleId) {
        const scoreRes = await apiClient.post<any>(
          `/scoring/${ruleId}/score`,
          { delayDays: Number(form.delayDays) || 0 }
        );
        if (scoreRes.success) setScoreResult(scoreRes.data);
      }
    } catch (err: any) {
      // Scoring failure is non-blocking — group buy was saved, just warn
      const msg = `Group buy saved, but scoring failed: ${err?.message || 'Could not calculate urgency score.'}`;
      setError(msg);
      showToast(msg, 'error');
    }

    // Step 3: Show success message and redirect
    showToast(isEdit ? 'Group Buy updated successfully!' : 'Group Buy created successfully!');
    setTimeout(() => navigate('/group-buys'), 3000);
    setSaving(false);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    background: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '680px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/group-buys')}
          style={{
            background: 'none',
            border: 'none',
            color: '#6B7280',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '8px',
            padding: 0,
          }}
        >
          ← Back to Group Buys
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827' }}>
          {isEdit ? 'Edit Group Buy' : 'New Group Buy'}
        </h1>
      </div>

      {/* Score Result */}
      {scoreResult && (
        <div style={{
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#065F46' }}>
              ✅ Saved! Urgency Score:
            </span>
            <ScoreBadge
              score={scoreResult.urgencyScore}
              level={scoreResult.urgencyLevel}
            />
          </div>
          <AlertBanner
            alerts={scoreResult.alerts}
            level={scoreResult.urgencyLevel}
            recommendation={scoreResult.recommendation}
          />
        </div>
      )}

      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#DC2626',
          fontSize: '14px',
          marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
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
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '1px solid #F3F4F6',
          }}>
            Group Buy Details
          </h2>

          <div style={fieldStyle}>
            <label style={labelStyle}>Product Title *</label>
            <input
              style={inputStyle}
              type="text"
              name="productTitle"
              value={form.productTitle}
              onChange={handleChange}
              placeholder="e.g. TL-Obsidian 65% Keyboard"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Status</label>
              <select
                style={inputStyle}
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Current Stage</label>
              <select
                style={inputStyle}
                name="currentStage"
                value={form.currentStage}
                onChange={handleChange}
              >
                {STAGES.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Target Ship Date *</label>
            <input
              style={inputStyle}
              type="date"
              name="targetShipDate"
              value={form.targetShipDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Customer Count</label>
              <input
                style={inputStyle}
                type="text"
                inputMode="numeric"
                name="customerCount"
                value={form.customerCount}
                onChange={handleChange}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Funding Goal ($)</label>
              <input
                style={inputStyle}
                type="text"
                inputMode="numeric"
                name="fundingGoal"
                value={form.fundingGoal}
                onChange={handleChange}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Current Funding ($)</label>
              <input
                style={inputStyle}
                type="text"
                inputMode="numeric"
                name="currentFunding"
                value={form.currentFunding}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              Delay Days
              <span style={{ color: '#EF4444', marginLeft: '4px', fontWeight: '400' }}>
                (0 = on schedule)
              </span>
            </label>
            <input
              style={inputStyle}
              type="text"
              inputMode="numeric"
              name="delayDays"
              value={form.delayDays}
              onChange={handleChange}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Notes / Supplier Update</label>
            <textarea
              style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Add any notes about this group buy..."
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 24px',
              background: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Group Buy'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/group-buys')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Centered Modal Box */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(17, 24, 39, 0.18)',
            backdropFilter: 'blur(2px)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: toast.type === 'success'
                ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
                : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
              borderRadius: '16px',
              boxShadow: toast.type === 'success'
                ? '0 12px 32px rgba(16, 185, 129, 0.25)'
                : '0 12px 32px rgba(220, 38, 38, 0.25)',
              border: `1px solid ${toast.type === 'success' ? '#6EE7B7' : '#FCA5A5'}`,
              maxWidth: '360px',
              width: '90%',
              padding: '28px 28px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: toast.type === 'success' ? '#10B981' : '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '22px',
                color: '#fff',
              }}
            >
              {toast.type === 'success' ? '✓' : '!'}
            </div>

            <div
              style={{
                fontSize: '15px',
                fontWeight: '600',
                color: toast.type === 'success' ? '#065F46' : '#991B1B',
                marginBottom: '20px',
                lineHeight: 1.5,
              }}
            >
              {toast.message}
            </div>

            <button
              type="button"
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              style={{
                background: toast.type === 'success' ? '#10B981' : '#DC2626',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 32px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}