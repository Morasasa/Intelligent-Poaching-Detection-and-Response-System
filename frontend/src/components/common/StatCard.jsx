import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { cn } from './Input';

function AnimatedCounter({ from = 0, to }) {
    const [count, setCount] = useState(from);

    useEffect(() => {
        const controls = animate(from, to, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate(value) {
                setCount(Math.round(value));
            }
        });
        return controls.stop;
    }, [from, to]);

    return <>{count}</>;
}

/**
 * StatCard - Dashboard summary card component with animations.
 */
export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    variant = 'default',
    loading = false,
    className,
    delay = 0,
}) {
    const variants = {
        default: {
            card: 'glass-panel',
            icon: 'bg-forest-800/80 text-forest-400 border-forest-700/50',
            text: 'text-slate-100'
        },
        critical: {
            card: 'bg-alert-950/30 border border-alert-800/50 backdrop-blur-md',
            icon: 'bg-alert-900/60 text-alert-400 border-alert-700/50 animate-pulse',
            text: 'text-alert-400'
        },
        warning: {
            card: 'bg-amber-950/30 border border-amber-800/50 backdrop-blur-md',
            icon: 'bg-amber-900/60 text-amber-400 border-amber-700/50',
            text: 'text-amber-400'
        },
        info: {
            card: 'bg-info-950/30 border border-info-800/50 backdrop-blur-md',
            icon: 'bg-info-900/60 text-info-400 border-info-700/50',
            text: 'text-info-400'
        },
    };

    const { card, icon, text } = variants[variant] || variants.default;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={cn('stat-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow', card, className)}
        >
            <div className="flex items-start gap-4">
                <div className={cn('p-3 rounded-xl border shrink-0', icon)}>
                    {Icon && <Icon className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-forest-400 truncate">{title}</p>
                    {loading ? (
                        <div className="mt-2 h-8 w-16 skeleton rounded" />
                    ) : (
                        <p className={cn('mt-1 text-3xl font-bold tracking-tight', text)}>
                            {typeof value === 'number' ? <AnimatedCounter to={value} /> : (value ?? '—')}
                        </p>
                    )}
                    {trend && (
                        <p className="text-xs text-forest-400 mt-1">{trend}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
