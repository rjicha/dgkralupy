/**
 * Cloudinary integration utilities
 * Generates optimized image URLs with transformations
 */

import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { xyCenter, autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { IMAGE_VARIANTS, type ImageVariant } from './imageVariants';
import type { FocusPoint } from '../../types/image';

// Initialize Cloudinary instance
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'zzbazza'
  }
});

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

  if (focusPoint) {
    // Use xy_center gravity with custom focus point
    // Note: x and y methods accept percentage values (0-100) which matches our FocusPoint type
    // Cloudinary generates URLs like: c_fill,g_xy_center,w_800,h_450,x_50,y_50
    const img = cld.image(publicId)
      .resize(
        fill()
          .width(specs.width)
          .height(specs.height)
          .gravity(xyCenter())
          .x(focusPoint.x)   // Percentage: 0-100
          .y(focusPoint.y)   // Percentage: 0-100
      )
      .format('auto')  // Automatic format (AVIF, WebP, JPG based on browser)
      .quality('auto'); // Automatic quality optimization

    return img.toURL();
  } else {
    // Use auto gravity when no focus point specified
    const img = cld.image(publicId)
      .resize(
        fill()
          .width(specs.width)
          .height(specs.height)
          .gravity(autoGravity())
      )
      .format('auto')
      .quality('auto');

    return img.toURL();
  }
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
