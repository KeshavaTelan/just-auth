import { RefreshQueueItem } from '../types';

/**
 * Refresh queue to ensure only one token refresh happens at a time
 * and all waiting requests get the new token
 */
export class RefreshQueue {
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
  private queue: RefreshQueueItem[] = [];
  
  /**
   * Add a request to the refresh queue
   * @param refreshFn Function that performs the actual token refresh
   * @returns Promise that resolves with the new access token
   */
  async add(refreshFn: () => Promise<string>): Promise<string> {
    // If we're already refreshing, add to queue and wait
    if (this.isRefreshing && this.refreshPromise) {
      return new Promise<string>((resolve, reject) => {
        this.queue.push({ resolve, reject });
      });
    }
    
    // Start refreshing
    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh(refreshFn);
    
    try {
      const newToken = await this.refreshPromise;
      this.processQueue(newToken);
      return newToken;
    } catch (error) {
      this.processQueueError(error as Error);
      throw error;
    } finally {
      this.reset();
    }
  }
  
  /**
   * Perform the actual token refresh
   */
  private async performRefresh(refreshFn: () => Promise<string>): Promise<string> {
    try {
      return await refreshFn();
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Process the queue with the new token
   */
  private processQueue(newToken: string): void {
    this.queue.forEach(({ resolve }) => resolve(newToken));
  }
  
  /**
   * Process the queue with an error
   */
  private processQueueError(error: Error): void {
    this.queue.forEach(({ reject }) => reject(error));
  }
  
  /**
   * Reset the queue state
   */
  private reset(): void {
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.queue = [];
  }
  
  /**
   * Check if currently refreshing
   */
  get isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }
}

/**
 * Default refresh queue instance
 */
export const refreshQueue = new RefreshQueue();
