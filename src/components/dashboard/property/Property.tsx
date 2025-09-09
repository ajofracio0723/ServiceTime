import { useState, useEffect } from "react";
import {
  Home,
  Plus,
  Search,
  MapPin,
  Edit,
  Settings,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Property as PropertyType } from './types';
import { PropertyForm } from './PropertyForm';
import { PropertyDetails } from './PropertyDetails';
import { 
  getEquipmentStatusSummary, 
  getMaintenanceAlerts, 
  getEquipmentStatus,
  equipmentStatusFilters,
  getCategoryInfo
} from './equipmentUtils';

export const Property = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "residential" | "commercial" | "industrial"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "maintenance"
  >("all");
  const [equipmentStatusFilter, setEquipmentStatusFilter] = useState<string>("all");
  const [showMaintenanceAlerts, setShowMaintenanceAlerts] = useState(true);
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

  // Calculate equipment status summaries for all properties
  const allEquipment = properties.flatMap(p => p.linkedEquipment);
  const equipmentSummary = getEquipmentStatusSummary(allEquipment);
  const maintenanceAlerts = getMaintenanceAlerts(allEquipment);

  const filteredProperties = properties.filter((property) => {
    const fullAddress = `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zipCode}`;
    const equipmentNames = property.linkedEquipment.map(eq => eq.name.toLowerCase()).join(' ');
    
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipmentNames.includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || property.propertyType === filterType;
    // Enhanced status filtering with equipment status
    const propertyEquipmentSummary = getEquipmentStatusSummary(property.linkedEquipment);
    const hasMaintenanceIssues = propertyEquipmentSummary.overdue > 0 || propertyEquipmentSummary.dueSoon > 0;
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && property.isActive) ||
      (filterStatus === "inactive" && !property.isActive) ||
      (filterStatus === "maintenance" && hasMaintenanceIssues);
    
    // Equipment status filtering
    const matchesEquipmentStatus = equipmentStatusFilter === "all" || 
      property.linkedEquipment.some(eq => getEquipmentStatus(eq).status === equipmentStatusFilter);
    
    return matchesSearch && matchesType && matchesStatus && matchesEquipmentStatus;
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

      {/* Equipment Status Summary */}
      {properties.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Equipment Status Overview</h3>
            <button
              onClick={() => setShowMaintenanceAlerts(!showMaintenanceAlerts)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showMaintenanceAlerts ? 'Hide' : 'Show'} Alerts
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{equipmentSummary.total}</div>
              <div className="text-sm text-gray-600">Total Equipment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{equipmentSummary.critical}</div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">{equipmentSummary.overdue}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{equipmentSummary.dueSoon}</div>
              <div className="text-sm text-gray-600">Due Soon</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{equipmentSummary.warrantyExpiring}</div>
              <div className="text-sm text-gray-600">Warranty Expiring</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{equipmentSummary.underWarranty}</div>
              <div className="text-sm text-gray-600">Under Warranty</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{equipmentSummary.upToDate}</div>
              <div className="text-sm text-gray-600">Up to Date</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{equipmentSummary.needsInspection}</div>
              <div className="text-sm text-gray-600">Needs Inspection</div>
            </div>
          </div>
          
          {/* Maintenance Alerts */}
          {showMaintenanceAlerts && maintenanceAlerts.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                Maintenance Alerts ({maintenanceAlerts.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {maintenanceAlerts.slice(0, 5).map((alert, index) => {
                  const categoryInfo = getCategoryInfo(alert.category);
                  return (
                    <div key={index} className={`p-3 rounded-md border-l-4 ${
                      alert.priority === 'critical' ? 'bg-red-50 border-red-400' : 'bg-orange-50 border-orange-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{categoryInfo.icon} {alert.equipmentName}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            alert.priority === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {alert.priority.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{alert.message}</span>
                      </div>
                      {alert.actionRequired && (
                        <div className="text-xs text-gray-600 mt-1">{alert.actionRequired}</div>
                      )}
                    </div>
                  );
                })}
                {maintenanceAlerts.length > 5 && (
                  <div className="text-sm text-gray-500 text-center py-2">
                    ... and {maintenanceAlerts.length - 5} more alerts
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
        <select
          value={equipmentStatusFilter}
          onChange={(e) => setEquipmentStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {equipmentStatusFilters.map(filter => (
            <option key={filter.id} value={filter.id}>
              {filter.name}
            </option>
          ))}
        </select>
      </div>

      {/* Properties Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => {
          const fullAddress = `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zipCode}`;
          const propertyEquipmentSummary = getEquipmentStatusSummary(property.linkedEquipment);
          const hasMaintenanceIssues = propertyEquipmentSummary.overdue > 0 || propertyEquipmentSummary.dueSoon > 0;
          const hasCriticalIssues = propertyEquipmentSummary.critical > 0;
          
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
                <div className="flex items-center space-x-1">
                  {hasCriticalIssues && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      property.isActive, hasMaintenanceIssues
                    )}`}
                  >
                    {getStatusText(property.isActive, hasMaintenanceIssues)}
                  </span>
                </div>
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
                <div className="text-sm text-gray-500 mb-2">Equipment ({property.linkedEquipment.length})</div>
                {property.linkedEquipment.length > 0 ? (
                  <div className="space-y-2">
                    {/* Equipment Status Summary */}
                    <div className="flex items-center space-x-2 text-xs">
                      {propertyEquipmentSummary.critical > 0 && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {propertyEquipmentSummary.critical} Critical
                        </span>
                      )}
                      {propertyEquipmentSummary.overdue > 0 && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {propertyEquipmentSummary.overdue} Overdue
                        </span>
                      )}
                      {propertyEquipmentSummary.dueSoon > 0 && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {propertyEquipmentSummary.dueSoon} Due Soon
                        </span>
                      )}
                      {propertyEquipmentSummary.upToDate > 0 && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {propertyEquipmentSummary.upToDate} Up to Date
                        </span>
                      )}
                    </div>
                    {/* Equipment List */}
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <Settings className="w-3 h-3" />
                        <span className="truncate">{property.linkedEquipment.slice(0, 3).map(eq => eq.name).join(', ')}</span>
                        {property.linkedEquipment.length > 3 && (
                          <span className="text-gray-500">+{property.linkedEquipment.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No equipment linked</span>
                )}
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
