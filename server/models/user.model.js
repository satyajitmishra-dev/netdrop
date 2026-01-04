import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    uid: {
        type: String, // Firebase UID
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
    },
    photoURL: {
        type: String,
    },
    usageStats: {
        filesUploaded: { type: Number, default: 0 },
        storageUsedBytes: { type: Number, default: 0 },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
