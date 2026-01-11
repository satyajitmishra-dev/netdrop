import React from 'react';
import { EyeOff, ShieldCheck } from 'lucide-react';

const Footer = () => {
    const year = new Date().getFullYear();
    const version = 'v2.2.4';

    return (
        <footer className="w-full py-6 mt-auto relative z-10 flex flex-col items-center justify-center">
            {/* Trust Text */}
            <p className="text-slate-500 text-xs font-medium mb-3 tracking-wide">
                Connection is end-to-end encrypted
            </p>

            {/* Trust Badge Pill */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-800/50 border border-white/10 backdrop-blur-md hover:bg-slate-800/70 transition-colors duration-300 cursor-default">
                <ShieldCheck size={16} strokeWidth={2.5} className="text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">Secure</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <EyeOff size={16} strokeWidth={2.5} className="text-blue-400" />
                <span className="text-sm font-semibold text-slate-200">Zero Tracking</span>
            </div>

            {/* Meta */}
            <div className="mt-4 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-600">
                <span>© {year} NetDrop</span>
                <span className="mx-2">•</span>
                <span>{version}</span>
            </div>
        </footer>
    );
};

export default Footer;
