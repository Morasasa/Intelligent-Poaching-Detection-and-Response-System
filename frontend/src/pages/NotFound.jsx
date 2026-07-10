import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-forest-950 flex flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="p-6 bg-forest-900/50 rounded-2xl border border-forest-800 mb-2">
                <ShieldAlert className="h-16 w-16 text-forest-600 mx-auto" />
            </div>
            <div>
                <p className="text-7xl font-black text-forest-800 mb-2">404</p>
                <h1 className="text-2xl font-bold text-slate-200 mb-2">Page Not Found</h1>
                <p className="text-forest-400 max-w-sm">
                    The requested sector does not exist or has been declassified. Return to command center.
                </p>
            </div>
            <Link to="/">
                <Button>
                    <Home className="h-4 w-4" />
                    Return to Command Center
                </Button>
            </Link>
        </div>
    );
}
