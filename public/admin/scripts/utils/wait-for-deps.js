/**
 * Wait for Dependencies Utility
 *
 * Waits for global dependencies (like CMS, React) to be available.
 * Used by custom widgets before registration.
 *
 * @module utils/wait-for-deps
 */

/**
 * Wait for global dependencies to be available
 * @param {string[]} deps - Array of global variable names to wait for
 * @param {number} [timeout=10000] - Maximum wait time in milliseconds
 * @returns {Promise<void>}
 * @throws {Error} If timeout is reached before all dependencies are available
 */
export async function waitForDependencies(deps, timeout = 10000) {
  const startTime = Date.now();
  const interval = 100; // Check every 100ms

  while (Date.now() - startTime < timeout) {
    const allAvailable = deps.every(dep => window[dep] !== undefined);
    if (allAvailable) {
      console.log(`✓ All dependencies available: ${deps.join(', ')}`);
      return;
    }

    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  // Timeout reached
  const missing = deps.filter(dep => window[dep] === undefined);
  throw new Error(`Timeout waiting for dependencies: ${missing.join(', ')}`);
}
