'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'Party Builder', href: '/party-builder', icon: '🔨' },
    { label: 'My Pool', href: '/my-pool', icon: '💼' },
    { label: 'Identities Database', href: '/database/identities', icon: '🃏' },
    { label: 'E.G.O Database', href: '/database/egos', icon: '🔥' },
  ];

  return (
    <aside style={{
      width: '240px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      gap: '2rem'
    }}>
      <div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '0.75rem',
          paddingLeft: '0.5rem'
        }}>
          Navigation
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(196, 163, 90, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(196, 163, 90, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Not affiliated with Project Moon.
          <br />
          Limbus Pro Builder v1.0
        </div>
      </div>
    </aside>
  );
};
