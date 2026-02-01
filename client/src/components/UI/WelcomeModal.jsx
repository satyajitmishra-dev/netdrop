import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, MousePointerClick, Hand,
    ArrowRight, Wifi, Zap
} from 'lucide-react';
import { useWelcome } from '../../hooks/useWelcome';

const WelcomeModal = () => {
    const { enabled, title, steps: remoteSteps, loading } = useWelcome();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    // Default steps if not provided by remote config
    const defaultSteps = [
        {
            icon: 'Wifi',
            title: "Welcome to NetDrop! 🎉",
            description: "Share files instantly between any devices on the same network. No signup required.",
            tip: "Works on Windows, Mac, iPhone, Android, and more!"
        },
        {
            icon: 'MousePointerClick',
            title: "Click to Share Files",
            description: "Click on any device to select files and send them instantly.",
            tip: "You can also drag & drop files onto a device!"
        },
        {
            icon: 'Hand',
            title: "Right-Click for Text",
            description: "Right-click (or long-press on mobile) to share text clips and messages.",
            tip: "Perfect for sharing links, passwords, or notes."
        },
        {
            icon: 'Zap',
            title: "You're Ready!",
            description: "That's all you need to know. Start sharing now!",
            tip: "Tip: Bookmark NetDrop for quick access anytime."
        }
    ];

    const steps = remoteSteps?.length > 0 ? remoteSteps : defaultSteps;

    const iconMap = {
        Wifi: <Wifi className="text-primary" size={40} />,
        MousePointerClick: <MousePointerClick className="text-emerald-400" size={40} />,
        Hand: <Hand className="text-blue-400" size={40} />,
        Zap: <Zap className="text-yellow-400" size={40} />
    };

    useEffect(() => {
        if (loading) return;

        // Only show if enabled by remote config AND user hasn't seen it before
        const hasSeenOnboarding = localStorage.getItem('netdrop_onboarding_complete');
        if (enabled && !hasSeenOnboarding) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [enabled, loading]);

    const handleClose = () => {
        localStorage.setItem('netdrop_onboarding_complete', 'true');
        setIsOpen(false);
    };

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleClose();
        }
    };

    if (!isOpen || loading) return null;

    const currentStep = steps[step];
    const stepIcon = iconMap[currentStep?.icon] || <Wifi className="text-primary" size={40} />;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/70 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    {/* Progress dots */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-2">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-colors ${idx === step ? 'bg-primary' : 'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-8 pt-14 text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col items-center"
                            >
                                {/* Icon */}
                                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                                    {stepIcon}
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-white mb-3">
                                    {currentStep?.title}
                                </h2>

                                {/* Description */}
                                <p className="text-slate-400 mb-4 leading-relaxed">
                                    {currentStep?.description}
                                </p>

                                {/* Tip */}
                                {currentStep?.tip && (
                                    <p className="text-sm text-primary/80 bg-primary/10 px-4 py-2 rounded-full">
                                        💡 {currentStep.tip}
                                    </p>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0 flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow flex items-center justify-center gap-2"
                        >
                            {step < steps.length - 1 ? (
                                <>
                                    Next
                                    <ArrowRight size={18} />
                                </>
                            ) : (
                                <>
                                    Get Started
                                    <Zap size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WelcomeModal;
