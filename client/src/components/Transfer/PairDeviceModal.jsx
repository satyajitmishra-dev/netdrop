import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Link as LinkIcon, Wifi, Loader2 } from 'lucide-react';
import { socketService } from '../../services/socket.service';
import { toast } from 'react-hot-toast';

const PairDeviceModal = ({ isOpen, onClose }) => {
    const [myCode, setMyCode] = useState(null);
    const [inputCode, setInputCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const inputRefs = useRef([]);

    // Generate code when modal opens
    useEffect(() => {
        if (isOpen && !myCode) {
            setIsLoading(true);
            socketService.createPairCode((code) => {
                setMyCode(code);
                setIsLoading(false);
            });
        }
    }, [isOpen]);

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setMyCode(null);
            setInputCode(['', '', '', '', '', '']);
            setIsLoading(false);
            setIsJoining(false);
        }
    }, [isOpen]);

    const handleCopy = () => {
        if (myCode) {
            navigator.clipboard.writeText(myCode);
            toast.success('Code copied!');
        }
    };

    const handleInputChange = (index, value) => {
        // Only allow digits
        const digit = value.replace(/[^0-9]/g, '').slice(-1);
        const newCode = [...inputCode];
        newCode[index] = digit;
        setInputCode(newCode);

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace to go to previous input
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
        }
    };

    const handleJoin = () => {
        const code = inputCode.join('');
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
            socket.off('pair-success', onSuccess);
        };

        const onSuccess = ({ peer }) => {
            setIsJoining(false);
            const deviceName = peer?.name || 'Unknown Device';
            toast.success(`Connected to ${deviceName} 🎉`, { duration: 3000 });
            socket.off('pair-error', onError);
            socket.off('pair-success', onSuccess);
            onClose();
        };

        socket.on('pair-error', onError);
        socket.on('pair-success', onSuccess);
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
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-center relative">
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold text-white">Pair Devices Remotely</h2>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* My Code Section */}
                            <div className="text-center space-y-4">
                                {/* Large Passcode Display */}
                                <div
                                    className="flex justify-center gap-2 cursor-pointer group"
                                    onClick={handleCopy}
                                    title="Click to copy"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-16">
                                            <Loader2 className="animate-spin text-blue-400 w-8 h-8" />
                                        </div>
                                    ) : (
                                        <>
                                            {/* First 3 digits */}
                                            {(myCode || '------').slice(0, 3).split('').map((digit, i) => (
                                                <div
                                                    key={i}
                                                    className="w-12 h-16 md:w-14 md:h-18 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-3xl md:text-4xl font-bold text-white group-hover:border-blue-500/50 transition-all"
                                                >
                                                    {digit}
                                                </div>
                                            ))}
                                            <div className="flex items-center px-1 text-slate-600 text-2xl font-light">-</div>
                                            {/* Last 3 digits */}
                                            {(myCode || '------').slice(3, 6).split('').map((digit, i) => (
                                                <div
                                                    key={i + 3}
                                                    className="w-12 h-16 md:w-14 md:h-18 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-3xl md:text-4xl font-bold text-white group-hover:border-blue-500/50 transition-all"
                                                >
                                                    {digit}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>

                                <p className="text-slate-400 text-sm">
                                    Input this code on another device<br />
                                    <span className="text-slate-500">or have them share their code</span>
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-slate-700/50"></div>
                                <span className="text-xs font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-700/50">OR</span>
                                <div className="flex-1 h-px bg-slate-700/50"></div>
                            </div>

                            {/* Enter Code Section */}
                            <div className="space-y-4">
                                {/* Input Boxes */}
                                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                                    {inputCode.map((digit, i) => (
                                        <React.Fragment key={i}>
                                            <input
                                                ref={el => inputRefs.current[i] = el}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleInputChange(i, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(i, e)}
                                                className="w-11 h-14 md:w-12 md:h-16 bg-slate-800/50 border border-slate-700 rounded-xl text-center text-2xl font-bold text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            />
                                            {i === 2 && <div className="flex items-center px-0.5 text-slate-600 text-xl">-</div>}
                                        </React.Fragment>
                                    ))}
                                </div>

                                <p className="text-center text-slate-500 text-xs">
                                    Enter code from another device
                                </p>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all border border-slate-700/50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleJoin}
                                disabled={enteredCode.length !== 6 || isJoining}
                                className="flex-[1.5] py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isJoining ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <LinkIcon size={18} />
                                )}
                                Pair
                            </button>
                        </div>

                        {/* Bottom Note */}
                        <div className="bg-slate-950/50 px-6 py-3 border-t border-slate-800/50 text-center">
                            <p className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-2 uppercase tracking-wider">
                                <Wifi size={12} />
                                Same WiFi Not Required
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PairDeviceModal;
