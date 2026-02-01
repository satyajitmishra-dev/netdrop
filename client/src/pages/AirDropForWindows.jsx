import React from 'react';
import { motion } from 'framer-motion';
import {
    Check, X, Zap, Monitor, Smartphone, Laptop, Tablet,
    ArrowRight, Apple, Chrome, Wifi, Cloud, Lock, Share2
} from 'lucide-react';

const AirDropForWindows = () => {
    const platforms = [
        { name: 'Windows 10/11', icon: <Monitor size={24} />, supported: true },
        { name: 'macOS', icon: <Laptop size={24} />, supported: true },
        { name: 'Linux', icon: <Monitor size={24} />, supported: true },
        { name: 'Android', icon: <Smartphone size={24} />, supported: true },
        { name: 'iOS / iPadOS', icon: <Tablet size={24} />, supported: true },
        { name: 'Chrome OS', icon: <Chrome size={24} />, supported: true },
    ];

    const features = [
        {
            icon: <Wifi className="text-blue-400" size={28} />,
            title: 'Just Like AirDrop',
            description: 'Instant local discovery. Devices appear automatically when on the same network.'
        },
        {
            icon: <Cloud className="text-emerald-400" size={28} />,
            title: 'Better Than AirDrop',
            description: 'Works across ANY network with Room Codes. Share between continents, not just rooms.'
        },
        {
            icon: <Lock className="text-purple-400" size={28} />,
            title: 'More Secure',
            description: 'Optional passcode protection for sensitive files. End-to-end encrypted transfers.'
        },
    ];

    const comparisons = [
        { feature: 'Windows Support', airdrop: false, netdrop: true },
        { feature: 'Android Support', airdrop: false, netdrop: true },
        { feature: 'Linux Support', airdrop: false, netdrop: true },
        { feature: 'Cross-Network Sharing', airdrop: false, netdrop: true },
        { feature: 'No App Install Required', airdrop: false, netdrop: true },
        { feature: 'Cloud Backup Links', airdrop: false, netdrop: true },
        { feature: 'macOS Support', airdrop: true, netdrop: true },
        { feature: 'iPhone/iPad Support', airdrop: true, netdrop: true },
        { feature: 'Instant Discovery', airdrop: true, netdrop: true },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#000926] via-[#0a0a15] to-[#000926] text-white">
            {/* Hero */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                            AirDrop for Windows
                        </span>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            <span className="text-blue-400">AirDrop for Windows</span> — Finally Here
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                            Share files between Windows, Mac, iPhone, Android, and Linux instantly.
                            No cables, no apps to install, no accounts required.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl text-white font-bold shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
                            >
                                Start Sharing Free
                                <ArrowRight size={20} />
                            </a>
                            <a
                                href="#platforms"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
                            >
                                See All Platforms
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Platform Support */}
            <section id="platforms" className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Works on Every Device
                    </h2>
                    <p className="text-slate-400 mb-12">
                        Unlike AirDrop, NetDrop works across all platforms—not just Apple devices.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {platforms.map((platform, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2"
                            >
                                <div className="text-blue-400">{platform.icon}</div>
                                <span className="text-sm font-medium">{platform.name}</span>
                                <Check className="text-emerald-400" size={16} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why NetDrop Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Why NetDrop is the Best AirDrop Alternative for Windows
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                            >
                                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-slate-400">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        NetDrop vs AirDrop
                    </h2>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-3 bg-white/5 border-b border-white/10">
                            <div className="p-4 font-bold">Feature</div>
                            <div className="p-4 font-bold text-center text-blue-400">NetDrop</div>
                            <div className="p-4 font-bold text-center text-slate-400">AirDrop</div>
                        </div>

                        {comparisons.map((item, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-3 border-b border-white/5 last:border-0"
                            >
                                <div className="p-4 text-sm sm:text-base">{item.feature}</div>
                                <div className="p-4 flex justify-center">
                                    {item.netdrop ? (
                                        <Check className="text-emerald-400" size={20} />
                                    ) : (
                                        <X className="text-red-400" size={20} />
                                    )}
                                </div>
                                <div className="p-4 flex justify-center">
                                    {item.airdrop ? (
                                        <Check className="text-emerald-400" size={20} />
                                    ) : (
                                        <X className="text-red-400" size={20} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        Ready to Try AirDrop for Windows?
                    </h2>
                    <p className="text-lg text-slate-400 mb-8">
                        Share files between any devices in seconds. Open in your browser—that's it.
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl text-white font-bold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
                    >
                        <Zap size={22} />
                        Start Sharing Now
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-white/5">
                <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} NetDrop. Free, open-source file sharing for Windows, Mac, Android & more.</p>
                </div>
            </footer>
        </div>
    );
};

export default AirDropForWindows;
