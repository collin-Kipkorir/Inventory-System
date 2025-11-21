# Manual LPO Number Entry & Invoice-Only Payments

## Changes Made

### 1. Manual LPO Number Entry (CreateLPODialog)

**Feature**: Users can now manually enter an LPO number instead of auto-generating it.

**Files Modified**:
- `src/components/CreateLPODialog.tsx`
- `backend/src/index.ts`

**How It Works**:

1. **Frontend** (`CreateLPODialog.tsx`):
   - Added UI toggle: "Auto-generate LPO Number" checkbox
   - When unchecked, shows input field for manual LPO number entry
   - Passes `manualLPONumber` to backend if provided
   - If checked (auto), auto-generates sequential number (default behavior)

2. **Backend** (`backend/src/index.ts`):
   - LPO POST endpoint now checks if `manualLPONumber` is provided
   - If provided: Uses manual number
   - If not provided: Generates sequential number as before
   - Removes temporary `manualLPONumber` field before saving to database

**Code Changes**:

```typescript
// Frontend - CreateLPODialog.tsx
const handleSubmit = async () => {
  // ...
  await createLpo({
    // ... other fields
    ...(useAutoLPONumber ? {} : { manualLPONumber }),
  });
};
```

```typescript
// Backend - index.ts POST /api/lpos
let lpoNumber = req.body.manualLPONumber;
if (!lpoNumber) {
  lpoNumber = await generateSequentialNumber('LPO', '/lpos');
}
```

---

### 2. Invoice-Only Payments (CreatePaymentDialog)

**Feature**: Payments now only reference Invoices, not LPOs.

**Files Modified**:
- `src/components/CreatePaymentDialog.tsx`

**What Changed**:

1. **Removed LPO References**:
   - Removed `listLpos` import
   - Removed `lpos` state variable
   - Removed `referenceType` state (was "invoice" | "lpo")
   - Removed LPO loading in `loadData()`
   - Removed `updateLpo` import and logic

2. **Updated UI**:
   - Removed "Reference Type" dropdown (was: Invoice / LPO)
   - Changed "Invoice (Optional)" field to always show invoices
   - Only shows invoices with outstanding balance

3. **Updated Logic**:
   - `filteredReferences` now only filters invoices
   - `getMaxAmount()` only checks invoice balance
   - `handleSubmit()` only updates invoice records
   - `resetForm()` removed `referenceType` reset

**UI Before vs After**:

```
BEFORE:
┌─────────────────┐
│ Reference Type  │ (Dropdown: Invoice / LPO)
└─────────────────┘
┌─────────────────┐
│ Invoice / LPO   │ (Dynamic label based on type)
└─────────────────┘

AFTER:
┌─────────────────┐
│ Invoice         │ (Always shows invoices only)
│ (Optional)      │
└─────────────────┘
```

---

## Testing Instructions

### Test Manual LPO Number Entry

1. Open the app and navigate to **LPOs** page
2. Click **"Create LPO"** button
3. **Auto-generate mode** (default):
   - Checkbox "Auto-generate LPO Number" is ✅ checked
   - Create LPO → Assigns: `LPO-2025-00001` (sequential)

4. **Manual entry mode**:
   - Uncheck "Auto-generate LPO Number"
   - Input field appears
   - Enter custom LPO number: `LPO-2025-CUSTOM`
   - Create LPO → Uses `LPO-2025-CUSTOM`

### Test Invoice-Only Payments

1. Navigate to **Payments** page
2. Click **"Record Payment"** button
3. Select a company
4. **Reference Type dropdown is GONE** ✅
5. Only **"Invoice"** field shows (with optional label)
6. List shows only unpaid/partial invoices from selected company
7. Create payment → Updates invoice balance only (no LPO updates)

---

## API Behavior

### LPO Creation Endpoint

```
POST /api/lpos

Request Body Options:
{
  companyId: "...",
  items: [...],
  // ... other fields
  
  // Option 1: Auto-generate (don't include manualLPONumber)
  
  // Option 2: Manual entry
  manualLPONumber: "LPO-2025-CUSTOM"
}

Response:
{
  id: "...",
  lpoNumber: "LPO-2025-00001", // or your manual number
  // ... other fields
}
```

### Payment Logic

```
Payment now only works with Invoices:
- filteredReferences = invoices where balance > 0
- Updates invoice: amountPaid, balance, status
- No LPO updates
```

---

## Database Impact

### No Schema Changes Required

All data stored exactly same way:
- LPO records still have `lpoNumber` field
- Invoice records still have `invoiceNo` field
- Payment records unchanged (always referenced invoices)

### Backward Compatible

- Existing auto-generated LPO numbers work unchanged
- Existing invoices and payments work unchanged
- Manual LPO numbers work alongside auto-generated

---

## File Summary

| File | Changes |
|------|---------|
| `src/components/CreateLPODialog.tsx` | Added manual LPO number toggle + input |
| `backend/src/index.ts` | Updated LPO POST to handle manual numbers |
| `src/components/CreatePaymentDialog.tsx` | Removed LPO references, invoice-only |

---

## Browser Cache Tip

If you see old UI in browser:
1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Close and reopen the app

---

## Verification Checklist

- [ ] LPO page has "Auto-generate LPO Number" checkbox
- [ ] Unchecking checkbox shows LPO number input field
- [ ] Auto-generate mode creates sequential numbers
- [ ] Manual mode accepts custom LPO numbers
- [ ] Payments page has NO "Reference Type" dropdown
- [ ] Payments page only shows invoices (not LPOs)
- [ ] Payment updates invoice balance correctly
- [ ] Backend logs show manual vs auto-generated numbers

✅ Done!
