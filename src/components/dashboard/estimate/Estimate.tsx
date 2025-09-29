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
  Archive,
  Briefcase
} from 'lucide-react';
import { EstimateForm } from './EstimateForm';
import { EstimatePreview } from './EstimatePreview';
import { Estimate as EstimateType, EstimateStatus } from '../../../types/domains/Estimate';
import { Client } from '../../../types/domains/Client';
import { Property } from '../../../types/domains/Property';
import { getEstimateStatusColor, isEstimateExpired } from '../../../utils/estimateValidation';
import { sampleEstimates } from '../../../mockData/sampleEstimates';
import { validateEstimateForConversion } from '../../../utils/estimateToJobConverter';
import { jobStorage } from '../../../utils/jobStorage';
import { JobForm } from '../job/JobForm';
import { Job } from '../job/types';

export const Estimate = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | EstimateStatus>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateType | null>(null);
  const [estimates, setEstimates] = useState<EstimateType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [jobFormPrefilledData, setJobFormPrefilledData] = useState<any>(null);

  // Load data on component mount
  useEffect(() => {
    try {
      // Estimates
      const savedEstimates = localStorage.getItem('estimates');
      if (savedEstimates) {
        const parsedEstimates = JSON.parse(savedEstimates);
        if (Array.isArray(parsedEstimates)) {
          setEstimates(parsedEstimates as EstimateType[]);
        } else {
          console.warn('Invalid estimates data in localStorage, using sample data');
          setEstimates(sampleEstimates);
        }
      } else {
        setEstimates(sampleEstimates);
      }

      // Clients (shared with Client module)
      const savedClients = localStorage.getItem('clients');
      if (savedClients) {
        const parsedClients = JSON.parse(savedClients);
        if (Array.isArray(parsedClients)) {
          setClients(parsedClients as Client[]);
        }
      }

      // Properties (shared with Property module)
      const savedProps = localStorage.getItem('properties');
      if (savedProps) {
        const parsedProperties = JSON.parse(savedProps);
        if (Array.isArray(parsedProperties)) {
          setProperties(parsedProperties as Property[]);
        }
      } else {
        // Create minimal sample property for testing
        const sampleProperty: Property = {
          id: 'prop-001',
          name: 'Main Office Building',
          clientId: 'client-001',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'USA'
          },
          geoLocation: { latitude: 40.7128, longitude: -74.0060 },
          propertyType: 'commercial',
          accessNotes: {
            gateCode: '1234',
            keyLocation: 'Under the mat',
            emergencyContact: {
              name: 'John Smith',
              phone: '(555) 123-4567'
            },
            parkingInstructions: 'Park in visitor spots',
            specialInstructions: 'Ring doorbell twice'
          },
          linkedEquipment: [],
          photos: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProperties([sampleProperty]);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      // Fallback to sample estimates only
      setEstimates(sampleEstimates);
    }
  }, []);

  // Persist estimates to localStorage
  useEffect(() => {
    try {
      if (estimates.length > 0) {
        localStorage.setItem('estimates', JSON.stringify(estimates));
      }
    } catch (error) {
      console.error('Error saving estimates to localStorage:', error);
    }
  }, [estimates]);

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
      const nowIso = new Date().toISOString();
      const defaultValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const newEstimate: EstimateType = {
        id: `est-${Date.now()}`,
        estimateNumber: estimateData.estimateNumber || `EST-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        clientId: estimateData.clientId || '',
        propertyId: estimateData.propertyId || '',
        title: estimateData.title || 'New Estimate',
        description: estimateData.description || '',
        items: estimateData.items || [],
        subtotal: estimateData.subtotal ?? 0,
        taxes: estimateData.taxes || [],
        totalTaxAmount: estimateData.totalTaxAmount ?? 0,
        discounts: estimateData.discounts || [],
        totalDiscountAmount: estimateData.totalDiscountAmount ?? 0,
        total: estimateData.total ?? 0,
        terms: estimateData.terms || { validUntil: defaultValidUntil, paymentTerms: 'Net 30' },
        depositRequirement: estimateData.depositRequirement || { isRequired: false },
        clientApproval: estimateData.clientApproval || { isApproved: false },
        status: estimateData.status || 'draft',
        templateId: estimateData.templateId,
        notes: estimateData.notes,
        internalNotes: estimateData.internalNotes,
        attachments: estimateData.attachments || [],
        createdBy: 'current-user',
        createdAt: nowIso,
        updatedAt: nowIso,
        sentAt: estimateData.sentAt,
        viewedAt: estimateData.viewedAt,
        approvedAt: estimateData.approvedAt,
        rejectedAt: estimateData.rejectedAt,
        expiredAt: estimateData.expiredAt,
        convertedToJobAt: estimateData.convertedToJobAt,
        jobId: estimateData.jobId,
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

  const handleSendEstimate = (estimate: EstimateType) => {
    try {
      // Update estimate status to sent
      const updatedEstimate = {
        ...estimate,
        status: 'sent' as EstimateStatus,
        sentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setEstimates(prev => prev.map(est => 
        est.id === estimate.id ? updatedEstimate : est
      ));

      alert(`Estimate sent successfully!\nEstimate Number: ${estimate.estimateNumber}\n\nThe client will receive the estimate via email.`);
    } catch (error) {
      console.error('Error sending estimate:', error);
      alert('Failed to send estimate. Please try again.');
    }
  };

  const handleMarkApproved = (estimate: EstimateType) => {
    try {
      // Update estimate status to approved
      const updatedEstimate = {
        ...estimate,
        status: 'approved' as EstimateStatus,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clientApproval: {
          ...estimate.clientApproval,
          isApproved: true,
          approvedAt: new Date().toISOString(),
          approvedBy: 'Client' // In real app, this would come from the client
        }
      };

      setEstimates(prev => prev.map(est => 
        est.id === estimate.id ? updatedEstimate : est
      ));

      alert(`Estimate approved!\nEstimate Number: ${estimate.estimateNumber}\n\nYou can now create a job from this estimate.`);
    } catch (error) {
      console.error('Error approving estimate:', error);
      alert('Failed to approve estimate. Please try again.');
    }
  };

  const handleCreateJob = (estimate: EstimateType) => {
    try {
      // Validate estimate for conversion
      const validationErrors = validateEstimateForConversion(estimate);
      if (validationErrors.length > 0) {
        alert(`Cannot create job:\n${validationErrors.join('\n')}`);
        return;
      }

      // Find client and property data
      const client = clients.find(c => c.id === estimate.clientId);
      const property = properties.find(p => p.id === estimate.propertyId);

      if (!client || !property) {
        alert('Missing client or property information. Cannot create job.');
        return;
      }

      // Prepare pre-filled data for JobForm
      const clientName = client.type === 'company' ? (client.companyName || '') : `${client.firstName || ''} ${client.lastName || ''}`.trim();
      const propertyAddress = property.address ? `${property.address.street || ''}, ${property.address.city || ''}`.trim() : '';
      
      // Determine job category based on estimate items
      const categories = estimate.items.map(item => item.category).filter(Boolean);
      const primaryCategory = categories.length > 0 ? categories[0] : 'maintenance';
      
      const prefilledData = {
        title: `${estimate.title} (From Estimate ${estimate.estimateNumber})`,
        clientId: estimate.clientId,
        clientName,
        propertyId: estimate.propertyId,
        propertyAddress,
        estimateId: estimate.id,
        description: `Job created from approved estimate ${estimate.estimateNumber}. ${estimate.description}`,
        category: primaryCategory === 'hvac' ? 'hvac' : 
                 primaryCategory === 'plumbing' ? 'plumbing' : 
                 primaryCategory === 'electrical' ? 'electrical' : 'maintenance',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedDuration: `${Math.ceil(estimate.items.reduce((total, item) => total + (item.quantity * 1), 0))}h`,
        priority: 'medium' as const,
        estimatedCost: estimate.total,
        scope: {
          description: estimate.description,
          objectives: [
            `Complete work as outlined in estimate ${estimate.estimateNumber}`,
            `Deliver all services and materials as specified`,
            `Ensure client satisfaction and quality standards`
          ],
          deliverables: estimate.items.map(item => 
            `${item.name} - ${item.description || 'Complete as specified'} (Qty: ${item.quantity})`
          ),
          requirements: [],
          safetyNotes: []
        },
        checklist: estimate.items.map((item, index) => ({
          id: `checklist-${index + 1}`,
          task: `${item.name} - ${item.description || 'Complete task'}`,
          completed: false
        })),
        internalNotes: `Created from estimate ${estimate.estimateNumber}. ${estimate.internalNotes || ''}`,
        clientNotes: estimate.notes || `Work to be completed as per estimate ${estimate.estimateNumber}`
      };

      setJobFormPrefilledData(prefilledData);
      setIsJobFormOpen(true);
    } catch (error) {
      console.error('Error preparing job form:', error);
      alert('Failed to open job form. Please try again.');
    }
  };

  const handleJobFormSubmit = (job: Job) => {
    // Save the job using jobStorage
    jobStorage.addJob(job);

    // Update the estimate status to converted
    if (jobFormPrefilledData?.estimateId) {
      const updatedEstimate = estimates.find(est => est.id === jobFormPrefilledData.estimateId);
      if (updatedEstimate) {
        const convertedEstimate = {
          ...updatedEstimate,
          status: 'converted' as EstimateStatus,
          convertedToJobAt: new Date().toISOString(),
          jobId: job.id,
          updatedAt: new Date().toISOString()
        };

        setEstimates(prev => prev.map(est => 
          est.id === jobFormPrefilledData.estimateId ? convertedEstimate : est
        ));
      }
    }

    // Close the job form
    setIsJobFormOpen(false);
    setJobFormPrefilledData(null);

    // Show success message
    alert(`✅ Job Created Successfully!\n\nJob Number: ${job.jobNumber}\nTitle: ${job.title}\nClient: ${job.clientName}\nScheduled: ${new Date(job.scheduledDate).toLocaleDateString()}\n\nThe job has been created and is now available in the Jobs module.`);
  };

  const filteredEstimates = estimates.filter((estimate: EstimateType) => {
    const client = clients.find(c => c.id === estimate.clientId);
    const property = properties.find(p => p.id === estimate.propertyId);
    const clientName = client?.type === 'company' ? (client?.companyName || '') : `${client?.firstName || ''} ${client?.lastName || ''}`.trim();
    const propertyAddress = property ? `${property.address?.street || ''}, ${property.address?.city || ''}`.trim() : '';
    
    const matchesSearch = (estimate.estimateNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (estimate.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (propertyAddress || '').toLowerCase().includes(searchTerm.toLowerCase());
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
          const clientName = client?.type === 'company' ? (client.companyName || '') : `${client?.firstName || ''} ${client?.lastName || ''}`.trim();
          const isExpired = estimate.terms?.validUntil ? isEstimateExpired(estimate) : false;
          
          return (
            <div key={estimate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEstimateStatusColor(estimate.status)}`}>
                    {getStatusIcon(estimate.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{estimate.estimateNumber || '—'}</h3>
                    <p className="text-sm text-gray-600 font-medium">{estimate.title || ''}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstimateStatusColor(estimate.status)}`}>
                        {estimate.status}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created: {estimate.createdAt ? new Date(estimate.createdAt).toLocaleDateString() : '—'}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Expires: {estimate.terms?.validUntil ? new Date(estimate.terms.validUntil).toLocaleDateString() : '—'}
                      </span>
                      {isExpired && (
                        <span className="text-red-600 font-medium">EXPIRED</span>
                      )}
                      {estimate.status === 'converted' && estimate.jobId && (
                        <span className="flex items-center text-purple-600 font-medium">
                          <Briefcase className="w-4 h-4 mr-1" />
                          Job Created
                        </span>
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
                      {property?.address ? `${property.address.street || ''}, ${property.address.city || ''}`.trim() || 'Unknown Property' : 'Unknown Property'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Description:</span> {estimate.description || ''}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span><span className="font-medium">Total Amount:</span> ${Number(estimate.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Items:</span> {(estimate.items || []).length} line items
                  </div>
                  {estimate.depositRequirement?.isRequired && (
                    <div className="text-sm text-yellow-600">
                      <span className="font-medium">Deposit Required:</span> 
                      {estimate.depositRequirement?.percentage 
                        ? ` ${estimate.depositRequirement.percentage}%`
                        : ` $${estimate.depositRequirement?.amount || 0}`
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Estimate Items Preview */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Estimate Items</h4>
                <div className="space-y-2">
                  {(estimate.items || []).slice(0, 3).map((item) => (
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
                        ${Number(item.unitPrice || 0).toFixed(2)} × {item.quantity} = ${Number(item.total || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  {(estimate.items || []).length > 3 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      ... and {(estimate.items || []).length - 3} more items
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
                      <button 
                        onClick={() => handleSendEstimate(estimate)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Send Estimate
                      </button>
                    )}
                    {estimate.status === 'sent' && (
                      <button 
                        onClick={() => handleMarkApproved(estimate)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Mark Approved
                      </button>
                    )}
                    {estimate.status === 'approved' && !estimate.jobId && (
                      <button 
                        onClick={() => handleCreateJob(estimate)}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center"
                      >
                        <Briefcase className="w-4 h-4 mr-1" />
                        Create Job
                      </button>
                    )}
                    {estimate.status === 'converted' && estimate.jobId && (
                      <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                        Job Created
                      </div>
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

      {selectedEstimate && isPreviewOpen && (() => {
        const client = clients.find(c => c.id === selectedEstimate.clientId);
        const property = properties.find(p => p.id === selectedEstimate.propertyId);
        if (!client || !property) {
          console.warn('Missing client or property data for estimate preview');
          return null;
        }
        return (
          <EstimatePreview
            isOpen={isPreviewOpen}
            onClose={() => {
              setIsPreviewOpen(false);
              setSelectedEstimate(null);
            }}
            estimate={selectedEstimate}
            client={client}
            property={property}
            onDownload={() => console.log('Download PDF')}
            onSend={() => console.log('Send estimate')}
          />
        );
      })()}

      {/* Job Form Modal */}
      <JobForm
        isOpen={isJobFormOpen}
        onClose={() => {
          setIsJobFormOpen(false);
          setJobFormPrefilledData(null);
        }}
        onSubmit={handleJobFormSubmit}
        prefilledData={jobFormPrefilledData}
      />
    </div>
  );
};
