import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTrendingGames,
  searchGames,
  rawgGameToUnified,
} from '../services/rawg';
import type { UnifiedItem } from '../data';

// ─── useRAWGTrending ─────────────────────────────────────────────────────────
/**
 * Fetches trending games from RAWG and maps them to UnifiedItem[].
 * Falls back to the static mock data if the API fails.
 */
export function useRAWGTrending(fallback: UnifiedItem[]) {
  const [items, setItems] = useState<UnifiedItem[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getTrendingGames()
      .then((games) => {
        if (!cancelled) {
          setItems(games.map(rawgGameToUnified));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[RAWG] getTrendingGames failed:', err);
          setError(err.message);
          setLoading(false);
          // keep the fallback data already in state
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { items, loading, error };
}

// ─── useRAWGSearch ────────────────────────────────────────────────────────────
/**
 * Debounced search against RAWG /games.
 * Returns matching UnifiedItem[] for a query string.
 */
export function useRAWGSearch(query: string, debounceMs = 400) {
  const [results, setResults] = useState<UnifiedItem[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const games = await searchGames(query);
        setResults(games.map(rawgGameToUnified));
      } catch (err) {
        console.error('[RAWG] searchGames failed:', err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs]);

  return { results, searching };
}

// ─── useRAWGSync ─────────────────────────────────────────────────────────────
/**
 * Used by the Dashboard's "Sync Now" button.
 * Fetches trending games from RAWG.
 */
export function useRAWGSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncedCount, setSyncedCount] = useState<number>(0);

  const sync = useCallback(async (): Promise<UnifiedItem[]> => {
    setSyncing(true);
    try {
      const games = await getTrendingGames(1);
      const items = games.map(rawgGameToUnified);
      setSyncedCount(items.length);
      setLastSynced(new Date());
      return items;
    } finally {
      setSyncing(false);
    }
  }, []);

  return { sync, syncing, lastSynced, syncedCount };
}
