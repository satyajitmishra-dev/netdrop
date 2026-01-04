import { auth } from "../config/firebase.config.js";

export const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken; // Attach user info to request
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(403).json({ error: "Unauthorized: Invalid token" });
    }
};
