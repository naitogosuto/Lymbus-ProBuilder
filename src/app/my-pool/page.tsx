'use client';

import React, { useState, useMemo } from 'react';
import { getIdentities, getSinners, getKeywords, filterIdentities, getEgos, filterEgos } from '@/lib/api';
import { KeywordType, Rarity, Identity, Ego, RiskTier } from '@/lib/types';
import { usePlayerPool } from '@/lib/usePlayerPool';
import { KeywordBadge } from '@/components/KeywordBadge';
import { StarRating } from '@/components/StarRating';
import Link from 'next/link';

const riskTiers: RiskTier[] = ['ZAYIN', 'TETH', 'HE', 'WAW', 'ALEPH'];

const riskBadgeStyle: Record<RiskTier, { color: string; border: string }> = {
  ZAYIN: { color: '#2ecc71', border: 'rgba(46, 204, 113, 0.4)' },
  TETH: { color: '#3498db', border: 'rgba(52, 152, 219, 0.4)' },
  HE: { color: '#f1c40f', border: 'rgba(241, 196, 15, 0.4)' },
  WAW: { color: '#9b59b6', border: 'rgba(155, 89, 182, 0.4)' },
  ALEPH: { color: '#e74c3c', border: 'rgba(231, 76, 60, 0.4)' }
};

export default function MyPoolPage() {
  const pool = usePlayerPool();
  const sinners = getSinners();
  const keywords = getKeywords();
  const allIdentities = getIdentities();
  const allEgos = getEgos();

  // Tab State
  const [activeTab, setActiveTab] = useState<'identities' | 'egos'>('identities');

  // Identity Filters State
  const [selectedSinnerId, setSelectedSinnerId] = useState<number | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordType | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<Rarity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyOwned, setShowOnlyOwned] = useState(false);

  // E.G.O Filters State
  const [egoSinnerId, setEgoSinnerId] = useState<number | null>(null);
  const [egoRiskTier, setEgoRiskTier] = useState<RiskTier | null>(null);
  const [egoSearchQuery, setEgoSearchQuery] = useState('');
  const [egoShowOnlyOwned, setEgoShowOnlyOwned] = useState(false);

  // Filtered Identities
  const filteredIdentities = useMemo(() => {
    let result = filterIdentities({
      sinnerId: selectedSinnerId,
      keyword: selectedKeyword,
      rarity: selectedRarity,
      searchQuery
    });
    if (showOnlyOwned) {
      result = result.filter(i => pool.isOwned(i.id));
    }
    return result;
  }, [selectedSinnerId, selectedKeyword, selectedRarity, searchQuery, showOnlyOwned, pool]);

  // Filtered E.G.Os
  const filteredEgos = useMemo(() => {
    let result = filterEgos({
      sinnerId: egoSinnerId,
      riskTier: egoRiskTier,
      searchQuery: egoSearchQuery
    });
    if (egoShowOnlyOwned) {
      result = result.filter(e => pool.isEgoOwned(e.id));
    }
    return result;
  }, [egoSinnerId, egoRiskTier, egoSearchQuery, egoShowOnlyOwned, pool]);

  // Identity Stats per sinner
  const sinnerIdentityStats = useMemo(() => {
    const stats: Record<number, { total: number; owned: number }> = {};
    sinners.forEach(s => {
      const sinnerIds = allIdentities.filter(i => i.sinnerId === s.id);
      stats[s.id] = {
        total: sinnerIds.length,
        owned: sinnerIds.filter(i => pool.isOwned(i.id)).length
      };
    });
    return stats;
  }, [sinners, allIdentities, pool]);

  // E.G.O Stats per sinner
  const sinnerEgoStats = useMemo(() => {
    const stats: Record<number, { total: number; owned: number }> = {};
    sinners.forEach(s => {
      const sinnerEgos = allEgos.filter(e => e.sinnerId === s.id);
      stats[s.id] = {
        total: sinnerEgos.length,
        owned: sinnerEgos.filter(e => pool.isEgoOwned(e.id)).length
      };
    });
    return stats;
  }, [sinners, allEgos, pool]);

  // Identity Bulk Actions
  const handleSelectAllVisibleIdentities = () => {
    pool.addMany(filteredIdentities.map(i => i.id));
  };

  const handleDeselectAllVisibleIdentities = () => {
    pool.removeMany(filteredIdentities.map(i => i.id));
  };

  const handleSelectAll3StarIdentities = () => {
    pool.addMany(allIdentities.filter(i => i.rarity === 3).map(i => i.id));
  };

  const handleResetIdentityFilters = () => {
    setSelectedSinnerId(null);
    setSelectedKeyword(null);
    setSelectedRarity(null);
    setSearchQuery('');
    setShowOnlyOwned(false);
  };

  // E.G.O Bulk Actions
  const handleSelectAllVisibleEgos = () => {
    pool.addManyEgos(filteredEgos.map(e => e.id));
  };

  const handleDeselectAllVisibleEgos = () => {
    pool.removeManyEgos(filteredEgos.map(e => e.id));
  };

  const handleSelectAllWawEgos = () => {
    pool.addManyEgos(allEgos.filter(e => e.riskTier === 'WAW' || e.riskTier === 'HE').map(e => e.id));
  };

  const handleResetEgoFilters = () => {
    setEgoSinnerId(null);
    setEgoRiskTier(null);
    setEgoSearchQuery('');
    setEgoShowOnlyOwned(false);
  };

  const identityProgressPct = allIdentities.length > 0
    ? Math.round((pool.ownedCount / allIdentities.length) * 100)
    : 0;

  const egoProgressPct = allEgos.length > 0
    ? Math.round((pool.ownedEgoCount / allEgos.length) * 100)
    : 0;

  if (!pool.isLoaded) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading your collection...</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>💼 My Pool</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Manage your owned Identities and E.G.Os. The Party Builder uses your pool to recommend optimal teams.
          </p>
        </div>
        <Link
          href="/party-builder"
          style={{
            background: 'linear-gradient(135deg, #c4a35a 0%, #a88438 100%)',
            color: '#0a0a0f',
            padding: '0.55rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.85rem',
            textDecoration: 'none'
          }}
        >
          🔨 Go to Party Builder →
        </Link>
      </div>

      {/* Main Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('identities')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px 8px 0 0',
            fontWeight: 700,
            fontSize: '0.95rem',
            border: '1px solid',
            cursor: 'pointer',
            borderColor: activeTab === 'identities' ? 'var(--accent-gold)' : 'transparent',
            background: activeTab === 'identities' ? 'rgba(196, 163, 90, 0.12)' : 'transparent',
            color: activeTab === 'identities' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>🃏 Identities</span>
          <span style={{
            fontSize: '0.75rem',
            background: 'rgba(196, 163, 90, 0.2)',
            padding: '0.1rem 0.45rem',
            borderRadius: '12px'
          }}>
            {pool.ownedCount} / {allIdentities.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('egos')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px 8px 0 0',
            fontWeight: 700,
            fontSize: '0.95rem',
            border: '1px solid',
            cursor: 'pointer',
            borderColor: activeTab === 'egos' ? '#ef4444' : 'transparent',
            background: activeTab === 'egos' ? 'rgba(239, 68, 68, 0.12)' : 'transparent',
            color: activeTab === 'egos' ? '#ef4444' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>🔥 E.G.Os</span>
          <span style={{
            fontSize: '0.75rem',
            background: 'rgba(239, 68, 68, 0.2)',
            padding: '0.1rem 0.45rem',
            borderRadius: '12px'
          }}>
            {pool.ownedEgoCount} / {allEgos.length}
          </span>
        </button>
      </div>

      {/* ===== IDENTITIES TAB CONTENT ===== */}
      {activeTab === 'identities' && (
        <>
          {/* Collection Progress Card */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Identities Collection Progress
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {pool.ownedCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {allIdentities.length} Identities Owned</span>
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
                {identityProgressPct}%
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ background: 'var(--bg-tertiary)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${identityProgressPct}%`,
                  background: 'linear-gradient(90deg, var(--accent-gold) 0%, #f39c12 100%)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            {/* Quick Bulk Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={handleSelectAllVisibleIdentities} style={btnSmallStyle}>
                ✓ Select Visible ({filteredIdentities.length})
              </button>
              <button onClick={handleDeselectAllVisibleIdentities} style={btnSmallStyle}>
                ✗ Deselect Visible
              </button>
              <button onClick={handleSelectAll3StarIdentities} style={btnSmallGoldStyle}>
                ⭐ Select All 3★
              </button>
              <button onClick={() => pool.setAllOwned(allIdentities.map(i => i.id))} style={btnSmallStyle}>
                Check All 185
              </button>
              <button onClick={() => pool.clearAll()} style={btnSmallRedStyle}>
                Clear All Identities
              </button>
            </div>
          </div>

          {/* Per-Sinner Identity Breakdown */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Collection by Sinner
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
              {sinners.map(s => {
                const stat = sinnerIdentityStats[s.id] || { total: 0, owned: 0 };
                const isSelected = selectedSinnerId === s.id;
                const pct = stat.total > 0 ? Math.round((stat.owned / stat.total) * 100) : 0;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSinnerId(isSelected ? null : s.id)}
                    style={{
                      background: isSelected ? `${s.themeColor}25` : 'var(--bg-tertiary)',
                      border: `1px solid ${isSelected ? s.themeColor : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      padding: '0.5rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: s.themeColor }}>{s.name}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {stat.owned}/{stat.total} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>({pct}%)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Identity Filters */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search identities by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showOnlyOwned}
                  onChange={() => setShowOnlyOwned(!showOnlyOwned)}
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
                Show Only Owned
              </label>

              {(selectedSinnerId || selectedKeyword || selectedRarity || searchQuery || showOnlyOwned) && (
                <button onClick={handleResetIdentityFilters} style={{ fontSize: '0.8rem', color: 'var(--accent-red)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Identities Grid */}
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
              Showing {filteredIdentities.length} Identities — Click card to toggle ownership
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {filteredIdentities.map(identity => {
                const owned = pool.isOwned(identity.id);
                const sinner = sinners.find(s => s.id === identity.sinnerId);
                const sinnerColor = sinner?.themeColor || 'var(--accent-gold)';

                return (
                  <div
                    key={identity.id}
                    onClick={() => pool.toggleOwned(identity.id)}
                    style={{
                      background: owned ? 'var(--bg-secondary)' : 'rgba(10, 10, 15, 0.4)',
                      border: `1px solid ${owned ? sinnerColor : 'var(--border-color)'}`,
                      opacity: owned ? 1 : 0.6,
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      position: 'relative',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Checkbox indicator */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: sinnerColor }}>
                        {identity.sinner}
                      </span>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: `1px solid ${owned ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                          background: owned ? 'var(--accent-gold)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000',
                          fontWeight: 900,
                          fontSize: '0.75rem'
                        }}
                      >
                        {owned ? '✓' : ''}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {identity.name}
                    </div>

                    <StarRating rarity={identity.rarity} />

                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                      {identity.keywords.map(kw => (
                        <KeywordBadge key={kw} keyword={kw} size="sm" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ===== E.G.OS TAB CONTENT ===== */}
      {activeTab === 'egos' && (
        <>
          {/* E.G.O Collection Progress Card */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  E.G.O Collection Progress
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {pool.ownedEgoCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {allEgos.length} E.G.Os Owned</span>
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ef4444' }}>
                {egoProgressPct}%
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ background: 'var(--bg-tertiary)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${egoProgressPct}%`,
                  background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            {/* Quick Bulk Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={handleSelectAllVisibleEgos} style={btnSmallStyle}>
                ✓ Select Visible ({filteredEgos.length})
              </button>
              <button onClick={handleDeselectAllVisibleEgos} style={btnSmallStyle}>
                ✗ Deselect Visible
              </button>
              <button onClick={handleSelectAllWawEgos} style={btnSmallGoldStyle}>
                🔥 Select HE & WAW E.G.Os
              </button>
              <button onClick={() => pool.setAllEgosOwned(allEgos.map(e => e.id))} style={btnSmallStyle}>
                Check All 112
              </button>
              <button onClick={() => pool.clearAllEgos()} style={btnSmallRedStyle}>
                Clear All E.G.Os
              </button>
            </div>
          </div>

          {/* Per-Sinner E.G.O Breakdown */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              E.G.O Collection by Sinner
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
              {sinners.map(s => {
                const stat = sinnerEgoStats[s.id] || { total: 0, owned: 0 };
                const isSelected = egoSinnerId === s.id;
                const pct = stat.total > 0 ? Math.round((stat.owned / stat.total) * 100) : 0;
                return (
                  <button
                    key={s.id}
                    onClick={() => setEgoSinnerId(isSelected ? null : s.id)}
                    style={{
                      background: isSelected ? `${s.themeColor}25` : 'var(--bg-tertiary)',
                      border: `1px solid ${isSelected ? s.themeColor : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      padding: '0.5rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: s.themeColor }}>{s.name}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {stat.owned}/{stat.total} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>({pct}%)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* E.G.O Filters */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search E.G.O by name, sinner, risk, or sin..."
                value={egoSearchQuery}
                onChange={(e) => setEgoSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />

              {/* Risk Filter */}
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {riskTiers.map(tier => {
                  const isSelected = egoRiskTier === tier;
                  const style = riskBadgeStyle[tier];
                  return (
                    <button
                      key={tier}
                      onClick={() => setEgoRiskTier(isSelected ? null : tier)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
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

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={egoShowOnlyOwned}
                  onChange={() => setEgoShowOnlyOwned(!egoShowOnlyOwned)}
                  style={{ accentColor: '#ef4444' }}
                />
                Show Only Owned
              </label>

              {(egoSinnerId || egoRiskTier || egoSearchQuery || egoShowOnlyOwned) && (
                <button onClick={handleResetEgoFilters} style={{ fontSize: '0.8rem', color: 'var(--accent-red)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* E.G.O Grid */}
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
              Showing {filteredEgos.length} E.G.Os — Click card to toggle ownership
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {filteredEgos.map(ego => {
                const owned = pool.isEgoOwned(ego.id);
                const sinner = sinners.find(s => s.id === ego.sinnerId);
                const sinnerColor = sinner?.themeColor || '#ef4444';
                const riskStyle = riskBadgeStyle[ego.riskTier];

                return (
                  <div
                    key={ego.id}
                    onClick={() => pool.toggleEgoOwned(ego.id)}
                    style={{
                      background: owned ? 'var(--bg-secondary)' : 'rgba(10, 10, 15, 0.4)',
                      border: `1px solid ${owned ? riskStyle.color : 'var(--border-color)'}`,
                      opacity: owned ? 1 : 0.6,
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      position: 'relative',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Top Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: sinnerColor }}>
                        {ego.sinner}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: riskStyle.color,
                          background: `${riskStyle.color}15`,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px'
                        }}>
                          {ego.riskTier}
                        </span>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: `1px solid ${owned ? '#ef4444' : 'var(--border-color)'}`,
                            background: owned ? '#ef4444' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 900,
                            fontSize: '0.75rem'
                          }}
                        >
                          {owned ? '✓' : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {ego.name}
                    </div>

                    {/* Sin Cost Pills */}
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '0.35rem' }}>
                      {ego.cost.map((c, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                          {c.sin} ×{c.count}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Button styles
const btnSmallStyle: React.CSSProperties = {
  background: 'var(--bg-tertiary)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-color)',
  padding: '0.35rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const btnSmallGoldStyle: React.CSSProperties = {
  background: 'rgba(196, 163, 90, 0.15)',
  color: 'var(--accent-gold)',
  border: '1px solid rgba(196, 163, 90, 0.4)',
  padding: '0.35rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 700,
  cursor: 'pointer'
};

const btnSmallRedStyle: React.CSSProperties = {
  background: 'rgba(239, 68, 68, 0.12)',
  color: '#ef4444',
  border: '1px solid rgba(239, 68, 68, 0.4)',
  padding: '0.35rem 0.65rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 700,
  cursor: 'pointer'
};
