# Firebase Setup Guide

## ✅ Backend is Running

Your Express backend is now running on **http://localhost:4000** with full CRUD endpoints for all 6 resources (Companies, Products, LPOs, Deliveries, Invoices, Payments).

## 🔑 Enable Firebase Database Operations

Follow these steps to connect your backend to Firebase:

### Step 1: Get Firebase Service Account

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **betca-inventory**
3. Go to **Project Settings** (gear icon)
4. Select the **Service Accounts** tab
5. Click **"Generate New Private Key"**
6. A JSON file will download

### Step 2: Add Credentials to Backend

Save the downloaded JSON file to:
```
backend/firebase-service-account.json
```

**⚠️ Important:** This file is already in `.gitignore` - it won't be committed to Git

### Step 3: Set Environment Variable (Windows PowerShell)

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "d:\Typescrips Vscode Projects\sms-inventory\pact-inventory\backend\firebase-service-account.json"
```

Or add to `backend/.env`:
```
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

### Step 4: Restart Backend

```powershell
cd backend
npm run dev
```

### Step 5: Test Firebase Connection

In another terminal:
```powershell
# Test creating a company
Invoke-WebRequest -Uri "http://127.0.0.1:4000/api/companies" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"Test Company","email":"test@example.com"}'
```

## 🌐 Frontend API Integration

Your Vite frontend is configured to proxy `/api/*` requests to the backend:
- Frontend runs on: **http://localhost:8080**
- Backend runs on: **http://localhost:4000**
- Proxy route: `/api` → `http://localhost:4000/api`

### Running Both:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

Then visit: **http://localhost:8080**

## 📊 API Endpoints

All endpoints return JSON and support CRUD operations:

```
GET    /api/companies              # List all companies
POST   /api/companies              # Create company
GET    /api/companies/:id          # Get company by ID
PUT    /api/companies/:id          # Update company
DELETE /api/companies/:id          # Delete company

GET    /api/products               # Similar pattern for all resources
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id

# Same pattern for: /api/lpos, /api/deliveries, /api/invoices, /api/payments
```

## ✨ Troubleshooting

**Backend won't start:**
- Check `npm run dev` output for errors
- Ensure port 4000 is not in use: `Get-Process -Name node`

**Firebase errors after adding credentials:**
- Verify file path is correct
- Restart terminal to refresh env vars
- Check Firebase project has Realtime Database enabled

**Frontend can't reach backend:**
- Ensure backend is running on port 4000
- Check Vite proxy config in `vite.config.ts`
- Open browser DevTools to see API call URLs

---

**Status:** ✅ Backend running | ⏳ Firebase pending credentials | ✅ Frontend proxy ready
