import React, { useState } from "react";
import {
  Home,
  Plus,
  Search,
  MapPin,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  DollarSign,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  address: string;
  type: "residential" | "commercial" | "industrial";
  clientName: string;
  lastService: string;
  nextService: string;
  status: "active" | "inactive" | "maintenance";
  totalJobs: number;
  annualRevenue: number;
}

export const Property: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "residential" | "commercial" | "industrial"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "maintenance"
  >("all");

  const mockProperties: Property[] = [
    {
      id: "1",
      name: "Smith Family Home",
      address: "123 Main St, Anytown, ST 12345",
      type: "residential",
      clientName: "John Smith",
      lastService: "2024-01-10",
      nextService: "2024-02-10",
      status: "active",
      totalJobs: 8,
      annualRevenue: 2400,
    },
    {
      id: "2",
      name: "Downtown Office Building",
      address: "456 Business Ave, City Center, ST 67890",
      type: "commercial",
      clientName: "Sarah Johnson",
      lastService: "2024-01-15",
      nextService: "2024-01-30",
      status: "active",
      totalJobs: 15,
      annualRevenue: 6000,
    },
    {
      id: "3",
      name: "Wilson Manufacturing Plant",
      address: "789 Industrial Blvd, Factory District, ST 11111",
      type: "industrial",
      clientName: "Mike Wilson",
      lastService: "2023-12-20",
      nextService: "2024-02-15",
      status: "maintenance",
      totalJobs: 5,
      annualRevenue: 1800,
    },
  ];

  const filteredProperties = mockProperties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || property.type === filterType;
    const matchesStatus =
      filterStatus === "all" || property.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
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
            placeholder="Search properties..."
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
        {filteredProperties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Home className="w-5 h-5 text-blue-600" />
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                    property.type
                  )}`}
                >
                  {property.type}
                </span>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  property.status
                )}`}
              >
                {property.status}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {property.name}
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className="truncate">{property.address}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Client:</span>{" "}
                {property.clientName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <div className="text-gray-500">Last Service</div>
                <div className="font-medium text-gray-900">
                  {property.lastService}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Next Service</div>
                <div className="font-medium text-gray-900">
                  {property.nextService}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm mb-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{property.totalJobs} jobs</span>
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-4 h-4 mr-1" />
                <span>${property.annualRevenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                View Details
              </button>
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No properties found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};
