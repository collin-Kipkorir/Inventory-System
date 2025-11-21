import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { read, push, update, remove } from './firebase.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

const toArray = (obj: Record<string, unknown> | null | undefined) => !obj ? [] : Object.entries(obj).map(([id, val]) => ({ id, ...((val as Record<string, unknown>) || {}) }));

// Helper to generate sequential numbers
const generateSequentialNumber = async (prefix: string, path: string): Promise<string> => {
  const data = await read(path);
  const items = toArray(data);
  let maxNumber = 0;

  const fieldName = 
    prefix === 'LPO' ? 'lpoNumber' :
    prefix === 'INV' ? 'invoiceNo' :
    prefix === 'PAY' ? 'paymentNo' :
    prefix === 'DLV' ? 'deliveryNo' :
    prefix;

  console.log(`[Sequential] Generating ${prefix} number from ${items.length} existing items`);
  
  items.forEach((item: Record<string, unknown>) => {
    const numberStr = (item as Record<string, unknown>)[fieldName]?.toString() || '';
    const match = numberStr.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0]);
      maxNumber = Math.max(maxNumber, num);
    }
  });

  const newNumber = String(maxNumber + 1).padStart(5, '0');
  const result = `${prefix}-${new Date().getFullYear()}-${newNumber}`;
  console.log(`[Sequential] Generated number: ${result} (max was ${maxNumber})`);
  return result;
};

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Companies
app.get('/api/companies', async (req, res) => {
  try {
    const d = await read('/companies');
    res.json(toArray(d));
  } catch (e) {
    console.error('GET /companies error:', e);
    res.status(500).json({ error: String(e) });
  }
});
app.post('/api/companies', async (req, res) => {
  try { const r = await push('/companies', req.body); res.status(201).json(r); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.get('/api/companies/:id', async (req, res) => {
  try { const d = await read('/companies/' + req.params.id); res.json(d ? { id: req.params.id, ...d } : null); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.put('/api/companies/:id', async (req, res) => {
  try { await update('/companies/' + req.params.id, req.body); const d = await read('/companies/' + req.params.id); res.json({ id: req.params.id, ...d }); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.delete('/api/companies/:id', async (req, res) => {
  try { await remove('/companies/' + req.params.id); res.status(204).end(); } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Products
app.get('/api/products', async (req, res) => {
  try { const d = await read('/products'); res.json(toArray(d)); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.post('/api/products', async (req, res) => {
  try { const r = await push('/products', req.body); res.status(201).json(r); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.get('/api/products/:id', async (req, res) => {
  try { const d = await read('/products/' + req.params.id); res.json(d ? { id: req.params.id, ...d } : null); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.put('/api/products/:id', async (req, res) => {
  try { await update('/products/' + req.params.id, req.body); const d = await read('/products/' + req.params.id); res.json({ id: req.params.id, ...d }); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.delete('/api/products/:id', async (req, res) => {
  try { await remove('/products/' + req.params.id); res.status(204).end(); } catch (e) { res.status(500).json({ error: String(e) }); }
});

// LPOs
app.get('/api/lpos', async (req, res) => {
  try { const d = await read('/lpos'); res.json(toArray(d)); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.post('/api/lpos', async (req, res) => {
  try {
    console.log('📍 Backend: LPO POST received');
    console.log('📋 Request body includes:', Object.keys(req.body));
    console.log('📋 manualLPONumber:', req.body.manualLPONumber);
    
    // Check if manual LPO number is provided
    let lpoNumber = req.body.manualLPONumber;
    
    // Trim whitespace and validate
    if (lpoNumber && typeof lpoNumber === 'string') {
      lpoNumber = lpoNumber.trim();
    }
    
    // If no manual number provided, generate sequential number
    if (!lpoNumber) {
      lpoNumber = await generateSequentialNumber('LPO', '/lpos');
      console.log('✨ Backend: Auto-generated LPO number:', lpoNumber);
    } else {
      console.log('✋ Backend: Using manual LPO number:', lpoNumber);
    }
    
    // Prepare LPO data - explicitly exclude BOTH manualLPONumber and lpoNumber
    // to ensure we don't carry over any existing lpoNumber from request
    const { manualLPONumber, lpoNumber: _, ...dataWithoutNumbers } = req.body;
    const lpoData = { 
      ...dataWithoutNumbers,  // Spread without manualLPONumber or old lpoNumber
      lpoNumber,  // Set the final number (auto-generated or manual)
      amountPaid: 0, 
      balance: req.body.totalAmount, 
      paymentStatus: 'unpaid' 
    };
    
    console.log('💾 Backend: Saving LPO with number:', lpoNumber, '| Company:', lpoData.companyName);
    console.log('💾 Backend: Final LPO data keys:', Object.keys(lpoData));
    
    const r = await push('/lpos', lpoData);
    const response = { ...r, lpoNumber };
    
    console.log('✅ Backend: LPO created successfully with:', lpoNumber);
    res.status(201).json(response);
  } catch (e) { 
    console.error('❌ Backend: LPO creation error:', e);
    res.status(500).json({ error: String(e) }); 
  }
});
app.get('/api/lpos/:id', async (req, res) => {
  try { const d = await read('/lpos/' + req.params.id); res.json(d ? { id: req.params.id, ...d } : null); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.put('/api/lpos/:id', async (req, res) => {
  try { await update('/lpos/' + req.params.id, req.body); const d = await read('/lpos/' + req.params.id); res.json({ id: req.params.id, ...d }); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.delete('/api/lpos/:id', async (req, res) => {
  try { await remove('/lpos/' + req.params.id); res.status(204).end(); } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Deliveries
app.get('/api/deliveries', async (req, res) => {
  try { const d = await read('/deliveries'); res.json(toArray(d)); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.post('/api/deliveries', async (req, res) => {
  try {
    const deliveryNo = await generateSequentialNumber('DLV', '/deliveries');
    const deliveryData = { ...req.body, deliveryNo };
    const r = await push('/deliveries', deliveryData);
    res.status(201).json({ ...r, deliveryNo });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.get('/api/deliveries/:id', async (req, res) => {
  try { const d = await read('/deliveries/' + req.params.id); res.json(d ? { id: req.params.id, ...d } : null); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.put('/api/deliveries/:id', async (req, res) => {
  try { await update('/deliveries/' + req.params.id, req.body); const d = await read('/deliveries/' + req.params.id); res.json({ id: req.params.id, ...d }); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.delete('/api/deliveries/:id', async (req, res) => {
  try { await remove('/deliveries/' + req.params.id); res.status(204).end(); } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Invoices
app.get('/api/invoices', async (req, res) => {
  try { const d = await read('/invoices'); res.json(toArray(d)); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.post('/api/invoices', async (req, res) => {
  try {
    // Use provided invoiceNo if available (e.g., when creating from LPO with matching number)
    // Otherwise generate sequential number
    let invoiceNo = req.body.invoiceNo;
    if (!invoiceNo) {
      invoiceNo = await generateSequentialNumber('INV', '/invoices');
    }
    const invoiceData = { ...req.body, invoiceNo };
    const r = await push('/invoices', invoiceData);
    res.status(201).json({ ...r, invoiceNo });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.get('/api/invoices/:id', async (req, res) => {
  try { const d = await read('/invoices/' + req.params.id); res.json(d ? { id: req.params.id, ...d } : null); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.put('/api/invoices/:id', async (req, res) => {
  try { await update('/invoices/' + req.params.id, req.body); const d = await read('/invoices/' + req.params.id); res.json({ id: req.params.id, ...d }); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.delete('/api/invoices/:id', async (req, res) => {
  try { await remove('/invoices/' + req.params.id); res.status(204).end(); } catch (e) { res.status(500).json({ error: String(e) }); }
});

// Payments
app.get('/api/payments', async (req, res) => {
  try { const d = await read('/payments'); res.json(toArray(d)); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.post('/api/payments', async (req, res) => {
  try {
    const paymentNo = await generateSequentialNumber('PAY', '/payments');
    const paymentData = { ...req.body, paymentNo };
    const r = await push('/payments', paymentData);
    res.status(201).json({ ...r, paymentNo });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.get('/api/payments/:id', async (req, res) => {
  try { const d = await read('/payments/' + req.params.id); res.json(d ? { id: req.params.id, ...d } : null); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.put('/api/payments/:id', async (req, res) => {
  try { await update('/payments/' + req.params.id, req.body); const d = await read('/payments/' + req.params.id); res.json({ id: req.params.id, ...d }); } catch (e) { res.status(500).json({ error: String(e) }); }
});
app.delete('/api/payments/:id', async (req, res) => {
  try { await remove('/payments/' + req.params.id); res.status(204).end(); } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.listen(PORT, () => {
  console.log('✨ Backend listening on http://localhost:' + PORT);
  console.log('📡 Firebase RTDB');
});
