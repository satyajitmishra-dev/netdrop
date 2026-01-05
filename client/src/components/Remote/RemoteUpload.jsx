import React, { useState } from 'react';
import { Shield, Upload, FileText, Check, Copy, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cryptoService } from '../../services/crypto.service';
import { apiService } from '../../services/api.service';

const RemoteUpload = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, encrypting, uploading, success
    const [progress, setProgress] = useState(0);
    const [shareLink, setShareLink] = useState('');
    const [passcode, setPasscode] = useState('');

    const handleFileSelect = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setPasscode('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        // 1. Validate File Size (Max 50MB)
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB
        if (file.size > MAX_SIZE) {
            toast.error("File limit exceeded (Max 50MB)");
            return;
        }

        // 2. Validate/Generate Passcode (Min 8 Chars)
        let finalPasscode = passcode.trim();
        if (!finalPasscode) {
            // Generate 8-char random alphanumeric string
            finalPasscode = Math.random().toString(36).slice(-8).toUpperCase();
            if (finalPasscode.length < 8) {
                // Fallback if slice gives less (rare edge case with leading zeros)
                finalPasscode = Math.random().toString(36).substring(2, 10).toUpperCase();
            }
        }

        if (finalPasscode.length < 8) {
            toast.error("Passcode must be at least 8 characters");
            return;
        }

        setPasscode(finalPasscode);

        try {
            setStatus('encrypting');
            setProgress(10);

            // 1. Derive Key from Passcode
            // Setup salt (16 bytes)
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const key = await cryptoService.deriveKeyFromPasscode(finalPasscode, salt);

            // 2. Encrypt File
            const fileBuffer = await file.arrayBuffer();
            const { encryptedBlob, iv } = await cryptoService.encrypt(fileBuffer, key);

            // Pack Salt (16) + IV (12) + EncryptedData into one blob
            const combinedBlob = new Blob([salt, iv, encryptedBlob], { type: 'application/octet-stream' });

            setProgress(40); // Encryption done

            // 3. Init Upload on Backend
            setStatus('uploading');
            const { fileId, uploadUrl } = await apiService.initUpload({
                name: file.name,
                size: combinedBlob.size,
                type: file.type,
                encrypted: true
            });

            // 4. Upload to R2
            await apiService.uploadFileToR2(uploadUrl, combinedBlob);
            setProgress(90);

            // 5. Success
            const link = `${window.location.origin}/download/${fileId}`;
            setShareLink(link);
            setStatus('success');
            setProgress(100);
            toast.success("File encrypted & uploaded!");

        } catch (error) {
            console.error(error);
            setStatus('idle');
            toast.error("Upload failed. Check console.");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${shareLink}\nPasscode: ${passcode}`);
        toast.success("Link & Passcode copied!");
    };

    return (
        <div className="card-premium w-full max-w-xl text-center">
            <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.15)]">
                <Shield className="w-10 h-10 text-blue-500" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Secure Cloud Upload</h2>
            <p className="text-slate-400 mb-8 font-medium">Zero-Knowledge Encryption. Server never sees the file.</p>

            {status === 'idle' && (
                <div className="space-y-5">
                    <div className="border-2 border-dashed border-slate-700/50 rounded-2xl p-10 hover:border-blue-500/50 hover:bg-slate-800/30 transition-all cursor-pointer relative group">
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {file ? (
                            <div className="flex flex-col items-center animate-in zoom-in-50 duration-200">
                                <FileText className="w-12 h-12 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                                <span className="text-white font-bold text-lg">{file.name}</span>
                                <span className="text-slate-500 text-sm font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center group-hover:-translate-y-1 transition-transform">
                                <Upload className="w-12 h-12 text-slate-500 mb-3 group-hover:text-blue-400 transition-colors" />
                                <span className="text-slate-400 font-medium group-hover:text-slate-300">Click to select or drag file here</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Optional Passcode (Auto-generated if empty)"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            className="input-premium font-mono"
                        />
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!file}
                        className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <Lock size={20} className="group-hover:scale-110 transition-transform" /> Encrypt & Upload
                    </button>
                </div>
            )}

            {(status === 'encrypting' || status === 'uploading') && (
                <div className="py-12 animate-in fade-in zoom-in-95">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                        <Lock className="absolute inset-0 m-auto text-white w-8 h-8 animate-pulse" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">
                        {status === 'encrypting' ? 'Encrypting File...' : 'Uploading Encrypted Blob...'}
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 font-mono">AES-256-GCM / 100k PBKDF2 Rounds</p>

                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            {status === 'success' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-6">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Upload Complete</h3>
                    </div>

                    <div className="bg-slate-950/50 rounded-xl p-5 mb-6 text-left border border-white/5 space-y-4">
                        <div>
                            <p className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider font-bold">Share Link</p>
                            <div className="text-blue-400 truncate font-mono text-sm select-all bg-slate-900/50 p-2 rounded border border-white/5">{shareLink}</div>
                        </div>

                        <div>
                            <p className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider font-bold">Passcode</p>
                            <div className="text-white font-mono text-xl select-all tracking-wider">{passcode}</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={copyToClipboard}
                            className="btn-primary w-full"
                        >
                            <Copy size={18} /> Copy Details
                        </button>
                        <button
                            onClick={() => { setFile(null); setStatus('idle'); }}
                            className="btn-glass w-full text-sm py-3"
                        >
                            Upload Another
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemoteUpload;
