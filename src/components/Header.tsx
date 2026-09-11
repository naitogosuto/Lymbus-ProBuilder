'use client';

import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="glass-panel" style={{
      margin: '1rem 1.5rem 0 1.5rem',
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #c4a35a, #e84057)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            color: '#0a0a0f',
            boxShadow: '0 0 10px rgba(196, 163, 90, 0.4)'
          }}>
            L
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              LIMBUS <span style={{ color: 'var(--accent-gold)' }}>PRO</span> BUILDER
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Limbus Company Team & Synergy Recommender
            </div>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-tertiary)',
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71' }}></span>
          185+ Identities Available
        </div>

        <Link 
          href="/party-builder" 
          style={{
            background: 'linear-gradient(135deg, #c4a35a 0%, #a88438 100%)',
            color: '#0a0a0f',
            padding: '0.5rem 1.2rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.85rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(196, 163, 90, 0.3)'
          }}
        >
          🔨 Open Party Builder
        </Link>
      </div>
    </header>
  );
};
