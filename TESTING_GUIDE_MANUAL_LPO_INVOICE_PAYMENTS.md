# 🧪 Step-by-Step Testing Guide

## Prerequisites

Before testing, make sure:
- ✅ Backend is running: `npm run dev` (in `backend` folder)
- ✅ Frontend is running: `npm run dev` (in root folder)
- ✅ Browser open to: `http://localhost:8080`
- ✅ Backend shows: `listening on http://localhost:4000`

---

## Test 1: Auto-Generated LPO Numbers (Default Mode)

### Steps

1. **Navigate to LPOs Page**
   - Click "LPOs" in sidebar
   - See list of LPOs (if any exist)

2. **Click "Create LPO" Button**
   - Orange button with "+" icon
   - Dialog opens

3. **Verify Checkbox Status**
   - Look for: "Auto-generate LPO Number"
   - Should be: ✅ CHECKED (default)
   - Below it: NO input field visible

4. **Fill in Form**
   ```
   Company: Select any company
   Date: Today's date (auto-filled)
   Item 1:
     - Product: Select any product
     - Quantity: 5
     - Others auto-fill
   ```

5. **Click "Create LPO" Button**
   - Green button at bottom
   - Should see success message: "LPO created successfully"
   - Dialog closes

6. **Verify in List**
   - Back in LPOs list
   - New LPO appears at top
   - Check LPO Number column:
     - Should be: `LPO-2025-00001` (or higher if more exist)
     - Format: `LPO-YYYY-XXXXX`

7. **Expected Result** ✅
   ```
   LPO Number: LPO-2025-00001
   Auto-generated: YES
   Status: Auto-generation working!
   ```

---

## Test 2: Manual LPO Numbers (Toggle Mode)

### Steps

1. **Navigate to LPOs Page**
   - Click "LPOs" in sidebar

2. **Click "Create LPO" Button**
   - Dialog opens

3. **Uncheck Auto-Generation**
   - Find: "Auto-generate LPO Number" checkbox
   - Click to: ☐ UNCHECK
   - Effect: Input field appears below

4. **Enter Custom LPO Number**
   - In new input field, type: `CUSTOM-2025-001`
   - Or any format you want: `TEST-789`, `PROJ-001`, etc.

5. **Fill in Form**
   ```
   Company: Select any company
   Date: Today's date
   Item 1:
     - Product: Select product
     - Quantity: 3
   ```

6. **Click "Create LPO" Button**
   - Should see: "LPO created successfully"
   - Dialog closes

7. **Verify in List**
   - New LPO appears
   - Check LPO Number column:
     - Should be: `CUSTOM-2025-001` (your custom number!)
     - NOT auto-generated

8. **Expected Result** ✅
   ```
   LPO Number: CUSTOM-2025-001
   Manual Entry: YES
   Status: Manual entry working!
   ```

### Verify Backend Logs

Check your backend terminal:

**For Auto-Generated** (Test 1):
```
[Sequential] Generating LPO number from 1 existing items
[Sequential] Generated number: LPO-2025-00002 (max was 1)
```

**For Manual** (Test 2):
```
LPO Number: CUSTOM-2025-001 (manual: true)
```

---

## Test 3: Invoice-Only Payments

### Prerequisites for This Test

You need:
- At least one company with unpaid invoices
- If not, create company + invoice first

### Steps

1. **Navigate to Payments Page**
   - Click "Payments" in sidebar
   - See any existing payments

2. **Click "Record Payment" Button**
   - Orange button with "+" icon
   - Dialog opens

3. **Verify NO Reference Type Dropdown**
   - Look carefully at the form
   - Should NOT see: "Reference Type" with [Invoice ▼] [LPO ▼]
   - Status: ❌ NOT PRESENT
   - Expected: ✅ Correct (we removed it)

4. **Look for Invoice Selection**
   - Should see: "Invoice (Optional)" label
   - Below: Dropdown to select invoice
   - NOT see: "LPO" option anywhere

5. **Fill in Form**
   ```
   Company: Select any company
   Date: Today's date (auto-filled)
   Invoice (Optional): Select unpaid invoice
   Amount Paid: 5000
   Payment Mode: Cash
   ```

6. **Verify Amount Limit**
   - After selecting invoice
   - Should show: "Max: KES X,XXX" (the invoice balance)
   - Try entering amount > balance
   - Should show error: "Amount exceeds outstanding balance"

7. **Enter Valid Amount**
   - Amount < balance shown
   - Example: Balance 10,000, enter 5,000

8. **Click "Record Payment" Button**
   - Should see: "Payment recorded successfully"
   - Dialog closes

9. **Verify Invoice Updated**
   - Go to Invoices page
   - Find same invoice
   - Check status:
     - If payment = balance: `paid`
     - If payment < balance: `partial`
   - Check balance reduced ✅

10. **Expected Results** ✅
    ```
    Reference Type dropdown: GONE ✅
    Only Invoice field shown: YES ✅
    Payment updates invoice: YES ✅
    No LPO involved: CORRECT ✅
    Status: Invoice-only working!
    ```

---

## Test 4: Mixed Testing (Combine Features)

### Scenario: Full Business Flow

1. **Create a Manual LPO**
   - Go to LPOs → Create LPO
   - Uncheck auto-generation
   - Enter: `PO-ACME-2025-001`
   - Create LPO with items
   - ✅ Result: LPO with custom number

2. **Create Invoice from LPO**
   - Go to Invoices → Create Invoice
   - Reference the manual LPO
   - Create invoice
   - ✅ Result: Invoice linked to manual LPO

3. **Record Payment for Invoice**
   - Go to Payments → Record Payment
   - Select the invoice (NOT the LPO!)
   - Record payment
   - Verify: Invoice balance reduces
   - ✅ Result: Only invoice updated

4. **Verify Complete Flow**
   - Manual LPO created ✅
   - Invoice created from it ✅
   - Payment recorded for invoice ✅
   - Payment didn't touch LPO ✅

---

## Test 5: Error Checking

### Test Invalid Inputs

1. **Try Creating LPO Without Company**
   - Leave company blank
   - Try to create
   - Should error: "Please select a company"

2. **Try Creating LPO Without Items**
   - Select company
   - Delete all items
   - Try to create
   - Should error: "Please fill all item details"

3. **Try Payment > Invoice Balance**
   - Go to Payments
   - Select invoice with balance 5,000
   - Enter amount 10,000
   - Try to create
   - Should error: "Amount exceeds outstanding balance"

4. **Try Creating Payment Without Company**
   - Leave company blank
   - Try to create
   - Should error: "Please select a company"

### Expected Behavior
All errors should show with toast notifications (red messages at top)

---

## Test 6: Browser Console Check

### Open Browser Console
- Press: `F12` or `Right-click → Inspect`
- Go to "Console" tab

### Check for Errors
- Should be clean (no red error messages)
- May see yellow warnings (ignore these)
- Should NOT see:
  - `500 Internal Server Error`
  - `ECONNREFUSED`
  - `TypeError: Cannot read property 'lpos'`

### Check for Success Logs
Look for messages like:
```
GET /api/companies 200
POST /api/lpos 201 (manual: true)
POST /api/invoices 201
POST /api/payments 201
```

---

## Test 7: Backend Log Verification

### Watch Backend Terminal

While running tests, check the terminal running `npm run dev`:

**When creating auto LPO:**
```
[Sequential] Generating LPO number from N existing items
[Sequential] Generated number: LPO-2025-00XXX (max was XXX)
LPO Number: LPO-2025-00XXX (manual: false)
LPO data being saved: { ... lpoNumber: 'LPO-2025-00XXX' ... }
Push response: { id: '...', lpoNumber: 'LPO-2025-00XXX', ... }
```

**When creating manual LPO:**
```
LPO Number: CUSTOM-2025-001 (manual: true)
LPO data being saved: { ... lpoNumber: 'CUSTOM-2025-001' ... }
Push response: { id: '...', lpoNumber: 'CUSTOM-2025-001', ... }
```

---

## Troubleshooting

### Problem: Changes Not Showing
**Solution**: Hard refresh
```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

### Problem: "Reference Type" Dropdown Still Visible
**Solution**: 
1. Clear browser cache
2. Close browser completely
3. Reopen and try again
4. Or: Use incognito/private window

### Problem: Backend Connection Error
**Solution**: 
1. Check backend terminal running `npm run dev`
2. Should show: `listening on http://localhost:4000`
3. If not: Stop and restart: `npm run dev`

### Problem: "LPO" Still Shows in Payments
**Solution**: 
1. Check `CreatePaymentDialog.tsx` saved correctly
2. Verify "Reference Type" section removed
3. Only "Invoice (Optional)" should remain
4. Hard refresh browser

### Problem: Manual LPO Numbers Not Saving
**Solution**:
1. Check backend `index.ts` updated (check LPO POST endpoint)
2. Verify `manualLPONumber` being passed from frontend
3. Check backend logs for errors
4. Restart backend: `npm run dev`

---

## Checklist: All Tests Passing ✅

- [ ] Auto LPO generates sequential numbers
- [ ] Manual LPO uses custom numbers
- [ ] Backend logs show "manual: true/false"
- [ ] Payments page has NO "Reference Type"
- [ ] Payments shows only Invoice selector
- [ ] Payment updates invoice balance
- [ ] Payment doesn't touch LPOs
- [ ] All error messages work
- [ ] Browser console clean (no red errors)
- [ ] Hard refresh works
- [ ] Flow: Manual LPO → Invoice → Payment works

---

## ✅ When All Tests Pass

**Result**: IMPLEMENTATION SUCCESSFUL ✨

All features working as designed:
- ✅ Manual LPO numbers fully functional
- ✅ Auto LPO generation still works
- ✅ Payments reference invoices only
- ✅ No database errors
- ✅ No console errors
- ✅ Backward compatible

**You're all set!** 🎉

---

## Still Having Issues?

Check these files for details:
- `MANUAL_LPO_AND_INVOICE_ONLY_PAYMENTS.md` - Full documentation
- `VISUAL_FLOW_CHANGES.md` - Visual diagrams
- `500_ERROR_FIX.md` - If backend not connecting
- `QUICK_START.md` - General setup guide

**Questions?** Check the backend terminal logs - they show exactly what's happening!
