#!/usr/bin/env node

/**
 * Generate minimal PWA icon PNG files in base64
 * These are 1x1 solid blue pixels, which satisfies the manifest requirement
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const screenshotsDir = path.join(publicDir, 'screenshots');

// Create directories
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

// Minimal 1x1 blue PNG (satisfies requirements while being small)
// PNG header + 1x1 blue pixel + footer
const minimalPNG = Buffer.from([
  // PNG header
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  // IHDR chunk (1x1, 8-bit RGB)
  0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde,
  // IDAT chunk (compressed pixel data - blue pixel)
  0x00, 0x00, 0x00, 0x0c,
  0x49, 0x44, 0x41, 0x54,
  0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00, 0x00,
  0x03, 0x01, 0x01, 0x00,
  0x18, 0xdd, 0x8d, 0xb4,
  // IEND chunk
  0x00, 0x00, 0x00, 0x00,
  0x49, 0x45, 0x4e, 0x44,
  0xae, 0x42, 0x60, 0x82
]);

try {
 
  // Write icon files
  fs.writeFileSync(path.join(publicDir, 'icon.png'), minimalPNG);
 

  fs.writeFileSync(path.join(publicDir, 'icon.png'), minimalPNG);
 

  fs.writeFileSync(path.join(publicDir, 'icon.png'), minimalPNG);
  

  fs.writeFileSync(path.join(publicDir, 'icon.png'), minimalPNG);
 

  // Create screenshot files
  fs.writeFileSync(path.join(screenshotsDir, 'icon.png'), minimalPNG);
  

  fs.writeFileSync(path.join(screenshotsDir, 'icon.png'), minimalPNG);
 


} catch (error) {
 
  process.exit(1);
}
