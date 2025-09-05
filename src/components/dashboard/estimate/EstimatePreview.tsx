import React from 'react';
import { 
  X, 
  Download, 
  Send, 
  CheckCircle, 
  XCircle, 
  User,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Estimate } from '../../../types/domains/Estimate';
import { Client } from '../../../types/domains/Client';
import { Property } from '../../../types/domains/Property';

interface EstimatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: Estimate;
  client: Client;
  property: Property;
  onApprove?: () => void;
  onReject?: () => void;
  onSend?: () => void;
  onDownload?: () => void;
  isClientView?: boolean;
}

export const EstimatePreview: React.FC<EstimatePreviewProps> = ({
  isOpen,
  onClose,
  estimate,
  client,
  property,
  onApprove,
  onReject,
  onSend,
  onDownload,
  isClientView = false
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Estimate Preview</h2>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-sm text-gray-600">{estimate.estimateNumber}</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(estimate.status)}`}>
                {estimate.status}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isClientView && (
              <>
                <button
                  onClick={onDownload}
                  className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                {estimate.status === 'draft' && (
                  <button
                    onClick={onSend}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-100"
                    title="Send to Client"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Estimate Content */}
        <div className="p-6 space-y-6">
          {/* Business Header */}
          <div className="text-center border-b border-gray-200 pb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ServiceTime Solutions</h1>
            <p className="text-gray-600">Professional Service Estimate</p>
          </div>

          {/* Estimate Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Estimate Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimate Number:</span>
                  <span className="font-medium">{estimate.estimateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span>{formatDate(estimate.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valid Until:</span>
                  <span>{formatDate(estimate.terms.validUntil)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Terms:</span>
                  <span>{estimate.terms.paymentTerms}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{client.type === 'company' ? client.companyName : `${client.firstName} ${client.lastName}`}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium">{property.name}</div>
                    <div className="text-gray-600">
                      {property.address.street}<br />
                      {property.address.city}, {property.address.state} {property.address.zipCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estimate Title and Description */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{estimate.title}</h3>
            {estimate.description && (
              <p className="text-gray-700">{estimate.description}</p>
            )}
          </div>

          {/* Estimate Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimate Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900">
                      Qty
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-900">
                      Unit Price
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-900">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-600">{item.description}</div>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {item.type}
                            </span>
                            {item.category && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${estimate.subtotal.toFixed(2)}</span>
              </div>
              {estimate.totalDiscountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Total Discounts:</span>
                  <span>-${estimate.totalDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              {estimate.taxes.map((tax, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{tax.name} ({tax.rate}%):</span>
                  <span>${tax.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${estimate.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="mb-2">
                  <span className="font-medium">Payment Terms:</span> {estimate.terms.paymentTerms}
                </div>
                {estimate.terms.warrantyPeriod && (
                  <div className="mb-2">
                    <span className="font-medium">Warranty:</span> {estimate.terms.warrantyPeriod}
                  </div>
                )}
                <div>
                  <span className="font-medium">Valid Until:</span> {formatDate(estimate.terms.validUntil)}
                </div>
              </div>
              {estimate.terms.additionalTerms && (
                <div>
                  <div className="font-medium mb-2">Additional Terms:</div>
                  <p className="text-gray-700">{estimate.terms.additionalTerms}</p>
                </div>
              )}
            </div>
          </div>

          {/* Deposit Information */}
          {estimate.depositRequirement.isRequired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Deposit Required</h4>
              <p className="text-sm text-yellow-700">
                {estimate.depositRequirement.percentage 
                  ? `${estimate.depositRequirement.percentage}% deposit required (${(estimate.total * estimate.depositRequirement.percentage / 100).toFixed(2)})`
                  : `$${estimate.depositRequirement.amount?.toFixed(2)} deposit required`
                }
                {estimate.depositRequirement.dueDate && (
                  <span> by {formatDate(estimate.depositRequirement.dueDate)}</span>
                )}
              </p>
            </div>
          )}

          {/* Client Notes */}
          {estimate.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
              <p className="text-gray-700 text-sm">{estimate.notes}</p>
            </div>
          )}

          {/* Client Approval Section (for client view) */}
          {isClientView && estimate.status === 'sent' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Client Approval</h3>
              <p className="text-blue-700 mb-4">
                Please review the estimate details above and choose one of the following options:
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={onApprove}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve Estimate</span>
                </button>
                <button
                  onClick={onReject}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject Estimate</span>
                </button>
              </div>
            </div>
          )}

          {/* Approval Status */}
          {estimate.clientApproval.isApproved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <h4 className="font-medium text-green-800">Estimate Approved</h4>
                  <p className="text-sm text-green-700">
                    Approved by {estimate.clientApproval.approvedBy} on {estimate.approvedAt && formatDate(estimate.approvedAt)}
                  </p>
                  {estimate.clientApproval.notes && (
                    <p className="text-sm text-green-700 mt-1">
                      Note: {estimate.clientApproval.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          
          {!isClientView && (
            <div className="flex items-center space-x-3">
              <button
                onClick={onDownload}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              {estimate.status === 'draft' && (
                <button
                  onClick={onSend}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send to Client</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
