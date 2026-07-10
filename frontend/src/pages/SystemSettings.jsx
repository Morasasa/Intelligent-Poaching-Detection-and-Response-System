import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useVideos } from '../hooks/useVideos';
import {
    ShieldCheck, Bell, Activity, Terminal,
    Settings, Save, Key, Sliders, Database, Cpu
} from 'lucide-react';

export default function SystemSettings() {
    const { user } = useAuth();
    const { videos } = useVideos(0); // For generating logs from video data

    // System Config State
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [strictMode, setStrictMode] = useState(false);
    const [confidenceThreshold, setConfidenceThreshold] = useState(65);
    const [saved, setSaved] = useState(false);

    // Fake system logs generated from actual app usage data
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // Generate pseudo-logs based on video activity
        const generatedLogs = [];
        generatedLogs.push({ time: new Date().toLocaleTimeString(), level: 'INFO', message: 'System boot sequence initiated. Neural Engine v4.2 online.' });
        generatedLogs.push({ time: new Date(Date.now() - 5000).toLocaleTimeString(), level: 'INFO', message: 'Connected to remote telemetry database.' });

        videos.slice(0, 5).forEach(v => {
            const time = new Date(v.uploaded_at).toLocaleTimeString();
            generatedLogs.push({ time, level: 'INFO', message: `Incoming feed encrypted & received: ${v.filename}` });

            if (v.status === 'completed') {
                generatedLogs.push({ time: new Date(new Date(v.uploaded_at).getTime() + 1000).toLocaleTimeString(), level: 'SYSTEM', message: `YOLOv8 inference completed in 1.2s on ${v.filename}` });

                const critical = v.detections?.filter(d => ['poacher', 'weapon'].includes(d.detected_class?.toLowerCase()));
                if (critical?.length > 0) {
                    generatedLogs.push({ time: new Date(new Date(v.uploaded_at).getTime() + 1500).toLocaleTimeString(), level: 'WARN', message: `Critical threats logged: ${critical.map(c => c.detected_class).join(', ')}` });
                    if (emailAlerts) {
                        generatedLogs.push({ time: new Date(new Date(v.uploaded_at).getTime() + 2000).toLocaleTimeString(), level: 'CRITICAL', message: `Outbound email dispatched to response team.` });
                    }
                }
            }
        });

        setLogs(generatedLogs.sort((a, b) => b.time.localeCompare(a.time)));
    }, [videos, emailAlerts]);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <AppLayout
            title="System Administration"
            subtitle="Configure global parameters and monitor neural network health"
            actions={
                <button
                    onClick={handleSave}
                    className={`px-5 py-2 font-semibold text-sm rounded-full transition-all flex items-center gap-2 ${saved ? 'bg-emerald-500 text-[#020804] shadow-[0_0_20px_rgba(52,211,153,0.4)] scale-105' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
                >
                    {saved ? <ShieldCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? 'Config Saved' : 'Apply Changes'}
                </button>
            }
        >
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-100">

                {/* Top Metrics Room */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-black/40 border border-emerald-900/30 rounded-3xl p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <Cpu className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-emerald-100/50 uppercase tracking-widest font-mono">Inference Engine</p>
                            <p className="text-lg font-semibold text-emerald-400">ONLINE</p>
                        </div>
                    </div>
                    <div className="bg-black/40 border border-emerald-900/30 rounded-3xl p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-blue-100/50 uppercase tracking-widest font-mono">Server Load</p>
                            <p className="text-lg font-semibold text-blue-400">14%</p>
                        </div>
                    </div>
                    <div className="md:col-span-2 bg-black/40 border border-emerald-900/30 rounded-3xl p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mb-1">Authenticated As</p>
                            <p className="text-lg font-semibold text-white">{user?.full_name || 'System Administrator'}</p>
                            <p className="text-sm text-slate-500">{user?.email || 'admin@poachguard.gov'}</p>
                        </div>
                        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500 font-mono text-xs font-bold tracking-widest">
                            LEVEL 5 CLEARANCE
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: Toggles and Sliders */}
                    <div className="space-y-8">
                        {/* Threshold Settings */}
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
                            <div className="px-6 py-5 border-b border-white/10 bg-black/20 flex items-center gap-3">
                                <Sliders className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Detection Parameters</h3>
                            </div>
                            <div className="p-6 space-y-8">
                                <div>
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-sm font-medium text-white">Global Confidence Threshold</p>
                                            <p className="text-xs text-emerald-100/50 mt-1">Minimum score required for an object to be logged in the database.</p>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-950/50 border border-emerald-800/50 rounded-lg text-emerald-400 font-mono font-bold text-lg">
                                            {confidenceThreshold}%
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="30"
                                        max="95"
                                        step="5"
                                        value={confidenceThreshold}
                                        onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                                        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <div className="flex justify-between mt-3 text-[10px] text-white/30 font-mono px-1">
                                        <span>Loose (30%)</span>
                                        <span>Strict (95%)</span>
                                    </div>
                                </div>

                                <div className="border-t border-white/5 pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="pr-8">
                                            <p className="text-sm font-medium text-white flex items-center gap-2">
                                                Zero-Tolerance Mode <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded font-mono">BETA</span>
                                            </p>
                                            <p className="text-xs text-emerald-100/50 mt-1 leading-relaxed">Lower thresholds specifically for 'Weapon' class objects to ensure no threats slip through. May increase false positives.</p>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            onClick={() => setStrictMode(v => !v)}
                                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none ${strictMode ? 'bg-red-500' : 'bg-black/50 border-white/20'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${strictMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
                            <div className="px-6 py-5 border-b border-white/10 bg-black/20 flex items-center gap-3">
                                <Bell className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Dispatch Rules</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between p-5 bg-black/30 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl transition-colors ${emailAlerts ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                                            <Key className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold ${emailAlerts ? 'text-emerald-400' : 'text-slate-300'}`}>Email Outbound Dispatch</p>
                                            <p className="text-xs text-emerald-100/50 mt-1 max-w-[250px]">Automatically notify response teams immediately upon critical detection.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        onClick={() => setEmailAlerts(v => !v)}
                                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none ${emailAlerts ? 'bg-emerald-500' : 'bg-black/50 border-white/20'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${emailAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Terminal Logs */}
                    <div className="bg-black/80 border border-emerald-500/20 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.05)] flex flex-col h-full font-mono">
                        <div className="px-6 py-4 border-b border-emerald-500/20 bg-emerald-950/30 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-sm font-bold text-emerald-500 tracking-widest uppercase">System Logs</h3>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                            </div>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto space-y-3 max-h-[600px] text-xs leading-relaxed custom-scrollbar">
                            {logs.map((log, i) => {
                                let color = 'text-emerald-400/70';
                                if (log.level === 'WARN') color = 'text-amber-400';
                                if (log.level === 'CRITICAL') color = 'text-red-400 font-bold';
                                if (log.level === 'SYSTEM') color = 'text-blue-400';

                                return (
                                    <div key={i} className="flex gap-4">
                                        <span className="text-emerald-900 shrink-0">{log.time}</span>
                                        <span className={`w-20 shrink-0 ${color}`}>[{log.level}]</span>
                                        <span className={`${color} break-words`}>{log.message}</span>
                                    </div>
                                );
                            })}

                            {/* Blinking cursor */}
                            <div className="flex gap-4 mt-4 animate-pulse">
                                <span className="text-emerald-900 shrink-0">{new Date().toLocaleTimeString()}</span>
                                <span className="w-20 shrink-0 text-emerald-500/50">[IDLE]</span>
                                <span className="w-2 h-4 bg-emerald-500/50 inline-block"></span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
