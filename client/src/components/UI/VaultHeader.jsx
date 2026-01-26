import React from 'react';
import { Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

const VaultHeader = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-5 mb-4"
        >
            {/* Animated Icon Container */}
            <div className="relative">
                {/* Outer Glow Pulse */}
                <motion.div
                    style={{ background: 'radial-gradient(circle, rgba(15,82,186,0.4) 0%, rgba(15,82,186,0) 70%)' }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Icon Box */}
                <motion.div
                    className="relative w-20 h-20 rounded-2xl flex items-center justify-center ring-1 ring-white/[0.08] shadow-2xl backdrop-blur-xl overflow-hidden"
                    style={{ background: 'rgb(15, 82, 186, 0.4)' }}
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {/* Subtle Grid Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
                            backgroundSize: '8px 8px'
                        }}
                    />

                    {/* Icon with Gradient */}
                    <div className="relative">
                        <Cloud className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
                    </div>
                </motion.div>
            </div>

            {/* Text Content */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Cloud <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Vault</span>
                </h2>
                <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                    Upload files securely. Share a link with anyone, anywhere.
                </p>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-3 pt-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">24h Link</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VaultHeader;
