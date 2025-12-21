# Implementation Plan: Admin Widget Registration Fix

**Issue**: Widget Registration Race Condition
**Status**: 📋 Ready for Implementation
**Staff Engineer**: Claude Sonnet 4.5
**Date**: 2025-12-21
**Last Updated**: 2025-12-21

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Root Cause Analysis](#root-cause-analysis)
3. [Solution Overview](#solution-overview)
4. [Implementation Steps](#implementation-steps)
5. [Testing Plan](#testing-plan)
6. [Rollback Plan](#rollback-plan)
7. [Success Criteria](#success-criteria)

---

## Problem Statement

### Current Behavior

Admin widgets (`author-auto` and `image-crop`) fail to register with Decap CMS, resulting in the error:

```
Žádné ovládání pro widget 'image-crop'.
```

### Expected Behavior

Widgets should register successfully before CMS initialization, appearing as functional form controls in the admin interface.

### User Impact

- ❌ Content editors cannot use the custom author widget
- ❌ Content editors cannot use the image crop widget
- ❌ Articles cannot be created/edited with enhanced image features
- ❌ Blocks entire content authoring workflow

**Severity**: **CRITICAL** - Core functionality broken

---

## Root Cause Analysis

### Technical Analysis

**Race Condition Timeline**:

```
1. Decap CMS script loads → window.CMS becomes available
2. initCMS() detects window.CMS exists
3. initCMS() immediately calls CMS.init() ❌
4. Widget scripts are still executing their retry loops
5. Widgets try to register AFTER CMS is initialized
6. Registration fails → "Žádné ovládání pro widget" error
```

### Code Review Findings

**File**: `public/admin/index.html:263-273`

```javascript
// ❌ PROBLEM: Only waits for CMS object, not for widget registration
(function initCMS() {
  if (typeof CMS === 'undefined') {
    console.log('Waiting for CMS to load...');
    setTimeout(initCMS, 100);
    return;
  }

  console.log('Initializing Decap CMS with custom widgets...');
  CMS.init();  // ❌ Called too early!
  console.log('✓ Decap CMS initialized successfully');
})();
```

**File**: `public/admin/author-widget.js:2-89`

```javascript
// ❌ PROBLEM: Async IIFE with retry loop, no coordination
(async function registerAuthorWidget() {
  if (!window.CMS) {
    console.log('Author widget: Waiting for Decap CMS to load...');
    setTimeout(registerAuthorWidget, 100);  // ❌ No guarantee this completes before CMS.init()
    return;
  }

  // ... registration code ...
  window.CMS.registerWidget('author-auto', AuthorControl, AuthorPreview);
})();
```

**File**: `public/admin/widgets/image-crop-widget.js:14-604`

```javascript
// ❌ PROBLEM: Same async retry pattern, no coordination
(function registerImageCropWidget() {
  if (!window.CMS) {
    console.log('Waiting for Decap CMS to load...');
    setTimeout(registerImageCropWidget, 100);  // ❌ No guarantee this completes before CMS.init()
    return;
  }

  // ... registration code ...
  window.CMS.registerWidget('image-crop', ImageCropControl, ImageCropPreview);
})();
```

### Critical Issues Identified

1. **No Coordination Mechanism**: No way to know when all widgets have registered
2. **Race Condition**: CMS.init() can be called while widgets are still registering
3. **Async Registration**: Widget scripts use retry loops that complete at unpredictable times
4. **Missing Dependency**: CMS initialization doesn't wait for widget dependencies

---

## Solution Overview

### Approach: Event-Based Coordination

Implement a widget registration tracker that ensures all widgets are registered before CMS initialization.

### Key Components

1. **Widget Registration Tracker** - Tracks which widgets have registered
2. **Coordinated Initialization** - Waits for both CMS load AND widget registration
3. **Signal Mechanism** - Widgets signal when ready via callback
4. **Backward Compatibility** - Works even if some widgets fail to load

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Page Load Sequence                       │
└─────────────────────────────────────────────────────────────┘
         │
         ├─► Load Decap CMS (CDN)
         │   └─► window.CMS available
         │
         ├─► Load Cropper.js (CDN)
         │   └─► window.Cropper available
         │
         ├─► Load author-widget.js
         │   └─► Waits for window.CMS
         │       └─► Registers widget
         │           └─► Calls markWidgetReady('author-auto') ✓
         │
         ├─► Load image-crop-widget.js
         │   └─► Waits for window.CMS
         │       └─► Registers widget
         │           └─► Calls markWidgetReady('image-crop') ✓
         │
         └─► initCMS() checks:
             ├─► Is window.CMS available? ✓
             └─► Are all widgets ready? ✓
                 └─► Call CMS.init() ✓
```

---

## Implementation Steps

### Phase 1: Add Widget Registration Tracker

**File**: `public/admin/index.html`

**Location**: Before widget script tags (around line 240)

```html
<!-- Widget registration tracker -->
<script>
  // Track which widgets have successfully registered
  window.widgetsReady = {
    'author-auto': false,
    'image-crop': false
  };

  /**
   * Called by each widget when it successfully registers
   * @param {string} widgetName - The name of the registered widget
   */
  window.markWidgetReady = function(widgetName) {
    if (!window.widgetsReady.hasOwnProperty(widgetName)) {
      console.warn(`Unknown widget registered: ${widgetName}`);
      return;
    }

    window.widgetsReady[widgetName] = true;
    console.log(`✓ Widget "${widgetName}" registered successfully`);

    // Check if all widgets are ready
    const allReady = Object.values(window.widgetsReady).every(ready => ready);
    if (allReady && typeof window.CMS !== 'undefined') {
      console.log('All widgets ready, initializing CMS...');
      window.CMS.init();
      console.log('✓ Decap CMS initialized successfully');
    }
  };

  console.log('Widget tracker initialized:', window.widgetsReady);
</script>
```

**Changes**:
- ✅ Add before line 254 (before widget script tags)
- ✅ Defines `window.widgetsReady` object with all expected widgets
- ✅ Defines `window.markWidgetReady()` callback function
- ✅ Auto-initializes CMS when all widgets are ready

---

### Phase 2: Update CMS Initialization Script

**File**: `public/admin/index.html`

**Location**: Replace lines 260-274

**Before**:
```javascript
<script>
  // Wait for all widgets to register, then initialize CMS
  (function initCMS() {
    if (typeof CMS === 'undefined') {
      console.log('Waiting for CMS to load...');
      setTimeout(initCMS, 100);
      return;
    }

    console.log('Initializing Decap CMS with custom widgets...');
    CMS.init();
    console.log('✓ Decap CMS initialized successfully');
  })();
</script>
```

**After**:
```javascript
<script>
  /**
   * Initialize CMS when both CMS is loaded AND all widgets are registered
   */
  (function initCMS() {
    // First, wait for CMS library to load
    if (typeof CMS === 'undefined') {
      console.log('Waiting for Decap CMS library to load...');
      setTimeout(initCMS, 100);
      return;
    }

    console.log('Decap CMS library loaded');

    // Check if all widgets are already registered
    const allReady = Object.values(window.widgetsReady).every(ready => ready);

    if (allReady) {
      console.log('All widgets already registered, initializing CMS now...');
      CMS.init();
      console.log('✓ Decap CMS initialized successfully');
    } else {
      console.log('CMS loaded, waiting for widgets to register...');
      console.log('Pending widgets:',
        Object.entries(window.widgetsReady)
          .filter(([_, ready]) => !ready)
          .map(([name, _]) => name)
      );
      // Widgets will call CMS.init() via markWidgetReady() when ready
    }
  })();
</script>
```

**Changes**:
- ✅ Still waits for `window.CMS` to be defined
- ✅ Additionally checks if all widgets are registered
- ✅ If widgets already registered → initialize immediately
- ✅ If widgets pending → wait for markWidgetReady() to initialize
- ✅ Logs pending widgets for debugging

---

### Phase 3: Update Author Widget

**File**: `public/admin/author-widget.js`

**Location**: End of file (after line 87)

**Before**:
```javascript
  window.CMS.registerWidget('author-auto', AuthorControl, AuthorPreview);
  console.log('✓ author-auto widget registered successfully');
})();
```

**After**:
```javascript
  window.CMS.registerWidget('author-auto', AuthorControl, AuthorPreview);
  console.log('✓ author-auto widget registered with CMS');

  // Signal that this widget is ready
  if (typeof window.markWidgetReady === 'function') {
    window.markWidgetReady('author-auto');
  } else {
    console.warn('Widget tracker not available - CMS may not initialize properly');
  }
})();
```

**Changes**:
- ✅ Keep existing registration code
- ✅ Add call to `window.markWidgetReady('author-auto')`
- ✅ Add safety check for tracker availability
- ✅ Add warning if tracker missing (for debugging)

---

### Phase 4: Update Image Crop Widget

**File**: `public/admin/widgets/image-crop-widget.js`

**Location**: End of file (after line 602)

**Before**:
```javascript
  // Register the custom widget
  window.CMS.registerWidget('image-crop', ImageCropControl, ImageCropPreview);
  console.log('✓ image-crop widget registered successfully');
})();
```

**After**:
```javascript
  // Register the custom widget
  window.CMS.registerWidget('image-crop', ImageCropControl, ImageCropPreview);
  console.log('✓ image-crop widget registered with CMS');

  // Signal that this widget is ready
  if (typeof window.markWidgetReady === 'function') {
    window.markWidgetReady('image-crop');
  } else {
    console.warn('Widget tracker not available - CMS may not initialize properly');
  }
})();
```

**Changes**:
- ✅ Keep existing registration code
- ✅ Add call to `window.markWidgetReady('image-crop')`
- ✅ Add safety check for tracker availability
- ✅ Add warning if tracker missing (for debugging)

---

### Phase 5: Fix Author Widget Path Issue (Secondary)

**File**: `public/admin/author-widget.js`

**Location**: Line 16

**Before**:
```javascript
const response = await fetch('/dgkralupy/content/authors/authors.json');
```

**After**:
```javascript
// Use relative path from admin directory instead of hardcoded base path
const basePath = window.location.pathname.split('/admin')[0] || '/dgkralupy';
const response = await fetch(`${basePath}/content/authors/authors.json`);
```

**Changes**:
- ✅ Removes hardcoded `/dgkralupy` path
- ✅ Calculates base path dynamically
- ✅ Falls back to `/dgkralupy` if path calculation fails
- 🟡 **Optional but recommended** for better portability

---

## Testing Plan

### Pre-Implementation Testing

**Verify Current Broken State**:

```bash
# 1. Build the site
npm run build

# 2. Start dev server
npm run dev

# 3. Open admin in browser
open http://localhost:4321/dgkralupy/admin/

# 4. Open browser console (F12)

# 5. Try to create new article
# Expected: Error "Žádné ovládání pro widget 'image-crop'"

# 6. Check console logs
# Expected: Widgets may show registration messages but CMS initialized too early
```

**Document Console Output**:
```
Waiting for CMS to load...
Initializing Decap CMS with custom widgets...
✓ Decap CMS initialized successfully
Author widget: Waiting for Decap CMS to load...  ❌ Too late!
Waiting for Decap CMS to load...  ❌ Too late!
```

---

### Post-Implementation Testing

#### Test 1: Verify Widget Registration Order

**Steps**:
1. Implement all changes
2. Clear browser cache
3. Open admin interface
4. Open browser console
5. Observe initialization sequence

**Expected Console Output**:
```
Widget tracker initialized: { author-auto: false, image-crop: false }
Waiting for Decap CMS library to load...
Decap CMS library loaded
CMS loaded, waiting for widgets to register...
Pending widgets: ['author-auto', 'image-crop']
Registering author-auto widget...
✓ author-auto widget registered with CMS
✓ Widget "author-auto" registered successfully
Registering image-crop widget...
✓ image-crop widget registered with CMS
✓ Widget "image-crop" registered successfully
All widgets ready, initializing CMS...
✓ Decap CMS initialized successfully
```

**Success Criteria**:
- ✅ All widgets register BEFORE CMS.init() is called
- ✅ No "Žádné ovládání pro widget" errors
- ✅ Console shows proper initialization order

---

#### Test 2: Create New Article with Widgets

**Steps**:
1. Navigate to admin interface
2. Click "New články" (New Article)
3. Verify "Autor" field shows text input (author-auto widget)
4. Verify "Hlavní obrázek" field shows custom upload interface (image-crop widget)
5. Test image upload:
   - Click "Nahrát obrázek"
   - Select test image (800×600px JPG)
   - Verify success message appears
6. Test focus point selection:
   - Click on image preview
   - Verify crosshair marker appears
   - Verify status text updates with coordinates
7. Test alt text:
   - Enter alt text (e.g., "Test obrázek")
   - Verify character counter updates
8. Test advanced mode:
   - Click "▶ Zobrazit pokročilé možnosti"
   - Verify cropper appears
   - Select different variant (e.g., "Karta článku")
   - Adjust crop area
   - Click "Skrýt pokročilé možnosti"
9. Save as draft
10. Verify article saved with image data

**Success Criteria**:
- ✅ Author widget displays and functions correctly
- ✅ Image crop widget displays upload interface
- ✅ Image upload validation works
- ✅ Focus point selection works
- ✅ Advanced cropping works
- ✅ Article saves with correct data structure

---

#### Test 3: Edit Existing Article

**Steps**:
1. Open existing article with enhanced image format
2. Verify image displays in widget
3. Verify alt text displays
4. Verify focus point marker shows at correct position
5. Modify focus point by clicking
6. Save changes
7. Reload article
8. Verify changes persisted

**Success Criteria**:
- ✅ Existing image data loads correctly
- ✅ Focus point displays correctly
- ✅ Changes save and persist
- ✅ No data loss or corruption

---

#### Test 4: Backward Compatibility Test

**Steps**:
1. Open existing article with legacy string image format:
   ```yaml
   image: "/images/old-image.jpg"
   ```
2. Verify widget handles legacy format gracefully
3. Verify no errors in console
4. Edit and save article
5. Verify image format upgraded to object format:
   ```yaml
   image:
     src: "/images/old-image.jpg"
     alt: ""
     focusPoint:
       x: 50
       y: 50
   ```

**Success Criteria**:
- ✅ Legacy format loads without errors
- ✅ Widget displays with default values
- ✅ Saving upgrades format automatically
- ✅ No data loss

---

#### Test 5: Error Handling Test

**Test 5A: Invalid File Type**

**Steps**:
1. Try to upload GIF file
2. Verify error message: "Nepodporovaný formát souboru (GIF). Použijte prosím JPG, PNG nebo WebP."
3. Verify upload blocked

**Test 5B: File Too Large**

**Steps**:
1. Try to upload 15MB file
2. Verify error message shows file size and limit
3. Verify upload blocked

**Test 5C: Image Too Small**

**Steps**:
1. Try to upload 400×300px image
2. Verify error message shows dimensions and minimum
3. Verify upload blocked

**Success Criteria**:
- ✅ All validation errors display correctly
- ✅ Error messages are in Czech
- ✅ Error messages are actionable
- ✅ Invalid uploads are blocked

---

#### Test 6: Browser Compatibility Test

**Browsers to Test**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Steps** (for each browser):
1. Open admin interface
2. Check console for widget registration
3. Create new article
4. Test image upload
5. Test focus point selection
6. Test advanced cropping

**Success Criteria**:
- ✅ Works in all major browsers
- ✅ No browser-specific errors
- ✅ UI renders correctly

---

#### Test 7: Performance Test

**Steps**:
1. Open admin interface
2. Measure time from page load to CMS ready
3. Create article with large image (8MB)
4. Measure upload and processing time

**Success Criteria**:
- ✅ CMS initialization < 3 seconds
- ✅ Widget registration < 1 second
- ✅ Image upload validation < 500ms
- ✅ No performance degradation

---

### Verification Commands

```bash
# 1. Lint check (should pass)
npm run lint

# 2. Type check (should pass)
npm run build

# 3. Start dev server
npm run dev

# 4. Check console for initialization sequence
# Should see proper widget registration order

# 5. Test admin interface
# Open: http://localhost:4321/dgkralupy/admin/

# 6. Check for errors in browser console
# Should see no errors

# 7. Verify build output
npm run build
# Should build successfully with no warnings
```

---

## Rollback Plan

### If Issues Occur

**Step 1: Identify the Problem**

```bash
# Check browser console for errors
# Check server logs
# Verify which widgets are failing
```

**Step 2: Quick Rollback (Emergency)**

```bash
# Revert all changes
git checkout HEAD~1 -- public/admin/index.html
git checkout HEAD~1 -- public/admin/author-widget.js
git checkout HEAD~1 -- public/admin/widgets/image-crop-widget.js

# Rebuild
npm run build

# Test
npm run dev
```

**Step 3: Partial Rollback (If only one widget is broken)**

```html
<!-- Temporarily disable problematic widget -->
<script>
  window.widgetsReady = {
    'author-auto': true,  // ✅ Working widget
    'image-crop': true    // ⚠️ Disabled - marked as ready to allow CMS init
  };
</script>

<!-- Comment out broken widget script -->
<!-- <script src="./widgets/image-crop-widget.js"></script> -->
```

**Step 4: Report Issue**

Create detailed bug report with:
- Browser and version
- Console output
- Steps to reproduce
- Expected vs actual behavior
- Screenshots

---

## Success Criteria

### Must Have (Critical)

- ✅ **No registration errors**: No "Žádné ovládání pro widget" errors in console
- ✅ **Widgets display**: Both author-auto and image-crop widgets appear in forms
- ✅ **Correct initialization order**: Widgets register before CMS.init()
- ✅ **No regressions**: Existing functionality still works
- ✅ **Build succeeds**: No TypeScript or build errors

### Should Have (Important)

- ✅ **Clear console logs**: Initialization sequence is logged clearly
- ✅ **Error handling**: Graceful degradation if widget fails to load
- ✅ **Backward compatibility**: Works with existing content
- ✅ **Browser compatibility**: Works in Chrome, Firefox, Safari, Edge
- ✅ **Performance**: No noticeable slowdown

### Nice to Have (Optional)

- 🟡 **Timeout handling**: Warning if widgets take too long to register
- 🟡 **Retry mechanism**: Auto-retry if widget registration fails
- 🟡 **Debug mode**: Verbose logging for troubleshooting

---

## Implementation Checklist

### Pre-Implementation

- [ ] Read and understand this implementation plan
- [ ] Review existing code (index.html, author-widget.js, image-crop-widget.js)
- [ ] Create backup branch: `git checkout -b backup/pre-widget-fix`
- [ ] Document current behavior (screenshots, console logs)
- [ ] Set up local testing environment
- [ ] Clear browser cache

### Phase 1: Widget Registration Tracker

- [ ] Add `window.widgetsReady` object to index.html
- [ ] Add `window.markWidgetReady()` function to index.html
- [ ] Add console logging for debugging
- [ ] Test in browser (should log initialization message)

### Phase 2: Update CMS Initialization

- [ ] Replace initCMS() function in index.html
- [ ] Add widget readiness check
- [ ] Add conditional initialization logic
- [ ] Add debug logging
- [ ] Test in browser (should wait for widgets)

### Phase 3: Update Author Widget

- [ ] Add `markWidgetReady('author-auto')` call to author-widget.js
- [ ] Add safety checks
- [ ] Add debug logging
- [ ] Test widget registration

### Phase 4: Update Image Crop Widget

- [ ] Add `markWidgetReady('image-crop')` call to image-crop-widget.js
- [ ] Add safety checks
- [ ] Add debug logging
- [ ] Test widget registration

### Phase 5: Fix Author Widget Path (Optional)

- [ ] Update author mappings fetch path
- [ ] Test with different base paths
- [ ] Verify fallback works

### Testing

- [ ] Run Test 1: Verify registration order
- [ ] Run Test 2: Create new article
- [ ] Run Test 3: Edit existing article
- [ ] Run Test 4: Backward compatibility
- [ ] Run Test 5: Error handling
- [ ] Run Test 6: Browser compatibility
- [ ] Run Test 7: Performance
- [ ] Run verification commands

### Post-Implementation

- [ ] Clear browser cache and test fresh load
- [ ] Test in incognito mode
- [ ] Review console logs for any warnings
- [ ] Verify no TypeScript errors
- [ ] Build succeeds: `npm run build`
- [ ] Commit changes with descriptive message
- [ ] Push to repository
- [ ] Deploy to staging (if applicable)
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Monitor for issues

---

## Files Modified

### Summary

| File | Changes | Lines Modified | Risk |
|------|---------|----------------|------|
| `public/admin/index.html` | Add tracker, update initialization | ~50 | Low |
| `public/admin/author-widget.js` | Add ready signal, fix path | ~10 | Low |
| `public/admin/widgets/image-crop-widget.js` | Add ready signal | ~5 | Low |

**Total**: 3 files, ~65 lines modified

---

## Timeline Estimate

- **Phase 1**: 15 minutes
- **Phase 2**: 15 minutes
- **Phase 3**: 10 minutes
- **Phase 4**: 10 minutes
- **Phase 5**: 10 minutes (optional)
- **Testing**: 45 minutes
- **Documentation**: 15 minutes

**Total**: ~2 hours (including comprehensive testing)

---

## Next Steps

1. **Review this plan** with development team
2. **Schedule implementation** (low-traffic time recommended)
3. **Execute phases 1-4** in sequence
4. **Run full test suite** (Tests 1-7)
5. **Monitor in production** for 24-48 hours
6. **Consider Phase 5** if portability is needed

---

## Support & References

### Related Documentation

- [Decap CMS Widget Documentation](https://decapcms.org/docs/custom-widgets/)
- [PERSONAS.md](../PERSONAS.md) - Staff Engineer role definition
- [Issue 02 Implementation Plan](./02-admin-image-handling-ip.md) - Original widget implementation

### Getting Help

If issues occur during implementation:

1. Check browser console for error messages
2. Review initialization sequence in console logs
3. Verify all files saved correctly
4. Clear browser cache and test again
5. Check Decap CMS GitHub issues for similar problems
6. Contact development team

### Debugging Tips

```javascript
// Add to index.html for verbose logging
window.DEBUG_WIDGETS = true;

// Update markWidgetReady to log more detail
window.markWidgetReady = function(widgetName) {
  if (window.DEBUG_WIDGETS) {
    console.log('[DEBUG] Widget ready:', widgetName);
    console.log('[DEBUG] Current state:', window.widgetsReady);
  }
  // ... rest of function
};
```

---

**Implementation Status**: ⏸️ Awaiting Execution
**Last Updated**: 2025-12-21
**Next Review**: After implementation and testing
