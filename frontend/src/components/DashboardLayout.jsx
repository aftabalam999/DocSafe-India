import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Shield, LayoutDashboard, Upload, FolderOpen, Share2,
    Activity, User, Settings, LogOut, Bell, Search, Menu, X, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'upload', label: 'Upload Document', icon: Upload, path: '/upload' },
    { id: 'documents', label: 'My Documents', icon: FolderOpen, path: '/documents' },
    { id: 'shared', label: 'Shared Docs', icon: Share2, path: '/shared' },
    { id: 'family', label: 'Family Members', icon: Users, path: '/family' },
    { id: 'activity', label: 'Activity Logs', icon: Activity, path: '/activity' },
];

const bottomLinks = [
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function DashboardLayout({ children, onUploadClick }) {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logoutUser();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

    const handleNavClick = (path) => {
        navigate(path);
        setSidebarOpen(false);
    };

    const currentPath = location.pathname;

    return (
        <div className="dashboard-layout">
            {/* Sidebar Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Shield size={20} color="white" />
                    </div>
                    <div className="sidebar-logo-text">
                        <h2>DocSafe</h2>
                        <span>India</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <p className="sidebar-section-label">Main Menu</p>
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = currentPath === link.path;
                        return (
                            <button
                                key={link.id}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={() => link.id === 'upload' ? (onUploadClick ? onUploadClick() : handleNavClick(link.path)) : handleNavClick(link.path)}
                                id={`nav-${link.id}`}
                            >
                                <Icon size={18} />
                                {link.label}
                            </button>
                        );
                    })}

                    <p className="sidebar-section-label" style={{ marginTop: '16px' }}>Account</p>
                    {bottomLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = currentPath === link.path;
                        return (
                            <button
                                key={link.id}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={() => handleNavClick(link.path)}
                                id={`nav-${link.id}`}
                            >
                                <Icon size={18} />
                                {link.label}
                            </button>
                        );
                    })}

                    <button className="sidebar-link" onClick={handleLogout} id="nav-logout" style={{ marginTop: '4px' }}>
                        <LogOut size={18} />
                        Logout
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user" onClick={() => handleNavClick('/profile')} style={{ cursor: 'pointer' }}>
                        <div className="avatar">{getInitials(user?.name)}</div>
                        <div className="sidebar-user-info">
                            <p>{user?.name || 'User'}</p>
                            <span>{user?.email || ''}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Navbar */}
                <header className="navbar">
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        id="mobile-menu"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="navbar-search">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            id="navbar-search"
                        />
                    </div>

                    <div className="navbar-actions">
                        <button className="btn-upload" onClick={() => onUploadClick ? onUploadClick() : navigate('/upload')} id="navbar-upload">
                            <Upload size={14} /> Upload
                        </button>

                        <button className="icon-btn" id="navbar-notifications">
                            <Bell size={16} />
                            <span className="notif-dot" />
                        </button>

                        <button className="icon-btn" onClick={() => handleNavClick('/profile')} id="navbar-profile">
                            <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{getInitials(user?.name)}</div>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
