import React from 'react';
import { X, Send, User, DollarSign, Calendar } from 'lucide-react';
import type { Invoice as InvoiceType } from '../../../utils/invoiceStorage';

interface InvoiceSendConfirmProps {
  isOpen: boolean;
  invoice: InvoiceType | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const InvoiceSendConfirm: React.FC<InvoiceSendConfirmProps> = ({ isOpen, invoice, onCancel, onConfirm }) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Send Invoice</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-gray-700">You're about to send this invoice to the client.</p>
          <div className="bg-gray-50 rounded border p-3 space-y-2">
            <div className="text-sm"><span className="font-medium">Invoice:</span> {invoice.invoiceNumber}</div>
            <div className="flex items-center text-sm text-gray-700"><User className="w-4 h-4 mr-2 text-gray-400" /> {invoice.clientName}</div>
            <div className="flex items-center text-sm text-gray-700"><DollarSign className="w-4 h-4 mr-2 text-gray-400" /> Total ${invoice.totalAmount.toLocaleString()}</div>
            <div className="flex items-center text-sm text-gray-700"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> Due {invoice.dueDate}</div>
          </div>
          <p className="text-xs text-gray-500">You can still record payments after sending.</p>
        </div>
        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
