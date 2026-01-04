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

        // Generate a random passcode if not set (for demo)
        const finalPasscode = passcode || Math.random().toString(36).slice(-6).toUpperCase();
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
        <div className="card p-8 text-center border-accent/20 shadow-lg shadow-accent/5 backdrop-blur-2xl bg-slate-900/60 w-full max-w-xl">
            <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent/20">
                <Shield className="w-10 h-10 text-accent" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Secure Cloud Upload</h2>
            <p className="text-text-muted mb-6">Zero-Knowledge Encryption. Server never sees the file.</p>

            {status === 'idle' && (
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-accent/50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {file ? (
                            <div className="flex flex-col items-center">
                                <FileText className="w-10 h-10 text-secondary mb-2" />
                                <span className="text-white font-medium">{file.name}</span>
                                <span className="text-text-muted text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload className="w-10 h-10 text-text-muted mb-2" />
                                <span className="text-text-muted">Click to select or drag file here</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Optional Passcode (Auto-generated if empty)"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                        />
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!file}
                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Lock size={18} /> Encrypt & Upload
                    </button>
                </div>
            )}

            {(status === 'encrypting' || status === 'uploading') && (
                <div className="py-8">
                    <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-1">
                        {status === 'encrypting' ? 'Encrypting File...' : 'Uploading Encrypted Blob...'}
                    </h3>
                    <p className="text-text-muted text-sm mb-4">performing AES-256-GCM operations</p>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            {status === 'success' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                        <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-white">Upload Complete</h3>
                    </div>

                    <div className="bg-slate-950 rounded-lg p-4 mb-4 text-left">
                        <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Share Link</p>
                        <div className="text-secondary truncate font-mono text-sm mb-3 select-all">{shareLink}</div>

                        <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Passcode</p>
                        <div className="text-white font-mono text-lg select-all">{passcode}</div>
                    </div>

                    <button
                        onClick={copyToClipboard}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-600 flex items-center justify-center gap-2"
                    >
                        <Copy size={18} /> Copy Details
                    </button>
                    <button
                        onClick={() => { setFile(null); setStatus('idle'); }}
                        className="mt-2 w-full py-2 text-text-muted hover:text-white text-sm"
                    >
                        Upload Another
                    </button>
                </div>
            )}
        </div>
    );
};

export default RemoteUpload;
