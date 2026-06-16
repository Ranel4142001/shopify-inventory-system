import React from 'react';

interface AlertBannerProps {
  alerts: string[];
  level: 'critical' | 'high' | 'medium' | 'info';
  recommendation?: string;
}

export function AlertBanner({
  alerts,
  level,
  recommendation,
}: AlertBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  const bannerLevel = level === 'medium' ? 'info' : level;

  return (
    <div>
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`alert-banner alert-banner--${bannerLevel}`}
        >
          <span className="alert-banner__icon">
            {level === 'critical' ? '🚨' : level === 'high' ? '⚠️' : 'ℹ️'}
          </span>
          <div className="alert-banner__content">
            <p>{alert}</p>
          </div>
        </div>
      ))}
      {recommendation && (
        <div className="alert-banner alert-banner--info">
          <span className="alert-banner__icon">💡</span>
          <div className="alert-banner__content">
            <p className="alert-banner__title">Recommendation</p>
            <p>{recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}