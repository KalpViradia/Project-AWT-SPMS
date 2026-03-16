import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputImage = path.join(__dirname, '..', 'public', 'icon-dark.png');
const publicDir = path.join(__dirname, '..', 'public');

async function generateFavicons() {
    try {
        console.log(`Generating favicons from ${inputImage}...`);

        // Generate 32x32 favicon.ico
        await sharp(inputImage)
            .resize(32, 32)
            .toFile(path.join(publicDir, 'favicon.ico'));
        console.log('✓ favicon.ico created');

        // Generate 16x16 PNG
        await sharp(inputImage)
            .resize(16, 16)
            .toFormat('png')
            .toFile(path.join(publicDir, 'favicon-16x16.png'));
        console.log('✓ favicon-16x16.png created');

        // Generate 32x32 PNG
        await sharp(inputImage)
            .resize(32, 32)
            .toFormat('png')
            .toFile(path.join(publicDir, 'favicon-32x32.png'));
        console.log('✓ favicon-32x32.png created');

        console.log('Favicon generation complete.');
    } catch (error) {
        console.error('Error generating favicons:', error);
    }
}

generateFavicons();
