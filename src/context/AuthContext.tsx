import { createContext, useContext, useReducer, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  isNewUser: boolean;
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; isNewUser: boolean } }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  isNewUser: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        isNewUser: action.payload.isNewUser,
        isLoading: false,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
      };
    case "LOGOUT":
      return initialState;
    default:
      return state;
  }
};

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string) => Promise<void>;
  signup: () => Promise<void>;
  logout: () => void;
} | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string) => {
    dispatch({ type: "LOGIN_START" });

    try {
      // Simulate passwordless login - send magic link via email
      // In a real implementation, this would send an email with a secure login link
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Longer delay to simulate email sending

      // Mock successful passwordless login - always succeeds for prototype
      const user: User = {
        id: "1",
        email,
        name: email.split("@")[0], // Use email prefix as name for demo
      };

      // Set isNewUser to false so existing users go directly to dashboard
      dispatch({ type: "LOGIN_SUCCESS", payload: { user, isNewUser: false } });
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      throw error;
    }
  };

  const signup = async () => {
    dispatch({ type: "LOGIN_START" });

    try {
      // Simulate API call for signup - replace with actual signup logic
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful signup - create new user
      const user: User = {
        id: "2",
        email: "newuser@example.com",
        name: "New User",
      };

      dispatch({ type: "LOGIN_SUCCESS", payload: { user, isNewUser: true } });
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
