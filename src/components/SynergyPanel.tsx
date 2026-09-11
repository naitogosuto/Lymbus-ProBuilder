'use client';

import React from 'react';
import { SynergyAnalysis } from '../lib/api';
import { KeywordType, SinType, AttackType } from '../lib/types';
import { KeywordBadge } from './KeywordBadge';

interface SynergyPanelProps {
  analysis: SynergyAnalysis;
}

const sinColorMap: Record<SinType, string> = {
  Wrath: '#ef4444',
  Lust: '#f97316',
  Sloth: '#fbbf24',
  Gluttony: '#84cc16',
  Gloom: '#06b6d4',
  Pride: '#3b82f6',
  Envy: '#a855f7'
};

const attackTypeIcons: Record<AttackType, string> = {
  Slash: '⚔️',
  Pierce: '🗡️',
  Blunt: '🔨'
};

const attackTypeColors: Record<AttackType, string> = {
  Slash: '#e74c3c',
  Pierce: '#3498db',
  Blunt: '#f39c12'
};

export const SynergyPanel: React.FC<SynergyPanelProps> = ({ analysis }) => {
  const { keywordCounts, sinDistribution, attackTypeCounts, factionCounts, activeCount, egoSinDemand, missingSins } = analysis;

  // Calculate dominant keyword archetype
  let topKeyword: KeywordType | null = null;
  let maxKwCount = 0;
  (Object.entries(keywordCounts) as [KeywordType, number][]).forEach(([kw, count]) => {
    if (count > maxKwCount) {
      maxKwCount = count;
      topKeyword = kw;
    }
  });

  const totalSinPoints = Object.values(sinDistribution).reduce((a, b) => a + b, 0);
  const totalAttackSkills = Object.values(attackTypeCounts || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--accent-gold)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📊 GLL Synergy & Analytics Dashboard
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Combat Squad Units: <strong style={{ color: 'var(--text-primary)' }}>{activeCount} / 12</strong>
        </p>
      </div>

      {/* Dominant Archetype Banner */}
      {topKeyword && maxKwCount >= 2 ? (
        <div style={{
          background: 'rgba(196, 163, 90, 0.1)',
          border: '1px solid rgba(196, 163, 90, 0.3)',
          borderRadius: '8px',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎯</span>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Dominant Archetype
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {topKeyword} Deck Composition ({maxKwCount} units)
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.75rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          Equip 2+ units with matching keywords to build a targeted archetype!
        </div>
      )}

      {/* Missing Sin Alert */}
      {missingSins && missingSins.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '8px',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            ⚠️ Missing E.G.O Sin Resources
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Your squad has no identity skills generating these required Sins:
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
            {missingSins.map(sin => (
              <span
                key={sin}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: sinColorMap[sin],
                  background: `${sinColorMap[sin]}22`,
                  border: `1px solid ${sinColorMap[sin]}60`,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px'
                }}
              >
                {sin} (Needed: {egoSinDemand[sin]})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Faction & Collection Synergies */}
      {factionCounts && Object.keys(factionCounts).length > 0 && (
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            🏰 Faction & Collection Synergies
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {Object.entries(factionCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([faction, count]) => {
                const hasSynergy = count >= 2;
                return (
                  <div
                    key={faction}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: hasSynergy ? 'rgba(196, 163, 90, 0.1)' : 'var(--bg-tertiary)',
                      border: `1px solid ${hasSynergy ? 'rgba(196, 163, 90, 0.4)' : 'var(--border-color)'}`,
                      padding: '0.4rem 0.65rem',
                      borderRadius: '6px'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {faction}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        background: hasSynergy ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                        color: hasSynergy ? '#000' : 'var(--text-muted)'
                      }}>
                        {count} {count === 1 ? 'unit' : 'units'}
                      </span>
                      {hasSynergy && (
                        <span style={{ fontSize: '0.75rem' }} title="Active Faction Synergy Bonus!">⚡</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* GLL Sin Resource Matrix (Supply vs E.G.O Demand) */}
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🔥 Sin Resource Supply vs Demand</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'none' }}>Turn-by-turn balance</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {(Object.keys(sinColorMap) as SinType[]).map(sin => {
            const supply = sinDistribution[sin] || 0;
            const demand = egoSinDemand[sin] || 0;
            const sinColor = sinColorMap[sin];
            const isMissing = demand > 0 && supply === 0;

            return (
              <div
                key={sin}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isMissing ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-tertiary)',
                  padding: '0.4rem 0.65rem',
                  borderRadius: '6px',
                  border: `1px solid ${isMissing ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sinColor }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: sinColor }}>{sin}</span>
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0.75rem' }}>
                  <div style={{ flex: 1, background: 'var(--bg-secondary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (supply / (Math.max(1, demand) * 2)) * 100)}%`,
                        background: isMissing ? '#ef4444' : sinColor,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Supply: <strong style={{ color: 'var(--text-primary)' }}>{supply}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>Need: <strong style={{ color: demand > 0 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>{demand}</strong></span>
                  <span style={{
                    color: demand === 0 ? 'var(--text-muted)' : isMissing ? '#ef4444' : '#2ecc71',
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    background: demand === 0 ? 'transparent' : isMissing ? 'rgba(239,68,68,0.15)' : 'rgba(46,204,113,0.15)'
                  }}>
                    {demand === 0 ? '-' : isMissing ? '⚠️ Missing' : '✓ OK'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GLL Attack Type Breakdown */}
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
          ⚔️ Attack Type Distribution
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {(Object.keys(attackTypeIcons) as AttackType[]).map(at => {
            const count = attackTypeCounts[at] || 0;
            const pct = totalAttackSkills > 0 ? Math.round((count / totalAttackSkills) * 100) : 0;
            const color = attackTypeColors[at];

            return (
              <div
                key={at}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: `1px solid var(--border-color)`,
                  borderRadius: '8px',
                  padding: '0.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <div style={{ fontSize: '1.1rem' }}>{attackTypeIcons[at]}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: color }}>{at}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {count} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyword Coverage */}
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
          🏷️ Keyword Archetype Synergy
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {(Object.entries(keywordCounts) as [KeywordType, number][]).map(([kw, count]) => (
            <div key={kw} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '90px' }}>
                <KeywordBadge keyword={kw} size="sm" />
              </div>
              <div style={{ flex: 1, background: 'var(--bg-tertiary)', height: '7px', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (count / 6) * 100)}%`,
                    background: count > 0 ? 'var(--accent-gold)' : 'transparent',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, width: '20px', textAlign: 'right' }}>
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
