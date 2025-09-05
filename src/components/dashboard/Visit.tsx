import { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  MoreVertical,
  Navigation
} from 'lucide-react';

interface Visit {
  id: string;
  clientName: string;
  propertyAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  visitType: 'maintenance' | 'repair' | 'inspection' | 'emergency';
  technician: string;
  estimatedDuration: string;
  notes: string;
  contactPhone: string;
  contactEmail: string;
}

export const Visit: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'>('all');
  const [filterType, setFilterType] = useState<'all' | 'maintenance' | 'repair' | 'inspection' | 'emergency'>('all');

  const mockVisits: Visit[] = [
    {
      id: '1',
      clientName: 'John Smith',
      propertyAddress: '123 Main St, Anytown, ST 12345',
      scheduledDate: '2024-01-20',
      scheduledTime: '09:00 AM',
      status: 'scheduled',
      visitType: 'maintenance',
      technician: 'Mike Johnson',
      estimatedDuration: '2 hours',
      notes: 'Regular HVAC maintenance. Client prefers morning appointments.',
      contactPhone: '(555) 123-4567',
      contactEmail: 'john.smith@email.com'
    },
    {
      id: '2',
      clientName: 'Sarah Johnson',
      propertyAddress: '456 Oak Ave, Somewhere, ST 67890',
      scheduledDate: '2024-01-19',
      scheduledTime: '02:00 PM',
      status: 'in-progress',
      visitType: 'repair',
      technician: 'David Wilson',
      estimatedDuration: '3 hours',
      notes: 'Kitchen sink repair. Client will be home during visit.',
      contactPhone: '(555) 234-5678',
      contactEmail: 'sarah.j@email.com'
    },
    {
      id: '3',
      clientName: 'Mike Wilson',
      propertyAddress: '789 Pine Rd, Elsewhere, ST 11111',
      scheduledDate: '2024-01-18',
      scheduledTime: '10:00 AM',
      status: 'completed',
      visitType: 'inspection',
      technician: 'Lisa Brown',
      estimatedDuration: '1 hour',
      notes: 'Annual electrical inspection completed successfully.',
      contactPhone: '(555) 345-6789',
      contactEmail: 'mike.w@email.com'
    }
  ];

  const filteredVisits = mockVisits.filter(visit => {
    const matchesSearch = visit.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || visit.status === filterStatus;
    const matchesType = filterType === 'all' || visit.visitType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'repair': return 'bg-orange-100 text-orange-800';
      case 'inspection': return 'bg-green-100 text-green-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      case 'no-show': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Visits</h2>
          <p className="text-gray-600">Schedule and manage your service visits</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Schedule Visit</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search visits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'maintenance' | 'repair' | 'inspection' | 'emergency')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="maintenance">Maintenance</option>
          <option value="repair">Repair</option>
          <option value="inspection">Inspection</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      {/* Visits List */}
      <div className="space-y-4">
        {filteredVisits.map((visit) => (
          <div key={visit.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(visit.status)}`}>
                  {getStatusIcon(visit.status)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{visit.clientName}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(visit.visitType)}`}>
                      {visit.visitType}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {visit.scheduledDate}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {visit.scheduledTime}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-4 h-4" />
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
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">{visit.propertyAddress}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span><span className="font-medium">Technician:</span> {visit.technician}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span><span className="font-medium">Duration:</span> {visit.estimatedDuration}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{visit.contactPhone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">{visit.contactEmail}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-3">{visit.notes}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Details
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center">
                    <Navigation className="w-4 h-4 mr-1" />
                    Directions
                  </button>
                </div>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  Update Status
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVisits.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No visits found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};
