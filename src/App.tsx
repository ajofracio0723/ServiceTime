import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { OnboardingProvider, useOnboarding } from "./context/OnboardingContext";
import { NotificationProvider } from "./context/NotificationContext";
import { LoginPage } from "./components/auth/LoginPage";
import { SignupPage } from "./components/auth/SignupPage";
import { OnboardingStepper } from "./components/onboarding/OnboardingStepper";
import { Dashboard } from "./components/dashboard/Dashboard";

const AppContent = () => {
  const { state: authState } = useAuth();
  const { state: onboardingState, dispatch } = useOnboarding();
  const [showSignup, setShowSignup] = useState(false);

  // Mark onboarding as complete for existing users (not new users)
  useEffect(() => {
    if (authState.isAuthenticated && !authState.isNewUser && !onboardingState.isComplete) {
      dispatch({ type: "COMPLETE_ONBOARDING" });
    }
  }, [authState.isAuthenticated, authState.isNewUser, onboardingState.isComplete, dispatch]);

  // Show login or signup page if not authenticated
  if (!authState.isAuthenticated) {
    if (showSignup) {
      return <SignupPage onLogin={() => setShowSignup(false)} />;
    } else {
      return <LoginPage onSignUp={() => setShowSignup(true)} />;
    }
  }

  // Show onboarding if authenticated and is a new user (from signup) or onboarding not completed
  if (authState.isNewUser || !onboardingState.isComplete) {
    return <OnboardingStepper />;
  }

  // Show dashboard if authenticated, not a new user, and onboarding complete
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}

export default App;
