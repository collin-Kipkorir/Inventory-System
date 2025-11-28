import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleGet, handleUpdate, handleDelete } from '../../_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id?: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });

  if (req.method === 'GET') return handleGet(res, '/payments', id);
  if (req.method === 'PUT') return handleUpdate(res, '/payments', id, req.body);
  if (req.method === 'DELETE') return handleDelete(res, '/payments', id);
  res.status(405).json({ error: 'Method not allowed' });
}
