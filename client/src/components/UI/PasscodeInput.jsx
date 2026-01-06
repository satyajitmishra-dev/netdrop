import React from 'react';

const PasscodeInput = ({ value, onChange }) => {
    return (
        <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Passcode (Optional)</label>
            <input
                type="text"
                placeholder="Leave empty for auto-generated"
                value={value}
                onChange={onChange}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Min 8 characters • Auto-generated if empty</p>
        </div>
    );
};

export default PasscodeInput;
