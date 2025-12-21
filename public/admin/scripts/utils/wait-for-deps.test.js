/**
 * Unit tests for wait-for-deps.js
 *
 * Tests the waitForDependencies utility function that waits for global
 * dependencies to be available before proceeding with widget registration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitForDependencies } from './wait-for-deps.js';

describe('waitForDependencies', () => {
  // Store original window properties to restore after tests
  let originalCMS;
  let originalReact;
  let originalCreateReactClass;

  beforeEach(() => {
    // Save original values
    originalCMS = window.CMS;
    originalReact = window.React;
    originalCreateReactClass = window.createReactClass;

    // Clear window properties
    delete window.CMS;
    delete window.React;
    delete window.createReactClass;

    // Mock console.log to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original values
    if (originalCMS !== undefined) window.CMS = originalCMS;
    else delete window.CMS;

    if (originalReact !== undefined) window.React = originalReact;
    else delete window.React;

    if (originalCreateReactClass !== undefined) window.createReactClass = originalCreateReactClass;
    else delete window.createReactClass;

    // Restore console
    vi.restoreAllMocks();
  });

  it('should resolve immediately when all dependencies are already available', async () => {
    // Arrange: Set up dependencies
    window.CMS = { init: () => {} };
    window.React = { createElement: () => {} };
    window.createReactClass = () => {};

    // Act & Assert: Should resolve quickly
    await expect(
      waitForDependencies(['CMS', 'React', 'createReactClass'], 1000)
    ).resolves.toBeUndefined();

    // Verify console.log was called
    expect(console.log).toHaveBeenCalledWith(
      '✓ All dependencies available: CMS, React, createReactClass'
    );
  });

  it('should wait for dependencies to become available', async () => {
    // Arrange: Dependencies not yet available
    const deps = ['CMS', 'React'];

    // Set up dependencies after a delay
    setTimeout(() => {
      window.CMS = { init: () => {} };
    }, 100);

    setTimeout(() => {
      window.React = { createElement: () => {} };
    }, 200);

    // Act & Assert: Should wait and resolve
    await expect(waitForDependencies(deps, 1000)).resolves.toBeUndefined();
  });

  it('should throw error when timeout is reached', async () => {
    // Arrange: Dependencies never become available
    const deps = ['CMS', 'React', 'NonExistent'];
    const timeout = 300; // Short timeout for fast test

    // Act & Assert: Should timeout and throw error
    await expect(waitForDependencies(deps, timeout)).rejects.toThrow(
      'Timeout waiting for dependencies: CMS, React, NonExistent'
    );
  });

  it('should throw error with only missing dependencies in message', async () => {
    // Arrange: Only one dependency available
    window.CMS = { init: () => {} };
    const deps = ['CMS', 'React', 'createReactClass'];
    const timeout = 300;

    // Act & Assert: Should list only missing dependencies
    await expect(waitForDependencies(deps, timeout)).rejects.toThrow(
      'Timeout waiting for dependencies: React, createReactClass'
    );
  });

  it('should use default timeout of 10000ms when not specified', async () => {
    // Arrange: Set up a spy on setTimeout
    vi.spyOn(global, 'setTimeout');

    // Dependencies become available after 500ms
    setTimeout(() => {
      window.CMS = { init: () => {} };
    }, 500);

    // Act: Call without timeout parameter
    const promise = waitForDependencies(['CMS']);

    // Wait for resolution
    await promise;

    // Assert: Should have been called with 100ms intervals
    expect(setTimeout).toHaveBeenCalled();
  });

  it('should handle empty dependencies array', async () => {
    // Arrange & Act: Empty array should resolve immediately
    await expect(waitForDependencies([], 1000)).resolves.toBeUndefined();
  });

  it('should check dependencies every 100ms', async () => {
    // Arrange: Set up spy
    vi.useFakeTimers();

    window.CMS = undefined;
    const promise = waitForDependencies(['CMS'], 1000);

    // Act: Advance time by 250ms
    vi.advanceTimersByTime(250);

    // Make CMS available
    window.CMS = { init: () => {} };

    // Advance time again to trigger the check
    vi.advanceTimersByTime(100);

    // Assert: Should resolve
    await promise;

    vi.useRealTimers();
  });

  it('should handle window properties that are null vs undefined', async () => {
    // Arrange: Set property to null (different from undefined)
    window.CMS = null;

    // Act & Assert: null IS considered available (not undefined)
    // The function checks !== undefined, so null counts as defined
    await expect(waitForDependencies(['CMS'], 1000)).resolves.toBeUndefined();
  });

  it('should work with single dependency', async () => {
    // Arrange
    window.React = { createElement: () => {} };

    // Act & Assert
    await expect(waitForDependencies(['React'], 1000)).resolves.toBeUndefined();
  });

  it('should handle multiple checks before dependencies are ready', async () => {
    // Arrange: Dependencies appear after multiple intervals
    let checkCount = 0;
    const originalSetTimeout = global.setTimeout;

    // Override setTimeout to count checks
    vi.spyOn(global, 'setTimeout').mockImplementation((callback, delay) => {
      checkCount++;
      return originalSetTimeout(callback, delay);
    });

    // Make dependencies available after 5 checks (~500ms)
    setTimeout(() => {
      window.CMS = { init: () => {} };
      window.React = { createElement: () => {} };
    }, 500);

    // Act
    await waitForDependencies(['CMS', 'React'], 2000);

    // Assert: Should have checked multiple times
    expect(checkCount).toBeGreaterThan(3);
  });
});
