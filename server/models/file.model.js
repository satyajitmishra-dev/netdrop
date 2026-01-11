import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    fileId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    encrypted: {
        type: Boolean,
        default: true,
    },
    // In future we can store IV/Salt here if we decouple them from blob
    // For now we rely on blob packing
    owner: {
        type: String, // Firebase UID (optional for now)
        default: null
    },
    ownerEmail: {
        type: String, // User's email who uploaded the file
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // TTL: Auto-delete after 24 hours (feature request)
    }
});

const FileModel = mongoose.model("File", fileSchema);
export default FileModel;
