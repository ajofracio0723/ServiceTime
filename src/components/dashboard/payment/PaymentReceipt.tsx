import React from 'react';
import { X, Download, Send, CheckCircle } from 'lucide-react';
import type { Payment } from '../../../utils/paymentStorage';
import { invoiceStorage } from '../../../utils/invoiceStorage';
import { fileStorage } from '../../../utils/fileStorage';

interface PaymentReceiptProps {
  isOpen: boolean;
  payment: Payment | null;
  onClose: () => void;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ isOpen, payment, onClose }) => {
  if (!isOpen || !payment) return null;

  const invoice = payment.invoiceNumber 
    ? invoiceStorage.getInvoices().find(inv => inv.invoiceNumber === payment.invoiceNumber)
    : null;

  const handleDownload = () => {
    const receiptHtml = generateReceiptHtml(payment, invoice);
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(receiptHtml);
    w.document.close();
    w.onload = () => {
      try { w.focus(); w.print(); } catch {}
    };
  };

  const handleSendReceipt = () => {
    // In a real app, this would send via email/SMS
    window.alert(`Receipt for ${payment.paymentNumber} would be sent to client via email/SMS`);
  };

  const handleSaveToFiles = async () => {
    try {
      const receiptHtml = generateReceiptHtml(payment, invoice);
      const blob = new Blob([receiptHtml], { type: 'text/html' });
      const filename = `RECEIPT-${payment.paymentNumber}.html`;
      await fileStorage.createFromBlob(blob, {
        category: 'document',
        originalName: filename,
        relatedEntityType: 'invoice',
        relatedEntityId: (invoice && invoice.id) || (payment as any).invoiceId || '',
        tags: ['receipt', payment.paymentNumber, payment.invoiceNumber || ''],
        isPublic: false,
      });
      window.alert('Receipt saved to Files');
    } catch (e) {
      console.error('Failed to save receipt to Files', e);
      window.alert('Failed to save receipt');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Payment Receipt</h3>
              <p className="text-sm text-gray-600">{payment.paymentNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Receipt Preview */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">ServiceTime</h2>
              <p className="text-gray-600">Payment Receipt</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Receipt #:</span> {payment.paymentNumber}</p>
                  <p><span className="font-medium">Date:</span> {payment.paymentDate}</p>
                  <p><span className="font-medium">Method:</span> {getMethodLabel(payment.method)}</p>
                  <p><span className="font-medium">Reference:</span> {payment.reference}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Client Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Client:</span> {payment.clientName}</p>
                  {invoice && (
                    <p><span className="font-medium">Property:</span> {invoice.propertyAddress}</p>
                  )}
                  <p><span className="font-medium">Invoice:</span> {payment.invoiceNumber}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Payment Amount:</span>
                <span className="text-xl font-bold">${payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                  {payment.status.toUpperCase()}
                </span>
              </div>
            </div>

            {payment.notes && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-700">{payment.notes}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 mt-4 text-center text-xs text-gray-500">
              <p>Thank you for your business!</p>
              <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={handleSaveToFiles}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            >
              Save to Files
            </button>
            <button
              onClick={handleSendReceipt}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Receipt
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function getMethodLabel(method: string): string {
  switch (method) {
    case 'credit_card': return 'Credit Card';
    case 'bank_transfer': return 'Bank Transfer';
    case 'cash': return 'Cash';
    case 'check': return 'Check';
    case 'online': return 'Online Payment';
    default: return method;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'refunded': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function generateReceiptHtml(payment: Payment, invoice: any): string {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Receipt ${payment.paymentNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; }
          .brand { font-size: 28px; font-weight: bold; color: #0ea5e9; margin-bottom: 5px; }
          .subtitle { color: #666; font-size: 16px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #333; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
          .detail-label { font-weight: 500; }
          .amount { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .status-completed { background: #dcfce7; color: #166534; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">ServiceTime</div>
            <div class="subtitle">Payment Receipt</div>
          </div>
          
          <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="detail-row">
              <span class="detail-label">Receipt Number:</span>
              <span>${payment.paymentNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Date:</span>
              <span>${payment.paymentDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span>${getMethodLabel(payment.method)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Reference:</span>
              <span>${payment.reference}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Client Information</div>
            <div class="detail-row">
              <span class="detail-label">Client Name:</span>
              <span>${payment.clientName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Invoice Number:</span>
              <span>${payment.invoiceNumber}</span>
            </div>
            ${invoice ? `
            <div class="detail-row">
              <span class="detail-label">Property:</span>
              <span>${invoice.propertyAddress}</span>
            </div>
            ` : ''}
          </div>

          <div class="amount">
            Payment Amount: $${payment.amount.toLocaleString()}
            <br>
            <span class="status status-${payment.status}">${payment.status.toUpperCase()}</span>
          </div>

          ${payment.notes ? `
          <div class="section">
            <div class="section-title">Notes</div>
            <p>${payment.notes}</p>
          </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
