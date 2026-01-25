import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase.config';
import { setUser, setLoading } from '../../store/slices/auth.slice';
import { Loader2, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '../UI/GlassCard';

const Login = () => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    const handleGoogleLogin = async () => {
        dispatch(setLoading(true));
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const token = await user.getIdToken();

            dispatch(setUser({
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                },
                token
            }));
            toast.success(`Welcome back, ${user.displayName.split(' ')[0]}!`);
        } catch (error) {
            console.error(error);
            toast.error("Login Failed");
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <div className="w-full flex items-center justify-center p-4">
            <GlassCard className="relative w-full max-w-sm p-8 md:p-10 overflow-hidden">
                {/* Decorative gradient blob */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/40 to-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center">
                    {/* Logo */}
                    <div className="relative mb-6 w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-blue-600/30 blur-2xl rounded-full scale-125 animate-pulse" />
                        <img
                            src="/favicon.svg"
                            alt="NetDrop Logo"
                            className="relative w-full h-full object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                        />
                    </div>

                    {/* Branding */}
                    <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
                        Net<span className="text-primary">Drop</span>
                    </h1>
                    <p className="text-text-muted text-sm mb-8">
                        Seamless sharing, everywhere
                    </p>

                    {/* Google Sign In Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="group w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white hover:bg-gray-50 text-slate-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Continue with Google</span>
                                <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </>
                        )}
                    </button>

                    {/* Feature Pills */}
                    <div className="mt-8 flex items-center gap-2 flex-wrap justify-center">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-text-muted">
                            <Zap size={12} className="text-amber-400" />
                            Instant
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-text-muted">
                            <Shield size={12} className="text-emerald-400" />
                            Secure
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-text-muted">
                            <Globe size={12} className="text-blue-400" />
                            Universal
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default Login;
