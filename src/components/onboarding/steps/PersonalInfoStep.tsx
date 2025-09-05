import { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, Upload } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { validateEmail, validatePassword, validateRequired, validatePhone } from '../../../utils/validation';

export const PersonalInfoStep = () => {
  const { state, dispatch } = useOnboarding();
  const { personalInfo } = state.data;
  const { showValidationErrors } = state;

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof personalInfo, value: string) => {
    dispatch({
      type: 'SET_PERSONAL_INFO',
      payload: { ...personalInfo, [field]: value },
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(personalInfo.name)) {
      newErrors.name = 'Name is required';
    }
    if (!validateEmail(personalInfo.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!validatePassword(personalInfo.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!validatePhone(personalInfo.phone)) {
      newErrors.phone = 'Valid phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (showValidationErrors) {
      validateStep();
    }
  }, [personalInfo, showValidationErrors]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Let's start with your basic details</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Full Name
          </label>
          <input
            type="text"
            value={personalInfo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:bg-white hover:shadow-sm ${
              showValidationErrors && errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="Enter your full name"
          />
          {showValidationErrors && errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline w-4 h-4 mr-2" />
            Email Address
          </label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:bg-white hover:shadow-sm ${
              showValidationErrors && errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="Enter your email"
          />
          {showValidationErrors && errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline w-4 h-4 mr-2" />
            Password
          </label>
          <input
            type="password"
            value={personalInfo.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:bg-white hover:shadow-sm ${
              showValidationErrors && errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="Create a secure password"
          />
          {showValidationErrors && errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:bg-white hover:shadow-sm ${
              showValidationErrors && errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="Enter your phone number"
          />
          {showValidationErrors && errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Upload className="inline w-4 h-4 mr-2" />
            Profile Picture (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
            <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
            <p className="mt-2 text-sm text-gray-600 group-hover:text-blue-700">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>
    </div>
  );
};