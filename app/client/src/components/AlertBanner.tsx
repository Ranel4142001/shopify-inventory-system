import React from 'react';

interface AlertBannerProps {
  alerts: string[];
  level: 'critical' | 'high' | 'medium' | 'info';
  recommendation?: string;
}

// Regex to detect and strip leading emojis
const cleanAlertText = (alertStr: string) => {
  const emojiMatch = alertStr.match(/^(\p{Extended_Pictographic})\s*(.*)$/u);
  if (emojiMatch) {
    return { icon: emojiMatch[1], text: emojiMatch[2] };
  }
  return { icon: null, text: alertStr };
};

export function AlertBanner({
  alerts,
  level,
  recommendation,
}: AlertBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  const bannerLevel = level === 'medium' ? 'info' : level;

  return (
    <div>
      {alerts.map((alert, i) => {
        const { icon: parsedIcon, text: cleanText } = cleanAlertText(alert);
        const icon = parsedIcon || (level === 'critical' ? '🚨' : level === 'high' ? '⚠️' : 'ℹ️');
        return (
          <div
            key={i}
            className={`alert-banner alert-banner--${bannerLevel}`}
          >
            <span className="alert-banner__icon">
              {icon}
            </span>
            <div className="alert-banner__content">
              <p>{cleanText}</p>
            </div>
          </div>
        );
      })}
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