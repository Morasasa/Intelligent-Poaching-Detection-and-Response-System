import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldAlert, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { authService } from '../api/services';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Access keys do not match.');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, password);
            setSuccess(true);
            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const detail = err?.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail[0]?.msg || 'Validation failed.');
            } else {
                setError(detail || 'Invalid or expired reset token. Please request a new one.');
            }
        } finally {
            setLoading(false);
        }
    };

    // No token in URL → show error
    if (!token) {
        return (
            <div className="flex min-h-screen bg-forest-950 items-center justify-center p-8">
                <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-2xl text-center">
                    <div className="mx-auto w-16 h-16 bg-alert-900/50 rounded-2xl flex items-center justify-center mb-6 border border-alert-600/50">
                        <ShieldAlert size={28} className="text-alert-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Invalid Reset Link</h2>
                    <p className="text-sm text-forest-300 mb-6">
                        This reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-forest-400 hover:text-forest-300 transition-colors"
                    >
                        Request new reset link →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-forest-950 items-center justify-center p-8">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-forest-500/10 blur-3xl rounded-full" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-forest-500/5 blur-3xl rounded-full" />
            </div>

            <div className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 rounded-2xl relative z-10">
                {!success ? (
                    <>
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-forest-800/80 rounded-2xl flex items-center justify-center mb-6 border border-forest-700/50">
                                <KeyRound size={28} className="text-forest-400" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                                Set New Access Key
                            </h2>
                            <p className="text-sm text-forest-300 max-w-xs mx-auto">
                                Enter your new access key below. Make it strong and unique.
                            </p>
                        </div>

                        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-alert-900/50 border border-alert-600/50 text-alert-100 px-4 py-3 rounded-md text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium leading-6 text-forest-100 mb-1">
                                    New Access Key
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

                            <div>
                                <label className="block text-sm font-medium leading-6 text-forest-100 mb-1">
                                    Confirm Access Key
                                </label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full font-semibold mt-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                                        Encrypting...
                                    </span>
                                ) : (
                                    'Reset Access Key'
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
                            Access Key Updated
                        </h2>
                        <p className="text-sm text-forest-300 max-w-xs mx-auto">
                            Your access key has been reset successfully. Redirecting to login...
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-forest-500 hover:text-forest-300 transition-colors"
                            >
                                Go to Login →
                            </Link>
                        </div>
                    </div>
                )}

                {!success && (
                    <div className="text-center pt-2">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-forest-400 hover:text-forest-300 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
