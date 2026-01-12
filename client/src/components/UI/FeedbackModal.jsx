import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bug, MessageSquare, Mail, Send, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? '' : 'http://localhost:5004');
    // Remove trailing slash and /api if present to avoid double api/api in requests
    return url.replace(/\/api\/?$/, '').replace(/\/$/, '');
};

const API_URL = getBaseUrl();

if (import.meta.env.PROD && !API_URL) {
    console.warn('VITE_API_URL is not defined! API requests will fail.');
}

const FeedbackModal = ({ isOpen, onClose }) => {
    const [type, setType] = useState('feedback'); // 'feedback' | 'bug' | 'contact'
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'

    const types = [
        { id: 'feedback', icon: MessageSquare, label: 'Feedback', color: 'from-blue-500 to-indigo-500' },
        { id: 'bug', icon: Bug, label: 'Report Bug', color: 'from-red-500 to-orange-500' },
        { id: 'contact', icon: Mail, label: 'Contact Us', color: 'from-emerald-500 to-teal-500' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !message.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setStatus('sending');

        try {
            const response = await fetch(`${API_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, email, message })
            });

            // Try to parse JSON response, handle empty or non-JSON responses
            let data = {};
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const text = await response.text();
                if (text) {
                    data = JSON.parse(text);
                }
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit feedback');
            }

            setStatus('success');
            toast.success('Message sent! Check your email for confirmation.');
            setTimeout(() => {
                setMessage('');
                setEmail('');
                setStatus('idle');
                onClose();
            }, 2000);
        } catch (error) {
            setStatus('error');
            toast.error(error.message || 'Failed to send. Please try again.');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const resetForm = () => {
        setMessage('');
        setEmail('');
        setStatus('idle');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed inset-0 z-[100] bg-slate-950 overflow-auto"
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

                    {/* Header */}
                    <motion.header
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between bg-gradient-to-b from-slate-950 to-transparent"
                    >
                        <button
                            onClick={() => { resetForm(); onClose(); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
                        >
                            <ArrowLeft size={18} />
                            <span className="text-sm font-semibold">Back</span>
                        </button>
                    </motion.header>

                    {/* Content */}
                    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24">
                        {status === 'success' ? (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle size={40} className="text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                                <p className="text-slate-400">Your message has been sent successfully.</p>
                            </motion.div>
                        ) : (
                            <>
                                {/* Title */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="text-center mb-8"
                                >
                                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                                        Get in Touch
                                    </h1>
                                    <p className="text-slate-400 text-base max-w-sm mx-auto">
                                        We'd love to hear from you. Send us feedback, report bugs, or just say hello!
                                    </p>
                                </motion.div>

                                {/* Type Selector */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex gap-3 mb-8"
                                >
                                    {types.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setType(t.id)}
                                            className={`flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border transition-all active:scale-95 ${type === t.id
                                                ? `bg-gradient-to-br ${t.color} border-white/20 text-white shadow-lg`
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <t.icon size={24} />
                                            <span className="text-xs font-semibold">{t.label}</span>
                                        </button>
                                    ))}
                                </motion.div>

                                {/* Form */}
                                <motion.form
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    onSubmit={handleSubmit}
                                    className="w-full max-w-md space-y-4"
                                >
                                    {/* Email (required) */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            Email <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                            required
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder={
                                                type === 'bug'
                                                    ? "Describe the bug and steps to reproduce..."
                                                    : type === 'contact'
                                                        ? "What would you like to talk about?"
                                                        : "Share your feedback with us..."
                                            }
                                            rows={5}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                                            required
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={!email.trim() || !message.trim() || status === 'sending'}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:cursor-not-allowed"
                                    >
                                        {status === 'sending' ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </motion.form>

                                {/* Contact Info */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-8 text-center"
                                >
                                    <p className="text-xs text-slate-500">
                                        Or reach us directly at{' '}
                                        <a href="mailto:support@netdrop.app" className="text-blue-400 hover:underline">
                                            healgodse@gmail.com
                                        </a>
                                    </p>
                                </motion.div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackModal;
