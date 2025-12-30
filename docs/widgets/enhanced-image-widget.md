# Enhanced Image Widget - Cloudinary Integration

**Status:** Production Ready

---

## Overview

Custom Decap CMS widget for managing images with Cloudinary CDN integration. Provides image upload, alt text editing, and focus point selection while maintaining a clean, portable data format.

**Key Features:**
- Cloudinary Upload Widget integration
- Alt text input (max 125 chars)
- Visual focus point selection (click to set)
- **Public ID storage pattern** (not full URLs)
- Automatic URL construction on-the-fly

---

## Data Storage Pattern

### ✅ What We Store (Public ID Only)

```yaml
image:
  src: dgkralupy/d9rhnoim18tuyb0lkb6n.jpg  # Public ID only
  alt: Adventní běhání
  focusPoint:
    x: 50
    y: 50
```

### ❌ What We Don't Store (Full URLs)

```yaml
# AVOID - Full URLs are not stored
image:
  src: https://res.cloudinary.com/zzbazza/image/upload/v1767008798/dgkralupy/d9rhnoim18tuyb0lkb6n.jpg
```

### Why Public IDs?

1. **Portable** - Not tied to specific cloud/transformations
2. **Flexible** - Generate different sizes/formats on demand
3. **Clean** - Shorter, more readable frontmatter
4. **Version-safe** - Cloudinary version numbers don't clutter data

---

## URL Construction Flow

### 1. Upload (CMS Widget)

```javascript
// User uploads via Cloudinary widget
cloudinary.openUploadWidget({ ... }, (error, result) => {
  const publicId = result.info.public_id;  // "dgkralupy/image.jpg"

  setState({
    src: publicId,                          // Store public ID
    previewUrl: result.info.secure_url      // Display full URL
  });
});
```

### 2. Save (Extract Public ID)

```javascript
// Before saving to frontmatter
emitChange: function() {
  // Extract public_id from any format (full URL or public_id)
  var publicId = window.CLOUDINARY_CONFIG.extractPublicId(this.state.src);

  this.props.onChange({
    src: publicId,  // ✅ Only public_id saved
    alt: this.state.alt,
    focusPoint: this.state.focusPoint
  });
}
```

### 3. Display (Build URL)

```javascript
// In CMS widget (public/admin/cloudinary-config.js)
var displaySrc = window.CLOUDINARY_CONFIG.buildUrl(publicId);
// → https://res.cloudinary.com/zzbazza/image/upload/dgkralupy/image.jpg

// On website (src/lib/utils/cloudinary.ts)
const url = getCloudinaryUrl(publicId, 'hero', focusPoint);
// → https://res.cloudinary.com/zzbazza/image/upload/c_crop,g_xy_center,h_675,w_1200,x_0.5,y_0.5/dgkralupy/image.jpg
```

---

## Extract Public ID Function

Handles all Cloudinary URL formats and extracts the public_id:

```javascript
// public/admin/cloudinary-config.js & src/lib/utils/cloudinary.ts

function extractPublicId(url) {
  // Already a public_id? Return as-is
  if (!url.startsWith('http')) {
    return url;
  }

  // Extract from full URL
  // Handles: transformations, versions, basic URLs
  var match = url.match(/\/upload\/(?:[^/]+\/)*?(v\d+\/)?(.+)$/);
  return match ? match[2] : url;
}
```

### Supported URL Formats

| URL Format | Extracted Public ID |
|------------|-------------------|
| `dgkralupy/image.jpg` | `dgkralupy/image.jpg` |
| `https://.../upload/dgkralupy/image.jpg` | `dgkralupy/image.jpg` |
| `https://.../upload/v1234567890/dgkralupy/image.jpg` | `dgkralupy/image.jpg` |
| `https://.../upload/w_800,h_600/v1234567890/dgkralupy/image.jpg` | `dgkralupy/image.jpg` |

---

## Build URL Function

Constructs full Cloudinary URLs on-the-fly:

### CMS Widget (Simple)

```javascript
// public/admin/cloudinary-config.js
buildUrl: function(publicId, options) {
  var baseUrl = 'https://res.cloudinary.com/' + this.cloudName + '/image/upload/';

  // Optional transformations
  var transformations = [];
  if (options.width) transformations.push('w_' + options.width);
  if (options.height) transformations.push('h_' + options.height);

  var transformPart = transformations.length > 0 ? transformations.join(',') + '/' : '';
  return baseUrl + transformPart + publicId;
}
```

### Website (Advanced)

```typescript
// src/lib/utils/cloudinary.ts
export function getCloudinaryUrl(
  publicId: string,
  variant: ImageVariant,
  focusPoint?: FocusPoint
): string {
  const specs = IMAGE_VARIANTS[variant];
  const transformations: string[] = [
    `f_auto`,  // Auto format (AVIF, WebP, JPG)
    `q_auto`,  // Auto quality
  ];

  if (focusPoint) {
    transformations.push(
      `c_crop`,
      `g_xy_center`,
      `h_${specs.height}`,
      `w_${specs.width}`,
      `x_${(focusPoint.x / 100).toFixed(2)}`,  // 0-100 → 0.00-1.00 (2 decimal precision = 1% accuracy)
      `y_${(focusPoint.y / 100).toFixed(2)}`
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

---

## Focus Point Calculation - Implementation Details

**Important:** Focus point percentages MUST be calculated relative to the **actual image element dimensions**, not the container dimensions.

### Why This Matters

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

### Implementation

```javascript
handleFocusPointChange: function(e) {
  var target = e.target;  // ✅ Get actual clicked element

  if (target.tagName.toUpperCase() !== 'IMG') {
    return;  // Ignore clicks outside image
  }

  var rect = target.getBoundingClientRect();  // ✅ Use IMAGE dimensions
  var rawX = ((e.clientX - rect.left) / rect.width) * 100;
  var rawY = ((e.clientY - rect.top) / rect.height) * 100;
  var x = Math.round(rawX * 10) / 10;  // Round to 1 decimal place
  var y = Math.round(rawY * 10) / 10;

  // ... rest of handler
}
```

### Bug History

- **Before Fix (Issue #09):**
  - Used `e.currentTarget.getBoundingClientRect()` which returned container dimensions
  - Used `Math.round()` for integer precision (0-100), providing only 101 discrete positions
  - Focus indicator already had `pointerEvents: 'none'` for click-through

- **After Fix (Issue #09):**
  - Uses `e.target.getBoundingClientRect()` which returns actual image dimensions
  - Uses 1-decimal precision (0.0-100.0) via `Math.round(value * 10) / 10`, providing 1001 positions (10x improvement)
  - Added safety check to ignore clicks outside image element

- **Impact:**
  - Significantly improved accuracy for portrait images and images that don't fill their containers
  - Better precision for large images (0.1% granularity = ~1.2px on 1200px images)
  - Improved UX: users can accurately select focus points on any image type

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

---

## Configuration

### Cloudinary Config (`public/admin/cloudinary-config.js`)

```javascript
window.CLOUDINARY_CONFIG = {
  cloudName: 'zzbazza',
  uploadPreset: 'dgkralupy-stg',
  folder: 'dgkralupy',

  buildUrl: function(publicId, options) { ... },
  extractPublicId: function(url) { ... }
};
```

### CMS Config (`public/admin/config.yml`)

```yaml
# Note: enhanced-image widget uses its own Cloudinary integration
# The media_library config below is for reference only (not used by widget)
media_library:
  name: cloudinary
  config:
    cloud_name: zzbazza
    api_key: 442897745552571
    upload_preset: dgkralupy-stg
    folder: dgkralupy

collections:
  - name: "articles"
    fields:
      - label: "Hlavní obrázek"
        name: "image"
        widget: "enhanced-image"  # Custom widget
        required: false
```

### Widget Registration (`public/admin/index.html`)

```javascript
// Enhanced Image Control Component
var EnhancedImageControl = createClass({ ... });
var EnhancedImagePreview = createClass({ ... });

// Register widget
CMS.registerWidget('enhanced-image', EnhancedImageControl, EnhancedImagePreview);
```

---

## Image Variants

Defined in `src/lib/utils/imageVariants.ts`:

```typescript
export const IMAGE_VARIANTS = {
  hero: { width: 1200, height: 675, aspectRatio: '16/9' },
  card: { width: 400, height: 300, aspectRatio: '4/3' },
  thumbnail: { width: 150, height: 150, aspectRatio: '1/1' },
  detail: { width: 800, height: 600, aspectRatio: '4/3' }
} as const;
```

---

## Migration: Full URLs → Public IDs

If you have existing content with full URLs, convert them:

### Automated Script

```bash
npx tsx scripts/convert-cloudinary-urls-to-public-ids.ts
```

### Manual Conversion

```yaml
# Before
image:
  src: https://res.cloudinary.com/zzbazza/image/upload/v1767008798/dgkralupy/d9rhnoim18tuyb0lkb6n.jpg

# After
image:
  src: dgkralupy/d9rhnoim18tuyb0lkb6n.jpg
```

---

## Usage

### Uploading an Image

1. Open article in CMS
2. Click "Hlavní obrázek" dropzone
3. Select image from local files
4. Image uploads to Cloudinary
5. **Public ID** stored in frontmatter ✅

### Setting Focus Point

1. Click anywhere on the preview image
2. Red circle shows focus point
3. Coordinates saved as percentages (0-100)
4. Used for smart cropping in variants

### Preview vs Display

| Location | URL Type | Purpose |
|----------|----------|---------|
| CMS Widget | Full URL | Preview display only |
| Frontmatter | Public ID | Portable storage |
| Website | Full URL (generated) | Optimized delivery |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 errors in CMS | Check `EnhancedImagePreview` builds URLs correctly |
| Images not uploading | Verify Cloudinary upload preset is active |
| Wrong transformations | Check `IMAGE_VARIANTS` configuration |
| Full URLs in frontmatter | Run migration script |

---

## Related Files

| File | Purpose |
|------|---------|
| `public/admin/index.html` | Widget implementation |
| `public/admin/cloudinary-config.js` | CMS Cloudinary utilities |
| `src/lib/utils/cloudinary.ts` | Website Cloudinary utilities |
| `src/lib/utils/imageVariants.ts` | Image size definitions |
| `scripts/convert-cloudinary-urls-to-public-ids.ts` | Migration script |

---

## Testing

### Check Widget Registration

```javascript
// In browser console (CMS admin page)
window.CMS.getWidget('enhanced-image')  // Should return object
```

### Test URL Construction

```javascript
// Test buildUrl
window.CLOUDINARY_CONFIG.buildUrl('dgkralupy/test.jpg')
// → https://res.cloudinary.com/zzbazza/image/upload/dgkralupy/test.jpg

// Test extractPublicId
window.CLOUDINARY_CONFIG.extractPublicId('https://res.cloudinary.com/zzbazza/image/upload/v1234/dgkralupy/test.jpg')
// → dgkralupy/test.jpg
```

### Verify Data Format

```bash
# Check frontmatter uses public_ids
grep -r "src: https://" src/content/articles/
# Should return nothing (no full URLs)

grep -r "src: dgkralupy/" src/content/articles/
# Should show all images with public_id format
```

---

## Best Practices

1. ✅ **Always store public IDs** - Never commit full URLs to frontmatter
2. ✅ **Use extractPublicId** - Before saving any image reference
3. ✅ **Build URLs on-the-fly** - At display time, not storage time
4. ✅ **Set meaningful alt text** - For accessibility (max 125 chars)
5. ✅ **Set focus points** - For better responsive cropping
6. ✅ **Use image variants** - Don't serve oversized images

---

## Architecture Decision Records

### Why not store full URLs?

**Decision:** Store only Cloudinary public_ids in frontmatter, construct URLs at runtime.

**Reasons:**
1. **Portability** - Can switch CDN providers without data migration
2. **Flexibility** - Generate different sizes/formats per use case
3. **Cleanliness** - Frontmatter remains readable and git-friendly
4. **Future-proof** - Cloudinary URL format changes don't affect data

**Trade-offs:**
- ✅ More flexible and maintainable
- ⚠️ Requires URL construction logic in both CMS and website
- ✅ Easier to preview data in raw markdown
- ✅ Smaller git diffs

---

## Related Documentation

- [widget-development.md](./widget-development.md) - Widget development guide
- [author-widget.md](./author-widget.md) - Another custom widget example
