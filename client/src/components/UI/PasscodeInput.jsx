import React from 'react';
import { Key } from 'lucide-react';

const PasscodeInput = ({ value, onChange }) => {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Key size={12} className="text-slate-500" />
                Password (Optional)
            </label>
            <div className="relative">
                <input
                    type="text"
                    placeholder="We'll create one if you skip"
                    value={value}
                    onChange={(e) => {
                        // Force uppercase
                        const upperVal = e.target.value.toUpperCase();
                        onChange({ ...e, target: { ...e.target, value: upperVal } });
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-sm tracking-wide uppercase"
                />
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pl-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
                8+ characters • We'll make one if empty
            </p>
        </div>
    );
};

export default PasscodeInput;
