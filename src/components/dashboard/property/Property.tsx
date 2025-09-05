import { useState, useEffect } from "react";
import {
  Home,
  Plus,
  Search,
  MapPin,
  Edit,
  Settings,
  Eye,
} from "lucide-react";
import { Property as PropertyType } from './types';
import { PropertyForm } from './PropertyForm';
import { PropertyDetails } from './PropertyDetails';

// Constants
const MAINTENANCE_THRESHOLD_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const Property = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "residential" | "commercial" | "industrial"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "maintenance"
  >("all");
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyType | undefined>(undefined);
  const [viewingProperty, setViewingProperty] = useState<PropertyType | undefined>(undefined);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);


  // Load properties from localStorage or API
  useEffect(() => {
    const savedProperties = localStorage.getItem('properties');
    if (savedProperties) {
      setProperties(JSON.parse(savedProperties));
    }
    // TODO: Fetch from API when backend is ready
  }, []);

  // Save properties to localStorage when they change
  useEffect(() => {
    if (properties.length > 0) {
      localStorage.setItem('properties', JSON.stringify(properties));
    }
  }, [properties]);

  const filteredProperties = properties.filter((property) => {
    const fullAddress = `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zipCode}`;
    const equipmentNames = property.linkedEquipment.map(eq => eq.name.toLowerCase()).join(' ');
    
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipmentNames.includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || property.propertyType === filterType;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && property.isActive) ||
      (filterStatus === "inactive" && !property.isActive) ||
      (filterStatus === "maintenance" && property.linkedEquipment.some(eq => 
        eq.lastServiceDate && new Date(eq.lastServiceDate) < new Date(Date.now() - MAINTENANCE_THRESHOLD_DAYS * MS_PER_DAY)
      ));
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateProperty = (propertyData: Omit<PropertyType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProperty: PropertyType = {
      ...propertyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProperties(prev => [...prev, newProperty]);
  };

  const handleUpdateProperty = (propertyData: Omit<PropertyType, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProperty) {
      const updatedProperty: PropertyType = {
        ...propertyData,
        id: editingProperty.id,
        createdAt: editingProperty.createdAt,
        updatedAt: new Date().toISOString()
      };
      setProperties(prev => prev.map(p => p.id === editingProperty.id ? updatedProperty : p));
      setEditingProperty(undefined);
    }
  };

  const handleViewDetails = (property: PropertyType) => {
    setViewingProperty(property);
    setIsDetailsOpen(true);
  };

  const openEditForm = (property: PropertyType) => {
    setEditingProperty(property);
    setIsFormOpen(true);
    setIsDetailsOpen(false);
  };

  const openCreateForm = () => {
    setEditingProperty(undefined);
    setIsFormOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsOpen(false);
    setViewingProperty(undefined);
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
          <p className="text-gray-600">
            Manage your property portfolio and service schedules
          </p>
        </div>
        <button 
          onClick={openCreateForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search properties, addresses, clients, equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) =>
            setFilterType(
              e.target.value as
                | "all"
                | "residential"
                | "commercial"
                | "industrial"
            )
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="industrial">Industrial</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(
              e.target.value as "all" | "active" | "inactive" | "maintenance"
            )
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Properties Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => {
          const fullAddress = `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zipCode}`;
          const hasMaintenanceIssues = property.linkedEquipment.some(eq => 
            eq.lastServiceDate && new Date(eq.lastServiceDate) < new Date(Date.now() - MAINTENANCE_THRESHOLD_DAYS * MS_PER_DAY)
          );
          
          return (
            <div
              key={property.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                      property.propertyType
                    )}`}
                  >
                    {property.propertyType}
                  </span>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    property.isActive, hasMaintenanceIssues
                  )}`}
                >
                  {getStatusText(property.isActive, hasMaintenanceIssues)}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {property.name}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">{fullAddress}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Client ID:</span>{" "}
                  {property.clientId}
                </div>
                {property.geoLocation && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Coordinates:</span>{" "}
                    {property.geoLocation.latitude.toFixed(4)}, {property.geoLocation.longitude.toFixed(4)}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Equipment ({property.linkedEquipment.length})</div>
                <div className="text-sm text-gray-900">
                  {property.linkedEquipment.length > 0 ? (
                    <div className="flex items-center space-x-1">
                      <Settings className="w-3 h-3" />
                      <span>{property.linkedEquipment.map(eq => eq.name).join(', ')}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No equipment linked</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Access Notes</div>
                <div className="text-sm text-gray-900 truncate">
                  {property.accessNotes.specialInstructions || 'No special instructions'}
                </div>
                {property.accessNotes.gateCode && (
                  <div className="text-xs text-gray-600 mt-1">
                    Gate Code: {property.accessNotes.gateCode}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button 
                  onClick={() => handleViewDetails(property)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => openEditForm(property)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Edit Property"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No properties found
          </h3>
          <p className="text-gray-600">
            {properties.length === 0 
              ? "Get started by adding your first property."
              : "Try adjusting your search or filter criteria."
            }
          </p>
        </div>
      )}

      {/* Property Form Modal */}
      <PropertyForm
        property={editingProperty}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProperty(undefined);
        }}
        onSave={editingProperty ? handleUpdateProperty : handleCreateProperty}
      />

      {/* Property Details Modal */}
      {viewingProperty && (
        <PropertyDetails
          property={viewingProperty}
          isOpen={isDetailsOpen}
          onClose={closeDetailsModal}
          onEdit={() => openEditForm(viewingProperty)}
        />
      )}
    </div>
  );
};
