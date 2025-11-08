import { Company, Product, Invoice, Payment, LPO, Delivery } from "@/types";

const STORAGE_KEYS = {
  COMPANIES: "sms_companies",
  PRODUCTS: "sms_products",
  INVOICES: "sms_invoices",
  PAYMENTS: "sms_payments",
  LPOS: "sms_lpos",
  DELIVERIES: "sms_deliveries",
};

// Generic storage functions
export function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Company functions
export function getCompanies(): Company[] {
  return getFromStorage<Company>(STORAGE_KEYS.COMPANIES);
}

export function saveCompanies(companies: Company[]): void {
  saveToStorage(STORAGE_KEYS.COMPANIES, companies);
}

// Product functions
export function getProducts(): Product[] {
  return getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
}

export function saveProducts(products: Product[]): void {
  saveToStorage(STORAGE_KEYS.PRODUCTS, products);
}

// Invoice functions
export function getInvoices(): Invoice[] {
  return getFromStorage<Invoice>(STORAGE_KEYS.INVOICES);
}

export function saveInvoices(invoices: Invoice[]): void {
  saveToStorage(STORAGE_KEYS.INVOICES, invoices);
}

// Payment functions
export function getPayments(): Payment[] {
  return getFromStorage<Payment>(STORAGE_KEYS.PAYMENTS);
}

export function savePayments(payments: Payment[]): void {
  saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
}

// LPO functions
export function getLPOs(): LPO[] {
  return getFromStorage<LPO>(STORAGE_KEYS.LPOS);
}

export function saveLPOs(lpos: LPO[]): void {
  saveToStorage(STORAGE_KEYS.LPOS, lpos);
}

// Delivery functions
export function getDeliveries(): Delivery[] {
  return getFromStorage<Delivery>(STORAGE_KEYS.DELIVERIES);
}

export function saveDeliveries(deliveries: Delivery[]): void {
  saveToStorage(STORAGE_KEYS.DELIVERIES, deliveries);
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate invoice number
export function generateInvoiceNumber(): string {
  const invoices = getInvoices();
  const count = invoices.length + 1;
  return `INV-${new Date().getFullYear()}-${String(count).padStart(4, "0")}`;
}

// Generate payment number
export function generatePaymentNumber(): string {
  const payments = getPayments();
  const count = payments.length + 1;
  return `PAY-${new Date().getFullYear()}-${String(count).padStart(4, "0")}`;
}

// Generate LPO number
export function generateLPONumber(): string {
  const lpos = getLPOs();
  const count = lpos.length + 1;
  return `LPO-${new Date().getFullYear()}-${String(count).padStart(4, "0")}`;
}

// Generate delivery number
export function generateDeliveryNumber(): string {
  const deliveries = getDeliveries();
  const count = deliveries.length + 1;
  return `DEL-${new Date().getFullYear()}-${String(count).padStart(4, "0")}`;
}
