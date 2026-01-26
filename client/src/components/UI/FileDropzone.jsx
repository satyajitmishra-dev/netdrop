import React, { useState } from 'react';
import { Upload, FileText, X, FileArchive, FileImage, FileVideo, FileAudio, File, Plus, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FileDropzone = ({ files = [], onFileSelect, onRemoveFile, multiple = false }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    const maxSize = 50 * 1024 * 1024; // 50MB
    const sizePercent = Math.min((totalSize / maxSize) * 100, 100);

    // Get appropriate icon based on file type
    const getFileIcon = (file) => {
        const type = file.type || '';
        if (type.startsWith('image/')) return FileImage;
        if (type.startsWith('video/')) return FileVideo;
        if (type.startsWith('audio/')) return FileAudio;
        if (type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar')) return FileArchive;
        if (type.includes('text') || type.includes('pdf') || type.includes('document')) return FileText;
        return File;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            // Simulate the file input event
            onFileSelect({ target: { files: droppedFiles } });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
        >
            {/* Animated Glow Ring */}
            <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl"
                animate={{
                    opacity: isDragOver ? 0.8 : 0
                }}
                transition={{ duration: 0.2 }}
            />

            <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                animate={{
                    borderColor: isDragOver ? 'rgba(59, 130, 246, 0.5)' : 'rgba(71, 85, 105, 0.3)',
                    scale: isDragOver ? 1.01 : 1
                }}
                className="relative border-2 border-dashed border-slate-700/30 rounded-2xl p-5 md:p-6 bg-slate-900/40 hover:bg-slate-800/50 backdrop-blur-xl transition-all duration-300 overflow-hidden"
            >
                {/* Subtle Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                        backgroundSize: '16px 16px'
                    }}
                />

                {files.length > 0 ? (
                    <div className="relative space-y-4">
                        {/* File List with Scroll */}
                        <div className="max-h-36 overflow-y-auto space-y-2 scrollbar-hide pr-1">
                            <AnimatePresence mode="popLayout">
                                {files.map((file, index) => {
                                    const IconComponent = getFileIcon(file);
                                    return (
                                        <motion.div
                                            key={`${file.name}-${index}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl p-2.5 pr-3 border border-white/[0.04] group/file transition-colors"
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-blue-600/10 rounded-lg flex items-center justify-center border border-primary/20">
                                                <IconComponent className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-white font-medium text-sm truncate">{file.name}</p>
                                                <p className="text-slate-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            {onRemoveFile && (
                                                <motion.button
                                                    type="button"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => onRemoveFile(index)}
                                                    className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors opacity-0 group-hover/file:opacity-100"
                                                >
                                                    <X size={14} className="text-red-400" />
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Add More Button */}
                        <label className="block cursor-pointer">
                            <input
                                type="file"
                                onChange={onFileSelect}
                                multiple={multiple}
                                className="hidden"
                            />
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/20 transition-colors"
                            >
                                <Plus size={16} />
                                <span>Add More Files</span>
                            </motion.div>
                        </label>

                        {/* Storage Indicator */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                    <HardDrive size={12} />
                                    {files.length} file{files.length > 1 ? 's' : ''}
                                </span>
                                <span className={`font-bold ${totalSize > maxSize ? 'text-red-400' : sizePercent > 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {totalSizeMB} / 50 MB
                                </span>
                            </div>
                            {/* Progress Bar */}
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full ${totalSize > maxSize ? 'bg-red-500' : sizePercent > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${sizePercent}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <label className="relative flex flex-col items-center gap-4 py-6 md:py-8 cursor-pointer">
                        <input
                            type="file"
                            onChange={onFileSelect}
                            multiple={multiple}
                            className="hidden"
                        />

                        {/* Upload Icon with Animation */}
                        <motion.div
                            className="relative"
                            animate={{ y: isDragOver ? -5 : 0 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {/* Glow Ring */}
                            <motion.div
                                className="absolute inset-[-8px] bg-primary/20 rounded-full blur-lg"
                                animate={{
                                    opacity: isDragOver ? 0.8 : 0,
                                    scale: isDragOver ? 1.2 : 1
                                }}
                            />
                            <div className="relative w-16 h-16 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl flex items-center justify-center border border-white/[0.06] group-hover:border-primary/30 transition-colors shadow-xl">
                                <Upload className={`w-7 h-7 transition-colors duration-300 ${isDragOver ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`} />
                            </div>
                        </motion.div>

                        {/* Text Content */}
                        <div className="text-center space-y-1">
                            <p className="text-white text-base font-semibold">
                                {isDragOver ? 'Drop to upload!' : 'Drop files or click to browse'}
                            </p>
                            <p className="text-slate-500 text-xs">
                                Up to 50MB • Any file type
                            </p>
                        </div>

                        {/* Hints */}
                        <div className="flex items-center gap-4 text-[10px] text-slate-600">
                            <span className="flex items-center gap-1">
                                <FileImage size={12} /> Images
                            </span>
                            <span className="flex items-center gap-1">
                                <FileVideo size={12} /> Videos
                            </span>
                            <span className="flex items-center gap-1">
                                <FileArchive size={12} /> Archives
                            </span>
                        </div>
                    </label>
                )}
            </motion.div>
        </motion.div>
    );
};

export default FileDropzone;
