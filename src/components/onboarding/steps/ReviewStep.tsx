import { User, Building2, Wrench, CreditCard, Check, Mail } from 'lucide-react';
import { useState } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { useAuth } from '../../../context/AuthContext';

export const ReviewStep = () => {
  const { state, dispatch } = useOnboarding();
  const { personalInfo, businessInfo, businessCategory, selectedPlan } = state.data;
  const { sendSignupOTP, completeSignup } = useAuth();
  
  const [step, setStep] = useState<'review' | 'otp'>('review');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await sendSignupOTP(personalInfo.email);
      if (result.success) {
        setStep('otp');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSignup = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await completeSignup(personalInfo.email, otp, {
        email: personalInfo.email,
        first_name: personalInfo.name.split(' ')[0] || personalInfo.name,
        last_name: personalInfo.name.split(' ').slice(1).join(' ') || '',
        account_name: businessInfo.businessName,
        business_type: businessCategory.serviceType
      });
      
      if (result.success) {
        // Account created successfully - AuthContext will handle navigation
        dispatch({ type: 'COMPLETE_ONBOARDING' });
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

      {step === 'review' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <Check className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-green-900">Ready to Create Your Account!</h3>
          </div>
          <p className="text-green-800 text-sm mb-4">
            Your ServiceTime account is configured and ready. We'll send a verification code to <strong>{personalInfo.email}</strong> to complete your account creation.
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <button
            onClick={handleSendOTP}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? 'Sending Verification Code...' : 'Send Verification Code & Create Account'}
          </button>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <Mail className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-blue-900">Verify Your Email</h3>
          </div>
          <p className="text-blue-800 text-sm mb-4">
            We've sent a 6-digit verification code to <strong>{personalInfo.email}</strong>. Please enter it below to complete your account creation.
          </p>
          
          <div className="mb-4">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Verification Required:</strong> Please check your email for the verification code to complete your account setup.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep('review')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Review
            </button>
            <button
              onClick={handleCompleteSignup}
              disabled={isLoading || otp.length !== 6}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};