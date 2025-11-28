import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Safe debug: log presence and lengths of important env vars (do NOT log the secret values)
try {
  const hasFsa = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const fsaLen = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? process.env.FIREBASE_SERVICE_ACCOUNT_JSON.length : 0;
  const hasGac = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const gacVal = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
  const dbUrl = process.env.FIREBASE_DATABASE_URL || '';
  console.log('ENV_CHECK: FIREBASE_SERVICE_ACCOUNT_JSON present=', hasFsa, 'length=', fsaLen);
  console.log('ENV_CHECK: GOOGLE_APPLICATION_CREDENTIALS present=', hasGac, 'value=', gacVal ? '[non-empty-string]' : '[empty]');
  console.log('ENV_CHECK: FIREBASE_DATABASE_URL=', dbUrl ? dbUrl : '[empty]');
} catch (err) {
  console.warn('ENV_CHECK failed:', err);
}

const url = process.env.FIREBASE_DATABASE_URL || 'https://betca-inventory-default-rtdb.firebaseio.com';

try {
  if (!admin.apps.length) {
    let serviceAccount = null;

    // Priority for credential resolution (best for deployments):
    // 1. FIREBASE_SERVICE_ACCOUNT_JSON env var (contains the JSON string)
    // 2. GOOGLE_APPLICATION_CREDENTIALS env var — either a JSON string or a file path
    // 3. backend/firebase-service-account.json file on disk (development convenience)

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        console.log('📋 Using FIREBASE_SERVICE_ACCOUNT_JSON env var');
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON as string);
      } catch (err) {
        console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT_JSON is present but could not be parsed as JSON');
      }
    }

    if (!serviceAccount && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS as string;
      // If the env var looks like JSON (starts with '{') try parsing, otherwise treat as file path
      if (gac.trim().startsWith('{')) {
        try {
          console.log('📋 Using GOOGLE_APPLICATION_CREDENTIALS env var as JSON string');
          serviceAccount = JSON.parse(gac);
        } catch (err) {
          console.warn('⚠️  GOOGLE_APPLICATION_CREDENTIALS env var looks like JSON but could not be parsed');
        }
      } else {
        const jsonPath = path.isAbsolute(gac) ? gac : path.join(process.cwd(), gac);
        if (fs.existsSync(jsonPath)) {
          try {
            console.log(`📂 Found service account at path from GOOGLE_APPLICATION_CREDENTIALS: ${jsonPath}`);
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');
            serviceAccount = JSON.parse(jsonContent);
          } catch (err) {
            console.warn('⚠️  Failed to read/parse service account JSON from GOOGLE_APPLICATION_CREDENTIALS path');
          }
        }
      }
    }

    // Try to read from firebase-service-account.json in backend folder as a last resort
    if (!serviceAccount) {
      const jsonPath = path.join(process.cwd(), 'backend', 'firebase-service-account.json');
      if (fs.existsSync(jsonPath)) {
        try {
          console.log('� Found backend/firebase-service-account.json (development only)');
          const jsonContent = fs.readFileSync(jsonPath, 'utf8');
          serviceAccount = JSON.parse(jsonContent);
        } catch (err) {
          console.warn('⚠️  Failed to read/parse backend/firebase-service-account.json');
        }
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: url,
      });
      console.log('✨ Firebase initialized successfully');
    } else {
      console.warn('⚠️  Firebase credentials not found');
    }
  }
} catch (e: unknown) {
  // Detailed error logging to aid debugging in serverless logs
  try {
    console.error('Firebase init error:', e);
    if (e && typeof e === 'object' && 'stack' in e) console.error((e as any).stack);
  } catch (err) {
    console.warn('Firebase init error (failed to print stack):', (e as any).message || e);
  }
}

function getDb() {
  try {
    if (admin.apps.length) return admin.database();
  } catch (e: unknown) {
    console.error('getDb error:', e);
    if (e && typeof e === 'object' && 'stack' in e) console.error((e as any).stack);
  }
  return null;
}

export async function read(p: string) {
  const db = getDb();
  if (!db) throw new Error('Firebase not initialized');
  const s = await db.ref(p).once('value');
  return s.val();
}

export async function push(p: string, v: any) {
  const db = getDb();
  if (!db) throw new Error('Firebase not initialized');
  const r = db.ref(p).push();
  await r.set(v);
  return { id: r.key, ...v };
}

export async function set(p: string, v: any) {
  const db = getDb();
  if (!db) throw new Error('Firebase not initialized');
  await db.ref(p).set(v);
  return v;
}

export async function update(p: string, u: any) {
  const db = getDb();
  if (!db) throw new Error('Firebase not initialized');
  await db.ref(p).update(u);
  return u;
}

export async function remove(p: string) {
  const db = getDb();
  if (!db) throw new Error('Firebase not initialized');
  await db.ref(p).remove();
}

export default admin;
