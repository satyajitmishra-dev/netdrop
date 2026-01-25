import React from 'react';
import { cn } from '../../utils/cn';

const GlassCard = ({ children, className, hoverEffect = false, ...props }) => {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/5 bg-surface/5 backdrop-blur-xl shadow-2xl transition-all duration-300",
                hoverEffect && "hover:bg-surface/10 hover:border-white/10 hover:scale-[1.01] hover:shadow-primary/5",
                className
            )}
            {...props}
        >
            {/* Ambient Noise/Texture (Optional, currently just gradient) */}
            <div className="absolute inset-0 bg-glass-gradient pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default GlassCard;
