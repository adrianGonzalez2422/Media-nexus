/**
 * RAWG API Service
 * Docs: https://rawg.io/apidocs
 *
 * Authentication uses API key as query parameter.
 */

const BASE_URL = import.meta.env.VITE_RAWG_BASE_URL as string;
const API_KEY = import.meta.env.VITE_RAWG_API_KEY as string;

// ─── Image helpers ──────────────────────────────────────────────────────────
// RAWG returns full URLs, not relative paths
export function gameCoverUrl(url: string | null): string {
  if (!url) return 'https://placehold.co/600x800?text=No+Cover';
  return url;
}

export function gameBackgroundUrl(url: string | null): string {
  if (!url) return 'https://placehold.co/1920x1080?text=No+Background';
  return url;
}

// ─── Base fetch wrapper ──────────────────────────────────────────────────────
async function rawgFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`RAWG ${res.status}: ${res.statusText} — ${endpoint}`);
  }
  return res.json() as Promise<T>;
}

// ─── Raw RAWG types ──────────────────────────────────────────────────────────
export interface RAWGGame {
  id: number;
  name: string;
  slug: string;
  released: string | null;
  tba: boolean;
  background_image: string | null;
  rating: number;
  rating_top: number;
  ratings_count: number;
  metacritic: number | null;
  playtime: number;
  platforms: { platform: { id: number; name: string; slug: string } }[];
  genres: { id: number; name: string; slug: string }[];
  publishers: { id: number; name: string }[];
  developers: { id: number; name: string }[];
  description_raw: string;
  short_description: string;
}

export interface RAWGGameDetail extends RAWGGame {
  esrb_rating: { id: number; name: string; slug: string } | null;
  website: string;
}

interface RAWGListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Genre map (common genres) ───────────────────────────────────────────────
const GENRE_MAP: Record<string, string> = {
  'action': 'Action',
  'adventure': 'Adventure',
  'rpg': 'RPG',
  'strategy': 'Strategy',
  'puzzle': 'Puzzle',
  'shooter': 'Action',
  'indie': 'Indie',
  'platformer': 'Adventure',
  'simulation': 'Simulation',
  'arcade': 'Arcade',
  'casual': 'Casual',
  'racing': 'Racing',
  'sports': 'Sports',
  'fighting': 'Fighting',
  'family': 'Family',
  'board-games': 'Board Games',
  'educational': 'Educational',
  'card': 'Card',
};

export function genreFromSlug(slug: string): string {
  return GENRE_MAP[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

// ─── Public API functions ──────────────────────────────────────────────────────

/**
 * GET /games
 * Get games with various filters and ordering.
 */
export async function getGames(params: {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  genres?: string;
  platforms?: string;
  dates?: string;
} = {}): Promise<RAWGGame[]> {
  const data = await rawgFetch<RAWGListResponse<RAWGGame>>('/games', {
    page: String(params.page || 1),
    page_size: String(params.page_size || 20),
    ordering: params.ordering || '-rating',
    ...(params.search && { search: params.search }),
    ...(params.genres && { genres: params.genres }),
    ...(params.platforms && { platforms: params.platforms }),
    ...(params.dates && { dates: params.dates }),
  });
  return data.results;
}

/**
 * GET /games
 * Get trending games (highly rated, recent, popular).
 */
export async function getTrendingGames(page = 1): Promise<RAWGGame[]> {
  const data = await rawgFetch<RAWGListResponse<RAWGGame>>('/games', {
    page: String(page),
    page_size: '20',
    ordering: '-metacritic',
    dates: '2020-01-01,2026-12-31',
    metacritic: '70,100',
  });
  return data.results;
}

/**
 * GET /games/{id}
 * Full detail for a single game.
 */
export async function getGameDetail(id: number): Promise<RAWGGameDetail> {
  return rawgFetch<RAWGGameDetail>(`/games/${id}`);
}

/**
 * GET /games
 * Full-text game search.
 */
export async function searchGames(query: string, page = 1): Promise<RAWGGame[]> {
  if (!query.trim()) return [];
  const data = await rawgFetch<RAWGListResponse<RAWGGame>>('/games', {
    search: query.trim(),
    page: String(page),
    page_size: '20',
    ordering: '-rating',
  });
  return data.results;
}

// ─── Convenience mapper — RAWGGame → UnifiedItem shape ─────────────────────
import type { UnifiedItem } from '../data';

export function rawgGameToUnified(g: RAWGGame): UnifiedItem {
  const platforms = g.platforms?.map(p => {
    const name = p.platform.name;
    // Simplify platform names
    if (name.includes('PlayStation')) return 'PS5';
    if (name.includes('Xbox')) return 'Xbox Series X';
    if (name.includes('Nintendo')) return 'Switch';
    if (name.includes('PC')) return 'PC';
    return name;
  }) || [];

  return {
    id: `rawg-${g.id}`,
    title: g.name,
    description: g.short_description || g.description_raw?.slice(0, 200) + '...' || 'No description available.',
    imageUrl: gameCoverUrl(g.background_image),
    backdropUrl: gameBackgroundUrl(g.background_image),
    type: 'game',
    releaseDate: g.released ? g.released.slice(0, 4) : '—',
    // RAWG rating is 0–5, convert to 0–5 with 1 decimal
    rating: Math.round(g.rating * 10) / 10,
    genre: genreFromSlug(g.genres[0]?.slug || 'game'),
    accentColor: 'var(--color-drama)',
    trailerUrl: '', // RAWG doesn't provide trailer URLs directly
    platforms,
    metacritic: g.metacritic || undefined,
    developer: g.developers?.[0]?.name || undefined,
  };
}
