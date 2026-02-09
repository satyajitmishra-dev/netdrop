import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Check, X, Zap, Shield, Cloud, Smartphone, Monitor,
    ArrowRight, Globe, Wifi, Lock, Share2, Download
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const PairDropAlternative = () => {
    usePageMeta({
        title: 'NetDrop vs PairDrop – Better PairDrop Alternative',
        description: 'Compare NetDrop vs PairDrop. NetDrop adds cloud sharing, passcode protection, and transfer history on top of fast local transfers.',
        path: '/pairdrop-alternative'
    });

    const features = [
        { name: 'Local Network Sharing', netdrop: true, pairdrop: true },
        { name: 'Cross-Network Rooms', netdrop: true, pairdrop: true },
        { name: 'Device Pairing Codes', netdrop: true, pairdrop: true },
        { name: 'Cloud Upload & Links', netdrop: true, pairdrop: false },
        { name: 'Passcode Protected Files', netdrop: true, pairdrop: false },
        { name: 'Transfer History', netdrop: true, pairdrop: false },
        { name: 'PWA Install', netdrop: true, pairdrop: true },
        { name: 'No Account Required', netdrop: true, pairdrop: true },
        { name: 'End-to-End Encryption', netdrop: true, pairdrop: true },
    ];

    const advantages = [
        {
            icon: <Cloud className="text-blue-400" size={24} />,
            title: 'Cloud Sharing',
            description: 'Share files via secure links when devices aren\'t on the same network. PairDrop can\'t do this.'
        },
        {
            icon: <Lock className="text-emerald-400" size={24} />,
            title: 'Passcode Protection',
            description: 'Add an extra layer of security with passcode-protected file downloads.'
        },
        {
            icon: <Download className="text-purple-400" size={24} />,
            title: 'Transfer History',
            description: 'Keep track of all your sent and received files. Never lose a transfer again.'
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#000926] via-[#0a0a15] to-[#000926] text-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest bg-primary/20 text-primary rounded-full border border-primary/30">
                            PairDrop Alternative
                        </span>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            NetDrop is the <span className="text-primary">Better</span> PairDrop Alternative
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                            Everything PairDrop offers, plus cloud sharing, passcode protection, and transfer history.
                            Free, no signup required.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-blue-600 rounded-xl text-white font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                            >
                                Try NetDrop Free
                                <ArrowRight size={20} />
                            </Link>
                            <a
                                href="#comparison"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
                            >
                                See Comparison
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Why Switch Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Why Choose NetDrop Over PairDrop?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {advantages.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
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
            <section id="comparison" className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        NetDrop vs PairDrop: Feature Comparison
                    </h2>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-3 bg-white/5 border-b border-white/10">
                            <div className="p-4 font-bold">Feature</div>
                            <div className="p-4 font-bold text-center text-primary">NetDrop</div>
                            <div className="p-4 font-bold text-center text-slate-400">PairDrop</div>
                        </div>

                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-3 border-b border-white/5 last:border-0"
                            >
                                <div className="p-4 text-sm sm:text-base">{feature.name}</div>
                                <div className="p-4 flex justify-center">
                                    {feature.netdrop ? (
                                        <Check className="text-emerald-400" size={20} />
                                    ) : (
                                        <X className="text-red-400" size={20} />
                                    )}
                                </div>
                                <div className="p-4 flex justify-center">
                                    {feature.pairdrop ? (
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

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        Ready to Switch from PairDrop?
                    </h2>
                    <p className="text-lg text-slate-400 mb-8">
                        Start sharing files instantly. No downloads, no signups, no hassle.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-primary to-blue-600 rounded-xl text-white font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                    >
                        <Zap size={22} />
                        Start Sharing Now
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-white/5">
                <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} NetDrop. Free, open-source file sharing.</p>
                </div>
            </footer>
        </div>
    );
};

export default PairDropAlternative;
