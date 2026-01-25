import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Github, Twitter, Heart, HelpCircle, Zap, Shield, Globe, ArrowLeft,
    Sparkles, Wifi, Users, Share2, Download, Cloud, Smartphone, Upload,
    Clipboard, Lock, CheckCircle, Code2, ChevronRight, Coffee
} from 'lucide-react';
import { useAppVersion } from '../../hooks/useAppVersion';
import FeedbackModal from './FeedbackModal';

// CSS for animations (inject via style tag or add to index.css)
const shimmerKeyframes = `
@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
}
@keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.5); }
}
`;

const AboutModal = ({ isOpen, onClose }) => {
    const { version } = useAppVersion();
    const [showFeedback, setShowFeedback] = useState(false);
    const [hoveredFeature, setHoveredFeature] = useState(null);

    // Trust badges - compact and clear
    const trustBadges = [
        { icon: Lock, label: 'E2E Encrypted', color: 'text-emerald-400' },
        { icon: CheckCircle, label: 'No Signup', color: 'text-blue-400' },
        { icon: Globe, label: 'Any Device', color: 'text-purple-400' },
        { icon: Code2, label: 'Open Source', color: 'text-amber-400' },
    ];

    // Unified feature cards with gradient accents
    const features = [
        { icon: Zap, title: 'Lightning Fast', desc: 'P2P transfers at max speed', gradient: 'from-amber-500 to-orange-500' },
        { icon: Shield, title: 'Fully Encrypted', desc: 'Your data stays private', gradient: 'from-emerald-500 to-teal-500' },
        { icon: Globe, title: 'Cross-Platform', desc: 'Any device, any browser', gradient: 'from-blue-500 to-cyan-500' },
        { icon: Wifi, title: 'Any Network', desc: 'Mobile, hotspot, or WiFi', gradient: 'from-purple-500 to-pink-500' },
        { icon: Users, title: 'Multi-Device', desc: 'Share with room codes', gradient: 'from-pink-500 to-rose-500' },
        { icon: Cloud, title: 'Cloud Vault', desc: 'Password protected storage', gradient: 'from-cyan-500 to-blue-500' },
    ];

    // How it works steps with descriptions
    const steps = [
        { icon: Smartphone, number: '1', label: 'Open', desc: 'Visit on any device' },
        { icon: Share2, number: '2', label: 'Select', desc: 'Pick files or text' },
        { icon: Download, number: '3', label: 'Send', desc: 'Instant transfer' },
    ];

    // Social links for footer with brand colors
    const socialLinks = [
        { icon: Github, href: 'https://github.com/satyajitmishra-dev/netdrop', label: 'GitHub', hoverColor: 'hover:text-white hover:bg-[#333]' },
        { icon: Twitter, href: 'https://x.com/satyajitmishr0', label: 'Twitter', hoverColor: 'hover:text-white hover:bg-[#1DA1F2]' },
        { icon: Coffee, href: 'https://buymeacoffee.com/satyajitmishra', label: 'Buy Me a Coffee', hoverColor: 'hover:text-white hover:bg-[#FFDD00]' },
        { icon: HelpCircle, label: 'Feedback', action: () => setShowFeedback(true), hoverColor: 'hover:text-white hover:bg-primary' },
    ];

    return (
        <>
            {/* Inject keyframe animations */}
            <style>{shimmerKeyframes}</style>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-0 z-[100] bg-[#0a0a0f] overflow-auto"
                    >
                        {/* Premium Background - Layered depth */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {/* Base gradient */}
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-[#0a0a0f] to-[#0a0a0f]" />

                            {/* Subtle grid pattern */}
                            <div
                                className="absolute inset-0 opacity-[0.02]"
                                style={{
                                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                                    backgroundSize: '32px 32px'
                                }}
                            />

                            {/* Ambient orbs */}
                            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
                            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[120px]" />
                            <div className="absolute top-[40%] right-[-10%] w-[300px] h-[300px] bg-cyan-600/6 rounded-full blur-[100px]" />
                        </div>

                        {/* Header - Glass morphism */}
                        <motion.header
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5"
                        >
                            <motion.button
                                onClick={onClose}
                                whileHover={{ x: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-slate-400 hover:text-white transition-all duration-300"
                            >
                                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                                <span className="text-sm font-medium">Back</span>
                            </motion.button>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 border border-primary/30"
                            >
                                <Sparkles size={12} className="text-primary animate-pulse" />
                                <span className="text-xs font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">{version}</span>
                            </motion.div>
                        </motion.header>

                        {/* Main Content */}
                        <div className="relative min-h-screen flex flex-col items-center px-4 sm:px-6 pt-24 pb-36 md:pb-24">

                            {/* Hero Logo with floating animation */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                className="relative w-24 h-24 md:w-28 md:h-28 mb-6"
                                style={{ animation: 'float 4s ease-in-out infinite' }}
                            >
                                {/* Glow ring */}
                                <div
                                    className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-primary/40 via-blue-500/30 to-primary/40 blur-xl"
                                    style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
                                />
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/10 border border-white/10" />
                                <img
                                    src="/favicon.svg"
                                    alt="NetDrop"
                                    className="relative w-full h-full object-contain p-4 drop-shadow-2xl"
                                />
                            </motion.div>

                            {/* Title with gradient animation */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="text-5xl md:text-6xl font-black text-white tracking-tight mb-3"
                            >
                                Net<span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%] animate-gradient">Drop</span>
                            </motion.h1>

                            {/* Tagline - Sharp and impactful */}
                            <motion.p
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg md:text-xl text-slate-400 mb-8 text-center tracking-wide"
                            >
                                <span className="text-white font-semibold">Fast</span>
                                <span className="mx-2 text-slate-600">•</span>
                                <span className="text-white font-semibold">Secure</span>
                                <span className="mx-2 text-slate-600">•</span>
                                <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent font-semibold">No signup</span>
                            </motion.p>

                            {/* Hero CTAs - Premium buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="flex flex-col sm:flex-row items-center gap-4 mb-10"
                            >
                                {/* Primary CTA - Glassmorphic with glow */}
                                <motion.button
                                    onClick={onClose}
                                    whileHover={{ scale: 1.03, boxShadow: '0 20px 40px -12px rgba(59, 130, 246, 0.4)' }}
                                    whileTap={{ scale: 0.97 }}
                                    className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white overflow-hidden shadow-xl shadow-primary/20"
                                >
                                    {/* Gradient background */}
                                    <span className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%] transition-all duration-500 group-hover:bg-[position:100%]" />
                                    {/* Glass overlay */}
                                    <span className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20" />
                                    {/* Shimmer effect */}
                                    <span
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                                        style={{ animation: 'shimmer 1.5s infinite' }}
                                    />
                                    <span className="relative flex items-center justify-center gap-2.5 text-base">
                                        <Upload size={20} strokeWidth={2.5} />
                                        Send Files
                                        <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                                    </span>
                                </motion.button>

                                {/* Secondary CTA */}
                                <motion.button
                                    onClick={onClose}
                                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                    whileTap={{ scale: 0.97 }}
                                    className="group w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:text-white hover:border-white/20 transition-all duration-300"
                                >
                                    <span className="flex items-center justify-center gap-2.5 text-base">
                                        <Clipboard size={20} strokeWidth={2.5} />
                                        Paste Clipboard
                                    </span>
                                </motion.button>
                            </motion.div>

                            {/* Trust Badges - Pill style with icons */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap items-center justify-center gap-2 mb-12"
                            >
                                {trustBadges.map((badge, i) => (
                                    <motion.div
                                        key={badge.label}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.32 + i * 0.05 }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm cursor-default"
                                    >
                                        <badge.icon size={14} className={badge.color} />
                                        <span className="text-xs font-medium text-slate-300">{badge.label}</span>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Stats - Glassmorphic card */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="flex items-center justify-center gap-10 md:gap-16 mb-16 px-8 py-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm"
                            >
                                {[
                                    { value: '∞', label: 'File Size', sublabel: 'No limits' },
                                    { value: '0', label: 'Data Stored', sublabel: 'On servers' },
                                    { value: '100%', label: 'Free', sublabel: 'Forever' },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        className="text-center"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div className="text-3xl md:text-4xl font-black bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent mb-1">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</div>
                                        <div className="text-[10px] text-slate-600">{stat.sublabel}</div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Features Section - Premium cards */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="w-full max-w-2xl mb-16"
                            >
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.25em] mb-6 text-center">
                                    Why NetDrop?
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {features.map((feature, i) => {
                                        const isHovered = hoveredFeature === i;
                                        const isDimmed = hoveredFeature !== null && hoveredFeature !== i;

                                        return (
                                            <motion.div
                                                key={feature.title}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{
                                                    opacity: isDimmed ? 0.4 : 1,
                                                    y: isHovered ? -6 : 0,
                                                    scale: isDimmed ? 0.98 : 1,
                                                    filter: isDimmed ? 'blur(2px) grayscale(50%)' : 'blur(0px) grayscale(0%)',
                                                }}
                                                transition={{
                                                    duration: 0.3,
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 25
                                                }}
                                                onHoverStart={() => setHoveredFeature(i)}
                                                onHoverEnd={() => setHoveredFeature(null)}
                                                className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] cursor-default overflow-hidden z-10"
                                                style={{
                                                    boxShadow: isHovered ? '0 24px 48px -12px rgba(0,0,0,0.5)' : 'none',
                                                    borderColor: isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                                                    zIndex: isHovered ? 20 : 10
                                                }}
                                            >
                                                {/* Gradient accent on hover */}
                                                <div
                                                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-400`}
                                                    style={{ opacity: isHovered ? 0.08 : 0 }}
                                                />

                                                <div className="relative flex flex-col items-center text-center gap-3">
                                                    <motion.div
                                                        className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg relative`}
                                                        animate={{
                                                            rotate: isHovered ? 6 : 0,
                                                            scale: isHovered ? 1.1 : 1
                                                        }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <feature.icon size={22} className="text-white relative z-10" strokeWidth={2.5} />
                                                        {/* Icon Glow */}
                                                        {isHovered && (
                                                            <motion.div
                                                                layoutId="iconGlow"
                                                                className="absolute inset-0 rounded-xl bg-white/30 blur-md"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                            />
                                                        )}
                                                    </motion.div>
                                                    <h3 className="text-sm font-bold text-white transition-colors duration-300" style={{ color: isHovered ? '#fff' : isDimmed ? '#94a3b8' : '#fff' }}>
                                                        {feature.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 leading-relaxed transition-colors duration-300" style={{ color: isHovered ? '#94a3b8' : isDimmed ? '#64748b' : '#64748b' }}>
                                                        {feature.desc}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* How It Works - Visual timeline */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 }}
                                className="w-full max-w-lg mb-16"
                            >
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.25em] mb-8 text-center">
                                    How It Works
                                </h2>
                                <div className="relative flex items-start justify-between">
                                    {/* Animated progress line */}
                                    <motion.div
                                        className="absolute top-8 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-primary via-blue-400 to-primary"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.7, duration: 0.8 }}
                                    />

                                    {steps.map((step, i) => (
                                        <motion.div
                                            key={step.label}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 + i * 0.1 }}
                                            whileHover={{ y: -8 }}
                                            className="relative flex flex-col items-center gap-3 flex-1 cursor-default"
                                        >
                                            {/* Step number badge */}
                                            <div className="absolute -top-2 right-[calc(50%-24px)] w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-500 text-[11px] font-black text-white flex items-center justify-center z-10 shadow-lg shadow-primary/40 border-2 border-[#0a0a0f]">
                                                {step.number}
                                            </div>
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 3 }}
                                                className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center backdrop-blur-sm"
                                            >
                                                <step.icon size={26} className="text-primary" strokeWidth={2} />
                                            </motion.div>
                                            <span className="text-sm font-bold text-white">{step.label}</span>
                                            <span className="text-[11px] text-slate-500 text-center leading-relaxed">{step.desc}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Footer - Premium brand feel */}
                            <motion.footer
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-center"
                            >
                                {/* Social Links with brand colors on hover */}
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    {socialLinks.map((link) => {
                                        const baseClasses = `group relative w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/[0.06] transition-all duration-300 ${link.hoverColor} hover:border-transparent hover:scale-110 active:scale-95`;

                                        if (link.action) {
                                            return (
                                                <motion.button
                                                    key={link.label}
                                                    onClick={link.action}
                                                    whileHover={{ rotate: 5 }}
                                                    className={baseClasses}
                                                    title={link.label}
                                                >
                                                    <link.icon size={20} className="text-slate-400 group-hover:text-inherit transition-colors duration-300" />
                                                </motion.button>
                                            );
                                        }

                                        return (
                                            <motion.a
                                                key={link.label}
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={{ rotate: 5 }}
                                                className={baseClasses}
                                                title={link.label}
                                            >
                                                <link.icon size={20} className="text-slate-400 group-hover:text-inherit transition-colors duration-300" />
                                            </motion.a>
                                        );
                                    })}
                                </div>

                                {/* Built with love - Premium typography */}
                                <p className="text-sm text-slate-500 mb-2 font-medium">
                                    Built with <span className="inline-block animate-pulse">💖</span> by the <span className="text-slate-400">NetDrop</span> team
                                </p>
                                <p className="text-xs text-slate-600 tracking-wide">
                                    © {new Date().getFullYear()} • Open Source • MIT License
                                </p>
                            </motion.footer>
                        </div>

                        {/* Mobile Sticky CTA - Premium floating button */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent md:hidden backdrop-blur-sm"
                        >
                            <motion.button
                                onClick={onClose}
                                whileTap={{ scale: 0.97 }}
                                className="group relative w-full px-6 py-4 rounded-2xl font-bold text-white overflow-hidden shadow-2xl shadow-primary/30"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%]" />
                                <span className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                                <span
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    style={{ animation: 'shimmer 2s infinite' }}
                                />
                                <span className="relative flex items-center justify-center gap-2.5 text-base">
                                    <Upload size={20} strokeWidth={2.5} />
                                    Start Sharing
                                    <ChevronRight size={18} />
                                </span>
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Modal */}
            <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
        </>
    );
};

export default AboutModal;
