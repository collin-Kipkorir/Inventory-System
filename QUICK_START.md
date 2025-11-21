# 🚀 SMS Inventory System - Quick Start Guide

## 📌 System Status: ✅ FULLY OPERATIONAL

All pages are connected to Firebase Realtime Database. Data is now persistent in the cloud!

---

## 🎯 IMPORTANT: Start Backend FIRST!

### Why?
The frontend proxies to backend for API calls. If backend isn't running, you get 500 errors.

### ⚠️ Common Mistake
**DON'T**: Start frontend first, then backend
**DO**: Start backend first, then frontend

---

## 🚀 Correct Startup Order

### Step 1: Start Backend (Terminal 1 - FIRST!)
```powershell
cd backend
npm run dev
```

**Wait for**:
```
📂 Found firebase-service-account.json
✨ Firebase initialized successfully
✨ Backend listening on http://localhost:4000
📡 Firebase RTDB
```

**Keep this terminal open!** ← Important

### Step 2: Start Frontend (Terminal 2 - SECOND)
```powershell
# In new terminal
npm run dev
```

**Wait for**:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:8080/
```

### Step 3: Open Browser
Go to: `http://localhost:8080`

**✅ You should see the app without 500 errors**

---

## 📱 Application Modules

### 1. **Companies** ✅
- Add, edit, delete companies
- Track business partners
- Store contact information
- **Data saved to**: `/companies`

### 2. **Products** ✅
- Manage product catalog
- Track unit prices and VAT
- Organize inventory items
- **Data saved to**: `/products`

### 3. **LPOs** (Local Purchase Orders) ✅
- Create purchase orders from companies & products
- Mark as delivered → creates Delivery record
- Generate Invoice from LPO
- **Data saved to**: `/lpos`

### 4. **Deliveries** ✅
- Track all goods delivered
- Created automatically from LPO "Mark as Delivered"
- Download delivery notes
- **Data saved to**: `/deliveries`

### 5. **Invoices** ✅
- Generated from LPOs
- Track company payments
- Download as PDF
- **Data saved to**: `/invoices`

### 6. **Payments** ✅
- Record payment transactions
- Track payment methods (Cash, M-Pesa, Bank)
- Link to invoices/LPOs
- **Data saved to**: `/payments`

---

## 🔄 Typical Workflow

```
1. Create Company
   ↓
2. Create Product(s)
   ↓
3. Create LPO (select company & products)
   ↓
4. Mark LPO as Delivered
   ├─→ Creates Delivery record
   └─→ Updates LPO status to "delivered"
   ↓
5. Create Invoice from LPO
   ├─→ Sets amount owed
   └─→ Status: "unpaid"
   ↓
6. Record Payment
   ├─→ Link to invoice
   └─→ Updates invoice balance
```

---

## 🔧 Technical Stack

| Component | Technology | Details |
|-----------|-----------|---------|
| Frontend | React 18 + Vite | Type-safe, fast builds |
| Backend | Node.js + Express | REST API server |
| Database | Firebase RTDB | Real-time, cloud-hosted |
| Auth | Firebase Admin SDK | Service account credentials |
| UI | Shadcn/UI + Tailwind | Beautiful, responsive components |
| API Client | Custom hooks | Type-safe API calls |

---

## 📊 Data Architecture

```
Firebase Realtime Database (betca-inventory)
│
├── companies/
│   └── [id]: { name, email, phone, address, ... }
│
├── products/
│   └── [id]: { name, unit, unitPrice, vatInclusive, ... }
│
├── lpos/
│   └── [id]: { lpoNumber, companyId, items[], status, ... }
│
├── deliveries/
│   └── [id]: { deliveryNo, lpoId, companyId, items[], ... }
│
├── invoices/
│   └── [id]: { invoiceNo, lpoId, totalAmount, status, ... }
│
└── payments/
    └── [id]: { paymentNo, invoiceId, amount, mode, ... }
```

---

## 🧪 Testing Each Module

### Test Companies
```
1. Click "Add Company" button
2. Fill: Name, Contact Person, Phone, Email
3. Click "Save"
4. ✅ Appears in table
5. Refresh page → ✅ Still there (saved to Firebase)
```

### Test Products
```
1. Navigate to Products
2. Click "Add Product"
3. Fill: Name, Unit, Price
4. Click "Save"
5. ✅ Appears in product list
```

### Test Full Workflow
```
1. Create a Company
2. Create a Product
3. Go to LPOs → Create LPO
4. Select company and product
5. Click "Mark as Delivered"
   ✅ Delivery created, status changed
6. Click "Create Invoice"
   ✅ Invoice created with amounts
7. Go to Payments → Add Payment
8. ✅ Payment linked to invoice
```

---

## 🔍 Verify Data in Firebase

1. Go to: https://console.firebase.google.com
2. Select: **betca-inventory** project
3. Click: **Realtime Database** tab
4. Expand each node to see your data

Example structure:
```json
{
  "companies": {
    "abc123": {
      "name": "Acme Corp",
      "email": "info@acme.com",
      "phone": "0700123456"
    }
  },
  "products": {
    "xyz789": {
      "name": "Steel Pipe",
      "unit": "kg",
      "unitPrice": 500
    }
  }
}
```

---

## ⚙️ System Configuration

### Environment Variables (backend/.env)
```env
NODE_ENV=development
PORT=4000
FIREBASE_DATABASE_URL=https://betca-inventory-default-rtdb.firebaseio.com
GOOGLE_APPLICATION_CREDENTIALS=backend/firebase-service-account.json
```

### Firebase Credentials
- File: `backend/firebase-service-account.json`
- Location: Root of backend folder
- Status: ✅ Configured and working

### Vite Proxy (frontend)
- All `/api/*` requests → `http://localhost:4000`
- Configured in `vite.config.ts`
- Status: ✅ Active

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **500 errors on API calls** | Restart backend: `cd backend && npm run dev` |
| **Data not appearing** | Clear localStorage & refresh |
| **Firebase not initialized** | Check `firebase-service-account.json` exists |
| **Port 4000 already in use** | Kill process: `taskkill /PID [pid] /F` |
| **Data disappears on refresh** | Check Firefox/Chrome is reading from Firebase |

---

## 📋 API Endpoints Reference

### Health Check
```
GET http://localhost:4000/api/health
Response: { "ok": true }
```

### Companies
```
GET    /api/companies           → List all
POST   /api/companies           → Create
GET    /api/companies/:id       → Get one
PUT    /api/companies/:id       → Update
DELETE /api/companies/:id       → Delete
```

### Products, LPOs, Deliveries, Invoices, Payments
Same pattern as Companies (GET, POST, GET:id, PUT:id, DELETE:id)

---

## 📚 Documentation Files

- **ALL_PAGES_FIREBASE_INTEGRATION.md** - Complete integration details
- **FIX_FIREBASE_INTEGRATION.md** - Troubleshooting guide
- **FIREBASE_SETUP.md** - Credentials setup
- **README_SETUP.md** - System architecture
- **IMPLEMENTATION_COMPLETE.md** - Project status

---

## ✅ Checklist

- [x] Frontend running on port 8080
- [x] Backend running on port 4000
- [x] Firebase credentials configured
- [x] All 6 pages using API
- [x] CRUD operations working
- [x] Data persisting to Firebase
- [x] Loading states implemented
- [x] Error handling active
- [x] Toast notifications working

---

## 🎯 What's Working

✅ Create companies, products, LPOs, deliveries, invoices, payments
✅ Read/list all records
✅ Update existing records
✅ Delete records
✅ Real-time Firebase sync
✅ PDF export (invoices, LPOs, deliveries)
✅ Responsive UI on all devices
✅ Error messages and notifications
✅ Data persistence across sessions

---

## � Troubleshooting

### Problem: "GET http://localhost:8080/api/companies 500 (Internal Server Error)"

**Cause**: Backend is not running

**Solution**:
```powershell
# Terminal 1 (if not already open)
cd backend
npm run dev

# Wait for: "✨ Backend listening on http://localhost:4000"
# Keep this terminal open!

# Then in Terminal 2
npm run dev
```

### Problem: "Cannot find module 'tsx'"

**Cause**: Missing backend dependencies

**Solution**:
```powershell
cd backend
npm install
npm run dev
```

### Problem: "Port 4000 already in use"

**Cause**: Previous backend process still running

**Solution**:
```powershell
# Find process on port 4000
netstat -ano | findstr :4000

# Kill it (replace XXXX with PID from above)
taskkill /PID XXXX /F

# Then restart
npm run dev
```

### Problem: Frontend not loading (blank page)

**Solution**:
1. Hard refresh browser: `Ctrl + Shift + R`
2. Close browser cache: `Ctrl + Shift + Delete`
3. Try incognito/private mode
4. Check browser console (F12) for errors

### Problem: Firebase connection errors

**Check**:
1. File exists: `firebase-service-account.json`
2. Internet connection working
3. Firebase project is active
4. Backend console shows "✨ Firebase initialized successfully"

### Problem: LPO numbers not generating

**Solution** (this is fixed!):
- Backend now correctly generates: `LPO-2025-00001`, `LPO-2025-00002`, etc.
- Make sure backend is running
- Check backend console for `[Sequential]` messages

### Problem: Data not saving to Firebase

**Check**:
1. Backend is running
2. Firebase credentials are valid
3. Internet connection is stable
4. No errors in backend console

### Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:8080
- [ ] Can load Companies page (no 500 error)
- [ ] Can create a company
- [ ] Can create a product
- [ ] Can create an LPO with auto-generated number
- [ ] Can see data in Firebase Console

---

## �🚀 Ready for Production?

### Before deploying:
- [ ] Test all workflows in QA environment
- [ ] Configure Firebase security rules
- [ ] Set up user authentication
- [ ] Add data validation
- [ ] Configure CORS for production domain
- [ ] Set up monitoring/logging

### Quick deployment checklist:
1. Build frontend: `npm run build`
2. Deploy to Firebase Hosting / Vercel / etc.
3. Deploy backend to Cloud Run / Render / etc.
4. Configure environment variables
5. Test in production

---

## 📞 Support

For issues:
1. Check browser console for errors
2. Check backend logs
3. Verify Firebase Console for data
4. Review documentation files

**System is fully operational and ready to use!** 🎉
