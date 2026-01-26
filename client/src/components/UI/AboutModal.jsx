import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Github, Twitter, Heart, HelpCircle, Zap, Shield, Globe, ArrowLeft,
    Sparkles, Wifi, Users, Share2, Download, Cloud, Smartphone, Upload,
    Lock, CheckCircle, Code2, ChevronRight, Coffee, Star, Rocket, Gift
} from 'lucide-react';
import { useAppVersion } from '../../hooks/useAppVersion';
import { fetchAndActivate, getValue, remoteConfig } from '../../config/firebase.config';
import FeedbackModal from './FeedbackModal';

const iconMap = {
    Zap, Shield, Globe, Users, Cloud, Wifi
};

const AboutModal = ({ isOpen, onClose }) => {
    const { version } = useAppVersion();
    const [showFeedback, setShowFeedback] = useState(false);

    // Default features (fallback)
    const defaultFeatures = [
        { icon: "Zap", title: "P2P Transfer", desc: "Direct device-to-device", color: "from-amber-500 to-orange-600" },
        { icon: "Shield", title: "E2E Encrypted", desc: "Military-grade security", color: "from-emerald-500 to-teal-600" },
        { icon: "Globe", title: "Cross-Platform", desc: "Any device, any OS", color: "from-blue-500 to-cyan-600" },
        { icon: "Users", title: "Room Codes", desc: "Multi-device sharing", color: "from-purple-500 to-pink-600" },
        { icon: "Cloud", title: "Cloud Vault", desc: "Secure remote access", color: "from-cyan-500 to-blue-600" },
        { icon: "Wifi", title: "Any Network", desc: "WiFi, mobile, hotspot", color: "from-pink-500 to-rose-600" },
    ];

    const [remoteFeatures, setRemoteFeatures] = useState(defaultFeatures);

    // Fetch from Remote Config
    React.useEffect(() => {
        if (isOpen) {
            const fetchConfig = async () => {
                try {
                    await fetchAndActivate(remoteConfig);
                    const val = getValue(remoteConfig, 'feature_list');
                    const stringVal = val.asString();
                    if (stringVal) {
                        setRemoteFeatures(JSON.parse(stringVal));
                    }
                } catch (error) {
                    console.error("Error fetching feature list:", error);
                }
            };
            fetchConfig();
        }
    }, [isOpen]);

    // Map string icon names to components
    const features = React.useMemo(() => {
        return remoteFeatures.map(f => ({
            ...f,
            icon: iconMap[f.icon] || Zap
        }));
    }, [remoteFeatures]);

    // How it works
    const steps = [
        { num: '01', title: 'Open NetDrop', desc: 'On any device with a browser' },
        { num: '02', title: 'Select Files', desc: 'Drag & drop or browse' },
        { num: '03', title: 'Share Instantly', desc: 'Click a device to send' },
    ];

    // Social links
    const socials = [
        { icon: Github, href: 'https://github.com/satyajitmishra-dev/netdrop', label: 'GitHub', bg: 'hover:bg-[#333]' },
        { icon: Twitter, href: 'https://x.com/satyajitmishr0', label: 'Twitter', bg: 'hover:bg-[#1DA1F2]' },
        { icon: Coffee, href: 'https://buymeacoffee.com/satyajitmishra', label: 'Support', bg: 'hover:bg-amber-500' },
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
                        className="fixed inset-0 z-[100] bg-[#030305] overflow-auto"
                    >
                        {/* Background Effects */}
                        <div className="fixed inset-0 pointer-events-none overflow-hidden">
                            {/* Gradient Mesh - Using rgb(15, 82, 186) */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[150px] opacity-60" style={{ background: 'rgb(15, 82, 186, 0.25)' }} />
                            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: 'rgb(15, 82, 186, 0.15)' }} />
                            <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'rgb(15, 82, 186, 0.1)' }} />

                            {/* Noise Texture */}
                            <div className="absolute inset-0 opacity-[0.015]" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                            }} />
                        </div>

                        {/* Header */}
                        <motion.header
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between backdrop-blur-2xl bg-black/50 border-b border-white/5"
                        >
                            <motion.button
                                onClick={onClose}
                                whileHover={{ x: -3 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all"
                            >
                                <ArrowLeft size={16} />
                                <span className="text-sm font-medium">Back</span>
                            </motion.button>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 border border-primary/30"
                            >
                                <Star size={12} className="text-amber-400" />
                                <span className="text-xs font-bold text-white">{version}</span>
                            </motion.div>
                        </motion.header>

                        {/* Main Content */}
                        <div className="relative min-h-screen flex flex-col items-center px-4 pt-24 pb-32">

                            {/* Hero Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="text-center mb-12"
                            >
                                {/* Logo */}
                                <motion.div
                                    className="relative w-28 h-28 mx-auto mb-8"
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="absolute inset-[-15px] bg-gradient-to-r from-primary via-blue-500 to-cyan-500 rounded-full blur-2xl opacity-40 animate-pulse" />
                                    <div className="relative w-full h-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl">
                                        <img src="/favicon.svg" alt="NetDrop" className="w-16 h-16 drop-shadow-2xl" />
                                    </div>
                                </motion.div>

                                {/* Title */}
                                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
                                    Net<span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">Drop</span>
                                </h1>

                                {/* Tagline */}
                                <p className="text-lg md:text-xl text-slate-400 mb-8">
                                    The <span className="text-white font-semibold">fastest</span> way to share files.{' '}
                                    <span className="text-primary font-semibold">No signup.</span>
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <motion.button
                                        onClick={onClose}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white overflow-hidden shadow-2xl shadow-primary/30"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%] group-hover:animate-gradient" />
                                        <span className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                                        <span className="relative flex items-center justify-center gap-2.5">
                                            <Rocket size={20} />
                                            Start Sharing
                                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </motion.button>

                                    <motion.a
                                        href="https://github.com/satyajitmishra-dev/netdrop"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2.5"
                                    >
                                        <Github size={20} />
                                        View Source
                                    </motion.a>
                                </div>
                            </motion.div>

                            {/* Stats Bar */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-16 px-8 py-6 rounded-3xl bg-white/[0.02] border border-white/5"
                            >
                                {[
                                    { value: '∞', label: 'File Size', icon: Upload },
                                    { value: '0', label: 'Data Stored', icon: Shield },
                                    { value: '100%', label: 'Free Forever', icon: Gift },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        className="text-center"
                                        whileHover={{ scale: 1.05, y: -3 }}
                                    >
                                        <div className="text-4xl md:text-5xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-1">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
                                            <stat.icon size={12} />
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Features Grid */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="w-full max-w-3xl mb-16"
                            >
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-8 text-center">
                                    Why Choose NetDrop
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {features.map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + i * 0.05 }}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-default overflow-hidden"
                                        >
                                            {/* Hover glow */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                                <feature.icon size={22} className="text-white" />
                                            </div>
                                            <h3 className="text-sm font-bold text-white mb-1">{feature.title}</h3>
                                            <p className="text-xs text-slate-500">{feature.desc}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* How It Works */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="w-full max-w-2xl mb-16"
                            >
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-8 text-center">
                                    How It Works
                                </h2>
                                <div className="flex flex-col md:flex-row items-stretch gap-4">
                                    {steps.map((step, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.55 + i * 0.1 }}
                                            className="flex-1 relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center group hover:bg-white/[0.04] transition-all"
                                        >
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-blue-500 text-[10px] font-black text-white shadow-lg">
                                                STEP {step.num}
                                            </div>
                                            <h3 className="text-base font-bold text-white mt-2 mb-1">{step.title}</h3>
                                            <p className="text-xs text-slate-500">{step.desc}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Footer */}
                            <motion.footer
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.65 }}
                                className="text-center"
                            >
                                {/* Social Links */}
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    {socials.map((social) => (
                                        <motion.a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.1, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-transparent transition-all ${social.bg}`}
                                            title={social.label}
                                        >
                                            <social.icon size={20} />
                                        </motion.a>
                                    ))}
                                    <motion.button
                                        onClick={() => setShowFeedback(true)}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary hover:border-transparent transition-all"
                                        title="Feedback"
                                    >
                                        <HelpCircle size={20} />
                                    </motion.button>
                                </div>

                                {/* Made with love */}
                                <p className="text-sm text-slate-500 mb-2">
                                    Built with <Heart size={14} className="inline text-red-500 animate-pulse" /> by{' '}
                                    <a href="https://github.com/satyajitmishra-dev" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                        Satyajit Mishra
                                    </a>
                                </p>
                                <p className="text-xs text-slate-600">
                                    © {new Date().getFullYear()} • Open Source • MIT License
                                </p>
                            </motion.footer>
                        </div>

                        {/* Mobile Sticky CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-[#030305] via-[#030305]/95 to-transparent md:hidden"
                        >
                            <motion.button
                                onClick={onClose}
                                whileTap={{ scale: 0.97 }}
                                className="w-full px-6 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-primary to-blue-500 shadow-2xl shadow-primary/30 flex items-center justify-center gap-2.5"
                            >
                                <Rocket size={20} />
                                Start Sharing
                                <ChevronRight size={18} />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
        </>
    );
};

export default AboutModal;
