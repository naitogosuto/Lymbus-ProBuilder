'use client';

import React, { useState, useMemo } from 'react';
import { getEgos, getSinners } from '@/lib/api';
import { RiskTier } from '@/lib/types';
import { EgoCard } from '@/components/EgoCard';

const riskTiers: RiskTier[] = ['ZAYIN', 'TETH', 'HE', 'WAW', 'ALEPH'];

const riskBadgeStyle: Record<RiskTier, { color: string; border: string }> = {
  ZAYIN: { color: '#2ecc71', border: 'rgba(46, 204, 113, 0.4)' },
  TETH: { color: '#3498db', border: 'rgba(52, 152, 219, 0.4)' },
  HE: { color: '#f1c40f', border: 'rgba(241, 196, 15, 0.4)' },
  WAW: { color: '#9b59b6', border: 'rgba(155, 89, 182, 0.4)' },
  ALEPH: { color: '#e74c3c', border: 'rgba(231, 76, 60, 0.4)' }
};

export default function EgoDatabasePage() {
  const allEgos = getEgos();
  const sinners = getSinners();

  const [selectedSinnerId, setSelectedSinnerId] = useState<number | null>(null);
  const [selectedRiskTier, setSelectedRiskTier] = useState<RiskTier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEgos = useMemo(() => {
    return allEgos.filter(ego => {
      if (selectedSinnerId && ego.sinnerId !== selectedSinnerId) {
        return false;
      }
      if (selectedRiskTier && ego.riskTier !== selectedRiskTier) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = ego.name.toLowerCase().includes(q);
        const matchSinner = ego.sinner.toLowerCase().includes(q);
        const matchRisk = ego.riskTier.toLowerCase().includes(q);
        const matchCost = ego.cost.some(c => c.sin.toLowerCase().includes(q));
        if (!matchName && !matchSinner && !matchRisk && !matchCost) {
          return false;
        }
      }
      return true;
    });
  }, [allEgos, selectedSinnerId, selectedRiskTier, searchQuery]);

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>🔥 E.G.O Database</h1>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '0.2rem 0.6rem',
            borderRadius: '20px'
          }}>
            {allEgos.length} E.G.Os
          </span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Browse all extracted Limbus Company E.G.Os, filter by Sinner or Risk Tier, and check sin cost requirements.
        </p>
      </div>

      {/* Filter Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Search & Clear */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search E.G.O by name, sinner, risk, or sin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />

          {(selectedSinnerId || selectedRiskTier || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSinnerId(null);
                setSelectedRiskTier(null);
                setSearchQuery('');
              }}
              style={{
                background: 'transparent',
                color: 'var(--accent-red)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '0.55rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter by Sinner */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Filter by Sinner
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              onClick={() => setSelectedSinnerId(null)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid',
                cursor: 'pointer',
                borderColor: selectedSinnerId === null ? 'var(--accent-gold)' : 'var(--border-color)',
                background: selectedSinnerId === null ? 'rgba(196, 163, 90, 0.15)' : 'var(--bg-tertiary)',
                color: selectedSinnerId === null ? 'var(--accent-gold)' : 'var(--text-secondary)'
              }}
            >
              All Sinners
            </button>

            {sinners.map(s => {
              const isSelected = selectedSinnerId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSinnerId(isSelected ? null : s.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid',
                    cursor: 'pointer',
                    borderColor: isSelected ? s.themeColor : 'var(--border-color)',
                    background: isSelected ? `${s.themeColor}22` : 'var(--bg-tertiary)',
                    color: isSelected ? s.themeColor : 'var(--text-secondary)'
                  }}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter by Risk Tier */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Filter by Risk Tier
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              onClick={() => setSelectedRiskTier(null)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid',
                cursor: 'pointer',
                borderColor: selectedRiskTier === null ? 'var(--accent-gold)' : 'var(--border-color)',
                background: selectedRiskTier === null ? 'rgba(196, 163, 90, 0.15)' : 'var(--bg-tertiary)',
                color: selectedRiskTier === null ? 'var(--accent-gold)' : 'var(--text-secondary)'
              }}
            >
              All Risk Tiers
            </button>

            {riskTiers.map(tier => {
              const isSelected = selectedRiskTier === tier;
              const style = riskBadgeStyle[tier];
              return (
                <button
                  key={tier}
                  onClick={() => setSelectedRiskTier(isSelected ? null : tier)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: '1px solid',
                    cursor: 'pointer',
                    borderColor: isSelected ? style.color : 'var(--border-color)',
                    background: isSelected ? `${style.color}25` : 'var(--bg-tertiary)',
                    color: isSelected ? style.color : 'var(--text-secondary)'
                  }}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      <div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 600 }}>
          Showing {filteredEgos.length} of {allEgos.length} E.G.Os
        </div>

        {filteredEgos.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            {filteredEgos.map(ego => (
              <EgoCard key={ego.id} ego={ego} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No E.G.Os found</div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Try clearing filters or searching for something else.</p>
          </div>
        )}
      </div>
    </div>
  );
}
