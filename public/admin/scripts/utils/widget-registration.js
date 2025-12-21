/**
 * Widget Registration Utility
 *
 * Shared utility for registering custom Decap CMS widgets.
 * Handles dependency waiting and widget registration boilerplate.
 *
 * @module utils/widget-registration
 */

import { waitForDependencies } from './wait-for-deps.js';

/**
 * @typedef {Object} WidgetComponents
 * @property {React.Component} control - The widget control component
 * @property {React.Component} [preview] - Optional preview component
 */

/**
 * @callback WidgetFactory
 * @returns {Promise<WidgetComponents>} Widget components (control and preview)
 */

/**
 * Register a custom Decap CMS widget
 * @param {string} name - Widget name (e.g., 'author-auto', 'image-crop')
 * @param {WidgetFactory} factory - Async function that returns {control, preview} components
 * @returns {Promise<void>}
 * @throws {Error} If widget registration fails
 */
export async function registerWidget(name, factory) {
  try {
    console.log(`[DEBUG] Registering widget: ${name}`);

    // Wait for required dependencies
    await waitForDependencies(['CMS', 'React', 'createReactClass'], 10000);

    console.log(`✓ Dependencies available for ${name}, creating widget components...`);

    // Call factory function to get widget components
    const { control, preview } = await factory();

    if (!control) {
      throw new Error(`Widget ${name}: factory must return a 'control' component`);
    }

    // Register widget with CMS
    window.CMS.registerWidget(name, control, preview);
    console.log(`✓ ${name} widget registered with CMS`);

    // Notify widget manager that this widget is ready
    if (typeof window.WidgetManager !== 'undefined' && typeof window.WidgetManager.markReady === 'function') {
      window.WidgetManager.markReady(name);
    } else if (typeof window.markWidgetReady === 'function') {
      // Fallback for legacy compatibility
      window.markWidgetReady(name);
    } else {
      console.warn(`Widget ${name}: Widget tracker not available - CMS may not initialize properly`);
    }

  } catch (error) {
    console.error(`Failed to register widget "${name}":`, error);
    throw error;
  }
}
