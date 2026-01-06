import React from 'react';
import { Shield } from 'lucide-react';

const VaultHeader = () => {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white tracking-tight">Secure Vault</h2>
                <p className="text-slate-400 text-sm mt-1">End-to-end encrypted storage</p>
            </div>
        </div>
    );
};

export default VaultHeader;
