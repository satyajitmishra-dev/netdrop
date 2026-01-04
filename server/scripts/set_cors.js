import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for .env in the parent directory (server root)
dotenv.config({ path: path.join(__dirname, "../.env") });

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});

const run = async () => {
    try {
        console.log(`Configuring CORS for bucket: ${BUCKET_NAME}...`);
        const command = new PutBucketCorsCommand({
            Bucket: BUCKET_NAME,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedHeaders: ["*"],
                        AllowedMethods: ["GET", "PUT", "HEAD"], // PUT is critical for uploads
                        AllowedOrigins: ["*"], // For dev. In prod, lock this to your domain
                        ExposeHeaders: ["ETag"],
                        MaxAgeSeconds: 3000,
                    },
                ],
            },
        });

        await s3Client.send(command);
        console.log("✅ CORS configured successfully!");
    } catch (err) {
        console.error("❌ Error configuring CORS:", err);
    }
};

run();
