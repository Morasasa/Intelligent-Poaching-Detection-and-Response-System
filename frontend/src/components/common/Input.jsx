import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Input component with optional left icon and error state.
 */
export const Input = React.forwardRef(
    ({ className, type, icon: Icon, error, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {Icon && (
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-forest-500">
                        <Icon className="h-4 w-4" />
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-10 w-full rounded-md border bg-forest-900/50 px-3 py-2 text-sm text-slate-100',
                        'placeholder:text-forest-500',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:border-transparent',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'transition-all duration-150',
                        error
                            ? 'border-alert-600/70 focus-visible:ring-alert-500 bg-alert-950/20'
                            : 'border-forest-700/50 hover:border-forest-600/70',
                        Icon && 'pl-9',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-xs text-alert-400">{error}</p>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';
