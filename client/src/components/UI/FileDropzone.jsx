import React from 'react';
import { Upload, FileText, X } from 'lucide-react';

const FileDropzone = ({ files = [], onFileSelect, onRemoveFile, multiple = false }) => {
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

    return (
        <div className="relative group">
            {/* Glow on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative border-2 border-dashed border-slate-700/50 rounded-2xl p-6 md:p-8 hover:border-blue-500/50 bg-slate-900/30 hover:bg-slate-800/40 backdrop-blur-sm transition-all duration-300 overflow-hidden">
                {files.length > 0 ? (
                    <div className="space-y-3">
                        {/* File list */}
                        <div className="max-h-40 overflow-y-auto space-y-2 scrollbar-hide">
                            {files.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-2.5 pr-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-lg flex items-center justify-center border border-blue-500/20">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-white font-medium text-sm truncate">{file.name}</p>
                                        <p className="text-slate-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    {onRemoveFile && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveFile(index)}
                                            className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                                        >
                                            <X size={14} className="text-red-400" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add more files button */}
                        <label className="block cursor-pointer">
                            <input
                                type="file"
                                onChange={onFileSelect}
                                multiple={multiple}
                                className="hidden"
                            />
                            <div className="flex items-center justify-center gap-2 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                <Upload size={16} />
                                <span>Add more files</span>
                            </div>
                        </label>

                        {/* Total size indicator */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/50">
                            <span className="text-slate-400">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
                            <span className={`font-medium ${totalSize > 50 * 1024 * 1024 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {totalSizeMB} / 50 MB
                            </span>
                        </div>
                    </div>
                ) : (
                    <label className="flex flex-col items-center gap-3 py-4 md:py-6 cursor-pointer">
                        <input
                            type="file"
                            onChange={onFileSelect}
                            multiple={multiple}
                            className="hidden"
                        />
                        <div className="w-14 h-14 bg-slate-800/50 rounded-full flex items-center justify-center group-hover:bg-blue-500/10 transition-colors duration-300">
                            <Upload className="w-7 h-7 text-slate-500 group-hover:text-blue-400 transition-colors duration-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-200 text-sm md:text-base font-medium">
                                {multiple ? 'Tap to choose files' : 'Tap to choose file'}
                            </p>
                            <p className="text-slate-500 text-xs mt-1">Max 50MB total • All file types supported</p>
                        </div>
                    </label>
                )}
            </div>
        </div>
    );
};

export default FileDropzone;
