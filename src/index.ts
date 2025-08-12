/**
 * @fileoverview Main entry point for the authentication package
 * 
 * This package provides React components and hooks for authentication
 * with automatic token refresh and request interception.
 */

// Main components and hooks
export { AuthProvider, useAuth } from './auth-context';

// Types
export type {
  User,
  AuthResponse,
  StorageStrategy,
  AuthConfig,
  LoginPayload,
  AuthContextValue,
  RefreshQueueItem,
} from './types';

// Utilities
export { TokenManager, defaultStorageStrategy } from './utils/tokenManager';
export { RefreshQueue } from './utils/refreshQueue';
export { ApiClient } from './client/apiClient';

// Hook (alternative export path)
export { useAuth as useAuthHook } from './hooks/useAuth';
