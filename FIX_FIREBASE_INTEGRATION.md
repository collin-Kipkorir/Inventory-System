# 🔧 Firebase Integration Fix

## Problem Found ❌

Data was being saved to **browser localStorage** instead of **Firebase Realtime Database**.

### Root Cause
- Frontend pages were using `localStorage` functions from `src/lib/storage.ts`
- Backend API endpoints exist but were not being called
- Firebase credentials need to be configured

---

## Solution ✅

### Step 1: Ensure Firebase Credentials Are Set Up

1. **Download Firebase Service Account JSON**
   - Go to: https://console.firebase.google.com
   - Select: **betca-inventory** project
   - Settings ⚙️ → **Service Accounts** tab
   - Click: **Generate New Private Key**
   - Save the JSON file

2. **Place in Backend Folder**
   ```
   backend/firebase-service-account.json
   ```

3. **Verify Environment Variable**
   - Check `backend/.env` contains:
     ```env
     GOOGLE_APPLICATION_CREDENTIALS=backend/firebase-service-account.json
     ```

4. **Restart Backend**
   ```powershell
   cd backend
   npm run dev
   ```

You should see (without Firebase warning):
```
✨ Backend listening on http://localhost:4000
📡 Firebase RTDB
```

---

### Step 2: Update Frontend Pages to Use API

✅ **DONE**: Companies page now uses `createCompany`, `listCompanies`, `updateCompany`, `deleteCompany` from `src/lib/api.ts`

**Still TODO**: Update other pages with the same pattern:

#### Products Page (`src/pages/Products.tsx`)
```typescript
import { createProduct, listProducts, updateProduct, deleteProduct } from "@/lib/api";

// Replace: getProducts(), saveProducts()
// With: listProducts(), createProduct(), updateProduct(), deleteProduct()
```

#### Invoices Page (`src/pages/Invoices.tsx`)
```typescript
import { createInvoice, listInvoices, updateInvoice, deleteInvoice } from "@/lib/api";

// Replace: getInvoices(), saveInvoices()
// With: listInvoices(), createInvoice(), updateInvoice(), deleteInvoice()
```

#### LPOs Page (`src/pages/LPOs.tsx`)
```typescript
import { createLPO, listLPOs, updateLPO, deleteLPO } from "@/lib/api";
```

#### Deliveries Page (`src/pages/Deliveries.tsx`)
```typescript
import { createDelivery, listDeliveries, updateDelivery, deleteDelivery } from "@/lib/api";
```

#### Payments Page (`src/pages/Payments.tsx`)
```typescript
import { createPayment, listPayments, updatePayment, deletePayment } from "@/lib/api";
```

---

## Testing the Fix ✅

### 1. Start Both Servers
```powershell
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend (in another PowerShell window)
cd backend
npm run dev
```

### 2. Create a Company
- Open http://localhost:8080
- Click "Add Company"
- Fill in form (Name, Contact Person, Phone, Email)
- Click "Save"

### 3. Verify in Firebase Console
- Go to https://console.firebase.google.com
- Select **betca-inventory** project
- Go to **Realtime Database** tab
- You should see under `/companies`:
  ```json
  {
    "companies": {
      "[auto-generated-id]": {
        "name": "Your Company Name",
        "contactPerson": "Contact Name",
        "phone": "Phone Number",
        "email": "Email Address",
        "address": "Address"
      }
    }
  }
  ```

### 4. Verify Data Persistence
- Refresh the browser page
- The company should still appear (proving it's in Firebase, not just localStorage)

---

## Key Changes Made

### Companies.tsx Changes
✅ **Imports**: Now using API functions instead of storage
```typescript
// Before
import { getCompanies, saveCompanies, generateId } from "@/lib/storage";

// After
import { createCompany, listCompanies, updateCompany, deleteCompany } from "@/lib/api";
```

✅ **Load Data**: Changed from synchronous to async Firebase fetch
```typescript
// Before
useEffect(() => {
  setCompanies(getCompanies());
}, []);

// After
useEffect(() => {
  loadCompanies();
}, []);

const loadCompanies = async () => {
  const data = await listCompanies();
  setCompanies(data || []);
};
```

✅ **Create/Update**: Now calls API instead of localStorage
```typescript
// Before: saveCompanies(updated)
// After: await createCompany(formData); await loadCompanies();
```

✅ **Delete**: Now calls API
```typescript
// Before: saveCompanies(updated)
// After: await deleteCompany(id); await loadCompanies();
```

---

## Troubleshooting

### ❌ "Firebase not initialized" Error
**Solution**: 
- Verify `firebase-service-account.json` exists in `backend/` folder
- Check `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set
- Restart backend

### ❌ "Address already in use" Error
**Solution**:
```powershell
# Find process on port 4000
netstat -ano | findstr :4000

# Kill the process (replace XXXX with PID)
taskkill /PID XXXX /F
```

### ❌ Companies still showing old localStorage data
**Solution**:
- Clear browser localStorage: DevTools → Application → Local Storage → Clear All
- Refresh page
- Data will now come from Firebase instead

### ❌ "Cannot POST /api/companies"
**Solution**:
- Verify backend is running on port 4000
- Check vite.config.ts has proxy configured:
  ```typescript
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
    }
  }
  ```

---

## Next Steps

1. ✅ **Companies page** - Fixed to use API
2. ⏳ **Other pages** - Need to be updated with same pattern
3. ✅ **Backend** - Already has all endpoints ready
4. ✅ **Firebase** - Ready to store data

**Quick Start**:
```powershell
# Terminal 1
npm run dev

# Terminal 2
cd backend && npm run dev

# Then open http://localhost:8080 and try adding a company
```

Data will now save to Firebase Realtime Database! 🎉
