import React from 'react';
import { useHistory } from '../../context/HistoryContext';
import { ArrowDown, ArrowUp, File, Download, Trash2, Clock, FileText, Clipboard } from 'lucide-react';

const HistoryView = () => {
    const { history, clearHistory, downloadFile } = useHistory();

    const formatTime = (ts) => {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getIcon = (category) => {
        switch (category) {
            case 'file': return <File size={18} />;
            case 'text': return <FileText size={18} />;
            case 'clipboard': return <Clipboard size={18} />;
            default: return <File size={18} />;
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 flex flex-col h-full bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 my-4">
            <div className="flex justify-between items-center mb-6 px-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock size={20} className="text-blue-400" />
                    History
                </h2>
                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 size={14} /> Clear
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <Clock size={48} className="mb-4 opacity-20" />
                        <p>No transfer history yet</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div key={item.id} className="bg-slate-800/60 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700">
                            {/* Type Icon */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'send'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                {item.type === 'send' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="p-1 rounded-md bg-slate-700/50 text-slate-400">
                                        {getIcon(item.category)}
                                    </span>
                                    <h4 className="font-semibold text-slate-200 truncate">{item.name}</h4>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>{item.type === 'send' ? 'To' : 'From'}: <span className="text-slate-300">{item.peer}</span></span>
                                    <span>•</span>
                                    <span>{formatTime(item.timestamp)}</span>
                                    {item.size && (
                                        <>
                                            <span>•</span>
                                            <span>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action */}
                            {item.category === 'file' && item.type === 'receive' && item.blob && (
                                <button
                                    onClick={() => downloadFile(item.id)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Redownload"
                                >
                                    <Download size={18} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryView;
