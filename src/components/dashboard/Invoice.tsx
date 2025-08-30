import React, { useState } from "react";
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

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  propertyAddress: string;
  issueDate: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  totalAmount: number;
  paidAmount: number;
  balance: number;
  description: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export const Invoice: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "draft" | "sent" | "paid" | "overdue" | "cancelled"
  >("all");

  const mockInvoices: Invoice[] = [
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

  const filteredInvoices = mockInvoices.filter((invoice) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-600">
            Manage your invoices and track payments
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
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
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
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
                <button className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-green-600 hover:text-green-900">
                  <Download className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
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
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Details
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    Edit Invoice
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {invoice.status === "draft" && (
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center">
                      <Send className="w-4 h-4 mr-1" />
                      Send Invoice
                    </button>
                  )}
                  {invoice.status === "sent" && (
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      Record Payment
                    </button>
                  )}
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
    </div>
  );
};
