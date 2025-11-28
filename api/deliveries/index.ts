import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleList, handleCreate, generateSequentialNumber } from '../../_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleList(res, '/deliveries');
  if (req.method === 'POST') {
    try {
      const deliveryNo = await generateSequentialNumber('DLV', '/deliveries');
      const deliveryData = { ...req.body, deliveryNo };
      return handleCreate(res, '/deliveries', deliveryData);
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  }
  res.status(405).json({ error: 'Method not allowed' });
}
