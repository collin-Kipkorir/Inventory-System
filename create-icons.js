// Create minimal PWA icons
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const screenshotsDir = path.join(publicDir, 'screenshots');

// Ensure directories exist
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

// Minimal 1x1 blue PNG in base64 - this is a valid PNG file
// Decoding: 89 50 4E 47... is PNG header, followed by minimal image data
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(pngBase64, 'base64');

try {
  const files = [
    'icon-192.png',
    'icon-512.png',
    'icon-maskable-192.png',
    'icon-maskable-512.png',
    'screenshots/screenshot-192.png',
    'screenshots/screenshot-512.png'
  ];

  files.forEach(file => {
    const filePath = path.join(publicDir, file);
    fs.writeFileSync(filePath, pngBuffer);
    console.log(`✅ Created ${file}`);
  });

  console.log('\n✨ All PWA assets created successfully!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
