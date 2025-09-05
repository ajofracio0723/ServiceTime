import { useState } from "react";

interface LoginPageProps {
  onLogin: (email: string) => void;
  onSignUp: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // Simulate sending OTP
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep("otp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    try {
      await onLogin(email);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      // Simulate resending OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
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
              {step === "email" ? "Welcome Back" : "Verify Your Email"}
            </h2>
            <p className="text-gray-600 mt-2">
              {step === "email" 
                ? "Enter your email to receive a verification code"
                : `We sent a 6-digit code to ${email}`
              }
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={step === "email" ? handleEmailSubmit : handleOtpSubmit} className="space-y-6">
            {step === "email" ? (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
            ) : (
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                    onClick={() => setStep("email")}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
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
                      <strong>OTP Verification:</strong> We'll send a 6-digit code to your email for secure access.
                    </p>
                  </div>
                </div>
              </div>
            )}


            <button
              type="submit"
              disabled={isLoading || (step === "email" ? !email : otp.length !== 6)}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading 
                ? (step === "email" ? "Sending Code..." : "Verifying...")
                : (step === "email" ? "Continue" : "Verify & Sign In")
              }
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
                    Don't have an account? Create one now.
                  </p>
                  <button
                    type="button"
                    onClick={onSignUp}
                    className="w-full bg-white text-indigo-600 border border-indigo-300 py-2 px-4 rounded-lg font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Create New Account
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
