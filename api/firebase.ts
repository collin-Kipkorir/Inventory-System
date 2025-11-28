import admin from 'firebase-admin';

// Minimal, self-contained Firebase helper for Vercel serverless functions.
// This duplicates the initialization logic but lives inside the `api` folder so
// the serverless bundle always includes it.

const url = process.env.FIREBASE_DATABASE_URL || '';

try {
  if (!admin.apps.length) {
    let serviceAccount: any = null;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON as string);
      } catch (err) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON in api/firebase:', err);
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: url || undefined,
      });
      console.log('api/firebase: Firebase initialized');
    } else {
      console.warn('api/firebase: No serviceAccount present; Firebase not initialized');
    }
  }
} catch (e) {
  console.error('api/firebase init error:', e);
}

function getDb() {
  try {
    if (admin.apps.length) return admin.database();
  } catch (e) {
    console.error('api/firebase getDb error:', e);
  }
  return null as any;
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
