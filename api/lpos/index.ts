import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleList } from '../../_helpers';
import { handleCreate, generateSequentialNumber } from '../../_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleList(res, '/lpos');

  if (req.method === 'POST') {
    try {
      let lpoNumber = req.body.manualLPONumber;
      if (lpoNumber && typeof lpoNumber === 'string') lpoNumber = lpoNumber.trim();
      if (!lpoNumber) lpoNumber = await generateSequentialNumber('LPO', '/lpos');

      const { manualLPONumber, lpoNumber: _skip, ...dataWithoutNumbers } = req.body;
      const lpoData = {
        ...dataWithoutNumbers,
        lpoNumber,
        amountPaid: 0,
        balance: req.body.totalAmount,
        paymentStatus: 'unpaid',
      };
      return handleCreate(res, '/lpos', lpoData);
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
