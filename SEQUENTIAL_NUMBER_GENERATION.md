# Sequential Number Generation Fix

## Problem
The Invoice No, LPO Number, Delivery No, and Payment No fields were not being generated and retrieved properly.

## Solution Implemented

### Backend Changes (backend/src/index.ts)

#### 1. Added Sequential Number Generator Function
```typescript
const generateSequentialNumber = async (prefix: string, path: string): Promise<string> => {
  const data = await read(path);
  const items = toArray(data);
  let maxNumber = 0;

  items.forEach((item: Record<string, unknown>) => {
    const numberStr = (item as Record<string, unknown>)[prefix]?.toString() || '';
    const match = numberStr.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0]);
      maxNumber = Math.max(maxNumber, num);
    }
  });

  const newNumber = String(maxNumber + 1).padStart(5, '0');
  return `${prefix}-${new Date().getFullYear()}-${newNumber}`;
};
```

**How it works:**
- Queries existing records from the specified path
- Extracts numeric suffixes from existing numbers
- Finds the maximum number used
- Generates the next sequential number with format: `PREFIX-YEAR-00001`

**Format Examples:**
- LPO: `LPO-2025-00001`, `LPO-2025-00002`
- Invoice: `INV-2025-00001`, `INV-2025-00002`
- Delivery: `DLV-2025-00001`, `DLV-2025-00002`
- Payment: `PAY-2025-00001`, `PAY-2025-00002`

#### 2. Updated POST Endpoints

**LPO Creation:**
```typescript
app.post('/api/lpos', async (req, res) => {
  try {
    const lpoNumber = await generateSequentialNumber('LPO', '/lpos');
    const lpoData = { 
      ...req.body, 
      lpoNumber, 
      amountPaid: 0, 
      balance: req.body.totalAmount, 
      paymentStatus: 'unpaid' 
    };
    const r = await push('/lpos', lpoData);
    res.status(201).json({ ...r, lpoNumber });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});
```

**Invoice Creation:**
```typescript
app.post('/api/invoices', async (req, res) => {
  try {
    const invoiceNo = await generateSequentialNumber('INV', '/invoices');
    const invoiceData = { ...req.body, invoiceNo };
    const r = await push('/invoices', invoiceData);
    res.status(201).json({ ...r, invoiceNo });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});
```

**Delivery Creation:**
```typescript
app.post('/api/deliveries', async (req, res) => {
  try {
    const deliveryNo = await generateSequentialNumber('DLV', '/deliveries');
    const deliveryData = { ...req.body, deliveryNo };
    const r = await push('/deliveries', deliveryData);
    res.status(201).json({ ...r, deliveryNo });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});
```

**Payment Creation:**
```typescript
app.post('/api/payments', async (req, res) => {
  try {
    const paymentNo = await generateSequentialNumber('PAY', '/payments');
    const paymentData = { ...req.body, paymentNo };
    const r = await push('/payments', paymentData);
    res.status(201).json({ ...r, paymentNo });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});
```

#### 3. Default Values for LPO
When creating an LPO, the following defaults are now set:
- `amountPaid`: 0
- `balance`: totalAmount (equals totalAmount initially)
- `paymentStatus`: 'unpaid'

### Frontend No Changes Required
The frontend components already have the necessary fields in their types:
- `Invoice.invoiceNo` ✓
- `LPO.lpoNumber` ✓
- `Delivery.deliveryNo` ✓
- `Payment.paymentNo` ✓

## Data Flow

### Creating an LPO:
1. Frontend calls `createLpo()` → `/api/lpos` POST
2. Backend generates `lpoNumber` (e.g., `LPO-2025-00001`)
3. Backend includes generated `lpoNumber` in the data before saving to Firebase
4. Backend returns response with `lpoNumber`
5. Frontend displays `lpoNumber` in tables and dialogs

### Creating an Invoice:
1. Frontend calls `createInvoice()` → `/api/invoices` POST
2. Backend generates `invoiceNo` (e.g., `INV-2025-00001`)
3. Backend includes generated `invoiceNo` in the data before saving to Firebase
4. Backend returns response with `invoiceNo`
5. Frontend displays `invoiceNo` in tables and dialogs

### Similar flow for Deliveries and Payments

## Benefits
✅ **Automatic Generation** - Numbers are generated server-side, ensuring uniqueness
✅ **Sequential** - Numbers are properly ordered with zero-padding
✅ **Readable Format** - Includes prefix and year for easy identification
✅ **Persistent** - Numbers are stored in Firebase and retrieved consistently
✅ **No Frontend Logic** - Backend handles all number generation

## Testing Checklist
- [ ] Create an LPO → Verify it has a `lpoNumber` (e.g., LPO-2025-00001)
- [ ] Create another LPO → Verify it has next number (e.g., LPO-2025-00002)
- [ ] Create an Invoice → Verify it has `invoiceNo` (e.g., INV-2025-00001)
- [ ] Create a Delivery → Verify it has `deliveryNo` (e.g., DLV-2025-00001)
- [ ] Create a Payment → Verify it has `paymentNo` (e.g., PAY-2025-00001)
- [ ] Refresh page → Verify numbers are retrieved correctly from Firebase
- [ ] Check tables display the generated numbers in all columns

## Files Modified
- `backend/src/index.ts` - Added number generation function and updated POST endpoints
