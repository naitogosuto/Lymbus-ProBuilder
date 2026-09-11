'use client';

import React from 'react';
import { Sinner, Identity } from '../lib/types';
import { KeywordBadge } from './KeywordBadge';
import { StarRating } from './StarRating';

interface SinnerSlotProps {
  sinner: Sinner;
  equippedIdentity: Identity | null;
  onRemove: (sinnerId: number) => void;
  onOpenSelectModal: (sinnerId: number) => void;
}

export const SinnerSlot: React.FC<SinnerSlotProps> = ({
  sinner,
  equippedIdentity,
  onRemove,
  onOpenSelectModal
}) => {
  return (
    <div
      style={{
        background: equippedIdentity ? 'var(--bg-tertiary)' : 'rgba(26, 26, 38, 0.4)',
        border: equippedIdentity
          ? `1px solid ${sinner.themeColor}80`
          : '1px dashed var(--border-color)',
        borderRadius: '12px',
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        boxShadow: equippedIdentity ? `0 0 12px ${sinner.themeColor}20` : 'none'
      }}
    >
      {/* Sinner Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: `${sinner.themeColor}25`,
          border: `2px solid ${sinner.themeColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '0.9rem',
          color: sinner.themeColor
        }}>
          #{sinner.id}
        </div>

        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: sinner.themeColor }}>
            {sinner.name}
          </div>
          {equippedIdentity ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
              <StarRating rarity={equippedIdentity.rarity} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {equippedIdentity.name}
              </span>
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              No Identity Equipped
            </div>
          )}
        </div>
      </div>

      {/* Keywords & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {equippedIdentity && (
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {equippedIdentity.keywords.map(kw => (
              <KeywordBadge key={kw} keyword={kw} size="sm" />
            ))}
          </div>
        )}

        {equippedIdentity ? (
          <button
            onClick={() => onRemove(sinner.id)}
            style={{
              background: 'rgba(232, 64, 87, 0.15)',
              color: 'var(--accent-red)',
              border: '1px solid rgba(232, 64, 87, 0.4)',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Unequip
          </button>
        ) : (
          <button
            onClick={() => onOpenSelectModal(sinner.id)}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--accent-gold)',
              border: '1px solid var(--accent-gold)',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Equip
          </button>
        )}
      </div>
    </div>
  );
};
