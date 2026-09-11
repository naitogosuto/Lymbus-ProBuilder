'use client';

import React from 'react';
import Link from 'next/link';
import { getKeywords, getIdentities } from '@/lib/api';
import { IdentityCard } from '@/components/IdentityCard';
import { KeywordBadge } from '@/components/KeywordBadge';

export default function Home() {
  const keywords = getKeywords();
  const allIdentities = getIdentities();
  const featuredIdentities = allIdentities.slice(0, 6);

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Hero Section */}
      <section
        className="glass-panel"
        style={{
          padding: '3rem 2.5rem',
          background: 'linear-gradient(135deg, rgba(22, 22, 34, 0.95) 0%, rgba(196, 163, 90, 0.1) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(196, 163, 90, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 800,
          color: 'var(--accent-gold)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          background: 'rgba(196, 163, 90, 0.15)',
          padding: '0.3rem 0.8rem',
          borderRadius: '20px',
          border: '1px solid rgba(196, 163, 90, 0.4)'
        }}>
          Limbus Company Companion Suite
        </div>

        <h1 style={{ fontSize: '2.75rem', lineHeight: '1.1', color: 'var(--text-primary)' }}>
          Master Your Squad Compositions in <br />
          <span style={{ color: 'var(--accent-gold)' }}>Limbus Pro Builder</span>
        </h1>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '700px', lineHeight: '1.6' }}>
          Analyze Sin Resonance, maximize Keyword Count & Potency, and filter through 185+ Identities for all 12 Sinners. Designed for Mirror Dungeons & Refraction Railway.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <Link
            href="/party-builder"
            style={{
              background: 'linear-gradient(135deg, #c4a35a 0%, #a88438 100%)',
              color: '#0a0a0f',
              padding: '0.85rem 1.75rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(196, 163, 90, 0.4)',
              transition: 'transform 0.2s ease'
            }}
          >
            🔨 Start Building Party
          </Link>

          <Link
            href="/database/identities"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '0.85rem 1.75rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '1rem',
              transition: 'all 0.2s ease'
            }}
          >
            🃏 Browse Identity Database
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Link href="/party-builder" className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🔨</div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Party Builder</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Equip identities for the 12 Sinners, visualize real-time Sin generation distribution, and track team keyword coverage.
          </p>
        </Link>

        <Link href="/database/identities" className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🃏</div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Identities Database</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Filter 185+ identities by Sinner, status keyword archetype, and rarity (000 / 00 / 0).
          </p>
        </Link>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🎯</div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>7 Status Archetypes</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
            {keywords.map(kw => (
              <KeywordBadge key={kw.id} keyword={kw.id} size="sm" />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Identities Preview */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Featured 000 Identities</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Top meta identities available in the database
            </p>
          </div>
          <Link
            href="/database/identities"
            style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 700 }}
          >
            View All 185+ →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {featuredIdentities.map(identity => (
            <IdentityCard key={identity.id} identity={identity} />
          ))}
        </div>
      </section>
    </div>
  );
}
