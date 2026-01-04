import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase.config';
import { setUser, setLoading } from '../../store/slices/auth.slice';
import { LogIn, Loader2, ShieldCheck } from 'lucide-react';
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
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-blue-500/50">
                <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Enterprise Access</h2>
            <p className="text-slate-400 text-center mb-8 text-sm">
                Sign in to access your secure encrypted cloud storage.
            </p>

            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                        <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                        <span>Continue with Google</span>
                    </>
                )}
            </button>
            <p className="mt-4 text-xs text-slate-600">Protected by Firebase Auth</p>
        </div>
    );
};

export default Login;
