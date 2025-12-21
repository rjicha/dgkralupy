# Troubleshooting Guide: Enhanced Image Handling

This guide helps developers and administrators troubleshoot common issues with the enhanced image handling system.

---

## Table of Contents

1. [Build Issues](#build-issues)
2. [Image Display Issues](#image-display-issues)
3. [Admin Widget Issues](#admin-widget-issues)
4. [Performance Issues](#performance-issues)
5. [Migration Issues](#migration-issues)
6. [Type Safety Issues](#type-safety-issues)

---

## Build Issues

### Error: "Failed to generate image variants"

**Symptoms:**
- Build fails with error mentioning image variant generation
- Console shows error from `imageProcessing.ts`

**Common Causes:**
1. Image file doesn't exist at specified path
2. Image file is corrupted
3. Sharp (image processor) error

**Solutions:**

```bash
# 1. Verify the image exists
ls -la public/images/articles/

# 2. Check image file integrity
file public/images/articles/your-image.jpg

# 3. Try regenerating the image cache
rm -rf node_modules/.astro
npm run build

# 4. Reinstall Sharp
npm uninstall sharp
npm install sharp
```

**Prevention:**
- Always verify images exist before committing
- Use relative paths from `/public` directory
- Test builds locally before pushing

---

### Error: "Type 'string' is not assignable to type 'ImageData'"

**Symptoms:**
- TypeScript error in content files
- Build fails during type checking

**Cause:**
Schema mismatch between content and type definitions

**Solution:**

```typescript
// Check src/content/config.ts - ensure union type is used:
const imageSchema = z.union([
  z.string(),  // Legacy format
  z.object({   // Enhanced format
    src: z.string(),
    alt: z.string().optional(),
    focusPoint: z.object({
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    }).optional(),
  }).optional(),
]).optional();
```

---

### Build is Extremely Slow (>60 seconds)

**Symptoms:**
- Build takes more than 60 seconds
- CPU usage is very high during build

**Cause:**
Too many images being processed simultaneously

**Solutions:**

```javascript
// Option 1: Reduce image quality (faster processing)
// In src/lib/utils/imageVariants.ts
quality: { jpg: 75, webp: 70, avif: 60 }  // Reduced from 85/80/70

// Option 2: Process fewer variants
// Comment out unused variants in IMAGE_VARIANTS

// Option 3: Enable Sharp caching
// In astro.config.mjs
export default defineConfig({
  image: {
    cacheDir: './node_modules/.astro/image-cache'
  }
});
```

---

## Image Display Issues

### Images Not Showing on Website

**Symptoms:**
- Broken image icons
- Missing images on pages
- Console errors: "Failed to load resource: 404"

**Diagnosis:**

```bash
# 1. Check browser console (F12)
# Look for 404 errors or image load failures

# 2. Verify image exists in build output
ls -la dist/_astro/

# 3. Check image path in HTML source
# Right-click page → View Page Source
# Search for <img> or <picture> tags
```

**Solutions:**

```bash
# Solution 1: Image path is wrong
# Check frontmatter in article .md file:
image:
  src: "/images/articles/photo.jpg"  # Path must start with /

# Solution 2: Image wasn't processed
# Clear cache and rebuild
rm -rf node_modules/.astro dist/
npm run build

# Solution 3: Image is outside public folder
# Move image to public/images/
mv src/images/photo.jpg public/images/articles/
```

---

### Focus Point Not Working

**Symptoms:**
- Image crops incorrectly
- Important parts of image are cut off
- Focus point doesn't seem to be applied

**Diagnosis:**

```bash
# Check the generated HTML
# Look for CSS object-position property
<img style="object-position: 60% 40%">
```

**Solutions:**

1. **Verify focus point in frontmatter:**
```yaml
image:
  src: "/images/articles/photo.jpg"
  alt: "Description"
  focusPoint:
    x: 60  # Must be 0-100
    y: 40  # Must be 0-100
```

2. **Check ResponsiveImage component:**
```typescript
// In src/components/ResponsiveImage.astro
// Ensure focusPoint is passed to generateImageVariants
const variants = await generateImageVariants({
  imageSrc: imageData.src,
  focusPoint: imageData.focusPoint,  // Must be here!
  customCrops: imageData.crops,
});
```

3. **Test with extreme values:**
```yaml
# Try corners to verify it's working
focusPoint: { x: 0, y: 0 }     # Top-left
focusPoint: { x: 100, y: 100 } # Bottom-right
```

---

### Wrong Image Format Being Served

**Symptoms:**
- Browser shows JPG instead of WebP/AVIF
- Larger file sizes than expected
- No `<picture>` element in HTML

**Diagnosis:**

```html
<!-- Check HTML source - should see: -->
<picture>
  <source type="image/avif" srcset="...">
  <source type="image/webp" srcset="...">
  <img src="...jpg">
</picture>

<!-- If you see this instead, variant generation failed: -->
<img src="/images/original.jpg">
```

**Solutions:**

1. **Check browser DevTools Network tab:**
   - Look at "Type" column
   - AVIF-capable browsers should load `.avif`
   - Older browsers should load `.webp` or `.jpg`

2. **Verify generateImageVariants succeeded:**
```typescript
// Add logging in src/lib/utils/imageProcessing.ts
console.log('Generated variants:', variants);

// If null, check the catch block for errors
```

3. **Clear browser cache:**
```bash
# Hard refresh
Ctrl + Shift + R  # Windows/Linux
Cmd + Shift + R   # Mac
```

---

## Admin Widget Issues

### Widget Not Loading in Decap CMS

**Symptoms:**
- Image upload field shows default file input
- No custom widget UI visible
- Console error: "Widget not registered"

**Diagnosis:**

```javascript
// Open browser console on /admin page
// Look for errors mentioning "image-crop"

// Check if widget script is loaded
console.log(window.CMS);
```

**Solutions:**

1. **Check widget script is included:**
```html
<!-- In public/admin/index.html -->
<script src="/admin/widgets/image-crop-widget.js"></script>
```

2. **Verify widget registration:**
```javascript
// In public/admin/widgets/image-crop-widget.js
// Should have at the end:
CMS.registerWidget('image-crop', ImageCropControl, ImageCropPreview);
```

3. **Check config.yml uses correct widget:**
```yaml
# In public/admin/config.yml
fields:
  - label: "Hlavní obrázek"
    name: "image"
    widget: "image-crop"  # Must match registered name
```

4. **Clear CMS cache:**
```bash
# Open browser console
localStorage.clear();
# Reload page
```

---

### Cropper.js Not Working

**Symptoms:**
- Advanced mode shows image but no crop frame
- Console error: "Cropper is not defined"
- Cannot drag crop area

**Solutions:**

1. **Verify Cropper.js is loaded:**
```html
<!-- In public/admin/index.html -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js"></script>
```

2. **Check initialization order:**
```javascript
// Cropper must be initialized AFTER image loads
React.useEffect(() => {
  if (imageRef.current && image && showAdvanced) {
    // Initialize here
  }
}, [image, showAdvanced]);
```

3. **Check for React errors:**
```javascript
// Open browser console
// Look for React component errors
```

---

### File Validation Errors

**Symptoms:**
- Upload fails with error message
- File size/type/dimension errors

**Expected Validations:**

```javascript
// Type check
Allowed: image/jpeg, image/png, image/webp
Rejected: image/gif, image/svg+xml, etc.

// Size check
Max: 10 MB (10,485,760 bytes)

// Dimension check
Min: 800×450 px
Max: 4000×4000 px
```

**Solutions:**

1. **File too large:**
```bash
# Compress with ImageMagick
convert input.jpg -quality 85 output.jpg

# Or use online tool
# https://tinypng.com
```

2. **Wrong format:**
```bash
# Convert with ImageMagick
convert input.gif output.jpg
```

3. **Dimensions too small:**
```bash
# Check dimensions
identify input.jpg

# Cannot upscale - get higher resolution source
```

---

## Performance Issues

### Slow Page Load Times

**Symptoms:**
- Lighthouse Performance Score < 90
- Large Contentful Paint (LCP) > 2.5s
- Large image file sizes

**Diagnosis:**

```bash
# 1. Run Lighthouse audit
# Chrome DevTools → Lighthouse → Generate report

# 2. Check Network tab
# Look for large image downloads
# Sort by Size column

# 3. Check image formats being served
# AVIF should be smallest
# WebP should be medium
# JPG should be largest (fallback)
```

**Solutions:**

1. **Reduce image quality:**
```typescript
// In src/lib/utils/imageVariants.ts
quality: {
  jpg: 75,   // Reduced from 85
  webp: 70,  // Reduced from 80
  avif: 60,  // Reduced from 70
}
```

2. **Ensure lazy loading:**
```astro
<!-- Below-fold images -->
<ResponsiveImage
  image={image}
  variant="card"
  loading="lazy"  <!-- Important! -->
/>

<!-- Above-fold images -->
<ResponsiveImage
  image={image}
  variant="hero"
  loading="eager"  <!-- For LCP optimization -->
/>
```

3. **Preload LCP image:**
```astro
---
// In page frontmatter
const { image } = Astro.props;
---
<head>
  {image && (
    <link rel="preload" as="image" href={image.src} />
  )}
</head>
```

---

### Memory Issues During Build

**Symptoms:**
- Build crashes with "Out of memory"
- Node process killed during image processing

**Solutions:**

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Or add to package.json scripts
"build": "NODE_OPTIONS='--max-old-space-size=4096' astro build"
```

```javascript
// Process images in batches
// In src/lib/utils/imageProcessing.ts
const batchSize = 5;
for (let i = 0; i < variants.length; i += batchSize) {
  const batch = variants.slice(i, i + batchSize);
  await Promise.all(batch.map(processVariant));
}
```

---

## Migration Issues

### Migration Script Fails

**Symptoms:**
- `npm run migrate:images` exits with errors
- Some articles migrated, others didn't

**Solutions:**

1. **Check error messages:**
```bash
# Run with verbose flag
npm run migrate:images:verbose

# Check which files failed
```

2. **Validate YAML syntax:**
```bash
# Install YAML linter
npm install -g yaml-lint

# Check article files
yaml-lint src/content/articles/*.md
```

3. **Manual migration:**
```yaml
# Before (legacy format)
image: "/images/articles/photo.jpg"

# After (enhanced format)
image:
  src: "/images/articles/photo.jpg"
  alt: "Descriptive text here"
  focusPoint:
    x: 50
    y: 50
```

---

### Some Articles Still Using Legacy Format

**Symptoms:**
- Mixed formats in content collection
- Some images work, others don't

**Diagnosis:**

```bash
# Search for legacy format
grep -r "^image: \"" src/content/articles/

# Search for enhanced format
grep -r "^image:" -A 3 src/content/articles/
```

**Solution:**

This is **intentional and supported**! The system handles both formats:

```typescript
// In src/lib/utils/imageProcessing.ts
export function normalizeImageData(imageData: ImageData) {
  if (typeof imageData === 'string') {
    // Legacy format - still works!
    return { src: imageData, alt: '', focusPoint: { x: 50, y: 50 } };
  }
  // Enhanced format
  return { ...imageData };
}
```

No action needed unless you want consistency.

---

## Type Safety Issues

### TypeScript Errors in Components

**Symptoms:**
- Red squiggles in VSCode
- Build fails with TypeScript errors

**Common Errors:**

1. **"Property 'src' does not exist"**
```typescript
// Wrong
const imageSrc = image.src;

// Right - handle both formats
const imageData = normalizeImageData(image);
const imageSrc = imageData.src;
```

2. **"Type 'ImageData' is not assignable"**
```typescript
// Ensure you import the correct type
import type { ImageData } from '../types/image';

// Use in Props
interface Props {
  image: ImageData;  // Handles both string and object
}
```

---

### Zod Validation Errors

**Symptoms:**
- Build fails with Zod schema validation error
- "Expected object, received string" or vice versa

**Solution:**

```typescript
// In src/content/config.ts
// Must use z.union() for dual format support
const imageSchema = z.union([
  z.string(),              // Legacy
  z.object({ ... }),       // Enhanced
]).optional();

// NOT this:
const imageSchema = z.object({ ... });  // ❌ Only enhanced format
```

---

## Debug Mode

Enable debug logging for troubleshooting:

```typescript
// In src/lib/utils/imageProcessing.ts
const DEBUG = true;  // Set to true for logging

export async function generateImageVariants(options: GenerateVariantsOptions) {
  if (DEBUG) console.log('[imageProcessing] Input:', options);

  // ... existing code ...

  if (DEBUG) console.log('[imageProcessing] Output:', variants);
}
```

```bash
# Run build with verbose output
npm run build -- --verbose
```

---

## Getting Help

If you've tried all solutions and the issue persists:

1. **Gather information:**
   - Error messages (full text)
   - Browser console logs
   - Build output
   - Network tab screenshots
   - Affected file paths

2. **Check existing issues:**
   - Search project GitHub issues
   - Check Astro Discord #help channel

3. **Create a minimal reproduction:**
   - Isolate the problem
   - Remove unrelated code
   - Test with minimal example

4. **Contact support:**
   - Open GitHub issue with reproduction
   - Include all gathered information
   - Tag with `bug` or `help-wanted`

---

## Useful Commands

```bash
# Clear all caches
rm -rf node_modules/.astro dist/ .astro/

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests
npm test

# Build with verbose output
npm run build -- --verbose

# Check TypeScript types
npx tsc --noEmit

# Validate content schema
npm run astro check
```

---

**Last Updated:** 21. prosince 2025
**Version:** 1.0
