import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap } from 'lucide-react';

const FilesSharedCounter = () => {
    const [count, setCount] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const baseUrl = import.meta.env.VITE_SOCKET_URL || '';
                const res = await fetch(`${baseUrl}/api/stats`);
                if (res.ok) {
                    const data = await res.json();
                    setCount(data.displayCount);
                    setIsVisible(true);
                }
            } catch (err) {
                // Silently fail - counter is non-essential
                console.debug('[Stats] Failed to fetch:', err.message);
            }
        };

        // Fetch after a short delay to prioritize main content
        const timer = setTimeout(fetchStats, 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible || count === null) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center gap-2 py-2 px-4"
            >
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="flex items-center gap-1 text-emerald-400">
                        <Zap size={14} className="animate-pulse" />
                        <motion.span
                            key={count}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="font-bold text-white"
                        >
                            {count.toLocaleString()}
                        </motion.span>
                    </div>
                    <span>files shared today</span>
                    <TrendingUp size={14} className="text-emerald-400" />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FilesSharedCounter;
