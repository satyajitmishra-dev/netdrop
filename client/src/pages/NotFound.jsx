import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Ghost, Home, AlertOctagon, WifiOff, RefreshCw } from 'lucide-react';

const MESSAGES = [
    "Looks like this file got lost in the cloud... literally.",
    "The frequency you're looking for doesn't exist.",
    "Houston, we have a 404.",
    "This page has been AirDropped into a black hole.",
    "Nothing to see here. Just empty space.",
    "You've ventured too far from the network."
];

const NotFound = () => {
    // Mouse Parallax Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        x.set(clientX - centerX);
        y.set(clientY - centerY);
    };

    const textX = useTransform(x, [-500, 500], [-30, 30]);
    const textY = useTransform(y, [-500, 500], [-30, 30]);
    const ghostX = useTransform(x, [-500, 500], [40, -40]);
    const ghostY = useTransform(y, [-500, 500], [40, -40]);

    const [message, setMessage] = useState(MESSAGES[0]);

    useEffect(() => {
        setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden px-4"
            onMouseMove={handleMouseMove}
        >

            {/* --- Deep Space Background --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Dynamic Nebula */}
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-50%] left-[-20%] w-[120vw] h-[120vw] bg-blue-900/10 rounded-full blur-[200px]"
                />

                {/* Floating Stars */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white rounded-full"
                        style={{
                            width: Math.random() * 3 + 1,
                            height: Math.random() * 3 + 1,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.1
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.2, 0.8, 0.2]
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-10 max-w-2xl perspective-1000">

                {/* --- Interactive 3D 404 --- */}
                {/* --- Interactive 3D 404 --- */}
                <div className="relative">
                    {/* Background Watermark */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
                    >
                        <h2 className="text-[12vw] font-black text-slate-700/50 whitespace-nowrap tracking-widest blur-[2px] transform -translate-y-12 select-none">
                            NOT FOUND
                        </h2>
                    </motion.div>

                    <motion.div
                        style={{ x: textX, y: textY, rotateX: useTransform(y, [-300, 300], [10, -10]), rotateY: useTransform(x, [-300, 300], [-10, 10]) }}
                        className="relative z-20 flex items-center justify-center gap-4"
                    >
                        <span className="text-[140px] md:text-[220px] font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-800 leading-none select-none tracking-tighter drop-shadow-2xl">4</span>
                        <div className="relative flex items-center justify-center w-[120px] h-[120px] md:w-[180px] md:h-[180px]">
                            {/* Ghost Icon taking place of '0' */}
                            <Ghost className="w-full h-full text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-bounce-slow" strokeWidth={1.5} />
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse-slow"></div>
                        </div>
                        <span className="text-[140px] md:text-[220px] font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-800 leading-none select-none tracking-tighter drop-shadow-2xl">4</span>
                    </motion.div>
                </div>

                {/* --- Dynamic Messaging --- */}
                <div className="space-y-6 relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={message} // Re-animate on change
                        className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 px-8 py-4 rounded-full inline-block"
                    >
                        <p className="text-blue-200 font-mono text-sm md:text-base typing-cursor">
                            &gt; {message}<span className="animate-pulse">_</span>
                        </p>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = '/'}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                        >
                            <Home size={18} />
                            Return Home
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, rotate: 180 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ rotate: { duration: 0.5 } }} // Spin icon only? No, spin whole button is weird. Let's spin icon.
                            onClick={() => setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)])}
                            className="p-4 bg-slate-800 text-slate-400 hover:text-white rounded-xl font-semibold transition-all border border-slate-700 hover:border-slate-600"
                            title="Generate new excuse"
                        >
                            <RefreshCw size={20} />
                        </motion.button>
                    </div>
                </div>

            </div>

            {/* --- Footer Status --- */}
            <div className="fixed bottom-8 left-0 right-0 text-center pointer-events-none">
                <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.3em] opacity-50">
                    System Malfunction • Coordinates Unknown
                </p>
            </div>
        </div>
    );
};

export default NotFound;
