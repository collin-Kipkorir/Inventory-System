import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleList, handleCreate, generateSequentialNumber } from '../../_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleList(res, '/invoices');

  if (req.method === 'POST') {
    try {
      let invoiceNo = req.body.invoiceNo;
      if (!invoiceNo) invoiceNo = await generateSequentialNumber('INV', '/invoices');
      const invoiceData = { ...req.body, invoiceNo };
      return handleCreate(res, '/invoices', invoiceData);
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
