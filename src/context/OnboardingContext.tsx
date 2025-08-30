import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { OnboardingData, PersonalInfo, BusinessInfo, BusinessCategory, Plan } from '../types';

interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
  isComplete: boolean;
}

type OnboardingAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PERSONAL_INFO'; payload: PersonalInfo }
  | { type: 'SET_BUSINESS_INFO'; payload: BusinessInfo }
  | { type: 'SET_BUSINESS_CATEGORY'; payload: BusinessCategory }
  | { type: 'SET_SELECTED_PLAN'; payload: Plan }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET' };

const initialState: OnboardingState = {
  currentStep: 1,
  data: {
    personalInfo: {
      name: '',
      email: '',
      password: '',
      phone: '',
    },
    businessInfo: {
      businessName: '',
      businessPhone: '',
      businessEmail: '',
    },
    businessCategory: {
      serviceType: '',
      technicianCount: 1,
    },
    selectedPlan: null,
  },
  isComplete: false,
};

const onboardingReducer = (state: OnboardingState, action: OnboardingAction): OnboardingState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_PERSONAL_INFO':
      return {
        ...state,
        data: { ...state.data, personalInfo: action.payload },
      };
    case 'SET_BUSINESS_INFO':
      return {
        ...state,
        data: { ...state.data, businessInfo: action.payload },
      };
    case 'SET_BUSINESS_CATEGORY':
      return {
        ...state,
        data: { ...state.data, businessCategory: action.payload },
      };
    case 'SET_SELECTED_PLAN':
      return {
        ...state,
        data: { ...state.data, selectedPlan: action.payload },
      };
    case 'COMPLETE_ONBOARDING':
      return { ...state, isComplete: true };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const OnboardingContext = createContext<{
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
} | null>(null);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  return (
    <OnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};