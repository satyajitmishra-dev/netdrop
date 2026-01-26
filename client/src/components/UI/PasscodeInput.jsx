import React, { useState } from 'react';
import { Key, Shuffle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const PasscodeInput = ({ value, onChange }) => {
    const [showPasscode, setShowPasscode] = useState(false);

    const generateRandomPasscode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I, O, 0, 1
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        onChange({ target: { value: result } });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
        >
            {/* Label with Generate Button */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <Key size={12} className="text-primary" />
                    Passcode
                </label>
                <button
                    type="button"
                    onClick={generateRandomPasscode}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all active:scale-95"
                >
                    <Shuffle size={10} />
                    Generate
                </button>
            </div>

            {/* Input Container with Glow */}
            <div className="relative group">
                {/* Focus Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-xl blur-lg opacity-0 group-focus-within:opacity-60 transition-opacity duration-300" />

                <div className="relative flex items-center">
                    <input
                        type={showPasscode ? "text" : "password"}
                        placeholder="Enter or generate a passcode"
                        value={value}
                        onChange={(e) => {
                            const upperVal = e.target.value.toUpperCase();
                            onChange({ ...e, target: { ...e.target, value: upperVal } });
                        }}
                        maxLength={16}
                        className="w-full bg-slate-900/60 border border-white/[0.08] rounded-xl px-4 py-3.5 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm tracking-[0.2em] uppercase"
                    />

                    {/* Toggle Visibility */}
                    <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        className="absolute right-3 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                        {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            {/* Strength Indicator & Help Text */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    {/* Strength Dots */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${value.length >= i * 3
                                        ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : 'bg-emerald-400'
                                        : 'bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className={`text-[10px] font-medium transition-colors ${value.length >= 9 ? 'text-emerald-400' : value.length >= 6 ? 'text-amber-400' : value.length >= 3 ? 'text-red-400' : 'text-slate-500'
                        }`}>
                        {value.length >= 9 ? 'Strong' : value.length >= 6 ? 'Medium' : value.length >= 3 ? 'Weak' : 'Min 8 chars'}
                    </span>
                </div>

                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-400/60" />
                    Leave empty for auto-generate
                </p>
            </div>
        </motion.div>
    );
};

export default PasscodeInput;
