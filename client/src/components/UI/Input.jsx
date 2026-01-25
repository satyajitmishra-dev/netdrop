import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, type, error, label, ...props }, ref) => {
    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-xl border border-white/10 bg-surface/5 px-4 py-2 text-sm text-text-main shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-error/50 focus-visible:ring-error/50",
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="text-xs text-error ml-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
