import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Crosshair, Map, Activity, Fingerprint } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(email, password, fullName);
            navigate('/');
        } catch (err) {
            let errorMsg = 'Registration failed. Check clearance levels.';
            if (err.registrationSucceeded) {
                errorMsg = 'Registration succeeded. Please log in with your new account.';
            }
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errorMsg = err.response.data.detail[0].msg;
                } else {
                    errorMsg = err.response.data.detail;
                }
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-forest-950 flex-row-reverse">
            {/* Left Splity (but on the right for variety) - Brand Visual */}
            <div className="hidden lg:flex w-1/2 bg-forest-900 border-l border-forest-800 relative overflow-hidden flex-col justify-between p-12">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-forest-800/20 to-transparent pointer-events-none" />
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-forest-500/10 blur-3xl rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col items-end text-right">
                    <div className="flex items-center gap-3 text-forest-400 mb-8 flex-row-reverse">
                        <ShieldAlert size={32} />
                        <h1 className="text-2xl font-bold tracking-wider text-slate-100">GUARDIAN<span className="text-forest-500">AI</span></h1>
                    </div>

                    <h2 className="text-4xl font-light text-slate-200 mt-20 leading-tight">
                        Join the <br /><span className="font-semibold text-white">Global Defense Grid</span>
                    </h2>
                    <p className="text-forest-300 mt-6 max-w-md text-lg">
                        Request clearance to deploy AI surveillance and protect endangered wildlife reserves worldwide.
                    </p>
                </div>

                <div className="relative z-10 w-full flex justify-end">
                    <div className="glass-panel p-6 rounded-xl flex items-center gap-4 max-w-sm">
                        <div className="bg-forest-800 p-3 rounded-xl text-forest-400"><Fingerprint size={28} /></div>
                        <div className="text-left">
                            <p className="text-sm text-forest-300">Biometric Enrolment</p>
                            <p className="text-base font-medium text-slate-200">Strict end-to-end encryption enforced on all agent credentials.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Split (on the left) - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                <div className="absolute inset-0 bg-forest-950/80 backdrop-blur-3xl -z-10 lg:hidden" />

                <div className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 rounded-2xl">
                    <div className="text-center lg:text-left">
                        <ShieldAlert size={48} className="mx-auto lg:mx-0 text-forest-500 mb-6 lg:hidden" />
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Request Clearance</h2>
                        <p className="text-sm text-forest-300">Register as a new field operative.</p>
                    </div>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-alert-900/50 border border-alert-600/50 text-alert-100 px-4 py-3 rounded-md text-sm text-center animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium leading-6 text-forest-100 mb-1">
                                Operative Name
                            </label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>

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
                            <label className="block text-sm font-medium leading-6 text-forest-100 mb-1">
                                Access Key
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <p className="text-xs text-forest-400 mt-2">
                                Must contain at least 8 characters, an uppercase letter, a number, and a symbol.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full font-semibold mt-6"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                                    Encrypting...
                                </span>
                            ) : (
                                'Submit Reg-form'
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-forest-400">
                        Already cleared?{' '}
                        <Link to="/login" className="font-semibold text-forest-500 hover:text-forest-300 transition-colors">
                            Initiate Uplink
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
