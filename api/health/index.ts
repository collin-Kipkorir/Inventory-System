import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

// Safe health endpoint for debugging deployment envs.
// Initialize Firebase inline and check status.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const hasFsa = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const fsaLen = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? process.env.FIREBASE_SERVICE_ACCOUNT_JSON.length
      : 0;
    const hasGac = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const dbUrl = process.env.FIREBASE_DATABASE_URL || '';

    let firebaseInitialized = false;
    let initError: string | null = null;

    try {
      // Initialize Firebase inline if not already done
      if (!admin.apps.length) {
        let serviceAccount = null;
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
          try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
          } catch (err) {
            initError = `Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${String(err)}`;
          }
        }
        if (serviceAccount && !initError) {
          try {
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
              databaseURL: process.env.FIREBASE_DATABASE_URL || undefined,
            });
          } catch (err) {
            initError = `Failed to initialize Firebase: ${String(err)}`;
          }
        }
      }
      firebaseInitialized = admin.apps.length > 0;
    } catch (err) {
      initError = `Health check error: ${String(err)}`;
      console.error('health init error:', initError);
    }

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
        initError: initError ? '[present]' : null,
      },
    } as any;

    if (initError && req.query && (req.query.verbose === '1' || req.query.verbose === 'true')) {
      body.firebase.initErrorText = initError;
    }

    res.status(200).json(body);
  } catch (e) {
    console.error('health handler error:', e);
    res.status(500).json({ ok: false, error: String(e) });
  }
}
