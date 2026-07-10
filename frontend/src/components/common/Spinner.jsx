import { cn } from './Input';
import { Loader2 } from 'lucide-react';

/**
 * Spinner component for loading states.
 */
export function Spinner({ className, size = 'md' }) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
    };
    return <Loader2 className={cn('animate-spin text-forest-400', sizes[size], className)} />;
}

/**
 * Full-page loading screen.
 */
export function PageLoader({ message = 'Loading...' }) {
    return (
        <div className="min-h-screen bg-forest-950 flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="h-16 w-16 border-4 border-forest-800 border-t-forest-500 rounded-full animate-spin" />
                <div className="absolute inset-0 h-16 w-16 border-4 border-transparent border-b-forest-700/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-forest-400 text-sm font-medium animate-pulse">{message}</p>
        </div>
    );
}

/**
 * Inline loading state with optional label.
 */
export function LoadingRow({ message = 'Loading data...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-forest-400">
            <Spinner size="lg" />
            <p className="text-sm">{message}</p>
        </div>
    );
}
