import React from 'react';
import { Check, Copy, Package, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UploadSuccess = ({ shareLink, passcode, onCopy, onReset, fileCount = 1 }) => {
    const [showInfo, setShowInfo] = React.useState(false);

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    return (
        <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center relative">
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="absolute top-3 right-3 text-emerald-500/70 hover:text-emerald-400 transition-colors p-1"
                    title="How it works"
                >
                    <Info size={18} />
                </button>

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

            {showInfo && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm space-y-2 animate-in fade-in slide-in-from-top-2">
                    <p className="font-semibold text-blue-400 mb-2">How to download:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-xs">
                        <li>Copy the <span className="text-white font-medium">Link</span> & <span className="text-white font-medium">Passcode</span> below.</li>
                        <li>Open the link in any browser.</li>
                        <li>Enter the <span className="text-white font-medium">Sender's Email</span> & <span className="text-white font-medium">Passcode</span>.</li>
                        <li>Download your secure files!</li>
                    </ol>
                </div>
            )}

            <div className="bg-slate-900/50 rounded-xl p-4 space-y-4 border border-slate-700/30">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Share Link</p>
                        <button
                            onClick={() => handleCopy(shareLink, 'Link')}
                            className="text-[10px] flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <Copy size={12} /> Copy
                        </button>
                    </div>
                    <div className="text-blue-400 text-xs font-mono select-all bg-slate-950/50 p-2 rounded border border-slate-700/30 break-all">
                        {shareLink}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Passcode</p>
                        <button
                            onClick={() => handleCopy(passcode, 'Passcode')}
                            className="text-[10px] flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <Copy size={12} /> Copy
                        </button>
                    </div>
                    <div className="text-white font-mono text-lg select-all tracking-wider bg-slate-950/50 p-2 rounded border border-slate-700/30 flex justify-between items-center">
                        {passcode}
                    </div>
                </div>
            </div>

            <button
                onClick={onReset}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-all text-sm"
            >
                Upload Another File
            </button>
        </div>
    );
};

export default UploadSuccess;
