import React, { useEffect, useMemo, useState } from 'react';
import { X, Save, DollarSign, Calendar, CreditCard, User, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { PaymentMethod, Payment, PaymentStatus } from '../../../utils/paymentStorage';
import { validatePayment, getInvoicePaymentSummary } from '../../../utils/paymentValidation';
import { paymentService } from '../../../utils/paymentService';

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payment: Payment) => void;
  defaults: {
    invoiceId?: string;
    invoiceNumber: string;
    clientName: string;
    suggestedAmount: number;
  } | null;
  existing?: Payment | null;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ isOpen, onClose, onSubmit, defaults, existing }) => {
  const [amount, setAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0,10));
  const [method, setMethod] = useState<PaymentMethod>('credit_card');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('completed');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [invoiceSummary, setInvoiceSummary] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (existing) {
      setAmount(existing.amount);
      setPaymentDate(existing.paymentDate);
      setMethod(existing.method);
      setReference(existing.reference || '');
      setNotes(existing.notes || '');
      setStatus(existing.status);
      setInvoiceNumber(existing.invoiceNumber);
      setClientName(existing.clientName);
      setShowErrors(false);
      return;
    }
    if (defaults) {
      setAmount(defaults.suggestedAmount || 0);
      setPaymentDate(new Date().toISOString().slice(0,10));
      setMethod('credit_card');
      setReference('');
      setNotes('');
      setStatus('completed');
      setInvoiceNumber(defaults.invoiceNumber);
      setClientName(defaults.clientName);
      setShowErrors(false);
      return;
    }
    // Manual creation mode (no defaults, no existing)
    setAmount(0);
    setPaymentDate(new Date().toISOString().slice(0,10));
    setMethod('credit_card');
    setReference('');
    setNotes('');
    setStatus('completed');
    setInvoiceNumber('');
    setClientName('');
    setShowErrors(false);
  }, [isOpen, defaults, existing]);

  // Real-time validation
  useEffect(() => {
    if (!showErrors) return;
    
    const paymentData = {
      amount,
      paymentDate,
      method,
      status,
      invoiceNumber,
      clientName,
      reference,
      notes
    };
    
    const validation = validatePayment(paymentData, existing?.id);
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);
  }, [amount, paymentDate, method, status, invoiceNumber, clientName, reference, notes, showErrors, existing?.id]);

  // Load invoice summary when invoice number changes
  useEffect(() => {
    if (invoiceNumber.trim()) {
      const summary = getInvoicePaymentSummary(invoiceNumber);
      setInvoiceSummary(summary);
    } else {
      setInvoiceSummary(null);
    }
  }, [invoiceNumber]);

  const valid = useMemo(() => {
    return validationErrors.length === 0 && amount > 0 && invoiceNumber.trim() && clientName.trim();
  }, [validationErrors, amount, invoiceNumber, clientName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    setIsProcessing(true);
    
    const paymentData = {
      invoiceNumber,
      clientName,
      amount: Number(amount),
      paymentDate,
      method,
      status,
      reference,
      notes
    };
    
    try {
      let result;
      if (existing) {
        result = await paymentService.updatePayment(existing.id, paymentData);
      } else {
        result = await paymentService.processPayment({
          ...paymentData,
          invoiceId: defaults?.invoiceId
        });
      }
      
      if (result.success && result.payment) {
        onSubmit(result.payment);
        onClose();
      } else {
        setValidationErrors(result.errors);
        setValidationWarnings(result.warnings);
      }
    } catch (error) {
      setValidationErrors(['Failed to process payment. Please try again.']);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{existing ? 'Edit Payment' : 'Record Payment'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 mb-1">Please fix the following errors:</p>
                  <ul className="text-red-700 space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Validation Warnings */}
          {validationWarnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <Info className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">Please note:</p>
                  <ul className="text-yellow-700 space-y-1">
                    {validationWarnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Summary */}
          {invoiceSummary && invoiceSummary.paymentCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Invoice Payment History:</p>
                  <p>Total Paid: <span className="font-medium">${invoiceSummary.totalPaid.toLocaleString()}</span></p>
                  <p>Remaining: <span className="font-medium">${invoiceSummary.remainingBalance.toLocaleString()}</span></p>
                  <p>Previous Payments: <span className="font-medium">{invoiceSummary.paymentCount}</span></p>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Invoice Number *</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className={`w-full pl-9 pr-3 py-2 border rounded ${showErrors && !invoiceNumber ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {showErrors && !invoiceNumber && <p className="text-xs text-red-600 mt-1">Invoice number is required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={clientName} onChange={e => setClientName(e.target.value)} className={`w-full pl-9 pr-3 py-2 border rounded ${showErrors && !clientName ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              {showErrors && !clientName && <p className="text-xs text-red-600 mt-1">Client name is required</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount *</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="number" min={0} step={0.01} value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className={`w-full pl-9 pr-3 py-2 border rounded ${showErrors && amount <= 0 ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
            {showErrors && amount <= 0 && <p className="text-xs text-red-600 mt-1">Enter a valid amount</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className={`w-full pl-9 pr-3 py-2 border rounded ${showErrors && !paymentDate ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Method *</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} className="w-full pl-9 pr-3 py-2 border rounded border-gray-300">
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status *</label>
              <div className="relative">
                {status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-500 absolute left-3 top-1/2 -translate-y-1/2" /> : <AlertCircle className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />}
                <select value={status} onChange={e => setStatus(e.target.value as PaymentStatus)} className="w-full pl-9 pr-3 py-2 border rounded border-gray-300">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reference</label>
            <input value={reference} onChange={e => setReference(e.target.value)} className="w-full px-3 py-2 border rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded border-gray-300" />
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
            <button 
              type="submit" 
              disabled={!valid || isProcessing}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> 
              {isProcessing ? 'Processing...' : (existing ? 'Update Payment' : 'Save Payment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
