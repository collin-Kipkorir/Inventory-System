import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from './firebase';

// Safe health endpoint for debugging deployment envs.
// Returns presence/length of important env vars and Firebase init state.

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const hasFsa = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const fsaLen = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? process.env.FIREBASE_SERVICE_ACCOUNT_JSON.length
      : 0;
    const hasGac = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const dbUrl = process.env.FIREBASE_DATABASE_URL || '';
    const firebaseInitialized = Array.isArray((admin as any).apps) ? (admin as any).apps.length > 0 : false;

    const body = {
      ok: true,
      env: {
        FIREBASE_SERVICE_ACCOUNT_JSON_present: hasFsa,
        FIREBASE_SERVICE_ACCOUNT_JSON_length: fsaLen,
        GOOGLE_APPLICATION_CREDENTIALS_present: hasGac,
        FIREBASE_DATABASE_URL: dbUrl ? '[set]' : '[empty]',
      },
      firebase: {
        initialized: firebaseInitialized,
      },
    };

    res.status(200).json(body);
  } catch (e) {
    console.error('health handler error:', e);
    res.status(500).json({ ok: false, error: String(e) });
  }
}
