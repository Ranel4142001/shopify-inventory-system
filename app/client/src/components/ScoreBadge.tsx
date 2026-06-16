import React from 'react';

interface ScoreBadgeProps {
  score: number;
  level: 'critical' | 'high' | 'medium' | 'low';
  showScore?: boolean;
}

const LEVEL_ICONS = {
  critical: '🚨',
  high: '⚠️',
  medium: '🔵',
  low: '✅',
};

const LEVEL_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function ScoreBadge({
  score,
  level,
  showScore = true,
}: ScoreBadgeProps) {
  return (
    <span className={`score-badge score-badge--${level}`}>
      {LEVEL_ICONS[level]}
      {LEVEL_LABELS[level]}
      {showScore && (
        <span style={{ opacity: 0.8, marginLeft: 2 }}>
          {score}
        </span>
      )}
    </span>
  );
}