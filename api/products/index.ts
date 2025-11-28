import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleList, handleCreate } from '../../_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleList(res, '/products');
  if (req.method === 'POST') return handleCreate(res, '/products', req.body);
  res.status(405).json({ error: 'Method not allowed' });
}
