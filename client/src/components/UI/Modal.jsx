import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import GlassCard from './GlassCard';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    className,
    maxWidth = "max-w-md",
    showCloseButton = true // default true
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200); // Wait for exit animation
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Modal Content */}
            <GlassCard
                className={cn(
                    "relative w-full z-10 p-0 overflow-hidden transform transition-all duration-300",
                    isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0",
                    maxWidth,
                    className
                )}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                        {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors ml-auto"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>
            </GlassCard>
        </div>,
        document.body
    );
};

export default Modal;
