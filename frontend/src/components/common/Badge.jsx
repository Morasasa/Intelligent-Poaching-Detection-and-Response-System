import React from 'react';
import { cn } from './Input';

/**
 * Badge component for detection type labels, status chips etc.
 * variant: 'red' | 'amber' | 'green' | 'blue' | 'gray' | 'outline'
 */
export function Badge({ children, variant = 'gray', className, ...props }) {
    const variants = {
        red: 'badge-red',
        amber: 'badge-amber',
        green: 'badge-green',
        blue: 'badge-blue',
        gray: 'badge-gray',
        outline: 'badge border-forest-700/50 text-forest-300 bg-transparent',
    };

    return (
        <span
            className={cn('badge', variants[variant] || variants.gray, className)}
            {...props}
        >
            {children}
        </span>
    );
}

/**
 * StatusBadge for video processing status.
 * status: 'processing' | 'completed' | 'failed' | 'queued'
 */
export function StatusBadge({ status }) {
    const config = {
        completed: {
            label: 'Scanned',
            variant: 'green',
            dot: 'bg-forest-400',
        },
        processing: {
            label: 'Analyzing',
            variant: 'amber',
            dot: 'bg-amber-400 animate-ping',
        },
        failed: {
            label: 'Failed',
            variant: 'red',
            dot: 'bg-alert-500',
        },
        queued: {
            label: 'Queued',
            variant: 'gray',
            dot: 'bg-charcoal-400',
        },
    };

    const { label, variant, dot } = config[status] || config.queued;

    return (
        <Badge variant={variant} className="gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {label}
        </Badge>
    );
}

/**
 * ThreatBadge for detection class labels.
 */
export function ThreatBadge({ label }) {
    const normalized = label?.toLowerCase() || '';
    
    const displayLabel = normalized === 'weapon' ? 'Weapons' :
                         normalized === 'animal' ? 'Animal' :
                         normalized === 'ranger' ? 'Ranger' :
                         normalized === 'poacher' ? 'poacher' : label;

    const isCritical = normalized === 'poacher' || normalized === 'weapon';
    const isAnimal = normalized === 'animal';

    if (isCritical) {
        return (
            <Badge variant="red" className="font-semibold text-[10px] tracking-wider">
                ⚠ {displayLabel}
            </Badge>
        );
    }
    if (isAnimal) {
        return (
            <Badge variant="green">{displayLabel}</Badge>
        );
    }
    return <Badge variant="blue">{displayLabel}</Badge>;
}
