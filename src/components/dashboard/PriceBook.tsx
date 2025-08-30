import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Package, Wrench, Clock, Percent } from 'lucide-react';

export const PriceBook = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [searchTerm, setSearchTerm] = useState('');

  const services = [
    {
      id: '1',
      name: 'HVAC System Inspection',
      description: 'Complete inspection of heating, ventilation, and air conditioning systems',
      category: 'HVAC',
      basePrice: 150,
      unit: 'job',
      estimatedDuration: 120,
      skillsRequired: ['HVAC Certified', 'Electrical'],
      isActive: true
    },
    {
      id: '2',
      name: 'Plumbing Repair',
      description: 'General plumbing repair services',
      category: 'Plumbing',
      basePrice: 85,
      unit: 'hour',
      estimatedDuration: 60,
      skillsRequired: ['Plumbing License'],
      isActive: true
    },
    {
      id: '3',
      name: 'Electrical Wiring',
      description: 'Installation and repair of electrical wiring systems',
      category: 'Electrical',
      basePrice: 95,
      unit: 'hour',
      estimatedDuration: 90,
      skillsRequired: ['Electrical License', 'Safety Certified'],
      isActive: true
    }
  ];

  const parts = [
    {
      id: '1',
      name: 'HVAC Filter',
      description: 'High-efficiency particulate air filter',
      category: 'HVAC',
      sku: 'HF-001',
      cost: 25,
      markup: 50,
      unit: 'each',
      supplier: 'HVAC Supply Co',
      stockLevel: 45,
      minStockLevel: 10,
      isActive: true
    },
    {
      id: '2',
      name: 'Copper Pipe 1/2"',
      description: 'Type L copper pipe, 1/2 inch diameter',
      category: 'Plumbing',
      sku: 'CP-050',
      cost: 8.50,
      markup: 75,
      unit: 'foot',
      supplier: 'Plumbing Depot',
      stockLevel: 120,
      minStockLevel: 25,
      isActive: true
    }
  ];

  const laborRates = [
    {
      id: '1',
      name: 'Apprentice Rate',
      description: 'Entry-level technician rate',
      hourlyRate: 45,
      skillLevel: 'apprentice',
      isDefault: false,
      isActive: true
    },
    {
      id: '2',
      name: 'Journeyman Rate',
      description: 'Standard technician rate',
      hourlyRate: 75,
      skillLevel: 'journeyman',
      isDefault: true,
      isActive: true
    },
    {
      id: '3',
      name: 'Master Rate',
      description: 'Expert technician rate',
      hourlyRate: 95,
      skillLevel: 'master',
      isDefault: false,
      isActive: true
    }
  ];

  const taxes = [
    {
      id: '1',
      name: 'Sales Tax',
      rate: 8.25,
      type: 'percentage',
      applicableServices: ['all'],
      isDefault: true,
      isActive: true
    },
    {
      id: '2',
      name: 'Service Tax',
      rate: 5.0,
      type: 'percentage',
      applicableServices: ['labor'],
      isDefault: false,
      isActive: true
    }
  ];

  const discounts = [
    {
      id: '1',
      name: 'Senior Discount',
      type: 'percentage',
      value: 10,
      conditions: {
        minimumAmount: 100,
        firstTimeCustomer: false
      },
      isActive: true
    },
    {
      id: '2',
      name: 'First Time Customer',
      type: 'percentage',
      value: 15,
      conditions: {
        minimumAmount: 200,
        firstTimeCustomer: true
      },
      isActive: true
    }
  ];

  const tabs = [
    { id: 'services', label: 'Services', icon: Wrench, count: services.length },
    { id: 'parts', label: 'Parts', icon: Package, count: parts.length },
    { id: 'labor', label: 'Labor Rates', icon: Clock, count: laborRates.length },
    { id: 'taxes', label: 'Taxes', icon: Percent, count: taxes.length },
    { id: 'discounts', label: 'Discounts', icon: Percent, count: discounts.length }
  ];

  const renderServices = () => (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {service.category}
                </span>
                {service.isActive && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-2">{service.description}</p>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <span>Base Price: ${service.basePrice}/{service.unit}</span>
                <span>Duration: {service.estimatedDuration} min</span>
                <span>Skills: {service.skillsRequired.join(', ')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderParts = () => (
    <div className="space-y-4">
      {parts.map((part) => (
        <div key={part.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">{part.name}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  {part.category}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  SKU: {part.sku}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{part.description}</p>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <span>Cost: ${part.cost}/{part.unit}</span>
                <span>Markup: {part.markup}%</span>
                <span>Stock: {part.stockLevel} {part.unit}s</span>
                <span>Supplier: {part.supplier}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLaborRates = () => (
    <div className="space-y-4">
      {laborRates.map((rate) => (
        <div key={rate.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">{rate.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  rate.skillLevel === 'master' ? 'bg-gold-100 text-gold-800' :
                  rate.skillLevel === 'journeyman' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {rate.skillLevel}
                </span>
                {rate.isDefault && (
                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-2">{rate.description}</p>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <span className="text-lg font-semibold text-gray-900">${rate.hourlyRate}/hour</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTaxes = () => (
    <div className="space-y-4">
      {taxes.map((tax) => (
        <div key={tax.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">{tax.name}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  {tax.rate}% {tax.type}
                </span>
                {tax.isDefault && (
                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <span>Applies to: {tax.applicableServices.join(', ')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDiscounts = () => (
    <div className="space-y-4">
      {discounts.map((discount) => (
        <div key={discount.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">{discount.name}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  {discount.value}% {discount.type}
                </span>
                {discount.isActive && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                {discount.conditions?.minimumAmount && (
                  <span>Min Amount: ${discount.conditions.minimumAmount}</span>
                )}
                {discount.conditions?.firstTimeCustomer && (
                  <span>First Time Customers Only</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'services':
        return renderServices();
      case 'parts':
        return renderParts();
      case 'labor':
        return renderLaborRates();
      case 'taxes':
        return renderTaxes();
      case 'discounts':
        return renderDiscounts();
      default:
        return renderServices();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Book</h1>
          <p className="text-gray-600">Catalog of services, parts, labor rates, taxes, and discounts</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search price book..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {renderContent()}
      </div>
    </div>
  );
};
