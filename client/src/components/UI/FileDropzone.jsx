import React from 'react';
import { Upload, FileText } from 'lucide-react';

const FileDropzone = ({ file, onFileSelect }) => {
    return (
        <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 hover:bg-slate-800/20 transition-all cursor-pointer relative overflow-hidden group">
            <input
                type="file"
                onChange={onFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {file ? (
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-white font-semibold text-sm truncate">{file.name}</p>
                        <p className="text-slate-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB • Max 50MB</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                    <Upload className="w-10 h-10 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <div className="text-center">
                        <p className="text-slate-300 text-sm font-medium">Tap to choose file</p>
                        <p className="text-slate-500 text-xs mt-0.5">Max 50MB</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileDropzone;
