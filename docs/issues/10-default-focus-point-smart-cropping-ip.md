# Implementation Plan: Fix Default Focus Point Behavior for Smart Cropping

**Issue #10**

**Status:** Draft
**Author:** Staff Engineer (Claude Sonnet 4.5)
**Date:** 2025-12-30
**Last Updated:** 2025-12-30
**Priority:** P2 - Quality Improvement (improves image cropping for images without manual focus points)

**Related Files:**
- `src/lib/utils/imageProcessing.ts` (normalizeImageData function - lines 118-140)
- `src/lib/utils/cloudinary.ts` (getCloudinaryUrl function - lines 52-109)
- `src/components/ResponsiveImage.astro` (image rendering)
- `src/content/config.ts` (schema definition for image focusPoint)

---

## Executive Summary

The `normalizeImageData()` function **always provides a default focus point** of `{x: 50, y: 50}` for images without user-defined focus points. This causes ALL images to use Cloudinary's manual focus point cropping (`c_crop,g_xy_center,x_0.50,y_0.50`) instead of Cloudinary's intelligent auto-detection (`c_fill,g_auto`) for images where users haven't manually set a focus point.

**Impact:**
- **Medium** - Affects image cropping quality for images without manually set focus points
- Cloudinary's `g_auto` can intelligently detect faces, objects, and important content
- Forcing center cropping (`x_0.50,y_0.50`) loses this intelligence
- Users expect images to "just work" without manual intervention

**Root Cause:**
- `normalizeImageData()` defaults missing focus points to `{x: 50, y: 50}` (lines 129, 137)
- `getCloudinaryUrl()` checks `if (focusPoint)` which is ALWAYS true (line 65)
- No distinction between "no focus point" and "focus point at center"

**Proposed Solution:**
- Make focus point truly optional (allow `undefined`)
- Only default to center in CMS widget (for initial display)
- Use `g_auto` for frontend images without focus points
- Use `g_xy_center` only when focus point is explicitly set

---

## Background

### Cloudinary Cropping Modes

Cloudinary offers two primary cropping strategies:

1. **Smart Auto-Detection** (`c_fill,g_auto`):
   - AI-powered face detection
   - Object detection and importance scoring
   - Automatically finds the most important part of the image
   - Best for images without manual focus points

2. **Manual Focus Point** (`c_crop,g_xy_center,x_XX,y_YY`):
   - User-specified focal point
   - Guarantees specific area is preserved
   - Best when user knows exactly what should be centered

**Current Behavior:**
ALL images use manual focus point mode, even when users haven't set one.

**Expected Behavior:**
- Images WITH focus point → Use `c_crop,g_xy_center` (manual)
- Images WITHOUT focus point → Use `c_fill,g_auto` (intelligent)

---

## Problem Analysis

### Current Implementation

**File:** `src/lib/utils/imageProcessing.ts:118-140`

```typescript
export function normalizeImageData(imageData: ImageData): {
  src: string;
  alt: string;
  focusPoint?: FocusPoint;  // ⚠️ Marked optional but always provided
  crops?: Partial<Record<ImageVariant, CropData>>;
} {
  // Legacy format (string)
  if (typeof imageData === 'string') {
    return {
      src: imageData,
      alt: '',
      focusPoint: { x: 50, y: 50 },  // ❌ ISSUE: Always defaults to center
    };
  }

  // New format (object)
  return {
    src: imageData.src,
    alt: imageData.alt || '',
    focusPoint: imageData.focusPoint || { x: 50, y: 50 },  // ❌ ISSUE: Always defaults to center
    crops: imageData.crops,
  };
}
```

**File:** `src/lib/utils/cloudinary.ts:52-109`

```typescript
export function getCloudinaryUrl(
  publicId: string,
  variant: ImageVariant,
  focusPoint?: FocusPoint  // ⚠️ Marked optional but always truthy
): string {
  const specs = IMAGE_VARIANTS[variant];

  const transformations: string[] = [
    `f_auto`,
    `q_auto`,
  ];

  if (focusPoint) {  // ✅ This check is ALWAYS true due to default in normalizeImageData
    // ... uses c_crop,g_xy_center,x_0.50,y_0.50
  } else {
    // ❌ This code path is NEVER reached!
    // ... uses c_fill,g_auto
  }
}
```

### The Issue

1. **Legacy string format:** `normalizeImageData(image: '/path/to/image.jpg')` → Returns `{ focusPoint: { x: 50, y: 50 } }`
2. **Object without focus point:** `normalizeImageData({ src: '...', alt: '...' })` → Returns `{ focusPoint: { x: 50, y: 50 } }`
3. **Object with focus point:** `normalizeImageData({ src: '...', alt: '...', focusPoint: undefined })` → Returns `{ focusPoint: { x: 50, y: 50 } }`

**Result:** `focusPoint` is NEVER `undefined`, so `getCloudinaryUrl()` ALWAYS uses manual cropping.

---

## Impact Assessment

### Affected Images

**Images WITHOUT manually set focus points:**
- All images uploaded before focus point feature was implemented
- Images where editors didn't click to set a focus point
- Legacy images migrated from old system

**Expected Behavior for These Images:**
- Should use Cloudinary's `g_auto` for intelligent face/object detection
- Should automatically find and preserve important content

**Actual Behavior:**
- Forced center cropping with `x_0.50,y_0.50`
- May crop out faces or important objects that are off-center

### Example Scenarios

| Image Type | User Action | Current Behavior | Expected Behavior |
|------------|-------------|------------------|-------------------|
| Portrait with face on left | No focus point set | Center crop → face may be cut off | `g_auto` detects face, crops to include it |
| Group photo | No focus point set | Center crop | `g_auto` detects faces, includes all |
| Object off-center | No focus point set | Center crop → object cut off | `g_auto` detects main object, includes it |
| Centered subject | No focus point set | Center crop → works fine ✓ | `g_auto` → also works fine ✓ |
| Manually focused | User clicks on image | Custom crop → works perfectly ✓ | Custom crop → works perfectly ✓ |

**Conclusion:** Current implementation works fine for:
- Centered images
- Images with manually set focus points

But fails for:
- Off-center subjects without manual focus points
- Images where editors expect "smart cropping to just work"

---

## Root Cause Analysis

### Why Was Default Implemented This Way?

Looking at the commit history and IP 06 (Remove Uploadcare Dependency), the default focus point was likely added to:
1. **Ensure consistent behavior** - Always have a focus point value
2. **Simplify logic** - Avoid null/undefined checks throughout the codebase
3. **CMS Widget display** - Need a default position for the indicator on first render

**These are valid reasons**, but they led to an unintended consequence: loss of Cloudinary's intelligent auto-detection.

### Semantic Difference

There's an important semantic difference between:

1. **No focus point** (user didn't set one):
   - Frontmatter: `image: { src: '...', alt: '...' }` (no focusPoint field)
   - Intent: "Let Cloudinary decide the best crop"
   - Expected: Use `g_auto` for smart detection

2. **Focus point at center** (user explicitly set it):
   - Frontmatter: `image: { src: '...', alt: '...', focusPoint: { x: 50, y: 50 } }`
   - Intent: "I want this image centered"
   - Expected: Use `g_xy_center,x_0.50,y_0.50`

**Current implementation treats both the same way**, which is incorrect.

---

## Proposed Solution

### Phase 1: Make Focus Point Truly Optional

**Change `normalizeImageData()` to NOT default focus point:**

```typescript
export function normalizeImageData(imageData: ImageData): {
  src: string;
  alt: string;
  focusPoint?: FocusPoint;  // ✅ Truly optional now
  crops?: Partial<Record<ImageVariant, CropData>>;
} {
  // Legacy format (string)
  if (typeof imageData === 'string') {
    return {
      src: imageData,
      alt: '',
      // ✅ CHANGED: No default focus point
      // Let Cloudinary use g_auto for smart cropping
    };
  }

  // New format (object)
  return {
    src: imageData.src,
    alt: imageData.alt || '',
    // ✅ CHANGED: Only use focusPoint if explicitly provided
    focusPoint: imageData.focusPoint,  // undefined if not set
    crops: imageData.crops,
  };
}
```

**Result:**
- Images WITHOUT focus point → `focusPoint` will be `undefined`
- Images WITH focus point → `focusPoint` will be `{ x: XX, y: YY }`
- `getCloudinaryUrl()` will correctly branch between `g_auto` and `g_xy_center`

### Phase 2: Update CMS Widget for Default Display

The CMS widget needs a default focus point for initial rendering (before user clicks).

**File:** `public/admin/index.html` (in the widget initialization)

**Change the initial state:**

```javascript
// Current (in getInitialState or similar):
focusPoint: value.focusPoint || { x: 50, y: 50 }

// Proposed:
focusPoint: value.focusPoint || { x: 50, y: 50 }  // ✓ Keep this for CMS display
```

**BUT** when saving, only save focus point if user has actually clicked:

```javascript
emitChange: function() {
  var imageData = {
    src: this.state.src,
    alt: this.state.alt
  };

  // ✅ Only include focus point if user has clicked on the image
  // Check if focusPoint has been modified from initial state
  if (this.state.focusPointSet) {
    imageData.focusPoint = this.state.focusPoint;
  }

  this.props.onChange(imageData);
}
```

**Add a flag to track if user has set focus point:**

```javascript
handleFocusPointChange: function(e) {
  // ... existing code ...

  this.setState({
    focusPoint: { x: x, y: y },
    focusPointSet: true,  // ✅ Mark that user has set focus point
    // ... imageRect, etc.
  }, function() {
    self.emitChange();
  });
}
```

**Alternative (Simpler):** Allow users to "clear" focus point with a button:

```javascript
// Add a "Clear Focus Point" button in the widget
h('button', {
  onClick: function() {
    self.setState({
      focusPoint: { x: 50, y: 50 },  // Reset to center for display
      focusPointSet: false  // Mark as not set
    }, function() {
      self.emitChange();
    });
  },
  style: { ... }
}, 'Use Auto-Crop')
```

---

## Implementation Steps

### Step 1: Update `normalizeImageData()` in `imageProcessing.ts`

**Location:** Lines 118-140

**Before:**
```typescript
export function normalizeImageData(imageData: ImageData): {
  src: string;
  alt: string;
  focusPoint?: FocusPoint;
  crops?: Partial<Record<ImageVariant, CropData>>;
} {
  if (typeof imageData === 'string') {
    return {
      src: imageData,
      alt: '',
      focusPoint: { x: 50, y: 50 },  // ❌ Removes smart cropping
    };
  }

  return {
    src: imageData.src,
    alt: imageData.alt || '',
    focusPoint: imageData.focusPoint || { x: 50, y: 50 },  // ❌ Removes smart cropping
    crops: imageData.crops,
  };
}
```

**After:**
```typescript
export function normalizeImageData(imageData: ImageData): {
  src: string;
  alt: string;
  focusPoint?: FocusPoint;
  crops?: Partial<Record<ImageVariant, CropData>>;
} {
  if (typeof imageData === 'string') {
    return {
      src: imageData,
      alt: '',
      // ✅ No default focus point - let Cloudinary use g_auto
    };
  }

  return {
    src: imageData.src,
    alt: imageData.alt || '',
    // ✅ Only use focus point if explicitly provided
    focusPoint: imageData.focusPoint,
    crops: imageData.crops,
  };
}
```

### Step 2: Verify `getCloudinaryUrl()` Handles Undefined

**Location:** `src/lib/utils/cloudinary.ts:52-109`

**Current code is already correct:**
```typescript
if (focusPoint) {  // ✅ Will be false if undefined
  // Use c_crop,g_xy_center with custom coordinates
} else {  // ✅ Will be reached when focusPoint is undefined
  // Use c_fill,g_auto
}
```

**No changes needed!** The function already has the correct branching logic.

### Step 3: Update CMS Widget (Optional - Recommended)

**Goal:** Only save focus point when user has explicitly set it.

**Option A: Track if focus point was set**

```javascript
// In getInitialState:
getInitialState: function() {
  var value = this.props.value || {};
  return {
    src: value.src || '',
    alt: value.alt || '',
    focusPoint: value.focusPoint || { x: 50, y: 50 },
    focusPointSet: !!value.focusPoint,  // ✅ Track if it was in the data
    // ... other state
  };
}

// In handleFocusPointChange:
handleFocusPointChange: function(e) {
  // ... calculate x, y ...
  this.setState({
    focusPoint: { x: x, y: y },
    focusPointSet: true,  // ✅ Mark as explicitly set
    // ...
  }, function() {
    self.emitChange();
  });
}

// In emitChange:
emitChange: function() {
  var data = {
    src: this.state.src,
    alt: this.state.alt
  };

  // ✅ Only include focus point if user has set it
  if (this.state.focusPointSet) {
    data.focusPoint = this.state.focusPoint;
  }

  this.props.onChange(data);
}
```

**Option B: Add "Use Auto-Crop" button (Alternative)**

Add a button that lets users explicitly choose between manual and auto-cropping:

```javascript
// Add button in render function:
h('div', { style: { marginTop: '8px' } },
  h('button', {
    type: 'button',
    onClick: function() {
      self.setState({
        focusPoint: { x: 50, y: 50 },  // For display only
        focusPointSet: false  // Don't save to frontmatter
      }, function() {
        self.emitChange();
      });
    },
    style: {
      padding: '6px 12px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    }
  }, 'Clear Focus Point (Use Auto-Crop)')
)
```

**Recommendation:** Implement Option A (simpler, less UI clutter).

---

## Testing Plan

### Test 1: Images Without Focus Points Use Auto-Crop

**Setup:**
1. Create or find an article with an image
2. Remove the `focusPoint` field from frontmatter:
   ```yaml
   image:
     src: dgkralupy/test-image.jpg
     alt: Test image
     # No focusPoint field
   ```

**Test Steps:**
1. Build and run the site
2. Inspect the image element on the frontend
3. Check the Cloudinary URL in `src` attribute

**Expected:**
- URL should contain: `c_fill,g_auto,h_XXX,w_XXX,f_auto,q_auto`
- URL should NOT contain: `c_crop,g_xy_center,x_0.50,y_0.50`

**Actual (Before Fix):**
- URL contains: `c_crop,g_xy_center,x_0.50,y_0.50` (forced center)

### Test 2: Images With Focus Points Use Manual Crop

**Setup:**
1. Use an existing article with focus point set:
   ```yaml
   image:
     src: dgkralupy/adventni-behani.jpg
     alt: Adventní běhání
     focusPoint:
       x: 26
       y: 51
   ```

**Test Steps:**
1. Build and run the site
2. Inspect the image element
3. Check Cloudinary URL

**Expected:**
- URL should contain: `c_crop,g_xy_center,x_0.26,y_0.51,h_XXX,w_XXX,f_auto,q_auto`
- Behavior should be identical to before fix (regression test)

### Test 3: Legacy String Format

**Setup:**
1. Create a component that uses legacy string format:
   ```typescript
   <ResponsiveImage image="/images/test.jpg" variant="card" />
   ```

**Test Steps:**
1. Render the component
2. Check Cloudinary URL

**Expected:**
- URL should use `g_auto` (no focus point)
- Image should render correctly

### Test 4: CMS Widget Behavior

**Setup:**
1. Open an article in CMS
2. Upload a new image (without clicking to set focus point)

**Test Steps:**
1. Save the article
2. Check the frontmatter

**Expected (Without Optional Fix):**
```yaml
image:
  src: dgkralupy/new-image.jpg
  alt: New image
  focusPoint:
    x: 50
    y: 50  # ⚠️ Saved even though user didn't click
```

**Expected (With Optional Fix - Option A):**
```yaml
image:
  src: dgkralupy/new-image.jpg
  alt: New image
  # ✓ No focusPoint field
```

### Test 5: Visual Comparison

**Setup:**
1. Find an image with off-center subject (e.g., face on left side)
2. Create two versions:
   - Version A: No focus point (uses `g_auto`)
   - Version B: Focus point at center (uses `x_0.50,y_0.50`)

**Test Steps:**
1. View both versions in card layout
2. Compare which crop is better

**Expected:**
- Version A (`g_auto`) should intelligently include the face
- Version B (`x_0.50,y_0.50`) might crop out the face

**This test demonstrates the value of the fix.**

---

## Success Criteria

- ✅ Images WITHOUT focus point use `c_fill,g_auto` (smart cropping)
- ✅ Images WITH focus point use `c_crop,g_xy_center` (manual cropping)
- ✅ Legacy string format works correctly (uses `g_auto`)
- ✅ Existing images with focus points continue to work (no regression)
- ✅ CMS widget displays correctly (default focus point for preview)
- ✅ (Optional) CMS widget only saves focus point when user clicks
- ✅ Visual improvement for images with off-center subjects

---

## Risk Assessment

**Risk Level:** ✅ **Low**

**Low Risk Factors:**
1. **Minimal code changes** - Only removing default values
2. **Backwards compatible** - Images with focus points work identically
3. **Cloudinary fallback** - `g_auto` is robust and well-tested
4. **Easy rollback** - Can restore defaults if issues arise

**Potential Issues:**
1. **Existing articles might crop differently**:
   - Articles that relied on default center cropping may change
   - Mitigation: Most images work fine with `g_auto` (often better than center)
2. **CMS widget confusion** (without optional fix):
   - Users might see `x: 50, y: 50` in frontmatter even when they didn't click
   - Mitigation: This is current behavior, so no change in user experience

---

## Rollback Plan

If issues are discovered after deployment:

```bash
# Restore default focus point behavior
git revert <commit-hash>
git push origin main
```

**OR manually revert the changes:**

```typescript
// In imageProcessing.ts, restore defaults:
focusPoint: imageData.focusPoint || { x: 50, y: 50 }
```

**Impact of Rollback:**
- All images return to using manual center cropping
- No data loss
- Existing articles unchanged

---

## Performance Impact

**Expected:** ✅ **None (or slight improvement)**

**Reasoning:**
- `g_auto` and `g_xy_center` have similar performance
- Cloudinary handles both efficiently
- No additional network requests
- May slightly improve quality (better crops = better user experience)

---

## Future Enhancements (Out of Scope)

1. **Face Detection Preview**: Show detected faces in CMS widget
2. **Crop Comparison**: Side-by-side preview of `g_auto` vs manual crop
3. **Smart Suggestions**: Use Cloudinary API to suggest focus points
4. **Per-Variant Focus Points**: Different focus points for card vs hero
5. **Crop Zones**: Define custom crop areas instead of just points

---

## References

- [Cloudinary Auto Gravity Documentation](https://cloudinary.com/documentation/image_transformations#control_gravity)
- [Cloudinary Custom Focus Areas](https://cloudinary.com/documentation/custom_focus_areas)
- [IP 06: Remove Uploadcare Dependency](./06-remove-uploadcare-dependency-ip.md)
- [IP 08: Focus Point Precision Fix](./08-focus-point-precision-fix-ip.md)
- [IP 09: Focus Point Container vs Image Fix](./09-focus-point-container-vs-image-fix-ip.md)

**Sources:**
- [Image Transformation Reference | Cloudinary](https://cloudinary.com/documentation/image_transformation_reference)
- [Automatic Gravity (g_auto) | Cloudinary](https://cloudinary.com/documentation/image_transformations#automatic_gravity)

---

## Implementation Checklist

### Pre-Implementation
- [x] Review current behavior with test images
- [x] Identify articles without focus points (found 4 articles with default 50, 50)
- [ ] Test `g_auto` vs `x_0.50,y_0.50` visually (requires visual testing)
- [ ] Get stakeholder approval

### Code Changes
- [x] Update `normalizeImageData()` in `imageProcessing.ts`
  - [x] Remove default focus point for legacy string format
  - [x] Remove default focus point for object format
  - [x] Add comments explaining the change
- [x] Verify `getCloudinaryUrl()` handles undefined correctly (no changes needed)
- [ ] (Optional) Update CMS widget to track `focusPointSet`
- [ ] (Optional) Add "Clear Focus Point" button in widget

### Testing
- [ ] Test 1: Images without focus points use `g_auto` (requires URL inspection)
- [ ] Test 2: Images with focus points use manual crop (regression)
- [ ] Test 3: Legacy string format works
- [ ] Test 4: CMS widget behavior (with/without optional fix)
- [ ] Test 5: Visual comparison (g_auto vs center crop)

### Documentation
- [ ] Update `docs/widgets/enhanced-image-widget.md`
- [ ] Add section explaining focus point vs auto-crop behavior
- [ ] Update `docs/issues/06-remove-uploadcare-dependency-ip.md` if needed

### Deployment
- [x] Test locally with multiple articles (verified 7 articles, 4 with default center)
- [x] Build and verify no errors (build successful, 32 pages generated)
- [ ] Deploy to production
- [ ] Monitor for issues (first 48 hours)
- [ ] Mark IP as completed

---

**Last Updated:** 2025-12-30
**Status:** Implemented - Ready for Testing
**Implementation Date:** 2025-12-30
**Branch:** feature/10-default-focus-point-smart-cropping
**Commit:** cb19ab8
**Next Steps:** Visual testing, then deploy to production and monitor

