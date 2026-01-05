import React, { useState, useEffect } from 'react';
import { X, Copy, Send, Type } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TextShareModal = ({ isOpen, onClose, mode, peerName, initialText = '', onSend }) => {
    const [text, setText] = useState(initialText);

    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard 🥳');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === 'send' && text.trim()) {
            onSend(text);
            setText('');
            // onClose(); // Let parent handle closing for smoother flow or keep it here? Parent handles it now.
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_20px_-5px_rgba(59,130,246,0.15)] overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="bg-white/5 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
                            <Type size={22} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white tracking-wide">{mode === 'send' ? 'COMPOSE MESSAGE' : 'RECEIVED TEXT'}</h3>
                            <p className="text-xs text-slate-400 font-medium tracking-wide mt-0.5">{mode === 'send' ? `To: ${peerName}` : `From: ${peerName}`}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-white/10 p-2.5 rounded-full transition-all active:scale-95"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-2">
                    {mode === 'send' ? (
                        <div className="relative group">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type your message here..."
                                className="w-full h-52 bg-slate-950/50 border border-slate-700/50 rounded-3xl p-5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none font-medium text-base leading-relaxed transition-all group-hover:border-slate-600/50"
                                autoFocus
                            />
                            <div className="absolute bottom-4 right-5 text-[10px] text-slate-500 font-bold tracking-wider">
                                {text.length} CHARS
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-52 bg-slate-950/50 border border-slate-700/50 rounded-3xl p-5 text-white overflow-y-auto font-medium text-base leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30">
                            {text}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
                    >
                        {mode === 'send' ? 'Cancel' : 'Close'}
                    </button>

                    {mode === 'send' ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!text.trim()}
                            className="flex-[2] py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:grayscale active:scale-[0.98]"
                        >
                            <Send size={18} strokeWidth={2.5} /> Send Message
                        </button>
                    ) : (
                        <button
                            onClick={handleCopy}
                            className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                        >
                            <Copy size={18} strokeWidth={2.5} /> Copy Text
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TextShareModal;
