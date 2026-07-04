import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clapperboard, 
  Bookmark, 
  Heart, 
  Star, 
  Sun, 
  Moon, 
  X, 
  Play, 
  Check, 
  Compass, 
  Info,
  Home,
  Gamepad2,
  Tv,
  LayoutDashboard,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useStore, type MediaItem } from './store/useStore';
import { mediaItems, type UnifiedItem } from './data';
import { useTMDBTrending, useTMDBSearch, useTMDBSync } from './hooks/useTMDB';
import { useRAWGTrending, useRAWGSearch } from './hooks/useRAWG';
import { useYouTubeTrending, useYouTubeSearch } from './hooks/useYouTube';
import { getBestTrailerUrl } from './services/tmdb';
import './App.css';

function App() {
  const { 
    favorites, 
    watchlist, 
    addFavorite, 
    removeFavorite, 
    addWatchlist, 
    removeWatchlist, 
    isFavorite, 
    isInWatchlist 
  } = useStore();

  // Navigation and Query States - Updated for Vercel deploy
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'games' | 'videos' | 'dashboard'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Theme State (Dark mode default, light mode togglable)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('media-nexus-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // Selected Item for YouTube Overlay Modal
  const [selectedItem, setSelectedItem] = useState<UnifiedItem | null>(null);
  // Lazy trailer URL resolved from TMDB on modal open
  const [modalTrailerUrl, setModalTrailerUrl] = useState<string>('');

  // Ratings State
  const [userRatings, setUserRatings] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('media-nexus-ratings');
    return saved ? JSON.parse(saved) : {};
  });

  // Real TMDB data hooks
  const staticMovies = mediaItems.filter(i => i.type === 'movie');
  const { items: tmdbMovies, loading: tmdbLoading, error: tmdbError } = useTMDBTrending(staticMovies);
  const { results: tmdbSearchResults } = useTMDBSearch(
    (activeTab === 'home' || activeTab === 'movies') ? searchQuery : ''
  );
  const { sync: syncTMDB, syncing: tmdbSyncing, lastSynced, syncedCount } = useTMDBSync();

  // Real RAWG data hooks
  const staticGames = mediaItems.filter(i => i.type === 'game');
  const { items: rawgGames, loading: rawgLoading, error: rawgError } = useRAWGTrending(staticGames);
  const { results: rawgSearchResults } = useRAWGSearch(
    (activeTab === 'home' || activeTab === 'games') ? searchQuery : ''
  );

  // Real YouTube data hooks
  const staticVideos = mediaItems.filter(i => i.type === 'video');
  const { items: youtubeVideos, loading: youtubeLoading, error: youtubeError } = useYouTubeTrending(staticVideos);
  const { results: youtubeSearchResults } = useYouTubeSearch(
    (activeTab === 'home' || activeTab === 'videos') ? searchQuery : ''
  );

  // Sync progress UI state (shown while Dashboard sync runs)
  const [syncProgress, setSyncProgress] = useState(0);

  // Toast State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' }[]>([]);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('media-nexus-theme', theme);
  }, [theme]);

  // Sync ratings to localStorage
  useEffect(() => {
    localStorage.setItem('media-nexus-ratings', JSON.stringify(userRatings));
  }, [userRatings]);

  // Trigger Toasts
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Cyber Dark' : 'Sleek Light'} Theme`, 'info');
  };

  // Toggle Favorite
  const handleFavoriteToggle = (e: React.MouseEvent, item: UnifiedItem) => {
    e.stopPropagation();
    const isFav = isFavorite(item.id);
    const media: MediaItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      type: item.type,
      releaseDate: item.releaseDate,
      rating: item.rating
    };

    if (isFav) {
      removeFavorite(item.id);
      showToast(`Removed "${item.title}" from Favorites`, 'info');
    } else {
      addFavorite(media);
      showToast(`Added "${item.title}" to Favorites`, 'success');
    }
  };

  // Toggle Watchlist
  const handleWatchlistToggle = (e: React.MouseEvent, item: UnifiedItem) => {
    e.stopPropagation();
    const isWatch = isInWatchlist(item.id);
    const media: MediaItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      type: item.type,
      releaseDate: item.releaseDate,
      rating: item.rating
    };

    if (isWatch) {
      removeWatchlist(item.id);
      showToast(`Removed "${item.title}" from Watchlist`, 'info');
    } else {
      addWatchlist(media);
      showToast(`Added "${item.title}" to Watchlist`, 'success');
    }
  };

  // Rate Item
  const handleRateItem = (itemId: string, rating: number) => {
    setUserRatings((prev) => ({ ...prev, [itemId]: rating }));
    showToast(`You rated this item ${rating} stars!`, 'success');
  };

  // Get color per media type/genre
  const getTypeColor = (type: 'movie' | 'game' | 'video') => {
    switch (type) {
      case 'movie': return 'var(--color-scifi)'; // Cyan
      case 'game': return 'var(--color-drama)';  // Purple
      case 'video': return 'var(--color-action)'; // Rose
      default: return 'var(--primary)';
    }
  };

  const getGenreColor = (genre: string) => {
    switch (genre) {
      case 'Sci-Fi': return 'var(--color-scifi)';
      case 'Action': return 'var(--color-action)';
      case 'Comedy': return 'var(--color-comedy)';
      case 'Drama': return 'var(--color-drama)';
      case 'Mystery': return 'var(--color-drama)';
      case 'Horror': return 'var(--color-horror)';
      default: return 'var(--primary)';
    }
  };

  // Unique genres for filters
  const genres = ['All', 'Action', 'Sci-Fi', 'Comedy', 'Drama', 'RPG', 'Adventure'];

  // ─── Real TMDB Dashboard Sync ────────────────────────────────────────────
  const handleSyncNow = async () => {
    setSyncProgress(0);
    showToast('Connecting to TMDB API...', 'info');

    // Animate progress bar to ~40% while waiting
    const fillTo = (target: number, duration: number) =>
      new Promise<void>((resolve) => {
        const step = (target - syncProgress) / (duration / 50);
        const t = setInterval(() => {
          setSyncProgress((p) => {
            if (p >= target) { clearInterval(t); resolve(); return target; }
            return Math.min(p + step, target);
          });
        }, 50);
      });

    await fillTo(30, 600);
    showToast('Fetching trending & popular movies from TMDB...', 'info');
    await fillTo(65, 600);

    try {
      const items = await syncTMDB();
      await fillTo(100, 400);
      showToast(`✓ ${items.length} movies synced from TMDB`, 'success');
    } catch {
      showToast('TMDB sync failed — check your API token', 'info');
      setSyncProgress(0);
    }
  };

  // ─── Open modal and lazily resolve trailer URL ────────────────────────────
  const openItemModal = async (item: UnifiedItem) => {
    // Don't open modal if no trailer URL available
    if (!item.trailerUrl && item.type !== 'movie') {
      showToast('No trailer available for this item', 'info');
      return;
    }

    // Reset modal state first
    setSelectedItem(item);
    setModalTrailerUrl(''); // Clear previous video to force reload
    
    // Small delay to ensure the iframe reloads with new URL
    setTimeout(() => {
      setModalTrailerUrl(item.trailerUrl);
    }, 50);
    
    if (item.type === 'movie' && item.tmdbId && !item.trailerUrl) {
      const url = await getBestTrailerUrl(item.tmdbId);
      if (url) setModalTrailerUrl(url);
    }
  };

  // ─── Filter Items ─────────────────────────────────────────────────────────
  // For movies: prefer live TMDB data; for games: use RAWG data; for videos: use YouTube data
  const getFilteredItems = () => {
    // If there's an active TMDB search result, use it for Home + Movies tabs
    if (searchQuery && tmdbSearchResults.length > 0 && (activeTab === 'home' || activeTab === 'movies')) {
      return tmdbSearchResults.filter(
        (item) => selectedGenre === 'All' || item.genre === selectedGenre
      );
    }

    // If there's an active RAWG search result, use it for Home + Games tabs
    if (searchQuery && rawgSearchResults.length > 0 && (activeTab === 'home' || activeTab === 'games')) {
      return rawgSearchResults.filter(
        (item) => selectedGenre === 'All' || item.genre === selectedGenre
      );
    }

    // If there's an active YouTube search result, use it for Home + Videos tabs
    if (searchQuery && youtubeSearchResults.length > 0 && (activeTab === 'home' || activeTab === 'videos')) {
      return youtubeSearchResults.filter(
        (item) => selectedGenre === 'All' || item.genre === selectedGenre
      );
    }

    let source: UnifiedItem[];
    if (activeTab === 'movies') {
      source = tmdbMovies; // live TMDB trending movies
    } else if (activeTab === 'games') {
      source = rawgGames; // live RAWG trending games
    } else if (activeTab === 'videos') {
      source = youtubeVideos; // live YouTube trending videos
    } else {
      // Home: mix TMDB movies + RAWG games + YouTube videos
      source = [...tmdbMovies.slice(0, 6), ...rawgGames.slice(0, 6), ...youtubeVideos.slice(0, 6)];
    }

    return source.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.genre.toLowerCase().includes(q);
      const matchesGenre = selectedGenre === 'All' || item.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  };

  const filteredItems = getFilteredItems();
  const spotlightItem = tmdbMovies[0] ?? mediaItems[0]; // first trending TMDB movie as spotlight

  // Counts for Dashboard
  const movieCount = tmdbMovies.length || mediaItems.filter(i => i.type === 'movie').length;
  const gameCount  = rawgGames.length || mediaItems.filter(i => i.type === 'game').length;
  const videoCount = youtubeVideos.length || mediaItems.filter(i => i.type === 'video').length;

  return (
    <div className={`app-layout ${theme}`}>
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast" style={{ borderLeftColor: t.type === 'success' ? 'var(--color-horror)' : 'var(--primary)' }}>
            {t.type === 'success' ? <Check size={18} color="var(--color-horror)" /> : <Info size={18} color="var(--primary)" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <a href="#home" className="sidebar-header" onClick={() => { setActiveTab('home'); setSelectedGenre('All'); }}>
          <Clapperboard className="sidebar-logo-icon" size={28} />
          <span>Media Nexus</span>
        </a>

        <nav className="sidebar-nav">
          <button 
            className={`sidebar-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => { setActiveTab('home'); setSelectedGenre('All'); setSearchQuery(''); }}
          >
            <Home size={18} />
            <span>Home</span>
          </button>
          
          <button 
            className={`sidebar-link ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => { setActiveTab('movies'); setSelectedGenre('All'); setSearchQuery(''); }}
          >
            <Clapperboard size={18} />
            <span>Movies</span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => { setActiveTab('games'); setSelectedGenre('All'); setSearchQuery(''); }}
          >
            <Gamepad2 size={18} />
            <span>Games</span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => { setActiveTab('videos'); setSelectedGenre('All'); setSearchQuery(''); }}
          >
            <Tv size={18} />
            <span>Videos</span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSelectedGenre('All'); setSearchQuery(''); }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="profile-card">
            <div className="profile-avatar">U</div>
            <div className="profile-info">
              <span className="profile-name">Adrian</span>
              <span className="profile-role">Premium Member</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="main-workspace">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-title">
            {activeTab === 'home' && 'Discovery Feed'}
            {activeTab === 'movies' && 'Movies (TMDB)'}
            {activeTab === 'games' && 'Games (RAWG)'}
            {activeTab === 'videos' && 'Trailers (YouTube)'}
            {activeTab === 'dashboard' && 'Media Dashboard'}
          </div>

          {/* Search Input */}
          {activeTab !== 'dashboard' && (
            <div className="search-container">
              <input
                type="text"
                className="search-field"
                placeholder={`Search ${activeTab === 'home' ? 'movies, games, videos' : activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="search-field-icon" size={16} />
              {searchQuery && (
                <button className="search-field-clear" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="header-actions">
            <button 
              className="theme-switch-btn" 
              onClick={toggleTheme} 
              title={`Toggle Theme`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="page-container">
          
          {/* HOME VIEW */}
          {activeTab === 'home' && (
            <>
              {/* Highlight Banner */}
              {!searchQuery && selectedGenre === 'All' && spotlightItem && (
                <div 
                  className="hero-banner" 
                  style={{ 
                    backgroundImage: `linear-gradient(rgba(5, 5, 10, 0.7), rgba(5, 5, 10, 0.85)), url(${spotlightItem.backdropUrl})`,
                    backgroundPosition: 'center 25%',
                    backgroundSize: 'cover'
                  }}
                >
                  <div className="hero-tag" style={{ background: getTypeColor(spotlightItem.type) }}>Featured Release</div>
                  <h1 className="hero-title">{spotlightItem.title}</h1>
                  <p className="hero-desc">{spotlightItem.description}</p>
                  <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem' }}>
                    <button className="quick-action-btn" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={() => openItemModal(spotlightItem)}>
                      <Play size={16} fill="currentColor" /> Watch Trailer
                    </button>
                  </div>
                </div>
              )}

              {/* Feed Controls */}
              <div className="dashboard-controls">
                <div className="trending-feed-title-row">
                  <h2 className="trending-feed-title">
                    <TrendingUp size={22} color="var(--primary)" />
                    Trending Now
                  </h2>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {genres.map((g) => (
                      <button
                        key={g}
                        className={`genre-tag ${selectedGenre === g ? 'active' : ''}`}
                        onClick={() => setSelectedGenre(g)}
                        style={selectedGenre === g ? { background: getGenreColor(g), borderColor: getGenreColor(g) } : {}}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* TMDB loading/error banners */}
              {tmdbLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--primary-bg-light)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <RefreshCw size={16} className="spinner" color="var(--primary)" />
                  Fetching live data from TMDB...
                </div>
              )}
              {tmdbError && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--color-action)' }}>
                  ⚠ TMDB API error: {tmdbError} — showing static fallback data.
                </div>
              )}

              {/* RAWG loading/error banners */}
              {rawgLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--primary-bg-light)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <RefreshCw size={16} className="spinner" color="var(--color-drama)" />
                  Fetching live data from RAWG...
                </div>
              )}
              {rawgError && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--color-action)' }}>
                  ⚠ RAWG API error: {rawgError} — showing static fallback data.
                </div>
              )}

              {/* YouTube loading/error banners */}
              {youtubeLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--primary-bg-light)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <RefreshCw size={16} className="spinner" color="var(--color-comedy)" />
                  Fetching live data from YouTube...
                </div>
              )}
              {youtubeError && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--color-action)' }}>
                  ⚠ YouTube API error: {youtubeError} — showing static fallback data.
                </div>
              )}

              {/* Mixed Trending Feed */}
              <div className="mixed-feed-grid">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const isFav = isFavorite(item.id);
                    const isWatch = isInWatchlist(item.id);
                    const tColor = getTypeColor(item.type);
                    
                    return (
                      <div 
                        key={item.id} 
                        className="movie-card"
                        style={{ 
                          '--accent-color': tColor, 
                          '--accent-glow': tColor + '33' 
                        } as React.CSSProperties}
                        onClick={() => openItemModal(item)}
                      >
                        {/* Rating Badges */}
                        <div className="rating-badge">
                          <Star size={14} fill="currentColor" />
                          <span>{item.rating}</span>
                        </div>

                        {/* Type Badge */}
                        <div className="type-badge" style={{ color: tColor, borderColor: tColor + '55' }}>
                          {item.type}
                        </div>

                        {/* Card Hover Action Buttons */}
                        <div className="movie-card-actions">
                          <button 
                            className={`card-action-icon-btn ${isFav ? 'active-fav' : ''}`}
                            onClick={(e) => handleFavoriteToggle(e, item)}
                            title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                            aria-label="Favorite Toggle"
                          >
                            <Heart size={14} fill={isFav ? "currentColor" : "none"} />
                          </button>
                          <button 
                            className={`card-action-icon-btn ${isWatch ? 'active-watch' : ''}`}
                            onClick={(e) => handleWatchlistToggle(e, item)}
                            title={isWatch ? "Remove from Watchlist" : "Add to Watchlist"}
                            aria-label="Watchlist Toggle"
                          >
                            <Bookmark size={14} fill={isWatch ? "currentColor" : "none"} />
                          </button>
                        </div>

                        {/* Media Cover */}
                        <div className="movie-poster-wrapper">
                          <img src={item.imageUrl} alt={item.title} className="movie-poster" loading="lazy" />
                          <div className="movie-card-overlay">
                            <button className="quick-action-btn">
                              <Play size={14} fill="currentColor" /> Preview Trailer
                            </button>
                          </div>
                        </div>

                        {/* Info details */}
                        <div className="movie-card-info">
                          <h3 className="movie-card-title">{item.title}</h3>
                          <p className="movie-card-desc">{item.description}</p>
                          
                          {item.type === 'game' && item.platforms && (
                            <div className="platform-row">
                              {item.platforms.map(p => (
                                <span key={p} className="platform-chip">{p}</span>
                              ))}
                              {item.metacritic && (
                                <span className={`metascore-badge ${item.metacritic < 90 ? 'yellow' : ''}`}>
                                  {item.metacritic} Metascore
                                </span>
                              )}
                            </div>
                          )}

                          {item.type === 'video' && item.channel && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                              <span>{item.channel}</span>
                              <span>{item.views}</span>
                            </div>
                          )}

                          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
                            <span>{item.genre}</span>
                            <span>{item.type === 'video' ? item.videoDuration : item.duration || item.releaseDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <Compass className="empty-state-icon" size={48} />
                    <h3>No items found matching your filters</h3>
                    <button className="quick-action-btn" style={{ width: 'auto', padding: '0.6rem 1.2rem', marginTop: '0.5rem' }} onClick={() => { setSelectedGenre('All'); setSearchQuery(''); }}>
                      Reset filters
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* MOVIES ONLY VIEW */}
          {activeTab === 'movies' && (
            <>
              <div className="dashboard-controls">
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {genres.filter(g => g !== 'RPG' && g !== 'Adventure').map((g) => (
                    <button
                      key={g}
                      className={`genre-tag ${selectedGenre === g ? 'active' : ''}`}
                      onClick={() => setSelectedGenre(g)}
                      style={selectedGenre === g ? { background: getGenreColor(g), borderColor: getGenreColor(g) } : {}}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mixed-feed-grid">
                {filteredItems.map((movie) => (
                  <div 
                    key={movie.id} 
                    className="movie-card"
                    style={{ '--accent-color': 'var(--color-scifi)', '--accent-glow': 'rgba(6, 182, 212, 0.2)' } as React.CSSProperties}
                    onClick={() => setSelectedItem(movie)}
                  >
                    <div className="rating-badge">
                      <Star size={14} fill="currentColor" />
                      <span>{movie.rating}</span>
                    </div>

                    <div className="movie-poster-wrapper">
                      <img src={movie.imageUrl} alt={movie.title} className="movie-poster" />
                      <div className="movie-card-overlay">
                        <button className="quick-action-btn"><Play size={14} fill="currentColor"/> Open Details</button>
                      </div>
                    </div>

                    <div className="movie-card-info">
                      <h3 className="movie-card-title">{movie.title}</h3>
                      <p className="movie-card-desc">{movie.description}</p>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>{movie.duration}</span>
                        <span>{movie.releaseDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* GAMES ONLY VIEW */}
          {activeTab === 'games' && (
            <>
              <div className="dashboard-controls">
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['All', 'RPG', 'Adventure', 'Sci-Fi', 'Action'].map((g) => (
                    <button
                      key={g}
                      className={`genre-tag ${selectedGenre === g ? 'active' : ''}`}
                      onClick={() => setSelectedGenre(g)}
                      style={selectedGenre === g ? { background: 'var(--color-drama)', borderColor: 'var(--color-drama)' } : {}}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mixed-feed-grid">
                {filteredItems.map((game) => (
                  <div 
                    key={game.id} 
                    className="movie-card"
                    style={{ '--accent-color': 'var(--color-drama)', '--accent-glow': 'rgba(168, 85, 247, 0.2)' } as React.CSSProperties}
                    onClick={() => game.trailerUrl ? openItemModal(game) : showToast(`${game.title} - No trailer available`, 'info')}
                  >
                    <div className="rating-badge">
                      <Star size={14} fill="currentColor" />
                      <span>{game.rating}</span>
                    </div>

                    <div className="movie-poster-wrapper">
                      <img src={game.imageUrl} alt={game.title} className="movie-poster" />
                      <div className="movie-card-overlay">
                        <button className="quick-action-btn" onClick={(e) => {
                          e.stopPropagation();
                          if (game.trailerUrl) {
                            openItemModal(game);
                          } else {
                            showToast(`${game.title} - No trailer available`, 'info');
                          }
                        }}>
                          {game.trailerUrl ? <><Play size={14} fill="currentColor"/> Watch Trailer</> : <><Info size={14} fill="currentColor"/> Game Details</>}
                        </button>
                      </div>
                    </div>

                    <div className="movie-card-info">
                      <h3 className="movie-card-title">{game.title}</h3>
                      <p className="game-card-desc">{game.description}</p>
                      
                      {game.platforms && (
                        <div className="platform-row">
                          {game.platforms.map(p => <span key={p} className="platform-chip">{p}</span>)}
                          {game.metacritic && <span className="metascore-badge">{game.metacritic} Metascore</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* VIDEOS ONLY VIEW */}
          {activeTab === 'videos' && (
            <div className="mixed-feed-grid">
              {filteredItems.map((vid) => (
                <div 
                  key={vid.id} 
                  className="movie-card"
                  style={{ '--accent-color': 'var(--color-action)', '--accent-glow': 'rgba(244, 63, 94, 0.2)' } as React.CSSProperties}
                  onClick={() => setSelectedItem(vid)}
                >
                  <div className="movie-poster-wrapper" style={{ aspectRatio: '16/9' }}>
                    <img src={vid.imageUrl} alt={vid.title} className="movie-poster" />
                    <div className="movie-card-overlay">
                      <button className="quick-action-btn"><Play size={14} fill="currentColor" /> Watch Trailer</button>
                    </div>
                  </div>

                  <div className="movie-card-info">
                    <h3 className="movie-card-title">{vid.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      <span>{vid.channel}</span>
                      <span>{vid.videoDuration}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      <span>{vid.views}</span>
                      <span>{vid.releaseDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DASHBOARD STATISTICS VIEW */}
          {activeTab === 'dashboard' && (
            <>
              {/* Bento cards stats */}
              <div className="bento-stats-grid">
                <div className="bento-stat-card">
                  <div className="stat-icon-wrapper" style={{ color: 'var(--color-scifi)', background: 'rgba(6, 182, 212, 0.1)' }}>
                    <Clapperboard size={20} />
                  </div>
                  <span className="stat-number">{movieCount}</span>
                  <span className="stat-label">Movies Cataloged</span>
                </div>
                
                <div className="bento-stat-card">
                  <div className="stat-icon-wrapper" style={{ color: 'var(--color-drama)', background: 'rgba(168, 85, 247, 0.1)' }}>
                    <Gamepad2 size={20} />
                  </div>
                  <span className="stat-number">{gameCount}</span>
                  <span className="stat-label">RAWG Games Synced</span>
                </div>

                <div className="bento-stat-card">
                  <div className="stat-icon-wrapper" style={{ color: 'var(--color-action)', background: 'rgba(244, 63, 94, 0.1)' }}>
                    <Tv size={20} />
                  </div>
                  <span className="stat-number">{videoCount}</span>
                  <span className="stat-label">Trailers Indexed</span>
                </div>

                <div className="bento-stat-card">
                  <div className="stat-icon-wrapper" style={{ color: 'var(--color-comedy)', background: 'rgba(250, 204, 21, 0.1)' }}>
                    <Bookmark size={20} />
                  </div>
                  <span className="stat-number">{watchlist.length + favorites.length}</span>
                  <span className="stat-label">Personal Track List</span>
                </div>
              </div>

              {/* API Sync Simulation Block */}
              <div className="bento-stat-card" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>External API Data Sync</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fetch metadata real-time updates from TMDB (Movies), RAWG (Games), and YouTube (Trailers).</p>
                  </div>
                  <button 
                    className="sync-btn"
                    onClick={handleSyncNow}
                    disabled={tmdbSyncing}
                  >
                    <RefreshCw size={16} className={tmdbSyncing ? 'spinner' : ''} />
                    {tmdbSyncing ? 'Syncing...' : 'Sync from TMDB Now'}
                  </button>
                </div>
                {(tmdbSyncing || syncProgress > 0) && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>{tmdbSyncing ? 'Fetching from TMDB API...' : `✓ ${syncedCount} movies synced`}{lastSynced ? ` · Last sync: ${lastSynced.toLocaleTimeString()}` : ''}</span>
                      <span>{Math.round(syncProgress)}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${syncProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid with Charts and Activity */}
              <div className="dashboard-grid">
                
                {/* SVG Chart 1 */}
                <div className="chart-card">
                  <h3 className="chart-title">Catalog Distribution (Unified Items)</h3>
                  <div className="chart-placeholder-svg">
                    <svg viewBox="0 0 400 200" width="100%" height="100%">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeWidth="1" />
                      <line x1="40" y1="70" x2="380" y2="70" stroke="var(--border-color)" strokeWidth="1" />
                      <line x1="40" y1="120" x2="380" y2="120" stroke="var(--border-color)" strokeWidth="1" />
                      <line x1="40" y1="170" x2="380" y2="170" stroke="var(--border-color)" strokeWidth="1" />

                      {/* Bar for Movies */}
                      <rect x="70" y={170 - (movieCount * 30)} width="45" height={movieCount * 30} rx="4" fill="var(--color-scifi)" filter="drop-shadow(0 4px 10px rgba(6, 182, 212, 0.4))" />
                      <text x="92.5" y="190" textAnchor="middle" fill="var(--text-muted)" fontSize="10">Movies</text>
                      <text x="92.5" y={160 - (movieCount * 30)} textAnchor="middle" fill="var(--text-main)" fontSize="12" fontWeight="700">{movieCount}</text>

                      {/* Bar for Games */}
                      <rect x="175" y={170 - (gameCount * 30)} width="45" height={gameCount * 30} rx="4" fill="var(--color-drama)" filter="drop-shadow(0 4px 10px rgba(168, 85, 247, 0.4))" />
                      <text x="197.5" y="190" textAnchor="middle" fill="var(--text-muted)" fontSize="10">Games</text>
                      <text x="197.5" y={160 - (gameCount * 30)} textAnchor="middle" fill="var(--text-main)" fontSize="12" fontWeight="700">{gameCount}</text>

                      {/* Bar for Videos */}
                      <rect x="280" y={170 - (videoCount * 30)} width="45" height={videoCount * 30} rx="4" fill="var(--color-action)" filter="drop-shadow(0 4px 10px rgba(244, 63, 94, 0.4))" />
                      <text x="302.5" y="190" textAnchor="middle" fill="var(--text-muted)" fontSize="10">Videos</text>
                      <text x="302.5" y={160 - (videoCount * 30)} textAnchor="middle" fill="var(--text-main)" fontSize="12" fontWeight="700">{videoCount}</text>
                    </svg>
                  </div>
                </div>

                {/* Watchlist & Favorites quick access panel */}
                <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 className="chart-title" style={{ marginBottom: 0 }}>Watchlist Quick Access</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '200px' }}>
                    {watchlist.length > 0 ? (
                      watchlist.map(item => (
                        <div key={item.id} className="profile-card" style={{ justifyContent: 'space-between', background: 'var(--glass-bg)', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <img src={item.imageUrl} alt={item.title} style={{ width: '2rem', height: '2.7rem', objectFit: 'cover', borderRadius: '4px' }} />
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700 }} className="news-card-title">{item.title}</div>
                              <div style={{ fontSize: '0.7rem', color: getTypeColor(item.type) }} className="info-label">{item.type}</div>
                            </div>
                          </div>
                          <button 
                            className="card-action-icon-btn active-watch" 
                            style={{ width: '1.75rem', height: '1.75rem' }} 
                            onClick={(e) => { e.stopPropagation(); removeWatchlist(item.id); showToast(`Removed "${item.title}"`, 'info'); }}
                            aria-label="Remove from Watchlist"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your watchlist is empty.</p>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

        </main>
      </div>

      {/* EMBEDDED YOUTUBE PREVIEW OVERLAY */}
      {selectedItem && (
        <div className="youtube-overlay" onClick={() => setSelectedItem(null)}>
          <div className="youtube-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedItem(null)}>
              <X size={18} />
            </button>

            {/* Iframe youtube stream */}
            <div className="youtube-player-container">
              {modalTrailerUrl ? (
                <iframe
                  className="youtube-iframe"
                  src={`${modalTrailerUrl}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                  title={`${selectedItem.title} Preview`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.75rem', color: 'var(--text-muted)' }}>
                  <RefreshCw size={22} className="spinner" />
                  <span>Loading trailer...</span>
                </div>
              )}
            </div>

            {/* Modal Detail Body */}
            <div className="youtube-modal-details">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <span className="genre-badge" style={{ backgroundColor: getTypeColor(selectedItem.type) }}>
                      {selectedItem.type}
                    </span>
                    <span className="genre-badge" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                      {selectedItem.genre}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, lineHeight: 1.1 }}>
                    {selectedItem.title}
                  </h2>
                </div>

                {/* Rating score / Metascore */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {selectedItem.type === 'game' && selectedItem.metacritic && (
                    <div style={{ textAlign: 'right' }}>
                      <div className="info-label">Metascore</div>
                      <span className="metascore-badge" style={{ fontSize: '1rem', padding: '0.25rem 0.6rem' }}>
                        {selectedItem.metacritic}
                      </span>
                    </div>
                  )}
                  <div style={{ textAlign: 'right' }}>
                    <div className="info-label">User Score</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-comedy)', fontWeight: 800, fontSize: '1.25rem' }}>
                      <Star size={18} fill="currentColor" />
                      <span>{selectedItem.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  className="quick-action-btn" 
                  style={{ width: 'auto', padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  onClick={(e) => handleWatchlistToggle(e, selectedItem)}
                >
                  {isInWatchlist(selectedItem.id) ? <Check size={16} /> : <Bookmark size={16} />}
                  {isInWatchlist(selectedItem.id) ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
                <button 
                  className="quick-action-btn" 
                  style={{ width: 'auto', padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  onClick={(e) => handleFavoriteToggle(e, selectedItem)}
                >
                  {isFavorite(selectedItem.id) ? <Heart size={16} fill="var(--color-action)" color="var(--color-action)" /> : <Heart size={16} />}
                  {isFavorite(selectedItem.id) ? 'Favorited' : 'Favorite'}
                </button>
              </div>

              {/* Grid properties */}
              <div className="movie-details-grid">
                <div className="movie-details-left">
                  <div>
                    <h3 className="detail-section-title">Overview</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{selectedItem.description}</p>
                  </div>

                  {selectedItem.type === 'movie' && selectedItem.cast && (
                    <div>
                      <h3 className="detail-section-title">Cast Members</h3>
                      <div className="cast-list">
                        {selectedItem.cast.map(c => <span key={c} className="cast-chip">{c}</span>)}
                      </div>
                    </div>
                  )}

                  {selectedItem.type === 'game' && selectedItem.platforms && (
                    <div>
                      <h3 className="detail-section-title">Available Platforms</h3>
                      <div className="cast-list">
                        {selectedItem.platforms.map(p => <span key={p} className="cast-chip" style={{ borderColor: 'var(--color-drama)' }}>{p}</span>)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="movie-details-right">
                  {selectedItem.type === 'movie' && (
                    <>
                      <div className="info-item">
                        <span className="info-label">Director</span>
                        <span className="info-value">{selectedItem.director}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Duration</span>
                        <span className="info-value">{selectedItem.duration}</span>
                      </div>
                    </>
                  )}

                  {selectedItem.type === 'game' && (
                    <>
                      <div className="info-item">
                        <span className="info-label">Developer</span>
                        <span className="info-value">{selectedItem.developer}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Release Year</span>
                        <span className="info-value">{selectedItem.releaseDate}</span>
                      </div>
                    </>
                  )}

                  {selectedItem.type === 'video' && (
                    <>
                      <div className="info-item">
                        <span className="info-label">Publisher Channel</span>
                        <span className="info-value">{selectedItem.channel}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Total Stream Views</span>
                        <span className="info-value">{selectedItem.views}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Video Runtime</span>
                        <span className="info-value">{selectedItem.videoDuration}</span>
                      </div>
                    </>
                  )}

                  {/* Star Rating box */}
                  <div className="rating-action-box" style={{ marginTop: '0.5rem' }}>
                    <span className="info-label">Your Personal Score</span>
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const ratedVal = userRatings[selectedItem.id] || 0;
                        return (
                          <button
                            key={star}
                            className={`star-btn ${star <= ratedVal ? 'filled' : ''}`}
                            onClick={() => handleRateItem(selectedItem.id, star)}
                            title={`Rate ${star} Stars`}
                            aria-label={`Rate ${star} Stars`}
                          >
                            <Star size={20} fill={star <= ratedVal ? "currentColor" : "none"} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Mobile Footer helper */}
      <footer style={{ display: 'none' }}>
        <p>Media Nexus Dashboard © 2026. Built using UI/UX Pro Max guidelines.</p>
      </footer>
    </div>
  );
}

export default App;
