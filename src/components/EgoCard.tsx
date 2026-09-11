import React from 'react';
import { Ego, RiskTier, SinType } from '@/lib/types';
import { getSinners } from '@/lib/api';

const riskColorMap: Record<RiskTier, { bg: string; text: string; border: string }> = {
  ZAYIN: { bg: 'rgba(46, 204, 113, 0.15)', text: '#2ecc71', border: 'rgba(46, 204, 113, 0.4)' },
  TETH: { bg: 'rgba(52, 152, 219, 0.15)', text: '#3498db', border: 'rgba(52, 152, 219, 0.4)' },
  HE: { bg: 'rgba(241, 196, 15, 0.15)', text: '#f1c40f', border: 'rgba(241, 196, 15, 0.4)' },
  WAW: { bg: 'rgba(155, 89, 182, 0.15)', text: '#9b59b6', border: 'rgba(155, 89, 182, 0.4)' },
  ALEPH: { bg: 'rgba(231, 76, 60, 0.15)', text: '#e74c3c', border: 'rgba(231, 76, 60, 0.4)' },
};

const sinColorMap: Record<SinType, string> = {
  Wrath: '#ef4444',
  Lust: '#f97316',
  Sloth: '#fbbf24',
  Gluttony: '#84cc16',
  Gloom: '#06b6d4',
  Pride: '#3b82f6',
  Envy: '#a855f7',
};

interface EgoCardProps {
  ego: Ego;
}

export const EgoCard: React.FC<EgoCardProps> = ({ ego }) => {
  const sinners = getSinners();
  const sinnerInfo = sinners.find(s => s.id === ego.sinnerId);
  const sinnerColor = sinnerInfo?.themeColor || 'var(--accent-gold)';

  const riskStyle = riskColorMap[ego.riskTier] || riskColorMap.ZAYIN;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.1rem',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        background: 'var(--bg-secondary)'
      }}
    >
      {/* Top Bar: Sinner Tag + Risk Tier */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: sinnerColor,
            background: `${sinnerColor}15`,
            border: `1px solid ${sinnerColor}40`,
            padding: '0.2rem 0.55rem',
            borderRadius: '6px'
          }}
        >
          {ego.sinner}
        </div>

        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 900,
            letterSpacing: '0.5px',
            color: riskStyle.text,
            background: riskStyle.bg,
            border: `1px solid ${riskStyle.border}`,
            padding: '0.2rem 0.6rem',
            borderRadius: '6px'
          }}
        >
          {ego.riskTier}
        </div>
      </div>

      {/* EGO Name */}
      <div>
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            margin: 0
          }}
        >
          {ego.name}
        </h3>
      </div>

      {/* Sin Cost Breakdown */}
      <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
          Sin Cost Requirements
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {ego.cost.length > 0 ? (
            ego.cost.map((costItem, i) => {
              const color = sinColorMap[costItem.sin] || '#aaa';
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: color,
                    background: `${color}18`,
                    border: `1px solid ${color}40`,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                  {costItem.sin} × {costItem.count}
                </span>
              );
            })
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No sin cost</span>
          )}
        </div>
      </div>
    </div>
  );
};
