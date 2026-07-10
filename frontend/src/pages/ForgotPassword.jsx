import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { authService } from '../api/services';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err?.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-forest-950 items-center justify-center p-8">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-forest-500/10 blur-3xl rounded-full" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-forest-500/5 blur-3xl rounded-full" />
            </div>

            <div className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 rounded-2xl relative z-10">
                {!sent ? (
                    <>
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-forest-800/80 rounded-2xl flex items-center justify-center mb-6 border border-forest-700/50">
                                <Mail size={28} className="text-forest-400" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                                Reset Access Key
                            </h2>
                            <p className="text-sm text-forest-300 max-w-xs mx-auto">
                                Enter your secure email and we'll send you a link to reset your access key.
                            </p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-alert-900/50 border border-alert-600/50 text-alert-100 px-4 py-3 rounded-md text-sm text-center">
                                    {error}
                                </div>
                            )}

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

                            <Button
                                type="submit"
                                className="w-full font-semibold"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                                        Transmitting...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="mx-auto w-16 h-16 bg-forest-800/80 rounded-2xl flex items-center justify-center mb-6 border border-forest-700/50">
                            <CheckCircle size={28} className="text-forest-400" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
                            Transmission Sent
                        </h2>
                        <p className="text-sm text-forest-300 max-w-xs mx-auto mb-2">
                            If an account exists for <span className="text-forest-200 font-medium">{email}</span>, you'll receive a reset link shortly.
                        </p>
                        <p className="text-xs text-forest-400 mt-4">
                            Check your inbox and spam folder. Link expires in 30 minutes.
                        </p>
                    </div>
                )}

                <div className="text-center pt-2">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-forest-400 hover:text-forest-300 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
