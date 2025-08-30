import React, { useState, useEffect } from 'react';
import { Wrench, Users } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { validateBusinessCategory } from '../../../utils/validation';

const serviceTypes = [
  { value: '', label: 'Select your service type' },
  { value: 'plumbing', label: 'Plumbing Services' },
  { value: 'electrical', label: 'Electrical Services' },
  { value: 'hvac', label: 'HVAC Services' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'roofing', label: 'Roofing Services' },
  { value: 'painting', label: 'Painting Services' },
  { value: 'handyman', label: 'Handyman Services' },
  { value: 'pest-control', label: 'Pest Control' },
  { value: 'locksmith', label: 'Locksmith Services' },
];

const technicianOptions = [
  { value: 1, label: 'Just me (1 technician)' },
  { value: 2, label: '2 technicians' },
  { value: 3, label: '3-5 technicians' },
  { value: 6, label: '6-10 technicians' },
  { value: 11, label: '11+ technicians' },
];

export const BusinessCategoryStep = () => {
  const { state, dispatch } = useOnboarding();
  const { businessCategory } = state.data;

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleServiceTypeChange = (serviceType: string) => {
    dispatch({
      type: 'SET_BUSINESS_CATEGORY',
      payload: { ...businessCategory, serviceType },
    });

    if (errors.serviceType) {
      setErrors(prev => ({ ...prev, serviceType: '' }));
    }
  };

  const handleTechnicianCountChange = (technicianCount: number) => {
    dispatch({
      type: 'SET_BUSINESS_CATEGORY',
      payload: { ...businessCategory, technicianCount },
    });

    if (errors.technicianCount) {
      setErrors(prev => ({ ...prev, technicianCount: '' }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (!validateBusinessCategory(businessCategory.serviceType, businessCategory.technicianCount)) {
      if (!businessCategory.serviceType) {
        newErrors.serviceType = 'Please select your service type';
      }
      if (!businessCategory.technicianCount) {
        newErrors.technicianCount = 'Please select your team size';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validateStep();
  }, [businessCategory]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Category</h2>
        <p className="text-gray-600">Help us customize ServiceTime for your business</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Wrench className="inline w-4 h-4 mr-2" />
            Service Type
          </label>
          <select
            value={businessCategory.serviceType}
            onChange={(e) => handleServiceTypeChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.serviceType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {serviceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.serviceType && <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline w-4 h-4 mr-2" />
            Team Size
          </label>
          <select
            value={businessCategory.technicianCount}
            onChange={(e) => handleTechnicianCountChange(Number(e.target.value))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.technicianCount ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {technicianOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.technicianCount && <p className="text-red-500 text-sm mt-1">{errors.technicianCount}</p>}
        </div>
      </div>
    </div>
  );
};