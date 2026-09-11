'use client';

import React from 'react';
import { KeywordType, Rarity } from '../lib/types';
import { getSinners, getKeywords } from '../lib/api';

interface FilterPanelProps {
  selectedSinnerId: number | null;
  onSelectSinner: (id: number | null) => void;
  selectedKeyword: KeywordType | null;
  onSelectKeyword: (kw: KeywordType | null) => void;
  selectedRarity: Rarity | null;
  onSelectRarity: (rarity: Rarity | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onReset: () => void;
  totalResults: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedSinnerId,
  onSelectSinner,
  selectedKeyword,
  onSelectKeyword,
  selectedRarity,
  onSelectRarity,
  searchQuery,
  onSearchChange,
  onReset,
  totalResults
}) => {
  const sinners = getSinners();
  const keywords = getKeywords();

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search Input & Reset */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search identity by name or keyword..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {totalResults} results
        </div>
        {(selectedSinnerId || selectedKeyword || selectedRarity || searchQuery) && (
          <button
            onClick={onReset}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--accent-red)',
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Sinner Selector */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          Filter by Sinner
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          <button
            onClick={() => onSelectSinner(null)}
            style={{
              padding: '0.35rem 0.7rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: selectedSinnerId === null ? 700 : 500,
              background: selectedSinnerId === null ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
              color: selectedSinnerId === null ? '#0a0a0f' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
          >
            All Sinners
          </button>
          {sinners.map(s => {
            const isSelected = selectedSinnerId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSinner(isSelected ? null : s.id)}
                style={{
                  padding: '0.35rem 0.7rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? `${s.themeColor}30` : 'var(--bg-tertiary)',
                  color: isSelected ? s.themeColor : 'var(--text-secondary)',
                  border: isSelected ? `1px solid ${s.themeColor}` : '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyword Selector */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          Filter by Keyword Archetype
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          <button
            onClick={() => onSelectKeyword(null)}
            style={{
              padding: '0.35rem 0.7rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: selectedKeyword === null ? 700 : 500,
              background: selectedKeyword === null ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
              color: selectedKeyword === null ? '#0a0a0f' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
          >
            All Keywords
          </button>
          {keywords.map(kw => {
            const isSelected = selectedKeyword === kw.id;
            return (
              <button
                key={kw.id}
                onClick={() => onSelectKeyword(isSelected ? null : kw.id)}
                style={{
                  padding: '0.35rem 0.7rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? `${kw.color}30` : 'var(--bg-tertiary)',
                  color: isSelected ? kw.color : 'var(--text-secondary)',
                  border: isSelected ? `1px solid ${kw.color}` : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <span>{kw.icon}</span>
                <span>{kw.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rarity Selector */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          Filter by Rarity
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => onSelectRarity(null)}
            style={{
              padding: '0.35rem 0.7rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: selectedRarity === null ? 700 : 500,
              background: selectedRarity === null ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
              color: selectedRarity === null ? '#0a0a0f' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
          >
            All Rarities
          </button>
          {([3, 2, 1] as Rarity[]).map(r => {
            const isSelected = selectedRarity === r;
            return (
              <button
                key={r}
                onClick={() => onSelectRarity(isSelected ? null : r)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? 'rgba(196, 163, 90, 0.2)' : 'var(--bg-tertiary)',
                  color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {'★'.repeat(r)} ({r === 3 ? '000' : r === 2 ? '00' : '0'})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
