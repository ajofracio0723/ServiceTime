import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock,
  AlertCircle,
  User,
  MapPin,
  Edit,
  Send,
  Eye,
  TrendingUp,
  Archive
} from 'lucide-react';
import { EstimateForm } from './EstimateForm';
import { EstimatePreview } from './EstimatePreview';
import { Estimate as EstimateType, EstimateStatus } from '../../../types/domains/Estimate';
import { Client } from '../../../types/domains/Client';
import { Property } from '../../../types/domains/Property';
import { getEstimateStatusColor, isEstimateExpired } from '../../../utils/estimateValidation';
import { sampleEstimates } from '../../../mockData/sampleEstimates';

export const Estimate = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | EstimateStatus>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateType | null>(null);
  const [estimates, setEstimates] = useState<EstimateType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  // Load mock data on component mount
  useEffect(() => {
    // Create compatible mock clients
    const mockClients: Client[] = [
      {
        id: 'client-001',
        type: 'individual',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        contacts: [{
          id: 'contact-001',
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '(555) 123-4567',
          isPrimary: true
        }],
        billingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        },
        notes: '',
        serviceHistory: [],
        tags: [],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'client-002',
        type: 'company',
        companyName: 'ABC Property Management',
        email: 'sarah@abcproperties.com',
        phone: '(555) 987-6543',
        contacts: [{
          id: 'contact-002',
          name: 'Sarah Johnson',
          email: 'sarah@abcproperties.com',
          phone: '(555) 987-6543',
          role: 'Property Manager',
          isPrimary: true
        }],
        billingAddress: {
          street: '456 Business Ave',
          city: 'Downtown',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        notes: '',
        serviceHistory: [],
        tags: [],
        isActive: true,
        createdAt: '2024-01-20T14:15:00Z',
        updatedAt: '2024-01-20T14:15:00Z'
      },
      {
        id: 'client-003',
        type: 'individual',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@gmail.com',
        phone: '(555) 456-7890',
        contacts: [{
          id: 'contact-003',
          name: 'Michael Chen',
          email: 'michael.chen@gmail.com',
          phone: '(555) 456-7890',
          isPrimary: true
        }],
        billingAddress: {
          street: '789 Oak Drive',
          city: 'Suburbia',
          state: 'CA',
          zipCode: '90211',
          country: 'USA'
        },
        notes: '',
        serviceHistory: [],
        tags: [],
        isActive: true,
        createdAt: '2024-02-01T09:45:00Z',
        updatedAt: '2024-02-01T09:45:00Z'
      }
    ];

    // Create compatible mock properties
    const mockProperties: Property[] = [
      {
        id: 'prop-001',
        clientId: 'client-001',
        name: 'Main Residence',
        propertyType: 'residential',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        },
        geoLocation: {
          latitude: 37.7749,
          longitude: -122.4194
        },
        accessNotes: {
          gateCode: '',
          keyLocation: 'Under doormat',
          emergencyContact: {
            name: 'John Smith',
            phone: '(555) 123-4567'
          },
          parkingInstructions: 'Driveway available',
          specialInstructions: 'Ring doorbell'
        },
        linkedEquipment: [],
        photos: [],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'prop-002',
        clientId: 'client-002',
        name: 'Downtown Office Complex',
        propertyType: 'commercial',
        address: {
          street: '456 Business Ave',
          city: 'Downtown',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        geoLocation: {
          latitude: 34.0522,
          longitude: -118.2437
        },
        accessNotes: {
          gateCode: '#5678',
          keyLocation: 'Security desk',
          emergencyContact: {
            name: 'Building Security',
            phone: '(555) 234-5678'
          },
          parkingInstructions: 'Visitor parking in underground garage',
          specialInstructions: 'Check in with security desk in lobby'
        },
        linkedEquipment: [],
        photos: [],
        isActive: true,
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z'
      },
      {
        id: 'prop-003',
        clientId: 'client-003',
        name: 'Family Home',
        propertyType: 'residential',
        address: {
          street: '789 Oak Drive',
          city: 'Suburbia',
          state: 'CA',
          zipCode: '90211',
          country: 'USA'
        },
        geoLocation: {
          latitude: 34.0622,
          longitude: -118.2537
        },
        accessNotes: {
          gateCode: '',
          keyLocation: 'Spare key with neighbor',
          emergencyContact: {
            name: 'Michael Chen',
            phone: '(555) 456-7890'
          },
          parkingInstructions: 'Street parking available',
          specialInstructions: 'Call before arrival'
        },
        linkedEquipment: [],
        photos: [],
        isActive: true,
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-02-01T10:00:00Z'
      }
    ];

    setEstimates(sampleEstimates);
    setClients(mockClients as any);
    setProperties(mockProperties as any);
  }, []);

  const handleSaveEstimate = (estimateData: Partial<EstimateType>) => {
    if (selectedEstimate) {
      // Update existing estimate
      setEstimates(prev => prev.map(est => 
        est.id === selectedEstimate.id 
          ? { ...est, ...estimateData, updatedAt: new Date().toISOString() }
          : est
      ));
    } else {
      // Create new estimate
      const newEstimate: EstimateType = {
        id: `est-${Date.now()}`,
        estimateNumber: estimateData.estimateNumber || `EST-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clientApproval: { isApproved: false },
        ...estimateData
      } as EstimateType;
      
      setEstimates(prev => [newEstimate, ...prev]);
    }
    setSelectedEstimate(null);
  };


  const handleViewEstimate = (estimate: EstimateType) => {
    setSelectedEstimate(estimate);
    setIsPreviewOpen(true);
  };

  const handleEditEstimate = (estimate: EstimateType) => {
    setSelectedEstimate(estimate);
    setIsFormOpen(true);
  };

  const filteredEstimates = estimates.filter((estimate: EstimateType) => {
    const client = clients.find(c => c.id === estimate.clientId);
    const property = properties.find(p => p.id === estimate.propertyId);
    const clientName = client?.type === 'company' ? client.companyName : `${client?.firstName || ''} ${client?.lastName || ''}`.trim();
    const propertyAddress = property ? `${property.address.street}, ${property.address.city}` : '';
    
    const matchesSearch = estimate.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || estimate.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: EstimateStatus) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'viewed': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'converted': return <TrendingUp className="w-4 h-4" />;
      case 'cancelled': return <Archive className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estimates</h2>
          <p className="text-gray-600">Create and manage service estimates for your clients</p>
        </div>
        <button 
          onClick={() => {
            setSelectedEstimate(null);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Estimate</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search estimates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | EstimateStatus)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
          <option value="converted">Converted</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Estimates List */}
      <div className="space-y-4">
        {filteredEstimates.map((estimate) => {
          const client = clients.find(c => c.id === estimate.clientId);
          const property = properties.find(p => p.id === estimate.propertyId);
          const clientName = client?.type === 'company' ? client.companyName : `${client?.firstName || ''} ${client?.lastName || ''}`.trim();
          const isExpired = isEstimateExpired(estimate);
          
          return (
            <div key={estimate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEstimateStatusColor(estimate.status)}`}>
                    {getStatusIcon(estimate.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{estimate.estimateNumber}</h3>
                    <p className="text-sm text-gray-600 font-medium">{estimate.title}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstimateStatusColor(estimate.status)}`}>
                        {estimate.status}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created: {new Date(estimate.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Expires: {new Date(estimate.terms.validUntil).toLocaleDateString()}
                      </span>
                      {isExpired && (
                        <span className="text-red-600 font-medium">EXPIRED</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleViewEstimate(estimate)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Estimate"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEditEstimate(estimate)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit Estimate"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span><span className="font-medium">Client:</span> {clientName || 'Unknown Client'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">
                      {property ? `${property.address.street}, ${property.address.city}` : 'Unknown Property'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Description:</span> {estimate.description}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span><span className="font-medium">Total Amount:</span> ${estimate.total.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Items:</span> {estimate.items.length} line items
                  </div>
                  {estimate.depositRequirement.isRequired && (
                    <div className="text-sm text-yellow-600">
                      <span className="font-medium">Deposit Required:</span> 
                      {estimate.depositRequirement.percentage 
                        ? ` ${estimate.depositRequirement.percentage}%`
                        : ` $${estimate.depositRequirement.amount}`
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Estimate Items Preview */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Estimate Items</h4>
                <div className="space-y-2">
                  {estimate.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        {item.category && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded ml-2">
                            {item.category}
                          </span>
                        )}
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <div className="text-gray-600">
                        ${item.unitPrice.toFixed(2)} × {item.quantity} = ${item.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  {estimate.items.length > 3 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      ... and {estimate.items.length - 3} more items
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleViewEstimate(estimate)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleEditEstimate(estimate)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit Estimate
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {estimate.status === 'draft' && (
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center">
                        <Send className="w-4 h-4 mr-1" />
                        Send Estimate
                      </button>
                    )}
                    {estimate.status === 'sent' && (
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        Mark Approved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEstimates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No estimates found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Modals */}
      <EstimateForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedEstimate(null);
        }}
        estimate={selectedEstimate || undefined}
        onSave={handleSaveEstimate}
        clients={clients}
        properties={properties}
      />

      {selectedEstimate && (
        <EstimatePreview
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setSelectedEstimate(null);
          }}
          estimate={selectedEstimate}
          client={clients.find(c => c.id === selectedEstimate.clientId)!}
          property={properties.find(p => p.id === selectedEstimate.propertyId)!}
          onDownload={() => console.log('Download PDF')}
          onSend={() => console.log('Send estimate')}
        />
      )}
    </div>
  );
};
