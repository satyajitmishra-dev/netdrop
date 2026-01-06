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
        if (mode === 'receive' && !code) {
            handleGenerateCode();
        }
    }, [mode]);

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

    // Socket Listeners for Feedback
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

        socket.on('pair-error', onPairError);
        socket.on('pair-success', onPairSuccessEvent);

        return () => {
            socket.off('pair-error', onPairError);
            socket.off('pair-success', onPairSuccessEvent);
        };
    }, [onPairSuccess]);

    const handleGenerateCode = () => {
        setIsLoading(true);
        // Reset code so animation can re-trigger if needed, though usually new code implies change
        setCode('');
        socketService.createPairCode((newCode) => {
            setCode(newCode);
            setIsLoading(false);
            // Set 5 min expiry visual timer if needed, simplified for now
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
        socketService.joinWithCode(inputCode);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied!");
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-0 pb-24 md:pb-0">

            {/* Header / Mode Switcher */}
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/50 relative">
                <div
                    className={`absolute inset-y-1 w-[48%] bg-blue-600 rounded-lg shadow-lg transition-all duration-300 ease-out ${mode === 'receive' ? 'left-1' : 'left-[51%]'}`}
                />
                <button
                    onClick={() => setMode('receive')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 transition-colors ${mode === 'receive' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Cast size={16} />
                    Receive
                </button>
                <button
                    onClick={() => setMode('join')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 transition-colors ${mode === 'join' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <ArrowRight size={16} />
                    Join
                </button>
            </div>

            <div className="bg-slate-900/30 backdrop-blur-md rounded-2xl border border-slate-700/30 p-8 flex flex-col items-center text-center shadow-xl">
                {mode === 'receive' ? (
                    <>
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse-slow"></div>
                            <div className="relative text-6xl font-mono font-bold tracking-widest text-white select-all">
                                {isLoading ? (
                                    <span className="text-4xl animate-pulse">...</span>
                                ) : (
                                    tempCode.split('').map((char, i) => (
                                        <span key={i} className="inline-block mx-1">{char}</span>
                                    ))
                                )}
                            </div>
                        </div>

                        <p className="text-slate-400 text-sm mb-6">
                            Enter this code on another device to connect securely.
                            <br />Code expires in 5 minutes.
                        </p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={copyCode}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-slate-700"
                            >
                                <Copy size={18} />
                                Copy Code
                            </button>
                            <button
                                onClick={handleGenerateCode}
                                className="w-12 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all flex items-center justify-center border border-slate-700"
                                title="Refresh Code"
                            >
                                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleJoin} className="w-full space-y-6">
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={inputCode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                    setInputCode(val);
                                }}
                                placeholder="000 000"
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                autoFocus
                            />
                            <p className="text-slate-400 text-xs">Enter the 6-digit code from the other device</p>
                        </div>

                        <button
                            type="submit"
                            disabled={inputCode.length !== 6 || isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
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
        </div>
    );
};

export default PairingInterface;
