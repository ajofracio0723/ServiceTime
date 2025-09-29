// Removed unused Payment import
import type { Invoice } from './invoiceStorage';
import { paymentValidator } from './paymentValidation';
import { paymentService } from './paymentService';
import { invoiceStorage } from './invoiceStorage';
import { paymentStorage } from './paymentStorage';

export interface TestScenario {
  name: string;
  description: string;
  setup: () => void;
  test: () => Promise<TestResult>;
  cleanup: () => void;
}

export interface TestResult {
  passed: boolean;
  message: string;
  details?: any;
}

export class PaymentTestRunner {
  private scenarios: TestScenario[] = [];

  constructor() {
    this.setupTestScenarios();
  }

  private setupTestScenarios() {
    this.scenarios = [
      {
        name: 'Payment Validation - Valid Payment',
        description: 'Test that valid payments pass validation',
        setup: () => this.setupMockInvoice(),
        test: async () => {
          const payment = {
            invoiceNumber: 'TEST-001',
            clientName: 'Test Client',
            amount: 100,
            paymentDate: '2024-01-15',
            method: 'credit_card' as any,
            status: 'completed' as any,
            reference: 'TEST-REF-001',
            notes: 'Test payment'
          };

          const validation = paymentValidator.validatePayment(payment);
          return {
            passed: validation.isValid && validation.errors.length === 0,
            message: validation.isValid ? 'Valid payment passed validation' : 'Valid payment failed validation',
            details: { errors: validation.errors, warnings: validation.warnings }
          };
        },
        cleanup: () => this.cleanupTestData()
      },

      {
        name: 'Payment Validation - Overpayment Detection',
        description: 'Test that overpayments are detected and handled',
        setup: () => this.setupMockInvoice(),
        test: async () => {
          const payment = {
            invoiceNumber: 'TEST-001',
            clientName: 'Test Client',
            amount: 1500, // More than invoice total of 1000
            paymentDate: '2024-01-15',
            method: 'credit_card' as any,
            status: 'completed' as any,
            reference: 'TEST-REF-002',
            notes: 'Overpayment test'
          };

          const validation = paymentValidator.validatePayment(payment);
          const hasOverpaymentError = validation.errors.some(error => 
            error.includes('exceeds remaining balance')
          );

          return {
            passed: !validation.isValid && hasOverpaymentError,
            message: hasOverpaymentError ? 'Overpayment correctly detected' : 'Overpayment not detected',
            details: { errors: validation.errors, warnings: validation.warnings }
          };
        },
        cleanup: () => this.cleanupTestData()
      },

      {
        name: 'Invoice-Payment Sync - Balance Update',
        description: 'Test that invoice balances update when payments are processed',
        setup: () => this.setupMockInvoice(),
        test: async () => {
          const initialInvoice = invoiceStorage.getInvoices().find(inv => inv.invoiceNumber === 'TEST-001');
          if (!initialInvoice) {
            return { passed: false, message: 'Test invoice not found' };
          }

          const initialBalance = initialInvoice.balance;
          const paymentAmount = 300;

          const result = await paymentService.processPayment({
            invoiceNumber: 'TEST-001',
            clientName: 'Test Client',
            amount: paymentAmount,
            paymentDate: '2024-01-15',
            method: 'credit_card' as any,
            status: 'completed' as any,
            reference: 'TEST-REF-003',
            notes: 'Balance update test'
          });

          if (!result.success) {
            return { passed: false, message: 'Payment processing failed', details: result.errors };
          }

          const updatedInvoice = invoiceStorage.getInvoices().find(inv => inv.invoiceNumber === 'TEST-001');
          const expectedBalance = initialBalance - paymentAmount;
          const balanceUpdated = updatedInvoice && updatedInvoice.balance === expectedBalance;

          return {
            passed: !!balanceUpdated,
            message: balanceUpdated ? 'Invoice balance updated correctly' : 'Invoice balance not updated',
            details: {
              initialBalance,
              paymentAmount,
              expectedBalance,
              actualBalance: updatedInvoice?.balance
            }
          };
        },
        cleanup: () => this.cleanupTestData()
      },

      {
        name: 'Partial Payment Support',
        description: 'Test that partial payments are handled correctly',
        setup: () => this.setupMockInvoice(),
        test: async () => {
          const invoice = invoiceStorage.getInvoices().find(inv => inv.invoiceNumber === 'TEST-001');
          if (!invoice) {
            return { passed: false, message: 'Test invoice not found' };
          }

          const partialAmount = invoice.totalAmount / 2;

          const result = await paymentService.processPayment({
            invoiceNumber: 'TEST-001',
            clientName: 'Test Client',
            amount: partialAmount,
            paymentDate: '2024-01-15',
            method: 'credit_card' as any,
            status: 'completed' as any,
            reference: 'TEST-REF-004',
            notes: 'Partial payment test'
          });

          if (!result.success) {
            return { passed: false, message: 'Partial payment processing failed', details: result.errors };
          }

          const updatedInvoice = invoiceStorage.getInvoices().find(inv => inv.invoiceNumber === 'TEST-001');
          const remainingBalance = invoice.totalAmount - partialAmount;
          const correctBalance = updatedInvoice && updatedInvoice.balance === remainingBalance;
          const stillSentStatus = updatedInvoice && updatedInvoice.status === 'sent'; // Should not be 'paid' yet

          return {
            passed: !!(correctBalance && stillSentStatus),
            message: correctBalance && stillSentStatus ? 'Partial payment handled correctly' : 'Partial payment handling failed',
            details: {
              originalAmount: invoice.totalAmount,
              partialAmount,
              remainingBalance,
              actualBalance: updatedInvoice?.balance,
              invoiceStatus: updatedInvoice?.status
            }
          };
        },
        cleanup: () => this.cleanupTestData()
      },

      {
        name: 'Full Payment - Status Change',
        description: 'Test that invoice status changes to paid when fully paid',
        setup: () => this.setupMockInvoice(),
        test: async () => {
          const invoice = invoiceStorage.getInvoices().find(inv => inv.invoiceNumber === 'TEST-001');
          if (!invoice) {
            return { passed: false, message: 'Test invoice not found' };
          }

          const result = await paymentService.processPayment({
            invoiceNumber: 'TEST-001',
            clientName: 'Test Client',
            amount: invoice.totalAmount,
            paymentDate: '2024-01-15',
            method: 'credit_card' as any,
            status: 'completed' as any,
            reference: 'TEST-REF-005',
            notes: 'Full payment test'
          });

          if (!result.success) {
            return { passed: false, message: 'Full payment processing failed', details: result.errors };
          }

          const updatedInvoice = invoiceStorage.getInvoices().find(inv => inv.invoiceNumber === 'TEST-001');
          const isPaid = updatedInvoice && updatedInvoice.status === 'paid';
          const zeroBalance = updatedInvoice && updatedInvoice.balance === 0;

          return {
            passed: !!(isPaid && zeroBalance),
            message: isPaid && zeroBalance ? 'Invoice marked as paid correctly' : 'Invoice status not updated to paid',
            details: {
              invoiceStatus: updatedInvoice?.status,
              balance: updatedInvoice?.balance,
              paidAmount: updatedInvoice?.paidAmount
            }
          };
        },
        cleanup: () => this.cleanupTestData()
      },

      {
        name: 'Duplicate Payment Detection',
        description: 'Test that duplicate payments are detected',
        setup: () => {
          this.setupMockInvoice();
          // Add an existing payment
          paymentStorage.addPayment({
            id: 'existing-payment',
            paymentNumber: 'PAY-EXISTING-001',
            invoiceNumber: 'TEST-001',
            clientName: 'Test Client',
            amount: 200,
            paymentDate: '2024-01-15',
            method: 'credit_card',
            status: 'completed',
            reference: 'EXISTING-REF',
            notes: 'Existing payment',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        },
        test: async () => {
          const duplicatePayment = {
            invoiceNumber: 'TEST-001',
            clientName: 'Test Client',
            amount: 200, // Same amount
            paymentDate: '2024-01-15', // Same date
            method: 'credit_card' as any, // Same method
            status: 'completed' as any,
            reference: 'DUPLICATE-REF',
            notes: 'Duplicate payment test'
          };

          const validation = paymentValidator.validatePayment(duplicatePayment);
          const hasDuplicateWarning = validation.warnings.some(warning => 
            warning.includes('Similar payment already exists')
          );

          return {
            passed: hasDuplicateWarning,
            message: hasDuplicateWarning ? 'Duplicate payment detected' : 'Duplicate payment not detected',
            details: { warnings: validation.warnings }
          };
        },
        cleanup: () => this.cleanupTestData()
      }
    ];
  }

  private setupMockInvoice() {
    const mockInvoice: Invoice = {
      id: 'test-invoice-001',
      invoiceNumber: 'TEST-001',
      clientName: 'Test Client',
      propertyAddress: '123 Test St, Test City, TC 12345',
      issueDate: '2024-01-01',
      dueDate: '2024-02-01',
      status: 'sent',
      totalAmount: 1000,
      paidAmount: 0,
      balance: 1000,
      description: 'Test invoice for payment validation',
      items: [
        {
          description: 'Test Service',
          quantity: 1,
          unitPrice: 1000,
          total: 1000
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    invoiceStorage.addInvoice(mockInvoice);
  }

  private cleanupTestData() {
    // Remove test invoices
    const invoices = invoiceStorage.getInvoices();
    invoices.forEach(invoice => {
      if (invoice.invoiceNumber.startsWith('TEST-')) {
        invoiceStorage.deleteInvoice(invoice.id);
      }
    });

    // Remove test payments
    const payments = paymentStorage.getPayments();
    payments.forEach(payment => {
      if (payment.invoiceNumber.startsWith('TEST-') || payment.reference.includes('TEST-REF')) {
        paymentStorage.deletePayment(payment.id);
      }
    });
  }

  async runAllTests(): Promise<{ passed: number; failed: number; results: Array<TestResult & { name: string }> }> {
    const results: Array<TestResult & { name: string }> = [];
    let passed = 0;
    let failed = 0;

    for (const scenario of this.scenarios) {
      try {
        scenario.setup();
        const result = await scenario.test();
        scenario.cleanup();

        results.push({ ...result, name: scenario.name });
        
        if (result.passed) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        scenario.cleanup();
        results.push({
          name: scenario.name,
          passed: false,
          message: `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
        failed++;
      }
    }

    return { passed, failed, results };
  }

  async runTest(testName: string): Promise<TestResult & { name: string } | null> {
    const scenario = this.scenarios.find(s => s.name === testName);
    if (!scenario) {
      return null;
    }

    try {
      scenario.setup();
      const result = await scenario.test();
      scenario.cleanup();
      return { ...result, name: scenario.name };
    } catch (error) {
      scenario.cleanup();
      return {
        name: scenario.name,
        passed: false,
        message: `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  getTestNames(): string[] {
    return this.scenarios.map(s => s.name);
  }
}

// Export singleton instance
export const paymentTestRunner = new PaymentTestRunner();
