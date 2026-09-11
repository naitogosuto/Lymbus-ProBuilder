'use client';

import React from 'react';
import { Identity } from '../lib/types';
import { KeywordBadge } from './KeywordBadge';
import { StarRating } from './StarRating';
import { getSinners } from '../lib/api';

interface IdentityCardProps {
  identity: Identity;
  isSelected?: boolean;
  onSelect?: (identity: Identity) => void;
}

const sinColorMap: Record<string, string> = {
  Wrath: '#ef4444',
  Lust: '#f97316',
  Sloth: '#fbbf24',
  Gluttony: '#84cc16',
  Gloom: '#06b6d4',
  Pride: '#3b82f6',
  Envy: '#a855f7'
};

export const IdentityCard: React.FC<IdentityCardProps> = ({
  identity,
  isSelected = false,
  onSelect
}) => {
  const sinner = getSinners().find(s => s.id === identity.sinnerId);
  const themeColor = sinner ? sinner.themeColor : 'var(--border-color)';

  return (
    <div
      onClick={() => onSelect && onSelect(identity)}
      style={{
        position: 'relative',
        background: 'var(--bg-card)',
        border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1rem',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: isSelected
          ? '0 0 16px rgba(196, 163, 90, 0.35)'
          : '0 4px 12px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}
      className="identity-card"
    >
      {/* Top Bar with Sinner tag & Rarity */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: themeColor,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: `${themeColor}15`,
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
            border: `1px solid ${themeColor}40`
          }}
        >
          {identity.sinner}
        </span>
        <StarRating rarity={identity.rarity} />
      </div>

      {/* Identity Title */}
      <div>
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: '1.25',
          minHeight: '2.5rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {identity.name}
        </h4>
      </div>

      {/* Keywords */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', minHeight: '1.6rem' }}>
        {identity.keywords.map(kw => (
          <KeywordBadge key={kw} keyword={kw} size="sm" />
        ))}
      </div>

      {/* Skills Sin Indicators */}
      {identity.skills && identity.skills.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <span>Skills:</span>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {identity.skills.map((skill, idx) => (
              <span
                key={idx}
                title={`${skill.name} (${skill.sin} / ${skill.attackType})`}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: sinColorMap[skill.sin] || '#888',
                  boxShadow: `0 0 6px ${sinColorMap[skill.sin]}80`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Selected Ribbon Badge */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'var(--accent-gold)',
          color: '#0a0a0f',
          fontSize: '0.65rem',
          fontWeight: 800,
          padding: '0.1rem 0.4rem',
          borderRadius: '4px'
        }}>
          EQUIPPED
        </div>
      )}
    </div>
  );
};
