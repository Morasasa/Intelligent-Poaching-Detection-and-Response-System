import React from 'react';
import { AlertTriangle, Shield, Info, X, Mail } from 'lucide-react';

import { Link } from 'react-router-dom';

/**
 * AlertBanner - Displays contextual alerts for detection results.
 * type: 'critical' | 'warning' | 'info' | 'success'
 */
export function AlertBanner({ type = 'info', title, message, emailSent, onDismiss, className = '', href }) {
    const config = {
        critical: {
            wrapper: 'bg-alert-950/60 border-2 border-alert-500 rounded-xl p-5 flex items-start gap-4 shadow-[0_0_30px_rgba(239,68,68,0.4)] relative overflow-hidden',
            icon: <div className="p-2 bg-alert-500/20 rounded-full animate-pulse"><AlertTriangle className="h-8 w-8 text-alert-500 shrink-0" /></div>,
            titleClass: 'text-white font-black tracking-widest text-lg uppercase drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]',
            msgClass: 'text-alert-100/90 font-medium text-sm mt-1',
        },
        warning: {
            wrapper: 'alert-banner-warning',
            icon: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />,
            titleClass: 'text-amber-300 font-semibold',
            msgClass: 'text-amber-200/80',
        },
        info: {
            wrapper: 'alert-banner-info',
            icon: <Info className="h-5 w-5 text-info-400 shrink-0 mt-0.5" />,
            titleClass: 'text-info-300 font-semibold',
            msgClass: 'text-info-200/80',
        },
        success: {
            wrapper: 'bg-forest-950/90 border border-forest-700/70 text-forest-100 rounded-lg p-4 flex items-start gap-3',
            icon: <Shield className="h-5 w-5 text-forest-400 shrink-0 mt-0.5" />,
            titleClass: 'text-forest-300 font-semibold',
            msgClass: 'text-forest-200/80',
        },
    };

    const { wrapper, icon, titleClass, msgClass } = config[type] || config.info;

    const bannerClasses = `${wrapper} ${className} animate-slide-up ${href ? 'cursor-pointer hover:scale-[1.01] transition-transform duration-200' : ''}`;

    const content = (
        <>
            {icon}
            <div className="flex-1 min-w-0">
                {title && <p className={`text-sm ${titleClass}`}>{title}</p>}
                {message && <p className={`text-xs mt-0.5 ${msgClass}`}>{message}</p>}
                {emailSent && (
                    <p className="flex items-center gap-1.5 text-xs mt-2 text-forest-400">
                        <Mail className="h-3 w-3" />
                        Alert notification dispatched to response team.
                    </p>
                )}
            </div>
        </>
    );

    if (href) {
        return (
            <Link to={href} className="block w-full">
                <div className={bannerClasses}>
                    {content}
                </div>
            </Link>
        );
    }

    return (
        <div className={bannerClasses}>
            {content}
        </div>
    );
}
