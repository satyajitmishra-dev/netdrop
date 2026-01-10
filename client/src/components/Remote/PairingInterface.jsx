import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { RefreshCw, Copy, Check, Cast, ArrowRight } from 'lucide-react';
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
            toast.error(msg);
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
                console.log("[Pairing] Socket connected, generating code...");
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
                    toast.error("Server unavailable. Check connection.");
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
            toast.error("Network timeout. Please refresh.", {
                id: 'pair-timeout',
                style: { background: '#1e293b', color: '#fff', border: '1px solid #ef4444' }
            });
        }, 8000); // Increased to 8s for slower networks

        socketService.createPairCode((newCode) => {
            clearTimeout(safetyTimer);
            console.log("[Pairing] Received New Code:", newCode);
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
        <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-0 pb-24 md:pb-0 safe-bottom">

            {/* Main Card Container */}
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">

                {/* Tab Switcher Integrated */}
                <div className="flex w-full bg-slate-950/50 p-1 rounded-xl border border-white/5 mb-8 relative">
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
                    <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="mb-8 relative w-full flex justify-center">
                            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse-slow"></div>
                            <div className="relative text-5xl md:text-6xl font-mono font-bold tracking-widest text-white select-all whitespace-nowrap z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                {isLoading ? (
                                    <span className="animate-pulse">...</span>
                                ) : (
                                    tempCode.split('').map((char, i) => (
                                        <span key={i} className="inline-block">{char}</span>
                                    ))
                                )}
                            </div>
                        </div>

                        <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed max-w-[80%]">
                            Enter this code on the other device<br />to connect securely.
                        </p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={copyCode}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-white/5 active:scale-[0.98]"
                            >
                                <Copy size={20} />
                                Copy Code
                            </button>
                            <button
                                onClick={handleGenerateCode}
                                disabled={isLoading}
                                className="w-14 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all flex items-center justify-center border border-white/5 active:scale-[0.98] disabled:opacity-50"
                                title="Refresh Code"
                            >
                                <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleJoin} className="w-full space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-3 text-left">
                            <label className="text-sm font-bold text-slate-400 ml-1">ENTER CODE</label>
                            <input
                                type="text"
                                value={inputCode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                    setInputCode(val);
                                }}
                                placeholder="000 000"
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-5 text-center text-3xl font-mono tracking-[0.2em] text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={inputCode.length !== 6 || isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw size={20} className="animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    Connect Device
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>

            <p className="text-center text-slate-500 text-xs font-medium">
                Connection is end-to-end encrypted
            </p>
        </div>
    );
};

export default PairingInterface;
