import React from 'react';
import { Shield, File, X, Check, UploadCloud } from 'lucide-react';
import { getShortName } from '../../utils/device';

const IncomingRequestModal = ({ isOpen, onClose, request, onAccept, onDecline }) => {
    if (!isOpen || !request) return null;

    const { meta, sender } = request;
    const senderName = getShortName(sender || { name: 'Unknown Device' });
    const fileSize = (meta.size / 1024 / 1024).toFixed(2);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden scale-in-95 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 animate-pulse-slow">
                            <UploadCloud size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">Incoming Transfer</h3>
                            <p className="text-xs text-blue-300">from {senderName}</p>
                        </div>
                    </div>
                    {/* X Button now acts as 'Later' (Accept but don't download) to ensure Sender success */}
                    <button onClick={() => onAccept(false)} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400">
                            <File size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-200 truncate" title={meta.name}>{meta.name}</h4>
                            <p className="text-sm text-slate-500">{fileSize} MB • {meta.type || 'Unknown Type'}</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-slate-400">
                            Accept to download now, or Cancel to save in history.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-950/30 flex gap-3">
                    <button
                        onClick={() => onAccept(false)} // Cancel = Save to History
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        onClick={() => onAccept(true)} // Accept & Download
                        className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Check size={18} />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingRequestModal;
