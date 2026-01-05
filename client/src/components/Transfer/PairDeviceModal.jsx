import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Link as LinkIcon, Smartphone, Wifi, Loader2 } from 'lucide-react';
import { socketService } from '../../services/socket.service';
import { toast } from 'react-hot-toast';

const PairDeviceModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('scan'); // 'scan' (My Code) | 'join' (Enter Code)
    const [myCode, setMyCode] = useState(null);
    const [inputCode, setInputCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === 'scan' && !myCode) {
            setIsLoading(true);
            socketService.createPairCode((code) => {
                setMyCode(code);
                setIsLoading(false);
            });
        }
    }, [isOpen, activeTab]);

    const handleCopy = () => {
        if (myCode) {
            navigator.clipboard.writeText(myCode);
            setIsCopied(true);
            toast.success('Code copied!');
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (inputCode.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);
        socketService.joinWithCode(inputCode);

        // Listen for success/error via socket listeners (setup in App.jsx or here?)
        // Better to setup listeners in App.jsx or a useEffect here if we access global store?
        // For MVP, let's assume global listener handles the actual connection, 
        // but we can listen for error here.
        const socket = socketService.getSocket();

        const onError = (msg) => {
            setIsLoading(false);
            toast.error(msg);
            socket.off('pair-error', onError);
            socket.off('pair-success', onSuccess);
        };

        const onSuccess = () => {
            setIsLoading(false);
            toast.success('Device Linked Successfully!');
            socket.off('pair-error', onError);
            socket.off('pair-success', onSuccess);
            onClose();
        };

        socket.on('pair-error', onError);
        socket.on('pair-success', onSuccess);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative glass-panel w-full max-w-md rounded-[32px] overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">

                {/* Header */}
                <div className="p-6 pb-2 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 ring-1 ring-blue-500/20 shadow-lg shadow-blue-500/10">
                            <LinkIcon size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight tracking-tight">Link New Device</h3>
                            <p className="text-xs text-blue-300/60 font-medium mt-0.5 tracking-wide uppercase">Cross-network peer connection</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all active:scale-95">
                        <X size={22} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1.5 bg-slate-920/50 m-6 mb-2 rounded-2xl border border-white/5 relative z-10">
                    <button
                        onClick={() => setActiveTab('scan')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'scan' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <Smartphone size={16} /> My Code
                    </button>
                    <button
                        onClick={() => setActiveTab('join')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'join' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <LinkIcon size={16} /> Enter Code
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 pt-4 h-[300px] flex flex-col justify-center">
                    {activeTab === 'scan' ? (
                        <div className="flex flex-col items-center text-center">
                            <div className="relative group cursor-pointer" onClick={handleCopy}>
                                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse-slow" />
                                <div className="relative w-64 h-24 bg-slate-900/80 border border-blue-500/30 rounded-3xl flex items-center justify-center gap-4 shadow-2xl transition-all group-hover:scale-[1.02] group-hover:border-blue-400/50">
                                    {isLoading ? (
                                        <Loader2 className="animate-spin text-blue-400 w-8 h-8" />
                                    ) : (
                                        <span className="text-5xl font-mono font-bold text-white tracking-[0.15em] drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]">{myCode || '------'}</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 space-y-2">
                                <p className="text-sm font-medium text-slate-300">Share this one-time code</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                                    <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Active for 5:00</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleJoin} className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-right-8 duration-300">
                            <div className="space-y-4">
                                <div className="text-center">
                                    <h4 className="text-white font-bold text-lg">Enter Pairing Code</h4>
                                    <p className="text-slate-400 text-xs mt-1">Found on the other device's "My Code" tab</p>
                                </div>
                                <input
                                    autoFocus
                                    type="text"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-3xl py-6 text-4xl font-mono text-center text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder-slate-800 tracking-[0.5em] transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={inputCode.length !== 6 || isLoading}
                                className="btn-primary w-full py-4 text-base font-bold shadow-xl shadow-blue-500/20"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LinkIcon size={20} />}
                                Connect Devices
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer Hint */}
                <div className="bg-slate-950/50 p-4 border-t border-white/5 text-center backdrop-blur-md">
                    <p className="text-[10px] text-slate-500 font-bold flex items-center justify-center gap-2 uppercase tracking-widest">
                        <Wifi size={12} strokeWidth={2.5} />
                        Same WiFi Not Required
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PairDeviceModal;
