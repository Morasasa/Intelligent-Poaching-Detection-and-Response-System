import React from 'react';
import { cn } from './Input';
import { Loader2 } from 'lucide-react';

/**
 * Button component with multiple variants, sizes, and loading state.
 */
export const Button = React.forwardRef(
    ({ className, variant = 'default', size = 'default', loading = false, children, disabled, ...props }, ref) => {
        const baseStyles = [
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
            'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950',
            'disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
        ].join(' ');

        const variants = {
            default: 'bg-forest-500 text-white hover:bg-forest-600 active:bg-forest-700 shadow-sm hover:shadow-glow-green',
            outline: 'border border-forest-700 bg-transparent hover:bg-forest-800/60 hover:border-forest-600 text-slate-200',
            ghost: 'hover:bg-forest-800/50 text-slate-300 hover:text-white',
            danger: 'bg-alert-600 text-white hover:bg-alert-700 active:bg-alert-800 shadow-sm hover:shadow-glow-red',
            'danger-outline': 'border border-alert-700/60 bg-transparent hover:bg-alert-900/40 text-alert-400 hover:text-alert-300',
            amber: 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 shadow-sm',
            'amber-outline': 'border border-amber-700/60 bg-transparent hover:bg-amber-900/30 text-amber-400 hover:text-amber-300',
            secondary: 'bg-forest-800 text-slate-200 hover:bg-forest-700 border border-forest-700 shadow-sm',
        };

        const sizes = {
            xs: 'h-7 px-2.5 text-xs rounded',
            sm: 'h-8 px-3 text-xs',
            default: 'h-10 px-4 py-2',
            lg: 'h-11 px-6 text-base',
            xl: 'h-12 px-8 text-base font-semibold',
            icon: 'h-10 w-10 p-0',
            'icon-sm': 'h-8 w-8 p-0',
        };

        return (
            <button
                className={cn(baseStyles, variants[variant] || variants.default, sizes[size] || sizes.default, className)}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';
