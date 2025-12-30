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
      `x_${(validatedFp.x / 100).toFixed(2)}`,  // Convert 0-100 to 0.00-1.00 (2 decimal precision)
      `y_${(validatedFp.y / 100).toFixed(2)}`   // Convert 0-100 to 0.00-1.00 (2 decimal precision)
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
