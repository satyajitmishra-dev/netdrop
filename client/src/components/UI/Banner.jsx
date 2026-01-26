import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Sparkles, AlertTriangle, Megaphone, ArrowRight } from 'lucide-react';
import { useBanner } from '../../hooks/useBanner';
import BannerModal from './BannerModal';

const Banner = () => {
    const { enabled, text, link, type, detail, loading } = useBanner();
    const [dismissed, setDismissed] = useState(false);
    const [showModal, setShowModal] = useState(false);

    if (loading || !enabled || dismissed || !text) return null;

    const styles = {
        info: {
            gradient: 'from-[rgb(15,82,186)]/40 via-slate-900/80 to-[rgb(15,82,186)]/40',
            border: 'border-[rgb(15,82,186)]/30',
            iconColor: 'text-[rgb(60,130,246)]',
            icon: Megaphone,
            glow: 'shadow-[0_0_30px_-5px_rgba(15,82,186,0.3)]'
        },
        promo: {
            gradient: 'from-amber-500/30 via-orange-600/20 to-pink-500/30',
            border: 'border-amber-500/30',
            iconColor: 'text-amber-400',
            icon: Sparkles,
            glow: 'shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]'
        },
        warning: {
            gradient: 'from-red-600/40 via-slate-900/80 to-red-600/40',
            border: 'border-red-500/30',
            iconColor: 'text-red-400',
            icon: AlertTriangle,
            glow: 'shadow-[0_0_30px_-5px_rgba(220,38,38,0.3)]'
        }
    };

    const style = styles[type] || styles.info;
    const Icon = style.icon;

    const handleAction = (e) => {
        if (detail) {
            e.preventDefault();
            setShowModal(true);
        }
    };

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0, stiffness: 100 }}
                    className="w-full relative z-[60]" // Higher Z-index to stand out
                >
                    <div className={`relative border-b ${style.border} backdrop-blur-2xl overflow-hidden ${style.glow}`}>
                        {/* Animated Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${style.gradient} opacity-90`} />

                        {/* Noise Texture for Premium Feel */}
                        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                        }} />

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_4s_infinite]" />

                        <div className="max-w-7xl mx-auto px-4 py-3.5 relative flex items-center justify-center gap-4">

                            {/* Animated Icon Container */}
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                                className={`hidden sm:flex p-2 rounded-xl bg-white/5 border border-white/5 ${style.iconColor} shadow-inner backdrop-blur-sm`}
                            >
                                <Icon size={16} fill="currentColor" fillOpacity={0.2} />
                            </motion.div>

                            {/* Content */}
                            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
                                {type === 'promo' && (
                                    <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] mobile:text-[10px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 tracking-wider">
                                        NEW
                                    </span>
                                )}

                                <p className="text-sm text-white font-medium tracking-wide drop-shadow-sm">
                                    {text}
                                </p>
                            </div>

                            {/* Action Button */}
                            {(detail || link) && (
                                <a
                                    href={detail ? '#' : link}
                                    onClick={handleAction}
                                    className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/25 text-xs font-bold text-white transition-all group shadow-sm hover:shadow-md"
                                >
                                    Learn More
                                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                </a>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setDismissed(true)}
                                className="absolute right-3 sm:right-6 p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <BannerModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                detail={detail}
                title={text}
                type={type}
            />
        </>
    );
};

export default Banner;
