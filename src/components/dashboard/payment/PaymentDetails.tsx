import React from 'react';
import { X, Calendar, DollarSign, CreditCard, User, Receipt, FileText } from 'lucide-react';
import type { Payment } from '../../../utils/paymentStorage';

interface PaymentDetailsProps {
  isOpen: boolean;
  payment: Payment | null;
  onClose: () => void;
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ isOpen, payment, onClose }) => {
  if (!isOpen || !payment) return null;

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const methodLabel = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Credit Card';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      case 'check': return 'Check';
      case 'online': return 'Online';
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColor(payment.status)}`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{payment.paymentNumber}</h3>
              <div className="text-sm text-gray-600">Status: <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusColor(payment.status)}`}>{payment.status}</span></div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700"><User className="w-4 h-4 mr-2 text-gray-400" /> <span><span className="font-medium">Client:</span> {payment.clientName}</span></div>
              <div className="flex items-center text-sm text-gray-700"><FileText className="w-4 h-4 mr-2 text-gray-400" /> <span><span className="font-medium">Invoice:</span> {payment.invoiceNumber}</span></div>
              {payment.reference && (
                <div className="flex items-center text-sm text-gray-700"><CreditCard className="w-4 h-4 mr-2 text-gray-400" /> <span><span className="font-medium">Reference:</span> {payment.reference}</span></div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700"><DollarSign className="w-4 h-4 mr-2 text-gray-400" /> <span><span className="font-medium">Amount:</span> ${payment.amount.toLocaleString()}</span></div>
              <div className="flex items-center text-sm text-gray-700"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> <span><span className="font-medium">Date:</span> {payment.paymentDate}</span></div>
              <div className="text-sm text-gray-700"><span className="font-medium">Method:</span> {methodLabel(payment.method)}</div>
            </div>
          </div>

          {payment.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{payment.notes}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-500">
            {payment.createdAt && <div><span className="font-medium">Created:</span> {payment.createdAt}</div>}
            {payment.updatedAt && <div><span className="font-medium">Updated:</span> {payment.updatedAt}</div>}
            <div><span className="font-medium">Payment ID:</span> {payment.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
