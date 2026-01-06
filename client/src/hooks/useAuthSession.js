import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { auth } from '../config/firebase.config';
import { setUser, logout } from '../store/slices/auth.slice';

const SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 Hours

export const useAuthSession = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Check or Set Session Start Time
                let sessionStart = localStorage.getItem('session_start');

                if (!sessionStart) {
                    sessionStart = Date.now().toString();
                    localStorage.setItem('session_start', sessionStart);
                }

                // Validate Expiry
                const now = Date.now();
                if (now - parseInt(sessionStart, 10) > SESSION_DURATION) {
                    await signOut(auth);
                    dispatch(logout());
                    localStorage.removeItem('session_start');
                    toast.error("Session expired. Please log in again.");
                    return;
                }

                // Refresh Redux State
                const token = await currentUser.getIdToken();
                dispatch(setUser({
                    user: {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                    },
                    token
                }));
            } else {
                dispatch(logout());
                localStorage.removeItem('session_start');
            }
        });

        return () => unsubscribe();
    }, [dispatch]);
};
