import { User, Building2, Wrench, CreditCard, Check } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';

export const ReviewStep = () => {
  const { state, dispatch } = useOnboarding();
  const { personalInfo, businessInfo, businessCategory, selectedPlan } = state.data;

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  const serviceTypeLabels: Record<string, string> = {
    plumbing: 'Plumbing Services',
    electrical: 'Electrical Services',
    hvac: 'HVAC Services',
    landscaping: 'Landscaping',
    cleaning: 'Cleaning Services',
    roofing: 'Roofing Services',
    painting: 'Painting Services',
    handyman: 'Handyman Services',
    'pest-control': 'Pest Control',
    locksmith: 'Locksmith Services',
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Complete</h2>
        <p className="text-gray-600">Please review your information before completing setup</p>
      </div>

      <div className="space-y-6">
        {/* Personal Info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{personalInfo.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 font-medium">{personalInfo.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2 font-medium">{personalInfo.phone}</span>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Business Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Business Name:</span>
              <span className="ml-2 font-medium">{businessInfo.businessName}</span>
            </div>
            <div>
              <span className="text-gray-600">Business Email:</span>
              <span className="ml-2 font-medium">{businessInfo.businessEmail}</span>
            </div>
            <div>
              <span className="text-gray-600">Business Phone:</span>
              <span className="ml-2 font-medium">{businessInfo.businessPhone}</span>
            </div>
          </div>
        </div>

        {/* Business Category */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Wrench className="w-5 h-5 mr-2" />
            Business Category
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Service Type:</span>
              <span className="ml-2 font-medium">{serviceTypeLabels[businessCategory.serviceType]}</span>
            </div>
            <div>
              <span className="text-gray-600">Team Size:</span>
              <span className="ml-2 font-medium">{businessCategory.technicianCount} technician{businessCategory.technicianCount > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Selected Plan */}
        {selectedPlan && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Selected Plan
            </h3>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-lg font-bold text-gray-900">{selectedPlan.name}</span>
                <div className="text-2xl font-bold text-blue-600">
                  ${selectedPlan.price}/month
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {selectedPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center mb-3">
          <Check className="w-6 h-6 text-green-600 mr-3" />
          <h3 className="text-lg font-semibold text-green-900">Ready to Get Started!</h3>
        </div>
        <p className="text-green-800 text-sm mb-4">
          Your ServiceTime account is configured and ready. Click complete to access your dashboard and start managing your service business.
        </p>
        <button
          onClick={handleComplete}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Complete Setup & Access Dashboard
        </button>
      </div>
    </div>
  );
};