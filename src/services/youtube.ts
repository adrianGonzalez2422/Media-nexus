/**
 * YouTube API Service
 * Docs: https://developers.google.com/youtube/v3
 *
 * Authentication uses API key as query parameter.
 */

const BASE_URL = import.meta.env.VITE_YOUTUBE_BASE_URL as string;
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string;

// ─── Base fetch wrapper ──────────────────────────────────────────────────────
async function youtubeFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`YouTube ${res.status}: ${res.statusText} — ${endpoint}`);
  }
  return res.json() as Promise<T>;
}

// ─── Raw YouTube types ───────────────────────────────────────────────────────
export interface YouTubeVideo {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    liveBroadcastContent: string;
  };
}

interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeVideo[];
}

// ─── Public API functions ──────────────────────────────────────────────────────

/**
 * GET /youtube/v3/search
 * Search for videos by query.
 */
export async function searchVideos(query: string, maxResults = 20): Promise<YouTubeVideo[]> {
  if (!query.trim()) return [];
  const data = await youtubeFetch<YouTubeSearchResponse>('/search', {
    part: 'snippet',
    q: query.trim(),
    maxResults: String(maxResults),
    type: 'video',
    order: 'relevance',
  });
  return data.items;
}

/**
 * GET /youtube/v3/search
 * Search for movie/game trailers.
 */
export async function searchTrailers(query: string, maxResults = 20): Promise<YouTubeVideo[]> {
  if (!query.trim()) return [];
  const data = await youtubeFetch<YouTubeSearchResponse>('/search', {
    part: 'snippet',
    q: `${query.trim()} trailer`,
    maxResults: String(maxResults),
    type: 'video',
    order: 'relevance',
  });
  return data.items;
}

// ─── Convenience mapper — YouTubeVideo → UnifiedItem shape ─────────────────────
import type { UnifiedItem } from '../data';

export function youtubeVideoToUnified(v: YouTubeVideo): UnifiedItem {
  const videoId = v.id.videoId;
  const thumbnail = v.snippet.thumbnails.high?.url || v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default.url;
  
  return {
    id: `youtube-${videoId}`,
    youtubeId: videoId,
    title: v.snippet.title,
    description: v.snippet.description.slice(0, 200) + '...' || 'No description available.',
    imageUrl: thumbnail,
    backdropUrl: thumbnail,
    type: 'video',
    releaseDate: v.snippet.publishedAt.slice(0, 4),
    rating: 4.5, // Default rating for YouTube videos
    genre: 'Video',
    accentColor: 'var(--color-action)',
    trailerUrl: `https://www.youtube.com/embed/${videoId}`,
    channel: v.snippet.channelTitle,
    views: '', // YouTube API requires additional call for view count
    videoDuration: '', // YouTube API requires additional call for duration
  };
}
