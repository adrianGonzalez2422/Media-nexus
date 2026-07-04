import { Search, X, Sun, Moon } from 'lucide-react';

type Tab = 'home' | 'movies' | 'games' | 'videos' | 'dashboard';

interface Props {
    activeTab: Tab;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    theme: 'dark' | 'light';
    toggleTheme: () => void;
}

export default function Header({ activeTab, searchQuery, setSearchQuery, theme, toggleTheme }: Props) {
    return (
        <header className="top-header">
            <div className="header-title">
                {activeTab === 'home' && 'Discovery Feed'}
                {activeTab === 'movies' && 'Movies (TMDB)'}
                {activeTab === 'games' && 'Games (RAWG)'}
                {activeTab === 'videos' && 'Trailers (YouTube)'}
                {activeTab === 'dashboard' && 'Media Dashboard'}
            </div>

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
    );
}
