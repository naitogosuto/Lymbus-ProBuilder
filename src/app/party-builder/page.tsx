'use client';

import React, { useState, useMemo } from 'react';
import { getSinners, getIdentities, getKeywords, getEgos, getDefaultZayinEgo, analyzePartySynergy, recommendParty } from '@/lib/api';
import { Identity, Ego, KeywordType, RiskTier, Sinner, SinType, AttackType } from '@/lib/types';
import { usePlayerPool } from '@/lib/usePlayerPool';
import { SynergyPanel } from '@/components/SynergyPanel';
import { StarRating } from '@/components/StarRating';
import { KeywordBadge } from '@/components/KeywordBadge';
import Link from 'next/link';

type SlotRole = 'active' | 'support' | 'none';

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
  Envy: '#a855f7'
};

const attackTypeIcons: Record<AttackType, string> = {
  Slash: '⚔️',
  Pierce: '🗡️',
  Blunt: '🔨'
};

const riskTiersOrder: RiskTier[] = ['ZAYIN', 'TETH', 'HE', 'WAW', 'ALEPH'];

export default function PartyBuilderPage() {
  const sinners = getSinners();
  const allIdentities = getIdentities();
  const allEgos = getEgos();
  const keywords = getKeywords();
  const pool = usePlayerPool();

  // ===== Configuration Panel State =====
  const [activeSlots, setActiveSlots] = useState(6);
  const [supportSlots, setSupportSlots] = useState(6);
  const [targetKeyword, setTargetKeyword] = useState<KeywordType | 'Mixed'>('Mixed');
  const [onlyOwned, setOnlyOwned] = useState(false);

  // ===== Squad State =====
  const [squad, setSquad] = useState<Record<number, Identity | null>>(() => {
    const initial: Record<number, Identity | null> = {};
    sinners.forEach(s => { initial[s.id] = null; });
    return initial;
  });

  // Roles per sinner (active, support, none)
  const [sinnerRoles, setSinnerRoles] = useState<Record<number, SlotRole>>(() => {
    const initial: Record<number, SlotRole> = {};
    sinners.forEach((s, idx) => {
      initial[s.id] = idx < 6 ? 'active' : 'support';
    });
    return initial;
  });

  // Equipped E.G.Os per sinner (auto-equip mandatory base ZAYIN per sinner)
  const [squadEgos, setSquadEgos] = useState<Record<number, Ego[]>>(() => {
    const initial: Record<number, Ego[]> = {};
    sinners.forEach(s => {
      const baseEgo = getDefaultZayinEgo(s.id);
      initial[s.id] = baseEgo ? [baseEgo] : [];
    });
    return initial;
  });

  // Modal states
  const [modalSinnerId, setModalSinnerId] = useState<number | null>(null);
  const [egoModalSinnerId, setEgoModalSinnerId] = useState<number | null>(null);
  const [egoModalTier, setEgoModalTier] = useState<RiskTier | null>(null);

  // ===== Handlers =====
  const handleEquipIdentity = (sinnerId: number, identity: Identity) => {
    setSquad(prev => ({ ...prev, [sinnerId]: identity }));
    setModalSinnerId(null);
  };

  const handleUnequipIdentity = (sinnerId: number) => {
    setSquad(prev => ({ ...prev, [sinnerId]: null }));
  };

  const handleToggleEgo = (sinnerId: number, ego: Ego) => {
    setSquadEgos(prev => {
      const current = prev[sinnerId] || [];
      const exists = current.some(e => e.id === ego.id);
      if (exists) {
        return { ...prev, [sinnerId]: current.filter(e => e.id !== ego.id) };
      } else {
        // Replace ego of same risk tier if already equipped
        const filtered = current.filter(e => e.riskTier !== ego.riskTier);
        return { ...prev, [sinnerId]: [...filtered, ego] };
      }
    });
  };

  const handleUnequipEgoTier = (sinnerId: number, tier: RiskTier) => {
    setSquadEgos(prev => ({
      ...prev,
      [sinnerId]: (prev[sinnerId] || []).filter(e => e.riskTier !== tier)
    }));
  };

  const handleClearSquad = () => {
    const clearedSquad: Record<number, Identity | null> = {};
    const clearedEgos: Record<number, Ego[]> = {};
    sinners.forEach(s => {
      clearedSquad[s.id] = null;
      const baseEgo = getDefaultZayinEgo(s.id);
      clearedEgos[s.id] = baseEgo ? [baseEgo] : [];
    });
    setSquad(clearedSquad);
    setSquadEgos(clearedEgos);
  };

  // ===== Auto-Recommend =====
  const handleAutoRecommend = () => {
    const result = recommendParty({
      targetKeyword,
      activeSlots,
      supportSlots,
      onlyOwned,
      ownedIds: pool.ownedIds,
      ownedEgoIds: pool.ownedEgoIds
    });

    const newSquad: Record<number, Identity | null> = {};
    const newRoles: Record<number, SlotRole> = {};

    sinners.forEach(s => {
      if (result.active[s.id]) {
        newSquad[s.id] = result.active[s.id];
        newRoles[s.id] = 'active';
      } else if (result.support[s.id]) {
        newSquad[s.id] = result.support[s.id];
        newRoles[s.id] = 'support';
      } else {
        newSquad[s.id] = null;
        newRoles[s.id] = 'none';
      }
    });

    setSquad(newSquad);
    setSinnerRoles(newRoles);
    setSquadEgos(result.egos);
  };

  // ===== Quick Keyword Preset =====
  const handleKeywordPreset = (kw: KeywordType) => {
    setTargetKeyword(kw);
    const result = recommendParty({
      targetKeyword: kw,
      activeSlots,
      supportSlots,
      onlyOwned,
      ownedIds: pool.ownedIds,
      ownedEgoIds: pool.ownedEgoIds
    });

    const newSquad: Record<number, Identity | null> = {};
    const newRoles: Record<number, SlotRole> = {};

    sinners.forEach(s => {
      if (result.active[s.id]) {
        newSquad[s.id] = result.active[s.id];
        newRoles[s.id] = 'active';
      } else if (result.support[s.id]) {
        newSquad[s.id] = result.support[s.id];
        newRoles[s.id] = 'support';
      } else {
        newSquad[s.id] = null;
        newRoles[s.id] = 'none';
      }
    });

    setSquad(newSquad);
    setSinnerRoles(newRoles);
    setSquadEgos(result.egos);
  };

  // ===== Computed =====
  const activeIdentities = sinners
    .filter(s => sinnerRoles[s.id] === 'active')
    .map(s => squad[s.id]);

  // Gather all active squad E.G.O IDs
  const activeEgosList = useMemo(() => {
    const list: Ego[] = [];
    sinners.forEach(s => {
      if (sinnerRoles[s.id] === 'active' && squadEgos[s.id]) {
        list.push(...squadEgos[s.id]);
      }
    });
    return list;
  }, [sinners, sinnerRoles, squadEgos]);

  const activeEgoIdsSet = useMemo(() => new Set(activeEgosList.map(e => e.id)), [activeEgosList]);

  const synergyAnalysis = analyzePartySynergy(activeIdentities, activeEgoIdsSet);

  const currentModalSinner = sinners.find(s => s.id === modalSinnerId);
  const currentEgoModalSinner = sinners.find(s => s.id === egoModalSinnerId);

  const modalIdentities = useMemo(() => {
    if (!modalSinnerId) return [];
    let ids = allIdentities.filter(i => i.sinnerId === modalSinnerId);
    if (onlyOwned) {
      ids = ids.filter(i => pool.isOwned(i.id));
    }
    return ids;
  }, [modalSinnerId, allIdentities, onlyOwned, pool]);

  const modalEgos = useMemo(() => {
    if (!egoModalSinnerId) return [];
    let egosList = allEgos.filter(e => e.sinnerId === egoModalSinnerId);
    if (egoModalTier) {
      egosList = egosList.filter(e => e.riskTier === egoModalTier);
    }
    if (onlyOwned) {
      egosList = egosList.filter(e => pool.isEgoOwned(e.id));
    }
    return egosList;
  }, [egoModalSinnerId, egoModalTier, allEgos, onlyOwned, pool]);

  const sortedSinners = useMemo(() => {
    return [...sinners].sort((a, b) => {
      const roleOrder: Record<SlotRole, number> = { active: 1, support: 2, none: 3 };
      return roleOrder[sinnerRoles[a.id]] - roleOrder[sinnerRoles[b.id]] || a.id - b.id;
    });
  }, [sinners, sinnerRoles]);

  // Deployment order index map for active sinners
  const deploymentOrders = useMemo(() => {
    const map: Record<number, number> = {};
    let orderIndex = 1;
    sinners.forEach(s => {
      if (sinnerRoles[s.id] === 'active') {
        map[s.id] = orderIndex++;
      }
    });
    return map;
  }, [sinners, sinnerRoles]);

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>🔨 Party Builder (GLL Style)</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Full 12-Sinner combat grid, deployment order, 5 Risk Tier E.G.O equipment, and Sin/Attack synergy dashboard.
          </p>
        </div>
        <button
          onClick={handleClearSquad}
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          Clear All
        </button>
      </div>

      {/* ===== Configuration Panel ===== */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Row 1: Team Size */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <div style={labelStyle}>Active Slots (in combat)</div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {[5, 6, 7].map(n => (
                <button
                  key={n}
                  onClick={() => {
                    setActiveSlots(n);
                    if (n + supportSlots > 12) {
                      setSupportSlots(12 - n);
                    }
                  }}
                  style={slotBtnStyle(activeSlots === n, '#2ecc71')}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={labelStyle}>Support Slots (bench)</div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(n => (
                <button key={n} onClick={() => setSupportSlots(n)} style={slotBtnStyle(supportSlots === n, 'var(--accent-gold)')}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: onlyOwned ? 'var(--accent-gold)' : 'var(--text-secondary)',
              cursor: 'pointer',
              background: onlyOwned ? 'rgba(196, 163, 90, 0.12)' : 'var(--bg-tertiary)',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: onlyOwned ? '1px solid rgba(196, 163, 90, 0.4)' : '1px solid var(--border-color)',
              fontWeight: 700
            }}>
              <input
                type="checkbox"
                checked={onlyOwned}
                onChange={() => setOnlyOwned(!onlyOwned)}
                style={{ accentColor: 'var(--accent-gold)' }}
              />
              💼 Only My Pool
            </label>

            {onlyOwned && pool.ownedCount === 0 && (
              <Link href="/my-pool" style={{
                fontSize: '0.8rem',
                color: 'var(--accent-red)',
                fontWeight: 600,
                textDecoration: 'underline'
              }}>
                Your pool is empty! Set it up →
              </Link>
            )}
          </div>
        </div>

        {/* Row 2: Target Archetype */}
        <div>
          <div style={labelStyle}>Target Archetype</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              onClick={() => setTargetKeyword('Mixed')}
              style={archetypeBtnStyle(targetKeyword === 'Mixed', '#aaa', '🎲')}
            >
              🎲 Mixed / All-Round
            </button>
            {keywords.map(kw => (
              <button
                key={kw.id}
                onClick={() => setTargetKeyword(kw.id)}
                style={archetypeBtnStyle(targetKeyword === kw.id, kw.color, kw.icon)}
              >
                {kw.icon} {kw.name}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Actions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={handleAutoRecommend}
            style={{
              background: 'linear-gradient(135deg, #c4a35a 0%, #a88438 100%)',
              color: '#0a0a0f',
              border: 'none',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(196, 163, 90, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ⚡ Auto-Recommend Squad & E.G.Os
          </button>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Quick Presets:
          </div>

          {keywords.slice(0, 4).map(kw => (
            <button
              key={kw.id}
              onClick={() => handleKeywordPreset(kw.id)}
              style={{
                background: 'var(--bg-tertiary)',
                color: kw.color,
                border: `1px solid ${kw.color}40`,
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Best {kw.name}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Main Grid ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.9fr) minmax(0, 1.1fr)', gap: '1.75rem' }}>
        {/* Left: 12-Sinner GLL Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Active Section Header */}
          <div style={sectionHeaderStyle('#2ecc71')}>
            ⚔️ Active Combat Units ({sortedSinners.filter(s => sinnerRoles[s.id] === 'active').length})
          </div>

          {sortedSinners.filter(s => sinnerRoles[s.id] === 'active').map(sinner => (
            <GllSinnerCard
              key={sinner.id}
              sinner={sinner}
              identity={squad[sinner.id]}
              equippedEgos={squadEgos[sinner.id] || []}
              role="active"
              deploymentOrder={deploymentOrders[sinner.id]}
              onRemoveIdentity={handleUnequipIdentity}
              onOpenIdentityModal={setModalSinnerId}
              onOpenEgoModal={(sId, tier) => {
                setEgoModalSinnerId(sId);
                setEgoModalTier(tier || null);
              }}
              onUnequipEgoTier={handleUnequipEgoTier}
            />
          ))}

          {/* Support Section Header */}
          {sortedSinners.some(s => sinnerRoles[s.id] === 'support') && (
            <>
              <div style={{ ...sectionHeaderStyle('var(--accent-gold)'), marginTop: '0.75rem' }}>
                🛡️ Bench / Support Units ({sortedSinners.filter(s => sinnerRoles[s.id] === 'support').length})
              </div>
              {sortedSinners.filter(s => sinnerRoles[s.id] === 'support').map(sinner => (
                <GllSinnerCard
                  key={sinner.id}
                  sinner={sinner}
                  identity={squad[sinner.id]}
                  equippedEgos={squadEgos[sinner.id] || []}
                  role="support"
                  onRemoveIdentity={handleUnequipIdentity}
                  onOpenIdentityModal={setModalSinnerId}
                  onOpenEgoModal={(sId, tier) => {
                    setEgoModalSinnerId(sId);
                    setEgoModalTier(tier || null);
                  }}
                  onUnequipEgoTier={handleUnequipEgoTier}
                />
              ))}
            </>
          )}

          {/* Unselected Section Header */}
          {sortedSinners.some(s => sinnerRoles[s.id] === 'none') && (
            <>
              <div style={{ ...sectionHeaderStyle('var(--text-muted)'), marginTop: '0.75rem' }}>
                💤 Off Squad ({sortedSinners.filter(s => sinnerRoles[s.id] === 'none').length})
              </div>
              {sortedSinners.filter(s => sinnerRoles[s.id] === 'none').map(sinner => (
                <GllSinnerCard
                  key={sinner.id}
                  sinner={sinner}
                  identity={squad[sinner.id]}
                  equippedEgos={squadEgos[sinner.id] || []}
                  role="none"
                  onRemoveIdentity={handleUnequipIdentity}
                  onOpenIdentityModal={setModalSinnerId}
                  onOpenEgoModal={(sId, tier) => {
                    setEgoModalSinnerId(sId);
                    setEgoModalTier(tier || null);
                  }}
                  onUnequipEgoTier={handleUnequipEgoTier}
                />
              ))}
            </>
          )}
        </div>

        {/* Right: GLL Synergy Panel */}
        <div>
          <SynergyPanel analysis={synergyAnalysis} />
        </div>
      </div>

      {/* ===== Identity Selection Modal ===== */}
      {modalSinnerId && currentModalSinner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '14px',
            border: `1px solid ${currentModalSinner.themeColor}`
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: `${currentModalSinner.themeColor}15`
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: currentModalSinner.themeColor, margin: 0 }}>
                  Select Identity for {currentModalSinner.name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {modalIdentities.length} identities available
                </p>
              </div>
              <button
                onClick={() => setModalSinnerId(null)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {modalIdentities.length > 0 ? (
                modalIdentities.map(identity => {
                  const isEquipped = squad[currentModalSinner.id]?.id === identity.id;
                  return (
                    <div
                      key={identity.id}
                      onClick={() => handleEquipIdentity(currentModalSinner.id, identity)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: isEquipped ? `${currentModalSinner.themeColor}20` : 'var(--bg-tertiary)',
                        border: `1px solid ${isEquipped ? currentModalSinner.themeColor : 'var(--border-color)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <StarRating rarity={identity.rarity} />
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{identity.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                          {identity.keywords.map(kw => (
                            <KeywordBadge key={kw} keyword={kw} size="sm" />
                          ))}
                        </div>
                      </div>

                      {isEquipped ? (
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: currentModalSinner.themeColor }}>EQUIPPED ✓</span>
                      ) : (
                        <button style={{
                          background: 'var(--accent-gold)',
                          color: '#000',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>Equip</button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No identities available in your collection.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== E.G.O Selection Modal ===== */}
      {egoModalSinnerId && currentEgoModalSinner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '14px',
            border: `1px solid #ef4444`
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: `rgba(239, 68, 68, 0.15)`
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#ef4444', margin: 0 }}>
                  Equip E.G.O {egoModalTier ? `[${egoModalTier}]` : ''} for {currentEgoModalSinner.name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Equip up to 1 E.G.O per Risk Tier (ZAYIN, TETH, HE, WAW, ALEPH)
                </p>
              </div>
              <button
                onClick={() => {
                  setEgoModalSinnerId(null);
                  setEgoModalTier(null);
                }}
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {modalEgos.length > 0 ? (
                modalEgos.map(ego => {
                  const sinnerEgosList = squadEgos[currentEgoModalSinner.id] || [];
                  const isEquipped = sinnerEgosList.some(e => e.id === ego.id);
                  const riskStyle = riskColorMap[ego.riskTier];

                  return (
                    <div
                      key={ego.id}
                      onClick={() => handleToggleEgo(currentEgoModalSinner.id, ego)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: isEquipped ? `${riskStyle.text}20` : 'var(--bg-tertiary)',
                        border: `1px solid ${isEquipped ? riskStyle.text : 'var(--border-color)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            color: riskStyle.text,
                            background: riskStyle.bg,
                            border: `1px solid ${riskStyle.border}`,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px'
                          }}>
                            {ego.riskTier}
                          </span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ego.name}</span>
                        </div>

                        {/* Sin Cost Pills */}
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                          {ego.cost.map((c, idx) => (
                            <span key={idx} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                              {c.sin} ×{c.count}
                            </span>
                          ))}
                        </div>
                      </div>

                      {isEquipped ? (
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: riskStyle.text }}>EQUIPPED ✓</span>
                      ) : (
                        <button style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>Equip</button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No E.G.Os available for this tier in your collection.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== GLL Sinner Card Component =====
function GllSinnerCard({
  sinner,
  identity,
  equippedEgos,
  role,
  deploymentOrder,
  onRemoveIdentity,
  onOpenIdentityModal,
  onOpenEgoModal,
  onUnequipEgoTier
}: {
  sinner: Sinner;
  identity: Identity | null;
  equippedEgos: Ego[];
  role: SlotRole;
  deploymentOrder?: number;
  onRemoveIdentity: (id: number) => void;
  onOpenIdentityModal: (id: number) => void;
  onOpenEgoModal: (id: number, tier?: RiskTier) => void;
  onUnequipEgoTier: (id: number, tier: RiskTier) => void;
}) {
  const roleBorderColor = role === 'active' ? '#2ecc71' : role === 'support' ? 'var(--accent-gold)' : 'var(--border-color)';
  const roleLabel = role === 'active' ? `${deploymentOrder}st Combat`.replace('1st', '1st').replace('2st', '2nd').replace('3st', '3rd').replace('4st', '4th').replace('5st', '5th').replace('6st', '6th').replace('7st', '7th') : role === 'support' ? 'BENCH' : 'OFF';
  const roleBg = role === 'active' ? 'rgba(46, 204, 113, 0.06)' : role === 'support' ? 'rgba(196, 163, 90, 0.05)' : 'transparent';

  return (
    <div style={{
      background: identity ? roleBg : 'rgba(26, 26, 38, 0.3)',
      borderTop: identity ? `1px solid ${roleBorderColor}60` : '1px dashed var(--border-color)',
      borderRight: identity ? `1px solid ${roleBorderColor}60` : '1px dashed var(--border-color)',
      borderBottom: identity ? `1px solid ${roleBorderColor}60` : '1px dashed var(--border-color)',
      borderLeft: `4px solid ${roleBorderColor}`,
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      transition: 'all 0.15s ease',
      opacity: role === 'none' ? 0.5 : 1
    }}>
      {/* Top Header: Sinner & Deployment Badge + Identity Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Sinner Avatar Circle */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: `${sinner.themeColor}20`,
            border: `2px solid ${sinner.themeColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem',
            color: sinner.themeColor,
            flexShrink: 0
          }}>
            {sinner.id}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: sinner.themeColor }}>{sinner.name}</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: roleBorderColor,
                background: `${roleBorderColor}20`,
                padding: '0.1rem 0.45rem',
                borderRadius: '4px'
              }}>
                {roleLabel}
              </span>
            </div>

            {identity ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                <StarRating rarity={identity.rarity} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{identity.name}</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontStyle: 'italic' }}>
                No Identity Equipped
              </div>
            )}
          </div>
        </div>

        {/* Identity Slot Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {identity && identity.keywords.map(kw => (
            <KeywordBadge key={kw} keyword={kw} size="sm" />
          ))}
          {identity ? (
            <button onClick={() => onRemoveIdentity(sinner.id)} style={{
              background: 'rgba(232, 64, 87, 0.12)',
              color: 'var(--accent-red)',
              border: '1px solid rgba(232, 64, 87, 0.35)',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}>✕</button>
          ) : role !== 'none' ? (
            <button onClick={() => onOpenIdentityModal(sinner.id)} style={{
              background: 'var(--bg-card)',
              color: 'var(--accent-gold)',
              border: '1px solid var(--accent-gold)',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}>+ Identity</button>
          ) : null}
        </div>
      </div>

      {/* Middle Row: Identity Skill Breakdown Bar (S1, S2, S3 + Defense Type) */}
      {identity && identity.skills && identity.skills.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          flexWrap: 'wrap',
          background: 'var(--bg-tertiary)',
          padding: '0.4rem 0.65rem',
          borderRadius: '6px',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.2rem' }}>
            Skills:
          </span>

          {identity.skills.map((skill, sIdx) => {
            const color = sinColorMap[skill.sin];
            const icon = attackTypeIcons[skill.attackType] || '⚔️';
            return (
              <span
                key={sIdx}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: color,
                  background: `${color}18`,
                  border: `1px solid ${color}40`,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>S{skill.tier}</span>
                <span>{icon}</span>
                <span>{skill.sin}</span>
              </span>
            );
          })}

          {identity.defenseType && (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              marginLeft: 'auto'
            }}>
              🛡️ {identity.defenseType}
            </span>
          )}
        </div>
      )}

      {/* Bottom Row: 5 Risk Tier E.G.O Row (ZAYIN, TETH, HE, WAW, ALEPH) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        paddingTop: '0.4rem',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
          <span>Equipped E.G.Os (5 Risk Tiers)</span>
          <span
            onClick={() => onOpenEgoModal(sinner.id)}
            style={{ color: '#ef4444', cursor: 'pointer', textTransform: 'none' }}
          >
            ⚙️ Manage All ({equippedEgos.length})
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
          {riskTiersOrder.map(tier => {
            const ego = equippedEgos.find(e => e.riskTier === tier);
            const riskStyle = riskColorMap[tier];

            return (
              <div
                key={tier}
                style={{
                  background: ego ? riskStyle.bg : 'var(--bg-tertiary)',
                  border: `1px solid ${ego ? riskStyle.border : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  padding: '0.35rem 0.45rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  minHeight: '42px',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => onOpenEgoModal(sinner.id, tier)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    color: riskStyle.text
                  }}>
                    {tier}
                  </span>
                  {ego && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnequipEgoTier(sinner.id, tier);
                      }}
                      style={{ fontSize: '0.6rem', color: 'var(--accent-red)', fontWeight: 900 }}
                    >
                      ✕
                    </span>
                  )}
                </div>

                {ego ? (
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }} title={ego.name}>
                    {ego.name}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    + Equip
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== Style Helpers =====
const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '0.4rem'
};

function slotBtnStyle(active: boolean, color: string): React.CSSProperties {
  return {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: 800,
    background: active ? `${color}25` : 'var(--bg-tertiary)',
    color: active ? color : 'var(--text-secondary)',
    border: active ? `2px solid ${color}` : '1px solid var(--border-color)',
    cursor: 'pointer'
  };
}

function archetypeBtnStyle(active: boolean, color: string, _icon: string): React.CSSProperties {
  return {
    padding: '0.4rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: active ? 800 : 600,
    background: active ? `${color}25` : 'var(--bg-tertiary)',
    color: active ? color : 'var(--text-secondary)',
    border: active ? `2px solid ${color}` : '1px solid var(--border-color)',
    cursor: 'pointer',
    boxShadow: active ? `0 0 12px ${color}30` : 'none',
    transition: 'all 0.15s ease'
  };
}

function sectionHeaderStyle(color: string): React.CSSProperties {
  return {
    fontSize: '0.8rem',
    fontWeight: 800,
    color: color,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '0.2rem 0'
  };
}
