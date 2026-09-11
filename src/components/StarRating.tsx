'use client';

import React from 'react';
import { Rarity } from '../lib/types';

interface StarRatingProps {
  rarity: Rarity;
}

export const StarRating: React.FC<StarRatingProps> = ({ rarity }) => {
  return (
    <div style={{ display: 'flex', gap: '1px', color: 'var(--accent-gold)' }}>
      {Array.from({ length: rarity }).map((_, index) => (
        <span key={index} style={{ fontSize: '0.85rem', filter: 'drop-shadow(0 0 3px rgba(196, 163, 90, 0.6))' }}>
          ★
        </span>
      ))}
    </div>
  );
};
