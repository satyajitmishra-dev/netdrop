import React from 'react';
import { EyeOff, ShieldCheck } from 'lucide-react';

const Footer = () => {
    const year = new Date().getFullYear();
    const version = 'v2.2.4';

    return (
        <footer className="w-full px-4 sm:px-6 py-8 mt-auto text-center relative z-10">
            {/* Trust Badge */}
            <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 border border-white/10 text-xs sm:text-sm font-semibold text-slate-200 backdrop-blur-md">
                    <ShieldCheck size={16} strokeWidth={2.5} className="text-emerald-400" />
                    Secure
                    <EyeOff size={16} strokeWidth={2.5} className="text-emerald-400" />
                    Zero Tracking
                </span>
            </div>

            {/* Meta */}
            <div className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-600">
                <span>{year} NetDrop</span>
                <span className="mx-2">•</span>
                <span>{version}</span>
            </div>
        </footer>
    );
};

export default Footer;
