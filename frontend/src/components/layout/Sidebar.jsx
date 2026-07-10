import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard, Upload, Shield, Settings, LogOut,
    ShieldAlert, ChevronLeft, Menu, Activity, Bell, MapPin
} from 'lucide-react';
import { cn } from '../common/Input';

const navigation = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Overview & Analytics',
    },
    {
        name: 'Officer Dashboard',
        href: '/officer-dashboard',
        icon: ShieldAlert,
        description: 'Critical Alert Command Center',
    },
    {
        name: 'Upload Image',
        href: '/upload',
        icon: Upload,
        description: 'Submit surveillance photo',
    },
    {
        name: 'Detection Results',
        href: '/detections',
        icon: Shield,
        description: 'Review analysis output',
    },
    {
        name: 'Active Alerts',
        href: '/alerts',
        icon: Bell,
        description: 'Threat notification center',
    },
    {
        name: 'System Settings',
        href: '/settings',
        icon: Settings,
        description: 'Configuration & profile',
    },
];

export default function Sidebar({ collapsed, onToggle }) {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Whether this route is the active one
    const isActive = (href) => {
        return location.pathname === href || location.pathname.startsWith(href + '/');
    };

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : user?.email?.charAt(0).toUpperCase() || 'A';

    return (
        <aside
            className={cn(
                'flex flex-col h-full bg-forest-950 border-r border-forest-800 transition-all duration-300 ease-in-out shrink-0',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo + Collapse Toggle */}
            <div className="flex h-16 shrink-0 items-center border-b border-forest-800 px-4 gap-3">
                <div className="flex items-center gap-2 shrink-0 text-forest-500">
                    <ShieldAlert size={22} className="shrink-0" />
                </div>
                {!collapsed && (
                    <span className="text-base font-bold tracking-widest text-slate-100 flex-1 truncate">
                        GUARDIAN<span className="text-forest-500">AI</span>
                    </span>
                )}
                <button
                    onClick={onToggle}
                    className="p-1.5 rounded-md text-forest-500 hover:text-forest-300 hover:bg-forest-800/50 transition-colors ml-auto shrink-0"
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {navigation.filter(item => {
                    const role = user?.role || 'ranger';
                    if (role === 'admin') return true;
                    if (role === 'officer') {
                        // Officers only see incident response and system settings
                        return ['Officer Dashboard', 'Active Alerts', 'System Settings'].includes(item.name);
                    }
                    if (role === 'ranger') {
                        // Rangers see standard dashboard, upload, results, and settings
                        return ['Dashboard', 'Upload Image', 'Detection Results', 'System Settings'].includes(item.name);
                    }
                    return true;
                }).map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            title={collapsed ? item.name : undefined}
                            className={cn(
                                'group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all duration-150',
                                active ? 'nav-item-active' : 'nav-item-inactive'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'h-4.5 w-4.5 shrink-0 transition-colors',
                                    active ? 'text-forest-400' : 'text-forest-500 group-hover:text-forest-400'
                                )}
                                size={18}
                            />
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="truncate leading-none">{item.name}</p>
                                    {!active && (
                                        <p className="text-[10px] text-forest-500 group-hover:text-forest-400 mt-0.5 truncate leading-none hidden group-hover:block transition-all">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            )}
                            {active && !collapsed && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-forest-400 shrink-0" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User section + Logout */}
            <div className="border-t border-forest-800 p-3 space-y-2">
                <div className={cn(
                    'flex items-center gap-3 rounded-lg px-2 py-2',
                    collapsed ? 'justify-center' : ''
                )}>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center text-white text-xs font-bold border border-forest-600 shrink-0">
                        {initials}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate leading-none">
                                {user?.full_name || 'Field Agent'}
                            </p>
                            <p className="text-[10px] font-bold tracking-wider uppercase text-forest-300 mt-1 mb-0.5 leading-none">
                                {user?.role || 'RANGER'}
                            </p>
                            <p className="text-xs text-forest-400 truncate mt-0.5 leading-none">
                                {user?.email || ''}
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    title={collapsed ? 'Terminate Connection' : undefined}
                    className={cn(
                        'group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium',
                        'text-forest-400 hover:bg-alert-900/40 hover:text-alert-400 transition-all duration-150',
                        collapsed ? 'justify-center' : ''
                    )}
                >
                    <LogOut className="h-4 w-4 shrink-0 group-hover:text-alert-400 transition-colors" />
                    {!collapsed && <span>Terminate Connection</span>}
                </button>
            </div>
        </aside>
    );
}
