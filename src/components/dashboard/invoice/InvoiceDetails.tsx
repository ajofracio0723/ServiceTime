import React from 'react';
import { X, Calendar, DollarSign, CreditCard, User, MapPin, Receipt } from 'lucide-react';
import type { Invoice } from '../../../utils/invoiceStorage';

interface InvoiceDetailsProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ isOpen, invoice, onClose }) => {
  if (!isOpen || !invoice) return null;

  const statusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColor(invoice.status)}`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{invoice.invoiceNumber}</h2>
              <div className="text-sm text-gray-600">Status: <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusColor(invoice.status)}`}>{invoice.status}</span></div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700"><User className="w-4 h-4 mr-2 text-gray-400" /> <span><span className="font-medium">Client:</span> {invoice.clientName}</span></div>
              <div className="flex items-center text-sm text-gray-700"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> <span className="truncate">{invoice.propertyAddress}</span></div>
              {invoice.jobNumber && (
                <div className="text-sm text-gray-700"><span className="font-medium">Job:</span> {invoice.jobNumber}</div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> Issue: {invoice.issueDate}</div>
              <div className="flex items-center text-sm text-gray-700"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> Due: {invoice.dueDate}</div>
              <div className="flex items-center text-sm text-gray-700"><DollarSign className="w-4 h-4 mr-2 text-gray-400" /> Total: ${invoice.totalAmount.toLocaleString()}</div>
              <div className="flex items-center text-sm text-gray-700"><CreditCard className="w-4 h-4 mr-2 text-gray-400" /> Paid: ${invoice.paidAmount.toLocaleString()}</div>
              <div className="flex items-center text-sm text-gray-700"><CreditCard className="w-4 h-4 mr-2 text-gray-400" /> Balance: ${invoice.balance.toLocaleString()}</div>
            </div>
          </div>

          {invoice.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Description</h3>
              <p className="text-gray-700">{invoice.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Items</h3>
            <div className="border rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Description</th>
                    <th className="text-right px-3 py-2">Qty</th>
                    <th className="text-right px-3 py-2">Unit Price</th>
                    <th className="text-right px-3 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((it, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{it.description}</td>
                      <td className="px-3 py-2 text-right">{it.quantity}</td>
                      <td className="px-3 py-2 text-right">${it.unitPrice.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${it.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
