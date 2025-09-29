import type { Payment } from './paymentStorage';
import type { Invoice } from './invoiceStorage';
import { paymentStorage } from './paymentStorage';
import { invoiceStorage } from './invoiceStorage';
import { paymentValidator } from './paymentValidation';

export interface PaymentProcessingResult {
  success: boolean;
  payment?: Payment;
  updatedInvoice?: Invoice;
  errors: string[];
  warnings: string[];
}

export class PaymentService {
  
  /**
   * Process a new payment with full validation and invoice synchronization
   */
  async processPayment(paymentData: Partial<Payment>): Promise<PaymentProcessingResult> {
    // Validate the payment
    const validation = paymentValidator.validatePayment(paymentData);
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings
      };
    }

    try {
      // Create the payment record
      const payment = this.createPaymentRecord(paymentData);
      
      // Save payment
      paymentStorage.addPayment(payment);
      
      // Update related invoice if payment is completed
      let updatedInvoice: Invoice | undefined;
      if (payment.status === 'completed' && payment.invoiceNumber) {
        updatedInvoice = await this.updateInvoiceBalance(payment.invoiceNumber);
      }

      return {
        success: true,
        payment,
        updatedInvoice,
        errors: [],
        warnings: validation.warnings
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: validation.warnings
      };
    }
  }

  /**
   * Update an existing payment with validation and invoice sync
   */
  async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<PaymentProcessingResult> {
    const existingPayment = paymentStorage.getPayments().find(p => p.id === paymentId);
    
    if (!existingPayment) {
      return {
        success: false,
        errors: ['Payment not found'],
        warnings: []
      };
    }

    const updatedPaymentData = { ...existingPayment, ...updates };
    
    // Validate the updated payment
    const validation = paymentValidator.validatePayment(updatedPaymentData, paymentId);
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings
      };
    }

    try {
      const payment: Payment = {
        ...updatedPaymentData,
        updatedAt: new Date().toISOString()
      } as Payment;

      // Update payment
      paymentStorage.updatePayment(payment);
      
      // Update invoice balances for both old and new invoice if they changed
      let updatedInvoice: Invoice | undefined;
      
      if (existingPayment.invoiceNumber !== payment.invoiceNumber) {
        // Invoice changed - update both old and new
        if (existingPayment.invoiceNumber) {
          await this.updateInvoiceBalance(existingPayment.invoiceNumber);
        }
        if (payment.invoiceNumber) {
          updatedInvoice = await this.updateInvoiceBalance(payment.invoiceNumber);
        }
      } else if (payment.invoiceNumber) {
        // Same invoice - just update it
        updatedInvoice = await this.updateInvoiceBalance(payment.invoiceNumber);
      }

      return {
        success: true,
        payment,
        updatedInvoice,
        errors: [],
        warnings: validation.warnings
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to update payment: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: validation.warnings
      };
    }
  }

  /**
   * Delete a payment and update related invoice
   */
  async deletePayment(paymentId: string): Promise<{ success: boolean; error?: string; updatedInvoice?: Invoice }> {
    const payment = paymentStorage.getPayments().find(p => p.id === paymentId);
    
    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    try {
      // Delete the payment
      paymentStorage.deletePayment(paymentId);
      
      // Update related invoice balance
      let updatedInvoice: Invoice | undefined;
      if (payment.invoiceNumber) {
        updatedInvoice = await this.updateInvoiceBalance(payment.invoiceNumber);
      }

      return { success: true, updatedInvoice };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to delete payment: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Update invoice balance and status based on payments
   */
  private async updateInvoiceBalance(invoiceNumber: string): Promise<Invoice | undefined> {
    const invoice = invoiceStorage.getInvoices().find(inv => inv.invoiceNumber === invoiceNumber);
    
    if (!invoice) {
      return undefined;
    }

    // Calculate total payments for this invoice
    const payments = paymentStorage.getPayments()
      .filter(p => p.invoiceNumber === invoiceNumber && p.status === 'completed');
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = Math.max(0, invoice.totalAmount - totalPaid);
    
    // Determine new invoice status
    let newStatus = invoice.status;
    
    if (totalPaid >= invoice.totalAmount && balance === 0) {
      newStatus = 'paid';
    } else if (totalPaid > 0 && invoice.status === 'draft') {
      newStatus = 'sent'; // If there are payments, invoice must have been sent
    } else if (invoice.status === 'paid' && balance > 0) {
      // Payment was refunded or adjusted, revert to appropriate status
      const today = new Date();
      const dueDate = new Date(invoice.dueDate);
      newStatus = today > dueDate ? 'overdue' : 'sent';
    }

    const updatedInvoice: Invoice = {
      ...invoice,
      paidAmount: totalPaid,
      balance,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    invoiceStorage.updateInvoice(updatedInvoice);
    return updatedInvoice;
  }

  /**
   * Create a properly formatted payment record
   */
  private createPaymentRecord(paymentData: Partial<Payment>): Payment {
    const now = new Date().toISOString();
    const timestamp = Date.now();
    
    return {
      id: paymentData.id || `pay_${timestamp}`,
      paymentNumber: paymentData.paymentNumber || `PAY-${new Date().getFullYear()}-${timestamp}`,
      invoiceId: paymentData.invoiceId,
      invoiceNumber: paymentData.invoiceNumber || '',
      clientName: paymentData.clientName || '',
      amount: Number(paymentData.amount) || 0,
      paymentDate: paymentData.paymentDate || new Date().toISOString().slice(0, 10),
      method: paymentData.method || 'credit_card',
      status: paymentData.status || 'completed',
      reference: paymentData.reference || this.generateReference(paymentData.method || 'credit_card'),
      notes: paymentData.notes || '',
      createdAt: paymentData.createdAt || now,
      updatedAt: now
    };
  }

  /**
   * Generate a proper payment reference based on method
   */
  private generateReference(method: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    switch (method) {
      case 'credit_card':
        return `CC-${timestamp}-${random}`;
      case 'bank_transfer':
        return `BT-${timestamp}-${random}`;
      case 'check':
        return `CHK-${timestamp}-${random}`;
      case 'cash':
        return `CASH-${timestamp}`;
      case 'online':
        return `ON-${timestamp}-${random}`;
      default:
        return `PAY-${timestamp}-${random}`;
    }
  }

  /**
   * Get comprehensive payment history for an invoice
   */
  getInvoicePaymentHistory(invoiceNumber: string): {
    payments: Payment[];
    summary: {
      totalPaid: number;
      remainingBalance: number;
      paymentCount: number;
      lastPaymentDate?: string;
      averagePaymentAmount: number;
    };
  } {
    const payments = paymentStorage.getPayments()
      .filter(p => p.invoiceNumber === invoiceNumber)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const invoice = invoiceStorage.getInvoices().find(inv => inv.invoiceNumber === invoiceNumber);
    const remainingBalance = invoice ? Math.max(0, invoice.totalAmount - totalPaid) : 0;
    
    return {
      payments,
      summary: {
        totalPaid,
        remainingBalance,
        paymentCount: completedPayments.length,
        lastPaymentDate: completedPayments[0]?.paymentDate,
        averagePaymentAmount: completedPayments.length > 0 ? totalPaid / completedPayments.length : 0
      }
    };
  }

  /**
   * Get payment analytics and insights
   */
  getPaymentAnalytics(): {
    totalRevenue: number;
    pendingAmount: number;
    failedAmount: number;
    paymentsByMethod: Record<string, { count: number; amount: number }>;
    recentTrends: {
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
  } {
    const payments = paymentStorage.getPayments();
    const completed = payments.filter(p => p.status === 'completed');
    const pending = payments.filter(p => p.status === 'pending');
    const failed = payments.filter(p => p.status === 'failed');

    const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0);
    const failedAmount = failed.reduce((sum, p) => sum + p.amount, 0);

    // Group by payment method
    const paymentsByMethod: Record<string, { count: number; amount: number }> = {};
    completed.forEach(payment => {
      if (!paymentsByMethod[payment.method]) {
        paymentsByMethod[payment.method] = { count: 0, amount: 0 };
      }
      paymentsByMethod[payment.method].count++;
      paymentsByMethod[payment.method].amount += payment.amount;
    });

    // Calculate monthly trends
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthPayments = completed.filter(p => new Date(p.paymentDate) >= thisMonth);
    const lastMonthPayments = completed.filter(p => {
      const date = new Date(p.paymentDate);
      return date >= lastMonth && date < thisMonth;
    });

    const thisMonthAmount = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const lastMonthAmount = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const growth = lastMonthAmount > 0 ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0;

    return {
      totalRevenue,
      pendingAmount,
      failedAmount,
      paymentsByMethod,
      recentTrends: {
        thisMonth: thisMonthAmount,
        lastMonth: lastMonthAmount,
        growth
      }
    };
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
