export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  propertyAddress: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  description: string;
  items: InvoiceItem[];
  // Optional linkage
  jobId?: string;
  jobNumber?: string;
  estimateId?: string;
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'servicetime_invoices_v1';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('Failed to parse invoices from localStorage:', e);
    return fallback;
  }
}

function save(invoices: Invoice[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to save invoices to localStorage:', e);
  }
}

export const invoiceStorage = {
  getInvoices(): Invoice[] {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return safeParse<Invoice[]>(raw, []);
  },

  addInvoice(invoice: Invoice) {
    const all = this.getInvoices();
    all.push(invoice);
    save(all);
  },

  updateInvoice(updated: Invoice) {
    const all = this.getInvoices();
    const next = all.map((inv) => (inv.id === updated.id ? updated : inv));
    save(next);
  },

  deleteInvoice(id: string) {
    const all = this.getInvoices();
    const next = all.filter((inv) => inv.id !== id);
    save(next);
  },

  upsertMany(invoices: Invoice[]) {
    const byId = new Map(this.getInvoices().map((i) => [i.id, i] as const));
    for (const inv of invoices) {
      byId.set(inv.id, inv);
    }
    save(Array.from(byId.values()));
  },
};
