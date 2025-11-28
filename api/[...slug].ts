import { VercelRequest, VercelResponse } from '@vercel/node';
import { read, push, update, remove } from '../backend/src/firebase';

const toArray = (obj: Record<string, unknown> | null | undefined) =>
  !obj ? [] : Object.entries(obj).map(([id, val]) => ({ id, ...((val as Record<string, unknown>) || {}) }));

async function generateSequentialNumber(prefix: string, path: string): Promise<string> {
  const data = await read(path);
  const items = toArray(data);
  let maxNumber = 0;

  const fieldName =
    prefix === 'LPO' ? 'lpoNumber' :
    prefix === 'INV' ? 'invoiceNo' :
    prefix === 'PAY' ? 'paymentNo' :
    prefix === 'DLV' ? 'deliveryNo' :
    prefix;

  items.forEach((item: Record<string, unknown>) => {
    const numberStr = (item as Record<string, unknown>)[fieldName]?.toString() || '';
    const match = numberStr.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0]);
      maxNumber = Math.max(maxNumber, num);
    }
  });

  const newNumber = String(maxNumber + 1).padStart(5, '0');
  return `${prefix}-${new Date().getFullYear()}-${newNumber}`;
}

function sendJson(res: VercelResponse, status: number, body: any) {
  res.status(status).json(body);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const base = req.url ? req.url : '';
    // Ensure we have a base for URL parsing; host doesn't matter for path parsing
    const url = new URL(base, 'http://localhost');
    let pathname = url.pathname || '/';

    // Remove trailing slashes
    pathname = pathname.replace(/\/+$|^\/+/, (m) => m.startsWith('/') ? '/' : '');

    // Remove leading '/api' if present
    if (pathname.startsWith('/api')) pathname = pathname.slice(4) || '/';

    const parts = pathname.split('/').filter(Boolean); // e.g. ['companies', 'id']
    const resource = parts[0] || '';
    const id = parts[1] || '';

    // Health
    if ((resource === '' || resource === 'health') && req.method === 'GET') {
      return sendJson(res, 200, { ok: true });
    }

    // Generic routing for collections
    if (resource === 'companies') {
      if (req.method === 'GET' && !id) {
        const d = await read('/companies');
        return sendJson(res, 200, toArray(d));
      }
      if (req.method === 'POST') {
        const r = await push('/companies', req.body);
        return sendJson(res, 201, r);
      }
      if (id) {
        if (req.method === 'GET') {
          const d = await read('/companies/' + id);
          return sendJson(res, 200, d ? { id, ...d } : null);
        }
        if (req.method === 'PUT') {
          await update('/companies/' + id, req.body);
          const d = await read('/companies/' + id);
          return sendJson(res, 200, { id, ...d });
        }
        if (req.method === 'DELETE') {
          await remove('/companies/' + id);
          return res.status(204).end();
        }
      }
    }

    if (resource === 'products') {
      if (req.method === 'GET' && !id) {
        const d = await read('/products');
        return sendJson(res, 200, toArray(d));
      }
      if (req.method === 'POST') {
        const r = await push('/products', req.body);
        return sendJson(res, 201, r);
      }
      if (id) {
        if (req.method === 'GET') {
          const d = await read('/products/' + id);
          return sendJson(res, 200, d ? { id, ...d } : null);
        }
        if (req.method === 'PUT') {
          await update('/products/' + id, req.body);
          const d = await read('/products/' + id);
          return sendJson(res, 200, { id, ...d });
        }
        if (req.method === 'DELETE') {
          await remove('/products/' + id);
          return res.status(204).end();
        }
      }
    }

    if (resource === 'lpos') {
      if (req.method === 'GET' && !id) {
        const d = await read('/lpos');
        return sendJson(res, 200, toArray(d));
      }

      if (req.method === 'POST') {
        let lpoNumber = req.body?.manualLPONumber;
        if (lpoNumber && typeof lpoNumber === 'string') lpoNumber = lpoNumber.trim();
        if (!lpoNumber) lpoNumber = await generateSequentialNumber('LPO', '/lpos');

        const { manualLPONumber, lpoNumber: _skip, ...dataWithoutNumbers } = req.body || {};
        const lpoData = {
          ...dataWithoutNumbers,
          lpoNumber,
          amountPaid: 0,
          balance: req.body?.totalAmount,
          paymentStatus: 'unpaid',
        };
        const r = await push('/lpos', lpoData);
        return sendJson(res, 201, { ...r, lpoNumber });
      }

      if (id) {
        if (req.method === 'GET') {
          const d = await read('/lpos/' + id);
          return sendJson(res, 200, d ? { id, ...d } : null);
        }
        if (req.method === 'PUT') {
          await update('/lpos/' + id, req.body);
          const d = await read('/lpos/' + id);
          return sendJson(res, 200, { id, ...d });
        }
        if (req.method === 'DELETE') {
          await remove('/lpos/' + id);
          return res.status(204).end();
        }
      }
    }

    if (resource === 'deliveries') {
      if (req.method === 'GET' && !id) {
        const d = await read('/deliveries');
        return sendJson(res, 200, toArray(d));
      }
      if (req.method === 'POST') {
        const deliveryNo = await generateSequentialNumber('DLV', '/deliveries');
        const r = await push('/deliveries', { ...req.body, deliveryNo });
        return sendJson(res, 201, { ...r, deliveryNo });
      }
      if (id) {
        if (req.method === 'GET') {
          const d = await read('/deliveries/' + id);
          return sendJson(res, 200, d ? { id, ...d } : null);
        }
        if (req.method === 'PUT') {
          await update('/deliveries/' + id, req.body);
          const d = await read('/deliveries/' + id);
          return sendJson(res, 200, { id, ...d });
        }
        if (req.method === 'DELETE') {
          await remove('/deliveries/' + id);
          return res.status(204).end();
        }
      }
    }

    if (resource === 'invoices') {
      if (req.method === 'GET' && !id) {
        const d = await read('/invoices');
        return sendJson(res, 200, toArray(d));
      }
      if (req.method === 'POST') {
        let invoiceNo = req.body?.invoiceNo;
        if (!invoiceNo) invoiceNo = await generateSequentialNumber('INV', '/invoices');
        const r = await push('/invoices', { ...req.body, invoiceNo });
        return sendJson(res, 201, { ...r, invoiceNo });
      }
      if (id) {
        if (req.method === 'GET') {
          const d = await read('/invoices/' + id);
          return sendJson(res, 200, d ? { id, ...d } : null);
        }
        if (req.method === 'PUT') {
          await update('/invoices/' + id, req.body);
          const d = await read('/invoices/' + id);
          return sendJson(res, 200, { id, ...d });
        }
        if (req.method === 'DELETE') {
          await remove('/invoices/' + id);
          return res.status(204).end();
        }
      }
    }

    if (resource === 'payments') {
      if (req.method === 'GET' && !id) {
        const d = await read('/payments');
        return sendJson(res, 200, toArray(d));
      }
      if (req.method === 'POST') {
        const paymentNo = await generateSequentialNumber('PAY', '/payments');
        const r = await push('/payments', { ...req.body, paymentNo });
        return sendJson(res, 201, { ...r, paymentNo });
      }
      if (id) {
        if (req.method === 'GET') {
          const d = await read('/payments/' + id);
          return sendJson(res, 200, d ? { id, ...d } : null);
        }
        if (req.method === 'PUT') {
          await update('/payments/' + id, req.body);
          const d = await read('/payments/' + id);
          return sendJson(res, 200, { id, ...d });
        }
        if (req.method === 'DELETE') {
          await remove('/payments/' + id);
          return res.status(204).end();
        }
      }
    }

    // Unknown route
    return sendJson(res, 404, { error: 'Not found' });
  } catch (e) {
    return sendJson(res, 500, { error: String(e) });
  }
}
