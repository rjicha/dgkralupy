/**
 * Integration tests for admin widget initialization flow
 *
 * Tests the complete flow of:
 * 1. Widget Manager initialization
 * 2. Waiting for dependencies (CMS, React)
 * 3. Widget registration
 * 4. CMS initialization after all widgets are ready
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

interface MockCMS {
  init: ReturnType<typeof vi.fn>;
  registerWidget: ReturnType<typeof vi.fn>;
}

interface MockReact {
  createElement: ReturnType<typeof vi.fn>;
}

describe('Admin Widget Initialization Flow', () => {
  let mockCMS: MockCMS;
  let mockReact: MockReact;
  let mockCreateReactClass: ReturnType<typeof vi.fn>;
  let WidgetManager: {
    markReady: (name: string) => void;
    isReady: (name: string) => boolean;
    initializeCMS: () => void;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let registerWidget: (name: string, factory: () => Promise<{ control: any; preview?: any }>) => Promise<void>;
  let waitForDependencies: (deps: string[], timeout?: number) => Promise<void>;

  beforeEach(async () => {
    // Mock console
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Clear window objects
    delete (window as unknown as Record<string, unknown>).CMS;
    delete (window as unknown as Record<string, unknown>).React;
    delete (window as unknown as Record<string, unknown>).createReactClass;
    delete (window as unknown as Record<string, unknown>).WidgetManager;
    delete (window as unknown as Record<string, unknown>).markWidgetReady;

    // Create fresh mocks
    mockCMS = {
      init: vi.fn(),
      registerWidget: vi.fn()
    };

    mockReact = {
      createElement: vi.fn()
    };

    mockCreateReactClass = vi.fn();

    // Reset modules to get fresh instances
    vi.resetModules();
  });

  afterEach(() => {
    // Clean up
    delete (window as unknown as Record<string, unknown>).CMS;
    delete (window as unknown as Record<string, unknown>).React;
    delete (window as unknown as Record<string, unknown>).createReactClass;
    delete (window as unknown as Record<string, unknown>).WidgetManager;
    delete (window as unknown as Record<string, unknown>).markWidgetReady;

    vi.restoreAllMocks();
  });

  it('should complete full initialization flow when all components load in sequence', async () => {
    // This test simulates the real-world scenario:
    // 1. Widget Manager loads first
    // 2. CMS library loads
    // 3. Widget files load and register
    // 4. CMS initializes

    // Step 1: Load Widget Manager
    const widgetManagerModule = await import('../../public/admin/scripts/widget-manager.js');
    WidgetManager = widgetManagerModule.WidgetManager;

    expect((window as unknown as Record<string, unknown>).WidgetManager).toBe(WidgetManager);
    expect(WidgetManager.isReady('author-auto')).toBe(false);
    expect(WidgetManager.isReady('image-crop')).toBe(false);

    // Step 2: CMS library becomes available
    (window as unknown as Record<string, unknown>).CMS = mockCMS;
    (window as unknown as Record<string, unknown>).React = mockReact;
    (window as unknown as Record<string, unknown>).createReactClass = mockCreateReactClass;

    // Step 3: Load and execute widget registration utility
    const { registerWidget: regWidget } = await import('../../public/admin/scripts/utils/widget-registration.js');
    registerWidget = regWidget;

    // Step 4: Register widgets (simulating widget files loading)
    const mockControl1 = class AuthorControl {};
    const mockPreview1 = class AuthorPreview {};
    const mockControl2 = class ImageCropControl {};
    const mockPreview2 = class ImageCropPreview {};

    await registerWidget('author-auto', async () => ({
      control: mockControl1,
      preview: mockPreview1
    }));

    // After first widget, CMS should not be initialized yet
    expect(mockCMS.init).not.toHaveBeenCalled();
    expect(WidgetManager.isReady('author-auto')).toBe(true);
    expect(WidgetManager.isReady('image-crop')).toBe(false);

    await registerWidget('image-crop', async () => ({
      control: mockControl2,
      preview: mockPreview2
    }));

    // After all widgets are registered, CMS should initialize
    expect(mockCMS.init).toHaveBeenCalledTimes(1);
    expect(WidgetManager.isReady('author-auto')).toBe(true);
    expect(WidgetManager.isReady('image-crop')).toBe(true);

    // Verify both widgets were registered with CMS
    expect(mockCMS.registerWidget).toHaveBeenCalledWith('author-auto', mockControl1, mockPreview1);
    expect(mockCMS.registerWidget).toHaveBeenCalledWith('image-crop', mockControl2, mockPreview2);
  });

  it('should handle widgets loading before CMS library', async () => {
    // Step 1: Load Widget Manager
    const widgetManagerModule = await import('../../public/admin/scripts/widget-manager.js');
    WidgetManager = widgetManagerModule.WidgetManager;

    // Step 2: Try to register widgets before CMS is available
    (window as unknown as Record<string, unknown>).React = mockReact;
    (window as unknown as Record<string, unknown>).createReactClass = mockCreateReactClass;

    const { registerWidget: regWidget } = await import('../../public/admin/scripts/utils/widget-registration.js');
    registerWidget = regWidget;

    const mockControl = class TestControl {};

    // This should wait for CMS to become available
    const registrationPromise = registerWidget('author-auto', async () => ({
      control: mockControl
    }));

    // Give it a moment to start waiting
    await new Promise(resolve => setTimeout(resolve, 150));

    // CMS should not be initialized yet (still waiting)
    expect(mockCMS.init).not.toHaveBeenCalled();

    // Now make CMS available
    (window as unknown as Record<string, unknown>).CMS = mockCMS;

    // Wait for registration to complete
    await registrationPromise;

    // Should have registered the widget
    expect(mockCMS.registerWidget).toHaveBeenCalledWith('author-auto', mockControl, undefined);
  });

  it('should handle CMS library loading before widgets', async () => {
    // Step 1: CMS library loads first
    (window as unknown as Record<string, unknown>).CMS = mockCMS;
    (window as unknown as Record<string, unknown>).React = mockReact;
    (window as unknown as Record<string, unknown>).createReactClass = mockCreateReactClass;

    // Step 2: Load Widget Manager
    const widgetManagerModule = await import('../../public/admin/scripts/widget-manager.js');
    WidgetManager = widgetManagerModule.WidgetManager;

    // Step 3: Call initializeCMS (simulating the script in index.html)
    WidgetManager.initializeCMS();

    // CMS should not initialize yet (waiting for widgets)
    expect(mockCMS.init).not.toHaveBeenCalled();

    // Step 4: Register widgets
    const { registerWidget: regWidget } = await import('../../public/admin/scripts/utils/widget-registration.js');
    registerWidget = regWidget;

    await registerWidget('author-auto', async () => ({
      control: class {}
    }));

    expect(mockCMS.init).not.toHaveBeenCalled();

    await registerWidget('image-crop', async () => ({
      control: class {}
    }));

    // Now CMS should be initialized
    expect(mockCMS.init).toHaveBeenCalledTimes(1);
  });

  it('should handle widgets loading in reverse order', async () => {
    // Setup
    (window as unknown as Record<string, unknown>).CMS = mockCMS;
    (window as unknown as Record<string, unknown>).React = mockReact;
    (window as unknown as Record<string, unknown>).createReactClass = mockCreateReactClass;

    const widgetManagerModule = await import('../../public/admin/scripts/widget-manager.js');
    WidgetManager = widgetManagerModule.WidgetManager;

    const { registerWidget: regWidget } = await import('../../public/admin/scripts/utils/widget-registration.js');
    registerWidget = regWidget;

    // Register image-crop first (reverse order)
    await registerWidget('image-crop', async () => ({
      control: class {}
    }));

    expect(mockCMS.init).not.toHaveBeenCalled();

    // Register author-auto second
    await registerWidget('author-auto', async () => ({
      control: class {}
    }));

    // Should initialize regardless of order
    expect(mockCMS.init).toHaveBeenCalledTimes(1);
  });

  it('should handle widget registration failure gracefully', async () => {
    // Setup
    (window as unknown as Record<string, unknown>).CMS = mockCMS;
    (window as unknown as Record<string, unknown>).React = mockReact;
    (window as unknown as Record<string, unknown>).createReactClass = mockCreateReactClass;

    const widgetManagerModule = await import('../../public/admin/scripts/widget-manager.js');
    WidgetManager = widgetManagerModule.WidgetManager;

    const { registerWidget: regWidget } = await import('../../public/admin/scripts/utils/widget-registration.js');
    registerWidget = regWidget;

    // First widget fails to register
    await expect(
      registerWidget('author-auto', async () => {
        throw new Error('Widget creation failed');
      })
    ).rejects.toThrow('Widget creation failed');

    // Second widget registers successfully
    await registerWidget('image-crop', async () => ({
      control: class {}
    }));

    // CMS should not initialize because not all widgets are ready
    expect(mockCMS.init).not.toHaveBeenCalled();
  });

  it('should use legacy markWidgetReady if WidgetManager is not available', async () => {
    // Setup without Widget Manager
    (window as unknown as Record<string, unknown>).CMS = mockCMS;
    (window as unknown as Record<string, unknown>).React = mockReact;
    (window as unknown as Record<string, unknown>).createReactClass = mockCreateReactClass;

    const legacyMarkReady = vi.fn();
    (window as unknown as Record<string, unknown>).markWidgetReady = legacyMarkReady;

    const { registerWidget: regWidget } = await import('../../public/admin/scripts/utils/widget-registration.js');
    registerWidget = regWidget;

    await registerWidget('author-auto', async () => ({
      control: class {}
    }));

    // Should call legacy function
    expect(legacyMarkReady).toHaveBeenCalledWith('author-auto');
  });

  it('should wait for React and createReactClass before registering widgets', async () => {
    // Setup with only CMS available
    (window as unknown as Record<string, unknown>).CMS = mockCMS;

    const widgetManagerModule = await import('../../public/admin/scripts/widget-manager.js');
    WidgetManager = widgetManagerModule.WidgetManager;

    const { registerWidget: regWidget } = await import('../../public/admin/scripts/utils/widget-registration.js');
    registerWidget = regWidget;

    // Start registration (should wait for React)
    const registrationPromise = registerWidget('author-auto', async () => ({
      control: class {}
    }));

    // Give it time to check dependencies
    await new Promise(resolve => setTimeout(resolve, 150));

    // Registration should still be pending
    expect(mockCMS.registerWidget).not.toHaveBeenCalled();

    // Make React available
    (window as unknown as Record<string, unknown>).React = mockReact;
    (window as unknown as Record<string, unknown>).createReactClass = mockCreateReactClass;

    // Wait for registration to complete
    await registrationPromise;

    // Now widget should be registered
    expect(mockCMS.registerWidget).toHaveBeenCalled();
  });

  it('should handle timeout when dependencies never load', async () => {
    // Don't set up any dependencies
    const { registerWidget: regWidget } = await import('../../public/admin/scripts/utils/widget-registration.js');
    registerWidget = regWidget;

    // Try to register with short timeout
    const { waitForDependencies: waitDeps } = await import('../../public/admin/scripts/utils/wait-for-deps.js');
    waitForDependencies = waitDeps;

    // This should timeout
    await expect(
      waitForDependencies(['CMS', 'React', 'createReactClass'], 300)
    ).rejects.toThrow('Timeout waiting for dependencies');
  });

  it('should handle CMS.init throwing an error', async () => {
    // Setup
    mockCMS.init.mockImplementation(() => {
      throw new Error('CMS initialization failed');
    });

    (window as unknown as Record<string, unknown>).CMS = mockCMS;
    (window as unknown as Record<string, unknown>).React = mockReact;
    (window as unknown as Record<string, unknown>).createReactClass = mockCreateReactClass;

    const widgetManagerModule = await import('../../public/admin/scripts/widget-manager.js');
    WidgetManager = widgetManagerModule.WidgetManager;

    const { registerWidget: regWidget } = await import('../../public/admin/scripts/utils/widget-registration.js');
    registerWidget = regWidget;

    // Register both widgets
    await registerWidget('author-auto', async () => ({ control: class {} }));
    await registerWidget('image-crop', async () => ({ control: class {} }));

    // Should have attempted to initialize
    expect(mockCMS.init).toHaveBeenCalled();

    // Error should be logged
    expect(console.error).toHaveBeenCalledWith(
      'Error initializing CMS:',
      expect.any(Error)
    );
  });

  it('should handle concurrent widget registrations', async () => {
    // Setup
    (window as unknown as Record<string, unknown>).CMS = mockCMS;
    (window as unknown as Record<string, unknown>).React = mockReact;
    (window as unknown as Record<string, unknown>).createReactClass = mockCreateReactClass;

    const widgetManagerModule = await import('../../public/admin/scripts/widget-manager.js');
    WidgetManager = widgetManagerModule.WidgetManager;

    const { registerWidget: regWidget } = await import('../../public/admin/scripts/utils/widget-registration.js');
    registerWidget = regWidget;

    // Register both widgets concurrently
    await Promise.all([
      registerWidget('author-auto', async () => ({ control: class {} })),
      registerWidget('image-crop', async () => ({ control: class {} }))
    ]);

    // Both should be registered
    expect(mockCMS.registerWidget).toHaveBeenCalledTimes(2);

    // CMS should be initialized exactly once
    expect(mockCMS.init).toHaveBeenCalledTimes(1);
  });
});
