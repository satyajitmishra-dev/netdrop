import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, Download, FileText, ShieldAlert, Loader2, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api.service';
import { cryptoService } from '../services/crypto.service';
import { useSelector } from 'react-redux';
import Login from '../components/Auth/Login';

const SecureDownload = () => {
    const { fileId } = useParams();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [passcode, setPasscode] = useState('');
    const [loading, setLoading] = useState(false);
    const [decryptedFile, setDecryptedFile] = useState(null);
    const [error, setError] = useState(null);

    // Auto-extract fileId if not in params (e.g. if using a different route structure)
    // But strictly useParams is best. 

    const handleDownload = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error("Please log in to verify your identity.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Verifying & Decrypting...");

        try {
            // 1. Get Presigned URL
            const { downloadUrl, fileName, keySalt, iv } = await apiService.getDownloadLink(fileId);

            // 2. Fetch Encrypted Blob
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error("Failed to fetch file data");
            const encryptedBlob = await response.blob();
            const encryptedBuffer = await encryptedBlob.arrayBuffer();

            // 3. Derive Key & Decrypt
            const key = await cryptoService.deriveKeyFromPasscode(passcode, keySalt);
            const decryptedBuffer = await cryptoService.decryptFile(encryptedBuffer, key, iv);

            // 4. Create Download Link
            const blob = new Blob([decryptedBuffer]);
            const url = URL.createObjectURL(blob);
            setDecryptedFile({ url, name: fileName });

            toast.success("Decryption Successful!", { id: toastId });
        } catch (err) {
            console.error(err);
            setError("Invalid Passcode or Permissions");
            toast.error("Decryption Failed", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-w-md w-full p-8 text-center">
                    <ShieldAlert className="w-16 h-16 text-orange-500 mb-6 mx-auto" />
                    <h2 className="text-2xl font-bold text-white mb-2">Secure Access Required</h2>
                    <p className="text-slate-400 mb-8">This file is protected by NetDrop Enterprise encryption. Please sign in to verify your identity.</p>
                    <Login />
                </div>
            </div>
        );
    }

    if (decryptedFile) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 mx-auto ring-1 ring-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <FileText className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{decryptedFile.name}</h2>
                    <p className="text-emerald-400 text-sm mb-8 font-medium">Ready for Download</p>

                    <a
                        href={decryptedFile.url}
                        download={decryptedFile.name}
                        className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group"
                        onClick={() => setTimeout(() => URL.revokeObjectURL(decryptedFile.url), 1000)}
                    >
                        <Download className="group-hover:animate-bounce" size={20} />
                        Save File
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-w-md w-full p-8">
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 mx-auto ring-1 ring-blue-500/50 rotate-3 transition-transform hover:rotate-6">
                    <Lock className="w-8 h-8 text-blue-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 text-center">Secure Download</h2>
                <p className="text-slate-400 text-center mb-8 text-sm">
                    Enter the unique security passcode to decrypt this file.
                </p>

                <form onSubmit={handleDownload} className="w-full flex flex-col gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Enter Passcode"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center tracking-widest font-mono text-lg"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <> <Shield size={18} /> Decrypt & Download </>}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    End-to-End Encrypted via AES-GCM-256
                </div>
            </div>
        </div>
    );
};

export default SecureDownload;
