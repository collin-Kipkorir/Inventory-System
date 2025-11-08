export interface Company {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  createdAt: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  companyId: string;
  companyName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: "paid" | "partial" | "unpaid";
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNo: string;
  companyId: string;
  companyName: string;
  invoiceId?: string;
  invoiceNo?: string;
  date: string;
  amountPaid: number;
  mode: "cash" | "mpesa" | "bank";
  remarks?: string;
  createdAt: string;
}

export interface LPO {
  id: string;
  lpoNumber: string;
  companyId: string;
  companyName: string;
  items: InvoiceItem[];
  totalAmount: number;
  date: string;
  status: "pending" | "delivered";
  createdAt: string;
}

export interface Delivery {
  id: string;
  deliveryNo: string;
  lpoId?: string;
  lpoNumber?: string;
  companyId: string;
  companyName: string;
  items: InvoiceItem[];
  date: string;
  status: "delivered";
  createdAt: string;
}
