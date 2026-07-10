import { useState, useEffect, useMemo } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '../components/common/Button';
import { ThreatBadge } from '../components/common/Badge';
import { alertService } from '../api/services';
import { Link } from 'react-router-dom';
import {
    Bell, CheckCircle2, Eye, RefreshCw, Trash2,
    AlertTriangle, Shield, SlidersHorizontal, Search, Target, ShieldCheck
} from 'lucide-react';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dismissed, setDismissed] = useState(new Set());

    // Filters
    const [selectedClasses, setSelectedClasses] = useState(['poacher', 'weapon']);

    const toggleClass = (cls) => {
        setSelectedClasses(prev =>
            prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
        );
    };

    const fetchAlerts = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const res = await alertService.list();
            setAlerts(res.data || []);
        } catch (err) {
            console.error('Failed to fetch alerts:', err);
            if (err.code === 'ERR_NETWORK') {
                setError('backend_offline');
            } else {
                setError('fetch_failed');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(() => fetchAlerts(true), 15000);
        return () => clearInterval(interval);
    }, []);

    const handleResolve = async (alertId) => {
        try {
            await alertService.resolve(alertId);
            setAlerts(prev => prev.map(a => a.alert_id === alertId ? { ...a, status: 'resolved' } : a));
        } catch (err) {
            console.error('Failed to resolve alert:', err);
        }
    };

    const allEvents = useMemo(() => {
        return alerts
            .filter(a => selectedClasses.includes(a.alert_type?.toLowerCase()))
            .filter(a => !dismissed.has(a.alert_id))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [alerts, selectedClasses, dismissed]);

    const criticalCount = allEvents.filter(e => e.status !== 'resolved').length;
    const resolvedCount = allEvents.filter(e => e.status === 'resolved').length;

    const handleDismiss = (id) => setDismissed(prev => new Set(prev).add(id));

    const handleDelete = (id) => {
        setAlerts(prev => prev.filter(a => a.alert_id !== id));
    };

    return (
        <AppLayout
            title="Threat Dispatch Center"
            subtitle="Real-time telemetry and aggregated alert dashboard"
            actions={
                <button onClick={() => fetchAlerts(true)} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-emerald-400 transition-colors">
                    <RefreshCw className="h-5 w-5" />
                </button>
            }
        >
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-100">

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <AlertTriangle className="w-24 h-24 text-red-500" />
                        </div>
                        <p className="text-red-400 font-mono text-xs mb-2 tracking-widest uppercase relative z-10">Active Incidents</p>
                        <p className="text-4xl font-bold text-white relative z-10">{criticalCount}</p>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                        </div>
                        <p className="text-emerald-400 font-mono text-xs mb-2 tracking-widest uppercase relative z-10">Resolved</p>
                        <p className="text-4xl font-bold text-white relative z-10">{resolvedCount}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Bell className="w-24 h-24 text-white" />
                        </div>
                        <p className="text-emerald-100/50 font-mono text-xs mb-2 tracking-widest uppercase relative z-10">Total Alerts</p>
                        <p className="text-4xl font-bold text-white relative z-10">{allEvents.length}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Filter Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 sticky top-6 hover:border-emerald-500/30 transition-colors">
                            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-6 uppercase tracking-wider">
                                <SlidersHorizontal className="h-4 w-4" />
                                Telemetry Filters
                            </h3>

                            {/* Class Filters */}
                            <div className="space-y-3 mb-4">
                                <p className="text-xs text-white/40 font-mono tracking-widest uppercase mb-4">Threat Classes</p>
                                {[
                                    { id: 'poacher', label: 'Poacher', color: 'text-red-400', border: 'border-red-500/30 ring-red-500' },
                                    { id: 'weapon', label: 'Weapons', color: 'text-orange-400', border: 'border-orange-500/30 ring-orange-500' },
                                ].map(cls => {
                                    const active = selectedClasses.includes(cls.id);
                                    return (
                                        <button
                                            key={cls.id}
                                            onClick={() => toggleClass(cls.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${active ? `bg-white/10 ${cls.border} ring-1` : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                                        >
                                            <span className={`text-sm font-medium ${active ? cls.color : 'text-slate-300'}`}>{cls.label}</span>
                                            {active && <CheckCircle2 className={`h-4 w-4 ${cls.color}`} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Event List */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden min-h-[500px]">
                            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-black/20">
                                <h3 className="text-sm font-semibold text-white tracking-widest uppercase flex items-center gap-2">
                                    <Search className="w-4 h-4 text-emerald-400" /> Alert Logs
                                </h3>
                                <span className="text-xs text-emerald-500/50 font-mono">{allEvents.length} records found</span>
                            </div>

                            <div className="p-6">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-20 bg-white/5 border border-white/5 rounded-2xl animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-red-400/70">
                                        <AlertTriangle className="h-16 w-16 mb-6 opacity-40" />
                                        <p className="text-lg font-medium text-red-100/70 mb-2">Connection Error</p>
                                        <p className="text-sm">Unable to fetch alerts. Check backend status.</p>
                                    </div>
                                ) : allEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-emerald-500/50">
                                        <Shield className="h-16 w-16 mb-6 opacity-20" />
                                        <p className="text-lg font-medium text-emerald-100/70 mb-2">No Active Alerts</p>
                                        <p className="text-sm">Adjust filters or await new surveillance data.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {allEvents.map(alert => {
                                            const isActive = alert.status !== 'resolved';
                                            const isCritical = ['poacher', 'weapon'].includes(alert.alert_type?.toLowerCase());
                                            return (
                                                <div
                                                    key={alert.alert_id}
                                                    className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all hover:-translate-y-1 ${isCritical && isActive ? 'bg-red-500/10 border-red-500/30 hover:shadow-[0_10px_30px_rgba(239,68,68,0.1)]' : isActive ? 'bg-orange-500/5 border-orange-500/20' : 'bg-black/40 border-white/5 hover:border-emerald-500/30 hover:shadow-[0_10px_30px_rgba(52,211,153,0.05)]'}`}
                                                >
                                                    {/* Left Info */}
                                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                                        <div className={`p-3 rounded-xl shrink-0 ${isCritical && isActive ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                            {isCritical ? <AlertTriangle className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex gap-2 items-center mb-1">
                                                                <ThreatBadge label={alert.alert_type} />
                                                                <span className={`text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${alert.status === 'resolved' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-900/30' : 'border-red-500/30 text-red-400 bg-red-900/30'}`}>
                                                                    {alert.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-medium text-white">Alert #{alert.alert_id?.split('-')[0]}</p>
                                                            <p className="text-xs text-emerald-100/40 font-mono mt-1">
                                                                {new Date(alert.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                {' • '}{alert.officer_email}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {isActive && (
                                                            <button
                                                                onClick={() => handleResolve(alert.alert_id)}
                                                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all border border-emerald-500/20 hover:border-emerald-500/50"
                                                                title="Mark Resolved"
                                                            >
                                                                <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => handleDelete(alert.alert_id)}
                                                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all border border-red-500/20 hover:border-red-500/50"
                                                            title="Delete Alert"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
