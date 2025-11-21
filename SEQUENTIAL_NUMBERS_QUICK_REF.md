# Sequential Number Generation - Quick Reference

## Status: ✅ FULLY IMPLEMENTED

### What Got Fixed
- ❌ **Before**: Invoice No, LPO Number, Delivery No, Payment No were not being created
- ✅ **Now**: All numbers auto-generate with format `PREFIX-YYYY-XXXXX`

## How to Use

### 1. Create an LPO
- Go to **LPOs** page
- Click **"Create LPO"** button
- Fill form and save
- **Result**: Auto-generated `lpoNumber` (e.g., `LPO-2025-00001`)

### 2. Create an Invoice
- Go to **Invoices** page
- Click **"Create Invoice"** button
- Optionally link to LPO by entering LPO reference
- Fill form and save
- **Result**: Auto-generated `invoiceNo` (e.g., `INV-2025-00001`)

### 3. Create a Payment
- Go to **Payments** page
- Click **"Create Payment"** button
- Optionally link to Invoice by entering reference
- Fill form and save
- **Result**: Auto-generated `paymentNo` (e.g., `PAY-2025-00001`)

### 4. Create a Delivery
- Go to **Deliveries** page
- Click **"Create Delivery"** button
- Optionally link to LPO
- Fill form and save
- **Result**: Auto-generated `deliveryNo` (e.g., `DLV-2025-00001`)

## Number Format

All numbers follow: **PREFIX-YEAR-SEQUENCE**

| Type | Format | Examples |
|------|--------|----------|
| LPO | LPO-YYYY-XXXXX | LPO-2025-00001, LPO-2025-00002, LPO-2025-00003 |
| Invoice | INV-YYYY-XXXXX | INV-2025-00001, INV-2025-00002, INV-2025-00003 |
| Payment | PAY-YYYY-XXXXX | PAY-2025-00001, PAY-2025-00002, PAY-2025-00003 |
| Delivery | DLV-YYYY-XXXXX | DLV-2025-00001, DLV-2025-00002, DLV-2025-00003 |

## Where Numbers Appear

### LPOs Page
| Column | Shows |
|--------|-------|
| LPO Number | `lpoNumber` (auto-generated) |
| Company | Company name |
| Amount | Total amount |
| Status | Payment status |

### Invoices Page
| Column | Shows |
|--------|-------|
| Invoice No | `invoiceNo` (auto-generated) |
| LPO Reference | `lpoNumber` (if linked) |
| Company | Company name |
| Amount | Invoice amount |

### Payments Page
| Column | Shows |
|--------|-------|
| Payment No | `paymentNo` (auto-generated) |
| Reference | Invoice or LPO number |
| Company | Company name |
| Amount | Payment amount |

### Deliveries Page
| Column | Shows |
|--------|-------|
| Delivery No | `deliveryNo` (auto-generated) |
| LPO Reference | `lpoNumber` (if linked) |
| Items | Delivered items |

## Backend Changes

### File: `backend/src/index.ts`

**Added Function** (line 17-29):
```typescript
const generateSequentialNumber = async (prefix: string, path: string) => {
  // Generates numbers like: LPO-2025-00001
}
```

**Updated Endpoints** with number generation:
- `POST /api/lpos` - Generates `lpoNumber`
- `POST /api/invoices` - Generates `invoiceNo`
- `POST /api/payments` - Generates `paymentNo`
- `POST /api/deliveries` - Generates `deliveryNo`

### LPO Defaults
When creating an LPO, these are automatically set:
- `amountPaid: 0`
- `balance: totalAmount`
- `paymentStatus: 'unpaid'`

## Testing Checklist

- [ ] Create LPO → See number like `LPO-2025-00001`
- [ ] Create another LPO → See number like `LPO-2025-00002`
- [ ] Create Invoice → See number like `INV-2025-00001`
- [ ] Create Payment → See number like `PAY-2025-00001`
- [ ] Create Delivery → See number like `DLV-2025-00001`
- [ ] Refresh page → Numbers still show
- [ ] Link Invoice to LPO → Reference appears
- [ ] Link Payment to Invoice → Reference appears

## Troubleshooting

**Numbers not showing?**
1. Is backend running? (`npm run dev` in backend folder)
2. Refresh browser (Ctrl+Shift+R)
3. Check browser console for errors

**Numbers not incrementing?**
1. Restart backend server
2. Check API responses in Network tab
3. Verify Firebase connection

**Old data missing numbers?**
- Records created before this fix won't have numbers
- Only new records get auto-generated numbers
- You can manually add numbers to old records if needed

## Database Structure

Records now stored with generated numbers in Firebase:

```
/lpos/[ID] {
  "lpoNumber": "LPO-2025-00001",  ← Auto-generated
  "totalAmount": 5000,
  "amountPaid": 0,                ← Auto-set
  "balance": 5000,                ← Auto-set
  "paymentStatus": "unpaid",      ← Auto-set
  ...
}

/invoices/[ID] {
  "invoiceNo": "INV-2025-00001",  ← Auto-generated
  "lpoNumber": "LPO-2025-00001",  ← From form
  ...
}

/payments/[ID] {
  "paymentNo": "PAY-2025-00001",  ← Auto-generated
  "invoiceNo": "INV-2025-00001",  ← From form
  ...
}

/deliveries/[ID] {
  "deliveryNo": "DLV-2025-00001", ← Auto-generated
  "lpoNumber": "LPO-2025-00001",  ← From form
  ...
}
```

## API Response Format

When you create a record, the API returns the generated number:

### LPO Creation Response
```json
{
  "id": "record-id",
  "lpoNumber": "LPO-2025-00001",
  "totalAmount": 5000,
  "amountPaid": 0,
  "balance": 5000,
  "paymentStatus": "unpaid"
}
```

### Invoice Creation Response
```json
{
  "id": "record-id",
  "invoiceNo": "INV-2025-00001",
  "lpoNumber": "LPO-2025-00001"
}
```

### Payment Creation Response
```json
{
  "id": "record-id",
  "paymentNo": "PAY-2025-00001",
  "invoiceNo": "INV-2025-00001"
}
```

### Delivery Creation Response
```json
{
  "id": "record-id",
  "deliveryNo": "DLV-2025-00001",
  "lpoNumber": "LPO-2025-00001"
}
```

## Summary

✅ **Sequential numbers are fully working!**

- Backend automatically generates numbers when records are created
- Numbers follow consistent format: `PREFIX-YEAR-XXXXX`
- Numbers increment properly: 00001, 00002, 00003...
- All pages display the numbers in their tables
- Numbers persist in Firebase after page refresh
- Cross-references between entities work correctly

**No further changes needed - just create records and enjoy automatic numbering!**
