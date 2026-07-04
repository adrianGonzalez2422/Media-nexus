import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTrendingMovies,
  getPopularMovies,
  searchMovies,
  getBestTrailerUrl,
  getMovieDetail,
  tmdbMovieToUnified,
} from '../services/tmdb';
import type { UnifiedItem } from '../data';

// ─── useTMDBTrending ─────────────────────────────────────────────────────────
/**
 * Fetches the weekly trending movies from TMDB and maps them to UnifiedItem[].
 * Falls back to the static mock data if the API fails.
 */
export function useTMDBTrending(fallback: UnifiedItem[]) {
  const [items, setItems] = useState<UnifiedItem[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getTrendingMovies()
      .then((movies) => {
        if (!cancelled) {
          setItems(movies.map(tmdbMovieToUnified));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[TMDB] getTrendingMovies failed:', err);
          setError(err.message);
          setLoading(false);
          // keep the fallback data already in state
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { items, loading, error };
}

// ─── useTMDBSearch ────────────────────────────────────────────────────────────
/**
 * Debounced search against TMDB /search/movie.
 * Returns matching UnifiedItem[] for a query string.
 */
export function useTMDBSearch(query: string, debounceMs = 400) {
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
        const movies = await searchMovies(query);
        setResults(movies.map(tmdbMovieToUnified));
      } catch (err) {
        console.error('[TMDB] searchMovies failed:', err);
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

// ─── useTrailerUrl ────────────────────────────────────────────────────────────
/**
 * Lazily fetches the best YouTube trailer URL for a given TMDB movie ID.
 * Returns null while loading or when no trailer is found.
 */
export function useTrailerUrl(tmdbId: number | undefined, staticUrl: string) {
  const [trailerUrl, setTrailerUrl] = useState<string>(staticUrl);
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  useEffect(() => {
    if (!tmdbId) return;
    // If the item already has a static URL embedded, use that.
    if (staticUrl) {
      setTrailerUrl(staticUrl);
      return;
    }

    let cancelled = false;
    setLoadingTrailer(true);

    getBestTrailerUrl(tmdbId)
      .then((url) => {
        if (!cancelled && url) setTrailerUrl(url);
      })
      .catch((err) => {
        console.error('[TMDB] getBestTrailerUrl failed:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingTrailer(false);
      });

    return () => { cancelled = true; };
  }, [tmdbId, staticUrl]);

  return { trailerUrl, loadingTrailer };
}

// ─── useTMDBMovieDetail ───────────────────────────────────────────────────────
/**
 * Fetches full movie detail + credits for a TMDB ID.
 * Returns enriched fields (runtime, genres[], cast[]) to overlay on the modal.
 */
export interface TMDBEnrichedDetail {
  runtime: number | null;
  genres: string[];
  tagline: string;
  cast: string[];
  director: string | null;
  trailerUrl: string | null;
}

export function useTMDBMovieDetail(tmdbId: number | undefined) {
  const [detail, setDetail] = useState<TMDBEnrichedDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tmdbId) return;
    let cancelled = false;
    setLoading(true);
    setDetail(null);

    Promise.all([
      getMovieDetail(tmdbId, 'credits'),
      getBestTrailerUrl(tmdbId),
    ])
      .then(([movie, trailerUrl]) => {
        if (cancelled) return;

        const credits = movie.credits;
        const director =
          credits?.crew.find((c) => c.job === 'Director')?.name ?? null;

        setDetail({
          runtime: movie.runtime,
          genres: movie.genres.map((g) => g.name),
          tagline: movie.tagline ?? '',
          cast: credits?.cast.slice(0, 6).map((c) => c.name) ?? [],
          director,
          trailerUrl,
        });
      })
      .catch((err) => {
        console.error('[TMDB] useTMDBMovieDetail failed:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tmdbId]);

  return { detail, loading };
}

// ─── useTMDBSync ─────────────────────────────────────────────────────────────
/**
 * Used by the Dashboard's "Sync Now" button.
 * Fetches both trending and popular movies and merges them deduplicated.
 */
export function useTMDBSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncedCount, setSyncedCount] = useState<number>(0);

  const sync = useCallback(async (): Promise<UnifiedItem[]> => {
    setSyncing(true);
    try {
      const [trending, popular] = await Promise.all([
        getTrendingMovies(1),
        getPopularMovies(1),
      ]);

      const seen = new Set<number>();
      const merged = [...trending, ...popular].filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });

      const items = merged.map(tmdbMovieToUnified);
      setSyncedCount(items.length);
      setLastSynced(new Date());
      return items;
    } finally {
      setSyncing(false);
    }
  }, []);

  return { sync, syncing, lastSynced, syncedCount };
}
