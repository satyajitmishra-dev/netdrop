import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle, Info } from 'lucide-react';

const BannerModal = ({ isOpen, onClose, detail, title, type }) => {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Type-based animations and styles
    const styles = {
        info: {
            icon: <Info size={24} className="text-blue-400" />,
            gradient: 'from-blue-500/20 to-blue-600/5',
            border: 'border-blue-500/30'
        },
        promo: {
            icon: <Sparkles size={24} className="text-indigo-400" />,
            gradient: 'from-violet-500/20 to-purple-600/5',
            border: 'border-indigo-500/30'
        },
        warning: {
            icon: <AlertTriangle size={24} className="text-amber-400" />,
            gradient: 'from-amber-500/20 to-orange-600/5',
            border: 'border-amber-500/30'
        }
    };

    const style = styles[type] || styles.info;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full max-w-lg bg-slate-900/95 border ${style.border} rounded-2xl shadow-2xl overflow-hidden relative`}
                        >
                            {/* Decorative Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} pointer-events-none`} />

                            {/* Header */}
                            <div className="relative p-6 flex items-start gap-4 border-b border-white/5">
                                <div className="p-3 bg-white/5 rounded-xl backdrop-blur-md border border-white/10 shrink-0">
                                    {style.icon}
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-xl font-bold text-white leading-none mb-1">
                                        {title || 'Information'}
                                    </h3>
                                    <p className="text-slate-400 text-sm">
                                        Details about this update
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="relative p-6 text-slate-300 leading-relaxed text-sm md:text-base space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {/* Use dangerouslySetInnerHTML to allow formatting logic from remote config */}
                                <div dangerouslySetInnerHTML={{ __html: detail }} />
                            </div>

                            {/* Footer */}
                            <div className="relative p-4 bg-slate-950/50 border-t border-white/5 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BannerModal;
