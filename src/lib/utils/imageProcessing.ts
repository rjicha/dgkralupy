/**
 * Image processing utilities for generating optimized variants
 * Uses Astro's built-in image optimization (astro:assets)
 */

import { getImage } from 'astro:assets';
import { IMAGE_VARIANTS, type ImageVariant } from './imageVariants';
import type { FocusPoint, CropData, ImageData } from '../../types/image';

export interface GenerateVariantsOptions {
  imageSrc: string;
  focusPoint?: FocusPoint;
  customCrops?: Partial<Record<ImageVariant, CropData>>;
}

export interface GeneratedVariant {
  src: string;
  width: number;
  height: number;
}

export interface GeneratedVariants {
  [variant: string]: {
    webp: GeneratedVariant;
    avif: GeneratedVariant;
    jpg: GeneratedVariant;
  };
}

/**
 * Generate optimized image variants for all formats
 * Returns null if generation fails (graceful degradation)
 *
 * @param options - Image source and optional focus point/crops
 * @returns Generated variants or null on error
 */
export async function generateImageVariants(
  options: GenerateVariantsOptions,
): Promise<GeneratedVariants | null> {
  const { imageSrc, focusPoint, customCrops } = options;
  const variants: GeneratedVariants = {};

  try {
    for (const [variantName, specs] of Object.entries(IMAGE_VARIANTS)) {
      const crop = customCrops?.[variantName as ImageVariant];
      const position = focusPoint
        ? `${focusPoint.x}% ${focusPoint.y}%`
        : 'center';

      // Generate WebP
      const webp = await getImage({
        src: imageSrc,
        width: specs.width,
        height: specs.height,
        format: 'webp',
        quality: specs.quality.webp,
        position,
        fit: 'cover',
      });

      // Generate AVIF
      const avif = await getImage({
        src: imageSrc,
        width: specs.width,
        height: specs.height,
        format: 'avif',
        quality: specs.quality.avif,
        position,
        fit: 'cover',
      });

      // Generate JPG (fallback)
      const jpg = await getImage({
        src: imageSrc,
        width: specs.width,
        height: specs.height,
        format: 'jpg',
        quality: specs.quality.jpg,
        position,
        fit: 'cover',
      });

      variants[variantName] = {
        webp: {
          src: webp.src,
          width: webp.options.width || specs.width,
          height: webp.options.height || specs.height,
        },
        avif: {
          src: avif.src,
          width: avif.options.width || specs.width,
          height: avif.options.height || specs.height,
        },
        jpg: {
          src: jpg.src,
          width: jpg.options.width || specs.width,
          height: jpg.options.height || specs.height,
        },
      };
    }

    return variants;
  } catch (error) {
    console.error('Failed to generate image variants:', error);
    // Graceful degradation: return null and let components use original image
    return null;
  }
}

/**
 * Normalize image data (supports both legacy string and new object format)
 * Provides consistent interface for components
 *
 * @param imageData - Either a string path or an image object
 * @returns Normalized image data with src, alt, and focus point
 */
export function normalizeImageData(imageData: ImageData): {
  src: string;
  alt: string;
  focusPoint?: FocusPoint;
  crops?: Partial<Record<ImageVariant, CropData>>;
} {
  // Legacy format (string)
  if (typeof imageData === 'string') {
    return {
      src: imageData,
      alt: '',
      focusPoint: { x: 50, y: 50 },
    };
  }

  // New format (object)
  return {
    src: imageData.src,
    alt: imageData.alt || '',
    focusPoint: imageData.focusPoint || { x: 50, y: 50 },
    crops: imageData.crops,
  };
}
