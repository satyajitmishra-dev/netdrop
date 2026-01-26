import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Copy, Send, Type, Clipboard, Check, Sparkles,
    MessageSquare, Smartphone, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';

const TextShareModal = ({ isOpen, onClose, mode, peerName, initialText = '', onSend, onSendClipboard }) => {
    const [text, setText] = useState(initialText);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            // Allow growing up to 70% of viewport height
            const maxHeight = window.innerHeight * 0.7;
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
        }
    }, [text, isOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-center gap-3 bg-[#0a0a0f]/90 border border-white/10 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-2xl`}>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Check size={16} strokeWidth={3} />
                </div>
                <div>
                    <p className="text-sm font-bold text-white">Copied!</p>
                    <p className="text-xs text-slate-400">Text copied to clipboard</p>
                </div>
            </div>
        ));
        setTimeout(() => onClose(), 500);
    };

    const handlePaste = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (clipboardText) {
                const newText = text ? text + '\n' + clipboardText : clipboardText;
                setText(newText);
                toast.success('Pasted from clipboard');
            } else {
                toast('Clipboard is empty', { icon: '⚠️' });
            }
        } catch (err) {
            console.error('Paste failed:', err);
            toast.error('Failed to read clipboard');
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop with sophisticated blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#000926]/60 backdrop-blur-md"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-lg bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Premium Abstract Background Elements - More Vibrant */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none mix-blend-screen" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/15 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none mix-blend-screen" />

                        {/* Header */}
                        <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 relative overflow-hidden group",
                                    mode === 'send'
                                        ? "bg-gradient-to-br from-primary via-blue-600 to-indigo-600 text-white shadow-primary/25"
                                        : "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-emerald-500/25"
                                )}>
                                    {mode === 'send' ? (
                                        <div className="relative z-10">
                                            <MessageSquare size={22} strokeWidth={2.5} className="text-white fill-white/20" />
                                        </div>
                                    ) : (
                                        <div className="relative z-10">
                                            <Smartphone size={22} strokeWidth={2.5} className="text-white fill-white/20" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <h3 className="text-xl font-bold text-white tracking-tight">
                                            {mode === 'send' ? 'Send Text' : 'Text Received'}
                                        </h3>
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                            mode === 'send'
                                                ? "bg-primary/20 border-primary/30 text-primary-300"
                                                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                                        )}>
                                            {mode === 'send' ? 'To' : 'From'}
                                        </span>
                                    </motion.div>
                                    <p className="text-sm font-medium text-slate-400 flex items-center gap-2 mt-1">
                                        <span className={cn(
                                            "w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px]",
                                            mode === 'send' ? "bg-primary shadow-primary/50" : "bg-emerald-400 shadow-emerald-400/50"
                                        )} />
                                        {peerName}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="group p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            >
                                <X size={20} className="transition-transform group-hover:rotate-90" />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="relative p-2 sm:p-6 flex-1 overflow-y-auto">
                            <div className={cn(
                                "group relative rounded-2xl transition-all duration-300",
                                isFocused
                                    ? "bg-white/[0.05] ring-1 ring-primary/50 shadow-[0_0_30px_-10px_rgba(59,130,246,0.25)] border-primary/20"
                                    : "bg-[#05050A]/40 hover:bg-white/[0.03] border border-white/10"
                            )}>
                                {/* Toolbar Actions (Paste) */}
                                {mode === 'send' && (
                                    <motion.button
                                        type="button"
                                        onClick={handlePaste}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors border border-white/5 shadow-lg backdrop-blur-md"
                                        title="Paste from clipboard"
                                    >
                                        <Clipboard size={14} />
                                    </motion.button>
                                )}

                                {mode === 'send' ? (
                                    <textarea
                                        ref={textareaRef}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        placeholder="Type or paste something here..."
                                        rows={1}
                                        className="w-full bg-transparent text-lg text-white placeholder-slate-400/60 p-5 pr-14 outline-none resize-none min-h-[60px] leading-relaxed selection:bg-primary/30 font-medium"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="w-full min-h-[100px] max-h-[300px] overflow-y-auto p-5 text-lg text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/30 font-medium">
                                        {text}
                                    </div>
                                )}

                                {/* Character Count / Status */}
                                <div className="absolute bottom-3 right-4 text-[10px] font-medium text-slate-600 uppercase tracking-widest pointer-events-none">
                                    {text.length} Chars
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="relative p-6 border-t border-white/5 bg-black/20">
                            <div className="flex items-center justify-between gap-4">
                                {mode === 'send' ? (
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.02, x: 2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handlePaste}
                                            className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            <Clipboard size={14} className="text-amber-400" />
                                            <span>Paste Clipboard</span>
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={!text.trim()}
                                            onClick={handleSubmit}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 pl-6 pr-5 py-3.5 bg-gradient-to-r from-primary via-blue-600 to-primary bg-[length:200%] hover:bg-[position:100%] transition-[background-position] duration-500 rounded-xl text-sm font-bold text-white shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                        >
                                            Send Now
                                            <Send size={16} strokeWidth={2.5} />
                                        </motion.button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-500 font-medium">
                                                Press <span className="text-slate-400 font-mono bg-white/5 px-1 rounded">ESC</span> to close
                                            </p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleCopy}
                                            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-sm font-bold text-white shadow-xl shadow-emerald-500/20"
                                        >
                                            Copy Text
                                            <Copy size={16} strokeWidth={2.5} />
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TextShareModal;

