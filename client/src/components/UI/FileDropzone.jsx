import React from 'react';
import { Upload, FileText } from 'lucide-react';

const FileDropzone = ({ file, onFileSelect }) => {
    return (
        <div className="relative group">
            {/* Glow on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative border-2 border-dashed border-slate-700/50 rounded-2xl p-6 md:p-8 hover:border-blue-500/50 bg-slate-900/30 hover:bg-slate-800/40 backdrop-blur-sm transition-all duration-300 cursor-pointer overflow-hidden">
                <input
                    type="file"
                    onChange={onFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {file ? (
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                            <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-white font-semibold text-sm md:text-base truncate">{file.name}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to encrypt</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 py-4 md:py-6">
                        <div className="w-14 h-14 bg-slate-800/50 rounded-full flex items-center justify-center group-hover:bg-blue-500/10 transition-colors duration-300">
                            <Upload className="w-7 h-7 text-slate-500 group-hover:text-blue-400 transition-colors duration-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-200 text-sm md:text-base font-medium">Tap to choose file</p>
                            <p className="text-slate-500 text-xs mt-1">Max 50MB • All file types supported</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileDropzone;
