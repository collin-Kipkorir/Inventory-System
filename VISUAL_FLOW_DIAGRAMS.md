# Sequential Number Generation - Visual Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SMS INVENTORY SYSTEM                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐          ┌──────────────────────────────┐
│      FRONTEND (React)         │          │    BACKEND (Express.js)      │
├──────────────────────────────┤          ├──────────────────────────────┤
│ • LPOs Page                   │          │ • POST /api/lpos             │
│ • Invoices Page               │ ◄──────► │   → Generates lpoNumber      │
│ • Payments Page               │  HTTP    │                              │
│ • Deliveries Page             │  REST    │ • POST /api/invoices         │
│                               │          │   → Generates invoiceNo      │
│ Shows:                        │          │                              │
│ • lpoNumber                   │          │ • POST /api/payments         │
│ • invoiceNo                   │          │   → Generates paymentNo      │
│ • paymentNo                   │          │                              │
│ • deliveryNo                  │          │ • POST /api/deliveries       │
│ • Cross-references            │          │   → Generates deliveryNo     │
└──────────────────────────────┘          └──────────────────────────────┘
           ▲                                       ▲
           │ Display                              │ Store
           │ Numbers                              │ Numbers
           │                                      ▼
           │                        ┌──────────────────────────────┐
           │                        │   Firebase Realtime DB       │
           │                        ├──────────────────────────────┤
           └────────────────────────│ /lpos/{id}                   │
                                    │   - lpoNumber ✓              │
                                    │ /invoices/{id}               │
                                    │   - invoiceNo ✓              │
                                    │   - lpoNumber ✓ (ref)        │
                                    │ /payments/{id}               │
                                    │   - paymentNo ✓              │
                                    │   - invoiceNo ✓ (ref)        │
                                    │ /deliveries/{id}             │
                                    │   - deliveryNo ✓             │
                                    │   - lpoNumber ✓ (ref)        │
                                    └──────────────────────────────┘
```

---

## Number Generation Flow

### LPO Creation Flow

```
User creates LPO
       │
       ▼
┌─────────────────────────┐
│ CreateLPODialog         │
│ - Company              │
│ - Items                │
│ - Total Amount         │
└─────────────────────────┘
       │
       │ POST /api/lpos
       ▼
┌─────────────────────────┐
│ Backend POST /api/lpos  │
└─────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│ generateSequentialNumber('LPO', '/lpos')    │
│ 1. Read /lpos from Firebase                │
│ 2. Find max existing number                │
│    (e.g., "LPO-2025-00005")                │
│ 3. Generate next number                    │
│    (e.g., "LPO-2025-00006")                │
└─────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Store LPO with:              │
│ - lpoNumber: "LPO-2025-00006"│
│ - amountPaid: 0              │
│ - balance: totalAmount       │
│ - paymentStatus: "unpaid"    │
└──────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Return Response with        │
│ - id                        │
│ - lpoNumber                 │
│ - Other fields              │
└─────────────────────────────┘
       │
       ▼
Frontend displays LPO in table with
generated lpoNumber: "LPO-2025-00006" ✓
```

---

### Invoice Creation Flow

```
User creates Invoice (linked to LPO)
       │
       ▼
┌──────────────────────────────┐
│ CreateInvoiceDialog          │
│ - Company                   │
│ - Items                     │
│ - LPO Reference (optional)  │
│   (e.g., "LPO-2025-00001")  │
└──────────────────────────────┘
       │
       │ POST /api/invoices
       │ { ..., lpoNumber: "LPO-2025-00001" }
       ▼
┌─────────────────────────────┐
│ Backend POST /api/invoices  │
└─────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ generateSequentialNumber('INV', '/invoices') │
│ 1. Read /invoices from Firebase             │
│ 2. Find max existing number                 │
│    (e.g., "INV-2025-00003")                 │
│ 3. Generate next number                     │
│    (e.g., "INV-2025-00004")                 │
└──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Store Invoice with:              │
│ - invoiceNo: "INV-2025-00004"   │
│ - lpoNumber: "LPO-2025-00001"   │
│ - (other fields from form)      │
└─────────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Return Response with         │
│ - id                         │
│ - invoiceNo                  │
│ - lpoNumber (from request)   │
└──────────────────────────────┘
       │
       ▼
Frontend displays Invoice with:
- invoiceNo: "INV-2025-00004" ✓
- lpoNumber: "LPO-2025-00001" ✓
```

---

### Payment Creation Flow

```
User creates Payment (linked to Invoice)
       │
       ▼
┌──────────────────────────────┐
│ CreatePaymentDialog          │
│ - Company                   │
│ - Amount                    │
│ - Invoice Ref (optional)    │
│   (e.g., "INV-2025-00004")  │
└──────────────────────────────┘
       │
       │ POST /api/payments
       │ { ..., invoiceNo: "INV-2025-00004" }
       ▼
┌─────────────────────────────┐
│ Backend POST /api/payments  │
└─────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ generateSequentialNumber('PAY', '/payments') │
│ 1. Read /payments from Firebase             │
│ 2. Find max existing number                 │
│    (e.g., "PAY-2025-00002")                 │
│ 3. Generate next number                     │
│    (e.g., "PAY-2025-00003")                 │
└──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Store Payment with:              │
│ - paymentNo: "PAY-2025-00003"   │
│ - invoiceNo: "INV-2025-00004"   │
│ - (other fields from form)      │
└─────────────────────────────────┘
       │
       ▼
Frontend displays Payment with:
- paymentNo: "PAY-2025-00003" ✓
- invoiceNo: "INV-2025-00004" ✓
```

---

## Data Cross-Reference Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   COMPLETE FLOW EXAMPLE                     │
└─────────────────────────────────────────────────────────────┘

Step 1: Create LPO
┌────────────────────────┐
│ LPO Created            │
│ lpoNumber: LPO-2025-00001 │
│ totalAmount: $5,000    │
└────────────────────────┘
           │
           ▼

Step 2: Create Invoice from LPO
┌────────────────────────────────┐
│ Invoice Created                │
│ invoiceNo: INV-2025-00001     │
│ lpoNumber: LPO-2025-00001     │ ◄─── Reference
│ amount: $5,000                 │
└────────────────────────────────┘
           │
           ▼

Step 3: Create Payment for Invoice
┌────────────────────────────────┐
│ Payment Created                │
│ paymentNo: PAY-2025-00001     │
│ invoiceNo: INV-2025-00001     │ ◄─── Reference
│ lpoNumber: LPO-2025-00001     │ ◄─── Can also reference LPO
│ amount: $2,500 (partial)      │
└────────────────────────────────┘
           │
           ▼

Step 4: Create Delivery for LPO
┌────────────────────────────────┐
│ Delivery Created               │
│ deliveryNo: DLV-2025-00001    │
│ lpoNumber: LPO-2025-00001     │ ◄─── Reference
│ items: [...]                   │
└────────────────────────────────┘

Result: Complete Traceability
LPO-2025-00001
    ├─→ Invoice: INV-2025-00001
    │       └─→ Payment: PAY-2025-00001
    │       └─→ Payment: PAY-2025-00002
    └─→ Delivery: DLV-2025-00001
```

---

## Sequential Number Generation Algorithm

```
generateSequentialNumber(prefix, path):
    │
    ├─ 1. Read all records from Firebase path
    │     Example: /lpos returns { id1: {...}, id2: {...}, ... }
    │
    ├─ 2. Convert to array and extract numbers
    │     For each item, get the field matching prefix
    │     Example: item.LPO → "LPO-2025-00005"
    │
    ├─ 3. Extract numeric suffix using regex
    │     "LPO-2025-00005" → regex finds → "5"
    │     Parse as integer: 5
    │
    ├─ 4. Find maximum number seen
    │     Compare all numbers, keep max
    │     Example: max([1, 2, 5, 3]) → 5
    │
    ├─ 5. Calculate next number
    │     nextNumber = max + 1 = 6
    │
    ├─ 6. Format with padding
    │     Pad to 5 digits with zeros: "00006"
    │
    └─ 7. Generate final number
        Format: ${prefix}-${year}-${padded}
        Result: "LPO-2025-00006"
```

---

## Database Structure Visualization

```
Firebase Realtime Database:

root/
├── companies/
│   ├── company-id-1
│   │   ├── name: "Acme Corp"
│   │   └── ...
│   └── company-id-2
│       ├── name: "Tech Inc"
│       └── ...
│
├── lpos/ ────────────────────────────────────┐
│   ├── lpo-id-1                             │ Shows generated
│   │   ├── lpoNumber: "LPO-2025-00001"      │ lpoNumber
│   │   ├── totalAmount: 5000                │
│   │   ├── amountPaid: 0                    │ Auto-set
│   │   ├── balance: 5000                    │
│   │   └── paymentStatus: "unpaid"          │
│   └── lpo-id-2                             │
│       ├── lpoNumber: "LPO-2025-00002"      │
│       └── ...                              │
└───────────────────────────────────────────┘
│
├── invoices/ ─────────────────────────────────┐
│   ├── invoice-id-1                         │ Shows generated
│   │   ├── invoiceNo: "INV-2025-00001"      │ invoiceNo
│   │   ├── lpoNumber: "LPO-2025-00001"      │ Shows reference
│   │   └── ...                              │
│   └── invoice-id-2                         │
│       ├── invoiceNo: "INV-2025-00002"      │
│       └── ...                              │
└───────────────────────────────────────────┘
│
├── payments/ ──────────────────────────────────┐
│   ├── payment-id-1                         │ Shows generated
│   │   ├── paymentNo: "PAY-2025-00001"      │ paymentNo
│   │   ├── invoiceNo: "INV-2025-00001"      │ Shows reference
│   │   └── ...                              │
│   └── payment-id-2                         │
│       ├── paymentNo: "PAY-2025-00002"      │
│       └── ...                              │
└───────────────────────────────────────────┘
│
└── deliveries/ ────────────────────────────────┐
    ├── delivery-id-1                         │ Shows generated
    │   ├── deliveryNo: "DLV-2025-00001"     │ deliveryNo
    │   ├── lpoNumber: "LPO-2025-00001"      │ Shows reference
    │   └── ...                              │
    └── delivery-id-2                         │
        ├── deliveryNo: "DLV-2025-00001"     │
        └── ...                              │
└───────────────────────────────────────────┘
```

---

## Page Display Tables

### LPOs Page
```
┌─────────────────────┬──────────────┬──────────────┬───────────────┐
│ LPO Number          │ Company      │ Total Amount │ Payment Status│
├─────────────────────┼──────────────┼──────────────┼───────────────┤
│ LPO-2025-00001 ✓    │ Acme Corp    │ $5,000       │ Unpaid        │
│ LPO-2025-00002 ✓    │ Tech Inc     │ $3,500       │ Unpaid        │
│ LPO-2025-00003 ✓    │ Global Ltd   │ $8,200       │ Unpaid        │
└─────────────────────┴──────────────┴──────────────┴───────────────┘
    Generated numbers appear ✓
```

### Invoices Page
```
┌─────────────────────┬──────────────────┬──────────────┬─────────┐
│ Invoice No          │ LPO Reference    │ Company      │ Amount  │
├─────────────────────┼──────────────────┼──────────────┼─────────┤
│ INV-2025-00001 ✓    │ LPO-2025-00001 ✓ │ Acme Corp    │ $5,000  │
│ INV-2025-00002 ✓    │ LPO-2025-00002 ✓ │ Tech Inc     │ $3,500  │
│ INV-2025-00003 ✓    │ -                │ Global Ltd   │ $2,100  │
└─────────────────────┴──────────────────┴──────────────┴─────────┘
    Generated invoiceNo ✓    Cross-reference ✓
```

### Payments Page
```
┌─────────────────────┬──────────────────┬──────────────┬─────────┐
│ Payment No          │ Reference        │ Company      │ Amount  │
├─────────────────────┼──────────────────┼──────────────┼─────────┤
│ PAY-2025-00001 ✓    │ INV-2025-00001 ✓ │ Acme Corp    │ $2,500  │
│ PAY-2025-00002 ✓    │ INV-2025-00002 ✓ │ Tech Inc     │ $3,500  │
│ PAY-2025-00003 ✓    │ LPO-2025-00003 ✓ │ Global Ltd   │ $1,000  │
└─────────────────────┴──────────────────┴──────────────┴─────────┘
    Generated paymentNo ✓    Cross-reference ✓
```

---

## Error Prevention Flow

```
When creating a new record:

1. Frontend sends POST with data
                    │
                    ▼
2. Backend receives POST request
                    │
                    ▼
3. Check: Does record already exist? ──► No ──┐
          (Should not, it's new)              │
                    │◄──────────────────────────┘
                    │
                    ▼
4. Generate sequential number
   - Query Firebase for existing records
   - Find highest number
   - Increment
   - Return formatted number
                    │
                    ▼
5. Add generated number to record data
                    │
                    ▼
6. Save to Firebase
                    │
                    ▼
7. Return response with generated number
                    │
                    ▼
8. Frontend receives response and displays number

✓ No duplicate numbers (each is unique)
✓ Numbers properly incremented
✓ Format consistent across all entities
✓ Errors handled gracefully
```

---

## Benefits Summary

```
BEFORE: ❌
├─ No auto-generated numbers
├─ Manual entry = human error
├─ Duplicate numbers possible
├─ No cross-references
└─ Hard to track documents

AFTER: ✅
├─ Auto-generated sequential numbers
├─ Format: PREFIX-YEAR-XXXXX
├─ Server-side generation = uniqueness
├─ Cross-references between entities
├─ Easy document traceability
├─ Consistent across all pages
└─ Ready to export/print
```

---

## Summary

The sequential number generation system provides:

1. **Automatic Generation** - Numbers created on record creation
2. **Sequential Format** - `PREFIX-YYYY-XXXXX` (e.g., `LPO-2025-00001`)
3. **Database Storage** - Numbers stored in Firebase persistently
4. **Frontend Display** - All pages show generated numbers
5. **Cross-References** - Related records link via numbers
6. **Uniqueness** - Server-side generation prevents duplicates
7. **Scalability** - Year-based prefixes support future growth

All fully implemented and ready to use! ✅
