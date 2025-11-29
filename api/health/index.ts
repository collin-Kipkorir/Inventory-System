import { VercelRequest, VercelResponse } from '@vercel/node';

// Safe health endpoint for debugging deployment envs.
// Dynamically import the local api/firebase helper so we can catch import-time errors
// and return useful diagnostic information without leaking secrets.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const hasFsa = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const fsaLen = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? process.env.FIREBASE_SERVICE_ACCOUNT_JSON.length
      : 0;
    const hasGac = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const dbUrl = process.env.FIREBASE_DATABASE_URL || '';

    let firebaseInitialized = false;
    let importError: string | null = null;

    try {
      const mod = await import('../firebase');
      const admin = mod.default;
      firebaseInitialized = Array.isArray((admin as any).apps) ? (admin as any).apps.length > 0 : false;
    } catch (err) {
      importError = (err && err.stack) ? String((err as any).stack) : String(err);
      console.error('health import ../firebase error:', importError);
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
        importError: importError ? '[present]' : null,
      },
      // include the importError text only when explicitly requested via query param ?verbose=1
    } as any;

    if (importError && req.query && (req.query.verbose === '1' || req.query.verbose === 'true')) {
      body.firebase.importErrorText = importError;
    }

    res.status(200).json(body);
  } catch (e) {
    console.error('health handler error:', e);
    res.status(500).json({ ok: false, error: String(e) });
  }
}
