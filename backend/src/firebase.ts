import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const url = process.env.FIREBASE_DATABASE_URL || 'https://betca-inventory-default-rtdb.firebaseio.com';

try {
  if (!admin.apps.length) {
    let serviceAccount = null;

    // Try to read from firebase-service-account.json in backend folder
    const jsonPath = path.join(process.cwd(), 'firebase-service-account.json');
    if (fs.existsSync(jsonPath)) {
      console.log('📂 Found firebase-service-account.json');
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      serviceAccount = JSON.parse(jsonContent);
    }

    // If not found, try environment variable
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      console.log('📋 Using FIREBASE_SERVICE_ACCOUNT_JSON env var');
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
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
  console.warn('Firebase init error:', (e as any).message || e);
}

function getDb() {
  try {
    if (admin.apps.length) return admin.database();
  } catch (e: unknown) {
    console.warn('getDb:', (e as any).message || e);
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
