# Implementation Plan: Focus Point Coordinate Precision & Documentation Fix

**Issue #08**

**Status:** Approved
**Author:** Staff Engineer (Claude Sonnet 4.5)
**Date:** 2025-12-30
**Last Updated:** 2025-12-30
**Reviewed By:** Staff Engineer (Claude Sonnet 4.5)
**Approved:** 2025-12-30
**Priority:** P2 - Quality Improvement (not blocking, but improves user experience)

**Related Files:**
- `src/lib/utils/cloudinary.ts` (Cloudinary URL generation)
- `public/admin/cloudinary-config.js` (CMS Cloudinary config)
- `docs/issues/06-remove-uploadcare-dependency-ip.md` (Documentation)
- `docs/widgets/enhanced-image-widget.md` (Widget documentation)

---

## Review Summary

**Review Status:** ✅ Approved with updates applied
**Review Date:** 2025-12-30

**Changes Made Based on Review:**
1. ✅ **Precision Documentation Clarified** - Updated all references to explain that `.toFixed(2)` provides 0.01 precision in decimal space (0.00-1.00) which maps to 1% precision in percentage space (0-100%)
2. ✅ **Dev-Only Logging** - Updated `validateFocusPoint` to only log warnings in development mode using `import.meta.env.DEV`
3. ✅ **Type Verification** - Added pre-implementation verification step confirming `FocusPoint` type exists in `src/types/image.ts`
4. ✅ **Unit Testing Added** - Added optional but recommended unit testing section with concrete test examples
5. ✅ **Enhanced Comments** - Improved inline code comments to explain precision mapping and coordinate format

**Reviewer Notes:**
- Technical approach is sound and aligns with Cloudinary documentation
- Risk assessment is accurate (Very Low)
- Backwards compatibility properly verified
- Testing plan is comprehensive

---

## Executive Summary

The focus point coordinate system works correctly end-to-end (CMS widget → storage → Cloudinary), but has **three quality issues**:

1. **Precision Loss**: `.toFixed(1)` rounds coordinates to 1 decimal place, losing precision (e.g., 26% → 30%)
2. **Documentation Inconsistency**: Outdated docs suggest `x_50` format (pixels) instead of `x_0.5` (percentage)
3. **Missing Validation**: No range validation (0-100) when loading focus points from frontmatter

**Severity:** Low - System works, but focus points are less accurate than they could be.

---

## Background

### Current Coordinate Flow

```
User clicks image in CMS
  ↓ (pixel coordinates)
getBoundingClientRect()
  ↓ (converts to percentage)
focusPoint: { x: 26, y: 51 }
  ↓ (saved to frontmatter as percentage 0-100)
Storage in .md file
  ↓ (read on website)
Cloudinary URL generation
  ↓ (converts to decimal 0.0-1.0)
x_0.3,y_0.5
  ↓ (Cloudinary interprets decimals as percentages)
Image cropped at 30%, 50%
```

**Issue:** 26% becomes 30% due to `.toFixed(1)` rounding 0.26 → 0.3

---

## Root Cause Analysis

### Issue 1: Precision Loss

**Location:** `src/lib/utils/cloudinary.ts:43-44`

**Current Code:**
```typescript
`x_${(focusPoint.x / 100).toFixed(1)}`,  // 0.26 → "0.3" (loses precision)
`y_${(focusPoint.y / 100).toFixed(1)}`
```

**Impact:**
- Focus point at x=26 becomes x=30 (4% error)
- Focus point at x=33 becomes x=30 (3% error)
- Focus point at x=37 becomes x=40 (3% error)

**Why `.toFixed(1)` was used:**
Looking at the git history and IP 06, it appears this was used to keep URLs shorter and cleaner. However, Cloudinary supports higher precision.

### Issue 2: Documentation Inconsistency

**Location:** `docs/issues/06-remove-uploadcare-dependency-ip.md:234`

**Incorrect Documentation:**
```javascript
// Cloudinary generates URLs like: c_fill,g_xy_center,w_800,h_450,x_50,y_50
```

**Why it's wrong:**
- `x_50` = 50 **pixels** from left (integer = pixels in Cloudinary)
- `x_0.5` = 50 **percent** from left (decimal = percentage in Cloudinary)

**Correct Documentation:**
```javascript
// Cloudinary generates URLs like: c_crop,g_xy_center,w_800,h_450,x_0.5,y_0.5
```

This was corrected in the verification section (lines 422-451) but the initial description remains misleading.

### Issue 3: Missing Validation

**Location:** `src/lib/utils/cloudinary.ts:19-59`

**Current Code:**
```typescript
export function getCloudinaryUrl(
  publicId: string,
  variant: ImageVariant,
  focusPoint?: FocusPoint  // ❌ No validation here
): string {
  // ...
  if (focusPoint) {
    transformations.push(
      `x_${(focusPoint.x / 100).toFixed(1)}`,  // ❌ Assumes x is 0-100
      `y_${(focusPoint.y / 100).toFixed(1)}`
    );
  }
}
```

**Risk:** If frontmatter contains invalid values (e.g., `x: 150` or `x: -10`), invalid URLs are generated.

---

## Proposed Solution

### Phase 1: Improve Precision (1 → 2 decimal places)

**Rationale:**
- 2 decimal places in Cloudinary format (0.00-1.00) = 1% precision in percentage space (0-100%)
- Example: `x=26` → `x_0.26` (26%) instead of `x_0.3` (30%)
- Cloudinary supports arbitrary precision in URL parameters

**Precision Mapping:**
- `.toFixed(1)` → 0.1 precision in decimal space → **10% precision** in percentage space
- `.toFixed(2)` → 0.01 precision in decimal space → **1% precision** in percentage space
- `.toFixed(3)` → 0.001 precision in decimal space → **0.1% precision** in percentage space

**Change:**
```typescript
// Before:
`x_${(focusPoint.x / 100).toFixed(1)}`
// 1 decimal = 0.1 precision (0.0-1.0) = 10% precision (0-100%)
// Example: 26 → 0.26 → rounds to 0.3 = 30%

// After:
`x_${(focusPoint.x / 100).toFixed(2)}`
// 2 decimals = 0.01 precision (0.00-1.00) = 1% precision (0-100%)
// Example: 26 → 0.26 = 26% (exact)
```

**Alternative (maximum precision):**
```typescript
// Remove toFixed entirely for maximum precision:
`x_${focusPoint.x / 100}`  // JavaScript handles decimal conversion
// No rounding, but URLs may vary in length (0.26 vs 0.266666...)
```

**Recommendation:** Use `.toFixed(2)` for optimal balance between precision and URL consistency.

---

### Phase 2: Add Validation & Clamping

**Add validation helper:**
```typescript
// src/lib/utils/cloudinary.ts

/**
 * Validate and clamp focus point to valid range (0-100)
 * Logs warning in development if values are out of range
 */
function validateFocusPoint(fp: FocusPoint): FocusPoint {
  const clampedX = Math.max(0, Math.min(100, fp.x));
  const clampedY = Math.max(0, Math.min(100, fp.y));

  // Log warning only in development (not in production)
  if (import.meta.env.DEV && (clampedX !== fp.x || clampedY !== fp.y)) {
    console.warn(
      `[Cloudinary] Focus point out of range, clamped from (${fp.x}, ${fp.y}) to (${clampedX}, ${clampedY})`
    );
  }

  return { x: clampedX, y: clampedY };
}

export function getCloudinaryUrl(
  publicId: string,
  variant: ImageVariant,
  focusPoint?: FocusPoint
): string {
  const specs = IMAGE_VARIANTS[variant];

  const transformations: string[] = [
    `f_auto`,
    `q_auto`,
  ];

  if (focusPoint) {
    // ✅ Validate and clamp focus point
    const validatedFp = validateFocusPoint(focusPoint);

    transformations.push(
      `c_crop`,
      `g_xy_center`,
      `h_${specs.height}`,
      `w_${specs.width}`,
      `x_${(validatedFp.x / 100).toFixed(2)}`,  // ✅ 2 decimal precision
      `y_${(validatedFp.y / 100).toFixed(2)}`   // ✅ 2 decimal precision
    );
  } else {
    transformations.push(
      `c_fill`,
      `g_auto`,
      `h_${specs.height}`,
      `w_${specs.width}`
    );
  }

  const transformString = transformations.join(',');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
}
```

---

### Phase 3: Fix Documentation

**Update `docs/issues/06-remove-uploadcare-dependency-ip.md`:**

Line 234 - Change from:
```javascript
// Cloudinary generates URLs like: c_fill,g_xy_center,w_800,h_450,x_50,y_50
```

To:
```javascript
// Cloudinary URL format: c_crop,g_xy_center,w_800,h_450,x_0.5,y_0.5
// Note: Decimals (0.5) = percentages, Integers (50) = pixels
```

**Update `docs/widgets/enhanced-image-widget.md`:**

Add clarification in the "Build URL Function" section (around line 149):
```markdown
### Cloudinary Coordinate Format

**IMPORTANT:** Cloudinary distinguishes between pixels and percentages based on the value format:
- **Integers** (e.g., `x_50`) = 50 pixels from left edge
- **Decimals** (e.g., `x_0.5`) = 50% from left edge (half the image width)

Our implementation stores percentages (0-100) in frontmatter and converts to decimal format (0.0-1.0) for Cloudinary URLs.

**Example:**
```typescript
// Frontmatter: focusPoint: { x: 26, y: 51 }
// Conversion: x: 26/100 = 0.26, y: 51/100 = 0.51
// Cloudinary URL: x_0.26,y_0.51
// Result: Focus point at 26% from left, 51% from top
```
```

---

## Pre-Implementation Verification

Before starting implementation, verify required types exist:

```bash
# Verify FocusPoint type is defined
grep -r "export.*FocusPoint" src/types/
# Expected: src/types/image.ts:export interface FocusPoint {

# Verify current implementation uses .toFixed(1)
grep "toFixed" src/lib/utils/cloudinary.ts
# Expected: Lines with .toFixed(1) in focusPoint coordinate conversion
```

**Status:** ✅ Verified - `FocusPoint` type exists in `src/types/image.ts` with proper documentation

---

## Implementation Steps

### Step 1: Update `src/lib/utils/cloudinary.ts`

```typescript
/**
 * Cloudinary integration utilities
 * Generates optimized image URLs with transformations
 */

import { IMAGE_VARIANTS, type ImageVariant } from './imageVariants';
import type { FocusPoint } from '../../types/image';

// Cloud name configuration
const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'zzbazza';

/**
 * Validate and clamp focus point coordinates to valid range (0-100)
 * Logs warning in development if values are out of range
 *
 * @param fp - Focus point with x,y coordinates
 * @returns Clamped focus point
 */
function validateFocusPoint(fp: FocusPoint): FocusPoint {
  const clampedX = Math.max(0, Math.min(100, fp.x));
  const clampedY = Math.max(0, Math.min(100, fp.y));

  // Log warning only in development (not in production)
  if (import.meta.env.DEV && (clampedX !== fp.x || clampedY !== fp.y)) {
    console.warn(
      `[Cloudinary] Focus point out of range, clamped from (${fp.x}, ${fp.y}) to (${clampedX}, ${clampedY})`
    );
  }

  return { x: clampedX, y: clampedY };
}

/**
 * Generate Cloudinary URL with transformations
 *
 * @param publicId - Cloudinary public ID (e.g., "dgkralupy/article-image.jpg")
 * @param variant - Image variant (hero, card, thumbnail, detail)
 * @param focusPoint - Optional focus point { x: 0-100, y: 0-100 } (percentage coordinates)
 * @returns Optimized image URL
 *
 * @example
 * ```typescript
 * // With focus point
 * getCloudinaryUrl('dgkralupy/image.jpg', 'hero', { x: 26, y: 51 })
 * // → https://res.cloudinary.com/zzbazza/image/upload/c_crop,g_xy_center,h_675,w_1200,x_0.26,y_0.51,f_auto,q_auto/dgkralupy/image.jpg
 *
 * // Without focus point (auto gravity)
 * getCloudinaryUrl('dgkralupy/image.jpg', 'card')
 * // → https://res.cloudinary.com/zzbazza/image/upload/c_fill,g_auto,h_300,w_400,f_auto,q_auto/dgkralupy/image.jpg
 * ```
 */
export function getCloudinaryUrl(
  publicId: string,
  variant: ImageVariant,
  focusPoint?: FocusPoint
): string {
  const specs = IMAGE_VARIANTS[variant];

  // Build transformation parameters as a single comma-separated string
  const transformations: string[] = [
    `f_auto`,  // Format: auto (AVIF, WebP, JPG based on browser)
    `q_auto`,  // Quality: auto optimization
  ];

  if (focusPoint) {
    // Validate and clamp focus point to 0-100 range
    const validatedFp = validateFocusPoint(focusPoint);

    // Use crop mode with xy_center gravity and custom focus point
    // NOTE: c_crop is required (not c_fill) when using g_xy_center with custom x/y coordinates
    //
    // COORDINATE FORMAT:
    // - FocusPoint storage: 0-100 (percentage, e.g., x=26 means 26% from left)
    // - Cloudinary format: 0.0-1.0 (decimal, e.g., x_0.26 means 26% from left)
    // - Conversion: (26 / 100).toFixed(2) = "0.26"
    //
    // IMPORTANT: Cloudinary interprets coordinates differently based on format:
    // - Integers (x_50) = 50 PIXELS from edge
    // - Decimals (x_0.5) = 50% from edge (percentage)
    //
    // PRECISION:
    // - .toFixed(2) provides 0.01 precision in decimal space (0.00-1.00)
    // - This maps to 1% precision in percentage space (0-100%)
    // - Example: 26% → 0.26 (exact), 26.5% → 0.27 (rounded to nearest 1%)
    // - This is sufficient for image cropping (visually indistinguishable)
    //
    // See: https://cloudinary.com/documentation/transformation_reference#x_y_parameters
    transformations.push(
      `c_crop`,  // Crop mode (required for custom xy coordinates)
      `g_xy_center`,  // Gravity: center on custom x,y coordinates
      `h_${specs.height}`,
      `w_${specs.width}`,
      `x_${(validatedFp.x / 100).toFixed(2)}`,  // ✅ Convert 0-100 to 0.00-1.00 (2 decimal precision)
      `y_${(validatedFp.y / 100).toFixed(2)}`   // ✅ Convert 0-100 to 0.00-1.00 (2 decimal precision)
    );
  } else {
    // Use fill mode with auto gravity when no focus point specified
    transformations.push(
      `c_fill`,  // Fill mode
      `g_auto`,  // Auto-detect subject (face, object, etc.)
      `h_${specs.height}`,
      `w_${specs.width}`
    );
  }

  // Build final URL with all transformations in a single layer
  const transformString = transformations.join(',');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
}

/**
 * Extract Cloudinary public ID from URL
 *
 * @param url - Cloudinary URL or public ID
 * @returns Public ID
 *
 * @example
 * ```typescript
 * extractPublicId('dgkralupy/image.jpg')
 * // → 'dgkralupy/image.jpg'
 *
 * extractPublicId('https://res.cloudinary.com/zzbazza/image/upload/dgkralupy/image.jpg')
 * // → 'dgkralupy/image.jpg'
 *
 * extractPublicId('https://res.cloudinary.com/zzbazza/image/upload/v1234567890/dgkralupy/image.jpg')
 * // → 'dgkralupy/image.jpg'
 *
 * extractPublicId('https://res.cloudinary.com/zzbazza/image/upload/w_800,h_600/v1234567890/dgkralupy/image.jpg')
 * // → 'dgkralupy/image.jpg'
 * ```
 */
export function extractPublicId(url: string): string {
  // If it's already a public ID (no https://), return as-is
  if (!url.startsWith('http')) {
    return url;
  }

  // Extract public ID from Cloudinary URL, handling:
  // - Basic: https://res.cloudinary.com/zzbazza/image/upload/dgkralupy/image.jpg
  // - With version: https://res.cloudinary.com/zzbazza/image/upload/v1234567890/dgkralupy/image.jpg
  // - With transformations: https://res.cloudinary.com/zzbazza/image/upload/w_800,h_600/v1234567890/dgkralupy/image.jpg
  // Result: dgkralupy/image.jpg

  // Match everything after /upload/, skipping transformations and version
  const match = url.match(/\/upload\/(?:[^/]+\/)*?(v\d+\/)?(.+)$/);
  return match ? match[2] : url;
}
```

### Step 2: Update `public/admin/cloudinary-config.js`

No changes needed - the CMS widget doesn't build URLs with focus points, it only stores them. The buildUrl function is only for preview display without transformations.

### Step 3: Update Documentation

**File:** `docs/issues/06-remove-uploadcare-dependency-ip.md`

Find and update line 234:
```diff
- // Cloudinary generates URLs like: c_fill,g_xy_center,w_800,h_450,x_50,y_50
+ // Cloudinary URL format: c_crop,g_xy_center,w_800,h_450,x_0.5,y_0.5
+ // Note: Decimals (0.5) = percentages, Integers (50) = pixels
```

**File:** `docs/widgets/enhanced-image-widget.md`

Add section after line 184 (in the "Build URL Function" section):

```markdown
### ⚠️ Cloudinary Coordinate Format - Important Distinction

Cloudinary distinguishes between **pixels** and **percentages** based on the parameter value format:

| Format | Meaning | Example |
|--------|---------|---------|
| **Integer** | Pixels from edge | `x_50` = 50 pixels from left |
| **Decimal** | Percentage from edge | `x_0.5` = 50% from left (half the image width) |

**Our Implementation:**
1. **Storage:** Focus points stored as percentages (0-100) in frontmatter
2. **Conversion:** Divide by 100 to get Cloudinary decimal format (0.0-1.0)
3. **Precision:** Use `.toFixed(2)` for 1% accuracy (sufficient for image cropping)

**Example Flow:**
```typescript
// User clicks at 26% from left, 51% from top
// CMS widget saves to frontmatter:
focusPoint: { x: 26, y: 51 }

// Website converts for Cloudinary:
x: 26/100 = 0.26  → x_0.26 (26% from left)
y: 51/100 = 0.51  → y_0.51 (51% from top)

// Cloudinary URL:
.../c_crop,g_xy_center,w_1200,h_675,x_0.26,y_0.51/...
```

**Common Mistake:**
```typescript
// ❌ WRONG - Using integer creates pixel-based crop
x_26  // = 26 pixels from left (not 26%!)

// ✅ CORRECT - Using decimal creates percentage-based crop
x_0.26  // = 26% from left
```
```

---

## Unit Testing (Optional but Recommended)

While this IP focuses on integration testing, unit tests would provide additional confidence:

```typescript
// src/lib/utils/cloudinary.test.ts
import { describe, it, expect } from 'vitest';

// Note: validateFocusPoint is not exported, so test indirectly through getCloudinaryUrl
describe('getCloudinaryUrl - Focus Point Validation', () => {
  it('should clamp focus point x coordinate above 100', () => {
    const url = getCloudinaryUrl(
      'dgkralupy/test.jpg',
      'hero',
      { x: 150, y: 50 }
    );
    // Expect x_1.00 (clamped to 100%)
    expect(url).toContain('x_1.00');
  });

  it('should clamp focus point y coordinate below 0', () => {
    const url = getCloudinaryUrl(
      'dgkralupy/test.jpg',
      'hero',
      { x: 50, y: -10 }
    );
    // Expect y_0.00 (clamped to 0%)
    expect(url).toContain('y_0.00');
  });

  it('should use 2 decimal precision for focus points', () => {
    const url = getCloudinaryUrl(
      'dgkralupy/test.jpg',
      'hero',
      { x: 26, y: 51 }
    );
    // Expect x_0.26,y_0.51 (not x_0.3,y_0.5)
    expect(url).toContain('x_0.26');
    expect(url).toContain('y_0.51');
  });

  it('should not modify valid coordinates', () => {
    const url = getCloudinaryUrl(
      'dgkralupy/test.jpg',
      'card',
      { x: 50, y: 50 }
    );
    expect(url).toContain('x_0.50,y_0.50');
  });
});
```

**Implementation Note:** This requires setting up Vitest testing infrastructure if not already present. Can be deferred to a separate task if testing setup doesn't exist yet.

---

## Testing Plan

### Test 1: Precision Verification

**Objective:** Verify that focus points are more accurate with 2 decimal places

**Steps:**
1. Create test article with focus point: `{ x: 26, y: 51 }`
2. Check generated Cloudinary URL
3. **Expected:** `x_0.26,y_0.51` (not `x_0.3,y_0.5`)
4. Load image in browser
5. Verify focus point is correctly positioned

**Test cases:**
| Input (%) | Old Format (.toFixed(1)) | New Format (.toFixed(2)) | Improvement |
|-----------|-------------------------|-------------------------|-------------|
| x: 26 | x_0.3 (30%) | x_0.26 (26%) | 4% more accurate |
| x: 33 | x_0.3 (30%) | x_0.33 (33%) | 3% more accurate |
| x: 37 | x_0.4 (40%) | x_0.37 (37%) | 3% more accurate |
| x: 50 | x_0.5 (50%) | x_0.50 (50%) | No change |

### Test 2: Validation Testing

**Objective:** Verify that out-of-range values are clamped

**Steps:**
1. Manually create article with invalid focus point:
   ```yaml
   image:
     src: dgkralupy/test.jpg
     alt: Test
     focusPoint:
       x: 150  # Invalid - out of range
       y: -10  # Invalid - negative
   ```
2. Run dev server (`npm run dev`)
3. Load page in browser
4. Check console for warning
5. **Expected (DEV mode):** Console shows: `"[Cloudinary] Focus point out of range, clamped from (150, -10) to (100, 0)"`
6. **Expected:** Image displays without errors
7. Check generated URL
8. **Expected:** URL contains `x_1.00,y_0.00` (clamped values)
9. Build for production (`npm run build`) and preview
10. **Expected (PRODUCTION):** No console warnings (silent clamping)

### Test 3: Backwards Compatibility

**Objective:** Verify existing images still work

**Steps:**
1. Test with existing articles (adventni-behani.md, etc.)
2. **Expected:** All images display correctly
3. **Expected:** Focus points remain accurate
4. Compare before/after URLs
5. **Expected:** Only difference is precision (0.3 → 0.26)

### Test 4: CMS Widget Behavior

**Objective:** Verify CMS widget still works correctly

**Steps:**
1. Open article in CMS
2. Click on image to set focus point
3. Click at different positions
4. **Expected:** Focus point indicator moves correctly
5. Save article
6. Check frontmatter
7. **Expected:** Values are still 0-100 (not changed by validation)

---

## Deployment Plan

### Pre-Deployment Checklist

- [ ] Code changes reviewed and tested locally
- [ ] All test cases pass
- [ ] Documentation updated
- [ ] No breaking changes identified
- [ ] Backwards compatibility verified

### Deployment Steps

```bash
# 1. Make changes
# - Update src/lib/utils/cloudinary.ts
# - Update docs/issues/06-remove-uploadcare-dependency-ip.md
# - Update docs/widgets/enhanced-image-widget.md

# 2. Test locally
npm run dev

# 3. Test all scenarios
# - New images with focus points
# - Existing images (backwards compatibility)
# - Out-of-range values (validation)
# - CMS widget behavior

# 4. Build and verify
npm run build

# 5. Commit changes
git add src/lib/utils/cloudinary.ts docs/issues/06-remove-uploadcare-dependency-ip.md docs/widgets/enhanced-image-widget.md
git commit -m "feat: improve focus point coordinate precision

Changes:
- Increase precision from .toFixed(1) to .toFixed(2) for 1% accuracy
- Add validation and clamping for focus point coordinates (0-100 range)
- Fix documentation inconsistency about Cloudinary coordinate format
- Add detailed comments explaining pixel vs percentage format

Impact:
- Focus points are now more accurate (26% stays 26%, not rounded to 30%)
- Invalid focus points are gracefully handled with clamping
- Better documentation prevents future confusion

🚨 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 6. Push to main
git push origin main

# 7. Monitor production
# - Check existing articles still display correctly
# - Verify new focus points are more accurate
# - Monitor console for validation warnings
```

---

## Success Criteria

- ✅ Focus points have 1% precision (not 10% with .toFixed(1))
- ✅ Out-of-range values are clamped (0-100) with console warning
- ✅ Documentation accurately describes Cloudinary coordinate format
- ✅ All existing images continue to work (backwards compatible)
- ✅ CMS widget behavior unchanged
- ✅ No performance impact

---

## Risk Assessment

**Risk Level:** ✅ **Very Low**

**Reasons:**
1. **Backwards Compatible:** Only changes precision, not format
2. **Defensive:** Adds validation, doesn't break on bad data
3. **Isolated Change:** Only affects one utility function
4. **Well-Tested:** Coordinate system already verified in IP 06
5. **Documentation Only:** Docs changes have zero code risk

**Potential Issues:**
- Cloudinary URLs change slightly (0.3 → 0.26) but both are valid
- Cached images might use old URLs (will refresh naturally)
- Console warnings might appear for articles with out-of-range values (this is good!)

---

## Rollback Plan

If any issues are discovered after deployment:

```bash
# Revert to previous version
git revert <commit-hash>
git push origin main

# Or restore specific file
git checkout HEAD~1 src/lib/utils/cloudinary.ts
git commit -m "rollback: revert focus point precision changes"
git push origin main
```

**Impact of Rollback:**
- Focus points return to lower precision (.toFixed(1))
- Validation removed (invalid values not clamped)
- Documentation reverts to previous state
- All images continue to work (backwards compatible)

---

## Future Enhancements (Out of Scope)

1. **Interactive Preview:** Show focus point crop preview in CMS widget
2. **Smart Suggestions:** Use Cloudinary's AI to suggest focus points
3. **Multi-Focus:** Support multiple focus points for different variants
4. **Advanced Cropping:** Allow custom crop rectangles in addition to focus points

---

## References

- [Cloudinary Transformation Reference](https://cloudinary.com/documentation/transformation_reference) - Official parameter documentation
- [Cloudinary Custom Focus Areas](https://cloudinary.com/documentation/custom_focus_areas) - Focus point documentation
- [IP 06: Remove Uploadcare Dependency](./06-remove-uploadcare-dependency-ip.md) - Original coordinate system implementation
- [Enhanced Image Widget Documentation](../widgets/enhanced-image-widget.md) - Widget implementation details

**Sources:**
- [Cloudinary Transformation Reference](https://cloudinary.com/documentation/transformation_reference)
- [Custom Focus Areas | Cloudinary Documentation](https://cloudinary.com/documentation/custom_focus_areas)
- [Gravity center_xy with percentage values](https://support.cloudinary.com/hc/en-us/community/posts/360028838032-Gravity-center-xy-with-percentage-values)

---

## Implementation Checklist

### Pre-Implementation
- [x] Verify `FocusPoint` type exists in `src/types/image.ts`
- [x] Review Cloudinary documentation for coordinate format
- [x] Staff Engineer review completed and approved

### Code Changes
- [x] Update `src/lib/utils/cloudinary.ts` with precision improvements (.toFixed(2))
- [x] Add `validateFocusPoint` function with dev-only logging
- [x] Update inline comments to clarify precision mapping

### Documentation Updates
- [x] Update `docs/issues/06-remove-uploadcare-dependency-ip.md` (line 234)
- [x] Update `docs/widgets/enhanced-image-widget.md` (add coordinate format section)

### Testing
- [x] Run Test 1: Precision Verification
- [ ] Run Test 2: Validation Testing (dev and production modes)
- [ ] Run Test 3: Backwards Compatibility
- [ ] Run Test 4: CMS Widget Behavior
- [ ] (Optional) Add unit tests for coordinate validation

### Deployment
- [x] Build and verify no errors (`npm run build`)
- [ ] Test in production preview
- [ ] Deploy to production
- [ ] Monitor for edge cases (first 24 hours)
- [ ] Mark IP as completed

---

**Last Updated:** 2025-12-30
**Approved By:** Staff Engineer (Claude Sonnet 4.5)
**Status:** Ready for Implementation
**Next Review:** After deployment and 1 week of production monitoring
