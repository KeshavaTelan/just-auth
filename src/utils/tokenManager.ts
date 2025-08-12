import { StorageStrategy } from '../types';

/**
 * Default localStorage implementation of StorageStrategy
 */
export const defaultStorageStrategy: StorageStrategy = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  
  set: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  
  clear: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
};

/**
 * Token manager for handling access and refresh tokens
 */
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  
  private storageStrategy: StorageStrategy;
  
  constructor(storageStrategy: StorageStrategy = defaultStorageStrategy) {
    this.storageStrategy = storageStrategy;
  }
  
  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.storageStrategy.get(TokenManager.ACCESS_TOKEN_KEY);
  }
  
  /**
   * Get the current refresh token
   */
  getRefreshToken(): string | null {
    return this.storageStrategy.get(TokenManager.REFRESH_TOKEN_KEY);
  }
  
  /**
   * Set both access and refresh tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.storageStrategy.set(TokenManager.ACCESS_TOKEN_KEY, accessToken);
    this.storageStrategy.set(TokenManager.REFRESH_TOKEN_KEY, refreshToken);
  }
  
  /**
   * Set only the access token (useful after refresh)
   */
  setAccessToken(accessToken: string): void {
    this.storageStrategy.set(TokenManager.ACCESS_TOKEN_KEY, accessToken);
  }
  
  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.storageStrategy.clear(TokenManager.ACCESS_TOKEN_KEY);
    this.storageStrategy.clear(TokenManager.REFRESH_TOKEN_KEY);
  }
  
  /**
   * Check if user has valid tokens (basic check - doesn't validate expiry)
   */
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}

/**
 * Default token manager instance
 */
export const tokenManager = new TokenManager();
