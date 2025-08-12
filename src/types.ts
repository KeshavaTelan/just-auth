/**
 * User object interface
 */
export interface User {
  id: string | number;
  email?: string;
  name?: string;
  [key: string]: any;
}

/**
 * Authentication response from login/refresh endpoints
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn?: number;
}

/**
 * Storage strategy interface for token management
 */
export interface StorageStrategy {
  /**
   * Get a value from storage
   */
  get(key: string): string | null;
  
  /**
   * Set a value in storage
   */
  set(key: string, value: string): void;
  
  /**
   * Remove a value from storage
   */
  clear(key: string): void;
}

/**
 * Configuration for the AuthProvider
 */
export interface AuthConfig {
  /**
   * URL endpoint for user login
   */
  loginUrl: string;
  
  /**
   * URL endpoint for token refresh
   */
  refreshUrl: string;
  
  /**
   * Storage strategy for tokens (defaults to localStorage)
   */
  storageStrategy?: StorageStrategy;
  
  /**
   * Optional callback when authentication errors occur
   */
  onAuthError?: (error: Error) => void;
  
  /**
   * Optional base URL for API requests
   */
  baseUrl?: string;
  
  /**
   * Optional timeout for requests (in milliseconds)
   */
  timeout?: number;
}

/**
 * Login payload interface
 */
export interface LoginPayload {
  [key: string]: any;
}

/**
 * Authentication context value
 */
export interface AuthContextValue {
  /**
   * Current authenticated user
   */
  user: User | null;
  
  /**
   * Whether user is currently authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * Loading state for auth operations
   */
  loading: boolean;
  
  /**
   * Current error state
   */
  error: Error | null;
  
  /**
   * Login function
   */
  login: (payload: LoginPayload) => Promise<void>;
  
  /**
   * Logout function
   */
  logout: () => void;
  
  /**
   * Get current access token
   */
  getAccessToken: () => string | null;
}

/**
 * Token refresh queue item
 */
export interface RefreshQueueItem {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}
