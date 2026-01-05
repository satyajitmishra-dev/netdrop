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

    // Remove strict auth check. instead we show form.
    // However, if we want to auto-fill email if logged in:
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const [email, setEmail] = useState('');
    const [passcode, setPasscode] = useState('');
    const [loading, setLoading] = useState(false);
    const [decryptedFile, setDecryptedFile] = useState(null);
    const [error, setError] = useState(null);

    const handleDownload = async (e) => {
        e.preventDefault();
        // Validation
        if (!email || !passcode) {
            toast.error("Please enter both Email and Passcode");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Verifying & Decrypting...");

        try {
            // 1. Get Presigned URL
            const { downloadUrl, fileName } = await apiService.getDownloadLink(fileId);

            // 2. Fetch Encrypted Blob
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error("Failed to fetch file data");
            const fullBlob = await response.blob();
            const fullBuffer = await fullBlob.arrayBuffer();

            // 3. Extract Salt (16 bytes) and IV (12 bytes) from the start of the file
            const salt = fullBuffer.slice(0, 16);
            const iv = fullBuffer.slice(16, 28);
            const encryptedData = fullBuffer.slice(28);

            // 4. Derive Key & Decrypt
            const key = await cryptoService.deriveKeyFromPasscode(passcode, salt);

            // Note: cryptoService.decrypt expects the data buffer, key, and iv
            const decryptedBuffer = await cryptoService.decrypt(encryptedData, key, iv);

            // 5. Create Download Link
            const blob = new Blob([decryptedBuffer]);
            const url = URL.createObjectURL(blob);
            setDecryptedFile({
                url,
                name: fileName,
                size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
                type: blob.type // or fetch mime type from metadata if available
            });

            toast.success("Decryption Successful!", { id: toastId });
        } catch (err) {
            console.error(err);
            setError("Invalid Passcode or Data Corruption");
            toast.error("Decryption Failed", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (decryptedFile) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card-premium w-full max-w-md text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                        <FileText className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2 tracking-tight">{decryptedFile.name}</h2>
                    <div className="flex items-center justify-center gap-3 text-slate-400 text-sm mb-8 font-medium">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">{decryptedFile.size}</span>
                        <span>•</span>
                        <span className="uppercase">{decryptedFile.type?.split('/')[1] || 'FILE'}</span>
                    </div>

                    <a
                        href={decryptedFile.url}
                        download={decryptedFile.name}
                        className="btn-primary w-full py-4 text-lg group"
                        onClick={() => setTimeout(() => URL.revokeObjectURL(decryptedFile.url), 1000)}
                    >
                        <Download className="group-hover:animate-bounce" size={20} />
                        Download File
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card-premium w-full max-w-md shadow-2xl">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-blue-500/20 rotate-3 transition-transform hover:rotate-6">
                    <Lock className="w-8 h-8 text-blue-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">Secure Download</h2>
                <p className="text-slate-400 text-center mb-8 text-sm font-medium">
                    Enter credentials to decrypt & download
                </p>

                <form onSubmit={handleDownload} className="w-full flex flex-col gap-5">
                    <div className="relative group">
                        <input
                            type="email"
                            placeholder="Enter Email Address"
                            className="input-premium pl-4"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Enter Passcode"
                            className="input-premium text-center tracking-[0.5em] font-mono text-lg font-bold"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium animate-in shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <> <Shield size={20} className="group-hover:scale-110 transition-transform" /> Decrypt & Download </>}
                    </button>
                </form>

                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    End-to-End Encrypted via AES-256
                </div>
            </div>
        </div>
    );
};

export default SecureDownload;
