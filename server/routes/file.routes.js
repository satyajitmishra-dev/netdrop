import { Router } from "express";
import { initializeUpload, getDownloadLink } from "../controllers/file.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// Protect Upload (Only authenticated users can upload to cloud)
// Download is public (if they have the link + passcode)
router.post("/upload/init", verifyToken, initializeUpload);

router.get("/download/:fileId", getDownloadLink);

export default router;
