/**
 * Version Service
 * Handles automatic version checking and cache clearing
 * for seamless updates on restricted devices (iPads, tablets)
 */

import { APP_VERSION, CACHE_VERSION_KEY, VERSION_CHECK_INTERVAL } from '../version';

export class VersionService {
  private checkInterval: NodeJS.Timeout | null = null;
  private isCheckingVersion = false;

  /**
   * Initialize version checking
   * Clears cache if new version detected
   */
  async initialize(): Promise<void> {
    try {
      const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
      
      if (storedVersion !== APP_VERSION) {
        console.log(`[Version] New version detected: ${storedVersion} → ${APP_VERSION}`);
        await this.clearAllCaches();
        localStorage.setItem(CACHE_VERSION_KEY, APP_VERSION);
        
        // Show update notification briefly
        this.showUpdateNotification();
      }

      // Start periodic version checks (detect server updates)
      this.startVersionChecking();
    } catch (error) {
      console.error('[Version] Initialization error:', error);
    }
  }

  /**
   * Start periodic version checking
   */
  private startVersionChecking(): void {
    // Check immediately
    this.checkForUpdates();
    
    // Then check every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, VERSION_CHECK_INTERVAL);
  }

  /**
   * Check for updates from server
   */
  private async checkForUpdates(): Promise<void> {
    if (this.isCheckingVersion) return;
    
    this.isCheckingVersion = true;
    
    try {
      // Fetch version file with cache-busting
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.version && data.version !== APP_VERSION) {
          console.log(`[Version] Server update detected: ${APP_VERSION} → ${data.version}`);
          await this.performUpdate();
        }
      }
    } catch (error) {
      // Silently fail - server might not have version.json yet
      console.debug('[Version] Check failed (expected on first deploy):', error);
    } finally {
      this.isCheckingVersion = false;
    }
  }

  /**
   * Perform complete app update
   */
  private async performUpdate(): Promise<void> {
    try {
      // Clear all caches
      await this.clearAllCaches();
      
      // Update service worker if available
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      // Show updating message
      this.showUpdateNotification('Updating to latest version...');

      // Reload page after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('[Version] Update error:', error);
    }
  }

  /**
   * Clear all browser caches
   */
  private async clearAllCaches(): Promise<void> {
    try {
      // Clear Service Worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`[Version] Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
      }

      // Clear localStorage (except user data)
      const keysToPreserve = ['ks2_user', 'ks2_settings'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToPreserve.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();

      console.log('[Version] All caches cleared successfully');
    } catch (error) {
      console.error('[Version] Cache clearing error:', error);
    }
  }

  /**
   * Show update notification to user
   */
  private showUpdateNotification(message = 'App updated! 🎉'): void {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-weight: 600;
      z-index: 10000;
      animation: slideDown 0.3s ease-out;
      font-size: 14px;
    `;
    toast.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease-in reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Force immediate cache clear and reload
   * Useful for admin/debugging
   */
  async forceUpdate(): Promise<void> {
    await this.clearAllCaches();
    window.location.reload();
  }

  /**
   * Clean up when service is destroyed
   */
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Export singleton instance
export const versionService = new VersionService();
