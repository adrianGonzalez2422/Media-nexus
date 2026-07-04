/**
 * TMDB API Service
 * Docs: https://developer.themoviedb.org/reference/intro/getting-started
 *
 * Authentication uses the Read Access Token (Bearer JWT), not the v3 key.
 * The v3 key is kept as fallback for query-string auth if needed.
 */

const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL as string;
const TOKEN    = import.meta.env.VITE_TMDB_API_TOKEN as string;

// ─── Image helpers ──────────────────────────────────────────────────────────
export const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p';

export function posterUrl(path: string | null, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return 'https://placehold.co/500x750?text=No+Poster';
  return `${TMDB_IMG_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return 'https://placehold.co/1280x720?text=No+Backdrop';
  return `${TMDB_IMG_BASE}/${size}${path}`;
}

// ─── Base fetch wrapper ──────────────────────────────────────────────────────
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${res.statusText} — ${endpoint}`);
  }
  return res.json() as Promise<T>;
}

// ─── Raw TMDB types ──────────────────────────────────────────────────────────
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;          // "2024-03-01"
  vote_average: number;          // 0–10
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  adult: boolean;
}

export interface TMDBMovieDetail extends TMDBMovie {
  runtime: number | null;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  credits?: TMDBCredits;
}

export interface TMDBCredits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}

export interface TMDBVideo {
  id: string;
  key: string;          // YouTube video ID
  name: string;
  site: string;         // "YouTube"
  type: string;         // "Trailer" | "Teaser" | "Clip" | ...
  official: boolean;
  published_at: string;
}

interface TMDBListResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface TMDBVideosResponse {
  id: number;
  results: TMDBVideo[];
}

// ─── TMDB Genre map (common genres) ─────────────────────────────────────────
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export function genreFromIds(ids: number[]): string {
  for (const id of ids) {
    if (GENRE_MAP[id]) return GENRE_MAP[id];
  }
  return 'Movie';
}

// ─── Public API functions ────────────────────────────────────────────────────

/**
 * GET /trending/movie/week
 * Returns the trending movies for the current week.
 */
export async function getTrendingMovies(page = 1): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBListResponse<TMDBMovie>>('/trending/movie/week', {
    page: String(page),
    language: 'en-US',
  });
  return data.results;
}

/**
 * GET /movie/popular
 * Popular movies across the platform.
 */
export async function getPopularMovies(page = 1): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBListResponse<TMDBMovie>>('/movie/popular', {
    page: String(page),
    language: 'en-US',
  });
  return data.results;
}

/**
 * GET /movie/{id}
 * Full detail for a single movie.
 */
export async function getMovieDetail(id: number, appendToResponse?: string): Promise<TMDBMovieDetail> {
  const params: Record<string, string> = { language: 'en-US' };
  if (appendToResponse) {
    params.append_to_response = appendToResponse;
  }
  return tmdbFetch<TMDBMovieDetail>(`/movie/${id}`, params);
}

/**
 * GET /movie/{id}/credits
 * Cast + crew for a movie.
 */
export async function getMovieCredits(id: number): Promise<TMDBCredits> {
  return tmdbFetch<TMDBCredits>(`/movie/${id}/credits`, { language: 'en-US' });
}

/**
 * GET /movie/{id}/videos
 * Returns trailers and clips. Filters to the best official YouTube trailer.
 */
export async function getMovieVideos(id: number): Promise<TMDBVideo[]> {
  const data = await tmdbFetch<TMDBVideosResponse>(`/movie/${id}/videos`, { language: 'en-US' });
  return data.results.filter((v) => v.site === 'YouTube');
}

/**
 * Returns the best YouTube embed URL for a movie ID.
 * Priority: official Trailer → Teaser → any YouTube video.
 */
export async function getBestTrailerUrl(movieId: number): Promise<string | null> {
  const videos = await getMovieVideos(movieId);
  if (!videos.length) return null;

  const pick =
    videos.find((v) => v.type === 'Trailer' && v.official) ??
    videos.find((v) => v.type === 'Trailer') ??
    videos.find((v) => v.type === 'Teaser' && v.official) ??
    videos[0];

  return `https://www.youtube.com/embed/${pick.key}`;
}

/**
 * GET /search/movie?query=...
 * Full-text movie search.
 */
export async function searchMovies(query: string, page = 1): Promise<TMDBMovie[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch<TMDBListResponse<TMDBMovie>>('/search/movie', {
    query: query.trim(),
    page: String(page),
    language: 'en-US',
    include_adult: 'false',
  });
  return data.results;
}

// ─── Convenience mapper — TMDBMovie → UnifiedItem shape ─────────────────────
import type { UnifiedItem } from '../data';

export function tmdbMovieToUnified(m: TMDBMovie): UnifiedItem {
  const genre = genreFromIds(m.genre_ids);
  return {
    id: `tmdb-${m.id}`,
    tmdbId: m.id,
    title: m.title,
    description: m.overview || 'No description available.',
    imageUrl: posterUrl(m.poster_path, 'w500'),
    backdropUrl: backdropUrl(m.backdrop_path, 'w1280'),
    type: 'movie',
    releaseDate: m.release_date ? m.release_date.slice(0, 4) : '—',
    // TMDB vote_average is 0–10; convert to 0–5 rounded to 1 decimal
    rating: Math.round((m.vote_average / 2) * 10) / 10,
    genre,
    accentColor: 'var(--color-scifi)',
    trailerUrl: '', // filled lazily on click via getBestTrailerUrl(m.id)
  };
}
