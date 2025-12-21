/**
 * Image variant specifications for responsive image generation
 * Defines dimensions, aspect ratios, and quality settings for each use case
 */

export interface ImageVariantSpec {
  width: number;
  height: number;
  aspectRatio: number;
  quality: {
    jpg: number;
    webp: number;
    avif: number;
  };
}

/**
 * Predefined image variants for different contexts
 * - hero: Large banner images (homepage, article headers)
 * - card: Article cards in grid layouts
 * - thumbnail: Small previews (related articles, navigation)
 * - detail: Article detail page featured images
 */
export const IMAGE_VARIANTS = {
  hero: {
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
    quality: { jpg: 85, webp: 80, avif: 70 },
  },
  card: {
    width: 800,
    height: 450,
    aspectRatio: 16 / 9,
    quality: { jpg: 85, webp: 80, avif: 70 },
  },
  thumbnail: {
    width: 400,
    height: 225,
    aspectRatio: 16 / 9,
    quality: { jpg: 85, webp: 80, avif: 70 },
  },
  detail: {
    width: 1200,
    height: 800,
    aspectRatio: 3 / 2,
    quality: { jpg: 85, webp: 80, avif: 70 },
  },
} as const;

export type ImageVariant = keyof typeof IMAGE_VARIANTS;
