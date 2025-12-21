/**
 * Widget Manager
 *
 * Manages custom widget registration and coordinates CMS initialization.
 * Ensures all widgets are loaded before initializing Decap CMS.
 *
 * @module widget-manager
 */

/**
 * @typedef {Object} WidgetManagerAPI
 * @property {function(string): void} markReady - Mark a widget as ready
 * @property {function(): void} initializeCMS - Initialize CMS after all widgets are ready
 * @property {function(string): boolean} isReady - Check if a widget is ready
 * @property {function(): string[]} getWidgetNames - Get all registered widget names
 * @property {function(): void} checkAndInitialize - Check and initialize CMS if all widgets are ready
 */

/**
 * Creates the Widget Manager
 * @returns {WidgetManagerAPI} Widget Manager public API
 */
function createWidgetManager() {
  // Private state
  const widgetsReady = {
    'author-auto': false,
    'image-crop': false
  };

  let cmsInitialized = false;

  /**
   * Mark a widget as ready (successfully registered)
   * @param {string} widgetName - The name of the registered widget
   */
  function markReady(widgetName) {
    console.log(`[DEBUG] WidgetManager.markReady called for: ${widgetName}`);

    if (!Object.prototype.hasOwnProperty.call(widgetsReady, widgetName)) {
      console.warn(`Unknown widget registered: ${widgetName}`);
      return;
    }

    widgetsReady[widgetName] = true;
    console.log(`✓ Widget "${widgetName}" registered successfully`);
    console.log('[DEBUG] Current widget status:', widgetsReady);

    // Try to initialize CMS if all widgets are ready
    checkAndInitialize();
  }

  /**
   * Check if all widgets are ready and initialize CMS if possible
   */
  function checkAndInitialize() {
    const allReady = Object.values(widgetsReady).every(Boolean);
    console.log('[DEBUG] All widgets ready?', allReady, 'CMS available?', typeof window.CMS !== 'undefined', 'Already initialized?', cmsInitialized);

    if (allReady && typeof window.CMS !== 'undefined' && !cmsInitialized) {
      console.log('All widgets ready, initializing CMS...');
      cmsInitialized = true;
      try {
        window.CMS.init();
        console.log('✓ Decap CMS initialized successfully');
      } catch (error) {
        console.error('Error initializing CMS:', error);
        cmsInitialized = false; // Reset flag if init failed
      }
    }
  }

  /**
   * Initialize CMS (waits for CMS library to load, then checks widget readiness)
   */
  function initializeCMS() {
    console.log('[DEBUG] WidgetManager.initializeCMS called, CMS available?', typeof window.CMS !== 'undefined');

    // First, wait for CMS library to load
    if (typeof window.CMS === 'undefined') {
      console.log('Waiting for Decap CMS library to load...');
      setTimeout(initializeCMS, 100);
      return;
    }

    console.log('Decap CMS library loaded');

    // Check if all widgets are already registered
    const allReady = Object.values(widgetsReady).every(Boolean);
    console.log('[DEBUG] initializeCMS: widgets ready?', allReady, 'widget status:', widgetsReady);

    if (allReady && !cmsInitialized) {
      console.log('All widgets already registered, initializing CMS now...');
      cmsInitialized = true;
      try {
        window.CMS.init();
        console.log('✓ Decap CMS initialized successfully');
      } catch (error) {
        console.error('Error initializing CMS:', error);
        cmsInitialized = false;
      }
    } else if (cmsInitialized) {
      console.log('[DEBUG] CMS already initialized, skipping');
    } else {
      console.log('CMS loaded, waiting for widgets to register...');
      const pending = Object.entries(widgetsReady)
        .filter(([_, ready]) => !ready)
        .map(([name, _]) => name);
      console.log('Pending widgets:', pending);
      // Widgets will call CMS.init() via markReady() when ready
    }
  }

  /**
   * Check if a widget is ready
   * @param {string} widgetName - The name of the widget to check
   * @returns {boolean} Whether the widget is ready
   */
  function isReady(widgetName) {
    return widgetsReady[widgetName] || false;
  }

  /**
   * Get all registered widget names
   * @returns {string[]} Array of widget names
   */
  function getWidgetNames() {
    return Object.keys(widgetsReady);
  }

  console.log('[DEBUG] WidgetManager initialized:', widgetsReady);

  // Public API
  return {
    markReady,
    initializeCMS,
    isReady,
    getWidgetNames,
    checkAndInitialize
  };
}

// Create the Widget Manager instance
export const WidgetManager = createWidgetManager();

// Expose WidgetManager globally for CMS integration and widgets
window.WidgetManager = WidgetManager;

// Backward compatibility: expose legacy function
window.markWidgetReady = WidgetManager.markReady;
