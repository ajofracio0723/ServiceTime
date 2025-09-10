import { useEffect, useState } from 'react';
import { Check, Star, ChevronDown } from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { Plan } from '../../../types';

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 59,
    features: [
      '1 user included (extra users $15/mo each)',
      'Client & job management (basic CRM)',
      'Calendar & scheduling (drag-and-drop, recurring jobs)',
      'Quotes, invoices, and payments',
      'Email & SMS reminders (pay-per-use messaging)',
      'Mobile app (offline-capable basics)',
      'Voice-to-Job Logging (AI converts dictated notes into structured job records)',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 119,
    recommended: true,
    features: [
      'Everything in Starter',
      'Up to 5 users included',
      'Advanced scheduling (dispatch board, assignments, recurring jobs)',
      'Automated recurring billing & payments',
      'Customer portal (book jobs, pay invoices)',
      'QuickBooks & Xero integration',
      'Expense & time tracking',
      'Priority email + chat support',
      'Basic reporting (revenue by job, tech utilization)',
      'Workload Heatmaps (visualize demand hotspots on a city map)',
      'Customer Feedback Insights (AI monitors reviews & surveys, flags churn risk)',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 229,
    features: [
      'Everything in Pro',
      'Up to 15 users included (extra seats $20/mo each)',
      'GPS fleet tracking + live route optimization',
      'Inventory & equipment tracking',
      'Custom job forms & digital checklists',
      'White-labeled customer portal',
      'Role-based permissions (dispatcher, tech, admin)',
      'Advanced analytics (profitability, efficiency, revenue forecasting)',
      'API + webhook access',
      'Phone + chat support SLA',
      'AI Smart Dispatcher (auto-assigns jobs by skill, traffic, and availability)',
      'Profit Simulator (real-time profitability projection before scheduling a job)',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    customPricing: true,
    features: [
      'Everything in Business',
      'Unlimited users (tiered per-seat pricing after 50)',
      'Enterprise integrations (Salesforce, NetSuite, SAP, MS Dynamics)',
      'Single Sign-On (Okta, Azure AD, Google Workspace)',
      'SOC 2-ready audit logs & compliance vault',
      'Multi-location / franchise dashboards',
      'Predictive Analytics (AI forecasting for staffing, churn, seasonal demand)',
      'Green Fleet Insights (CO2 tracking & optimization for eco-friendly bids)',
      'Dedicated account manager',
      'Custom onboarding & training',
      'SLA-backed 24/7 support',
    ],
  },
];

export const PlanSelectionStep = () => {
  const { state, dispatch } = useOnboarding();
  const { selectedPlan, businessCategory } = state.data;
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const LS_KEY = 'onboarding.selectedPlan';

  const handlePlanSelect = (plan: Plan) => {
    dispatch({
      type: 'SET_SELECTED_PLAN',
      payload: plan,
    });
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(plan));
    } catch {}
  };

  // Initialize selection from localStorage if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const stored: Plan = JSON.parse(raw);
        if (!selectedPlan || stored.id !== selectedPlan.id) {
          dispatch({ type: 'SET_SELECTED_PLAN', payload: stored });
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRecommendedPlan = () => {
    const { technicianCount } = businessCategory;
    if (technicianCount <= 1) return 'starter';
    if (technicianCount <= 5) return 'pro';
    if (technicianCount <= 15) return 'business';
    return 'enterprise';
  };

  const recommendedPlanId = getRecommendedPlan();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Select the plan that best fits your business needs</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          const isRecommended = plan.id === recommendedPlanId;
          
          return (
            <div
              key={plan.id}
              className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              {(plan.recommended || isRecommended) && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Recommended
                  </span>
                </div>
              )}

              <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="text-2xl font-bold text-gray-900">
                  ${plan.price}
                  <span className="text-xs font-normal text-gray-600 block">
                    {plan.customPricing ? '+ custom pricing' : '/month'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">Key Features:</p>
                <div className="space-y-1">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-start text-xs text-gray-700 animate-fadeIn">
                      <Check className="w-3 h-3 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{feature}</span>
                    </div>
                  ))}
                  
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedPlan === plan.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="space-y-1 pt-1">
                      {plan.features.slice(3).map((feature, index) => (
                        <div key={index + 3} className="flex items-start text-xs text-gray-700 animate-slideIn">
                          <Check className="w-3 h-3 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {plan.features.length > 3 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedPlan(expandedPlan === plan.id ? null : plan.id);
                      }}
                      className="text-xs text-blue-600 font-medium hover:text-blue-800 flex items-center mt-1 transition-all duration-200 hover:scale-105"
                    >
                      <div className={`transition-transform duration-200 ${expandedPlan === plan.id ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-3 h-3 mr-1" />
                      </div>
                      {expandedPlan === plan.id ? 'Show less' : `+${plan.features.length - 3} more features`}
                    </button>
                  )}
                </div>
              </div>

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
            we recommend the {recommendedPlanId === 'pro' ? 'Pro' : recommendedPlanId === 'business' ? 'Business' : 'Enterprise'} plan for optimal features and support.
          </p>
        </div>
      )}
    </div>
  );
};