import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { BusinessInfoStep } from './steps/BusinessInfoStep';
import { BusinessCategoryStep } from './steps/BusinessCategoryStep';
import { PlanSelectionStep } from './steps/PlanSelectionStep';
import { ReviewStep } from './steps/ReviewStep';

const steps = [
  { number: 1, title: 'Personal Info', component: PersonalInfoStep },
  { number: 2, title: 'Business Info', component: BusinessInfoStep },
  { number: 3, title: 'Business Category', component: BusinessCategoryStep },
  { number: 4, title: 'Plan Selection', component: PlanSelectionStep },
  { number: 5, title: 'Review', component: ReviewStep },
];

export const OnboardingStepper = () => {
  const { state, dispatch } = useOnboarding();
  const { currentStep, data } = state;

  const currentStepIndex = currentStep - 1;
  const CurrentStepComponent = steps[currentStepIndex].component;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.personalInfo.name && data.personalInfo.email && 
               data.personalInfo.password && data.personalInfo.phone;
      case 2:
        return data.businessInfo.businessName && data.businessInfo.businessPhone && 
               data.businessInfo.businessEmail;
      case 3:
        return data.businessCategory.serviceType && data.businessCategory.technicianCount;
      case 4:
        return data.selectedPlan !== null;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      dispatch({ type: 'SET_STEP', payload: currentStep + 1 });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      dispatch({ type: 'SET_STEP', payload: currentStep - 1 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to ServiceTime
            </h1>
            <p className="text-gray-600">Let's set up your service business management platform</p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step.number
                        ? 'bg-blue-600 text-white'
                        : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  <div className="ml-3 mr-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`} style={{ minWidth: '2rem' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <CurrentStepComponent />
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  canProceed()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};