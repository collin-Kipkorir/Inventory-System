# Firebase Admin Credentials - Complete Setup Guide

## Overview

This guide shows how to set up admin login credentials in Firebase Realtime Database for your Inventory Management System.

## Quick Start

### 1. Install Required Packages

```bash
npm install firebase bcryptjs
npm install --save-dev @types/bcryptjs
```

### 2. Create `.env.local` File

In your project root, create `.env.local` with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

**Where to find these values:**
- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project
- Click ⚙️ Settings > Project settings
- Scroll to "Your apps"
- Click the web app configuration icon `</>`
- Copy all values from the `firebaseConfig` object

### 3. Create Firebase Realtime Database

1. Go to Firebase Console > Build > Realtime Database
2. Click "Create Database"
3. Select location closest to you
4. Start in **Test mode** (we'll secure later)
5. Click "Enable"

### 4. Create Admin User

#### Method A: Using Interactive Script (Recommended)

```bash
npm run create-admin
```

Follow the prompts to enter username, email, and password.

#### Method B: Firebase Console

1. Go to Firebase Console > Realtime Database
2. Click the "+" icon next to "admins"
3. Create entry with key: `admin_user_1`
4. Add this data:

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "passwordHash": "PASTE_BCRYPT_HASH_HERE",
  "createdAt": 1704067200000
}
```

**To get a bcrypt hash**, run in Node:

```javascript
// In Node REPL or a test file
const bcrypt = require('bcryptjs');

(async () => {
  const hash = await bcrypt.hash('your-password', 10);
  console.log(hash);
})();
```

### 5. Set Firebase Security Rules

In Firebase Console > Realtime Database > Rules, paste:

```json
{
  "rules": {
    "admins": {
      ".read": true,
      ".write": false,
      ".indexOn": ["username"]
    }
  }
}
```

Click "Publish"

### 6. Update AuthContext

The current AuthContext uses a mock `/api/admin/login` endpoint. To use Firebase:

1. Open `src/contexts/AuthContext.tsx`
2. Replace the `login` function with Firebase implementation:

```typescript
const login = async (username: string, password: string): Promise<void> => {
  setIsLoading(true);
  try {
    const admin = await getAdminByUsername(username);
    if (!admin) throw new Error("Invalid credentials");

    const isPasswordValid = await verifyPassword(password, admin.passwordHash);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    await updateLastLogin(username);

    const userData = {
      username: admin.username,
      token: `admin_${Date.now()}`,
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

Import at top:
```typescript
import { getAdminByUsername, updateLastLogin } from "@/lib/firebaseAdmin";
import { verifyPassword } from "@/lib/password";
```

### 7. Test Login

1. Start dev server: `npm run dev`
2. Go to `http://localhost:5173/login`
3. Enter credentials (username: `admin`, password: your password)
4. Should redirect to dashboard

## Database Structure

```
Firebase Realtime Database
│
└── admins/
    ├── admin_user_1/
    │   ├── username: "admin"
    │   ├── email: "admin@example.com"
    │   ├── passwordHash: "$2b$10$..." (bcrypt)
    │   ├── createdAt: 1704067200000
    │   └── lastLogin: 1704070800000
    │
    └── admin_user_2/
        ├── username: "manager"
        ├── email: "manager@example.com"
        ├── passwordHash: "$2b$10$..." (bcrypt)
        ├── createdAt: 1704067200000
        └── lastLogin: 1704070800000
```

## Adding More Admin Users

After first setup, add more admins using the script:

```bash
npm run create-admin
```

Or manually in Firebase Console:
1. Right-click `admins` folder
2. Click "Add child"
3. Key: `admin_user_2` (or similar)
4. Paste JSON with new username/email/hash

## Files Created/Modified

| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Firebase initialization |
| `src/lib/firebaseAdmin.ts` | Admin CRUD operations |
| `src/lib/password.ts` | Password hashing utilities |
| `src/pages/Login.tsx` | Login page UI |
| `src/contexts/AuthContext.tsx` | Authentication state |
| `src/contexts/AuthContextType.tsx` | Auth types |
| `src/hooks/useAuth.ts` | useAuth hook |
| `src/components/ProtectedRoute.tsx` | Route protection |
| `scripts/createAdmin.js` | Admin creation script |
| `src/components/AppSidebar.tsx` | Updated with logout button |

## Troubleshooting

### Firebase Rules Error: "Permission denied"

**Solution:** Update rules in Firebase Console:
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

### "Cannot find module 'firebase'"

**Solution:** Install Firebase:
```bash
npm install firebase bcryptjs
npm install --save-dev @types/bcryptjs
```

### Password Verification Always Fails

**Solution:** Ensure:
1. Password hash in Firebase is valid bcryptjs hash (starts with `$2b$`)
2. bcryptjs package is installed
3. Recreate hash if needed using `npm run create-admin`

### Environment Variables Not Loading

**Solution:**
1. Create `.env.local` (not `.env`)
2. Restart dev server: `npm run dev`
3. Check console for `VITE_FIREBASE_*` values

### Last Login Not Updating

**Solution:** Ensure write permissions in Rules:
```json
{
  "rules": {
    "admins": {
      ".write": "root.child('admins').child(auth.uid).exists()"
    }
  }
}
```

## Security Checklist

- ✅ Use bcryptjs for password hashing
- ✅ Never commit `.env.local` to Git
- ✅ Set proper Firebase Rules (read-only for users)
- ✅ Use HTTPS in production
- ✅ Implement rate limiting on failed login attempts
- ✅ Store last login timestamp for audit trail
- ✅ Consider adding 2FA for extra security
- ✅ Regularly backup admin credentials

## Production Deployment

1. Update Firebase Rules for production:
```json
{
  "rules": {
    "admins": {
      ".read": "auth != null && auth.uid === 'admin'",
      ".write": false,
      ".indexOn": ["username"]
    }
  }
}
```

2. Set `.env.local` in your deployment environment
3. Use strong passwords for admin accounts
4. Enable Firebase Authentication if available
5. Consider using a secret manager (AWS Secrets Manager, Vercel Secrets, etc.)

## Next Steps

- [ ] Install Firebase and bcryptjs
- [ ] Set up `.env.local` with Firebase config
- [ ] Create Firebase Realtime Database
- [ ] Create first admin user with `npm run create-admin`
- [ ] Update AuthContext with Firebase integration
- [ ] Test login functionality
- [ ] Deploy to production

## Support

For issues:
1. Check Firebase Console for error messages
2. Enable browser console for debugging
3. Verify `.env.local` is in project root
4. Check network tab for API calls
5. Restart dev server after env changes
