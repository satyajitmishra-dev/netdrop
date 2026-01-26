import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Link as LinkIcon, Wifi, Loader2, Smartphone, ArrowRight, Sparkles, Check, Globe } from 'lucide-react';
import { socketService } from '../../services/socket.service';
import { toast } from 'react-hot-toast';
import { getShortName } from '../../utils/device';

const PairDeviceModal = ({ isOpen, onClose }) => {
    const [myCode, setMyCode] = useState(null);
    const [inputCode, setInputCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [copied, setCopied] = useState(false);
    const inputRefs = useRef([]);

    // Generate code when modal opens
    useEffect(() => {
        if (isOpen && !myCode) {
            setIsLoading(true);
            socketService.createPairCode((code) => {
                setMyCode(code);
                setIsLoading(false);
                localStorage.setItem('netdrop_room_code', code);
            });
        }
    }, [isOpen]);

    // Global listener for pair-success
    useEffect(() => {
        if (!isOpen) return;

        const socket = socketService.getSocket();

        const handlePairSuccess = ({ peer }) => {
            const shortName = getShortName(peer);
            toast.success(`Connected to ${shortName} 🎉`, { duration: 3000 });

            if (inputCode.join('').length === 6) {
                localStorage.setItem('netdrop_room_code', inputCode.join(''));
            }
            onClose();
        };

        socket.on('pair-success', handlePairSuccess);
        return () => socket.off('pair-success', handlePairSuccess);
    }, [isOpen, onClose]);

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setMyCode(null);
            setInputCode(['', '', '', '', '', '']);
            setIsLoading(false);
            setIsJoining(false);
            setCopied(false);
        }
    }, [isOpen]);

    const handleCopy = () => {
        if (myCode) {
            navigator.clipboard.writeText(myCode);
            setCopied(true);
            toast.success('Code copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleInputChange = (index, value) => {
        const digit = value.replace(/[^0-9]/g, '').slice(-1);
        const newCode = [...inputCode];
        newCode[index] = digit;
        setInputCode(newCode);

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newCode.every(d => d !== '')) {
            handleJoin(newCode.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !inputCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
        if (paste) {
            const newCode = paste.split('').concat(Array(6 - paste.length).fill(''));
            setInputCode(newCode.slice(0, 6));
            inputRefs.current[Math.min(paste.length, 5)]?.focus();
            e.preventDefault();

            if (newCode.slice(0, 6).every(d => d !== '') && paste.length === 6) {
                handleJoin(newCode.slice(0, 6).join(''));
            }
        }
    };

    const handleJoin = (codeOverride) => {
        const code = typeof codeOverride === 'string' ? codeOverride : inputCode.join('');
        if (code.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        setIsJoining(true);
        socketService.joinWithCode(code);

        const socket = socketService.getSocket();

        const onError = (msg) => {
            setIsJoining(false);
            toast.error(msg);
            socket.off('pair-error', onError);
        };

        socket.on('pair-error', onError);

        setTimeout(() => {
            if (isJoining) {
                setIsJoining(false);
                socket.off('pair-error', onError);
            }
        }, 10000);
    };

    const enteredCode = inputCode.join('');

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                >
                    {/* Backdrop with blur */}
                    <motion.div
                        className="absolute inset-0 bg-black/70 backdrop-blur-xl"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-md bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {/* Ambient Glow */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px]" style={{ background: 'rgb(15, 82, 186, 0.25)' }} />
                            <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-[80px]" style={{ background: 'rgb(15, 82, 186, 0.2)' }} />
                        </div>

                        {/* Header */}
                        <div className="relative px-6 pt-6 pb-4">
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                            >
                                <X size={18} />
                            </motion.button>

                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                                    <Smartphone size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Remote Pairing</h2>
                                    <p className="text-xs text-slate-500">Connect devices across networks</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative px-6 pb-6 space-y-6">
                            {/* My Code Section */}
                            <div className="text-center space-y-4">
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                    <Sparkles size={12} className="text-amber-400" />
                                    Your Code
                                </div>

                                {/* Large Passcode Display */}
                                <motion.div
                                    className="relative inline-flex justify-center gap-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] cursor-pointer group"
                                    onClick={handleCopy}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    title="Click to copy"
                                >
                                    {/* Copy Badge */}
                                    <motion.div
                                        className="absolute -top-2 -right-2 px-2 py-1 rounded-lg bg-primary text-white text-[10px] font-bold flex items-center gap-1 shadow-lg"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {copied ? <Check size={10} /> : <Copy size={10} />}
                                        {copied ? 'Copied!' : 'Tap to copy'}
                                    </motion.div>

                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-14 w-full">
                                            <Loader2 className="animate-spin text-primary w-8 h-8" />
                                        </div>
                                    ) : (
                                        <>
                                            {(myCode || '------').split('').map((digit, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 + i * 0.05 }}
                                                    className={`w-11 h-14 md:w-12 md:h-16 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-black transition-all ${digit !== '-'
                                                        ? 'text-white border border-white/10 shadow-lg'
                                                        : 'bg-slate-800/50 text-slate-600'
                                                        }`}
                                                >
                                                    {digit}
                                                </motion.div>
                                            ))}
                                        </>
                                    )}
                                </motion.div>

                                <p className="text-slate-500 text-xs">
                                    Share this code with another device
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">or enter theirs</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
                            </div>

                            {/* Enter Code Section */}
                            <div className="space-y-4">
                                {/* Input Boxes */}
                                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                                    {inputCode.map((digit, i) => (
                                        <motion.input
                                            key={i}
                                            ref={el => inputRefs.current[i] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleInputChange(i, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(i, e)}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + i * 0.03 }}
                                            className={`w-10 h-12 md:w-11 md:h-14 rounded-xl text-center text-xl font-bold transition-all focus:outline-none ${digit
                                                ? 'bg-slate-800/80 border-primary/50 text-white ring-2 ring-primary/20'
                                                : 'bg-slate-800/50 border-slate-700/50 text-white'
                                                } border focus:border-primary focus:ring-2 focus:ring-primary/30`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Action Button */}
                            <motion.button
                                onClick={() => handleJoin()}
                                disabled={enteredCode.length !== 6 || isJoining}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {isJoining ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <LinkIcon size={18} />
                                        Connect Devices
                                        <ArrowRight size={16} className="ml-1" />
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* Footer Note */}
                        <div className="relative bg-white/[0.02] border-t border-white/[0.05] px-6 py-4">
                            <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                <span className="flex items-center gap-1.5">
                                    <Globe size={12} className="text-emerald-400" />
                                    Works Anywhere
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Wifi size={12} className="text-blue-400" />
                                    No Same WiFi
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PairDeviceModal;
