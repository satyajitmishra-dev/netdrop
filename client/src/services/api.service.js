const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5004/api";

// Helper to get token from Redux store (via local storage or direct access if easier, 
// but for cleaner service architecture, we'll try to get it from the store instance if possible or localStorage)
// For MVP, we'll assume the token is stored in localStorage by the auth slice or component upon login
// OR we can access the store directly.
import { store } from "../store/store";

const getHeaders = () => {
    const state = store.getState();
    const token = state.auth.token;
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

export const apiService = {
    // Initialize upload session & get presigned URL
    initUpload: async (metadata) => {
        const response = await fetch(`${API_URL}/files/upload/init`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(metadata),
        });
        if (!response.ok) throw new Error("Failed to init upload (Unauthorized?)");
        return await response.json();
    },

    // Upload the actual encrypted blob to R2
    uploadFileToR2: async (uploadUrl, encryptedBlob) => {
        const response = await fetch(uploadUrl, {
            method: "PUT",
            body: encryptedBlob,
            headers: {
                "Content-Type": "application/octet-stream",
            },
        });
        if (!response.ok) throw new Error("Failed to upload to Cloud storage");
        return true;
    },

    // Get download link
    getDownloadLink: async (fileId) => {
        const response = await fetch(`${API_URL}/files/download/${fileId}`);
        if (!response.ok) throw new Error("Failed to get download link");
        return await response.json();
    },
};
