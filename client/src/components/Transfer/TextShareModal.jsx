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
        toast.success('Copied to clipboard!');
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
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div
                className="w-full max-w-lg bg-slate-900/90 border border-white/10 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >

                {/* Header */}
                <div className="bg-white/5 p-5 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3 text-white font-medium">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shadow-lg shadow-blue-500/5">
                            <Type size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{mode === 'send' ? 'Compose' : 'Received Text'}</h3>
                            <p className="text-xs text-slate-400">{mode === 'send' ? `To: ${peerName}` : `From: ${peerName}`}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    {mode === 'send' ? (
                        <div className="relative">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type something amazing..."
                                className="w-full h-48 bg-slate-950/50 border border-white/5 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none font-mono text-sm leading-relaxed transition-all"
                                autoFocus
                            />
                            <div className="absolute bottom-3 right-3 text-[10px] text-slate-600 font-mono">
                                {text.length} chars
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-48 bg-slate-950/50 border border-white/5 rounded-xl p-4 text-white overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/30">
                            {text}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 bg-white/5 flex gap-3 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-sm font-bold transition-colors"
                    >
                        {mode === 'send' ? 'Cancel' : 'Close'}
                    </button>

                    {mode === 'send' ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!text.trim()}
                            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:grayscale active:scale-[0.98]"
                        >
                            <Send size={18} /> Send
                        </button>
                    ) : (
                        <button
                            onClick={handleCopy}
                            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                        >
                            <Copy size={18} /> Copy Text
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TextShareModal;
