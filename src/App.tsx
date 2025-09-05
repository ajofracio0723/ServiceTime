import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { OnboardingProvider, useOnboarding } from "./context/OnboardingContext";
import { LoginPage } from "./components/auth/LoginPage";
import { OnboardingStepper } from "./components/onboarding/OnboardingStepper";
import { Dashboard } from "./components/dashboard/Dashboard";

const AppContent = () => {
  const { state: authState, login, signup } = useAuth();
  const { state: onboardingState, dispatch } = useOnboarding();

  // Mark onboarding as complete for existing users (not new users)
  useEffect(() => {
    if (authState.isAuthenticated && !authState.isNewUser && !onboardingState.isComplete) {
      dispatch({ type: "COMPLETE_ONBOARDING" });
    }
  }, [authState.isAuthenticated, authState.isNewUser, onboardingState.isComplete, dispatch]);

  const handleSignUp = async () => {
    // Reset onboarding state when starting signup
    dispatch({ type: "RESET" });

    // Start signup flow
    try {
      await signup();
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  // Show login page if not authenticated
  if (!authState.isAuthenticated) {
    return <LoginPage onLogin={login} onSignUp={handleSignUp} />;
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
        <AppContent />
      </OnboardingProvider>
    </AuthProvider>
  );
}

export default App;
