import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import { StatCard } from '../components/common/StatCard';
import { AlertBanner } from '../components/common/AlertBanner';
import { Button } from '../components/common/Button';
import { StatusBadge, ThreatBadge } from '../components/common/Badge';
import { LoadingRow } from '../components/common/Spinner';
import { useVideos } from '../hooks/useVideos';
import {
    ShieldCheck, AlertTriangle, ImageIcon, PawPrint,
    Upload, Eye, RefreshCw, Server, Crosshair, Activity, Clock
} from 'lucide-react';

export default function Dashboard() {
    const { videos, loading, error, hasProcessing, silentRefetch } = useVideos(15000);

    // ─── Computed Statistics ───────────────────────────────
    const stats = useMemo(() => {
        const totalVideos = videos.length;
        const totalPoachers = videos.reduce((sum, v) =>
            sum + (v.detections?.filter(d => d.detected_class?.toLowerCase() === 'poacher').length || 0), 0);
        const totalWeapons = videos.reduce((sum, v) =>
            sum + (v.detections?.filter(d => d.detected_class?.toLowerCase() === 'weapon').length || 0), 0);
        const totalAnimals = videos.reduce((sum, v) =>
            sum + (v.detections?.filter(d => {
                const c = d.detected_class?.toLowerCase();
                return c && !['poacher', 'weapon'].includes(c);
            }).length || 0), 0);
        const activeAlerts = videos.filter(v =>
            v.status === 'completed' &&
            v.detections?.some(d => {
                const c = d.detected_class?.toLowerCase();
                return c === 'poacher' || c === 'weapon';
            })
        ).length;

        return { totalVideos, totalPoachers, totalWeapons, totalAnimals, activeAlerts };
    }, [videos]);

    const recentVideos = useMemo(() =>
        [...videos].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)).slice(0, 10)
        , [videos]);

    // ─── Activity Feed ───────────────────────────────────
    const activityFeed = useMemo(() => {
        const feed = [];
        videos.forEach(v => {
            if (v.status === 'completed' && v.detections) {
                // Group detections by time for simplicity, or just map them directly
                v.detections.forEach((d, i) => {
                    const c = d.detected_class?.toLowerCase();
                    feed.push({
                        id: `${v._id || v.id}-${i}`,
                        time: new Date(v.uploaded_at),
                        class: c,
                        confidence: d.confidence,
                        video_id: v._id || v.id
                    });
                });
            }
        });
        return feed.sort((a, b) => b.time - a.time).slice(0, 8); // Last 8 events
    }, [videos]);

    // ─── Analytics Data (Last 7 Days) ────────────────────
    const chartData = useMemo(() => {
        const days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dateStr: d.toDateString(),
                threats: 0, // Poacher + Weapon
                animals: 0
            };
        });

        videos.forEach(v => {
            if (v.status !== 'completed' || !v.detections) return;
            const vDate = new Date(v.uploaded_at).toDateString();
            const dayMatch = days.find(d => d.dateStr === vDate);

            if (dayMatch) {
                v.detections.forEach(det => {
                    const c = det.detected_class?.toLowerCase();
                    if (c === 'poacher' || c === 'weapon') dayMatch.threats++;
                    else dayMatch.animals++;
                });
            }
        });
        return days;
    }, [videos]);


    // ─── Backend offline error ─────────────────────────────
    if (error === 'backend_offline') {
        return (
            <AppLayout title="Dashboard" subtitle="Real-time monitoring dashboard">
                <div className="p-8">
                    <AlertBanner
                        type="warning"
                        title="Backend Offline"
                        message="Cannot connect to analysis server. Ensure the backend is running on localhost:8000."
                    />
                    <div className="mt-6 flex items-center gap-3">
                        <Button onClick={silentRefetch} variant="outline">
                            <RefreshCw className="h-4 w-4" />
                            Retry Connection
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Dashboard"
            subtitle="Real-time surveillance analytics & threat monitoring"
            actions={
                <Button onClick={silentRefetch} variant="ghost" size="icon-sm" title="Refresh">
                    <RefreshCw className={`h-4 w-4 ${hasProcessing ? 'animate-spin text-amber-500' : ''}`} />
                </Button>
            }
        >
            <motion.div
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
                className="p-6 space-y-6"
            >
                {/* Critical alert banner when threats detected */}
                {stats.activeAlerts > 0 && (
                    <AlertBanner
                        type="critical"
                        title={`⚠ THREAT ALERT — ${stats.activeAlerts} incident${stats.activeAlerts > 1 ? 's' : ''} detected`}
                        message="High-confidence detections of poachers or weapons found. Immediate response recommended."
                        emailSent={true}
                        href="/detections?filter=poacher"
                    />
                )}

                {/* Processing banner */}
                {hasProcessing && (
                    <AlertBanner
                        type="info"
                        title="Analysis in progress"
                        message="One or more images are currently being processed by the detection model."
                    />
                )}

                {/* ─── Stat Cards ─────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                    <StatCard delay={0.1} title="Images Analyzed" value={stats.totalVideos} icon={ImageIcon} loading={loading} trend={hasProcessing ? 'Analysis running...' : 'All images scanned'} />
                    <StatCard delay={0.2} title="Poachers Detected" value={stats.totalPoachers} icon={Crosshair} variant={stats.totalPoachers > 0 ? 'critical' : 'default'} loading={loading} trend={stats.totalPoachers > 0 ? 'Immediate attention required' : 'No threats found'} />
                    <StatCard delay={0.3} title="Weapons Detected" value={stats.totalWeapons} icon={AlertTriangle} variant={stats.totalWeapons > 0 ? 'critical' : 'default'} loading={loading} trend={stats.totalWeapons > 0 ? 'Flagged for review' : 'Perimeter secure'} />
                    <StatCard delay={0.4} title="Animals Tracked" value={stats.totalAnimals} icon={PawPrint} variant="info" loading={loading} trend="Wildlife activity logged" />
                </div>

                {/* ─── Main Analytics Grid ────────────────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Activity Feed */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-panel rounded-xl p-5 flex flex-col h-[350px]">
                        <h2 className="text-sm font-semibold text-forest-300 uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-forest-800 pb-3">
                            <Clock className="h-4 w-4" /> Live Activity Feed
                        </h2>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            <AnimatePresence>
                                {activityFeed.length === 0 ? (
                                    <p className="text-xs text-forest-500 text-center py-8">No recent activity detected</p>
                                ) : (
                                    activityFeed.map((event, idx) => {
                                        const isThreat = event.class === 'poacher' || event.class === 'weapon';
                                        return (
                                            <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex gap-3 items-start"
                                            >
                                                <div className="flex flex-col items-center mt-1">
                                                    <div className={`h-2.5 w-2.5 rounded-full ${isThreat ? 'bg-alert-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-info-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'}`} />
                                                    {idx !== activityFeed.length - 1 && <div className="w-[1px] h-10 bg-forest-800/50 my-1" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="text-[10px] text-forest-500 font-mono">
                                                            {event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm tracking-wide ${isThreat ? 'text-alert-100 font-medium' : 'text-slate-300'}`}>
                                                        {event.class === 'poacher' ? 'Suspicious human detected' :
                                                            event.class === 'weapon' ? 'Weapon detected ➝ ALERT SENT' :
                                                                'Animal detected in sector'}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Detection Analytics Chart */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="xl:col-span-2 glass-panel rounded-xl p-5 flex flex-col h-[350px]">
                        <h2 className="text-sm font-semibold text-slate-200 mb-4 border-b border-forest-800 pb-3 flex justify-between items-center">
                            <span>Detection Frequency (Last 7 Days)</span>
                            <span className="text-[10px] bg-forest-800/50 text-forest-400 px-2 py-1 rounded">Live Data</span>
                        </h2>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorAnimals" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="name" stroke="#059669" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#059669" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#020617', borderColor: '#059669', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px' }}
                                        labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="animals" name="Animals" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorAnimals)" />
                                    <Area type="monotone" dataKey="threats" name="Threats (Poachers/Weapons)" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* ─── Recent Incident Logs Table ─────────────────── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-panel rounded-xl overflow-hidden mt-6">
                    <div className="px-5 py-4 border-b border-forest-800 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-200">Recent Surveillance Logs</h2>
                        <Link to="/detections" className="text-xs text-forest-400 hover:text-forest-300 transition-colors bg-forest-800/40 px-3 py-1.5 rounded-md border border-forest-700/50">
                            View All Operations →
                        </Link>
                    </div>

                    {loading ? (
                        <LoadingRow message="Decrypting incident logs..." />
                    ) : recentVideos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-forest-500">
                            <ShieldCheck className="h-10 w-10 mb-3 opacity-40" />
                            <p className="text-sm font-medium text-forest-300">Surveillance perimeter is clear</p>
                            <p className="text-xs mt-1">No images have been submitted for analysis yet.</p>
                            <Link to="/upload" className="mt-4">
                                <Button variant="outline" size="sm">
                                    <Upload className="h-3.5 w-3.5" />
                                    Upload First Image
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="font-medium text-xs text-forest-400 uppercase tracking-wider py-3 px-5 border-b border-forest-800">Feed Identifier</th>
                                        <th className="font-medium text-xs text-forest-400 uppercase tracking-wider py-3 px-5 border-b border-forest-800">Timestamp</th>
                                        <th className="font-medium text-xs text-forest-400 uppercase tracking-wider py-3 px-5 border-b border-forest-800">Status</th>
                                        <th className="font-medium text-xs text-forest-400 uppercase tracking-wider py-3 px-5 border-b border-forest-800">Classifications</th>
                                        <th className="font-medium text-xs text-forest-400 uppercase tracking-wider py-3 px-5 border-b border-forest-800 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentVideos.map((video) => {
                                        const hasCritical = video.detections?.some(d => {
                                            const c = d.detected_class?.toLowerCase();
                                            return c === 'poacher' || c === 'weapon';
                                        });
                                        const uniqueClasses = [...new Set(video.detections?.map(d => d.detected_class) || [])];

                                        return (
                                            <tr key={video._id || video.id} className={`hover:bg-forest-800/20 transition-colors ${hasCritical ? 'bg-alert-950/20' : ''}`}>
                                                <td className="py-3 px-5 border-b border-forest-800/50">
                                                    <div className="flex items-center gap-2">
                                                        {hasCritical && <span className="h-1.5 w-1.5 rounded-full bg-alert-500 animate-pulse shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                                                        <span className="truncate max-w-[150px] text-slate-200 font-mono text-sm">
                                                            {(video.filename || '').replace(/^[\w-]+_/, '')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-5 border-b border-forest-800/50 text-forest-300 text-sm">
                                                    {new Date(video.uploaded_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-3 px-5 border-b border-forest-800/50"><StatusBadge status={video.status} /></td>
                                                <td className="py-3 px-5 border-b border-forest-800/50">
                                                    {uniqueClasses.length > 0 ? (
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            {uniqueClasses.slice(0, 3).map(cls => <ThreatBadge key={cls} label={cls} />)}
                                                            {uniqueClasses.length > 3 && <span className="badge badge-gray">+{uniqueClasses.length - 3}</span>}
                                                        </div>
                                                    ) : <span className="text-xs text-forest-600 italic">Clear</span>}
                                                </td>
                                                <td className="py-3 px-5 border-b border-forest-800/50 text-right">
                                                    <Link to={`/detections/${video._id || video.id}`} className="inline-flex items-center justify-center p-2 rounded-lg text-forest-400 hover:text-white hover:bg-forest-700/50 transition-colors">
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}
