import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { cn } from '../common/Input';

/**
 * Topbar - Top navigation bar with user profile dropdown.
 * Shows page title / breadcrumbs passed from child pages.
 */
export default function Topbar({ title, subtitle, actions }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : user?.email?.charAt(0).toUpperCase() || 'A';

    return (
        <header className="relative z-50 h-16 shrink-0 border-b border-forest-800 bg-forest-950/80 backdrop-blur-sm flex items-center px-6 gap-4">
            {/* Page Title */}
            <div className="flex-1 min-w-0">
                {title && (
                    <h1 className="text-base font-semibold text-slate-100 truncate leading-none">{title}</h1>
                )}
                {subtitle && (
                    <p className="text-xs text-forest-400 mt-0.5 leading-none">{subtitle}</p>
                )}
            </div>

            {/* Right-side actions slot */}
            {actions && <div className="flex items-center gap-2">{actions}</div>}

            {/* System status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-forest-700/50 bg-forest-900/30">
                <span className="flex h-2 w-2 relative">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-forest-500" />
                </span>
                <span className="text-xs font-medium text-forest-300 tracking-wider uppercase">Live</span>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(v => !v)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-forest-800/50 transition-colors group"
                    aria-label="User menu"
                >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center text-white text-xs font-bold border border-forest-600">
                        {initials}
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-xs font-medium text-slate-200 leading-none">
                            {user?.full_name?.split(' ')[0] || 'Agent'}
                        </p>
                    </div>
                    <ChevronDown
                        className={cn(
                            'h-3.5 w-3.5 text-forest-500 transition-transform duration-150',
                            dropdownOpen && 'rotate-180'
                        )}
                    />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 glass-panel-dark rounded-xl shadow-panel border border-forest-700/50 overflow-hidden z-50 animate-fade-in">
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-forest-800">
                            <p className="text-sm font-semibold text-slate-100">{user?.full_name || 'Field Agent'}</p>
                            <p className="text-xs text-forest-400 truncate mt-0.5">{user?.email || ''}</p>
                        </div>

                        {/* Menu items */}
                        <div className="p-1">
                            <button
                                onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-forest-300 hover:bg-forest-800/50 hover:text-white transition-colors"
                            >
                                <Settings className="h-4 w-4 text-forest-500" />
                                System Settings
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-forest-300 hover:bg-alert-900/40 hover:text-alert-400 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Terminate Connection
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
