import React from 'react';
import { Check, Copy, Package } from 'lucide-react';

const UploadSuccess = ({ shareLink, passcode, onCopy, onReset, fileCount = 1 }) => {
    return (
        <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    {fileCount > 1 ? <Package className="w-5 h-5 text-emerald-500" /> : <Check className="w-5 h-5 text-emerald-500" />}
                </div>
                <h3 className="text-lg font-bold text-white">
                    {fileCount > 1 ? `${fileCount} Files Bundled` : 'Upload Complete'}
                </h3>
                {fileCount > 1 && (
                    <p className="text-xs text-emerald-400/70 mt-1">All files in a single encrypted ZIP</p>
                )}
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 space-y-3 border border-slate-700/30">
                <div>
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Share Link</p>
                    <div className="text-blue-400 text-xs font-mono select-all bg-slate-950/50 p-2 rounded border border-slate-700/30 break-all">
                        {shareLink}
                    </div>
                </div>

                <div>
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Passcode</p>
                    <div className="text-white font-mono text-lg select-all tracking-wider">{passcode}</div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <button
                    onClick={onCopy}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <Copy size={16} />
                    Copy Details
                </button>
                <button
                    onClick={onReset}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-lg transition-all text-sm"
                >
                    Upload Another
                </button>
            </div>
        </div>
    );
};

export default UploadSuccess;
