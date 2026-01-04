import React, { useState, useEffect } from 'react';
import { Shield, Key, Download, FileCheck, Loader2, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/api.service';
import { cryptoService } from '../services/crypto.service';
import { toast } from 'react-hot-toast';

const SecureDownload = () => {
    const [passcode, setPasscode] = useState('');
    const [fileId, setFileId] = useState('');
    const [status, setStatus] = useState('idle'); // idle, downloading, decrypting, success, error

    useEffect(() => {
        // Extract fileId from URL manually
        const pathParts = window.location.pathname.split('/');
        if (pathParts[1] === 'download' && pathParts[2]) {
            setFileId(pathParts[2]);
        }
    }, []);

    const handleDownload = async () => {
        if (!passcode || !fileId) return;

        try {
            setStatus('downloading');

            // 1. Get Presigned URL & Metadata
            const { downloadUrl, fileName } = await apiService.getDownloadLink(fileId);

            // 2. Fetch Encrypted Blob
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error("File not found or expired");
            const encryptedBuffer = await response.arrayBuffer();

            setStatus('decrypting');

            // 3. Extract Salt (16 bytes) + IV (12 bytes) + Encrypted Data
            const salt = encryptedBuffer.slice(0, 16);
            const iv = encryptedBuffer.slice(16, 28);
            const encryptedData = encryptedBuffer.slice(28);

            // 4. Derive Key
            const key = await cryptoService.deriveKeyFromPasscode(passcode, salt);

            // 5. Decrypt
            const decryptedData = await cryptoService.decrypt(encryptedData, key, iv);

            // 6. Trigger Download
            const blob = new Blob([decryptedData]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || `decrypted-file-${fileId}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            setStatus('success');
            toast.success("File Unlocked & Downloaded!");

        } catch (error) {
            console.error(error);
            setStatus('error');
            toast.error("Decryption failed. Check passcode.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card max-w-md w-full p-8 text-center border-emerald-500/20 shadow-lg shadow-emerald-500/5 bg-slate-900/80 backdrop-blur-xl">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Download className="w-8 h-8 text-emerald-500" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Secure Download</h1>
                <p className="text-text-muted mb-6">Enter the passcode to decrypt and download this file.</p>

                {!fileId ? (
                    <div className="text-red-400 bg-red-400/10 p-4 rounded-lg">
                        <AlertTriangle className="inline-block mr-2 mb-1" size={16} />
                        Invalid Link
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative">
                            <Key className="absolute left-3 top-3 text-text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Enter Passcode/Key"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-emerald-500 outline-none font-mono text-center tracking-widest text-lg"
                            />
                        </div>

                        <button
                            onClick={handleDownload}
                            disabled={status === 'downloading' || status === 'decrypting'}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                            {status === 'downloading' ? <Loader2 className="animate-spin inline mr-2" /> :
                                status === 'decrypting' ? <Loader2 className="animate-spin inline mr-2" /> :
                                    <Shield className="inline mr-2" size={18} />}

                            {status === 'downloading' ? 'Downloading Encrypted Blob...' :
                                status === 'decrypting' ? 'Decrypting Zero-Knowledge...' :
                                    'Unlock & Download'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecureDownload;
