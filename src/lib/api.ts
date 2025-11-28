// Type-safe API client for frontend
// Communicates with backend. In production set VITE_API_BASE in your Vercel
// environment variables to point to the backend URL (e.g. https://api.example.com)
// If not set, defaults to the same-origin '/api' path so you can host a server
// under the same origin (Vercel serverless functions, for instance).

const API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE
  ? String(import.meta.env.VITE_API_BASE)
  : '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiCall<T>(
  method: string,
  endpoint: string,
  body?: Record<string, unknown>
): Promise<T> {
  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} ${error}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`API call failed: ${message}`);
  }
}

// ===== Companies =====

export async function listCompanies() {
  return apiCall<any[]>('GET', '/companies');
}

export async function getCompany(id: string) {
  return apiCall<any>('GET', `/companies/${id}`);
}

export async function createCompany(data: Record<string, unknown>) {
  return apiCall<any>('POST', '/companies', data);
}

export async function updateCompany(id: string, data: Record<string, unknown>) {
  return apiCall<any>('PUT', `/companies/${id}`, data);
}

export async function deleteCompany(id: string) {
  return apiCall<void>('DELETE', `/companies/${id}`);
}

// ===== Products =====

export async function listProducts() {
  return apiCall<any[]>('GET', '/products');
}

export async function getProduct(id: string) {
  return apiCall<any>('GET', `/products/${id}`);
}

export async function createProduct(data: Record<string, unknown>) {
  return apiCall<any>('POST', '/products', data);
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  return apiCall<any>('PUT', `/products/${id}`, data);
}

export async function deleteProduct(id: string) {
  return apiCall<void>('DELETE', `/products/${id}`);
}

// ===== LPOs =====

export async function listLpos() {
  return apiCall<any[]>('GET', '/lpos');
}

export async function getLpo(id: string) {
  return apiCall<any>('GET', `/lpos/${id}`);
}

export async function createLpo(data: Record<string, unknown>) {
  console.log('Creating LPO with data:', data);
  const result = await apiCall<any>('POST', '/lpos', data);
  console.log('LPO creation result:', result);
  return result;
}

export async function updateLpo(id: string, data: Record<string, unknown>) {
  return apiCall<any>('PUT', `/lpos/${id}`, data);
}

export async function deleteLpo(id: string) {
  return apiCall<void>('DELETE', `/lpos/${id}`);
}

// ===== Deliveries =====

export async function listDeliveries() {
  return apiCall<any[]>('GET', '/deliveries');
}

export async function getDelivery(id: string) {
  return apiCall<any>('GET', `/deliveries/${id}`);
}

export async function createDelivery(data: Record<string, unknown>) {
  return apiCall<any>('POST', '/deliveries', data);
}

export async function updateDelivery(id: string, data: Record<string, unknown>) {
  return apiCall<any>('PUT', `/deliveries/${id}`, data);
}

export async function deleteDelivery(id: string) {
  return apiCall<void>('DELETE', `/deliveries/${id}`);
}

// ===== Invoices =====

export async function listInvoices() {
  return apiCall<any[]>('GET', '/invoices');
}

export async function getInvoice(id: string) {
  return apiCall<any>('GET', `/invoices/${id}`);
}

export async function createInvoice(data: Record<string, unknown>) {
  return apiCall<any>('POST', '/invoices', data);
}

export async function updateInvoice(id: string, data: Record<string, unknown>) {
  return apiCall<any>('PUT', `/invoices/${id}`, data);
}

export async function deleteInvoice(id: string) {
  return apiCall<void>('DELETE', `/invoices/${id}`);
}

// ===== Payments =====

export async function listPayments() {
  return apiCall<any[]>('GET', '/payments');
}

export async function getPayment(id: string) {
  return apiCall<any>('GET', `/payments/${id}`);
}

export async function createPayment(data: Record<string, unknown>) {
  return apiCall<any>('POST', '/payments', data);
}

export async function updatePayment(id: string, data: Record<string, unknown>) {
  return apiCall<any>('PUT', `/payments/${id}`, data);
}

export async function deletePayment(id: string) {
  return apiCall<void>('DELETE', `/payments/${id}`);
}
