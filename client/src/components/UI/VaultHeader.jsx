import React from 'react';
import { Shield } from 'lucide-react';

const VaultHeader = () => {
    return (
        <div className="flex flex-col items-center gap-4 mb-2">
            {/* Animated Icon */}
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse" />
                <div className="relative w-16 h-16 md:w-18 md:h-18 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/10 rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Shield className="w-8 h-8 md:w-9 md:h-9 text-blue-400" />
                </div>
            </div>

            {/* Text */}
            <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Secure Vault</h2>
                <p className="text-slate-400 text-xs md:text-sm mt-1">End-to-end encrypted storage</p>
            </div>
        </div>
    );
};

export default VaultHeader;
