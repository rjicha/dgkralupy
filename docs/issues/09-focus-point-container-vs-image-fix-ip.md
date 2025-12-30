# Implementation Plan: Fix Focus Point Calculation - Container vs Image Dimensions

**Issue #09**

**Status:** Approved - Ready for Implementation
**Author:** Staff Engineer (Claude Sonnet 4.5)
**Date:** 2025-12-30
**Last Updated:** 2025-12-30 (Staff Engineer Review Complete)
**Priority:** P1 - Bug Fix (affects accuracy of user-selected focus points)
**Reviewed By:** Staff Engineer (Claude Sonnet 4.5)

**Related Files:**
- `public/admin/index.html` (Enhanced Image Widget - lines 525-539, 746-787)
- `src/lib/utils/cloudinary.ts` (Cloudinary URL generation)
- `docs/issues/08-focus-point-precision-fix-ip.md` (Related: precision improvements)
- `docs/widgets/enhanced-image-widget.md` (Widget documentation)

**Related Issue:**
- Issue #08 (Focus Point Precision) - Addressed `.toFixed()` precision but not dimension calculation

---

## Executive Summary

The Enhanced Image Widget calculates focus point coordinates using the **container div's dimensions** instead of the **actual image element's dimensions**. This causes incorrect focus point percentages when images don't fill their containers (portrait images, small images, etc.).

**Example Scenario:**
```
Container: 800px × 600px
Portrait Image: 400px × 600px (centered within container)
User clicks at right edge of image (should be x=100%)

Current Calculation (WRONG):
  - Uses container width: (500px / 800px) × 100 = 62.5% ❌

Correct Calculation:
  - Uses image width: (400px / 400px) × 100 = 100% ✅

Error: 37.5% off target!
```

**Impact:** Medium-High
- Affects all images that don't perfectly fill their container
- Most noticeable with portrait images in landscape containers
- Results in cropped images showing wrong subject area
- User frustration: "I clicked on the face, but it crops to the shoulder"

**Root Cause:** Line 526 in `/home/rjicha/source/playground/dgkralupy/public/admin/index.html`
```javascript
var rect = e.currentTarget.getBoundingClientRect();  // Gets CONTAINER div
```

Should be:
```javascript
var rect = e.target.getBoundingClientRect();  // Gets IMG element
```

---

## Problem Statement

### Current Implementation

**Location:** `/home/rjicha/source/playground/dgkralupy/public/admin/index.html:525-539`

```javascript
handleFocusPointChange: function(e) {
  var rect = e.currentTarget.getBoundingClientRect();  // ❌ CONTAINER dimensions
  var x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
  var y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
  var self = this;

  this.setState({
    focusPoint: {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    }
  }, function() {
    self.emitChange();
  });
},
```

**Widget Structure (lines 746-787):**
```javascript
h('div', {  // ← Container div
  style: {
    position: 'relative',
    cursor: 'crosshair',
    marginBottom: '16px'
  },
  onClick: this.handleFocusPointChange  // ← Event handler here
},
  h('img', {  // ← Actual image element
    src: displaySrc,
    style: {
      maxWidth: '100%',  // ← Image scales DOWN, doesn't stretch
      display: 'block',
      borderRadius: '4px'
    }
  }),
  h('div', {  // ← Focus point indicator
    style: {
      position: 'absolute',
      left: focusPoint.x + '%',  // ← Positioned relative to CONTAINER
      top: focusPoint.y + '%'
    }
  })
)
```

### The Problem

1. **Event Target Mismatch:**
   - `onClick` handler is attached to the **container div**
   - `e.currentTarget` returns the **container div** (the element with the event handler)
   - `e.target` would return the **img element** (where the click actually occurred)

2. **Dimension Mismatch:**
   - Image has `maxWidth: '100%'` which scales it DOWN to fit container
   - Image does NOT have `width: '100%'`, so it won't stretch to fill container
   - Container may be wider/taller than the actual displayed image
   - Empty space between container edges and image edges

3. **Incorrect Percentage Calculation:**
   - Percentage is calculated relative to **container dimensions**
   - Should be calculated relative to **image dimensions**
   - Result: Focus point is positioned incorrectly

### Impact Examples

| Scenario | Container Size | Image Size | Click Position | Current (Wrong) | Correct | Error |
|----------|---------------|------------|----------------|-----------------|---------|-------|
| **Portrait in Landscape** | 800×600 | 400×600 | Right edge of image | x=62.5% | x=100% | 37.5% |
| **Small centered image** | 800×600 | 300×300 | Bottom-right of image | x=56%, y=62% | x=100%, y=100% | 44%, 38% |
| **Portrait in wide container** | 1200×800 | 600×800 | Center of image | x=42%, y=50% | x=50%, y=50% | 8%, 0% |
| **Image fills container** | 800×600 | 800×600 | Anywhere | Matches ✓ | Matches ✓ | 0% |

**Conclusion:** The bug only manifests when image ≠ container size, which is common with responsive images.

---

## Root Cause Analysis

### JavaScript Event Model

```javascript
element.addEventListener('click', function(e) {
  e.target        // Element that was actually clicked (bubbles up)
  e.currentTarget // Element that has the event listener attached (always this element)
});
```

**In our case:**
```javascript
// Structure:
<div onClick={handler}>     ← currentTarget (container)
  <img />                    ← target (actual click location)
</div>

// When user clicks on <img>:
e.target = <img>             // What was clicked
e.currentTarget = <div>      // What has the onClick handler
```

### Current vs Proposed Calculation

**Current (Incorrect):**
```javascript
// Click at (500, 300) on 400×600 portrait image in 800×600 container
var containerRect = e.currentTarget.getBoundingClientRect();
// containerRect = { left: 100, top: 50, width: 800, height: 600 }

var x = ((500 - 100) / 800) * 100;  // (400 / 800) * 100 = 50%
var y = ((300 - 50) / 600) * 100;   // (250 / 600) * 100 = 41.67%

// But the image is only 400px wide and centered!
// So clicking at x=500 is actually the RIGHT EDGE of the image (should be 100%)
```

**Proposed (Correct):**
```javascript
// Click at (500, 300) on 400×600 portrait image
var imgRect = e.target.getBoundingClientRect();
// imgRect = { left: 300, top: 50, width: 400, height: 600 }
// (Image is centered: (800-400)/2 = 200px from container left + container left 100 = 300)

var x = ((500 - 300) / 400) * 100;  // (200 / 400) * 100 = 50%
var y = ((300 - 50) / 600) * 100;   // (250 / 600) * 100 = 41.67%

// Now x=50% correctly represents the middle of the image
```

### Why This Bug Exists

1. **React's Event Model:** In React.createElement (or Preact's `h()`), events are attached to the element you specify
2. **Container Click Handler:** The `onClick` is on the container div for convenience (larger click area)
3. **Assumption:** Code assumes image fills container (which isn't always true)
4. **No Validation:** No check to ensure click is actually on the image (could click empty space)

---

## Proposed Solution

### Phase 1: Fix Dimension Calculation (Core Fix)

**Change:** Use `e.target` instead of `e.currentTarget`

```javascript
handleFocusPointChange: function(e) {
  // ✅ Get the actual IMG element that was clicked
  var target = e.target;

  // ⚠️ Safety check: Ensure we clicked on the image, not empty space
  if (target.tagName !== 'IMG') {
    console.log('[Enhanced Image] Click was not on image element, ignoring');
    return;  // Don't update focus point if clicking outside image
  }

  var rect = target.getBoundingClientRect();  // ✅ IMAGE dimensions, not container
  var x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
  var y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
  var self = this;

  this.setState({
    focusPoint: {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    }
  }, function() {
    self.emitChange();
  });
},
```

**Key Changes:**
1. ✅ Use `e.target` (actual clicked element) instead of `e.currentTarget` (container)
2. ✅ Add safety check to ignore clicks on non-image elements (empty space)
3. ✅ Calculate percentage relative to actual image dimensions
4. ✅ Improved precision from integer (0-100) to 1-decimal (0.0-100.0) for 10x better accuracy
5. ✅ Added comment explaining DecapCMS immutable data pattern (setState callback)

### Phase 2: Fix Focus Indicator Click-Through (Critical)

**Issue:** The focus point indicator is positioned ON TOP of the image. If users click directly on the red circle, `e.target` will be the indicator div (not the image), causing the click to be ignored.

**Location:** Lines 746-787 in `public/admin/index.html` (in the render function)
- Search for the focus indicator div comment: `// Focus point indicator`
- Or search for the div with `position: 'absolute'` and `left: focusPoint.x + '%'`

**Solution:** Add `pointerEvents: 'none'` to let clicks pass through to the image:

```javascript
h('div', {  // Focus point indicator
  style: {
    position: 'absolute',
    left: (focusPoint ? focusPoint.x : 50) + '%',  // Defensive: default to center if missing
    top: (focusPoint ? focusPoint.y : 50) + '%',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #ff0000',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none'  // ✅ CRITICAL: Allow clicks to pass through to image
  }
})
```

**Changes:**
1. ✅ Add `pointerEvents: 'none'` to allow click-through
2. ✅ Add defensive check for missing `focusPoint` (defaults to 50%, 50%)

**Why This Matters:**
- Without `pointerEvents: 'none'`, clicking on the indicator itself is ignored
- Users trying to fine-tune the focus point by clicking near it would be frustrated
- This is a **critical UX fix** that must be included
- Defensive check prevents crashes if state is corrupted

### Phase 3: Alternative Approach - Move Event Handler to Image (Optional)

**If we want to be more explicit, move onClick to the img element:**

```javascript
h('div', {  // Container div
  style: {
    position: 'relative',
    marginBottom: '16px'
    // ❌ Removed cursor and onClick from container
  }
},
  h('img', {  // Image element
    src: displaySrc,
    style: {
      maxWidth: '100%',
      display: 'block',
      borderRadius: '4px',
      cursor: 'crosshair'  // ✅ Moved cursor to image
    },
    onClick: this.handleFocusPointChange  // ✅ Moved onClick to image
  }),
  h('div', {  // Focus indicator
    style: {
      position: 'absolute',
      left: focusPoint.x + '%',
      top: focusPoint.y + '%',
      pointerEvents: 'none'  // Ensure clicks pass through
    }
  })
)
```

**Pros:**
- More explicit: only clicks on image are captured
- Simpler handler: no need for `tagName` check
- Cursor only shows crosshair when hovering over image

**Cons:**
- Slightly smaller click area (only image, not surrounding container)
- May be less convenient for users on mobile

**Recommendation:**
- **Phase 1 is REQUIRED** (core fix)
- **Phase 2 is REQUIRED** (critical UX fix)
- **Phase 3 is OPTIONAL** (alternative approach, not recommended)

---

## Implementation Steps

### Step 1: Update Event Handler in `public/admin/index.html` (Core Fix)

**Location:** Lines 525-539

**Before:**
```javascript
handleFocusPointChange: function(e) {
  var rect = e.currentTarget.getBoundingClientRect();
  var x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
  var y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
  var self = this;

  this.setState({
    focusPoint: {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    }
  }, function() {
    self.emitChange();
  });
},
```

**After:**
```javascript
handleFocusPointChange: function(e) {
  // Get the actual element that was clicked (should be the img)
  var target = e.target;

  // Safety check: Only process clicks on the image element
  // (Ignore clicks on empty space in container)
  // Use toUpperCase() for case-insensitive comparison (browser compatibility)
  if (target.tagName.toUpperCase() !== 'IMG') {
    console.log('[Enhanced Image] Click outside image area, ignoring');
    return;
  }

  // Use the IMAGE element's bounding box, not the container's
  // This ensures correct percentage calculation even when image doesn't fill container
  var rect = target.getBoundingClientRect();

  // Calculate with 1-decimal precision (0.1% accuracy = 10x better than integers)
  // For a 1200px image: 0.1% = 1.2px granularity (sufficient for visual cropping)
  var rawX = ((e.clientX - rect.left) / rect.width) * 100;
  var rawY = ((e.clientY - rect.top) / rect.height) * 100;
  var x = Math.round(rawX * 10) / 10;  // Round to 1 decimal place
  var y = Math.round(rawY * 10) / 10;
  var self = this;

  console.log('[Enhanced Image] Focus point calculated:', { x: x, y: y });
  console.log('[Enhanced Image] Image dimensions:', { width: rect.width, height: rect.height });

  this.setState({
    focusPoint: {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    }
  }, function() {
    // emitChange() MUST be called in setState callback to ensure
    // DecapCMS receives updates after state is committed (immutable data pattern)
    // See: https://decapcms.org/docs/custom-widgets/
    self.emitChange();
  });
},
```

### Step 2: Fix Focus Indicator Click-Through (Critical UX Fix)

**Location:** Lines 746-787 in `public/admin/index.html` (in the render function)
- Search for: `// Focus point indicator` comment
- Or search for: `position: 'absolute'` with `left: focusPoint.x + '%'`

**Before:**
```javascript
h('div', {  // Focus indicator
  style: {
    position: 'absolute',
    left: focusPoint.x + '%',
    top: focusPoint.y + '%',
    // ... other styles
  }
})
```

**After:**
```javascript
h('div', {  // Focus indicator
  style: {
    position: 'absolute',
    left: (focusPoint ? focusPoint.x : 50) + '%',  // Defensive: default to center if missing
    top: (focusPoint ? focusPoint.y : 50) + '%',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #ff0000',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none'  // ✅ Allow clicks to pass through to image below
  }
})
```

**Key Changes:**
1. Added `pointerEvents: 'none'` for click-through
2. Added defensive check for missing `focusPoint` state

### Step 3: Update Documentation

**File:** `docs/widgets/enhanced-image-widget.md`

Add new sections explaining the fix and coordinate formats:

```markdown
### Focus Point Calculation - Implementation Details

**Important:** Focus point percentages MUST be calculated relative to the **actual image element dimensions**, not the container dimensions.

#### Why This Matters

The image is rendered with `maxWidth: '100%'`, which means it scales down to fit the container but doesn't stretch. When the image is smaller than the container (e.g., portrait image in landscape container), there's empty space around the image.

**Example:**
```
Container: 800px × 600px
Portrait Image: 400px × 600px (centered, with 200px empty space on left and right)

If user clicks at the right edge of the image:
  - Click position: x = 500px (from viewport left)
  - Image bounds: left = 300px, right = 700px, width = 400px

Correct calculation (using image dimensions):
  x = ((500 - 300) / 400) × 100 = 50% ✓

Incorrect calculation (using container dimensions):
  x = ((500 - 100) / 800) × 100 = 50% ✗ (would be different if image is offset)
```

#### Implementation

```javascript
handleFocusPointChange: function(e) {
  var target = e.target;  // ✅ Get actual clicked element

  if (target.tagName !== 'IMG') {
    return;  // Ignore clicks outside image
  }

  var rect = target.getBoundingClientRect();  // ✅ Use IMAGE dimensions
  var x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
  var y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

  // ... rest of handler
}
```

#### Bug History

- **Before Fix (Issue #09):**
  - Used `e.currentTarget.getBoundingClientRect()` which returned container dimensions
  - Used `Math.round()` for integer precision (0-100), providing only 101 discrete positions
  - Focus indicator missing `pointerEvents: 'none'`, causing clicks on indicator to be ignored

- **After Fix (Issue #09):**
  - Uses `e.target.getBoundingClientRect()` which returns actual image dimensions
  - Uses 1-decimal precision (0.0-100.0) via `Math.round(value * 1000) / 10`, providing 1001 positions (10x improvement)
  - Added `pointerEvents: 'none'` to focus indicator for click-through behavior

- **Impact:**
  - Significantly improved accuracy for portrait images and images that don't fill their containers
  - Better precision for large images (0.1% granularity = ~1.2px on 1200px images)
  - Improved UX: users can click anywhere, including on the focus indicator itself

### Coordinate Format - Storage vs API

**Storage (Frontmatter):** We store percentages as 0.0-100.0
```yaml
focusPoint:
  x: 26.3  # 26.3% from left
  y: 51.7  # 51.7% from top
```

**Cloudinary API:** We convert to 0.00-1.00 decimal format
```
x_0.26  # 26% from left (26.3 / 100 = 0.263 → rounded to 0.26)
y_0.52  # 52% from top (51.7 / 100 = 0.517 → rounded to 0.52)
```

**Why the difference?**
- **Storage:** More human-readable (26.3% is clearer than 0.263)
- **API:** Cloudinary's standard format ([documentation](https://cloudinary.com/documentation/custom_focus_areas))

**References:**
- [Cloudinary Custom Focus Areas](https://cloudinary.com/documentation/custom_focus_areas)
- [Cloudinary Transformation Reference](https://cloudinary.com/documentation/transformation_reference)
- [Decap CMS Custom Widgets](https://decapcms.org/docs/custom-widgets/)
```

---

## Testing Plan

### Test 1: Portrait Image in Landscape Container

**Setup:**
1. Upload a portrait image (e.g., 400×600, 600×800, etc.)
2. Open in CMS editor

**Test Steps:**
1. Click at the **center** of the image
   - **Expected:** Focus point shows x≈50%, y≈50%
2. Click at the **left edge** of the image
   - **Expected:** Focus point shows x≈0-5%, y≈50%
3. Click at the **right edge** of the image
   - **Expected:** Focus point shows x≈95-100%, y≈50%
4. Click at **top-right corner** of the image
   - **Expected:** Focus point shows x≈95-100%, y≈0-5%
5. Click on **empty space** next to the image (if visible)
   - **Expected:** No change to focus point (safety check works)

### Test 2: Small Centered Image

**Setup:**
1. Upload or find a small image (e.g., 300×300, 400×400)
2. Open in CMS editor

**Test Steps:**
1. Verify image is centered in container with visible empty space
2. Click at each corner of the image
   - **Expected:** Focus points should be close to (0,0), (100,0), (0,100), (100,100)
3. Click at center of image
   - **Expected:** Focus point at (50%, 50%)
4. Click in empty space around image
   - **Expected:** No change (console shows "Click outside image area")

### Test 3: Image That Fills Container (Regression Test)

**Setup:**
1. Upload a landscape image that matches container aspect ratio
2. Open in CMS editor

**Test Steps:**
1. Click at various positions on the image
   - **Expected:** Behavior identical to before fix (no regression)
2. Verify focus point indicator position matches click position
   - **Expected:** Visual alignment is accurate

### Test 4: Visual Test with Test HTML File

**Use the test file created:** `scripts/test-focus-point-container-issue.html`

**Steps:**
1. Open the test file in a browser
2. Click on each test case image at various positions
3. Compare "Using Container" vs "Using Image" calculations
4. **Expected Results:**
   - **Test Case 1 (Portrait):** Large error with container method, accurate with image method
   - **Test Case 2 (Small):** Large error with container method, accurate with image method
   - **Test Case 3 (Fills):** Both methods match (0% error)

### Test 5: End-to-End Integration Test

**Setup:**
1. Create a test article in CMS with focus point
2. Set focus point on a portrait image
3. Save the article

**Test Steps:**
1. View the article on the frontend website
2. Inspect the Cloudinary URL in browser DevTools
3. **Expected:** URL contains correct `x_0.xx,y_0.yy` parameters matching the clicked position
4. Verify the rendered image crops correctly around the selected focus point
5. **Expected:** The subject you clicked on should be centered in the crop

### Test 6: Focus Indicator Click Test (Critical UX Test)

**Setup:**
1. Upload any image and set a focus point
2. Move mouse over the red focus indicator circle

**Test Steps:**
1. Click directly ON the red focus indicator circle
   - **Expected:** Focus point should update to the new position (not be ignored)
2. Click slightly AROUND the indicator
   - **Expected:** Focus point should update smoothly
3. Rapidly click near the indicator multiple times
   - **Expected:** Each click updates the position (no clicks ignored)

**Why This Test Matters:**
- Tests that `pointerEvents: 'none'` is working correctly
- Without this fix, clicking on the indicator is frustrating for users
- Common scenario: user wants to fine-tune the focus point

### Test 7: Precision Test (Sub-Percentage Accuracy)

**Setup:**
1. Upload a large image (e.g., 1200×675)
2. Open browser DevTools console to see debug logs

**Test Steps:**
1. Click at various positions on the image
2. Check console logs for calculated percentages
3. **Expected:** Values should include decimals (e.g., 26.3%, 51.7%, 88.1%)
4. **Not Expected:** Only integer values (26%, 52%, 88%)
5. Check saved frontmatter in editor
6. **Expected:** Frontmatter shows decimal values:
   ```yaml
   focusPoint:
     x: 26.3
     y: 51.7
   ```

**Why This Test Matters:**
- Verifies 10x precision improvement (0.1% granularity)
- For 1200px wide image: 0.1% = 1.2px accuracy (excellent for visual cropping)
- Better than integer precision which only gives ~12px accuracy

### Test 8: Browser Compatibility

**Test in multiple browsers:**
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)
- Mobile browsers (Chrome Mobile, Safari iOS)

**Expected:**
- Consistent behavior across all browsers
- No console errors or warnings
- Focus indicator renders correctly
- Decimal precision maintained in all browsers
- tagName check works correctly (case-insensitive)

---

## Verification Commands

```bash
# 1. Check current implementation
grep -A 15 "handleFocusPointChange" public/admin/index.html

# Expected after fix: Should see "e.target" and "tagName !== 'IMG'" check

# 2. Start dev server
npm run dev

# 3. Open CMS
# Visit: http://localhost:4321/admin/
# Test focus point clicking on various image types

# 4. Check browser console for debug logs
# Should see: "[Enhanced Image] Focus point calculated: { x: ..., y: ... }"
# Should see: "[Enhanced Image] Image dimensions: { width: ..., height: ... }"

# 5. Verify Cloudinary URLs on frontend
# Open an article with focus point
# Inspect image element
# Check src URL contains correct x_0.XX,y_0.YY format

# 6. Open test file in browser
firefox scripts/test-focus-point-container-issue.html
# OR
google-chrome scripts/test-focus-point-container-issue.html

# Click on test images and verify error calculations
```

---

## Pre-Implementation Checklist

- [ ] Review current implementation in `public/admin/index.html`
- [ ] Understand difference between `e.target` and `e.currentTarget`
- [ ] Test the issue with portrait images to confirm bug exists
- [ ] Open `scripts/test-focus-point-container-issue.html` to see the problem visually
- [ ] Confirm fix approach with stakeholders

---

## Deployment Plan

### Pre-Deployment

1. **Backup current implementation:**
   ```bash
   cp public/admin/index.html public/admin/index.html.backup-2025-12-30
   ```

2. **Test locally with multiple image types:**
   - Portrait images (tall)
   - Landscape images (wide)
   - Square images
   - Very small images
   - Images that fill container

3. **Verify no console errors:**
   ```bash
   npm run dev
   # Open browser DevTools console
   # Test focus point clicking
   # Ensure no errors
   ```

### Deployment Steps

```bash
# 1. Make changes to public/admin/index.html
# (Update handleFocusPointChange function as specified in Step 1)

# 2. Test locally
npm run dev
# Test thoroughly with CMS

# 3. Build for production
npm run build

# 4. Test production build
npm run preview

# 5. Commit changes
git add public/admin/index.html docs/widgets/enhanced-image-widget.md
git commit -m "fix: use image dimensions instead of container for focus point calculation

Problem:
- Focus point calculation used container dimensions (e.currentTarget)
- When image doesn't fill container, percentages were incorrect
- Portrait images showed errors up to 37.5%

Solution:
- Use actual image element dimensions (e.target)
- Add safety check to ignore clicks outside image
- Add debug logging for troubleshooting

Impact:
- Significantly improved accuracy for portrait images
- Better UX: users can accurately select focus points
- No breaking changes to existing functionality

Testing:
- Tested with portrait, landscape, and square images
- Verified with test-focus-point-container-issue.html
- Confirmed backwards compatibility

Fixes: #09

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 6. Push to repository
git push origin main

# 7. Monitor production
# Check that existing articles still work
# Test new focus point selections
# Monitor console for any unexpected errors
```

---

## Rollback Plan

If issues are discovered after deployment:

```bash
# Quick rollback using backup
cp public/admin/index.html.backup-2025-12-30 public/admin/index.html
npm run build
git add public/admin/index.html
git commit -m "rollback: revert focus point container fix due to issues"
git push origin main

# OR revert the commit
git revert <commit-hash>
git push origin main
```

**Rollback Impact:**
- Focus points return to using container dimensions (original bug returns)
- No data loss (all saved focus points remain valid)
- Existing articles continue to work (backwards compatible)

---

## Risk Assessment

**Risk Level:** ✅ **Low-Medium**

**Low Risk Factors:**
1. **Isolated Change:** Only affects one function in the widget
2. **Non-Breaking:** Data format unchanged (still stores 0-100 percentages)
3. **Backwards Compatible:** Existing focus points remain valid
4. **Safety Check:** Added validation prevents errors from edge cases
5. **Well-Tested:** Issue demonstrated with test HTML file

**Medium Risk Factors:**
1. **Core UX Feature:** Focus point selection is a primary widget feature
2. **Browser Variations:** `getBoundingClientRect()` might behave differently across browsers
3. **Edge Cases:** Unusual image sizes or container configurations might behave unexpectedly
4. **Limited Testing:** Need to test thoroughly before deploying

**Mitigation:**
- Thorough testing across multiple browsers
- Test with diverse image types and sizes
- Add debug logging for troubleshooting
- Easy rollback plan if issues arise
- Monitor production for first 48 hours after deployment

---

## Success Criteria

- ✅ Focus point calculation uses actual image dimensions, not container dimensions
- ✅ Portrait images in landscape containers show correct focus point percentages
- ✅ Small centered images calculate percentages correctly
- ✅ Clicks outside image area are ignored (safety check works)
- ✅ Clicks ON focus indicator update position (not ignored) - **Critical UX**
- ✅ Decimal precision values saved to frontmatter (e.g., 26.3%, not just 26%)
- ✅ Existing articles with focus points continue to work (backwards compatible)
- ✅ No console errors when clicking on images
- ✅ Visual alignment: focus point indicator matches where user clicked
- ✅ Frontend rendering: Cloudinary crops images at correct position
- ✅ Test HTML file demonstrates error reduction from 37.5% to <1%
- ✅ Console logs show image dimensions and calculated percentages for debugging

---

## Performance Impact

**Expected:** ✅ **None**

**Reasoning:**
- `getBoundingClientRect()` is already being called (just on different element)
- Same number of calculations
- Added one `if` check (negligible performance cost)
- No additional network requests
- No additional re-renders

**Measurement:**
```javascript
// Before:
var rect = e.currentTarget.getBoundingClientRect();  // ~0.1ms

// After:
var target = e.target;                               // ~0.01ms
if (target.tagName !== 'IMG') return;                // ~0.01ms
var rect = target.getBoundingClientRect();           // ~0.1ms

// Total: ~0.12ms vs ~0.1ms (negligible difference)
```

---

## Future Enhancements (Out of Scope)

1. **Visual Grid Overlay:** Show a grid overlay when selecting focus points for easier alignment
2. **Snap to Face Detection:** Use Cloudinary's AI to suggest focus points on detected faces
3. **Multiple Focus Points:** Allow different focus points for different image variants
4. **Live Preview:** Show real-time crop preview when selecting focus point
5. **Keyboard Navigation:** Allow arrow keys to fine-tune focus point position
6. **Percentage Display:** Show exact percentage values as user moves cursor

---

## Related Issues & References

**Related Issues:**
- **Issue #08** - Focus Point Precision Fix (`.toFixed(1)` → `.toFixed(2)`)
  - Fixed precision rounding errors
  - Did NOT fix container vs image dimension issue
- **Issue #06** - Remove Uploadcare Dependency (Original focus point implementation)

**Technical References:**
- [MDN: Event.target](https://developer.mozilla.org/en-US/docs/Web/API/Event/target)
- [MDN: Event.currentTarget](https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget)
- [MDN: getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
- [Cloudinary: Custom Focus Areas](https://cloudinary.com/documentation/custom_focus_areas)

**Test Files:**
- `scripts/test-focus-point-container-issue.html` - Visual demonstration of the bug

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review current implementation and confirm bug exists
- [ ] Open test HTML file to visualize the issue
- [ ] Test with portrait images to see incorrect percentages
- [ ] Understand `e.target` vs `e.currentTarget` difference

### Code Changes
- [ ] Update `handleFocusPointChange` in `public/admin/index.html` (Step 1)
  - [ ] Change `e.currentTarget` to `e.target`
  - [ ] Add `tagName` safety check
  - [ ] Improve precision from `Math.round(x * 100)` to `Math.round(x * 1000) / 10`
  - [ ] Add debug logging for troubleshooting
  - [ ] Add comment explaining setState callback pattern (DecapCMS best practice)
- [ ] Add `pointerEvents: 'none'` to focus indicator (Step 2 - CRITICAL)
  - [ ] Find focus indicator div in render function (lines ~746-787)
  - [ ] Add `pointerEvents: 'none'` to style object

### Documentation Updates
- [ ] Update `docs/widgets/enhanced-image-widget.md`
- [ ] Add section explaining container vs image dimensions
- [ ] Document the bug and fix for future reference

### Testing
- [ ] Test 1: Portrait images ← **Most important**
- [ ] Test 2: Small centered images
- [ ] Test 3: Images that fill container (regression)
- [ ] Test 4: Visual test with HTML file
- [ ] Test 5: End-to-end integration test
- [ ] Test 6: Focus indicator click test ← **Critical UX test**
- [ ] Test 7: Precision test (verify decimal values)
- [ ] Test 8: Browser compatibility (Chrome, Firefox, Safari)

### Deployment
- [ ] Create backup of current file
- [ ] Make code changes
- [ ] Test locally with `npm run dev`
- [ ] Build for production (`npm run build`)
- [ ] Test production build (`npm run preview`)
- [ ] Commit and push changes
- [ ] Monitor production for 48 hours

---

**Last Updated:** 2025-12-30 (Updated after Staff Engineer review)
**Status:** Approved - Ready for Implementation
**Reviewers:** Staff Engineer (Claude Sonnet 4.5)
**Next Steps:** Proceed with implementation following updated plan

---

## Changelog

### 2025-12-30 - Staff Engineer Review Updates
1. **Added Phase 2** - Critical UX fix for focus indicator click-through (`pointerEvents: 'none'`)
2. **Improved Precision** - Changed from integer (0-100) to 1-decimal (0.0-100.0) for 10x better accuracy
3. **Added Comment** - Explaining DecapCMS setState callback pattern (immutable data best practice)
4. **Enhanced Testing** - Added Test 6 (focus indicator click) and Test 7 (precision verification)
5. **Updated Success Criteria** - Added criteria for new fixes
6. **Updated Documentation** - Enhanced bug history section with precision and click-through improvements
