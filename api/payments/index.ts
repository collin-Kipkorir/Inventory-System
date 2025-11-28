import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleList, handleCreate, generateSequentialNumber } from '../../_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleList(res, '/payments');

  if (req.method === 'POST') {
    try {
      const paymentNo = await generateSequentialNumber('PAY', '/payments');
      const paymentData = { ...req.body, paymentNo };
      return handleCreate(res, '/payments', paymentData);
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
