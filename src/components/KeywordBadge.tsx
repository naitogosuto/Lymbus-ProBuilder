'use client';

import React from 'react';
import { KeywordType } from '../lib/types';
import { getKeywords } from '../lib/api';

interface KeywordBadgeProps {
  keyword: KeywordType;
  size?: 'sm' | 'md' | 'lg';
}

export const KeywordBadge: React.FC<KeywordBadgeProps> = ({ keyword, size = 'md' }) => {
  const kwInfo = getKeywords().find(k => k.id === keyword);
  const color = kwInfo ? kwInfo.color : '#888';
  const icon = kwInfo ? kwInfo.icon : '';

  const padding = size === 'sm' ? '0.15rem 0.4rem' : size === 'lg' ? '0.35rem 0.75rem' : '0.25rem 0.55rem';
  const fontSize = size === 'sm' ? '0.7rem' : size === 'lg' ? '0.85rem' : '0.75rem';

  return (
    <span
      className="badge-keyword"
      style={{
        padding,
        fontSize,
        color: '#fff',
        backgroundColor: `${color}25`,
        border: `1px solid ${color}60`,
        borderRadius: '6px',
        textShadow: `0 0 6px ${color}80`
      }}
    >
      <span>{icon}</span>
      <span>{keyword}</span>
    </span>
  );
};
