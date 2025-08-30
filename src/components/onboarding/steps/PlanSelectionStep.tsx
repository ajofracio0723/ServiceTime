import React from 'react';
import { Check, Star } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { Plan } from '../../../types';

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: [
      'Up to 3 technicians',
      'Basic job scheduling',
      'Customer management',
      'Mobile app access',
      'Email support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    recommended: true,
    features: [
      'Up to 10 technicians',
      'Advanced scheduling & routing',
      'Invoice & payment processing',
      'Customer portal',
      'Analytics & reporting',
      'Priority support',
      'Inventory management',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    features: [
      'Unlimited technicians',
      'Multi-location support',
      'Advanced integrations',
      'Custom workflows',
      'Dedicated account manager',
      'Advanced analytics',
      'API access',
      'Custom branding',
    ],
  },
];

export const PlanSelectionStep = () => {
  const { state, dispatch } = useOnboarding();
  const { selectedPlan, businessCategory } = state.data;

  const handlePlanSelect = (plan: Plan) => {
    dispatch({
      type: 'SET_SELECTED_PLAN',
      payload: plan,
    });
  };

  const getRecommendedPlan = () => {
    const { technicianCount } = businessCategory;
    if (technicianCount <= 3) return 'starter';
    if (technicianCount <= 10) return 'professional';
    return 'enterprise';
  };

  const recommendedPlanId = getRecommendedPlan();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Select the plan that best fits your business needs</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          const isRecommended = plan.id === recommendedPlanId;
          
          return (
            <div
              key={plan.id}
              className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              {(plan.recommended || isRecommended) && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Recommended
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-gray-900">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex justify-center">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {businessCategory.technicianCount > 3 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Smart Recommendation:</strong> Based on your team size of {businessCategory.technicianCount} technicians, 
            we recommend the {recommendedPlanId === 'professional' ? 'Professional' : 'Enterprise'} plan for optimal features and support.
          </p>
        </div>
      )}
    </div>
  );
};