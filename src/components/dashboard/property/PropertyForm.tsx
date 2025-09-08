import { useState, useEffect } from 'react';
import { X, Plus, Trash2, MapPin, Filter } from 'lucide-react';
import { Property, Equipment, AccessNotes, GeoLocation, MapPin as MapPinType } from './types';
import { LocationMap } from './LocationMap';
import { ClientDropdown } from '../client/ClientDropdown';
import { getTemplatesByPropertyType, getTemplateById } from './accessNotesTemplates';
import { equipmentCategories, getEquipmentStatus, getCategoryInfo, calculateNextServiceDue, filterEquipmentByCategory } from './equipmentUtils';

interface PropertyFormProps {
  property?: Property;
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const PropertyForm = ({
  property,
  isOpen,
  onClose,
  onSave,
}: PropertyFormProps) => {
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
    geoLocation: {
      latitude: 0,
      longitude: 0,
    } as GeoLocation,
    propertyType: 'residential' as 'residential' | 'commercial' | 'industrial',
    accessNotes: {
      specialInstructions: '',
      gateCode: '',
      emergencyContact: {
        name: '',
        phone: '',
      },
      bestTimeToAccess: '',
      parkingInstructions: '',
    } as AccessNotes,
    linkedEquipment: [] as Equipment[],
    photos: [] as string[],
    mapPins: [] as MapPinType[],
    isActive: true,
  });

  const [newEquipment, setNewEquipment] = useState({
    name: '',
    category: 'other' as 'hvac' | 'plumbing' | 'electrical' | 'security' | 'appliance' | 'landscaping' | 'other',
    brand: '',
    model: '',
    serialNumber: '',
    lastServiceDate: '',
    nextServiceDue: '',
    serviceInterval: 365,
    notes: '',
  });

  const [equipmentCategoryFilter, setEquipmentCategoryFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (property) {
      setFormData({
        clientId: property.clientId,
        name: property.name,
        address: property.address,
        geoLocation: property.geoLocation || { latitude: 0, longitude: 0 },
        propertyType: property.propertyType,
        accessNotes: property.accessNotes,
        linkedEquipment: property.linkedEquipment,
        photos: property.photos,
        mapPins: property.mapPins || [],
        isActive: property.isActive,
      });
    } else {
      // Reset form for new property
      setFormData({
        clientId: '',
        name: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
        },
        geoLocation: { latitude: 0, longitude: 0 },
        propertyType: 'residential',
        accessNotes: {
          specialInstructions: '',
          gateCode: '',
          emergencyContact: { name: '', phone: '' },
          bestTimeToAccess: '',
          parkingInstructions: '',
        },
        linkedEquipment: [],
        photos: [],
        mapPins: [],
        isActive: true,
      });
    }
  }, [property, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addEquipment = () => {
    if (newEquipment.name.trim()) {
      // Auto-calculate next service due if last service date is provided
      const nextServiceDue = newEquipment.lastServiceDate 
        ? calculateNextServiceDue(newEquipment.lastServiceDate, newEquipment.serviceInterval)
        : newEquipment.nextServiceDue;
      
      const equipment: Equipment = {
        id: Date.now().toString(),
        ...newEquipment,
        nextServiceDue,
        installDate: '',
        warrantyExpiry: '',
      };
      setFormData(prev => ({
        ...prev,
        linkedEquipment: [...prev.linkedEquipment, equipment],
      }));
      setNewEquipment({
        name: '',
        category: 'other' as 'hvac' | 'plumbing' | 'electrical' | 'security' | 'appliance' | 'landscaping' | 'other',
        brand: '',
        model: '',
        serialNumber: '',
        lastServiceDate: '',
        nextServiceDue: '',
        serviceInterval: 365,
        notes: '',
      });
    }
  };

  const applyAccessNotesTemplate = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        accessNotes: {
          ...prev.accessNotes,
          ...template.template
        }
      }));
    }
  };

  const filteredEquipment = filterEquipmentByCategory(formData.linkedEquipment, equipmentCategoryFilter);
  const availableTemplates = getTemplatesByPropertyType(formData.propertyType);

  const removeEquipment = (equipmentId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedEquipment: prev.linkedEquipment.filter(eq => eq.id !== equipmentId),
    }));
  };

  const getLocationFromAddress = async () => {
    const { street, city, state, zipCode, country } = formData.address;
    
    if (!street || !city || !state) {
      setLocationError('Please fill in the property address first (street, city, state).');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    try {
      const addressString = `${street}, ${city}, ${state} ${zipCode}, ${country}`;
      
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      if (data.length > 0) {
        const location = data[0];
        setFormData(prev => ({
          ...prev,
          geoLocation: {
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
          },
        }));
        setIsGettingLocation(false);
        setLocationError(null);
      } else {
        setLocationError('Address not found. Please check the address or set coordinates manually.');
        setIsGettingLocation(false);
      }
    } catch (error) {
      setLocationError('Unable to find address coordinates. Please set location manually.');
      setIsGettingLocation(false);
      console.error('Geocoding error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {property ? 'Edit Property' : 'Add New Property'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client *
              </label>
              <ClientDropdown
                value={formData.clientId}
                onChange={(clientId: string) => setFormData(prev => ({ ...prev, clientId }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type *
            </label>
            <select
              value={formData.propertyType}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                propertyType: e.target.value as 'residential' | 'commercial' | 'industrial'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>

          {/* Service Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Service Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  required
                  value={formData.address.country}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, country: e.target.value, state: '' } // Reset state when country changes
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Country</option>
                  <option value="USA">United States</option>
                  <option value="CAN">Canada</option>
                  <option value="GBR">United Kingdom</option>
                  <option value="AUS">Australia</option>
                  <option value="DEU">Germany</option>
                  <option value="FRA">France</option>
                  <option value="ITA">Italy</option>
                  <option value="ESP">Spain</option>
                  <option value="NLD">Netherlands</option>
                  <option value="BEL">Belgium</option>
                  <option value="CHE">Switzerland</option>
                  <option value="AUT">Austria</option>
                  <option value="SWE">Sweden</option>
                  <option value="NOR">Norway</option>
                  <option value="DNK">Denmark</option>
                  <option value="FIN">Finland</option>
                  <option value="POL">Poland</option>
                  <option value="CZE">Czech Republic</option>
                  <option value="HUN">Hungary</option>
                  <option value="PRT">Portugal</option>
                  <option value="GRC">Greece</option>
                  <option value="IRL">Ireland</option>
                  <option value="JPN">Japan</option>
                  <option value="KOR">South Korea</option>
                  <option value="CHN">China</option>
                  <option value="IND">India</option>
                  <option value="SGP">Singapore</option>
                  <option value="HKG">Hong Kong</option>
                  <option value="TWN">Taiwan</option>
                  <option value="THA">Thailand</option>
                  <option value="MYS">Malaysia</option>
                  <option value="IDN">Indonesia</option>
                  <option value="PHL">Philippines</option>
                  <option value="VNM">Vietnam</option>
                  <option value="NZL">New Zealand</option>
                  <option value="ZAF">South Africa</option>
                  <option value="EGY">Egypt</option>
                  <option value="MAR">Morocco</option>
                  <option value="KEN">Kenya</option>
                  <option value="NGA">Nigeria</option>
                  <option value="BRA">Brazil</option>
                  <option value="ARG">Argentina</option>
                  <option value="CHL">Chile</option>
                  <option value="COL">Colombia</option>
                  <option value="PER">Peru</option>
                  <option value="MEX">Mexico</option>
                  <option value="VEN">Venezuela</option>
                  <option value="URY">Uruguay</option>
                  <option value="ECU">Ecuador</option>
                  <option value="BOL">Bolivia</option>
                  <option value="PRY">Paraguay</option>
                  <option value="RUS">Russia</option>
                  <option value="UKR">Ukraine</option>
                  <option value="BLR">Belarus</option>
                  <option value="KAZ">Kazakhstan</option>
                  <option value="UZB">Uzbekistan</option>
                  <option value="TUR">Turkey</option>
                  <option value="SAU">Saudi Arabia</option>
                  <option value="ARE">United Arab Emirates</option>
                  <option value="QAT">Qatar</option>
                  <option value="KWT">Kuwait</option>
                  <option value="BHR">Bahrain</option>
                  <option value="OMN">Oman</option>
                  <option value="JOR">Jordan</option>
                  <option value="LBN">Lebanon</option>
                  <option value="ISR">Israel</option>
                  <option value="IRN">Iran</option>
                  <option value="IRQ">Iraq</option>
                  <option value="AFG">Afghanistan</option>
                  <option value="PAK">Pakistan</option>
                  <option value="BGD">Bangladesh</option>
                  <option value="LKA">Sri Lanka</option>
                  <option value="NPL">Nepal</option>
                  <option value="BTN">Bhutan</option>
                  <option value="MDV">Maldives</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province *
                </label>
                <select
                  required
                  value={formData.address.state}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!formData.address.country}
                >
                  <option value="">Select State/Province</option>
                  {formData.address.country === 'USA' && (
                    <>
                      <option value="AL">Alabama</option>
                      <option value="AK">Alaska</option>
                      <option value="AZ">Arizona</option>
                      <option value="AR">Arkansas</option>
                      <option value="CA">California</option>
                      <option value="CO">Colorado</option>
                      <option value="CT">Connecticut</option>
                      <option value="DE">Delaware</option>
                      <option value="FL">Florida</option>
                      <option value="GA">Georgia</option>
                      <option value="HI">Hawaii</option>
                      <option value="ID">Idaho</option>
                      <option value="IL">Illinois</option>
                      <option value="IN">Indiana</option>
                      <option value="IA">Iowa</option>
                      <option value="KS">Kansas</option>
                      <option value="KY">Kentucky</option>
                      <option value="LA">Louisiana</option>
                      <option value="ME">Maine</option>
                      <option value="MD">Maryland</option>
                      <option value="MA">Massachusetts</option>
                      <option value="MI">Michigan</option>
                      <option value="MN">Minnesota</option>
                      <option value="MS">Mississippi</option>
                      <option value="MO">Missouri</option>
                      <option value="MT">Montana</option>
                      <option value="NE">Nebraska</option>
                      <option value="NV">Nevada</option>
                      <option value="NH">New Hampshire</option>
                      <option value="NJ">New Jersey</option>
                      <option value="NM">New Mexico</option>
                      <option value="NY">New York</option>
                      <option value="NC">North Carolina</option>
                      <option value="ND">North Dakota</option>
                      <option value="OH">Ohio</option>
                      <option value="OK">Oklahoma</option>
                      <option value="OR">Oregon</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="RI">Rhode Island</option>
                      <option value="SC">South Carolina</option>
                      <option value="SD">South Dakota</option>
                      <option value="TN">Tennessee</option>
                      <option value="TX">Texas</option>
                      <option value="UT">Utah</option>
                      <option value="VT">Vermont</option>
                      <option value="VA">Virginia</option>
                      <option value="WA">Washington</option>
                      <option value="WV">West Virginia</option>
                      <option value="WI">Wisconsin</option>
                      <option value="WY">Wyoming</option>
                      <option value="DC">District of Columbia</option>
                    </>
                  )}
                  {formData.address.country === 'CAN' && (
                    <>
                      <option value="AB">Alberta</option>
                      <option value="BC">British Columbia</option>
                      <option value="MB">Manitoba</option>
                      <option value="NB">New Brunswick</option>
                      <option value="NL">Newfoundland and Labrador</option>
                      <option value="NS">Nova Scotia</option>
                      <option value="ON">Ontario</option>
                      <option value="PE">Prince Edward Island</option>
                      <option value="QC">Quebec</option>
                      <option value="SK">Saskatchewan</option>
                      <option value="NT">Northwest Territories</option>
                      <option value="NU">Nunavut</option>
                      <option value="YT">Yukon</option>
                    </>
                  )}
                  {formData.address.country === 'GBR' && (
                    <>
                      <option value="ENG">England</option>
                      <option value="SCT">Scotland</option>
                      <option value="WLS">Wales</option>
                      <option value="NIR">Northern Ireland</option>
                    </>
                  )}
                  {formData.address.country === 'AUS' && (
                    <>
                      <option value="NSW">New South Wales</option>
                      <option value="VIC">Victoria</option>
                      <option value="QLD">Queensland</option>
                      <option value="WA">Western Australia</option>
                      <option value="SA">South Australia</option>
                      <option value="TAS">Tasmania</option>
                      <option value="ACT">Australian Capital Territory</option>
                      <option value="NT">Northern Territory</option>
                    </>
                  )}
                  {formData.address.country === 'DEU' && (
                    <>
                      <option value="BW">Baden-Württemberg</option>
                      <option value="BY">Bavaria</option>
                      <option value="BE">Berlin</option>
                      <option value="BB">Brandenburg</option>
                      <option value="HB">Bremen</option>
                      <option value="HH">Hamburg</option>
                      <option value="HE">Hesse</option>
                      <option value="MV">Mecklenburg-Vorpommern</option>
                      <option value="NI">Lower Saxony</option>
                      <option value="NW">North Rhine-Westphalia</option>
                      <option value="RP">Rhineland-Palatinate</option>
                      <option value="SL">Saarland</option>
                      <option value="SN">Saxony</option>
                      <option value="ST">Saxony-Anhalt</option>
                      <option value="SH">Schleswig-Holstein</option>
                      <option value="TH">Thuringia</option>
                    </>
                  )}
                  {!['USA', 'CAN', 'GBR', 'AUS', 'DEU'].includes(formData.address.country) && formData.address.country && (
                    <option value="N/A">Not Applicable</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, zipCode: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address.street}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Geo Location */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Geo Location</h3>
              <button
                type="button"
                onClick={getLocationFromAddress}
                disabled={isGettingLocation}
                className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-md ${
                  isGettingLocation 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <MapPin className={`w-4 h-4 ${isGettingLocation ? 'animate-pulse' : ''}`} />
                <span>{isGettingLocation ? 'Finding Address...' : 'Find Address Location'}</span>
              </button>
            </div>
            
            {/* Location Error */}
            {locationError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700">{locationError}</p>
              </div>
            )}
            
            {/* Interactive Map */}
            <div className="mb-4">
              <LocationMap
                latitude={formData.geoLocation?.latitude || 0}
                longitude={formData.geoLocation?.longitude || 0}
                onLocationChange={(lat: number, lng: number) => {
                  setFormData(prev => ({
                    ...prev,
                    geoLocation: {
                      ...prev.geoLocation,
                      latitude: lat,
                      longitude: lng
                    }
                  }));
                }}
                mapPins={formData.mapPins}
                onPinsChange={(pins: MapPinType[]) => {
                  setFormData(prev => ({
                    ...prev,
                    mapPins: pins
                  }));
                }}
                height="400px"
              />
            </div>
            
            {/* Combined Coordinate Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coordinates (Latitude, Longitude)
              </label>
              <input
                type="text"
                value={formData.geoLocation?.latitude !== 0 && formData.geoLocation?.longitude !== 0 
                  ? `${formData.geoLocation.latitude.toFixed(6)}, ${formData.geoLocation.longitude.toFixed(6)}` 
                  : ''}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  if (value === '') {
                    // Clear coordinates
                    setFormData(prev => ({
                      ...prev,
                      geoLocation: {
                        ...prev.geoLocation,
                        latitude: 0,
                        longitude: 0
                      }
                    }));
                    return;
                  }
                  
                  const coords = value.split(',').map(coord => coord.trim());
                  if (coords.length === 2) {
                    const lat = parseFloat(coords[0]);
                    const lng = parseFloat(coords[1]);
                    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                      setFormData(prev => ({
                        ...prev,
                        geoLocation: {
                          ...prev.geoLocation,
                          latitude: lat,
                          longitude: lng
                        }
                      }));
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="40.712800, -74.006000 (click map or use Find Address Location)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter coordinates as: latitude, longitude (e.g., 40.7128, -74.0060)
              </p>
            </div>
          </div>

          {/* Access Notes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Access Notes</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    setSelectedTemplate(e.target.value);
                    if (e.target.value) {
                      applyAccessNotesTemplate(e.target.value);
                    }
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Template</option>
                  {availableTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gate Code
                </label>
                <input
                  type="text"
                  value={formData.accessNotes.gateCode || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    accessNotes: { ...prev.accessNotes, gateCode: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Best Time to Access
                </label>
                <select
                  value={formData.accessNotes.bestTimeToAccess || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    accessNotes: { ...prev.accessNotes, bestTimeToAccess: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Time</option>
                  <option value="Early Morning (6AM-9AM)">Early Morning (6AM-9AM)</option>
                  <option value="Morning (9AM-12PM)">Morning (9AM-12PM)</option>
                  <option value="Afternoon (12PM-5PM)">Afternoon (12PM-5PM)</option>
                  <option value="Evening (5PM-8PM)">Evening (5PM-8PM)</option>
                  <option value="Weekdays Only">Weekdays Only</option>
                  <option value="Weekends Only">Weekends Only</option>
                  <option value="Business Hours">Business Hours</option>
                  <option value="After Hours">After Hours</option>
                  <option value="Anytime">Anytime</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={formData.accessNotes.emergencyContact?.name || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    accessNotes: {
                      ...prev.accessNotes,
                      emergencyContact: {
                        ...prev.accessNotes.emergencyContact,
                        name: e.target.value,
                        phone: prev.accessNotes.emergencyContact?.phone || ''
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.accessNotes.emergencyContact?.phone || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    accessNotes: {
                      ...prev.accessNotes,
                      emergencyContact: {
                        name: prev.accessNotes.emergencyContact?.name || '',
                        phone: e.target.value
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parking Instructions
                </label>
                <textarea
                  value={formData.accessNotes.parkingInstructions || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    accessNotes: { ...prev.accessNotes, parkingInstructions: e.target.value }
                  }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Notes *
                </label>
                <textarea
                  required
                  value={formData.accessNotes.specialInstructions}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    accessNotes: { ...prev.accessNotes, specialInstructions: e.target.value }
                  }))}
                  rows={4}
                  placeholder="Include key location, access instructions, security codes, and any special notes for technicians..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Linked Equipment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Linked Equipment</h3>
            
            {/* Equipment Category Filter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={equipmentCategoryFilter}
                  onChange={(e) => setEquipmentCategoryFilter(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {equipmentCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add New Equipment - MVP Essentials */}
            <div className="bg-gray-50 p-4 rounded-md space-y-3">
              <h4 className="font-medium text-gray-700">Add Equipment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Main AC Unit, Water Heater"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                  <select
                    value={newEquipment.category}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {equipmentCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Brand/Model</label>
                  <input
                    type="text"
                    placeholder="e.g., Carrier 24ABC6"
                    value={`${newEquipment.brand} ${newEquipment.model}`.trim()}
                    onChange={(e) => {
                      const parts = e.target.value.split(' ');
                      const brand = parts[0] || '';
                      const model = parts.slice(1).join(' ') || '';
                      setNewEquipment(prev => ({ ...prev, brand, model }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Service Date</label>
                  <input
                    type="date"
                    value={newEquipment.lastServiceDate}
                    onChange={(e) => {
                      const lastServiceDate = e.target.value;
                      const nextServiceDue = lastServiceDate 
                        ? calculateNextServiceDue(lastServiceDate, newEquipment.serviceInterval)
                        : '';
                      setNewEquipment(prev => ({ 
                        ...prev, 
                        lastServiceDate,
                        nextServiceDue
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addEquipment}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Equipment</span>
                </button>
              </div>
            </div>

            {/* Equipment List */}
            {formData.linkedEquipment.length > 0 && (
              <div className="space-y-2">
                {filteredEquipment.map((equipment) => {
                  const categoryInfo = getCategoryInfo(equipment.category);
                  const statusInfo = getEquipmentStatus(equipment);
                  
                  return (
                    <div key={equipment.id} className="p-4 bg-white border border-gray-200 rounded-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                              {categoryInfo.icon} {categoryInfo.name}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="font-medium text-lg">{equipment.name}</div>
                          <div className="text-sm text-gray-600 mb-2">
                            {equipment.brand && equipment.model 
                              ? `${equipment.brand} ${equipment.model}`
                              : equipment.brand || equipment.model || 'No brand/model specified'
                            }
                            {equipment.serialNumber && ` • SN: ${equipment.serialNumber}`}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                            {equipment.installDate && (
                              <div>
                                <span className="font-medium">Installed:</span> {new Date(equipment.installDate).toLocaleDateString()}
                              </div>
                            )}
                            {equipment.warrantyExpiry && (
                              <div>
                                <span className="font-medium">Warranty:</span> {new Date(equipment.warrantyExpiry).toLocaleDateString()}
                              </div>
                            )}
                            {equipment.lastServiceDate && (
                              <div>
                                <span className="font-medium">Last Service:</span> {new Date(equipment.lastServiceDate).toLocaleDateString()}
                              </div>
                            )}
                            {equipment.nextServiceDue && (
                              <div>
                                <span className="font-medium">Next Service:</span> {new Date(equipment.nextServiceDue).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {equipment.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {equipment.notes}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEquipment(equipment.id)}
                          className="text-red-600 hover:text-red-800 ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {formData.linkedEquipment.length > 0 && filteredEquipment.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No equipment found in the selected category.
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Property is active
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {property ? 'Update Property' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
