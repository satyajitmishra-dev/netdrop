import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { RefreshCw, Copy, Check, Cast, ArrowRight, Link } from 'lucide-react';
import { socketService } from '../../services/socket.service';

const PairingInterface = ({ onPairSuccess }) => {
    const [mode, setMode] = useState('receive'); // 'receive' | 'join'
    const [code, setCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [expiryTime, setExpiryTime] = useState(null);

    const [tempCode, setTempCode] = useState('000000');
    const [isAnimating, setIsAnimating] = useState(false);

    // Initial Code Generation for Receive Mode
    useEffect(() => {
        const socket = socketService.getSocket();
        // Only generate if: mode is receive, no code exists, not currently loading, and socket is connected
        if (mode === 'receive' && !code && !isLoading && socket?.connected) {
            handleGenerateCode();
        }
    }, [mode, code, isLoading]);

    // Code Shuffle Animation
    useEffect(() => {
        if (code && mode === 'receive') {
            setIsAnimating(true);
            let duration = 800; // Total animation time
            const intervalTime = 50; // Shuffle speed
            const interval = setInterval(() => {
                setTempCode(Math.floor(100000 + Math.random() * 900000).toString());
                duration -= intervalTime;
                if (duration <= 0) {
                    clearInterval(interval);
                    setTempCode(code);
                    setIsAnimating(false);
                }
            }, intervalTime);

            return () => clearInterval(interval);
        }
    }, [code, mode]);

    // Socket Listeners for Feedback & Connection Status
    useEffect(() => {
        const socket = socketService.getSocket();

        const onPairError = (msg) => {
            let friendlyMsg = msg;
            if (msg.includes('Invalid') || msg.includes('expired')) {
                friendlyMsg = "That code didn't work. It might have expired.";
            } else if (msg.includes('Peer not found')) {
                friendlyMsg = "We couldn't find a device with that code.";
            } else if (msg.includes('yourself')) {
                friendlyMsg = "You can't pair with yourself!";
            }
            toast.error(friendlyMsg);
            setIsLoading(false);
        };

        const onPairSuccessEvent = ({ peer }) => {
            toast.success(`Connected to ${peer.name}`);
            setIsLoading(false);
            if (onPairSuccess) onPairSuccess(peer);
        };

        const onConnect = () => {
            // Auto-generate code if we are in receive mode and waiting
            if (mode === 'receive' && !code && !isLoading) {
                handleGenerateCode();
            }
        };

        socket.on('pair-error', onPairError);
        socket.on('pair-success', onPairSuccessEvent);
        socket.on('connect', onConnect);

        return () => {
            socket.off('pair-error', onPairError);
            socket.off('pair-success', onPairSuccessEvent);
            socket.off('connect', onConnect);
        };
    }, [onPairSuccess, mode, code, isLoading]);

    const handleGenerateCode = () => {
        const socket = socketService.getSocket();

        if (!socket.connected) {
            console.warn("[Pairing] Socket not connected. Attempting reconnect...");
            toast.error("Connecting to server...", { id: 'conn-status' });
            socket.connect();

            // Wait briefly for connection
            setTimeout(() => {
                if (!socket.connected) {
                    toast.error("We can't reach the server. Please check your internet connection.", { icon: '📡' });
                }
            }, 2000);
            // Decide whether to proceed or wait. Usually better to wait/retry.
        }

        setIsLoading(true);
        setCode('');

        // Safety timeout - Fix: Don't check state, just forcefully clear if timeout hits
        const safetyTimer = setTimeout(() => {
            console.warn("[Pairing] Code generation timed out");
            setIsLoading(false);
            toast.error("Connection timed out. Please refresh the page.", {
                id: 'pair-timeout',
                icon: '⌛',
                style: { background: '#1e293b', color: '#fff', border: '1px solid #ef4444' }
            });
        }, 8000); // Increased to 8s for slower networks

        socketService.createPairCode((newCode) => {
            clearTimeout(safetyTimer);
            setCode(newCode);
            setIsLoading(false);
            setExpiryTime(Date.now() + 5 * 60 * 1000);
        });
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (!inputCode || inputCode.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);
        // Safety timeout for join
        setTimeout(() => setIsLoading(false), 5000);

        socketService.joinWithCode(inputCode);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied!");
    };

    return (
        <div className="w-full max-w-sm mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-0 pb-24 md:pb-0 safe-bottom">

            {/* Header Icon */}
            <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-500/20 shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]">
                    <Link size={32} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Remote Pairing</h2>
                <p className="text-slate-400 text-xs px-4 leading-relaxed">
                    Connect with devices across the internet securely.
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex w-full bg-slate-800/40 p-1 rounded-xl border border-slate-700/50 relative">
                <div
                    className={`absolute inset-y-1 w-[49%] bg-blue-600 rounded-lg shadow-lg transition-all duration-300 ease-out ${mode === 'receive' ? 'left-1' : 'left-[50%]'}`}
                />
                <button
                    onClick={() => setMode('receive')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold z-10 transition-colors ${mode === 'receive' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Cast size={16} />
                    Receive
                </button>
                <button
                    onClick={() => setMode('join')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold z-10 transition-colors ${mode === 'join' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <ArrowRight size={16} />
                    Join
                </button>
            </div>

            {mode === 'receive' ? (
                <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 space-y-6">
                    <div className="relative w-full flex justify-center py-4">
                        <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full"></div>
                        <div className="relative text-5xl md:text-6xl font-mono font-bold tracking-widest text-white select-all whitespace-nowrap z-10">
                            {isLoading ? (
                                <span className="animate-pulse">...</span>
                            ) : (
                                tempCode.split('').map((char, i) => (
                                    <span key={i} className="inline-block">{char}</span>
                                ))
                            )}
                        </div>
                    </div>

                    <p className="text-slate-400 text-sm font-medium leading-relaxed text-center">
                        Enter this code on the other device<br />to connect securely.
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={copyCode}
                            className="flex-1 bg-slate-800/40 hover:bg-slate-800/60 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-slate-700/50 active:scale-[0.98]"
                        >
                            <Copy size={18} />
                            Copy Code
                        </button>
                        <button
                            onClick={handleGenerateCode}
                            disabled={isLoading}
                            className="w-14 bg-slate-800/40 hover:bg-slate-800/60 text-white rounded-xl transition-all flex items-center justify-center border border-slate-700/50 active:scale-[0.98] disabled:opacity-50"
                            title="Refresh Code"
                        >
                            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleJoin} className="w-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Enter Code</label>
                        <input
                            type="text"
                            value={inputCode}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                setInputCode(val);
                            }}
                            placeholder="000000"
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-4 text-center text-2xl font-mono tracking-[0.2em] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={inputCode.length !== 6 || isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                Connect Device
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};

export default PairingInterface;
