import { useEffect, useState } from "react";
import { invoiceStorage } from "../../../utils/invoiceStorage";
import { fileStorage } from "../../../utils/fileStorage";
import type { Invoice as InvoiceType } from "../../../utils/invoiceStorage";
import { InvoiceForm } from "./InvoiceForm";
import { InvoiceDetails } from "./InvoiceDetails";
import { InvoiceSendConfirm } from "./InvoiceSendConfirm";
import { paymentService } from "../../../utils/paymentService";
import { getInvoicePaymentSummary } from "../../../utils/paymentValidation";
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Send,
  CreditCard,
} from "lucide-react";

interface InvoiceProps {
  onNavigate?: (section: string) => void;
}

export const Invoice: React.FC<InvoiceProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "draft" | "sent" | "paid" | "overdue" | "cancelled"
  >("all");
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [recentInvoice, setRecentInvoice] = useState<{ id: string; invoiceNumber: string } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceType | null>(null);
  const [sentInvoice, setSentInvoice] = useState<{ id: string; invoiceNumber: string } | null>(null);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sendConfirmInvoice, setSendConfirmInvoice] = useState<InvoiceType | null>(null);
  // Payments are handled in the Payment module, no payment modal here

  const mockInvoices: InvoiceType[] = [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      clientName: "John Smith",
      propertyAddress: "123 Main St, Anytown, ST 12345",
      issueDate: "2024-01-15",
      dueDate: "2024-02-15",
      status: "sent",
      totalAmount: 450,
      paidAmount: 0,
      balance: 450,
      description: "HVAC system maintenance and filter replacement",
      items: [
        {
          description: "HVAC Maintenance",
          quantity: 1,
          unitPrice: 150,
          total: 150,
        },
        {
          description: "Air Filter Replacement",
          quantity: 2,
          unitPrice: 25,
          total: 50,
        },
        {
          description: "System Inspection",
          quantity: 1,
          unitPrice: 100,
          total: 100,
        },
        {
          description: "Labor (2 hours)",
          quantity: 2,
          unitPrice: 75,
          total: 150,
        },
      ],
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      clientName: "Sarah Johnson",
      propertyAddress: "456 Oak Ave, Somewhere, ST 67890",
      issueDate: "2024-01-16",
      dueDate: "2024-02-16",
      status: "paid",
      totalAmount: 325,
      paidAmount: 325,
      balance: 0,
      description: "Kitchen sink repair and faucet replacement",
      items: [
        {
          description: "Kitchen Faucet",
          quantity: 1,
          unitPrice: 125,
          total: 125,
        },
        {
          description: "Plumbing Repair",
          quantity: 1,
          unitPrice: 100,
          total: 100,
        },
        {
          description: "Labor (2 hours)",
          quantity: 2,
          unitPrice: 50,
          total: 100,
        },
      ],
    },
    {
      id: "3",
      invoiceNumber: "INV-2024-003",
      clientName: "Mike Wilson",
      propertyAddress: "789 Pine Rd, Elsewhere, ST 11111",
      issueDate: "2024-01-10",
      dueDate: "2024-02-10",
      status: "overdue",
      totalAmount: 200,
      paidAmount: 0,
      balance: 200,
      description: "Electrical safety inspection",
      items: [
        {
          description: "Electrical Inspection",
          quantity: 1,
          unitPrice: 100,
          total: 100,
        },
        { description: "Safety Report", quantity: 1, unitPrice: 50, total: 50 },
        {
          description: "Labor (1 hour)",
          quantity: 1,
          unitPrice: 50,
          total: 50,
        },
      ],
    },
  ];

  useEffect(() => {
    const stored = invoiceStorage.getInvoices();
    if (!stored || stored.length === 0) {
      // seed once
      invoiceStorage.upsertMany(mockInvoices as any);
      setInvoices(mockInvoices);
    } else {
      setInvoices(stored);
    }
    // Pickup recent invoice info from sessionStorage if present
    try {
      const id = sessionStorage.getItem('recent_invoice_id');
      const num = sessionStorage.getItem('recent_invoice_number');
      if (id && num) {
        setRecentInvoice({ id, invoiceNumber: num });
        sessionStorage.removeItem('recent_invoice_id');
        sessionStorage.removeItem('recent_invoice_number');
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (recentInvoice) {
      // Auto-scroll to the newly created invoice card
      const el = document.getElementById(`invoice-${recentInvoice.id}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    }
  }, [recentInvoice]);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Receipt className="w-4 h-4" />;
      case "sent":
        return <Send className="w-4 h-4" />;
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const buildInvoiceHtml = (invoice: InvoiceType) => {
    const itemsRows = invoice.items.map((it) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${it.description}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${it.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${it.unitPrice.toLocaleString()}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${it.total.toLocaleString()}</td>
      </tr>
    `).join("");

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${invoice.invoiceNumber} - Invoice</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #111; }
            .container { max-width: 800px; margin: 24px auto; padding: 0 16px; }
            .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 24px; }
            .brand { font-size: 20px; font-weight: 700; }
            .muted { color: #555; }
            .badge { display:inline-block; padding: 4px 8px; border-radius: 999px; font-size: 12px; border: 1px solid #ddd; }
            table { width: 100%; border-collapse: collapse; }
            .totals { margin-top: 12px; text-align: right; }
            .totals div { margin-top: 4px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <div class="brand">ServiceTime</div>
                <div class="muted">Invoices</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:18px;font-weight:700;">${invoice.invoiceNumber}</div>
                <div class="badge">${invoice.status.toUpperCase()}</div>
              </div>
            </div>
            <div style="display:flex; gap:24px; flex-wrap:wrap; margin-bottom:16px;">
              <div style="flex:1; min-width:240px;">
                <div><strong>Bill To</strong></div>
                <div>${invoice.clientName}</div>
                <div class="muted">${invoice.propertyAddress}</div>
              </div>
              <div style="flex:1; min-width:240px;">
                <div><strong>Dates</strong></div>
                <div>Issued: ${invoice.issueDate}</div>
                <div>Due: ${invoice.dueDate}</div>
              </div>
            </div>
            ${invoice.description ? `<div style="margin:12px 0;">${invoice.description}</div>` : ''}
            <table>
              <thead>
                <tr>
                  <th style="text-align:left; padding:8px; border-bottom:2px solid #111;">Description</th>
                  <th style="text-align:right; padding:8px; border-bottom:2px solid #111;">Qty</th>
                  <th style="text-align:right; padding:8px; border-bottom:2px solid #111;">Unit Price</th>
                  <th style="text-align:right; padding:8px; border-bottom:2px solid #111;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
            <div class="totals">
              <div><strong>Total:</strong> $${invoice.totalAmount.toLocaleString()}</div>
              <div><strong>Paid:</strong> $${invoice.paidAmount.toLocaleString()}</div>
              <div><strong>Balance:</strong> $${invoice.balance.toLocaleString()}</div>
            </div>
            <div class="no-print" style="margin-top:24px; text-align:right;">
              <button onclick="window.print()" style="padding:8px 12px; border:1px solid #ddd; border-radius:6px; background:#0ea5e9; color:#fff;">Print / Save as PDF</button>
            </div>
          </div>
        </body>
      </html>
    `;
    return html;
  };

  const handleDownload = (invoice: InvoiceType) => {
    const html = buildInvoiceHtml(invoice);
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    // Give it a moment to render, then trigger print (user can save as PDF)
    w.onload = () => {
      try { w.focus(); w.print(); } catch {}
    };
  };

  const handleSaveToFiles = async (invoice: InvoiceType) => {
    try {
      const html = buildInvoiceHtml(invoice);
      const blob = new Blob([html], { type: 'text/html' });
      const filename = `${invoice.invoiceNumber}.html`;
      await fileStorage.createFromBlob(blob, {
        category: 'document',
        originalName: filename,
        relatedEntityType: 'invoice',
        relatedEntityId: invoice.id,
        tags: ['invoice', invoice.invoiceNumber],
        isPublic: false,
      });
      window.alert('Invoice saved to Files');
    } catch (e) {
      console.error('Failed to save invoice to Files', e);
      window.alert('Failed to save');
    }
  };

  return (
    <div className="space-y-6">
      {recentInvoice && (
        <div className="border border-blue-200 bg-blue-50 text-blue-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>
              Invoice <span className="font-semibold">{recentInvoice.invoiceNumber}</span> was created from a completed job.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
              onClick={() => {
                const el = document.getElementById(`invoice-${recentInvoice.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              View
            </button>
            <button
              className="px-3 py-1 rounded text-blue-700 hover:bg-blue-100 text-sm"
              onClick={() => setRecentInvoice(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {sentInvoice && (
        <div className="border border-green-200 bg-green-50 text-green-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>
              Invoice <span className="font-semibold">{sentInvoice.invoiceNumber}</span> has been sent.
            </span>
          </div>
          <button
            className="px-3 py-1 rounded text-green-700 hover:bg-green-100 text-sm"
            onClick={() => setSentInvoice(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-600">
            Manage your invoices and track payments
          </p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          onClick={() => {
            setEditingInvoice(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(
              e.target.value as
                | "all"
                | "draft"
                | "sent"
                | "paid"
                | "overdue"
                | "cancelled"
            )
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <div
            key={invoice.id}
            id={`invoice-${invoice.id}`}
            className={
              "bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow " +
              (recentInvoice && recentInvoice.id === invoice.id
                ? "border-blue-400 ring-2 ring-blue-200"
                : "border-gray-200")
            }
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {getStatusIcon(invoice.status)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {invoice.invoiceNumber}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Issued: {invoice.issueDate}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Due: {invoice.dueDate}
                    </span>
                    {invoice.status === "sent" && (
                      <span className="text-orange-600 font-medium">
                        Due in {getDaysUntilDue(invoice.dueDate)} days
                      </span>
                    )}
                    {invoice.status === "overdue" && (
                      <span className="text-red-600 font-medium">
                        {Math.abs(getDaysUntilDue(invoice.dueDate))} days
                        overdue
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="text-blue-600 hover:text-blue-900"
                  title="Edit"
                  onClick={() => {
                    setEditingInvoice(invoice);
                    setIsFormOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  className="text-green-600 hover:text-green-900"
                  title="Download / Print"
                  onClick={() => handleDownload(invoice)}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  className="text-gray-700 hover:text-gray-900"
                  title="Save to Files"
                  onClick={() => handleSaveToFiles(invoice)}
                >
                  Save to Files
                </button>
                <button
                  className="text-red-600 hover:text-red-900"
                  title="Delete"
                  onClick={() => {
                    const ok = window.confirm('Delete this invoice?');
                    if (!ok) return;
                    invoiceStorage.deleteInvoice(invoice.id);
                    setInvoices(invoiceStorage.getInvoices());
                  }}
                >
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
                  <span>
                    <span className="font-medium">Client:</span>{" "}
                    {invoice.clientName}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">{invoice.propertyAddress}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Description:</span>{" "}
                  {invoice.description}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <span className="font-medium">Total Amount:</span> $
                    {invoice.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <span className="font-medium">Paid:</span> $
                    {invoice.paidAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    <span className="font-medium">Balance:</span> $
                    {invoice.balance.toLocaleString()}
                  </span>
                </div>
                {(() => {
                  const paymentSummary = getInvoicePaymentSummary(invoice.invoiceNumber);
                  return paymentSummary.paymentCount > 0 && (
                    <div className="text-xs text-blue-600">
                      {paymentSummary.paymentCount} payment{paymentSummary.paymentCount > 1 ? 's' : ''} 
                      {paymentSummary.lastPaymentDate && ` • Last: ${paymentSummary.lastPaymentDate}`}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Invoice Items */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Invoice Items
              </h4>
              <div className="space-y-2">
                {invoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{item.description}</span>
                      <span className="text-gray-500 ml-2">
                        x{item.quantity}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      ${item.unitPrice.toLocaleString()} × {item.quantity} = $
                      {item.total.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    onClick={() => {
                      setViewingInvoice(invoice);
                      setIsDetailsOpen(true);
                    }}
                  >
                    View Details
                  </button>
                  <button
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    onClick={() => {
                      setEditingInvoice(invoice);
                      setIsFormOpen(true);
                    }}
                  >
                    Edit Invoice
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {invoice.status === "draft" && (
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                      onClick={() => {
                        setSendConfirmInvoice(invoice);
                        setSendConfirmOpen(true);
                      }}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Send Invoice
                    </button>
                  )}
                  {/* Record Payment action removed; handled in Payments module */}
                  {invoice.status === "overdue" && (
                    <button className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700">
                      Send Reminder
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No invoices found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Invoice Form Modal */}
      <InvoiceForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingInvoice(null); }}
        editingInvoice={editingInvoice}
        onSubmit={(inv) => {
          const exists = invoiceStorage.getInvoices().some(i => i.id === inv.id);
          if (exists) {
            invoiceStorage.updateInvoice(inv);
          } else {
            invoiceStorage.addInvoice(inv);
          }
          const next = invoiceStorage.getInvoices();
          setInvoices(next);
          try {
            sessionStorage.setItem('recent_invoice_id', inv.id);
            sessionStorage.setItem('recent_invoice_number', inv.invoiceNumber);
            setRecentInvoice({ id: inv.id, invoiceNumber: inv.invoiceNumber });
          } catch {}
        }}
      />
      {/* Invoice Details Modal */}
      <InvoiceDetails
        isOpen={isDetailsOpen}
        invoice={viewingInvoice}
        onClose={() => { setIsDetailsOpen(false); setViewingInvoice(null); }}
      />

      {/* Send Confirmation Modal */}
      <InvoiceSendConfirm
        isOpen={sendConfirmOpen}
        invoice={sendConfirmInvoice}
        onCancel={() => { setSendConfirmOpen(false); setSendConfirmInvoice(null); }}
        onConfirm={async () => {
          if (!sendConfirmInvoice) return;
          const updated: InvoiceType = { ...sendConfirmInvoice, status: 'sent' };
          invoiceStorage.updateInvoice(updated);
          setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
          setSentInvoice({ id: updated.id, invoiceNumber: updated.invoiceNumber });
          setSendConfirmOpen(false);
          setSendConfirmInvoice(null);
          // Auto-create a pending payment record using PaymentService
          const paymentResult = await paymentService.processPayment({
            invoiceId: updated.id,
            invoiceNumber: updated.invoiceNumber,
            clientName: updated.clientName,
            amount: updated.balance,
            paymentDate: new Date().toISOString().slice(0,10),
            method: 'online' as any,
            status: 'pending' as any,
            notes: 'Auto-generated from sent invoice'
          });
          
          if (paymentResult.success && paymentResult.payment) {
            try {
              sessionStorage.setItem('recent_payment_id', paymentResult.payment.id);
              sessionStorage.setItem('recent_payment_number', paymentResult.payment.paymentNumber);
            } catch {}
            if (onNavigate) onNavigate('payments');
          }
        }}
      />

      {/* No payment modal here */}
    </div>
  );
}

