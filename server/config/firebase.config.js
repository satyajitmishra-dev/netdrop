import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// We need to parse the service account JSON from the env variable
// OR use default credentials if hosted in Google Cloud
// For this setup, we'll try to parse the env string or load from a file path if provided
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;

let serviceAccount;
try {
    // If it's a JSON string
    if (serviceAccountKey && serviceAccountKey.startsWith("{")) {
        serviceAccount = JSON.parse(serviceAccountKey);
    } else if (serviceAccountKey) {
        // If it's a path, strict require would be needed but we are using ES modules.
        // For simplicity in MVP, we strongly recommend pasting the JSON string into .env
        console.warn("FIREBASE_SERVICE_ACCOUNT should be a JSON string");
    }
} catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", e);
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} else {
    console.warn("⚠️ Firebase Admin NOT initialized. Missing credentials in .env");
}

let auth;
try {
    auth = admin.auth();
} catch (error) {
    // Create a mock auth object that always rejects, so the server doesn't crash
    auth = {
        verifyIdToken: async () => { throw new Error("Firebase Admin not initialized"); }
    };
}

export { auth };
export default admin;
