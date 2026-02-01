import React from 'react';
import { motion } from 'framer-motion';
import {
    Check, X, Zap, Shield, Cloud, Wifi, Lock,
    ArrowRight, Globe, Users, Smartphone, Share2
} from 'lucide-react';

const SnapDropAlternative = () => {
    const features = [
        { name: 'Local Network Discovery', netdrop: true, snapdrop: true },
        { name: 'Cross-Network Sharing', netdrop: true, snapdrop: false },
        { name: 'Secure Room Codes', netdrop: true, snapdrop: false },
        { name: 'Device Pairing', netdrop: true, snapdrop: false },
        { name: 'Cloud File Links', netdrop: true, snapdrop: false },
        { name: 'Passcode Protection', netdrop: true, snapdrop: false },
        { name: 'Transfer History', netdrop: true, snapdrop: false },
        { name: 'TURN Server (NAT traversal)', netdrop: true, snapdrop: false },
        { name: 'PWA Support', netdrop: true, snapdrop: true },
        { name: 'No Account Required', netdrop: true, snapdrop: true },
    ];

    const limitations = [
        {
            title: 'Same Network Only',
            snapdrop: 'Snapdrop only works when devices are on the same WiFi network.',
            netdrop: 'NetDrop works across any network with Room Codes and Pairing.'
        },
        {
            title: 'No Cloud Backup',
            snapdrop: 'Files are lost if connection drops during transfer.',
            netdrop: 'Upload to cloud and share secure links anytime.'
        },
        {
            title: 'No NAT Traversal',
            snapdrop: 'Fails behind strict firewalls and corporate networks.',
            netdrop: 'TURN servers ensure connection even behind NAT.'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#000926] via-[#0a0a15] to-[#000926] text-white">
            {/* Hero */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                            SnapDrop Alternative
                        </span>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            NetDrop vs Snapdrop: <span className="text-emerald-400">Why NetDrop Wins</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                            Snapdrop only works on local networks. NetDrop works everywhere—across WiFi,
                            mobile data, and even different countries.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white font-bold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                            >
                                Try NetDrop Free
                                <ArrowRight size={20} />
                            </a>
                            <a
                                href="#limitations"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
                            >
                                See Snapdrop Limitations
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Snapdrop Limitations */}
            <section id="limitations" className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4">
                        Why Switch from Snapdrop?
                    </h2>
                    <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
                        Snapdrop is great for simple local transfers, but it has major limitations.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {limitations.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-bold mb-4 text-red-400">{item.title}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <X className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
                                        <p className="text-sm text-slate-400">{item.snapdrop}</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Check className="text-emerald-400 mt-0.5 flex-shrink-0" size={16} />
                                        <p className="text-sm text-emerald-300">{item.netdrop}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Full Feature Comparison
                    </h2>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-3 bg-white/5 border-b border-white/10">
                            <div className="p-4 font-bold">Feature</div>
                            <div className="p-4 font-bold text-center text-emerald-400">NetDrop</div>
                            <div className="p-4 font-bold text-center text-slate-400">Snapdrop</div>
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
                                    {feature.snapdrop ? (
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
                        Upgrade from Snapdrop Today
                    </h2>
                    <p className="text-lg text-slate-400 mb-8">
                        Same simplicity, way more power. Share files across any device, anywhere.
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white font-bold text-lg shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                    >
                        <Zap size={22} />
                        Start Sharing Now
                    </a>
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

export default SnapDropAlternative;
