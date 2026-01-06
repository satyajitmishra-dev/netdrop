import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cryptoService } from '../../services/crypto.service';
import { apiService } from '../../services/api.service';
import VaultHeader from '../UI/VaultHeader';
import FileDropzone from '../UI/FileDropzone';
import PasscodeInput from '../UI/PasscodeInput';
import UploadProgress from '../UI/UploadProgress';
import UploadSuccess from '../UI/UploadSuccess';

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

    const resetUpload = () => {
        setFile(null);
        setStatus('idle');
        setPasscode('');
        setShareLink('');
        setProgress(0);
    };

    return (
        <div className="w-full space-y-4">
            <VaultHeader />

            {status === 'idle' && (
                <div className="space-y-3">
                    <FileDropzone file={file} onFileSelect={handleFileSelect} />
                    <PasscodeInput
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                    />
                    <button
                        onClick={handleUpload}
                        disabled={!file}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                        <Lock size={18} />
                        Encrypt & Upload
                    </button>
                </div>
            )}

            {(status === 'encrypting' || status === 'uploading') && (
                <UploadProgress status={status} progress={progress} />
            )}

            {status === 'success' && (
                <UploadSuccess
                    shareLink={shareLink}
                    passcode={passcode}
                    onCopy={copyToClipboard}
                    onReset={resetUpload}
                />
            )}
        </div>
    );
};

export default RemoteUpload;
