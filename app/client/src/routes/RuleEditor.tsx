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
  customerCount: number;
  fundingGoal: number;
  currentFunding: number;
  notes: string;
  delayDays: number;
}

const DEFAULT_FORM: FormData = {
  productTitle: '',
  status: 'open',
  targetShipDate: '',
  currentStage: 'Funding',
  customerCount: 0,
  fundingGoal: 0,
  currentFunding: 0,
  notes: '',
  delayDays: 0,
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
            customerCount: rule.customerCount || 0,
            fundingGoal: rule.fundingGoal || 0,
            currentFunding: rule.currentFunding || 0,
            notes: rule.notes || '',
            delayDays: rule.latestScore?.delayDays || 0,
          });
        }
      })
      .catch(() => setError('Failed to load group buy'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(
    e: React.ChangeEvent <
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        productTitle: form.productTitle,
        status: form.status,
        targetShipDate: form.targetShipDate,
        currentStage: form.currentStage,
        customerCount: form.customerCount,
        fundingGoal: form.fundingGoal,
        currentFunding: form.currentFunding,
        notes: form.notes,
      };

      let ruleId = id;

      if (isEdit) {
        await apiClient.put(`/rules/${id}`, payload);
      } else {
        const res = await apiClient.post<any>('/rules', payload);
        ruleId = res.data?.id;
      }

      // Score the rule after save
      if (ruleId) {
        const scoreRes = await apiClient.post<any>(
          `/scoring/${ruleId}/score`,
          { delayDays: form.delayDays }
        );
        if (scoreRes.success) setScoreResult(scoreRes.data);
      }

      setTimeout(() => navigate('/group-buys'), 1500);
    } catch {
      setError('Failed to save group buy');
    } finally {
      setSaving(false);
    }
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
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Customer Count</label>
              <input
                style={inputStyle}
                type="number"
                name="customerCount"
                value={form.customerCount}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Funding Goal ($)</label>
              <input
                style={inputStyle}
                type="number"
                name="fundingGoal"
                value={form.fundingGoal}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Current Funding ($)</label>
              <input
                style={inputStyle}
                type="number"
                name="currentFunding"
                value={form.currentFunding}
                onChange={handleChange}
                min="0"
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
              type="number"
              name="delayDays"
              value={form.delayDays}
              onChange={handleChange}
              min="0"
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
    </div>
  );
}