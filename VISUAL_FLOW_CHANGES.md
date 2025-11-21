# Visual Flow Diagrams

## Feature 1: Manual LPO Number Entry

### User Flow

```
┌─────────────────────┐
│  LPO Page - Create  │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────┐
│ Auto-generate LPO Number     │
│ ☑  (checked by default)     │
└──────────┬───────────────────┘
           │
     ┌─────┴─────┐
     │           │
   CHECKED     UNCHECKED
     │           │
     ▼           ▼
  ┌──────┐   ┌───────────────┐
  │ AUTO │   │ Manual Input  │
  │ GEN  │   │ ┌───────────┐ │
  └──┬───┘   │ │LPO-Custom │ │
     │       │ └───────────┘ │
     │       └────────┬──────┘
     │                │
     └────────┬───────┘
              │
              ▼
      ┌──────────────┐
      │ Create LPO   │
      │ with Number  │
      └──────┬───────┘
             │
             ▼
      ┌──────────────────────────┐
      │ Database Saved with:     │
      │ - Auto: LPO-2025-00001   │
      │ - Manual: LPO-Custom     │
      └──────────────────────────┘
```

### Backend Decision Tree

```
┌────────────────────────────┐
│ POST /api/lpos             │
│ Body contains:             │
│ { ...data,                 │
│   manualLPONumber?: "..." }│
└────────────┬───────────────┘
             │
       ┌─────▼─────┐
       │ Check if  │
       │ manual #  │
       │ provided? │
       └─────┬─────┘
             │
        ┌────┴────┐
        │          │
      YES        NO
        │          │
        ▼          ▼
    ┌─────────┐  ┌──────────────────────┐
    │ USE     │  │ GENERATE              │
    │MANUAL # │  │ Sequential Number     │
    └────┬────┘  │ LPO-2025-XXXXX       │
         │       └──────────┬───────────┘
         │                  │
         └────────┬─────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Save to DB     │
         │ with LPO #     │
         └────────────────┘
```

---

## Feature 2: Invoice-Only Payments

### Before vs After

```
BEFORE (With LPO Support):
━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────┐
│ Record Payment          │
├─────────────────────────┤
│ Company: [Select ▼]     │
│                         │
│ Reference Type:         │
│ [Invoice ▼] [LPO ▼]     │
│                         │
│ Reference:              │
│ [Select Invoice/LPO ▼]  │
│                         │
│ Amount: [Input]         │
│                         │
│ [Cancel] [Record]       │
└─────────────────────────┘
         │
         ├─→ If Invoice:
         │   Update invoice.balance
         │   Update invoice.amountPaid
         │
         └─→ If LPO:
             Update lpo.balance
             Update lpo.amountPaid


AFTER (Invoice Only):
━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────┐
│ Record Payment          │
├─────────────────────────┤
│ Company: [Select ▼]     │
│                         │
│ Invoice (Optional):     │
│ [Select Invoice ▼]      │
│                         │
│ Amount: [Input]         │
│                         │
│ [Cancel] [Record]       │
└─────────────────────────┘
         │
         └─→ Update invoice.balance
             Update invoice.amountPaid
```

### Data Flow

```
BEFORE:
┌──────────────┐
│ Payment Form │
└──────┬───────┘
       │
       ├─── Reference Type = "invoice"?
       │    └─→ Load invoices
       │        Update invoice on payment
       │
       └─── Reference Type = "lpo"?
            └─→ Load LPOs
                Update LPO on payment


AFTER:
┌──────────────┐
│ Payment Form │
└──────┬───────┘
       │
       └─── Always Invoice
            ├─→ Load only invoices
            ├─→ Filter by balance > 0
            └─→ Update invoice on payment
                (No LPO involved)
```

---

## Component Changes

### CreateLPODialog.tsx

```
STATE CHANGES:
✓ Added: useAutoLPONumber (boolean, default true)
✓ Added: manualLPONumber (string)

UI CHANGES:
✓ Checkbox: "Auto-generate LPO Number"
✓ Conditional input: Shows when unchecked

API CHANGES:
✓ Sends manualLPONumber if unchecked
✓ Backend handles both cases
```

### CreatePaymentDialog.tsx

```
REMOVED:
✗ State: referenceType ("invoice" | "lpo")
✗ State: lpos (array)
✗ Import: listLpos
✗ Import: updateLpo
✗ Logic: LPO filtering
✗ Logic: LPO updates
✗ UI: Reference Type dropdown

KEPT:
✓ State: invoices (array)
✓ Import: listInvoices
✓ Import: updateInvoice
✓ Logic: Invoice filtering
✓ Logic: Invoice updates
✓ UI: Invoice selector
```

---

## Database Schema (No Changes)

```
LPO Document:
{
  id: "key1",
  lpoNumber: "LPO-2025-00001",  ← Can be auto or manual
  companyId: "...",
  items: [...],
  totalAmount: 50000,
  amountPaid: 0,
  balance: 50000,
  paymentStatus: "unpaid",
  ...
}

Invoice Document:
{
  id: "key2",
  invoiceNo: "INV-2025-00001",
  companyId: "...",
  totalAmount: 30000,
  amountPaid: 0,
  balance: 30000,
  status: "unpaid",
  ...
}

Payment Document:
{
  id: "key3",
  invoiceId: "key2",              ← Always references invoice
  invoiceNo: "INV-2025-00001",
  amountPaid: 5000,
  mode: "cash",
  date: "2025-11-15",
  ...
}
```

---

## Test Scenarios

### Scenario 1: Auto-Generated LPO

```
User Action                Backend Action          Database Result
─────────────────          ──────────────          ───────────────
1. Click "Create LPO"
2. Leave checkbox ✓
3. Fill form
4. Click "Create"        → Check manual # not set
                         → Generate sequence
                         → Save with auto #       → lpoNumber: "LPO-2025-00001"
                         → Response sent
```

### Scenario 2: Manual LPO

```
User Action                Backend Action          Database Result
─────────────────          ──────────────          ───────────────
1. Click "Create LPO"
2. Uncheck checkbox
3. Enter "XYZ-789"
4. Click "Create"        → Check manual # set
                         → Use provided #
                         → Save with manual #     → lpoNumber: "XYZ-789"
                         → Response sent
```

### Scenario 3: Record Payment

```
User Action                Backend Action          Database Result
─────────────────          ──────────────          ───────────────
1. Click "Record Payment"
2. Select company
3. Select invoice
4. Enter amount
5. Click "Record"        → Load invoice
                         → Create payment
                         → Update invoice
                         → Update balance        → invoice.balance reduced
                         → Response sent         → payment created
```

---

## Summary

| Feature | Before | After |
|---------|--------|-------|
| LPO Numbers | Auto-generated only | Auto OR Manual |
| Payment Reference | Invoice or LPO | Invoice only |
| UI Complexity | Higher (dual options) | Lower (single option) |
| Database Schema | Unchanged | Unchanged |
| Breaking Changes | N/A | None |

✅ All changes backward compatible
✅ No database migration needed
✅ Existing data continues to work
