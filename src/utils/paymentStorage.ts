export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash' | 'check' | 'online';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId?: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'servicetime_payments_v1';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function save(payments: Payment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  } catch (e) {
    console.error('Failed to save payments to localStorage:', e);
  }
}

export const paymentStorage = {
  getPayments(): Payment[] {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return safeParse<Payment[]>(raw, []);
  },
  addPayment(p: Payment) {
    const all = this.getPayments();
    all.push(p);
    save(all);
  },
  updatePayment(p: Payment) {
    const all = this.getPayments();
    const next = all.map(x => x.id === p.id ? p : x);
    save(next);
  },
  deletePayment(id: string) {
    const all = this.getPayments();
    const next = all.filter(x => x.id !== id);
    save(next);
  },
};
