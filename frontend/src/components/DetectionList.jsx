import React from 'react';
import { Play, CheckCircle2, Clock, AlertTriangle, Crosshair, ShieldAlert } from 'lucide-react';

export default function DetectionList({ videos, loading }) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-forest-400">
                <div className="h-8 w-8 border-4 border-forest-700 border-t-forest-400 rounded-full animate-spin mb-4" />
                <p>Decrypting incident logs...</p>
            </div>
        );
    }

    if (!videos || videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-forest-500 bg-forest-900/20">
                <ShieldAlert className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium text-forest-300">No Incidents Detected</p>
                <p className="text-sm mt-1">Surveillance perimeter is secure.</p>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-900/50 px-2 py-1 text-xs font-medium text-forest-300 border border-forest-800">
                        <CheckCircle2 className="h-3 w-3" /> Scanned
                    </span>
                );
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-500 border border-yellow-800/50">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-ping" /> Analyzing
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/50 px-2 py-1 text-xs font-medium text-slate-400 border border-slate-800">
                        <Clock className="h-3 w-3" /> Queued
                    </span>
                );
        }
    };

    const getDetectionBadge = (detClass) => {
        const isCritical = detClass.toLowerCase() === 'poacher' || detClass.toLowerCase() === 'weapon';
        if (isCritical) {
            return (
                <span key={detClass} className="inline-flex items-center gap-1 rounded bg-alert-900/80 px-2 py-0.5 text-xs font-semibold text-alert-100 border border-alert-600/50 shadow-[0_0_10px_rgba(225,29,72,0.3)]">
                    <Crosshair className="h-3 w-3" /> {detClass.toUpperCase()}
                </span>
            );
        }
        return (
            <span key={detClass} className="inline-flex items-center gap-1 rounded bg-forest-800 px-2 py-0.5 text-xs font-medium text-slate-200 border border-forest-700 hover:bg-forest-700 transition">
                {detClass}
            </span>
        );
    };

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-forest-800/50 text-xs uppercase tracking-wider text-forest-400 bg-forest-900/30">
                        <th className="px-6 py-4 font-semibold">Feed ID</th>
                        <th className="px-6 py-4 font-semibold">Timestamp</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Detections</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-forest-800/30">
                    {videos.map((video) => {
                        const hasCritical = video.detections?.some(d =>
                            d.detected_class.toLowerCase() === 'poacher' ||
                            d.detected_class.toLowerCase() === 'weapon'
                        );

                        return (
                            <tr
                                key={video._id || video.id}
                                className={`transition-colors hover:bg-forest-900/40 group ${hasCritical ? 'bg-alert-950/10' : ''}`}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${hasCritical ? 'bg-alert-900/30 text-alert-500' : 'bg-forest-800/50 text-forest-400'}`}>
                                            <Play className="h-4 w-4" fill="currentColor" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-200 truncate max-w-[150px]">
                                            {video.filename.replace(/^[\w-]+_/, '')}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-forest-300">
                                        {new Date(video.uploaded_at).toLocaleString(undefined, {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(video.status)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {video.detections && video.detections.length > 0 ? (
                                        <div className="flex gap-2 justify-end flex-wrap max-w-[200px] ml-auto">
                                            {video.detections.map((d, i) => getDetectionBadge(d.detected_class))}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-forest-500 italic">Clear</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
