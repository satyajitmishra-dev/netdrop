import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, LockOpen, Download, FileText, Loader2, Info, X, Mail, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api.service';
import { cryptoService } from '../services/crypto.service';
import { useSelector } from 'react-redux';

const SecureDownload = () => {
    const { fileId } = useParams();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const [email, setEmail] = useState('');
    const [passcode, setPasscode] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('');
    const [decryptedFile, setDecryptedFile] = useState(null);
    const [error, setError] = useState(null);
    const [showInfo, setShowInfo] = useState(false);

    const handleDownload = async (e) => {
        e.preventDefault();
        if (!fileId) {
            toast.error("Invalid download link");
            return;
        }
        if (!email || !passcode) {
            toast.error("Please enter both Email and Passcode");
            return;
        }

        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            // Step 1: Verify
            setProgressText('Verifying...');
            setProgress(10);
            const { downloadUrl, fileName, ownerEmail } = await apiService.getDownloadLink(fileId);

            if (email.toLowerCase().trim() !== ownerEmail.toLowerCase().trim()) {
                throw new Error("Email doesn't match the sender's email");
            }
            setProgress(20);

            // Step 2: Download
            setProgressText('Downloading...');
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error("Failed to fetch file");

            setProgress(50);
            const fullBlob = await response.blob();
            const fullBuffer = await fullBlob.arrayBuffer();

            // Step 3: Decrypt
            setProgressText('Decrypting...');
            setProgress(70);

            const salt = fullBuffer.slice(0, 16);
            const iv = fullBuffer.slice(16, 28);
            const encryptedData = fullBuffer.slice(28);

            const key = await cryptoService.deriveKeyFromPasscode(passcode, salt);
            const decryptedBuffer = await cryptoService.decrypt(encryptedData, key, iv);

            setProgress(90);
            setProgressText('Preparing file...');

            // Step 4: Ready
            const blob = new Blob([decryptedBuffer]);
            const url = URL.createObjectURL(blob);

            setDecryptedFile({
                url,
                name: fileName,
                size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
                type: fileName.split('.').pop()?.toUpperCase() || 'FILE'
            });

            setProgress(100);
            toast.success("File unlocked successfully!");

        } catch (err) {
            console.error(err);
            setError(err.message || "Invalid email or passcode");
            toast.error(err.message || "Decryption failed");
        } finally {
            setLoading(false);
        }
    };

    // Success state - file unlocked
    if (decryptedFile) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    {/* Unlocked card */}
                    <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                        {/* Unlocked icon */}
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                            <LockOpen className="w-10 h-10 text-emerald-400" />
                        </div>

                        <h2 className="text-xl font-bold text-white text-center mb-1">File Unlocked!</h2>
                        <p className="text-slate-400 text-center text-sm mb-6">Ready to download</p>

                        {/* File info */}
                        <div className="bg-slate-950/50 rounded-xl p-4 mb-6 border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                    <FileText className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium text-sm truncate">{decryptedFile.name}</p>
                                    <p className="text-slate-500 text-xs">{decryptedFile.size} • {decryptedFile.type}</p>
                                </div>
                            </div>
                        </div>

                        {/* Download button */}
                        <a
                            href={decryptedFile.url}
                            download={decryptedFile.name}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
                            onClick={() => setTimeout(() => URL.revokeObjectURL(decryptedFile.url), 1000)}
                        >
                            <Download size={20} />
                            Download File
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Main card */}
                <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl relative">

                    {/* Info button */}
                    <button
                        onClick={() => setShowInfo(true)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center transition-colors"
                        title="How it works"
                    >
                        <Info size={16} className="text-slate-400" />
                    </button>

                    {/* Lock icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                        <Lock className="w-8 h-8 text-blue-400" />
                    </div>

                    <h2 className="text-xl font-bold text-white text-center mb-1">Secure Download</h2>
                    <p className="text-slate-400 text-center text-sm mb-8">Unlock file with your credentials</p>

                    {/* Form */}
                    <form onSubmit={handleDownload} className="space-y-4">
                        {/* Email field */}
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="email"
                                placeholder="Sender's Email"
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Passcode field */}
                        <div className="relative">
                            <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Enter Passcode"
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono tracking-widest text-center"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                                required
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
                                {error}
                            </div>
                        )}

                        {/* Submit button with progress */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:cursor-wait text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-[0.98] relative overflow-hidden group"
                        >
                            {/* Animated progress bar */}
                            {loading && (
                                <>
                                    {/* Background glow */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20 animate-pulse" />

                                    {/* Progress fill */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500/40 via-teal-400/50 to-emerald-500/40 transition-all duration-500 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />

                                    {/* Shimmer effect */}
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                                        style={{
                                            backgroundSize: '200% 100%',
                                            animation: 'shimmer 1.5s infinite'
                                        }}
                                    />
                                </>
                            )}

                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="relative">
                                            <Loader2 size={20} className="animate-spin" />
                                            <div className="absolute inset-0 blur-sm animate-pulse">
                                                <Loader2 size={20} className="animate-spin text-white/50" />
                                            </div>
                                        </div>
                                        <span className="font-medium">{progressText}</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} className="group-hover:scale-110 transition-transform" />
                                        Unlock & Download
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Security badge */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        AES-256 Encrypted
                    </div>
                </div>
            </div>

            {/* Info Modal */}
            {showInfo && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInfo(false)}>
                    <div className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-700/50" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">How It Works</h3>
                            <button onClick={() => setShowInfo(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                                <X size={16} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm text-slate-300">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-400 text-xs font-bold">1</span>
                                </div>
                                <p><strong className="text-white">Enter Email:</strong> Use the email of the person who shared this file with you.</p>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-400 text-xs font-bold">2</span>
                                </div>
                                <p><strong className="text-white">Enter Passcode:</strong> Type the secret passcode shared along with the link.</p>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-400 text-xs font-bold">3</span>
                                </div>
                                <p><strong className="text-white">Unlock & Download:</strong> Your file will be decrypted securely in your browser.</p>
                            </div>

                            <div className="pt-3 border-t border-slate-700/50">
                                <p className="text-xs text-slate-500">
                                    🔒 Files are encrypted with AES-256. We never store your passcode or access your files.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecureDownload;
