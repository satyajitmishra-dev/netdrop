import React from 'react';
import { cn } from '../../utils/cn'; // Assuming cn utility exists, will need to verify or create it.
import { Loader2 } from 'lucide-react';

const PremiumButton = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    isLoading = false,
    disabled,
    onClick,
    type = 'button',
    ...props
}) => {

    const baseStyles = "relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#000926]";

    const variants = {
        primary: "bg-gradient-to-r from-[#0F52BA] to-[#1E64D8] text-white shadow-lg shadow-primary/25 hover:brightness-110 border border-white/10",
        secondary: "bg-transparent border border-secondary/30 text-secondary hover:bg-secondary/10 hover:border-secondary/50",
        danger: "bg-error/10 border border-error/30 text-error hover:bg-error/20",
        glass: "bg-white/5 border border-white/10 text-white backdrop-blur-md hover:bg-white/10",
        ghost: "hover:bg-white/5 text-text-muted hover:text-white"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "p-2.5"
    };

    return (
        <button
            type={type}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}

            {/* Subtle sheen effect for primary buttons */}
            {variant === 'primary' && !disabled && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0 pointer-events-none" />
            )}
        </button>
    );
};

export default PremiumButton;
