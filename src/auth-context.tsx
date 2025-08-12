import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthConfig, AuthContextValue, User, LoginPayload, AuthResponse } from './types';
import { TokenManager, defaultStorageStrategy } from './utils/tokenManager';
import { RefreshQueue } from './utils/refreshQueue';
import { ApiClient } from './client/apiClient';

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Props for the AuthProvider component
 */
export interface AuthProviderProps extends AuthConfig {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * 
 * Provides authentication context to the React component tree
 * 
 * @example
 * ```tsx
 * import { AuthProvider } from 'just-auth';
 * 
 * function App() {
 *   return (
 *     <AuthProvider
 *       loginUrl="/api/auth/login"
 *       refreshUrl="/api/auth/refresh"
 *       onAuthError={(error) => console.error('Auth error:', error)}
 *     >
 *       <YourApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  loginUrl,
  refreshUrl,
  storageStrategy = defaultStorageStrategy,
  onAuthError,
  baseUrl = '',
  timeout = 10000,
}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize managers
  const [tokenManager] = useState(() => new TokenManager(storageStrategy));
  const [refreshQueue] = useState(() => new RefreshQueue());
  const [apiClient] = useState(() => new ApiClient(
    baseUrl,
    refreshUrl,
    tokenManager,
    refreshQueue,
    timeout,
    onAuthError
  ));
  
  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check if we have tokens
        if (tokenManager.hasTokens()) {
          // Try to get user info or validate token
          // This could be a separate endpoint like /api/auth/me
          // For now, we'll assume tokens are valid if they exist
          // In a real implementation, you might want to validate the token
          setUser({ id: 'user', email: 'user@example.com' }); // Placeholder
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        tokenManager.clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [tokenManager]);
  
  /**
   * Login function
   */
  const login = async (payload: LoginPayload): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post<AuthResponse>(loginUrl, payload);
      const { accessToken, refreshToken, user: userData } = response.data;
      
      // Store tokens
      tokenManager.setTokens(accessToken, refreshToken);
      
      // Set user data
      setUser(userData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Login failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Logout function
   */
  const logout = (): void => {
    tokenManager.clearTokens();
    setUser(null);
    setError(null);
  };
  
  /**
   * Get current access token
   */
  const getAccessToken = (): string | null => {
    return tokenManager.getAccessToken();
  };
  
  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user && !!tokenManager.getAccessToken();
  
  const contextValue: AuthContextValue = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    getAccessToken,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context
 * 
 * @throws Error if used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * import { useAuth } from 'just-auth';
 * 
 * function LoginComponent() {
 *   const { login, loading, error } = useAuth();
 *   
 *   const handleLogin = async () => {
 *     try {
 *       await login({ email: 'user@example.com', password: 'password' });
 *     } catch (error) {
 *       console.error('Login failed:', error);
 *     }
 *   };
 *   
 *   return (
 *     <button onClick={handleLogin} disabled={loading}>
 *       {loading ? 'Logging in...' : 'Login'}
 *     </button>
 *   );
 * }
 * ```
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
