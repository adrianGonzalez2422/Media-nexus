import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MediaType = 'movie' | 'game' | 'video';

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: MediaType;
  releaseDate?: string;
  rating?: number;
}

interface AppState {
  favorites: MediaItem[];
  watchlist: MediaItem[];
  addFavorite: (item: MediaItem) => void;
  removeFavorite: (id: string) => void;
  addWatchlist: (item: MediaItem) => void;
  removeWatchlist: (id: string) => void;
  isFavorite: (id: string) => boolean;
  isInWatchlist: (id: string) => boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      watchlist: [],
      addFavorite: (item) => set((state) => ({ favorites: [...state.favorites, item] })),
      removeFavorite: (id) =>
        set((state) => ({ favorites: state.favorites.filter((i) => i.id !== id) })),
      addWatchlist: (item) => set((state) => ({ watchlist: [...state.watchlist, item] })),
      removeWatchlist: (id) =>
        set((state) => ({ watchlist: state.watchlist.filter((i) => i.id !== id) })),
      isFavorite: (id) => get().favorites.some((i) => i.id === id),
      isInWatchlist: (id) => get().watchlist.some((i) => i.id === id),
    }),
    {
      name: 'media-nexus-storage',
    }
  )
);
