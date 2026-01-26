import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const HistoryContext = createContext(null);

export const HistoryProvider = ({ children }) => {
    // Default to false (disabled) as per requirement
    const [isEnabled, setIsEnabled] = useState(() => {
        const saved = localStorage.getItem('netdrop_history_enabled');
        return saved === 'true'; // Default is FALSE if not set
    });

    const [history, setHistory] = useState([]);

    const toggleHistory = useCallback(() => {
        setIsEnabled(prev => {
            const newState = !prev;
            localStorage.setItem('netdrop_history_enabled', newState);
            if (!newState) {
                // Optional: Clear history when disabling? Or keep it?
                // Usually "Disable" just stops recording. We keep existing.
                // If user wants to clear, they use the clear button.
            }
            return newState;
        });
    }, []);

    /**
     * @param {Object} item
     * ...
     */
    const addToHistory = useCallback((item) => {
        if (!isEnabled) return; // Stop if history is disabled

        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newItem = {
            id,
            timestamp: Date.now(),
            ...item
        };
        setHistory(prev => [newItem, ...prev]);

        // Expiry Logic for Files (180s)
        if (item.category === 'file' && item.blob) {
            setTimeout(() => {
                setHistory(prev => prev.map(h => {
                    if (h.id === id) {
                        return { ...h, blob: null, expired: true }; // Clear blob to free memory
                    }
                    return h;
                }));
            }, 180000); // 3 minutes
        }
    }, [isEnabled]); // Depend on isEnabled

    const clearHistory = useCallback(() => {
        setHistory([]);
        toast.success("History cleared");
    }, []);

    const downloadFile = useCallback((id) => {
        const item = history.find(h => h.id === id);
        if (item && item.blob) {
            const url = URL.createObjectURL(item.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.name;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            toast.error("File expired or unavailable");
        }
    }, [history]);

    return (
        <HistoryContext.Provider value={{
            history,
            addToHistory,
            clearHistory,
            downloadFile,
            isEnabled,
            toggleHistory
        }}>
            {children}
        </HistoryContext.Provider>
    );
};

export const useHistory = () => {
    const context = useContext(HistoryContext);
    if (!context) {
        throw new Error('useHistory must be used within a HistoryProvider');
    }
    return context;
};
