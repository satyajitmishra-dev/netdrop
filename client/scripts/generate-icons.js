
import { Jimp } from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generate() {
    const publicDir = path.join(__dirname, '../public');
    const source = path.join(publicDir, 'logo.png');

    console.log(`Reading source from: ${source}`);

    try {
        const image = await Jimp.read(source);

        // Generate pwa-192x192.png
        console.log('Generating pwa-192x192.png...');
        await image.clone().resize({ w: 192, h: 192 }).write(path.join(publicDir, 'pwa-192x192.png'));

        // Generate pwa-512x512.png
        console.log('Generating pwa-512x512.png...');
        await image.clone().resize({ w: 512, h: 512 }).write(path.join(publicDir, 'pwa-512x512.png'));

        // Generate apple-touch-icon.png
        console.log('Generating apple-touch-icon.png...');
        await image.clone().resize({ w: 180, h: 180 }).write(path.join(publicDir, 'apple-touch-icon.png'));

        console.log('Done!');
    } catch (err) {
        console.error('Error generating icons:', err);
        process.exit(1);
    }
}

generate();
