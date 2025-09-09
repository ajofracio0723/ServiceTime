import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MapPin, Phone, Mail } from 'lucide-react';
import { VisitFormData, Visit } from './types';
import { generateTimeSlots, formatTime, addMinutesToTime, isTimeSlotAvailable } from './calendarUtils';

interface VisitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (visitData: VisitFormData) => void;
  visit?: Visit;
  selectedDate?: string;
  selectedTime?: string;
  visits: Visit[];
}

const mockClients = [
  { id: '1', name: 'John Smith', phone: '(555) 123-4567', email: 'john.smith@email.com' },
  { id: '2', name: 'Sarah Johnson', phone: '(555) 234-5678', email: 'sarah.j@email.com' },
  { id: '3', name: 'Mike Wilson', phone: '(555) 345-6789', email: 'mike.w@email.com' }
];

const mockProperties = [
  { id: '1', address: '123 Main St, Anytown, ST 12345', clientId: '1' },
  { id: '2', address: '456 Oak Ave, Somewhere, ST 67890', clientId: '2' },
  { id: '3', address: '789 Pine Rd, Elsewhere, ST 11111', clientId: '3' }
];

const mockTechnicians = [
  { id: '1', name: 'Mike Johnson' },
  { id: '2', name: 'David Wilson' },
  { id: '3', name: 'Lisa Brown' }
];

export const VisitForm: React.FC<VisitFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  visit,
  selectedDate,
  selectedTime,
  visits
}) => {
  const [formData, setFormData] = useState<VisitFormData>({
    clientId: '',
    clientName: '',
    propertyId: '',
    propertyAddress: '',
    scheduledDate: selectedDate || new Date().toISOString().split('T')[0],
    scheduledTime: selectedTime || '09:00',
    estimatedDuration: 120,
    visitType: 'maintenance',
    priority: 'medium',
    technicianId: '',
    technician: '',
    notes: '',
    contactPhone: '',
    contactEmail: ''
  });

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visit) {
      setFormData({
        clientId: visit.clientId,
        clientName: visit.clientName,
        propertyId: visit.propertyId,
        propertyAddress: visit.propertyAddress,
        scheduledDate: visit.scheduledDate,
        scheduledTime: visit.scheduledTime,
        estimatedDuration: visit.estimatedDuration,
        visitType: visit.visitType,
        priority: visit.priority,
        technicianId: visit.technicianId,
        technician: visit.technician,
        notes: visit.notes,
        contactPhone: visit.contactPhone,
        contactEmail: visit.contactEmail
      });
    }
  }, [visit]);

  useEffect(() => {
    if (formData.scheduledDate && formData.estimatedDuration) {
      const allSlots = generateTimeSlots();
      const available = allSlots.filter(slot => 
        isTimeSlotAvailable(
          formData.scheduledDate, 
          slot, 
          formData.estimatedDuration, 
          visits,
          visit?.id
        )
      );
      setAvailableTimeSlots(available);
    }
  }, [formData.scheduledDate, formData.estimatedDuration, visits, visit?.id]);

  const handleInputChange = (field: keyof VisitFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-populate client info when client is selected
    if (field === 'clientId') {
      const client = mockClients.find(c => c.id === value);
      if (client) {
        setFormData(prev => ({
          ...prev,
          clientName: client.name,
          contactPhone: client.phone,
          contactEmail: client.email,
          propertyId: '',
          propertyAddress: ''
        }));
      }
    }

    // Auto-populate property info when property is selected
    if (field === 'propertyId') {
      const property = mockProperties.find(p => p.id === value);
      if (property) {
        setFormData(prev => ({
          ...prev,
          propertyAddress: property.address
        }));
      }
    }

    // Auto-populate technician name when technician is selected
    if (field === 'technicianId') {
      const technician = mockTechnicians.find(t => t.id === value);
      if (technician) {
        setFormData(prev => ({
          ...prev,
          technician: technician.name
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) newErrors.clientId = 'Client is required';
    if (!formData.propertyId) newErrors.propertyId = 'Property is required';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Date is required';
    if (!formData.scheduledTime) newErrors.scheduledTime = 'Time is required';
    if (!formData.technicianId) newErrors.technicianId = 'Technician is required';
    if (formData.estimatedDuration < 30) newErrors.estimatedDuration = 'Duration must be at least 30 minutes';

    // Check if selected time slot is available
    if (formData.scheduledDate && formData.scheduledTime && formData.estimatedDuration) {
      if (!isTimeSlotAvailable(
        formData.scheduledDate,
        formData.scheduledTime,
        formData.estimatedDuration,
        visits,
        visit?.id
      )) {
        newErrors.scheduledTime = 'Selected time slot is not available';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const filteredProperties = mockProperties.filter(p => p.clientId === formData.clientId);
  const endTime = addMinutesToTime(formData.scheduledTime, formData.estimatedDuration);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {visit ? 'Edit Visit' : 'Schedule New Visit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Client *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.clientId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a client</option>
                {mockClients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
              {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Property *
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => handleInputChange('propertyId', e.target.value)}
                disabled={!formData.clientId}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.propertyId ? 'border-red-300' : 'border-gray-300'
                } ${!formData.clientId ? 'bg-gray-100' : ''}`}
              >
                <option value="">Select a property</option>
                {filteredProperties.map(property => (
                  <option key={property.id} value={property.id}>{property.address}</option>
                ))}
              </select>
              {errors.propertyId && <p className="text-red-500 text-sm mt-1">{errors.propertyId}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="client@email.com"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.scheduledDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.scheduledDate && <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Start Time *
              </label>
              <select
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.scheduledTime ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select time</option>
                {availableTimeSlots.map(slot => (
                  <option key={slot} value={slot}>{formatTime(slot)}</option>
                ))}
              </select>
              {errors.scheduledTime && <p className="text-red-500 text-sm mt-1">{errors.scheduledTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <select
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.estimatedDuration ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
                <option value={240}>4 hours</option>
              </select>
              {errors.estimatedDuration && <p className="text-red-500 text-sm mt-1">{errors.estimatedDuration}</p>}
            </div>
          </div>

          {/* Time Summary */}
          {formData.scheduledTime && formData.estimatedDuration && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center text-blue-800">
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-medium">
                  Scheduled: {formatTime(formData.scheduledTime)} - {formatTime(endTime)}
                </span>
              </div>
            </div>
          )}

          {/* Visit Details */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visit Type *
              </label>
              <select
                value={formData.visitType}
                onChange={(e) => handleInputChange('visitType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technician *
              </label>
              <select
                value={formData.technicianId}
                onChange={(e) => handleInputChange('technicianId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.technicianId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select technician</option>
                {mockTechnicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </select>
              {errors.technicianId && <p className="text-red-500 text-sm mt-1">{errors.technicianId}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes or special instructions..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {visit ? 'Update Visit' : 'Schedule Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
