import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { authApi } from "../services/authApi";

interface User {
  id: string;
  account_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface Account {
  id: string;
  name: string;
  business_type?: string;
  subscription_plan: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  account: Account | null;
  isLoading: boolean;
  isNewUser: boolean;
  otpSent: boolean;
  otpEmail: string;
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "OTP_SENT"; payload: { email: string } }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; account: Account; isNewUser: boolean } }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "INIT_AUTH" };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  account: null,
  isLoading: false,
  isNewUser: false,
  otpSent: false,
  otpEmail: '',
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, otpSent: false };
    case "OTP_SENT":
      return { ...state, isLoading: false, otpSent: true, otpEmail: action.payload.email };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        account: action.payload.account,
        isNewUser: action.payload.isNewUser,
        isLoading: false,
        otpSent: false,
        otpEmail: '',
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        account: null,
        isLoading: false,
        otpSent: false,
        otpEmail: '',
      };
    case "LOGOUT":
      return initialState;
    case "INIT_AUTH":
      const user = authApi.getCurrentUser();
      const account = authApi.getCurrentAccount();
      return {
        ...state,
        isAuthenticated: authApi.isAuthenticated(),
        user,
        account,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<{
  state: AuthState;
  sendLoginOTP: (email: string) => Promise<{ success: boolean; message: string }>;
  sendSignupOTP: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyLoginOTP: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  completeSignup: (email: string, otp: string, signupData: any) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
} | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    dispatch({ type: "INIT_AUTH" });
  }, []);

  const sendLoginOTP = async (email: string) => {
    dispatch({ type: "LOGIN_START" });
    
    try {
      const result = await authApi.sendLoginOTP(email);
      
      if (result.success) {
        dispatch({ type: "OTP_SENT", payload: { email } });
      } else {
        dispatch({ type: "LOGIN_FAILURE" });
      }
      
      return result;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      return { success: false, message: 'Network error occurred' };
    }
  };

  const sendSignupOTP = async (email: string) => {
    dispatch({ type: "LOGIN_START" });
    
    try {
      const result = await authApi.sendSignupOTP(email);
      
      if (result.success) {
        dispatch({ type: "OTP_SENT", payload: { email } });
      } else {
        dispatch({ type: "LOGIN_FAILURE" });
      }
      
      return result;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      return { success: false, message: 'Network error occurred' };
    }
  };

  const verifyLoginOTP = async (email: string, otp: string) => {
    dispatch({ type: "LOGIN_START" });
    
    try {
      const result = await authApi.verifyLoginOTP(email, otp);
      
      if (result.success && result.user && result.account) {
        dispatch({ 
          type: "LOGIN_SUCCESS", 
          payload: { 
            user: result.user, 
            account: result.account, 
            isNewUser: false 
          } 
        });
      } else {
        dispatch({ type: "LOGIN_FAILURE" });
      }
      
      return result;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      return { success: false, message: 'Network error occurred' };
    }
  };

  const completeSignup = async (email: string, otp: string, signupData: any) => {
    dispatch({ type: "LOGIN_START" });
    
    try {
      const result = await authApi.completeSignup(email, otp, signupData);
      
      if (result.success && result.user && result.account) {
        dispatch({ 
          type: "LOGIN_SUCCESS", 
          payload: { 
            user: result.user, 
            account: result.account, 
            isNewUser: true 
          } 
        });
      } else {
        dispatch({ type: "LOGIN_FAILURE" });
      }
      
      return result;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      return { success: false, message: 'Network error occurred' };
    }
  };

  const logout = () => {
    authApi.logout();
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      sendLoginOTP, 
      sendSignupOTP, 
      verifyLoginOTP, 
      completeSignup, 
      logout 
    }}>
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
