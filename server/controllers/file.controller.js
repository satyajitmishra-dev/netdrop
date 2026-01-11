import { getPresignedUploadUrl, getPresignedDownloadUrl } from "../services/storage.service.js";
import { v4 as uuidv4 } from "uuid";
import FileModel from "../models/file.model.js";

export const initializeUpload = async (req, res) => {
    try {
        const { name, size, type, encrypted } = req.body;
        const user = req.user; // From auth middleware

        // Enforce 50MB limit
        const MAX_SIZE = 50 * 1024 * 1024;
        if (size > MAX_SIZE) {
            return res.status(400).json({ error: "File too large. Max 50MB allowed." });
        }

        // Generate a unique file ID
        const fileId = uuidv4();
        const key = `${fileId}.enc`;

        // Get Presigned URL
        const uploadUrl = await getPresignedUploadUrl(key, "application/octet-stream");

        // Save metadata to MongoDB with owner info
        await FileModel.create({
            fileId,
            name,
            size,
            type,
            encrypted: !!encrypted,
            owner: user?.uid || null,
            ownerEmail: user?.email || 'anonymous@netdrop.app'
        });

        res.status(200).json({
            fileId,
            key,
            uploadUrl,
        });
    } catch (error) {
        console.error("Upload Init Error:", error);
        res.status(500).json({ error: "Failed to initialize upload" });
    }
};

export const getDownloadLink = async (req, res) => {
    try {
        const { fileId } = req.params;
        const key = `${fileId}.enc`;

        // 1. Get Presigned Download URL
        const downloadUrl = await getPresignedDownloadUrl(key);

        // 2. Fetch Metadata from DB
        const fileDoc = await FileModel.findOne({ fileId });

        if (!fileDoc) {
            return res.status(404).json({ error: "File metadata not found" });
        }

        res.status(200).json({
            downloadUrl,
            fileName: fileDoc.name,
            fileType: fileDoc.type,
            ownerEmail: fileDoc.ownerEmail
        });
    } catch (error) {
        console.error("Download Link Error:", error);
        res.status(500).json({ error: "Failed to generate download link" });
    }
};
