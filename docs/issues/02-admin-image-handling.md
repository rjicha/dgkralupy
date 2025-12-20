# RFC: Enhanced Image Handling for Articles

**Status**: ✅ APPROVED - Ready for Implementation
**Author**: Staff Engineer
**Date**: 2025-12-20
**Last Updated**: 2025-12-20 (Product Owner approved)
**Approved By**: Radek (Product Owner)
**Related**: [Design System](./DESIGN_SYSTEM.md), [Tech Stack](./TECH_STACK.md)

## Executive Summary

This RFC proposes an enhanced image handling system for article images that addresses current issues with image proportions and display quality across different contexts (hero banners, article cards, detail pages). The solution includes multi-format image generation, focus point selection, and intelligent cropping to ensure optimal presentation regardless of upload dimensions.

## Problem Statement

### Current Issues

1. **Problematic Proportions**: Users upload images with varying aspect ratios that don't match display requirements
   - Hero sections require wide images (~16:9 or wider)
   - Article cards display at 16:9 aspect ratio
   - Inconsistent source images result in awkward cropping or distortion

2. **No Image Optimization**: Images are served as-is from `/public/images/`
   - File sizes range from 142KB to 3.3MB (christmas-concert.jpg)
   - No responsive image variants (no srcset)
   - No modern format support (WebP, AVIF)
   - Performance impact on mobile and slow connections

3. **Limited Control**: Content editors have no way to:
   - Set focus points for automatic cropping
   - Preview how images will appear in different contexts
   - Crop or adjust images after upload
   - Generate optimized variants

4. **Inconsistent Display**: Same image used across contexts with different requirements
   - Hero: Full-width background (h-96, object-cover)
   - Cards: 16:9 aspect ratio (aspect-video)
   - Detail: Large featured image (max-h-500px)
   - Related articles: Small thumbnails (h-48)

### Impact

- **User Experience**: Poor image presentation reduces visual appeal
- **Performance**: Large unoptimized images slow page load (especially 3.3MB hero image)
- **SEO**: Slow load times negatively impact search rankings
- **Editor Frustration**: No control over how images display after upload

## Current Implementation Analysis

### Article Schema

```typescript
// src/content/config.ts
const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // ... other fields
    image: z.string().optional(),   // Single image path
  }),
});
```

### Image Display Contexts

| Context | Component | Aspect Ratio | Dimensions | CSS |
|---------|-----------|--------------|------------|-----|
| Hero Section | `Hero.astro` | Wide (~16:9) | Full width × h-96 | `object-cover opacity-50` |
| Article Card | `ArticleCard.astro` | 16:9 | Full width × auto | `aspect-video object-cover` |
| Article Detail | `[slug].astro` | Flexible | Full width × max-h-500px | `object-cover` |
| Related Articles | `[slug].astro` | 16:9 | Full width × h-48 | `aspect-video object-cover` |

### Admin Configuration

```yaml
# public/admin/config.yml
- label: "Hlavní obrázek"
  name: "image"
  widget: "image"
  required: false
  hint: "Hlavní obrázek článku (doporučený formát: 1200x675px)"
```

**Current Recommended Size**: 1200×675px (16:9)
**Reality**: Users upload various sizes without consistency

## Proposed Solution

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Content Editor (Decap CMS)              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Upload Original Image                              │ │
│  │  2. Set Focus Point (x%, y%)                          │ │
│  │  3. Preview Variants (Hero, Card, Thumbnail)          │ │
│  │  4. Adjust Crops if Needed                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Build Time (Astro + Sharp)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Generate Image Variants:                              │ │
│  │  • hero: 1920×1080 (16:9) - WebP, AVIF, JPG          │ │
│  │  • card: 800×450 (16:9) - WebP, AVIF, JPG            │ │
│  │  • thumbnail: 400×225 (16:9) - WebP, AVIF, JPG       │ │
│  │  • detail: 1200×800 (3:2) - WebP, AVIF, JPG          │ │
│  │                                                          │ │
│  │  Apply: Focus point, Smart crop, Optimization          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Production (GitHub Pages)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Serve optimized variants with:                        │ │
│  │  • <picture> element for format support               │ │
│  │  • srcset for responsive images                       │ │
│  │  • Lazy loading                                       │ │
│  │  • Automatic format selection (AVIF → WebP → JPG)    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Solution Components

#### 1. Enhanced Article Schema

```typescript
// src/content/config.ts
const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // ... existing fields
    image: z.object({
      src: z.string(),                    // Original image path
      focusPoint: z.object({
        x: z.number().min(0).max(100),    // X percentage (0-100)
        y: z.number().min(0).max(100),    // Y percentage (0-100)
      }).optional(),
      alt: z.string(),                    // Accessibility text
      crops: z.object({
        hero: z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        }).optional(),
        card: z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        }).optional(),
      }).optional(),
    }).optional(),
  }),
});
```

**Example Frontmatter**:
```yaml
---
title: "Halloween na DG"
image:
  src: "/images/halloween.jpg"
  alt: "Studenti v halloweenských kostýmech"
  focusPoint:
    x: 50
    y: 30
  crops:
    hero:
      x: 0
      y: 10
      width: 100
      height: 60
---
```

#### 2. Image Variant Generation (Build Time)

**Note**: Using Astro's built-in `astro:assets` (Sharp-based image optimization is built-in; no external integration needed)

**Image Processing Utility**:
```typescript
// src/utils/imageProcessing.ts
import { getImage } from 'astro:assets';

export const imageVariants = {
  hero: { width: 1920, height: 1080, aspectRatio: 16/9 },
  card: { width: 800, height: 450, aspectRatio: 16/9 },
  thumbnail: { width: 400, height: 225, aspectRatio: 16/9 },
  detail: { width: 1200, height: 800, aspectRatio: 3/2 },
};

export async function generateImageVariants(
  imageSrc: string,
  focusPoint?: { x: number; y: number },
  customCrops?: Record<string, CropData>
) {
  const variants = {};

  for (const [variant, specs] of Object.entries(imageVariants)) {
    // Apply custom crop if provided
    const crop = customCrops?.[variant];

    variants[variant] = {
      webp: await getImage({
        src: imageSrc,
        width: specs.width,
        height: specs.height,
        format: 'webp',
        quality: 80,
        position: focusPoint ? `${focusPoint.x}% ${focusPoint.y}%` : 'center',
        fit: 'cover',
      }),
      avif: await getImage({
        src: imageSrc,
        width: specs.width,
        height: specs.height,
        format: 'avif',
        quality: 70,
        position: focusPoint ? `${focusPoint.x}% ${focusPoint.y}%` : 'center',
        fit: 'cover',
      }),
      jpg: await getImage({
        src: imageSrc,
        width: specs.width,
        height: specs.height,
        format: 'jpg',
        quality: 85,
        position: focusPoint ? `${focusPoint.x}% ${focusPoint.y}%` : 'center',
        fit: 'cover',
      }),
    };
  }

  return variants;
}
```

#### 3. Responsive Image Component

```astro
---
// src/components/ResponsiveImage.astro
import { getImage } from 'astro:assets';

interface Props {
  image: {
    src: string;
    alt: string;
    focusPoint?: { x: number; y: number };
    crops?: Record<string, CropData>;
  };
  variant: 'hero' | 'card' | 'thumbnail' | 'detail';
  loading?: 'lazy' | 'eager';
  class?: string;
}

const { image, variant, loading = 'lazy', class: className } = Astro.props;

// Generate variants
const variants = await generateImageVariants(
  image.src,
  image.focusPoint,
  image.crops
);

const variantImages = variants[variant];
---

<picture class={className}>
  <!-- AVIF (best compression) -->
  <source
    type="image/avif"
    srcset={variantImages.avif.src}
    width={variantImages.avif.width}
    height={variantImages.avif.height}
  />

  <!-- WebP (good compression, wide support) -->
  <source
    type="image/webp"
    srcset={variantImages.webp.src}
    width={variantImages.webp.width}
    height={variantImages.webp.height}
  />

  <!-- JPG (fallback) -->
  <img
    src={variantImages.jpg.src}
    alt={image.alt}
    width={variantImages.jpg.width}
    height={variantImages.jpg.height}
    loading={loading}
    decoding="async"
  />
</picture>
```

#### 4. Custom Decap CMS Widget

**Focus Point & Crop Editor Widget** (Czech Localized with Visual Focus Point Selection):

```javascript
// public/admin/image-crop-widget.js
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

CMS.registerWidget('image-crop', {
  control: ({ value, onChange, field }) => {
    const [image, setImage] = React.useState(value?.src || '');
    const [focusPoint, setFocusPoint] = React.useState(value?.focusPoint || { x: 50, y: 50 });
    const [crops, setCrops] = React.useState(value?.crops || {});
    const [alt, setAlt] = React.useState(value?.alt || '');
    const [previewVariant, setPreviewVariant] = React.useState('hero');
    const [showAdvanced, setShowAdvanced] = React.useState(false);

    const cropperRef = React.useRef(null);
    const imageRef = React.useRef(null);
    const focusPointImageRef = React.useRef(null);

    // Handle visual focus point selection via click
    const handleFocusPointClick = (e) => {
      const rect = focusPointImageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setFocusPoint({
        x: Math.round(Math.max(0, Math.min(100, x))),
        y: Math.round(Math.max(0, Math.min(100, y)))
      });
    };

    // Initialize Cropper.js when image loads (advanced mode only)
    React.useEffect(() => {
      if (imageRef.current && image && showAdvanced) {
        cropperRef.current = new Cropper(imageRef.current, {
          aspectRatio: previewVariant === 'hero' ? 16/9 : 16/9,
          viewMode: 1,
          autoCropArea: 1,
          crop(event) {
            const cropData = {
              x: event.detail.x,
              y: event.detail.y,
              width: event.detail.width,
              height: event.detail.height,
            };

            setCrops({
              ...crops,
              [previewVariant]: cropData,
            });
          },
        });
      }

      return () => {
        if (cropperRef.current) {
          cropperRef.current.destroy();
        }
      };
    }, [image, previewVariant, showAdvanced]);

    // Update parent when data changes
    React.useEffect(() => {
      onChange({
        src: image,
        focusPoint,
        crops,
        alt,
      });
    }, [image, focusPoint, crops, alt]);

    return (
      <div className="image-crop-widget" role="region" aria-labelledby="image-widget-title">
        <h3 id="image-widget-title" className="sr-only">Nahrání a úprava obrázku</h3>

        {/* Upload requirements */}
        {!image && (
          <div className="upload-requirements">
            <p className="requirements-title">Požadavky na obrázek:</p>
            <ul className="requirements-list">
              <li>✓ Formát: JPG, PNG nebo WebP</li>
              <li>✓ Minimální velikost: 800×450 px</li>
              <li>✓ Maximální velikost souboru: 10 MB</li>
            </ul>
            <p className="hint">💡 Tip: Pro nejlepší výsledek použijte obrázek 1200×675 px</p>
          </div>
        )}

        {/* Image upload */}
        <div className="upload-section">
          <label htmlFor="image-upload">Nahrát obrázek</label>
          <input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-describedby="upload-hint"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => setImage(reader.result);
                reader.readAsDataURL(file);
              }
            }}
          />
          <p id="upload-hint" className="hint">
            Podporované formáty: JPEG, PNG, WebP (max 10 MB)
          </p>
        </div>

        {image && (
          <>
            {/* Alt text (required) */}
            <div className="alt-section">
              <label htmlFor="image-alt">
                Alternativní text
                <span className="required" aria-label="povinné">*</span>
              </label>
              <input
                id="image-alt"
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Popište obrázek pro nevidomé uživatele"
                aria-required="true"
                aria-describedby="alt-hint alt-counter"
                maxLength={125}
              />
              <div className="input-footer">
                <p id="alt-hint" className="hint">
                  Popište, co je na obrázku vidět
                </p>
                <p id="alt-counter" className={`char-counter ${alt.length > 125 ? 'error' : alt.length > 112 ? 'warning' : ''}`}>
                  {alt.length} / 125
                </p>
              </div>
            </div>

            {/* Visual focus point selector */}
            <div className="focus-point-section">
              <label>Bod zaměření</label>
              <p className="hint">
                Klikněte na nejdůležitější část obrázku (např. obličej osoby, logo, hlavní objekt)
              </p>
              <div
                className="focus-point-preview"
                onClick={handleFocusPointClick}
                role="button"
                tabIndex={0}
                aria-label="Klikněte pro nastavení bodu zaměření"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Center focus point on keyboard activation
                    setFocusPoint({ x: 50, y: 50 });
                  }
                }}
              >
                <img
                  ref={focusPointImageRef}
                  src={image}
                  alt="Náhled pro výběr bodu zaměření"
                  className="focus-preview-image"
                />
                {/* Visual focus point indicator */}
                <div
                  className="focus-point-marker"
                  style={{
                    left: `${focusPoint.x}%`,
                    top: `${focusPoint.y}%`
                  }}
                  aria-hidden="true"
                >
                  <div className="focus-crosshair"></div>
                </div>
              </div>
              <p className="focus-point-status" aria-live="polite">
                ✓ Bod zaměření nastaven: {focusPoint.x}%, {focusPoint.y}%
              </p>
            </div>

            {/* Advanced mode toggle */}
            <div className="advanced-toggle">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAdvanced(!showAdvanced)}
                aria-expanded={showAdvanced}
                aria-controls="advanced-options"
              >
                {showAdvanced ? '▼ Skrýt pokročilé možnosti' : '▶ Zobrazit pokročilé možnosti'}
              </button>
            </div>

            {/* Advanced options (collapsible) */}
            {showAdvanced && (
              <div id="advanced-options" className="advanced-options">
                {/* Variant selector */}
                <div className="variant-selector">
                  <label htmlFor="variant-select">Náhled varianty</label>
                  <select
                    id="variant-select"
                    value={previewVariant}
                    onChange={(e) => setPreviewVariant(e.target.value)}
                  >
                    <option value="hero">Hlavní banner (16:9)</option>
                    <option value="card">Karta článku (16:9)</option>
                    <option value="thumbnail">Miniatura (16:9)</option>
                    <option value="detail">Detail článku (3:2)</option>
                  </select>
                  <p className="hint">Zvolte variantu pro zobrazení náhledu ořezu</p>
                </div>

                {/* Cropper */}
                <div className="cropper-container">
                  <label>Ruční úprava ořezu (volitelné)</label>
                  <p className="hint">Přetáhněte rám pro přesné nastavení ořezu</p>
                  <img ref={imageRef} src={image} alt="Náhled ořezu" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  },

  preview: ({ value }) => {
    if (!value?.src) return <p>Obrázek nebyl nahrán</p>;

    return (
      <div className="image-preview">
        <img
          src={value.src}
          alt={value.alt || 'Náhled'}
          style={{ maxWidth: '300px', height: 'auto' }}
        />
        <p><strong>Alt text:</strong> {value.alt || 'Není zadán'}</p>
        <p className="hint">Bod zaměření: {value.focusPoint?.x || 50}%, {value.focusPoint?.y || 50}%</p>
      </div>
    );
  },
});
```

**Update Decap CMS Config**:

```yaml
# public/admin/config.yml
collections:
  - name: "articles"
    fields:
      # ... other fields
      - label: "Hlavní obrázek"
        name: "image"
        widget: "image-crop"
        required: false
        hint: "Nahrajte obrázek a nastavte bod zaměření pro optimální zobrazení"
```

## Admin UI Design & User Experience

**Target Platform**: Desktop browsers (admin editing is desktop-only; mobile is limited to simple publish/unpublish actions)

### Design System Integration

The admin widget must follow the project's design system for visual consistency and professional appearance.

#### Typography

```css
/* public/admin/admin-styles.css */
.image-crop-widget {
  font-family: 'Open Sans', Arial, sans-serif;
  color: #3b3b3b; /* Secondary text */
}

.image-crop-widget label {
  display: block;
  font-size: 12px; /* xs */
  font-weight: 700;
  color: #000000; /* Primary text */
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  letter-spacing: 0.025em;
}

.image-crop-widget .hint {
  font-size: 12px; /* xs */
  color: #a09f9f; /* Muted text */
  font-style: italic;
  margin-top: 0.25rem;
}

.image-crop-widget input,
.image-crop-widget select {
  font-family: 'Open Sans', Arial, sans-serif;
  font-size: 16px; /* Base */
}
```

#### Color Palette

```css
/* Design system colors for admin widget */
:root {
  --admin-primary: #3b5f78;        /* Primary blue-gray */
  --admin-primary-dark: #273946;   /* Darker primary */
  --admin-secondary: #44c2c4;      /* Cyan accent */
  --admin-success: #bfcc34;        /* Green accent */
  --admin-error: #ff6b6b;          /* Coral error */
  --admin-error-dark: #c44d58;     /* Rose error text */

  --admin-bg-page: #f0f0f0;        /* Light gray background */
  --admin-bg-content: #ffffff;     /* White content */

  --admin-border-light: #efefef;   /* Subtle borders */
  --admin-border-default: #cccccc; /* Standard borders */
  --admin-border-focus: #44c2c4;   /* Focus state */

  --admin-text-primary: #000000;   /* Black */
  --admin-text-secondary: #3b3b3b; /* Dark gray */
  --admin-text-muted: #a09f9f;     /* Gray */
}
```

### Interactive States

All interactive elements must have clear visual feedback across all states.

#### Input Fields & Select Dropdowns

```css
/* Default state */
.image-crop-widget input[type="text"],
.image-crop-widget input[type="number"],
.image-crop-widget select {
  border: 2px solid var(--admin-border-default);
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  background: var(--admin-bg-content);
  color: var(--admin-text-secondary);
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

/* Hover state */
.image-crop-widget input:hover,
.image-crop-widget select:hover {
  border-color: var(--admin-primary);
}

/* Focus state */
.image-crop-widget input:focus,
.image-crop-widget select:focus {
  outline: none;
  border-color: var(--admin-border-focus);
  box-shadow: 0 0 0 3px rgba(68, 194, 196, 0.2);
}

/* Error state */
.image-crop-widget input.error {
  border-color: var(--admin-error);
}

.image-crop-widget input.error:focus {
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
}

/* Disabled state */
.image-crop-widget input:disabled,
.image-crop-widget select:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}
```

#### Buttons

```css
/* Primary button (Upload, Save) */
.image-crop-widget .btn-primary {
  background-color: var(--admin-primary);
  color: #ffffff;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 200ms ease;
}

.image-crop-widget .btn-primary:hover {
  background-color: var(--admin-primary-dark);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.image-crop-widget .btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 95, 120, 0.3);
}

.image-crop-widget .btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.image-crop-widget .btn-primary:disabled {
  background-color: #999;
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

/* Secondary button (Reset, Cancel) */
.image-crop-widget .btn-secondary {
  background-color: transparent;
  color: var(--admin-primary);
  border: 2px solid var(--admin-primary);
  padding: 0.625rem 1.25rem;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 200ms ease;
}

.image-crop-widget .btn-secondary:hover {
  background-color: var(--admin-primary);
  color: #ffffff;
}
```

#### Visual Focus Point Selector

```css
/* Focus point preview container */
.focus-point-preview {
  position: relative;
  display: inline-block;
  max-width: 100%;
  cursor: crosshair;
  border: 2px solid var(--admin-border-default);
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 200ms ease;
}

.focus-point-preview:hover {
  border-color: var(--admin-secondary);
}

.focus-point-preview:focus {
  outline: 2px solid var(--admin-border-focus);
  outline-offset: 2px;
  border-color: var(--admin-border-focus);
}

.focus-preview-image {
  display: block;
  max-width: 100%;
  height: auto;
  user-select: none;
}

/* Focus point marker (crosshair) */
.focus-point-marker {
  position: absolute;
  width: 0;
  height: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
}

.focus-crosshair {
  position: relative;
  width: 40px;
  height: 40px;
  margin-left: -20px;
  margin-top: -20px;
}

.focus-crosshair::before,
.focus-crosshair::after {
  content: '';
  position: absolute;
  background-color: var(--admin-secondary);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

/* Vertical line */
.focus-crosshair::before {
  left: 50%;
  top: 0;
  width: 2px;
  height: 100%;
  transform: translateX(-50%);
}

/* Horizontal line */
.focus-crosshair::after {
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  transform: translateY(-50%);
}

/* Center circle */
.focus-crosshair {
  border: 3px solid var(--admin-secondary);
  border-radius: 50%;
  background-color: rgba(68, 194, 196, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(68, 194, 196, 0.5);
  }
  50% {
    box-shadow: 0 0 16px rgba(68, 194, 196, 0.8);
  }
}

/* Focus point status text */
.focus-point-status {
  margin-top: 0.5rem;
  font-size: 14px;
  color: var(--admin-success);
  font-weight: 600;
}

/* Upload requirements box */
.upload-requirements {
  background: var(--admin-bg-page);
  border: 1px solid var(--admin-border-light);
  border-left: 4px solid var(--admin-secondary);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.upload-requirements .requirements-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin-bottom: 0.5rem;
}

.upload-requirements .requirements-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
  font-size: 14px;
  color: var(--admin-text-secondary);
}

.upload-requirements .requirements-list li {
  padding: 0.25rem 0;
}

/* Advanced options toggle */
.advanced-toggle {
  margin: 1.5rem 0 1rem;
  text-align: center;
}

.advanced-options {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid var(--admin-border-light);
}
```

#### Variant Selector Tabs

```css
/* Tab navigation for variant preview */
.variant-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--admin-border-light);
}

.variant-selector button {
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 0.75rem 1rem;
  font-size: 14px;
  font-weight: 600;
  color: var(--admin-text-secondary);
  cursor: pointer;
  transition: all 200ms ease;
}

.variant-selector button:hover {
  color: var(--admin-primary);
  background-color: rgba(59, 95, 120, 0.05);
}

.variant-selector button.active {
  color: var(--admin-secondary);
  border-bottom-color: var(--admin-secondary);
  font-weight: 700;
}

.variant-selector button:focus {
  outline: 2px solid var(--admin-border-focus);
  outline-offset: 2px;
}
```

### User Feedback Components

#### Loading State

```jsx
// Add to widget component
const [isUploading, setIsUploading] = React.useState(false);
const [isProcessing, setIsProcessing] = React.useState(false);

// Enhanced upload handler
onChange={(e) => {
  const file = e.target.files[0];
  if (file) {
    setIsUploading(true);

    // Validate file
    validateImage(file)
      .then(() => {
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result);
          setIsUploading(false);
        };
        reader.onerror = () => {
          setErrors({ upload: 'Failed to read image file' });
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      })
      .catch((error) => {
        setErrors({ upload: error });
        setIsUploading(false);
      });
  }
}}

// Loading spinner component
{isUploading && (
  <div className="loading-overlay">
    <div className="spinner" role="status" aria-live="polite">
      <span className="sr-only">Nahrávání obrázku...</span>
    </div>
    <p>Nahrávání obrázku...</p>
  </div>
)}
```

```css
/* Loading spinner */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  border: 3px solid var(--admin-border-light);
  border-top-color: var(--admin-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay p {
  margin-top: 1rem;
  color: var(--admin-text-secondary);
  font-weight: 600;
}
```

#### Error Messages

```jsx
// Error state management
const [errors, setErrors] = React.useState({});

// Validation function with Czech actionable error messages
function validateImage(file) {
  return new Promise((resolve, reject) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      const fileTypeName = file.type.split('/')[1]?.toUpperCase() || 'neznámý';
      reject(`Nepodporovaný formát souboru (${fileTypeName}). Použijte prosím JPG, PNG nebo WebP.`);
      return;
    }

    if (file.size > maxFileSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      reject(`Soubor je příliš velký (${sizeMB} MB). Maximální velikost je 10 MB. Zkomprimujte prosím obrázek.`);
      return;
    }

    // Check dimensions
    const img = new Image();
    img.onload = () => {
      if (img.width < 800 || img.height < 450) {
        reject(`Obrázek je příliš malý (${img.width}×${img.height} px). Minimální velikost je 800×450 px. Použijte prosím větší obrázek.`);
        return;
      }
      if (img.width > 4000 || img.height > 4000) {
        reject(`Obrázek je příliš velký (${img.width}×${img.height} px). Maximální rozměry jsou 4000×4000 px.`);
        return;
      }
      resolve(true);
    };
    img.onerror = () => reject('Neplatný soubor obrázku. Zkontrolujte, zda je soubor skutečně obrázek.');
    img.src = URL.createObjectURL(file);
  });
}

// Error display component
{errors.upload && (
  <div className="error-message" role="alert">
    <svg className="error-icon" width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/>
    </svg>
    <span>{errors.upload}</span>
  </div>
)}

{errors.alt && (
  <div className="error-message" role="alert">
    <span>{errors.alt}</span>
  </div>
)}
```

```css
/* Error message styling */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fff5f5;
  border: 1px solid var(--admin-error);
  border-left: 4px solid var(--admin-error);
  color: var(--admin-error-dark);
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 0.5rem;
}

.error-icon {
  flex-shrink: 0;
  color: var(--admin-error);
}
```

#### Success Messages

```jsx
// Success state
const [showSuccess, setShowSuccess] = React.useState(false);

// After successful upload
setShowSuccess(true);
setTimeout(() => setShowSuccess(false), 3000);

// Success message component
{showSuccess && (
  <div className="success-message" role="status" aria-live="polite">
    <svg className="success-icon" width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z"/>
    </svg>
    <span>Obrázek byl úspěšně nahrán!</span>
  </div>
)}
```

```css
/* Success message styling */
.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f0fdf4;
  border: 1px solid var(--admin-success);
  border-left: 4px solid var(--admin-success);
  color: var(--admin-primary);
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 0.5rem;
}

.success-icon {
  flex-shrink: 0;
  color: var(--admin-success);
}
```

### Accessibility Requirements

#### ARIA Labels and Roles (Czech Localized with Visual Focus Point)

```jsx
// Enhanced widget with accessibility (Czech localized)
<div className="image-crop-widget" role="region" aria-labelledby="image-widget-title">
  <h3 id="image-widget-title" className="sr-only">Nahrání a úprava obrázku</h3>

  {/* File upload with pre-upload requirements */}
  <div className="upload-section">
    <label htmlFor="image-upload" id="upload-label">
      Nahrát obrázek
    </label>
    <input
      id="image-upload"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      aria-labelledby="upload-label"
      aria-describedby="upload-hint upload-requirements"
      onChange={handleUpload}
    />
    <p id="upload-hint" className="hint">
      Podporované formáty: JPEG, PNG, WebP (max 10 MB)
    </p>
  </div>

  {/* Alt text (required) */}
  <div className="alt-section">
    <label htmlFor="image-alt">
      Alternativní text
      <span className="required" aria-label="povinné">*</span>
    </label>
    <input
      id="image-alt"
      type="text"
      value={alt}
      onChange={(e) => handleAltChange(e.target.value)}
      placeholder="Popište obrázek pro nevidomé uživatele"
      aria-required="true"
      aria-describedby="alt-hint alt-counter"
      aria-invalid={errors.alt ? 'true' : 'false'}
      maxLength={125}
    />
    <div className="input-footer">
      <p id="alt-hint" className="hint">
        Popište, co je na obrázku vidět
      </p>
      <p id="alt-counter" className={`char-counter ${alt.length > 125 ? 'error' : alt.length > 112 ? 'warning' : ''}`}>
        {alt.length} / 125
      </p>
    </div>
  </div>

  {/* Visual focus point selector */}
  <div className="focus-point-section">
    <label id="focus-label">Bod zaměření</label>
    <p id="focus-hint" className="hint">
      Klikněte na nejdůležitější část obrázku (např. obličej osoby, logo, hlavní objekt)
    </p>
    <div
      className="focus-point-preview"
      onClick={handleFocusPointClick}
      role="button"
      tabIndex={0}
      aria-labelledby="focus-label"
      aria-describedby="focus-hint focus-status"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFocusPoint({ x: 50, y: 50 });
        }
      }}
    >
      <img
        ref={focusPointImageRef}
        src={image}
        alt="Náhled pro výběr bodu zaměření"
        className="focus-preview-image"
      />
      <div
        className="focus-point-marker"
        style={{ left: `${focusPoint.x}%`, top: `${focusPoint.y}%` }}
        aria-hidden="true"
      >
        <div className="focus-crosshair"></div>
      </div>
    </div>
    <p id="focus-status" className="focus-point-status" aria-live="polite">
      ✓ Bod zaměření nastaven: {focusPoint.x}%, {focusPoint.y}%
    </p>
  </div>

  {/* Live region for status updates */}
  <div role="status" aria-live="polite" className="sr-only">
    {isUploading && "Nahrávání obrázku..."}
    {isProcessing && "Zpracování variant obrázku..."}
    {showSuccess && "Obrázek byl úspěšně nahrán"}
  </div>
</div>
```

```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Required field indicator */
.required {
  color: var(--admin-error);
  margin-left: 0.25rem;
}
```

#### Keyboard Navigation

```jsx
// Enhanced Cropper.js initialization with keyboard support
React.useEffect(() => {
  if (imageRef.current && image) {
    const cropper = new Cropper(imageRef.current, {
      aspectRatio: getAspectRatio(previewVariant),
      viewMode: 1,
      autoCropArea: 1,
      responsive: true,
      guides: true,
      center: true,
      highlight: true,
      crop(event) {
        handleCropChange(event);
      },
    });

    cropperRef.current = cropper;

    // Add keyboard controls
    const handleKeyDown = (e) => {
      if (!cropper) return;

      const step = e.shiftKey ? 10 : 1;

      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          cropper.move(0, -step);
          break;
        case 'ArrowDown':
          e.preventDefault();
          cropper.move(0, step);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          cropper.move(-step, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          cropper.move(step, 0);
          break;
        case '+':
        case '=':
          e.preventDefault();
          cropper.zoom(0.1);
          break;
        case '-':
          e.preventDefault();
          cropper.zoom(-0.1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cropper.destroy();
    };
  }
}, [image, previewVariant]);
```

```html
<!-- Keyboard instructions (Czech) -->
<div className="keyboard-instructions" aria-label="Klávesové zkratky">
  <details>
    <summary>Klávesové zkratky</summary>
    <ul>
      <li><kbd>Šipky</kbd> - Posunout oblast ořezu (Shift pro větší kroky)</li>
      <li><kbd>+</kbd> / <kbd>-</kbd> - Přiblížit/Oddálit</li>
      <li><kbd>Tab</kbd> - Navigace mezi ovládacími prvky</li>
      <li><kbd>Enter</kbd> / <kbd>Mezerník</kbd> - Nastavit bod zaměření na střed</li>
    </ul>
  </details>
</div>
```

```css
/* Keyboard instructions styling */
.keyboard-instructions {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--admin-bg-page);
  border-radius: 4px;
  font-size: 12px;
}

.keyboard-instructions summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--admin-primary);
}

.keyboard-instructions ul {
  margin: 0.5rem 0 0 1.5rem;
  list-style: disc;
}

.keyboard-instructions kbd {
  background: #fff;
  border: 1px solid var(--admin-border-default);
  border-radius: 3px;
  padding: 0.125rem 0.375rem;
  font-family: monospace;
  font-size: 11px;
}
```

### Character Counter for Alt Text

```jsx
// Alt text with validation
const [alt, setAlt] = React.useState(value?.alt || '');
const maxAltLength = 125;

const handleAltChange = (newValue) => {
  setAlt(newValue);

  // Validate alt text
  if (newValue.length === 0) {
    setErrors({ ...errors, alt: 'Alt text is required for accessibility' });
  } else if (newValue.length > maxAltLength) {
    setErrors({ ...errors, alt: `Alt text must be ${maxAltLength} characters or less` });
  } else {
    const { alt: _, ...restErrors } = errors;
    setErrors(restErrors);
  }
};

// Character counter component
<div className="input-footer">
  <p className="hint">Describe what's in the image</p>
  <p className={`char-counter ${alt.length > maxAltLength ? 'error' : alt.length > maxAltLength * 0.9 ? 'warning' : ''}`}>
    {alt.length} / {maxAltLength}
  </p>
</div>
```

```css
/* Character counter */
.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
}

.char-counter {
  font-size: 12px;
  color: var(--admin-text-muted);
  font-weight: 600;
}

.char-counter.warning {
  color: #d97706; /* Orange warning */
}

.char-counter.error {
  color: var(--admin-error);
}
```

### Admin UI Implementation Checklist

**Design System Compliance**:
- [ ] All colors from design system palette
- [ ] Typography uses Open Sans (body) with proper sizes
- [ ] Labels use 12px uppercase with letter-spacing
- [ ] Consistent spacing using 0.25rem increments

**Interactive States**:
- [ ] Hover states on all buttons and inputs
- [ ] Focus indicators with ring-2 pattern
- [ ] Active/pressed states for buttons
- [ ] Disabled states with reduced opacity
- [ ] Loading spinners during async operations

**User Feedback**:
- [ ] Upload progress indicator
- [ ] Error messages with icons and clear text
- [ ] Success confirmations (auto-dismiss after 3s)
- [ ] Validation feedback in real-time
- [ ] Character counter for alt text

**Accessibility**:
- [ ] All inputs have associated labels (htmlFor/id)
- [ ] ARIA labels for complex controls
- [ ] ARIA live regions for status updates
- [ ] Keyboard navigation fully functional
- [ ] Screen reader tested
- [ ] Focus indicators always visible
- [ ] Required fields marked with asterisk and aria-required

**Error Handling**:
- [ ] File type validation with clear message
- [ ] File size validation (max 10MB)
- [ ] Dimension validation (min 800×450px)
- [ ] Alt text required validation
- [ ] Alt text length validation (max 125 chars)
- [ ] Network error handling

## Implementation Plan

### Phase 1: Foundation (Week 1)

**Goal**: Set up image processing infrastructure

- [ ] Create image variant specifications
- [ ] Build image processing utility (`src/utils/imageProcessing.ts`) using `astro:assets`
- [ ] Write unit tests for image processing
- [ ] Configure Sharp options if needed (quality, formats)

**Deliverables**:
- Working build-time image optimization using Astro's built-in image service
- Automated variant generation
- Test coverage for image utilities

### Phase 2: Component Migration (Week 2)

**Goal**: Update components to use optimized images

- [ ] Create `ResponsiveImage.astro` component
- [ ] Update `Hero.astro` to use responsive images
- [ ] Update `ArticleCard.astro` to use responsive images
- [ ] Update article detail page (`[slug].astro`)
- [ ] Add lazy loading to all images
- [ ] Test all image display contexts

**Deliverables**:
- All components using `ResponsiveImage`
- Proper `<picture>` elements with AVIF/WebP/JPG
- Lazy loading implemented
- Performance improvement metrics

### Phase 3: Schema Migration (Week 2-3)

**Goal**: Update content schema for enhanced image data

- [ ] Update article collection schema
- [ ] Create migration script for existing articles
- [ ] Migrate existing article frontmatter
- [ ] Update type definitions
- [ ] Test with all existing content

**Migration Script**:
```typescript
// scripts/migrate-images.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDir = './src/content/articles';

fs.readdirSync(articlesDir).forEach(file => {
  const filePath = path.join(articlesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: markdown } = matter(content);

  // Migrate simple string image to object
  if (typeof data.image === 'string') {
    data.image = {
      src: data.image,
      alt: `${data.title} - featured image`,
      focusPoint: { x: 50, y: 50 }, // Default center
    };

    const newContent = matter.stringify(markdown, data);
    fs.writeFileSync(filePath, newContent);
  }
});
```

**Deliverables**:
- Updated schema
- All existing articles migrated
- No content loss or breakage

### Phase 4: Admin Interface (Week 3-4)

**Goal**: Build custom Decap CMS widget for image editing

- [ ] Create `image-crop-widget.js` with Cropper.js
- [ ] Implement visual focus point selector (click-based, Czech localized)
- [ ] Add multi-variant preview (collapsible advanced mode)
- [ ] Add alt text editor with character counter (0-125 chars)
- [ ] Implement all items from **Admin UI Implementation Checklist** (lines 1470-1507):
  - [ ] Design System Compliance (colors, typography, spacing)
  - [ ] Interactive States (hover, focus, active, disabled, loading)
  - [ ] User Feedback (progress, errors, success, validation)
  - [ ] Accessibility (labels, ARIA, live regions, keyboard nav, screen reader)
  - [ ] Error Handling (file type, size, dimensions, alt text validation)
- [ ] Pre-upload requirements display (Czech)
- [ ] Actionable error messages with specific values (Czech)
- [ ] Update Decap CMS configuration
- [ ] Test widget in admin interface (desktop browsers only)
- [ ] Write user documentation (Czech)

**Deliverables**:
- Functional image crop widget with full design system integration
- Visual focus point selection (no manual percentages)
- Collapsible advanced mode for power users
- Full accessibility compliance (WCAG AA)
- Czech-localized user guide for content editors

### Phase 5: Optimization & Testing (Week 4)

**Goal**: Ensure performance and quality

- [ ] Run Lighthouse performance tests
- [ ] Optimize generated image sizes
- [ ] Test on various devices and connections
- [ ] Verify accessibility (alt text, ARIA)
- [ ] Test build time with many images
- [ ] Document performance improvements
- [ ] Create rollback plan

**Success Metrics**:
- [ ] Lighthouse Performance Score > 90
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Image file sizes reduced by > 60%
- [ ] Build time increase < 30%
- [ ] All images have proper alt text

**Deliverables**:
- Performance report
- Optimization recommendations
- Complete documentation

## Technical Considerations

### Security

#### Image Upload Validation

```typescript
// Validate file type, size, dimensions
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxFileSize = 10 * 1024 * 1024; // 10MB
const maxDimensions = { width: 4000, height: 4000 };

function validateImage(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      reject('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Check file size
    if (file.size > maxFileSize) {
      reject('File too large. Maximum size is 10MB.');
      return;
    }

    // Check dimensions
    const img = new Image();
    img.onload = () => {
      if (img.width > maxDimensions.width || img.height > maxDimensions.height) {
        reject('Image dimensions too large. Maximum is 4000×4000px.');
        return;
      }
      resolve(true);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

**Security Checklist**:
- [ ] Validate file types (JPEG, PNG, WebP only)
- [ ] Limit file sizes (max 10MB)
- [ ] Sanitize filenames (no path traversal)
- [ ] Validate image dimensions
- [ ] Strip EXIF data (privacy)
- [ ] No SVG upload (XSS risk)

### Performance

#### Build Time Impact

**Current State**:
- Build time: ~10-15 seconds
- Image processing: None

**Projected Impact**:
- Image processing: +5-10 seconds per build
- Total: ~20-25 seconds per build
- Per-image processing: ~500ms (4 variants × 3 formats)

**Mitigation Strategies**:
1. **Incremental Processing**: Only process changed images
   ```typescript
   // Check if source image modified since last build
   const sourceModified = fs.statSync(sourcePath).mtime;
   const variantsModified = fs.statSync(variantPath).mtime;

   if (sourceModified < variantsModified) {
     // Skip processing, use cached variants
     return cachedVariants;
   }
   ```

2. **Parallel Processing**: Use worker threads for image processing
   ```typescript
   import { Worker } from 'worker_threads';

   const workers = Array.from({ length: os.cpus().length }, () =>
     new Worker('./image-worker.js')
   );
   ```

3. **Lazy Variant Generation**: Generate only needed variants
   ```typescript
   // Only generate variants actually used in content
   const usedVariants = new Set(['hero', 'card']);
   ```

#### Runtime Performance

**Expected Improvements**:
- File size reduction: 60-80% (AVIF/WebP vs JPG)
- Faster page loads: 30-50% improvement
- Reduced bandwidth: Significant savings

**Example File Sizes**:
| Original | JPG (optimized) | WebP | AVIF |
|----------|----------------|------|------|
| 3.3MB | 150KB | 80KB | 60KB |
| 457KB | 80KB | 45KB | 35KB |
| 266KB | 60KB | 35KB | 25KB |

### Accessibility

- [ ] Require alt text for all images
- [ ] Validate alt text length (max 125 chars)
- [ ] Provide alt text guidance in admin UI
- [ ] Use semantic `<picture>` element
- [ ] Maintain aspect ratio (no layout shift)
- [ ] Support prefers-reduced-data media query

```astro
<picture>
  <!-- Only serve optimized images to users who haven't opted for reduced data -->
  <source
    media="(prefers-reduced-data: no-preference)"
    type="image/avif"
    srcset={avifSrc}
  />
  <!-- Fallback to smaller JPG for reduced data preference -->
  <img src={smallJpgSrc} alt={alt} />
</picture>
```

### Backwards Compatibility

**Migration Strategy**:

1. **Dual Schema Support**: Support both old and new formats during transition
   ```typescript
   // Handle both string and object image formats
   const imageData = typeof article.data.image === 'string'
     ? { src: article.data.image, alt: article.data.title, focusPoint: { x: 50, y: 50 } }
     : article.data.image;
   ```

2. **Graceful Fallback**: If variants not generated, fall back to original
   ```typescript
   const imageSrc = variants?.hero?.webp?.src || article.data.image.src;
   ```

3. **Opt-in Migration**: Allow gradual migration of existing articles
   - Old articles continue working with original images
   - New articles use enhanced image handling
   - Editors can update old articles when editing

## Alternative Approaches Considered

**Rejected Options:**
- **Client-Side Image Cropping**: Large files still served to users, no bandwidth savings, poor mobile performance
- **Image CDN Service** (Cloudinary, imgix): Monthly costs ($25-100+), violates zero-cost architecture
- **Pre-commit Hook Processing**: Doesn't work with Decap CMS web interface, requires local tooling

**Deferred Options:**
- **CDN Service**: Revisit only if build-time processing becomes a significant bottleneck (>60s builds)
- **Simplified Focus Point Only**: Fallback if full solution with custom crops proves too complex during implementation

## Migration Path for Existing Content

### Current Article Count
Based on codebase analysis: ~6 articles with images

### Migration Steps

1. **Backup**: Create backup of `/src/content/articles/` and `/public/images/`
2. **Run Migration Script**: Convert frontmatter to new format
3. **Generate Variants**: Run build to create optimized variants
4. **Verify**: Check all articles display correctly
5. **Commit**: Commit migrated content and generated variants

### Migration Script

```typescript
// scripts/migrate-article-images.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDir = './src/content/articles';
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));

console.log(`Migrating ${files.length} articles...`);

files.forEach(file => {
  const filePath = path.join(articlesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: markdown } = matter(content);

  // Only migrate if image is simple string
  if (data.image && typeof data.image === 'string') {
    const originalImage = data.image;

    data.image = {
      src: originalImage,
      alt: `${data.title} - featured image`, // Generate from title
      focusPoint: { x: 50, y: 50 }, // Default to center
    };

    const newContent = matter.stringify(markdown, data);
    fs.writeFileSync(filePath, newContent);

    console.log(`✓ Migrated: ${file}`);
  } else {
    console.log(`- Skipped: ${file} (already migrated or no image)`);
  }
});

console.log('Migration complete!');
```

**Run Migration**:
```bash
npm run migrate:images
```

### Rollback Plan

If issues occur:

1. **Revert Schema Changes**: Restore old schema in `src/content/config.ts`
2. **Restore Frontmatter**: Restore from Git backup
3. **Remove Widget**: Remove custom widget from Decap CMS config
4. **Rebuild**: Clear cache and rebuild site

## User Experience Flow

### Content Editor Journey

#### Step 1: View Requirements (Before Upload)
1. Editor clicks "Hlavní obrázek" in article editor
2. Custom widget displays upload requirements:
   - Formát: JPG, PNG nebo WebP
   - Minimální velikost: 800×450 px
   - Maximální velikost souboru: 10 MB
   - Tip: Pro nejlepší výsledek použijte obrázek 1200×675 px

#### Step 2: Upload Image
1. Editor clicks upload button
2. Selects image from computer
3. Widget validates file (type, size, dimensions)
4. If validation fails, shows actionable Czech error message
5. If successful, shows "Obrázek byl úspěšně nahrán!"

#### Step 3: Add Alt Text (Required)
1. Editor fills in alt text field
2. Character counter shows progress (0 / 125)
3. Hint: "Popište, co je na obrázku vidět"
4. Counter turns orange at 112 chars, red at 125 chars

#### Step 4: Set Focus Point (Visual Click)
1. Image displays with clickable preview
2. Hint: "Klikněte na nejdůležitější část obrázku"
3. Editor clicks on the important area (e.g., person's face, logo)
4. Animated crosshair appears at clicked location
5. Status shows: "✓ Bod zaměření nastaven: 65%, 40%"
6. **No manual percentage input needed!**

#### Step 5: Advanced Options (Optional)
1. Editor can click "▶ Zobrazit pokročilé možnosti"
2. Advanced mode reveals:
   - Variant selector (Hlavní banner, Karta článku, Miniatura, Detail)
   - Manual crop adjustment with Cropper.js
   - Only for power users who need precise control
3. Most editors will skip this step

#### Step 6: Save
1. Editor clicks Save (in Decap CMS)
2. Widget saves all data to frontmatter:
   - Image source path
   - Focus point (x, y) from visual click
   - Custom crops (if manually adjusted)
   - Alt text
3. On next build, optimized variants are auto-generated

### Example Admin UI Mock (Czech Simplified Interface)

```
┌──────────────────────────────────────────────────────────────┐
│ HLAVNÍ OBRÁZEK                                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Požadavky na obrázek:                                       │
│  ✓ Formát: JPG, PNG nebo WebP                               │
│  ✓ Minimální velikost: 800×450 px                           │
│  ✓ Maximální velikost souboru: 10 MB                        │
│  💡 Tip: Pro nejlepší výsledek použijte obrázek 1200×675 px │
│                                                              │
│  NAHRÁT OBRÁZEK                                              │
│  [Vybrat soubor]  halloween.jpg (456 KB)                    │
│  Podporované formáty: JPEG, PNG, WebP (max 10 MB)          │
│                                                              │
│  ✓ Obrázek byl úspěšně nahrán!                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ALTERNATIVNÍ TEXT *                                         │
│  [Studenti v halloweenských kostýmech při školní akci      ]│
│  Popište, co je na obrázku vidět              56 / 125      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  BOD ZAMĚŘENÍ                                                │
│  Klikněte na nejdůležitější část obrázku                    │
│  (např. obličej osoby, logo, hlavní objekt)                 │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │                                                    │     │
│  │         [Obrázek s kostýmy]                        │     │
│  │                                                    │     │
│  │                    ⊕  ← Animovaný crosshair        │     │
│  │                                                    │     │
│  │         (Kliknutelný náhled obrázku)               │     │
│  │                                                    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ✓ Bod zaměření nastaven: 65%, 40%                          │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              [▶ Zobrazit pokročilé možnosti]                 │
│                                                              │
│  <!-- Collapsed by default - simple mode! -->               │
│  <!-- Advanced users can expand for manual crop control --> │
│                                                              │
└──────────────────────────────────────────────────────────────┘

SIMPLE WORKFLOW:
1. Nahrát obrázek
2. Vyplnit alternativní text
3. Kliknout na důležitou část obrázku
4. Uložit
✓ Hotovo!
```

## Success Metrics

### Performance Metrics

- [ ] **Lighthouse Performance Score**: > 90 (currently ~75-80)
- [ ] **Largest Contentful Paint (LCP)**: < 2.5s (currently ~4-5s)
- [ ] **Total Image Weight**: Reduced by > 60%
- [ ] **Page Load Time**: Improved by > 30%
- [ ] **Build Time**: Increased by < 30s

### Quality Metrics

- [ ] **Image Display Quality**: 100% of images look good in all contexts
- [ ] **Accessibility**: 100% of images have alt text
- [ ] **Format Support**: AVIF/WebP served to 90%+ of users
- [ ] **Editor Satisfaction**: Positive feedback from content editors

### Technical Metrics

- [ ] **Test Coverage**: > 80% for image processing utilities
- [ ] **TypeScript Errors**: 0
- [ ] **Build Failures**: 0
- [ ] **Broken Image Links**: 0

## Documentation Requirements

### For Developers

- [ ] Update `TECH_STACK.md` with image processing information
- [ ] Document image utility functions (JSDoc)
- [ ] Add architecture diagram to this RFC
- [ ] Create troubleshooting guide

### For Content Editors

- [ ] Create `NAVOD_PRO_OBRAZKY.md` (Image Upload Guide)
  - How to upload images
  - How to set focus points
  - How to preview variants
  - Best practices for images
  - Common issues and solutions

### For Designers

- [ ] Update `DESIGN_SYSTEM.md` with image specifications
- [ ] Document required aspect ratios
- [ ] Provide image preparation guidelines

## Technical Decisions (Resolved)

1. **Storage**: `/.astro/` (build artifacts, gitignored) - prevents Git bloat
2. **Cache Strategy**: Check file modification times, skip unchanged - improves build performance
3. **Fallback Images**: Keep current gradient background - maintains design consistency
4. **Image Naming**: `halloween/hero.webp` structure - better organization, clearer paths
5. **EXIF Data**: Strip all EXIF metadata - prevents privacy leaks (GPS, camera info)

## Next Steps

**Status**: ✅ APPROVED by Product Owner - Begin Implementation

**Implementation Timeline**:
1. **Phase 1** (Week 1): Foundation - image processing infrastructure
2. **Proof of Concept**: Test with 1-2 sample images, validate approach
3. **Phases 2-5** (Weeks 2-4): Full implementation per plan above
4. **Documentation**: Create Czech user guide (`NAVOD_PRO_OBRAZKY.md`)

## References

### Technical Documentation
- [Astro Image Optimization](https://docs.astro.build/en/guides/images/)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [Decap CMS Custom Widgets](https://decapcms.org/docs/custom-widgets/)
- [Cropper.js Documentation](https://github.com/fengyuanchen/cropperjs)

### Best Practices
- [Google Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [MDN Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [WebP Image Format](https://developers.google.com/speed/webp)
- [AVIF Image Format](https://jakearchibald.com/2020/avif-has-landed/)

### Project Documentation
- [Design System](./DESIGN_SYSTEM.md)
- [Tech Stack](./TECH_STACK.md)
- [Workflow](./WORKFLOW.md)
- [Complete Personas](./PERSONAS.md)

---

**Review Status**: ✅ **APPROVED** - Ready for Implementation

**Completed Reviews**:
- ✅ **Product Owner (Radek)** (2025-12-20): **APPROVED**
  - Approved for implementation
  - Proceed with Phase 1: Foundation
- ✅ **Staff Engineer** (2025-12-20): Approved
  - Updated to use `astro:assets` (removed deprecated `@astrojs/image`)
  - Resolved all technical decisions
  - Integrated UX checklist into Phase 4 implementation
  - Streamlined document structure
- ✅ **UX Designer** (2025-12-20): Approved
  - Added comprehensive Admin UI design specifications
  - Design system integration requirements defined
  - Accessibility requirements documented (ARIA, keyboard nav)
  - Created Admin UI Implementation Checklist
- ✅ **Content Editor/Teacher** (2025-12-20): Approved (all required changes implemented)
  - Visual click-based focus point selection
  - Full Czech localization
  - Pre-upload requirements display
  - Simplified workflow with optional advanced mode
  - Actionable error messages

**Last Updated**: 2025-12-20
