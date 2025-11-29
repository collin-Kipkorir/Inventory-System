import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const screenshotsDir = path.join(publicDir, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// SVG template for icon
const iconSVG = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="#0f172a"/>
  <circle cx="256" cy="256" r="220" fill="url(#grad)"/>
  <text x="256" y="280" font-size="120" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">PI</text>
</svg>
`;

async function generateIcons() {
  try {
    console.log('📦 Generating PWA icons and screenshots...');

    // Create 192x192 icon
    await sharp(Buffer.from(iconSVG))
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ Created icon-192.png');

    // Create 512x512 icon
    await sharp(Buffer.from(iconSVG))
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ Created icon-512.png');

    // Maskable icons (same as regular)
    await sharp(Buffer.from(iconSVG))
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-maskable-192.png'));
    console.log('✅ Created icon-maskable-192.png');

    await sharp(Buffer.from(iconSVG))
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-maskable-512.png'));
    console.log('✅ Created icon-maskable-512.png');

    // Create screenshot images
    const screenshotSVG = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#bgGrad)"/>
      <rect x="10" y="10" width="492" height="492" fill="none" stroke="#3b82f6" stroke-width="4"/>
      <text x="256" y="280" font-size="48" font-weight="bold" fill="#1e40af" text-anchor="middle" font-family="Arial">Pact Inventory</text>
    </svg>
    `;

    await sharp(Buffer.from(screenshotSVG))
      .resize(192, 192)
      .png()
      .toFile(path.join(screenshotsDir, 'screenshot-192.png'));
    console.log('✅ Created screenshots/screenshot-192.png');

    await sharp(Buffer.from(screenshotSVG))
      .resize(512, 512)
      .png()
      .toFile(path.join(screenshotsDir, 'screenshot-512.png'));
    console.log('✅ Created screenshots/screenshot-512.png');

    console.log('✨ All PWA assets generated successfully!');
  } catch (error) {
    console.error('❌ Error generating assets:', error.message);
    process.exit(1);
  }
}

generateIcons();
