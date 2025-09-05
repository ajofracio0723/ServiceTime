import { X, MapPin, Settings, Phone, Clock, Key, Car, AlertCircle, Edit } from 'lucide-react';
import { Property } from './types';
import { LocationMapView } from './LocationMapView';
import { useState, useEffect } from 'react';

// Constants
const MAINTENANCE_THRESHOLD_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface Client {
  id: string;
  name: string;
  type: 'company' | 'individual';
  companyName?: string;
  status: 'active' | 'inactive';
}

interface PropertyDetailsProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const PropertyDetails = ({
  property,
  isOpen,
  onClose,
  onEdit,
}: PropertyDetailsProps) => {
  const [clientName, setClientName] = useState<string>('');

  useEffect(() => {
    // Get client name from localStorage
    const savedClients = localStorage.getItem('clients');
    if (savedClients && property.clientId) {
      const clients: Client[] = JSON.parse(savedClients);
      const client = clients.find(c => c.id === property.clientId);
      if (client) {
        const displayName = client.type === 'company' && client.companyName 
          ? `${client.companyName} (${client.name})`
          : client.name;
        setClientName(displayName);
      } else {
        setClientName(`Client ID: ${property.clientId}`);
      }
    }
  }, [property.clientId]);

  if (!isOpen) return null;

  const fullAddress = `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zipCode}`;
  const hasMaintenanceIssues = property.linkedEquipment.some(eq => 
    eq.lastServiceDate && new Date(eq.lastServiceDate) < new Date(Date.now() - MAINTENANCE_THRESHOLD_DAYS * MS_PER_DAY)
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "residential":
        return "bg-blue-100 text-blue-800";
      case "commercial":
        return "bg-green-100 text-green-800";
      case "industrial":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (isActive: boolean, hasMaintenanceIssues: boolean) => {
    if (!isActive) return "bg-gray-100 text-gray-800";
    if (hasMaintenanceIssues) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (isActive: boolean, hasMaintenanceIssues: boolean) => {
    if (!isActive) return "inactive";
    if (hasMaintenanceIssues) return "maintenance";
    return "active";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Property Details</h2>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(property.propertyType)}`}>
                {property.propertyType}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.isActive, hasMaintenanceIssues)}`}>
                {getStatusText(property.isActive, hasMaintenanceIssues)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Property Name</label>
                <p className="text-gray-900 font-medium">{property.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Client</label>
                <div className="space-y-1">
                  {clientName && clientName !== `Client ID: ${property.clientId}` && (
                    <p className="text-gray-900 font-medium">{clientName}</p>
                  )}
                  <p className="text-sm text-gray-600">ID: {property.clientId}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Property Type</label>
                <p className="text-gray-900 capitalize">{property.propertyType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <p className="text-gray-900 capitalize">{property.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>

          {/* Service Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Service Address
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 font-medium mb-2">{fullAddress}</p>
                {property.geoLocation && (
                  <p className="text-sm text-gray-600">
                    Coordinates: {property.geoLocation.latitude.toFixed(6)}, {property.geoLocation.longitude.toFixed(6)}
                    {property.geoLocation.accuracy && (
                      <span className="ml-2">±{property.geoLocation.accuracy}m</span>
                    )}
                  </p>
                )}
              </div>
              
              {/* Location Map */}
              {property.geoLocation && (
                <LocationMapView
                  latitude={property.geoLocation?.latitude || 0}
                  longitude={property.geoLocation?.longitude || 0}
                  mapPins={property.mapPins || []}
                  propertyName={property.name}
                  height="300px"
                />
              )}
            </div>
          </div>

          {/* Access Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Access Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {property.accessNotes.gateCode && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Gate Code</label>
                  <p className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{property.accessNotes.gateCode}</p>
                </div>
              )}
              {property.accessNotes.bestTimeToAccess && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Best Time to Access
                  </label>
                  <p className="text-gray-900">{property.accessNotes.bestTimeToAccess}</p>
                </div>
              )}
              {property.accessNotes.emergencyContact?.name && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Emergency Contact
                  </label>
                  <p className="text-gray-900">{property.accessNotes.emergencyContact.name}</p>
                  {property.accessNotes.emergencyContact.phone && (
                    <p className="text-sm text-gray-600">{property.accessNotes.emergencyContact.phone}</p>
                  )}
                </div>
              )}
            </div>
            
            {property.accessNotes.parkingInstructions && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                  <Car className="w-4 h-4 mr-1" />
                  Parking Instructions
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{property.accessNotes.parkingInstructions}</p>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Access Notes
              </label>
              <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg border border-yellow-200">{property.accessNotes.specialInstructions}</p>
            </div>
          </div>

          {/* Linked Equipment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Linked Equipment ({property.linkedEquipment.length})
            </h3>
            {property.linkedEquipment.length > 0 ? (
              <div className="space-y-4">
                {property.linkedEquipment.map((equipment) => (
                  <div key={equipment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                      {equipment.lastServiceDate && new Date(equipment.lastServiceDate) < new Date(Date.now() - MAINTENANCE_THRESHOLD_DAYS * MS_PER_DAY) && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Needs Service
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {equipment.brand && (
                        <div>
                          <span className="text-gray-500">Brand:</span>
                          <p className="font-medium">{equipment.brand}</p>
                        </div>
                      )}
                      {equipment.model && (
                        <div>
                          <span className="text-gray-500">Model:</span>
                          <p className="font-medium">{equipment.model}</p>
                        </div>
                      )}
                      {equipment.serialNumber && (
                        <div>
                          <span className="text-gray-500">Serial:</span>
                          <p className="font-medium font-mono">{equipment.serialNumber}</p>
                        </div>
                      )}
                      {equipment.installDate && (
                        <div>
                          <span className="text-gray-500">Installed:</span>
                          <p className="font-medium">{new Date(equipment.installDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {equipment.warrantyExpiry && (
                        <div>
                          <span className="text-gray-500">Warranty:</span>
                          <p className="font-medium">{new Date(equipment.warrantyExpiry).toLocaleDateString()}</p>
                        </div>
                      )}
                      {equipment.lastServiceDate && (
                        <div>
                          <span className="text-gray-500">Last Service:</span>
                          <p className="font-medium">{new Date(equipment.lastServiceDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    
                    {equipment.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-gray-500 text-sm">Notes:</span>
                        <p className="text-sm text-gray-700 mt-1">{equipment.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No equipment linked to this property</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="font-medium">{new Date(property.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <p className="font-medium">{new Date(property.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
