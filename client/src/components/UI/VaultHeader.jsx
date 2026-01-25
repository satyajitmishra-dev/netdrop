import React from 'react';
import { Cloud, Lock } from 'lucide-react';

const VaultHeader = () => {
    return (
        <div className="flex flex-col items-center gap-4 mb-2">
            {/* Icon */}
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-60" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center ring-1 ring-white/10 shadow-2xl">
                    <Cloud className="w-8 h-8 text-blue-400" />
                </div>
            </div>

            {/* Text */}
            <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Send to Anyone</h2>
                <p className="text-slate-400 text-xs md:text-sm mt-1">Upload, share a link, done.</p>
            </div>
        </div>
    );
};

export default VaultHeader;

