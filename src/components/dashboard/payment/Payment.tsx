import { useEffect, useState } from 'react';
import {
  Search,
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Receipt,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Eye
} from 'lucide-react';

import { paymentStorage, type Payment as PaymentType } from '../../../utils/paymentStorage';
import { invoiceStorage, type Invoice } from '../../../utils/invoiceStorage';
import { paymentService } from '../../../utils/paymentService';
import { PaymentForm } from './PaymentForm';
import { PaymentDetails } from './PaymentDetails';
import { PaymentReceipt } from './PaymentReceipt';
import { InvoiceDetails } from '../invoice/InvoiceDetails';

export const Payment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [filterMethod, setFilterMethod] = useState<'all' | 'credit_card' | 'bank_transfer' | 'cash' | 'check' | 'online'>('all');
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [recentPayment, setRecentPayment] = useState<{ id: string; paymentNumber: string } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formDefaults, setFormDefaults] = useState<{ invoiceId?: string; invoiceNumber: string; clientName: string; suggestedAmount: number } | null>(null);
  const [formExisting, setFormExisting] = useState<PaymentType | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<PaymentType | null>(null);

  const mockPayments: PaymentType[] = [
    {
      id: '1',
      paymentNumber: 'PAY-2024-001',
      invoiceNumber: 'INV-2024-002',
      clientName: 'Sarah Johnson',
      amount: 325,
      paymentDate: '2024-01-18',
      method: 'credit_card',
      status: 'completed',
      reference: 'CC-1234-5678-9012',
      notes: 'Payment received for kitchen sink repair'
    },
    {
      id: '2',
      paymentNumber: 'PAY-2024-002',
      invoiceNumber: 'INV-2024-003',
      clientName: 'Mike Wilson',
      amount: 200,
      paymentDate: '2024-01-20',
      method: 'bank_transfer',
      status: 'pending',
      reference: 'BT-9876-5432-1098',
      notes: 'Bank transfer initiated, pending confirmation'
    },
    {
      id: '3',
      paymentNumber: 'PAY-2024-003',
      invoiceNumber: 'INV-2024-004',
      clientName: 'John Smith',
      amount: 150,
      paymentDate: '2024-01-19',
      method: 'cash',
      status: 'completed',
      reference: 'CASH-001',
      notes: 'Cash payment received during service visit'
    }
  ];

  useEffect(() => {
    const stored = paymentStorage.getPayments();
    if (!stored || stored.length === 0) {
      // seed once
      for (const p of mockPayments) paymentStorage.addPayment(p);
      setPayments(mockPayments);
    } else {
      setPayments(stored);
    }
    try {
      const id = sessionStorage.getItem('recent_payment_id');
      const num = sessionStorage.getItem('recent_payment_number');
      if (id && num) {
        setRecentPayment({ id, paymentNumber: num });
        sessionStorage.removeItem('recent_payment_id');
        sessionStorage.removeItem('recent_payment_number');
      }
      // No auto-open form; invoices create a pending payment record automatically
    } catch {}
  }, []);

  useEffect(() => {
    if (recentPayment) {
      const el = document.getElementById(`payment-${recentPayment.id}`);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    }
  }, [recentPayment]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'credit_card': return 'bg-blue-100 text-blue-800';
      case 'bank_transfer': return 'bg-green-100 text-green-800';
      case 'cash': return 'bg-gray-100 text-gray-800';
      case 'check': return 'bg-purple-100 text-purple-800';
      case 'online': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'refunded': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };


  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Credit Card';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      case 'check': return 'Check';
      case 'online': return 'Online';
      default: return method;
    }
  };

  const totalCompleted = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const openView = (p: PaymentType) => {
    setSelectedPayment(p);
    setShowDetails(true);
  };

  const openEdit = (p: PaymentType) => {
    setFormExisting(p);
    setFormDefaults(null);
    setShowForm(true);
  };

  // Removed openCreate - payments are auto-generated from invoices

  const handleDelete = async (p: PaymentType) => {
    const ok = window.confirm(`Delete ${p.paymentNumber}? This will also update the related invoice balance. This cannot be undone.`);
    if (!ok) return;
    
    const result = await paymentService.deletePayment(p.id);
    if (result.success) {
      setPayments(prev => prev.filter(x => x.id !== p.id));
    } else {
      window.alert(`Failed to delete payment: ${result.error}`);
    }
  };

  // Removed manual status update functions - payments auto-update from client payment links

  const openInvoice = (p: PaymentType) => {
    try {
      const all = invoiceStorage.getInvoices();
      const inv = all.find(i => i.invoiceNumber === p.invoiceNumber) || null;
      if (!inv) {
        window.alert(`Invoice ${p.invoiceNumber} not found.`);
        return;
      }
      setSelectedInvoice(inv);
      setShowInvoice(true);
    } catch (e) {
      console.error('Failed to load invoice', e);
      window.alert('Failed to load invoice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
          <p className="text-gray-600">Track and manage all payment transactions</p>
        </div>
        <div className="text-sm text-gray-500">
          Payments are automatically generated from invoices
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Received</p>
              <p className="text-2xl font-bold text-gray-900">${totalCompleted.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">${totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed' | 'failed' | 'refunded')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value as 'all' | 'credit_card' | 'bank_transfer' | 'cash' | 'check' | 'online')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Methods</option>
          <option value="credit_card">Credit Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
          <option value="check">Check</option>
          <option value="online">Online</option>
        </select>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <div
            key={payment.id}
            id={`payment-${payment.id}`}
            className={
              "bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow " +
              (recentPayment && recentPayment.id === payment.id ? "border-green-400 ring-2 ring-green-200" : "border-gray-200")
            }
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(payment.status)}`}>
                  {getStatusIcon(payment.status)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{payment.paymentNumber}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(payment.method)}`}>
                      {getMethodLabel(payment.method)}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {payment.paymentDate}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => openView(payment)} className="text-blue-600 hover:text-blue-900">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => openEdit(payment)} className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-green-600 hover:text-green-900">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(payment)} className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span><span className="font-medium">Client:</span> {payment.clientName}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Receipt className="w-4 h-4 mr-2 text-gray-400" />
                  <span><span className="font-medium">Invoice:</span> {payment.invoiceNumber}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                  <span><span className="font-medium">Reference:</span> {payment.reference}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  <span><span className="font-medium">Amount:</span> ${payment.amount.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Notes:</span> {payment.notes}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <button onClick={() => openView(payment)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Details
                  </button>
                  <button onClick={() => openInvoice(payment)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Invoice
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {payment.status === 'completed' && (
                    <button 
                      onClick={() => {
                        setReceiptPayment(payment);
                        setShowReceipt(true);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Send Receipt
                    </button>
                  )}
                  {(payment.status === 'pending' || payment.status === 'failed') && (
                    <div className="text-sm text-gray-500 italic">
                      Status updates automatically from client payment
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Modals - Only for editing existing payments */}
      {formExisting && (
        <PaymentForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={() => {
            // Refresh payments list after edit
            const updatedPayments = paymentStorage.getPayments();
            setPayments(updatedPayments);
          }}
          defaults={formDefaults}
          existing={formExisting}
        />
      )}
      <PaymentDetails
        isOpen={showDetails}
        payment={selectedPayment}
        onClose={() => setShowDetails(false)}
      />
      <InvoiceDetails
        isOpen={showInvoice}
        invoice={selectedInvoice}
        onClose={() => setShowInvoice(false)}
      />
      <PaymentReceipt
        isOpen={showReceipt}
        payment={receiptPayment}
        onClose={() => setShowReceipt(false)}
      />
    </div>
  );
}
;
