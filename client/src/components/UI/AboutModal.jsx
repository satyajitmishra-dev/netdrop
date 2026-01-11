import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Twitter, Heart, HelpCircle, Zap, Shield, Globe, ArrowLeft } from 'lucide-react';
import { useAppVersion } from '../../hooks/useAppVersion';
import FeedbackModal from './FeedbackModal';

const AboutModal = ({ isOpen, onClose }) => {
    const { version } = useAppVersion();
    const [showFeedback, setShowFeedback] = useState(false);

    const techStack = [
        { name: 'React', icon: '⚛️' },
        { name: 'Socket.io', icon: '🔌' },
        { name: 'WebRTC', icon: '📡' },
        { name: 'TailwindCSS', icon: '🎨' },
        { name: 'Firebase', icon: '🔥' },
        { name: 'Node.js', icon: '💚' },
    ];

    const socialLinks = [
        { icon: Github, href: 'https://github.com/satyajitmishra-dev/netdrop', label: 'GitHub', action: null },
        { icon: Twitter, href: 'https://x.com/satyajitmishr0', label: 'Twitter', action: null },
        { icon: Heart, href: '', label: 'Support', action: null },
        { icon: HelpCircle, href: '#', label: 'Help', action: () => setShowFeedback(true) },
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-0 z-[100] bg-slate-950 overflow-auto"
                    >
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

                        {/* Decorative Orbs */}
                        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

                        {/* Header with Back Button */}
                        <motion.header
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between bg-gradient-to-b from-slate-950 to-transparent"
                        >
                            <button
                                onClick={onClose}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
                            >
                                <ArrowLeft size={18} />
                                <span className="text-sm font-semibold">Back</span>
                            </button>
                        </motion.header>

                        {/* Content */}
                        <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24">
                            {/* Logo */}
                            <motion.div
                                initial={{ scale: 0, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                                className="w-32 h-32 md:w-40 md:h-40 mb-8 relative flex items-center justify-center"
                            >
                                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
                                <img src="/logo.svg" alt="NetDrop" className="relative w-full h-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]" />
                            </motion.div>

                            {/* Title */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center mb-10"
                            >
                                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
                                    NetDrop <span className="text-lg md:text-xl font-normal text-slate-400">{version}</span>
                                </h1>
                                <p className="text-slate-400 text-lg md:text-xl max-w-md mx-auto">
                                    The easiest way to share files across devices
                                </p>
                            </motion.div>

                            {/* Social Links */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="flex items-center justify-center gap-4 mb-12"
                            >
                                {socialLinks.map((link, index) => {
                                    // Define gradient backgrounds for each button
                                    const gradients = [
                                        'bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]', // GitHub - Instagram gradient
                                        'bg-[#1DA1F2]', // Twitter - blue
                                        'bg-gradient-to-br from-[#02ff2c] to-[#008a12]', // Support - green
                                        'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]', // Help - purple
                                    ];

                                    const commonClasses = `group relative w-[50px] h-[50px] rounded-full ${gradients[index]} flex items-center justify-center transition-transform duration-100 active:scale-[0.85] z-0`;

                                    // If has action, render button
                                    if (link.action) {
                                        return (
                                            <button
                                                key={link.label}
                                                onClick={link.action}
                                                className={commonClasses}
                                                title={link.label}
                                            >
                                                <span className="absolute w-[55px] h-[55px] bg-slate-900 rounded-full -z-10 transition-all duration-400 group-hover:w-0 group-hover:h-0" />
                                                <link.icon size={26} className="text-white z-10" />
                                            </button>
                                        );
                                    }

                                    return (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={commonClasses}
                                            title={link.label}
                                        >
                                            {/* Shrinking border effect */}
                                            <span className="absolute w-[55px] h-[55px] bg-slate-900 rounded-full -z-10 transition-all duration-400 group-hover:w-0 group-hover:h-0" />
                                            <link.icon size={26} className="text-white z-10" />
                                        </a>
                                    );
                                })}
                            </motion.div>

                            {/* Divider */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.3 }}
                                className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-10"
                            />

                            {/* Tech Stack */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="text-center mb-10"
                            >
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-5">Built With</p>
                                <div className="flex flex-wrap justify-center gap-3 max-w-md">
                                    {techStack.map((tech) => (
                                        <span
                                            key={tech.name}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
                                        >
                                            <span className="text-lg">{tech.icon}</span>
                                            {tech.name}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Features */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="grid grid-cols-3 gap-4 max-w-sm w-full mb-10"
                            >
                                <div className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <Zap size={28} className="text-amber-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fast</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <Shield size={28} className="text-emerald-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Secure</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <Globe size={28} className="text-blue-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Global</span>
                                </div>
                            </motion.div>

                            {/* Copyright */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.45 }}
                                className="text-xs text-slate-600 font-mono"
                            >
                                © {new Date().getFullYear()} NetDrop • Open Source
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Modal */}
            <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
        </>
    );
};

export default AboutModal;
