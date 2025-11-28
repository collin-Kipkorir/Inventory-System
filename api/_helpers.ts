import { VercelRequest, VercelResponse } from '@vercel/node';
import { read, push, update, remove } from '../backend/src/firebase';

const toArray = (obj: Record<string, unknown> | null | undefined) => !obj ? [] : Object.entries(obj).map(([id, val]) => ({ id, ...((val as Record<string, unknown>) || {}) }));

export async function jsonResponse(res: VercelResponse, status: number, body: any) {
  res.status(status).json(body);
}

export async function handleList(res: VercelResponse, path: string) {
  try {
    const d = await read(path);
    return jsonResponse(res, 200, toArray(d));
  } catch (e) {
    return jsonResponse(res, 500, { error: String(e) });
  }
}

export async function handleCreate(res: VercelResponse, path: string, body: any) {
  try {
    const r = await push(path, body);
    return jsonResponse(res, 201, r);
  } catch (e) {
    return jsonResponse(res, 500, { error: String(e) });
  }
}

export async function handleGet(res: VercelResponse, path: string, id: string) {
  try {
    const d = await read(path + '/' + id);
    return jsonResponse(res, 200, d ? { id, ...d } : null);
  } catch (e) {
    return jsonResponse(res, 500, { error: String(e) });
  }
}

export async function handleUpdate(res: VercelResponse, path: string, id: string, body: any) {
  try {
    await update(path + '/' + id, body);
    const d = await read(path + '/' + id);
    return jsonResponse(res, 200, { id, ...d });
  } catch (e) {
    return jsonResponse(res, 500, { error: String(e) });
  }
}

export async function handleDelete(res: VercelResponse, path: string, id: string) {
  try {
    await remove(path + '/' + id);
    res.status(204).end();
  } catch (e) {
    return jsonResponse(res, 500, { error: String(e) });
  }
}

export async function generateSequentialNumber(prefix: string, path: string): Promise<string> {
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
