# Pact Inventory System - Complete Setup

## 🎯 Current Status

### ✅ Frontend
- **Framework**: React + Vite + TypeScript + Shadcn/UI
- **Port**: 8080
- **Status**: Running ✨
- **Start**: `npm run dev` (from project root)

### ✅ Backend
- **Framework**: Express.js + TypeScript
- **Port**: 4000
- **Status**: Running ✨
- **Start**: `cd backend && npm run dev`

### ✅ Database
- **Type**: Firebase Realtime Database
- **Project**: `betca-inventory`
- **Status**: Waiting for credentials
- **URL**: `https://betca-inventory-default-rtdb.firebaseio.com`

---

## 🚀 Quick Start

### Terminal 1 - Frontend:
```powershell
cd "d:\Typescrips Vscode Projects\sms-inventory\pact-inventory"
npm run dev
# Opens on http://localhost:8080
```

### Terminal 2 - Backend:
```powershell
cd "d:\Typescrips Vscode Projects\sms-inventory\pact-inventory\backend"
npm run dev
# Runs on http://localhost:4000
```

---

## 📡 API Endpoints

All endpoints follow REST conventions:

### Companies
- `GET /api/companies` - List all
- `POST /api/companies` - Create
- `GET /api/companies/:id` - Get one
- `PUT /api/companies/:id` - Update
- `DELETE /api/companies/:id` - Delete

### Products, LPOs, Deliveries, Invoices, Payments
Same pattern as above with respective endpoints:
- `/api/products`
- `/api/lpos`
- `/api/deliveries`
- `/api/invoices`
- `/api/payments`

---

## 🔐 Firebase Credentials Setup

See `FIREBASE_SETUP.md` for detailed instructions.

**Quick summary:**
1. Download service account JSON from Firebase Console
2. Save to `backend/firebase-service-account.json`
3. Set environment: `$env:GOOGLE_APPLICATION_CREDENTIALS = "path/to/firebase-service-account.json"`
4. Restart backend

---

## 📁 Project Structure

```
pact-inventory/
├── src/                          # Frontend React app
│   ├── components/              # Reusable UI components
│   ├── pages/                   # Page components
│   ├── lib/                     # Utilities (api.ts, storage.ts, etc.)
│   └── App.tsx
├── backend/                     # Express backend
│   ├── src/
│   │   ├── firebase.ts         # Firebase initialization
│   │   └── index.ts            # Express server with routes
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── vite.config.ts              # Frontend config (with /api proxy)
├── package.json                # Frontend dependencies
└── FIREBASE_SETUP.md           # Credentials guide
```

---

## 🔌 How It Works

1. **Frontend** (React @ 8080)
   - User interacts with UI
   - Makes API calls to `/api/*`

2. **Vite Proxy** (configured in vite.config.ts)
   - Intercepts `/api/*` requests
   - Forwards to `http://localhost:4000`

3. **Backend** (Express @ 4000)
   - Receives request
   - Calls Firebase Realtime Database
   - Returns JSON response

4. **Database** (Firebase RTDB)
   - Stores/retrieves data
   - Real-time sync across clients

---

## ✨ Features Ready to Use

✅ Full CRUD for all 6 resources (Companies, Products, LPOs, Deliveries, Invoices, Payments)
✅ Type-safe API client (`src/lib/api.ts`)
✅ React Query integration for data fetching
✅ Responsive Shadcn/UI components
✅ Real-time Firebase database
✅ Automatic API request routing via Vite proxy

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 4000 is in use: `netstat -ano | findstr :4000`
- Delete `node_modules` in backend and reinstall: `rm -r node_modules && npm install`

### Firebase errors
- Ensure `firebase-service-account.json` is in `backend/` folder
- Check `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set
- Look for error messages in backend console

### Frontend can't reach backend
- Verify backend is running on port 4000
- Check `vite.config.ts` has `/api` proxy configured
- Browser DevTools → Network tab to inspect requests

---

## 📝 Next Steps

1. **Add Firebase Credentials**
   - Follow steps in `FIREBASE_SETUP.md`

2. **Test Endpoints**
   - Use Postman or frontend UI to CRUD data

3. **Deploy** (when ready)
   - Frontend: Vite build → Static hosting
   - Backend: Node.js → Cloud platform (Firebase Functions, Heroku, etc.)

---

Last updated: November 13, 2025
