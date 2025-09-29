import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface SignupPageProps {
  onLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onLogin }) => {
  const { state, sendSignupOTP, completeSignup } = useAuth();
  const [step, setStep] = useState<"email" | "details" | "otp">("email");
  const [error, setError] = useState("");
  
  // Form data
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [otp, setOtp] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError("");
    try {
      const result = await sendSignupOTP(email);
      if (result.success) {
        setStep("details");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !accountName) {
      setError("Please fill in all required fields.");
      return;
    }
    setStep("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setError("");
    try {
      const result = await completeSignup(email, otp, {
        email,
        first_name: firstName,
        last_name: lastName,
        account_name: accountName,
        business_type: businessType
      });
      
      if (!result.success) {
        setError(result.message);
      }
      // If successful, AuthContext will handle navigation
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    setError("");
    try {
      const result = await sendSignupOTP(email);
      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 mb-4 flex items-center justify-center">
              <img
                src="/LOGO.png"
                alt="ServiceTime Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {step === "email" && "Create Account"}
              {step === "details" && "Account Details"}
              {step === "otp" && "Verify Email"}
            </h2>
            <p className="text-gray-600 mt-2">
              {step === "email" && "Enter your email to get started"}
              {step === "details" && "Tell us about your business"}
              {step === "otp" && `We sent a 6-digit code to ${email}`}
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Signup Form */}
          <form 
            onSubmit={
              step === "email" ? handleEmailSubmit :
              step === "details" ? handleDetailsSubmit :
              handleOtpSubmit
            } 
            className="space-y-6"
          >
            {step === "email" && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            )}

            {step === "details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    id="accountName"
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Acme Services LLC"
                  />
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Select business type</option>
                    <option value="hvac">HVAC</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="maintenance">General Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {step === "otp" && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                />
                <div className="mt-3 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={state.isLoading}
                    className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
              </div>
            )}

            {step === "otp" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>OTP Sent:</strong> Please check your email for the verification code.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={state.isLoading || (
                step === "email" ? !email :
                step === "details" ? (!firstName || !lastName || !accountName) :
                otp.length !== 6
              )}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {state.isLoading ? "Processing..." : (
                step === "email" ? "Continue" :
                step === "details" ? "Send Verification Code" :
                "Create Account"
              )}
            </button>

            {step === 'email' && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Already have an account?
                  </p>
                  <button
                    type="button"
                    onClick={onLogin}
                    className="w-full bg-white text-indigo-600 border border-indigo-300 py-2 px-4 rounded-lg font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Sign In Instead
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 ServiceTime. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
