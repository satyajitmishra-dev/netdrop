import React, { useEffect } from 'react';
import { LogOut, User, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadedFilesList from '../Remote/UploadedFilesList';
import PremiumButton from '../UI/PremiumButton';

const ProfileModal = ({ isOpen, onClose, user, onLogout }) => {
    // ESC key to close modal
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-lg bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                                    <User size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-white">Your Profile</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Scrollable Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* User Info Card */}
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <img
                                    src={user?.photoURL}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full border-2 border-primary/30 shadow-lg shadow-primary/20"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white truncate">{user?.displayName || 'User'}</h3>
                                    <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 w-fit">
                                            <Shield size={10} />
                                            <span>Verified Account</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Uploaded Files Section */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">
                                    Cloud Storage
                                </h3>
                                {/* Determine if we need to pass props or if it fetches itself. It fetches itself. */}
                                {/* Modification: UploadedFilesList usually has its own container styling, we might want to tweak it to fit modal or just use it. */}
                                <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden min-h-[200px]">
                                    <UploadedFilesList />
                                </div>
                            </div>
                        </div>

                        {/* Footer (Logout) */}
                        <div className="p-6 border-t border-white/5 bg-black/20">
                            <PremiumButton
                                onClick={() => {
                                    onLogout();
                                    onClose();
                                }}
                                variant="danger" // Assuming danger variant exists or we use custom class
                                className="w-full justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                            >
                                <LogOut size={18} className="mr-2" />
                                Sign Out
                            </PremiumButton>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;
