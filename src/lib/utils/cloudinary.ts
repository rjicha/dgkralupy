/**
 * Cloudinary integration utilities
 * Generates optimized image URLs with transformations
 */

import { IMAGE_VARIANTS, type ImageVariant } from './imageVariants';
import type { FocusPoint } from '../../types/image';

// Cloud name configuration
const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'zzbazza';

/**
 * Generate Cloudinary URL with transformations
 * @param publicId - Cloudinary public ID (e.g., "dgkralupy/article-image.jpg")
 * @param variant - Image variant (hero, card, thumbnail, detail)
 * @param focusPoint - Optional focus point { x: 0-100, y: 0-100 } (percentage coordinates)
 * @returns Optimized image URL
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
    // Use crop mode with xy_center gravity and custom focus point
    // NOTE: c_crop is required (not c_fill) when using g_xy_center with custom x/y coordinates
    // Convert FocusPoint percentages (0-100) to Cloudinary decimal format (0.0-1.0)
    // Cloudinary interprets: integers as pixels, decimals as percentages
    // Example: x=50 → 50px, x=0.5 → 50%
    transformations.push(
      `c_crop`,  // Crop mode (required for custom xy coordinates)
      `g_xy_center`,
      `h_${specs.height}`,
      `w_${specs.width}`,
      `x_${(focusPoint.x / 100).toFixed(1)}`,  // Convert 0-100 to 0.0-1.0
      `y_${(focusPoint.y / 100).toFixed(1)}`   // Convert 0-100 to 0.0-1.0
    );
  } else {
    // Use fill mode with auto gravity when no focus point specified
    transformations.push(
      `c_fill`,  // Fill mode
      `g_auto`,
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
 * @param url - Cloudinary URL or public ID
 * @returns Public ID
 */
export function extractPublicId(url: string): string {
  // If it's already a public ID (no https://), return as-is
  if (!url.startsWith('http')) {
    return url;
  }

  // Extract public ID from Cloudinary URL
  // Example: https://res.cloudinary.com/zzbazza/image/upload/v1234567890/dgkralupy/image.jpg
  // Result: dgkralupy/image.jpg
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  return match ? match[1] : url;
}
