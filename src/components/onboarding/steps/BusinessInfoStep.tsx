import React, { useState, useEffect } from 'react';
import { Building2, Phone, Mail, Upload } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { validateEmail, validateRequired, validatePhone } from '../../../utils/validation';

export const BusinessInfoStep = () => {
  const { state, dispatch } = useOnboarding();
  const { businessInfo } = state.data;

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof businessInfo, value: string) => {
    dispatch({
      type: 'SET_BUSINESS_INFO',
      payload: { ...businessInfo, [field]: value },
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(businessInfo.businessName)) {
      newErrors.businessName = 'Business name is required';
    }
    if (!validatePhone(businessInfo.businessPhone)) {
      newErrors.businessPhone = 'Valid business phone is required';
    }
    if (!validateEmail(businessInfo.businessEmail)) {
      newErrors.businessEmail = 'Valid business email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validateStep();
  }, [businessInfo]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
        <p className="text-gray-600">Tell us about your service business</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="inline w-4 h-4 mr-2" />
            Business Name
          </label>
          <input
            type="text"
            value={businessInfo.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.businessName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Your Business Name"
          />
          {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Business Phone
          </label>
          <input
            type="tel"
            value={businessInfo.businessPhone}
            onChange={(e) => handleChange('businessPhone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.businessPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Business phone number"
          />
          {errors.businessPhone && <p className="text-red-500 text-sm mt-1">{errors.businessPhone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline w-4 h-4 mr-2" />
            Business Email
          </label>
          <input
            type="email"
            value={businessInfo.businessEmail}
            onChange={(e) => handleChange('businessEmail', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.businessEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Business email address"
          />
          {errors.businessEmail && <p className="text-red-500 text-sm mt-1">{errors.businessEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Upload className="inline w-4 h-4 mr-2" />
            Business Logo (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Upload your business logo</p>
            <p className="text-xs text-gray-500">PNG, JPG, SVG up to 5MB</p>
          </div>
        </div>
      </div>
    </div>
  );
};