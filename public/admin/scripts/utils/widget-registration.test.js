/**
 * Unit tests for widget-registration.js
 *
 * Tests the registerWidget utility function that handles widget registration
 * with Decap CMS, including dependency waiting and error handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { registerWidget } from './widget-registration.js';
import * as waitForDepsModule from './wait-for-deps.js';

describe('registerWidget', () => {
  // Mock objects
  let mockCMS;
  let mockWidgetManager;
  let mockFactory;
  let mockControl;
  let mockPreview;

  beforeEach(() => {
    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Create mock CMS object
    mockCMS = {
      registerWidget: vi.fn()
    };
    window.CMS = mockCMS;

    // Create mock React objects
    window.React = { createElement: () => {} };
    window.createReactClass = () => {};

    // Create mock widget components
    mockControl = class MockControl {};
    mockPreview = class MockPreview {};

    // Create mock factory function
    mockFactory = vi.fn().mockResolvedValue({
      control: mockControl,
      preview: mockPreview
    });

    // Create mock WidgetManager
    mockWidgetManager = {
      markReady: vi.fn()
    };
    window.WidgetManager = mockWidgetManager;

    // Mock waitForDependencies to resolve immediately
    vi.spyOn(waitForDepsModule, 'waitForDependencies').mockResolvedValue(undefined);
  });

  afterEach(() => {
    // Clean up window objects
    delete window.CMS;
    delete window.React;
    delete window.createReactClass;
    delete window.WidgetManager;
    delete window.markWidgetReady;

    // Restore all mocks
    vi.restoreAllMocks();
  });

  it('should successfully register a widget with control and preview', async () => {
    // Act
    await registerWidget('test-widget', mockFactory);

    // Assert
    expect(waitForDepsModule.waitForDependencies).toHaveBeenCalledWith(
      ['CMS', 'React', 'createReactClass'],
      10000
    );
    expect(mockFactory).toHaveBeenCalled();
    expect(mockCMS.registerWidget).toHaveBeenCalledWith('test-widget', mockControl, mockPreview);
    expect(mockWidgetManager.markReady).toHaveBeenCalledWith('test-widget');
  });

  it('should register widget with only control component (no preview)', async () => {
    // Arrange: Factory returns only control
    mockFactory.mockResolvedValue({ control: mockControl });

    // Act
    await registerWidget('test-widget', mockFactory);

    // Assert
    expect(mockCMS.registerWidget).toHaveBeenCalledWith('test-widget', mockControl, undefined);
  });

  it('should throw error if factory does not return control component', async () => {
    // Arrange: Factory returns empty object
    mockFactory.mockResolvedValue({});

    // Act & Assert
    await expect(registerWidget('test-widget', mockFactory)).rejects.toThrow(
      "Widget test-widget: factory must return a 'control' component"
    );

    // Verify registration was not attempted
    expect(mockCMS.registerWidget).not.toHaveBeenCalled();
  });

  it('should throw error if factory returns null control', async () => {
    // Arrange: Factory returns null control
    mockFactory.mockResolvedValue({ control: null, preview: mockPreview });

    // Act & Assert
    await expect(registerWidget('test-widget', mockFactory)).rejects.toThrow(
      "Widget test-widget: factory must return a 'control' component"
    );
  });

  it('should use legacy markWidgetReady if WidgetManager is not available', async () => {
    // Arrange: Remove WidgetManager, add legacy function
    delete window.WidgetManager;
    const legacyMarkReady = vi.fn();
    window.markWidgetReady = legacyMarkReady;

    // Act
    await registerWidget('test-widget', mockFactory);

    // Assert
    expect(legacyMarkReady).toHaveBeenCalledWith('test-widget');
  });

  it('should warn if neither WidgetManager nor legacy function is available', async () => {
    // Arrange: Remove both widget tracking systems
    delete window.WidgetManager;

    // Act
    await registerWidget('test-widget', mockFactory);

    // Assert
    expect(console.warn).toHaveBeenCalledWith(
      'Widget test-widget: Widget tracker not available - CMS may not initialize properly'
    );
  });

  it('should handle WidgetManager with missing markReady method', async () => {
    // Arrange: WidgetManager exists but has no markReady
    window.WidgetManager = {};

    // Act
    await registerWidget('test-widget', mockFactory);

    // Assert: Should warn about missing tracker
    expect(console.warn).toHaveBeenCalledWith(
      'Widget test-widget: Widget tracker not available - CMS may not initialize properly'
    );
  });

  it('should propagate errors from waitForDependencies', async () => {
    // Arrange: Make waitForDependencies reject
    const error = new Error('Timeout waiting for dependencies');
    waitForDepsModule.waitForDependencies.mockRejectedValue(error);

    // Act & Assert
    await expect(registerWidget('test-widget', mockFactory)).rejects.toThrow(
      'Timeout waiting for dependencies'
    );

    // Verify factory was never called
    expect(mockFactory).not.toHaveBeenCalled();
    expect(mockCMS.registerWidget).not.toHaveBeenCalled();
  });

  it('should propagate errors from factory function', async () => {
    // Arrange: Factory throws error
    const factoryError = new Error('Failed to create widget components');
    mockFactory.mockRejectedValue(factoryError);

    // Act & Assert
    await expect(registerWidget('test-widget', mockFactory)).rejects.toThrow(
      'Failed to create widget components'
    );

    // Verify registration was not attempted
    expect(mockCMS.registerWidget).not.toHaveBeenCalled();
  });

  it('should propagate errors from CMS.registerWidget', async () => {
    // Arrange: CMS.registerWidget throws error
    const cmsError = new Error('CMS registration failed');
    mockCMS.registerWidget.mockImplementation(() => {
      throw cmsError;
    });

    // Act & Assert
    await expect(registerWidget('test-widget', mockFactory)).rejects.toThrow(
      'CMS registration failed'
    );
  });

  it('should log appropriate debug messages', async () => {
    // Act
    await registerWidget('my-widget', mockFactory);

    // Assert
    expect(console.log).toHaveBeenCalledWith('[DEBUG] Registering widget: my-widget');
    expect(console.log).toHaveBeenCalledWith(
      '✓ Dependencies available for my-widget, creating widget components...'
    );
    expect(console.log).toHaveBeenCalledWith('✓ my-widget widget registered with CMS');
  });

  it('should log error message when registration fails', async () => {
    // Arrange: Make factory fail
    const error = new Error('Factory error');
    mockFactory.mockRejectedValue(error);

    // Act: Try to register (will fail)
    try {
      await registerWidget('test-widget', mockFactory);
    } catch (e) {
      // Expected to throw
    }

    // Assert
    expect(console.error).toHaveBeenCalledWith(
      'Failed to register widget "test-widget":',
      error
    );
  });

  it('should handle factory that returns promise of components', async () => {
    // Arrange: Factory returns a promise
    const asyncFactory = vi.fn().mockImplementation(async () => {
      // Simulate async work
      await new Promise(resolve => setTimeout(resolve, 10));
      return { control: mockControl, preview: mockPreview };
    });

    // Act
    await registerWidget('async-widget', asyncFactory);

    // Assert
    expect(asyncFactory).toHaveBeenCalled();
    expect(mockCMS.registerWidget).toHaveBeenCalledWith('async-widget', mockControl, mockPreview);
  });

  it('should handle widget names with special characters', async () => {
    // Act
    await registerWidget('author-auto', mockFactory);
    await registerWidget('image_crop', mockFactory);

    // Assert
    expect(mockCMS.registerWidget).toHaveBeenCalledWith('author-auto', mockControl, mockPreview);
    expect(mockCMS.registerWidget).toHaveBeenCalledWith('image_crop', mockControl, mockPreview);
  });

  it('should wait for dependencies with correct timeout', async () => {
    // Act
    await registerWidget('test-widget', mockFactory);

    // Assert: Should use 10000ms timeout
    expect(waitForDepsModule.waitForDependencies).toHaveBeenCalledWith(
      ['CMS', 'React', 'createReactClass'],
      10000
    );
  });

  it('should call WidgetManager.markReady even if CMS.registerWidget throws', async () => {
    // Arrange: CMS registration succeeds but throws after
    mockCMS.registerWidget.mockImplementation(() => {
      // Register successfully but then throw
      throw new Error('Post-registration error');
    });

    // Act & Assert: Should throw
    await expect(registerWidget('test-widget', mockFactory)).rejects.toThrow(
      'Post-registration error'
    );

    // WidgetManager.markReady should NOT be called if registration fails
    expect(mockWidgetManager.markReady).not.toHaveBeenCalled();
  });

  it('should register multiple widgets sequentially', async () => {
    // Arrange: Create different factories
    const factory1 = vi.fn().mockResolvedValue({ control: mockControl });
    const factory2 = vi.fn().mockResolvedValue({ control: mockPreview });

    // Act: Register both widgets
    await registerWidget('widget-1', factory1);
    await registerWidget('widget-2', factory2);

    // Assert: Both should be registered
    expect(mockCMS.registerWidget).toHaveBeenCalledTimes(2);
    expect(mockWidgetManager.markReady).toHaveBeenCalledWith('widget-1');
    expect(mockWidgetManager.markReady).toHaveBeenCalledWith('widget-2');
  });
});
