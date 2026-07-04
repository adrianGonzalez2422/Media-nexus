import { useState, useEffect, useCallback, useRef } from 'react';
import {
  searchVideos,
  youtubeVideoToUnified,
} from '../services/youtube';
import type { UnifiedItem } from '../data';

// ─── useYouTubeTrending ───────────────────────────────────────────────────────
/**
 * Fetches trending videos from YouTube and maps them to UnifiedItem[].
 * Falls back to the static mock data if the API fails.
 */
export function useYouTubeTrending(fallback: UnifiedItem[]) {
  const [items, setItems] = useState<UnifiedItem[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    searchVideos('trailer')
      .then((videos) => {
        if (!cancelled) {
          setItems(videos.map(youtubeVideoToUnified));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[YouTube] searchVideos failed:', err);
          setError(err.message);
          setLoading(false);
          // keep the fallback data already in state
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { items, loading, error };
}

// ─── useYouTubeSearch ─────────────────────────────────────────────────────────
/**
 * Debounced search against YouTube /search.
 * Returns matching UnifiedItem[] for a query string.
 */
export function useYouTubeSearch(query: string, debounceMs = 400) {
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
        const videos = await searchVideos(query);
        setResults(videos.map(youtubeVideoToUnified));
      } catch (err) {
        console.error('[YouTube] searchVideos failed:', err);
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

// ─── useYouTubeSync ─────────────────────────────────────────────────────────────
/**
 * Used by the Dashboard's "Sync Now" button.
 * Fetches trending videos from YouTube.
 */
export function useYouTubeSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncedCount, setSyncedCount] = useState<number>(0);

  const sync = useCallback(async (): Promise<UnifiedItem[]> => {
    setSyncing(true);
    try {
      const videos = await searchVideos('trailer');
      const items = videos.map(youtubeVideoToUnified);
      setSyncedCount(items.length);
      setLastSynced(new Date());
      return items;
    } finally {
      setSyncing(false);
    }
  }, []);

  return { sync, syncing, lastSynced, syncedCount };
}
