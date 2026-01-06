import React from 'react';
import { Lock } from 'lucide-react';

const UploadProgress = ({ status, progress }) => {
    return (
        <div className="py-8 space-y-4">
            <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                <Lock className="absolute inset-0 m-auto text-white w-6 h-6 animate-pulse" />
            </div>

            <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-1">
                    {status === 'encrypting' ? 'Encrypting...' : 'Uploading...'}
                </h3>
                <p className="text-slate-400 text-xs font-mono">AES-256-GCM</p>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default UploadProgress;
