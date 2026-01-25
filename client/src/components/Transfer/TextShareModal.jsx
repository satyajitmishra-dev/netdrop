import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Send, Type, Clipboard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../UI/Modal';
import PremiumButton from '../UI/PremiumButton';
import { cn } from '../../utils/cn';

const TextShareModal = ({ isOpen, onClose, mode, peerName, initialText = '', onSend, onSendClipboard }) => {
    const [text, setText] = useState(initialText);
    const textareaRef = useRef(null);

    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 300) + 'px';
        }
    }, [text, isOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard 🥳');
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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={null}
            showCloseButton={false}
            maxWidth="max-w-md"
            className="border border-white/10 shadow-2xl bg-black/60 backdrop-blur-xl" // Override styles
        >
            <div className="flex flex-col relative">
                {/* sleek close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-2 -right-2 p-2 text-text-muted hover:text-white transition-colors z-10"
                >
                    <X size={16} />
                </button>

                {/* Header - Minimal */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shadow-lg",
                        mode === 'send' ? "bg-primary/20 text-primary shadow-primary/10" : "bg-success/20 text-success shadow-success/10"
                    )}>
                        <Type size={16} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                            {mode === 'send' ? 'TO' : 'FROM'}
                        </span>
                        <span className="text-sm font-bold text-white tracking-wide">
                            {peerName}
                        </span>
                    </div>
                </div>

                {/* Content Area - Auto Growing */}
                <div className="relative group">
                    {mode === 'send' && (
                        <button
                            onClick={handlePaste}
                            className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-text-muted hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10 scale-90"
                            title="Paste"
                        >
                            <Clipboard size={14} />
                        </button>
                    )}

                    {mode === 'send' ? (
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type something here..."
                            rows={1}
                            className="w-full min-h-[60px] max-h-[300px] bg-white/5 hover:bg-white/[0.07] focus:bg-black/40 border border-white/5 focus:border-primary/50 rounded-xl px-4 py-3 pr-10 text-white placeholder-text-muted/40 focus:outline-none resize-none text-sm transition-all shadow-inner leading-relaxed"
                            autoFocus
                        />
                    ) : (
                        <div className="w-full min-h-[60px] max-h-[300px] bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap selection:bg-primary/30 shadow-inner">
                            {text}
                        </div>
                    )}
                </div>

                {/* Actions Footer - Quick Actions */}
                <div className="flex items-center justify-between gap-3 mt-4">
                    {mode === 'send' ? (
                        <>
                            <button
                                onClick={() => { onSendClipboard(); onClose(); }}
                                className="text-[10px] font-semibold text-text-muted hover:text-primary transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/5"
                            >
                                <Clipboard size={12} />
                                <span>Paste Clipboard</span>
                            </button>

                            <PremiumButton
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={!text.trim()}
                                className="px-6 py-2 h-9 text-xs rounded-lg shadow-lg shadow-primary/20"
                            >
                                Share <Send size={12} className="ml-2" />
                            </PremiumButton>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="text-xs font-semibold text-text-muted hover:text-white transition-colors px-3 py-2"
                        >
                            Close
                        </button>
                    )}

                    {mode === 'receive' && (
                        <PremiumButton
                            variant="primary"
                            onClick={handleCopy}
                            className="px-6 py-2 h-9 text-xs rounded-lg shadow-lg shadow-primary/20"
                        >
                            Copy <Copy size={12} className="ml-2" />
                        </PremiumButton>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default TextShareModal;

