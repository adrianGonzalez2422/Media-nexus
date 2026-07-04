import { Clapperboard, Home, Gamepad2, Tv, LayoutDashboard } from 'lucide-react';

type Tab = 'home' | 'movies' | 'games' | 'videos' | 'dashboard';

interface Props {
    activeTab: Tab;
    setActiveTab: (t: Tab) => void;
    setSelectedGenre: (g: string) => void;
    setSearchQuery: (q: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab, setSelectedGenre, setSearchQuery }: Props) {
    return (
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
    );
}
