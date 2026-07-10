import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Crosshair, Map, Activity } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userData = await login(email, password);
            if (userData?.role === 'officer') {
                navigate('/officer-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const detail = err?.response?.data?.detail;
            setError(detail || 'Invalid credentials or server unreachable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-forest-950">
            {/* Left Splity - Brand Visual */}
            <div className="hidden lg:flex w-1/2 bg-forest-900 border-r border-forest-800 relative overflow-hidden flex-col justify-between p-12">
                {/* Decorative background gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-forest-800/20 to-transparent pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-forest-500/10 blur-3xl rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-forest-400 mb-8">
                        <ShieldAlert size={32} />
                        <h1 className="text-2xl font-bold tracking-wider text-slate-100">GUARDIAN<span className="text-forest-500">AI</span></h1>
                    </div>

                    <h2 className="text-4xl font-light text-slate-200 mt-20 leading-tight">
                        Intelligent Poaching <br /><span className="font-semibold text-white">Detection & Response</span>
                    </h2>
                    <p className="text-forest-300 mt-6 max-w-md text-lg">
                        Advanced computer vision system designed to secure protected terrains, identify threats, and trigger real-time mobilization.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6 relative z-10 w-full max-w-md">
                    <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                        <div className="bg-forest-800 p-2 rounded-lg text-forest-400"><Crosshair size={20} /></div>
                        <div>
                            <p className="text-xs text-forest-400 uppercase tracking-wider">Detection</p>
                            <p className="text-sm font-medium text-slate-200">YOLOv8 Powered</p>
                        </div>
                    </div>
                    <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                        <div className="bg-forest-800 p-2 rounded-lg text-forest-400"><Activity size={20} /></div>
                        <div>
                            <p className="text-xs text-forest-400 uppercase tracking-wider">Response</p>
                            <p className="text-sm font-medium text-slate-200">&lt; 2s Latency</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Split - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                {/* Subtle glass background for mobile when there's no left split */}
                <div className="absolute inset-0 bg-forest-950/80 backdrop-blur-3xl -z-10 lg:hidden" />

                <div className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 rounded-2xl">
                    <div className="text-center">
                        <ShieldAlert size={48} className="mx-auto text-forest-500 lg:hidden mb-6" />
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
                        <p className="text-sm text-forest-300">Enter your credentials to access the secure terminal</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-alert-900/50 border border-alert-600/50 text-alert-100 px-4 py-3 rounded-md text-sm text-center animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium leading-6 text-forest-100 mb-1">
                                    Secure Email ID
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="agent@guardian.io"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium leading-6 text-forest-100">
                                        Access Key
                                    </label>
                                    <Link to="/forgot-password" className="font-semibold text-xs text-forest-400 hover:text-forest-300">
                                        Forgot access key?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full font-semibold"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                'Initiate Uplink'
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-forest-400">
                        New field agent?{' '}
                        <Link to="/register" className="font-semibold text-forest-500 hover:text-forest-300 transition-colors">
                            Request clearance
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
