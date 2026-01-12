import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ children, content, position = 'bottom', delay = 0.2 }) => {
    const [isVisible, setIsVisible] = useState(false);
    let timeoutId;

    const showTooltip = () => {
        timeoutId = setTimeout(() => setIsVisible(true), delay * 1000);
    };

    const hideTooltip = () => {
        clearTimeout(timeoutId);
        setIsVisible(false);
    };

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            <AnimatePresence>
                {isVisible && content && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0, x: position === 'left' ? 5 : position === 'right' ? -5 : 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={`absolute ${positions[position]} z-[60] px-2.5 py-1.5 bg-slate-800 text-slate-200 text-xs font-medium rounded-lg shadow-xl border border-slate-700/50 whitespace-nowrap pointer-events-none backdrop-blur-sm`}
                    >
                        {content}
                        {/* Arrow */}
                        <div className={`absolute w-2 h-2 bg-slate-800 border-slate-700/50 transform rotate-45
                            ${position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r' : ''}
                            ${position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-t border-l' : ''}
                            ${position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r' : ''}
                            ${position === 'right' ? 'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l' : ''}
                        `} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
