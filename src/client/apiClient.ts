import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse } from '../types';
import { TokenManager } from '../utils/tokenManager';
import { RefreshQueue } from '../utils/refreshQueue';

/**
 * API Client with automatic token management and refresh
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;
  private refreshQueue: RefreshQueue;
  private refreshUrl: string;
  private onAuthError?: (error: Error) => void;
  
  constructor(
    baseURL: string = '',
    refreshUrl: string,
    tokenManager: TokenManager,
    refreshQueue: RefreshQueue,
    timeout: number = 10000,
    onAuthError?: (error: Error) => void
  ) {
    this.refreshUrl = refreshUrl;
    this.tokenManager = tokenManager;
    this.refreshQueue = refreshQueue;
    this.onAuthError = onAuthError;
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor to add auth header
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.tokenManager.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );
    
    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: any) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't already tried to refresh
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          this.tokenManager.getRefreshToken()
        ) {
          originalRequest._retry = true;
          
          try {
            // Use refresh queue to handle concurrent requests
            const newToken = await this.refreshQueue.add(() => this.refreshToken());
            
            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Retry the original request
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and notify
            this.tokenManager.clearTokens();
            const authError = new Error('Authentication failed. Please login again.');
            
            if (this.onAuthError) {
              this.onAuthError(authError);
            }
            
            return Promise.reject(authError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Refresh the access token using the refresh token
   */
  private async refreshToken(): Promise<string> {
    const refreshToken = this.tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await axios.post<AuthResponse>(this.refreshUrl, {
        refreshToken,
      });
      
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Update tokens
      if (newRefreshToken) {
        this.tokenManager.setTokens(accessToken, newRefreshToken);
      } else {
        this.tokenManager.setAccessToken(accessToken);
      }
      
      return accessToken;
    } catch (error) {
      // Clear tokens on refresh failure
      this.tokenManager.clearTokens();
      throw new Error('Failed to refresh token');
    }
  }
  
  /**
   * Make a GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }
  
  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }
  
  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }
  
  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }
  
  /**
   * Make a PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }
  
  /**
   * Get the underlying axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}
