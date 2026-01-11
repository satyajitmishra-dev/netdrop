import React, { useState } from 'react';
import { Lock, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';
import { cryptoService } from '../../services/crypto.service';
import { apiService } from '../../services/api.service';
import VaultHeader from '../UI/VaultHeader';
import FileDropzone from '../UI/FileDropzone';
import PasscodeInput from '../UI/PasscodeInput';
import UploadProgress from '../UI/UploadProgress';
import UploadSuccess from '../UI/UploadSuccess';

const RemoteUpload = () => {
    const [files, setFiles] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, zipping, encrypting, uploading, success
    const [progress, setProgress] = useState(0);
    const [shareLink, setShareLink] = useState('');
    const [passcode, setPasscode] = useState('');

    const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const allFiles = [...files, ...newFiles];

            // Check total size
            const totalSize = allFiles.reduce((acc, f) => acc + f.size, 0);
            if (totalSize > MAX_TOTAL_SIZE) {
                toast.error(`Total size exceeds 50MB limit (${(totalSize / 1024 / 1024).toFixed(2)} MB selected)`);
                return;
            }

            setFiles(allFiles);
            setStatus('idle');
        }
    };

    const handleRemoveFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        // Validate total size
        const totalSize = files.reduce((acc, f) => acc + f.size, 0);
        if (totalSize > MAX_TOTAL_SIZE) {
            toast.error("Total file size exceeds 50MB limit");
            return;
        }

        // Generate/Validate Passcode
        let finalPasscode = passcode.trim();
        if (!finalPasscode) {
            finalPasscode = Math.random().toString(36).slice(-8).toUpperCase();
            if (finalPasscode.length < 8) {
                finalPasscode = Math.random().toString(36).substring(2, 10).toUpperCase();
            }
        }

        if (finalPasscode.length < 8) {
            toast.error("Passcode must be at least 8 characters");
            return;
        }

        setPasscode(finalPasscode);

        try {
            // Step 1: Zip files if multiple
            let fileToUpload;
            let fileName;

            if (files.length > 1) {
                setStatus('zipping');
                setProgress(5);

                const zip = new JSZip();

                // Add each file to zip
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const arrayBuffer = await file.arrayBuffer();
                    zip.file(file.name, arrayBuffer);
                    setProgress(5 + Math.round((i + 1) / files.length * 20)); // 5-25%
                }

                // Generate zip blob
                const zipBlob = await zip.generateAsync({
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 6 }
                }, (metadata) => {
                    setProgress(25 + Math.round(metadata.percent * 0.1)); // 25-35%
                });

                fileName = `NetDrop_${files.length}_files.zip`;
                fileToUpload = new File([zipBlob], fileName, { type: 'application/zip' });
            } else {
                fileToUpload = files[0];
                fileName = files[0].name;
            }

            // Step 2: Encrypt
            setStatus('encrypting');
            setProgress(40);

            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const key = await cryptoService.deriveKeyFromPasscode(finalPasscode, salt);

            const fileBuffer = await fileToUpload.arrayBuffer();
            const { encryptedBlob, iv } = await cryptoService.encrypt(fileBuffer, key);

            // Pack Salt (16) + IV (12) + EncryptedData
            const combinedBlob = new Blob([salt, iv, encryptedBlob], { type: 'application/octet-stream' });

            setProgress(60);

            // Step 3: Upload
            setStatus('uploading');
            const { fileId, uploadUrl } = await apiService.initUpload({
                name: fileName,
                size: combinedBlob.size,
                type: fileToUpload.type,
                encrypted: true
            });

            setProgress(75);

            await apiService.uploadFileToR2(uploadUrl, combinedBlob);
            setProgress(95);

            // Step 4: Success
            const link = `${window.location.origin}/download/${fileId}`;
            setShareLink(link);
            setStatus('success');
            setProgress(100);

            const fileCount = files.length;
            toast.success(`${fileCount > 1 ? `${fileCount} files bundled,` : 'File'} encrypted & uploaded!`);

        } catch (error) {
            console.error(error);
            setStatus('idle');
            toast.error("Upload failed. Check console.");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`🔗 ${shareLink}\n🔑 Passcode: ${passcode}`);
        toast.success("Link & Passcode copied!");
    };

    const resetUpload = () => {
        setFiles([]);
        setStatus('idle');
        setPasscode('');
        setShareLink('');
        setProgress(0);
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'zipping': return 'Bundling files...';
            case 'encrypting': return 'Encrypting...';
            case 'uploading': return 'Uploading...';
            default: return 'Processing...';
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-5 px-4 md:px-0">
            <VaultHeader />

            {status === 'idle' && (
                <div className="space-y-4">
                    <FileDropzone
                        files={files}
                        onFileSelect={handleFileSelect}
                        onRemoveFile={handleRemoveFile}
                        multiple={true}
                    />
                    <PasscodeInput
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                    />
                    <button
                        onClick={handleUpload}
                        disabled={files.length === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 disabled:shadow-none active:scale-[0.98]"
                    >
                        <Lock size={18} />
                        {files.length > 1 ? (
                            <>Bundle & Encrypt ({files.length} files)</>
                        ) : (
                            <>Encrypt & Upload</>
                        )}
                    </button>

                    {files.length > 1 && (
                        <p className="text-center text-xs text-slate-500">
                            <Package size={12} className="inline mr-1" />
                            Files will be bundled into a single ZIP with one download link
                        </p>
                    )}
                </div>
            )}

            {(status === 'zipping' || status === 'encrypting' || status === 'uploading') && (
                <div className="space-y-3">
                    <UploadProgress status={status} progress={progress} />
                    <p className="text-center text-sm text-slate-400">{getStatusLabel()}</p>
                </div>
            )}

            {status === 'success' && (
                <UploadSuccess
                    shareLink={shareLink}
                    passcode={passcode}
                    onCopy={copyToClipboard}
                    onReset={resetUpload}
                    fileCount={files.length}
                />
            )}
        </div>
    );
};

export default RemoteUpload;
