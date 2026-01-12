import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Sparkles, AlertTriangle, Megaphone } from 'lucide-react';
import { useBanner } from '../../hooks/useBanner';

import BannerModal from './BannerModal';

const Banner = () => {
    const { enabled, text, link, type, detail, loading } = useBanner();
    const [dismissed, setDismissed] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Don't render if loading, disabled, dismissed, or no text
    if (loading || !enabled || dismissed || !text) {
        return null;
    }

    // Type-based styling (matching app's dark slate/blue theme)
    const styles = {
        info: {
            bg: 'bg-slate-800/95',
            border: 'border-blue-500/30',
            accent: 'text-blue-400',
            icon: <Megaphone size={14} className="shrink-0" />,
        },
        promo: {
            bg: 'bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-blue-900/90',
            border: 'border-indigo-500/30',
            accent: 'text-indigo-300',
            icon: <Sparkles size={14} className="shrink-0" />,
        },
        warning: {
            bg: 'bg-amber-900/80',
            border: 'border-amber-500/30',
            accent: 'text-amber-300',
            icon: <AlertTriangle size={14} className="shrink-0" />,
        }
    };

    const style = styles[type] || styles.info;

    // Handle "Learn More" click
    const handleAction = (e) => {
        if (detail) {
            e.preventDefault();
            setShowModal(true);
        }
        // If no detail but has link, let the <a> navigate naturally
    };

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="w-full overflow-hidden"
                >
                    <div className={`${style.bg} backdrop-blur-md border-b ${style.border}`}>
                        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 relative">
                            {/* Icon */}
                            <span className={style.accent}>
                                {style.icon}
                            </span>

                            {/* Text */}
                            <p className="text-slate-200 text-xs sm:text-sm font-medium text-center">
                                {text}
                            </p>

                            {/* Action (Modal or Link) */}
                            {(detail || link) && (
                                <a
                                    href={link || '#'}
                                    onClick={handleAction}
                                    target={detail ? undefined : "_blank"}
                                    rel={detail ? undefined : "noopener noreferrer"}
                                    className={`hidden sm:inline-flex items-center gap-1 ${style.accent} hover:text-white text-xs font-semibold transition-colors cursor-pointer`}
                                >
                                    Learn More
                                    <ExternalLink size={10} />
                                </a>
                            )}

                            {/* Dismiss Button */}
                            <button
                                onClick={() => setDismissed(true)}
                                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                aria-label="Dismiss banner"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Detail Modal */}
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
