import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase.config';
import { setUser, setLoading } from '../../store/slices/auth.slice';
import { LogIn, Loader2, ShieldCheck, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

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
        <div className="relative group">
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Card Container */}
            <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/10 p-8 md:p-10 max-w-sm w-full shadow-2xl shadow-black/30 overflow-hidden">
                {/* Top Glow Line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                {/* Icon */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse" />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 rounded-2xl flex items-center justify-center ring-1 ring-blue-500/40 shadow-lg shadow-blue-500/20 rotate-3 hover:rotate-0 transition-transform duration-300">
                            <Lock className="w-10 h-10 text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Text */}
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3 tracking-tight">
                    Enterprise Access
                </h2>
                <p className="text-slate-400 text-center mb-8 text-sm leading-relaxed max-w-[85%] mx-auto">
                    Sign in to access your secure encrypted cloud storage.
                </p>

                {/* Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                            <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>

                {/* Trust Badge */}
                <p className="mt-6 text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Lock size={14} className="text-emerald-500/70" />
                    <span>Protected by Firebase Auth</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
