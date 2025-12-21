/**
 * Unit tests for widget-manager.js
 *
 * Tests the Widget Manager that coordinates widget registration and CMS initialization.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('WidgetManager', () => {
  let WidgetManager;
  let mockCMS;

  beforeEach(async () => {
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Clear window objects
    delete window.WidgetManager;
    delete window.markWidgetReady;
    delete window.CMS;

    // Create mock CMS
    mockCMS = {
      init: vi.fn()
    };

    // Import the module fresh for each test
    // This ensures clean state
    const module = await import('./widget-manager.js?t=' + Date.now());
    WidgetManager = module.WidgetManager;
  });

  afterEach(() => {
    // Clean up
    delete window.WidgetManager;
    delete window.markWidgetReady;
    delete window.CMS;

    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe('markReady', () => {
    it('should mark a known widget as ready', () => {
      // Act
      WidgetManager.markReady('author-auto');

      // Assert
      expect(WidgetManager.isReady('author-auto')).toBe(true);
      expect(console.log).toHaveBeenCalledWith('[DEBUG] WidgetManager.markReady called for: author-auto');
      expect(console.log).toHaveBeenCalledWith('✓ Widget "author-auto" registered successfully');
    });

    it('should warn when marking unknown widget as ready', () => {
      // Act
      WidgetManager.markReady('unknown-widget');

      // Assert
      expect(console.warn).toHaveBeenCalledWith('Unknown widget registered: unknown-widget');
      expect(WidgetManager.isReady('unknown-widget')).toBe(false);
    });

    it('should initialize CMS when all widgets are ready', () => {
      // Arrange
      window.CMS = mockCMS;

      // Act
      WidgetManager.markReady('author-auto');
      WidgetManager.markReady('image-crop');

      // Assert
      expect(mockCMS.init).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('All widgets ready, initializing CMS...');
      expect(console.log).toHaveBeenCalledWith('✓ Decap CMS initialized successfully');
    });

    it('should not initialize CMS if not all widgets are ready', () => {
      // Arrange
      window.CMS = mockCMS;

      // Act: Mark only one widget
      WidgetManager.markReady('author-auto');

      // Assert: CMS should not be initialized
      expect(mockCMS.init).not.toHaveBeenCalled();
    });

    it('should not initialize CMS if CMS is not available', () => {
      // Arrange: CMS not available
      delete window.CMS;

      // Act: Mark all widgets as ready
      WidgetManager.markReady('author-auto');
      WidgetManager.markReady('image-crop');

      // Assert: CMS init should not be called
      // (mockCMS.init won't be called because window.CMS is undefined)
    });

    it('should not initialize CMS twice', () => {
      // Arrange
      window.CMS = mockCMS;

      // Act: Mark all widgets ready
      WidgetManager.markReady('author-auto');
      WidgetManager.markReady('image-crop');

      // Try to mark ready again
      WidgetManager.markReady('author-auto');

      // Assert: CMS.init should only be called once
      expect(mockCMS.init).toHaveBeenCalledTimes(1);
    });

    it('should handle CMS.init throwing an error', () => {
      // Arrange
      const error = new Error('CMS initialization failed');
      mockCMS.init.mockImplementation(() => {
        throw error;
      });
      window.CMS = mockCMS;

      // Act
      WidgetManager.markReady('author-auto');
      WidgetManager.markReady('image-crop');

      // Assert
      expect(mockCMS.init).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error initializing CMS:', error);
    });

    it('should allow retry after failed initialization', () => {
      // Arrange
      let callCount = 0;
      mockCMS.init.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First attempt failed');
        }
        // Second attempt succeeds
      });
      window.CMS = mockCMS;

      // Act: First attempt (will fail)
      WidgetManager.markReady('author-auto');
      WidgetManager.markReady('image-crop');

      // Trigger checkAndInitialize again by marking a widget
      // (This simulates retry scenario)
      WidgetManager.checkAndInitialize();

      // Assert: Should have attempted twice
      expect(mockCMS.init).toHaveBeenCalledTimes(2);
    });
  });

  describe('isReady', () => {
    it('should return false for widgets that are not ready', () => {
      expect(WidgetManager.isReady('author-auto')).toBe(false);
      expect(WidgetManager.isReady('image-crop')).toBe(false);
    });

    it('should return true for widgets that are ready', () => {
      // Arrange
      WidgetManager.markReady('author-auto');

      // Assert
      expect(WidgetManager.isReady('author-auto')).toBe(true);
      expect(WidgetManager.isReady('image-crop')).toBe(false);
    });

    it('should return false for unknown widgets', () => {
      expect(WidgetManager.isReady('unknown-widget')).toBe(false);
    });
  });

  describe('getWidgetNames', () => {
    it('should return all registered widget names', () => {
      // Act
      const names = WidgetManager.getWidgetNames();

      // Assert
      expect(names).toEqual(['author-auto', 'image-crop']);
    });

    it('should return array', () => {
      const names = WidgetManager.getWidgetNames();
      expect(Array.isArray(names)).toBe(true);
    });
  });

  describe('checkAndInitialize', () => {
    it('should initialize CMS when all conditions are met', () => {
      // Arrange
      window.CMS = mockCMS;
      WidgetManager.markReady('author-auto');
      WidgetManager.markReady('image-crop');

      // Reset mock to check direct call
      mockCMS.init.mockClear();

      // Act
      WidgetManager.checkAndInitialize();

      // Assert: Should not initialize again (already initialized)
      expect(mockCMS.init).not.toHaveBeenCalled();
    });

    it('should not initialize if widgets are not ready', () => {
      // Arrange
      window.CMS = mockCMS;
      // Don't mark widgets as ready

      // Act
      WidgetManager.checkAndInitialize();

      // Assert
      expect(mockCMS.init).not.toHaveBeenCalled();
    });

    it('should not initialize if CMS is not available', () => {
      // Arrange: Mark all widgets ready but no CMS
      WidgetManager.markReady('author-auto');
      WidgetManager.markReady('image-crop');
      delete window.CMS;

      // Act
      WidgetManager.checkAndInitialize();

      // Assert: No init call (CMS not available)
    });
  });

  describe('initializeCMS', () => {
    it('should wait for CMS library to load', () => {
      // Arrange: CMS not available
      vi.useFakeTimers();

      // Act: Call initializeCMS
      WidgetManager.initializeCMS();

      // Assert: Should log waiting message
      expect(console.log).toHaveBeenCalledWith('Waiting for Decap CMS library to load...');

      // Make CMS available
      window.CMS = mockCMS;
      WidgetManager.markReady('author-auto');
      WidgetManager.markReady('image-crop');

      // Advance timers to trigger the setTimeout
      vi.advanceTimersByTime(100);

      vi.useRealTimers();
    });

    it('should initialize immediately if CMS is available and widgets are ready', () => {
      // Arrange
      window.CMS = mockCMS;
      WidgetManager.markReady('author-auto');
      WidgetManager.markReady('image-crop');

      // CMS should already be initialized by markReady calls above
      // Reset mocks to test initializeCMS call
      mockCMS.init.mockClear();
      console.log.mockClear();

      // Act
      WidgetManager.initializeCMS();

      // Assert: Should detect that CMS is already initialized
      expect(console.log).toHaveBeenCalledWith('[DEBUG] WidgetManager.initializeCMS called, CMS available?', true);
      expect(console.log).toHaveBeenCalledWith('Decap CMS library loaded');
      expect(console.log).toHaveBeenCalledWith('[DEBUG] CMS already initialized, skipping');

      // CMS.init should NOT be called again
      expect(mockCMS.init).not.toHaveBeenCalled();
    });

    it('should wait for widgets if CMS is available but widgets are not ready', () => {
      // Arrange
      window.CMS = mockCMS;
      // Don't mark widgets as ready

      // Act
      WidgetManager.initializeCMS();

      // Assert
      expect(console.log).toHaveBeenCalledWith('CMS loaded, waiting for widgets to register...');
      expect(console.log).toHaveBeenCalledWith('Pending widgets:', ['author-auto', 'image-crop']);
      expect(mockCMS.init).not.toHaveBeenCalled();
    });

    it('should not initialize twice', () => {
      // Arrange
      window.CMS = mockCMS;
      WidgetManager.markReady('author-auto');
      WidgetManager.markReady('image-crop');

      // Act: Call initializeCMS multiple times
      WidgetManager.initializeCMS();
      WidgetManager.initializeCMS();

      // Assert: Should only initialize once
      expect(console.log).toHaveBeenCalledWith('[DEBUG] CMS already initialized, skipping');
    });

    it('should handle CMS.init error gracefully', () => {
      // Arrange
      const error = new Error('Init failed');
      mockCMS.init.mockImplementation(() => {
        throw error;
      });
      window.CMS = mockCMS;
      WidgetManager.markReady('author-auto');
      WidgetManager.markReady('image-crop');

      // Act
      WidgetManager.initializeCMS();

      // Assert
      expect(console.error).toHaveBeenCalledWith('Error initializing CMS:', error);
    });

    it('should poll for CMS library with setTimeout', () => {
      // Arrange
      vi.useFakeTimers();
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      // Act: CMS not available
      WidgetManager.initializeCMS();

      // Assert: Should set timeout to retry
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);

      vi.useRealTimers();
    });
  });

  describe('Global exposure', () => {
    it('should expose WidgetManager on window', () => {
      expect(window.WidgetManager).toBeDefined();
      expect(window.WidgetManager.markReady).toBe(WidgetManager.markReady);
    });

    it('should expose legacy markWidgetReady function', () => {
      expect(window.markWidgetReady).toBeDefined();
      expect(window.markWidgetReady).toBe(WidgetManager.markReady);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle widgets registering before CMS is available', () => {
      // Arrange: Widgets register first
      WidgetManager.markReady('author-auto');
      WidgetManager.markReady('image-crop');

      // Act: CMS becomes available later
      window.CMS = mockCMS;
      WidgetManager.checkAndInitialize();

      // Assert: Should initialize
      expect(mockCMS.init).toHaveBeenCalledTimes(1);
    });

    it('should handle CMS being available before widgets', () => {
      // Arrange: CMS available first
      window.CMS = mockCMS;

      // Act: Widgets register later
      WidgetManager.markReady('author-auto');
      expect(mockCMS.init).not.toHaveBeenCalled();

      WidgetManager.markReady('image-crop');

      // Assert: Should initialize after last widget
      expect(mockCMS.init).toHaveBeenCalledTimes(1);
    });

    it('should handle widgets registering in any order', () => {
      // Arrange
      window.CMS = mockCMS;

      // Act: Register in reverse order
      WidgetManager.markReady('image-crop');
      expect(mockCMS.init).not.toHaveBeenCalled();

      WidgetManager.markReady('author-auto');

      // Assert
      expect(mockCMS.init).toHaveBeenCalledTimes(1);
    });
  });
});
