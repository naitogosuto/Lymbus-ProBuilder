'use client';

import React, { useState } from 'react';
import { filterIdentities } from '@/lib/api';
import { KeywordType, Rarity } from '@/lib/types';
import { FilterPanel } from '@/components/FilterPanel';
import { IdentityCard } from '@/components/IdentityCard';

export default function IdentitiesDatabasePage() {
  const [selectedSinnerId, setSelectedSinnerId] = useState<number | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordType | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<Rarity | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredIdentities = filterIdentities({
    sinnerId: selectedSinnerId,
    keyword: selectedKeyword,
    rarity: selectedRarity,
    searchQuery
  });

  const handleResetFilters = () => {
    setSelectedSinnerId(null);
    setSelectedKeyword(null);
    setSelectedRarity(null);
    setSearchQuery('');
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>🃏 Identity Database</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Browse, search, and filter all 185+ Limbus Company identities by sinner, rarity, and status archetype.
        </p>
      </div>

      {/* Filter Ribbon */}
      <FilterPanel
        selectedSinnerId={selectedSinnerId}
        onSelectSinner={setSelectedSinnerId}
        selectedKeyword={selectedKeyword}
        onSelectKeyword={setSelectedKeyword}
        selectedRarity={selectedRarity}
        onSelectRarity={setSelectedRarity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReset={handleResetFilters}
        totalResults={filteredIdentities.length}
      />

      {/* Identity Cards Grid */}
      {filteredIdentities.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredIdentities.map(identity => (
            <IdentityCard key={identity.id} identity={identity} />
          ))}
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{
            padding: '3rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{ fontSize: '2.5rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>No Identities Found</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
            No identities match your current filter combination. Try clearing some filters to expand your search.
          </p>
          <button
            onClick={handleResetFilters}
            style={{
              background: 'var(--accent-gold)',
              color: '#0a0a0f',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
