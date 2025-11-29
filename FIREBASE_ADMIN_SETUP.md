# Firebase Realtime Database Admin Credentials Setup

## Step 1: Install Firebase SDK

```bash
npm install firebase bcryptjs
npm install --save-dev @types/bcryptjs
```

## Step 2: Update .env File

Create a `.env.local` file in your project root with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

## Step 3: Set Up Firebase Realtime Database Rules

Go to Firebase Console > Realtime Database > Rules and set:

```json
{
  "rules": {
    "admins": {
      ".read": false,
      ".write": false,
      "$uid": {
        ".read": "auth != null",
        ".write": "auth.uid === $uid"
      }
    }
  }
}
```

## Step 4: Create Admin Users

### Option A: Using Admin Script

1. Create `scripts/createAdmin.ts`:

```typescript
import * as bcrypt from "bcryptjs";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function createAdmin(username: string, email: string, password: string) {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const adminId = username.toLowerCase().replace(/[^a-z0-9]/g, "");
    const adminRef = ref(database, `admins/${adminId}`);

    await set(adminRef, {
      username,
      email,
      passwordHash,
      createdAt: Date.now(),
    });

    console.log(`✓ Admin user "${username}" created successfully`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

// Get credentials from command line arguments
const [, , username, email, password] = process.argv;

if (!username || !email || !password) {
  console.error("Usage: npx ts-node scripts/createAdmin.ts <username> <email> <password>");
  process.exit(1);
}

createAdmin(username, email, password);
```

2. Add to `package.json` scripts:

```json
{
  "scripts": {
    "create-admin": "ts-node scripts/createAdmin.ts"
  }
}
```

3. Run:

```bash
npm run create-admin admin admin@example.com your-secure-password
```

### Option B: Using Firebase Console

1. Go to Firebase Console > Realtime Database
2. Click "Create Database" if you haven't already
3. Navigate to `/admins` (create if doesn't exist)
4. Add a new child with key like `admin_user_1`:

```json
{
  "admins": {
    "admin_user_1": {
      "username": "admin",
      "email": "admin@example.com",
      "passwordHash": "$2b$10$...", // Use bcrypt hash
      "createdAt": 1234567890000
    }
  }
}
```

To get a bcrypt hash, run in Node:

```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('your-password', 10).then(hash => console.log(hash));
```

## Step 5: Update AuthContext to Use Firebase

Modify `src/contexts/AuthContext.tsx`:

```typescript
import { getAdminByUsername, updateLastLogin } from "@/lib/firebaseAdmin";
import { verifyPassword } from "@/lib/password";

const login = async (username: string, password: string): Promise<void> => {
  setIsLoading(true);
  try {
    // Get admin from Firebase
    const admin = await getAdminByUsername(username);
    
    if (!admin) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.passwordHash);
    
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Update last login
    await updateLastLogin(username);

    const userData: User = {
      username: admin.username,
      token: `token_${Date.now()}`, // Or use JWT in production
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    navigate("/");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

## Step 6: Database Structure Reference

Firebase Realtime Database path: `/admins`

```
admins/
├── admin_user_1/
│   ├── username: "admin"
│   ├── email: "admin@example.com"
│   ├── passwordHash: "$2b$10$..." (bcrypt hash)
│   ├── createdAt: 1704067200000
│   └── lastLogin: 1704070800000
├── admin_user_2/
│   ├── username: "manager"
│   ├── email: "manager@example.com"
│   ├── passwordHash: "$2b$10$..." (bcrypt hash)
│   ├── createdAt: 1704067200000
│   └── lastLogin: 1704070800000
```

## Troubleshooting

### Firebase Rules Blocking Access

If you get "Permission denied" errors, update your Realtime Database Rules:

```json
{
  "rules": {
    "admins": {
      ".read": true,
      ".write": false
    }
  }
}
```

**Note:** This is insecure for production. Use proper authentication rules.

### Password Verification Failing

Make sure you're using the same bcryptjs version on frontend and backend. Bcrypt hashes are deterministic across versions.

### Missing Environment Variables

Double-check:
- `.env.local` file exists in project root
- All `VITE_FIREBASE_*` variables are set
- Restart dev server after changing `.env.local`

## Security Best Practices

1. ✅ Use bcryptjs for password hashing (never store plain text)
2. ✅ Use HTTPS for all communications
3. ✅ Implement rate limiting on login attempts
4. ✅ Use strong passwords for admin accounts
5. ✅ Regularly audit login attempts (store lastLogin timestamp)
6. ✅ Consider 2FA for additional security
7. ✅ Keep Firebase credentials secure in `.env.local` (never commit)

## Next Steps

1. Install dependencies: `npm install firebase bcryptjs`
2. Add Firebase config to `.env.local`
3. Set up Realtime Database Rules
4. Create your first admin user
5. Test login functionality
