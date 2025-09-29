import type { Payment } from './paymentStorage';
import type { Invoice } from './invoiceStorage';
import { invoiceStorage } from './invoiceStorage';
import { paymentStorage } from './paymentStorage';

export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PaymentBusinessRules {
  allowOverpayment: boolean;
  allowPartialPayment: boolean;
  requireInvoiceMatch: boolean;
  maxPaymentAmount?: number;
}

const DEFAULT_RULES: PaymentBusinessRules = {
  allowOverpayment: false,
  allowPartialPayment: true,
  requireInvoiceMatch: true,
  maxPaymentAmount: 50000, // $50k max per payment
};

export class PaymentValidator {
  private rules: PaymentBusinessRules;

  constructor(rules: Partial<PaymentBusinessRules> = {}) {
    this.rules = { ...DEFAULT_RULES, ...rules };
  }

  validatePayment(payment: Partial<Payment>, existingPaymentId?: string): PaymentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic field validation
    if (!payment.amount || payment.amount <= 0) {
      errors.push('Payment amount must be greater than zero');
    }

    if (!payment.invoiceNumber?.trim()) {
      errors.push('Invoice number is required');
    }

    if (!payment.clientName?.trim()) {
      errors.push('Client name is required');
    }

    if (!payment.paymentDate) {
      errors.push('Payment date is required');
    }

    if (!payment.method) {
      errors.push('Payment method is required');
    }

    if (!payment.status) {
      errors.push('Payment status is required');
    }

    // Business rule validations
    if (payment.amount && this.rules.maxPaymentAmount && payment.amount > this.rules.maxPaymentAmount) {
      errors.push(`Payment amount cannot exceed $${this.rules.maxPaymentAmount.toLocaleString()}`);
    }

    // Invoice-specific validations
    if (payment.invoiceNumber) {
      const invoice = this.findInvoiceByNumber(payment.invoiceNumber);
      
      if (this.rules.requireInvoiceMatch && !invoice) {
        errors.push(`Invoice ${payment.invoiceNumber} not found`);
      } else if (invoice) {
        const validationResult = this.validateAgainstInvoice(payment, invoice, existingPaymentId);
        errors.push(...validationResult.errors);
        warnings.push(...validationResult.warnings);
      }
    }

    // Date validations
    if (payment.paymentDate) {
      const paymentDate = new Date(payment.paymentDate);
      const today = new Date();
      
      if (paymentDate > today) {
        warnings.push('Payment date is in the future');
      }

      // Check if payment date is too far in the past (more than 2 years)
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(today.getFullYear() - 2);
      
      if (paymentDate < twoYearsAgo) {
        warnings.push('Payment date is more than 2 years old');
      }
    }

    // Duplicate payment check
    if (payment.invoiceNumber && payment.amount) {
      const duplicateCheck = this.checkForDuplicatePayments(payment, existingPaymentId);
      if (duplicateCheck.isDuplicate) {
        warnings.push(duplicateCheck.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateAgainstInvoice(
    payment: Partial<Payment>, 
    invoice: Invoice, 
    existingPaymentId?: string
  ): PaymentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if invoice is in a payable state
    if (invoice.status === 'cancelled') {
      errors.push('Cannot record payment for cancelled invoice');
    }

    if (invoice.status === 'draft') {
      warnings.push('Recording payment for draft invoice - consider sending invoice first');
    }

    // Calculate existing payments for this invoice
    const existingPayments = this.getPaymentsForInvoice(invoice.invoiceNumber)
      .filter(p => p.id !== existingPaymentId && p.status === 'completed');
    
    const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = invoice.totalAmount - totalPaid;

    if (payment.amount) {
      // Check for overpayment
      if (payment.amount > remainingBalance) {
        if (!this.rules.allowOverpayment) {
          errors.push(`Payment amount ($${payment.amount.toLocaleString()}) exceeds remaining balance ($${remainingBalance.toLocaleString()})`);
        } else {
          warnings.push(`Payment exceeds remaining balance by $${(payment.amount - remainingBalance).toLocaleString()}`);
        }
      }

      // Check for partial payment
      if (payment.amount < remainingBalance && payment.amount < invoice.totalAmount) {
        if (!this.rules.allowPartialPayment) {
          errors.push('Partial payments are not allowed');
        } else {
          warnings.push(`Partial payment - $${(remainingBalance - payment.amount).toLocaleString()} will remain outstanding`);
        }
      }
    }

    // Validate client name matches
    if (payment.clientName && payment.clientName !== invoice.clientName) {
      warnings.push('Client name does not match invoice client');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  private findInvoiceByNumber(invoiceNumber: string): Invoice | null {
    try {
      const invoices = invoiceStorage.getInvoices();
      return invoices.find(inv => inv.invoiceNumber === invoiceNumber) || null;
    } catch {
      return null;
    }
  }

  private getPaymentsForInvoice(invoiceNumber: string): Payment[] {
    try {
      const payments = paymentStorage.getPayments();
      return payments.filter(p => p.invoiceNumber === invoiceNumber);
    } catch {
      return [];
    }
  }

  private checkForDuplicatePayments(
    payment: Partial<Payment>, 
    existingPaymentId?: string
  ): { isDuplicate: boolean; message: string } {
    try {
      const payments = paymentStorage.getPayments();
      const potentialDuplicates = payments.filter(p => 
        p.id !== existingPaymentId &&
        p.invoiceNumber === payment.invoiceNumber &&
        p.amount === payment.amount &&
        p.paymentDate === payment.paymentDate &&
        p.method === payment.method
      );

      if (potentialDuplicates.length > 0) {
        return {
          isDuplicate: true,
          message: `Similar payment already exists: ${potentialDuplicates[0].paymentNumber}`
        };
      }

      return { isDuplicate: false, message: '' };
    } catch {
      return { isDuplicate: false, message: '' };
    }
  }

  // Utility method to get payment summary for an invoice
  getInvoicePaymentSummary(invoiceNumber: string): {
    totalPaid: number;
    remainingBalance: number;
    paymentCount: number;
    lastPaymentDate?: string;
  } {
    const invoice = this.findInvoiceByNumber(invoiceNumber);
    const payments = this.getPaymentsForInvoice(invoiceNumber)
      .filter(p => p.status === 'completed');

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = invoice ? invoice.totalAmount - totalPaid : 0;
    const lastPayment = payments
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];

    return {
      totalPaid,
      remainingBalance,
      paymentCount: payments.length,
      lastPaymentDate: lastPayment?.paymentDate
    };
  }
}

// Export a default instance
export const paymentValidator = new PaymentValidator();

// Export utility functions
export const validatePayment = (payment: Partial<Payment>, existingPaymentId?: string) => 
  paymentValidator.validatePayment(payment, existingPaymentId);

export const getInvoicePaymentSummary = (invoiceNumber: string) => 
  paymentValidator.getInvoicePaymentSummary(invoiceNumber);
