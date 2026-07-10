import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, Shield } from 'lucide-react';

// ─── Pub/Sub Store ─────────────────────────────────────────
const listeners = new Set();
let toastList = [];

export const toast = {
    add: (message, type = 'info', duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const entry = { id, message, type };
        toastList = [entry, ...toastList].slice(0, 4); // max 4 toasts
        listeners.forEach(fn => fn([...toastList]));

        if (duration && duration > 0) {
            setTimeout(() => toast.dismiss(id), duration);
        }
        return id;
    },
    success: (msg, duration = 5000) => toast.add(msg, 'success', duration),
    error: (msg, duration = 6000) => toast.add(msg, 'error', duration),
    warning: (msg, duration = 5000) => toast.add(msg, 'warning', duration),
    info: (msg, duration = 4000) => toast.add(msg, 'info', duration),
    dismiss: (id) => {
        toastList = toastList.filter(t => t.id !== id);
        listeners.forEach(fn => fn([...toastList]));
    },
    dismissAll: () => {
        toastList = [];
        listeners.forEach(fn => fn([]));
    },
};

const typeConfig = {
    error: {
        icon: <AlertTriangle className="h-4 w-4" />,
        bar: 'bg-alert-500',
        iconClass: 'text-alert-400',
    },
    success: {
        icon: <CheckCircle2 className="h-4 w-4" />,
        bar: 'bg-forest-400',
        iconClass: 'text-forest-400',
    },
    warning: {
        icon: <AlertTriangle className="h-4 w-4" />,
        bar: 'bg-amber-500',
        iconClass: 'text-amber-400',
    },
    info: {
        icon: <Info className="h-4 w-4" />,
        bar: 'bg-info-400',
        iconClass: 'text-info-400',
    },
};

// ─── Toast Container ───────────────────────────────────────
export function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handler = (updated) => setToasts(updated);
        listeners.add(handler);
        return () => listeners.delete(handler);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
            aria-live="polite"
            aria-label="Notifications"
        >
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onDismiss={() => toast.dismiss(t.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast: t, onDismiss }) {
    const cfg = typeConfig[t.type] || typeConfig.info;

    return (
        <div className="pointer-events-auto glass-panel-dark rounded-lg overflow-hidden border border-forest-700/60 shadow-panel flex animate-slide-in-right">
            <div className={`w-1 shrink-0 ${cfg.bar}`} />
            <div className="flex flex-1 items-start gap-3 p-3 bg-forest-950/90">
                <span className={`shrink-0 mt-0.5 ${cfg.iconClass}`}>{cfg.icon}</span>
                <p className="text-sm text-slate-200 flex-1 leading-snug">{t.message}</p>
                <button
                    onClick={onDismiss}
                    className="shrink-0 text-forest-500 hover:text-slate-200 transition-colors p-0.5 rounded mt-0.5"
                    aria-label="Dismiss notification"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
