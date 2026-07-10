import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import { StatCard } from '../components/common/StatCard';
import { AlertBanner } from '../components/common/AlertBanner';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { LoadingRow } from '../components/common/Spinner';
import { alertService } from '../api/services';
import {
    ShieldAlert, AlertTriangle, Crosshair, 
    RefreshCw, Eye, CheckCircle2
} from 'lucide-react';

export default function OfficerDashboard() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchAlerts = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        setError(null);
        try {
            const res = await alertService.list();
            setAlerts(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch alerts. Please ensure your session is active.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
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
            setAlerts(alerts.map(a => a.alert_id === alertId ? { ...a, status: 'resolved' } : a));
        } catch (err) {
            console.error('Failed to resolve alert', err);
        }
    };

    const stats = useMemo(() => {
        const totalAlertsToday = alerts.filter(a => {
            const today = new Date();
            const alertDate = new Date(a.created_at);
            return alertDate.toDateString() === today.toDateString();
        }).length;
        
        const poachers = alerts.filter(a => a.alert_type === 'poacher').length;
        const weapons = alerts.filter(a => a.alert_type === 'weapon').length;
        const activeAlerts = alerts.filter(a => a.status !== 'resolved').length;

        return { totalAlertsToday, poachers, weapons, activeAlerts };
    }, [alerts]);

    return (
        <AppLayout
            title="Officer Command Center"
            subtitle="Critical threat response & active alert management"
            actions={
                <Button onClick={() => fetchAlerts(true)} variant="ghost" size="icon-sm" title="Refresh">
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
                </Button>
            }
        >
            <motion.div
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
                className="p-6 space-y-6"
            >
                {/* Critical alert banner */}
                {stats.activeAlerts > 0 && (
                    <AlertBanner
                        type="critical"
                        title={`⚠ CRITICAL DISPATCH — ${stats.activeAlerts} unresolved incident${stats.activeAlerts > 1 ? 's' : ''}`}
                        message="Please review and resolve Active Threats immediately in the console below."
                    />
                )}

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                    <StatCard delay={0.1} title="Alerts Today" value={stats.totalAlertsToday} icon={ShieldAlert} loading={loading} trend={stats.totalAlertsToday > 0 ? 'Elevated threat level' : 'Normal perimeter'} />
                    <StatCard delay={0.2} title="Active Threats" value={stats.activeAlerts} icon={RefreshCw} variant={stats.activeAlerts > 0 ? 'critical' : 'info'} loading={loading} trend={stats.activeAlerts > 0 ? 'Awaiting resolution' : 'All clear'} />
                    <StatCard delay={0.3} title="Total Poachers" value={stats.poachers} icon={Crosshair} variant="default" loading={loading} trend="Historical DB" />
                    <StatCard delay={0.4} title="Total Weapons" value={stats.weapons} icon={AlertTriangle} variant="default" loading={loading} trend="Historical DB" />
                </div>

                {/* Alerts Table */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel rounded-xl overflow-hidden mt-6">
                    <div className="px-5 py-4 border-b border-forest-800 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-200">Actionable Threat Intelligence</h2>
                    </div>

                    {loading && alerts.length === 0 ? (
                        <LoadingRow message="Syncing alert database..." />
                    ) : alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-forest-500">
                            <ShieldAlert className="h-10 w-10 mb-3 opacity-40" />
                            <p className="text-sm font-medium text-forest-300">No active incidents</p>
                            <p className="text-xs mt-1">Perimeter is secure.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="font-medium text-xs text-forest-400 uppercase tracking-wider py-3 px-5 border-b border-forest-800">Alert ID</th>
                                        <th className="font-medium text-xs text-forest-400 uppercase tracking-wider py-3 px-5 border-b border-forest-800">Threat Type</th>
                                        <th className="font-medium text-xs text-forest-400 uppercase tracking-wider py-3 px-5 border-b border-forest-800">Timestamp</th>
                                        <th className="font-medium text-xs text-forest-400 uppercase tracking-wider py-3 px-5 border-b border-forest-800">Status</th>
                                        <th className="font-medium text-xs text-forest-400 uppercase tracking-wider py-3 px-5 border-b border-forest-800 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {alerts.map((alert) => {
                                            const isActive = alert.status !== 'resolved';
                                            return (
                                                <motion.tr 
                                                    key={alert.alert_id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className={`hover:bg-forest-800/20 transition-colors ${isActive ? 'bg-alert-950/20' : ''}`}
                                                >
                                                    <td className="py-3 px-5 border-b border-forest-800/50">
                                                        <div className="flex items-center gap-2">
                                                            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-alert-500 animate-pulse shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                                                            <span className="truncate max-w-[120px] text-slate-200 font-mono text-sm">
                                                                {alert.alert_id.split('-')[0]}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-5 border-b border-forest-800/50">
                                                        <span className={`badge ${alert.alert_type === 'weapon' ? 'badge-critical' : 'badge-warning'} uppercase`}>
                                                            {alert.alert_type}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-5 border-b border-forest-800/50 text-forest-300 text-sm">
                                                        {new Date(alert.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="py-3 px-5 border-b border-forest-800/50">
                                                        <span className={`text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${alert.status === 'resolved' ? 'border-forest-500/30 text-forest-400 bg-forest-900/30' : 'border-alert-500/30 text-alert-400 bg-alert-900/30'}`}>
                                                            {alert.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-5 border-b border-forest-800/50 text-right space-x-2">
                                                        {isActive && (
                                                            <button 
                                                                onClick={() => handleResolve(alert.alert_id)} 
                                                                className="inline-flex items-center justify-center p-2 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-700/50 transition-colors title='Mark Resolved'"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}
