import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Send, Type, Clipboard } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TextShareModal = ({ isOpen, onClose, mode, peerName, initialText = '', onSend }) => {
    const [text, setText] = useState(initialText);

    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard 🥳');
        // Auto-close modal after brief delay to show toast
        setTimeout(() => onClose(), 500);
    };

    const handlePaste = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            setText(clipboardText);
            toast.success('Pasted from clipboard');
        } catch (err) {
            toast.error('Could not access clipboard');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === 'send' && text.trim()) {
            onSend(text);
            setText('');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-slate-800/50 px-5 py-4 flex items-center justify-between border-b border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
                                    <Type size={18} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">{mode === 'send' ? 'Compose Message' : 'Received Text'}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">{mode === 'send' ? `To: ${peerName}` : `From: ${peerName}`}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all active:scale-95"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            {mode === 'send' ? (
                                <div className="relative">
                                    {/* Paste button */}
                                    <button
                                        onClick={handlePaste}
                                        className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all z-10"
                                        title="Paste from clipboard"
                                    >
                                        <Clipboard size={14} />
                                    </button>
                                    <textarea
                                        value={text}
                                        onChange={(e) => {
                                            setText(e.target.value);
                                            // Auto-resize
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 300) + 'px';
                                        }}
                                        placeholder="Type your message here..."
                                        rows={3}
                                        className="w-full min-h-[80px] max-h-[300px] bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none text-sm leading-relaxed transition-all"
                                        autoFocus
                                        style={{ overflow: 'hidden' }}
                                    />
                                    <div className="absolute bottom-3 right-4 text-[10px] text-slate-500 font-medium">
                                        {text.length} chars
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full min-h-[80px] max-h-[300px] bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30">
                                    {text}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 pb-5 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] border border-slate-700/50"
                            >
                                {mode === 'send' ? 'Cancel' : 'Close'}
                            </button>

                            {mode === 'send' ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!text.trim()}
                                    className="flex-[1.5] py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                                >
                                    <Send size={16} /> Send
                                </button>
                            ) : (
                                <button
                                    onClick={handleCopy}
                                    className="flex-[1.5] py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                                >
                                    <Copy size={16} /> Copy
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TextShareModal;

