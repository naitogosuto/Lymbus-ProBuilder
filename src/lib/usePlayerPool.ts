'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_IDENTITIES = 'limbus-pro-pool';
const STORAGE_KEY_EGOS = 'limbus-pro-ego-pool';

export function usePlayerPool() {
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [ownedEgoIds, setOwnedEgoIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedIds = localStorage.getItem(STORAGE_KEY_IDENTITIES);
      if (storedIds) {
        const parsed = JSON.parse(storedIds) as string[];
        setOwnedIds(new Set(parsed));
      }

      const storedEgos = localStorage.getItem(STORAGE_KEY_EGOS);
      if (storedEgos) {
        const parsedEgos = JSON.parse(storedEgos) as string[];
        setOwnedEgoIds(new Set(parsedEgos));
      }
    } catch {
      // Ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever ownedIds or ownedEgoIds change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_IDENTITIES, JSON.stringify(Array.from(ownedIds)));
    } catch {
      // Ignore storage errors
    }
  }, [ownedIds, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_EGOS, JSON.stringify(Array.from(ownedEgoIds)));
    } catch {
      // Ignore storage errors
    }
  }, [ownedEgoIds, isLoaded]);

  // ===== Identity Helpers =====
  const toggleOwned = useCallback((id: string) => {
    setOwnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const addMany = useCallback((ids: string[]) => {
    setOwnedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
  }, []);

  const removeMany = useCallback((ids: string[]) => {
    setOwnedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  }, []);

  const setAllOwned = useCallback((ids: string[]) => {
    setOwnedIds(new Set(ids));
  }, []);

  const clearAll = useCallback(() => {
    setOwnedIds(new Set());
  }, []);

  const isOwned = useCallback((id: string) => {
    return ownedIds.has(id);
  }, [ownedIds]);

  // ===== E.G.O Helpers =====
  const toggleEgoOwned = useCallback((id: string) => {
    setOwnedEgoIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const addManyEgos = useCallback((ids: string[]) => {
    setOwnedEgoIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
  }, []);

  const removeManyEgos = useCallback((ids: string[]) => {
    setOwnedEgoIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  }, []);

  const setAllEgosOwned = useCallback((ids: string[]) => {
    setOwnedEgoIds(new Set(ids));
  }, []);

  const clearAllEgos = useCallback(() => {
    setOwnedEgoIds(new Set());
  }, []);

  const isEgoOwned = useCallback((id: string) => {
    return ownedEgoIds.has(id);
  }, [ownedEgoIds]);

  return {
    ownedIds,
    ownedEgoIds,
    isLoaded,

    // Identity functions
    toggleOwned,
    addMany,
    removeMany,
    setAllOwned,
    clearAll,
    isOwned,
    ownedCount: ownedIds.size,

    // E.G.O functions
    toggleEgoOwned,
    addManyEgos,
    removeManyEgos,
    setAllEgosOwned,
    clearAllEgos,
    isEgoOwned,
    ownedEgoCount: ownedEgoIds.size
  };
}
