import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, ImageIcon, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
    const { user, isAuthenticated, loading } = useAuth();
    const dashboardLink = user?.role === 'officer' ? '/officer-dashboard' : '/dashboard';


    return (
        <div className="min-h-screen bg-[#06140b] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a2916] via-[#06140b] to-[#040f08] text-slate-100 flex flex-col font-sans overflow-hidden">
            {/* Navbar Pattern */}
            <nav className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-8 py-5 border-b border-emerald-900/40 bg-black/20 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-sm">
                        <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-green-500 bg-clip-text text-transparent tracking-wide">
                        PoachGuard AI
                    </span>
                </div>
                <div className="flex items-center gap-3 md:gap-4 relative">
                    {loading ? (
                        <div className="w-40 h-10 bg-emerald-500/10 rounded-full animate-pulse blur-sm"></div>
                    ) : !isAuthenticated ? (
                        <>
                            <Link to="/login" className="px-5 py-2 text-sm font-medium text-emerald-300 hover:text-white transition-colors">
                                Sign In
                            </Link>
                            <Link to="/upload" className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)]">
                                Upload Image
                            </Link>
                        </>
                    ) : (
                        <Link to={dashboardLink} className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)]">
                            <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                        </Link>
                    )}
                </div>
            </nav>

            {/* Main Hero */}
            <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 text-center">
                {/* Glow Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md mb-8 animate-fade-in shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-300">Intelligent Detection Online</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 stagger-children max-w-4xl">
                    Automated <span className="bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">Poaching Detection</span> System
                </h1>

                <p className="text-lg md:text-xl text-emerald-50/70 mb-10 max-w-2xl mx-auto leading-relaxed stagger-children">
                    Protecting wildlife through advanced YOLOv8 surveillance. Upload field camera photos for real-time analysis, alerting authorities before it's too late.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 stagger-children">
                    <Link to="/upload" className="group flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold transition-all hover:scale-105 shadow-[0_0_30px_rgba(5,150,105,0.4)]">
                        <ImageIcon className="w-5 h-5" />
                        Upload Surveillance Image
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to={dashboardLink} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-semibold text-white backdrop-blur-md transition-all">
                        Open Dashboard
                    </Link>
                </div>

                {/* Feature Grid */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4 stagger-children">
                    {[
                        { title: "Real-time YOLOv8 Analysis", desc: "Instantly detect poachers, weapons, and vehicles with high accuracy using deep learning.", icon: <Activity className="w-6 h-6 text-emerald-400" /> },
                        { title: "Automated Alerts", desc: "Immediate email notifications to nearest forest stations when suspicious activity is flagged.", icon: <ShieldCheck className="w-6 h-6 text-emerald-400" /> },
                        { title: "Wildlife Monitoring", desc: "Track and catalog elephant and tiger movements to better understand migration patterns.", icon: <ImageIcon className="w-6 h-6 text-emerald-400" /> },
                    ].map((f, i) => (
                        <div key={i} className="glass-panel p-6 rounded-2xl text-left border border-white/10 hover:border-emerald-500/30 transition-colors card-hover">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                                {f.icon}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-emerald-100/60 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-8 text-center text-sm text-emerald-200/40 border-t border-white/5 mt-12 bg-black/40 backdrop-blur-md">
                © 2026 PoachGuard AI • Department of Forestry & Wildlife
            </footer>
        </div>
    );
}
