import { describe, it, expect } from 'vitest';
import { IMAGE_VARIANTS } from './imageVariants';

describe('Image Variants', () => {
  it('should have all required variants', () => {
    expect(IMAGE_VARIANTS).toHaveProperty('hero');
    expect(IMAGE_VARIANTS).toHaveProperty('card');
    expect(IMAGE_VARIANTS).toHaveProperty('thumbnail');
    expect(IMAGE_VARIANTS).toHaveProperty('detail');
  });

  it('should have valid aspect ratios', () => {
    Object.values(IMAGE_VARIANTS).forEach((variant) => {
      const calculatedAspectRatio = variant.width / variant.height;
      expect(calculatedAspectRatio).toBeCloseTo(variant.aspectRatio, 2);
    });
  });

  it('should have valid quality settings', () => {
    Object.values(IMAGE_VARIANTS).forEach((variant) => {
      // Quality should be between 1-100
      expect(variant.quality.jpg).toBeGreaterThanOrEqual(1);
      expect(variant.quality.jpg).toBeLessThanOrEqual(100);
      expect(variant.quality.webp).toBeGreaterThanOrEqual(1);
      expect(variant.quality.webp).toBeLessThanOrEqual(100);
      expect(variant.quality.avif).toBeGreaterThanOrEqual(1);
      expect(variant.quality.avif).toBeLessThanOrEqual(100);
    });
  });

  it('should have reasonable dimensions', () => {
    Object.values(IMAGE_VARIANTS).forEach((variant) => {
      // Width and height should be positive
      expect(variant.width).toBeGreaterThan(0);
      expect(variant.height).toBeGreaterThan(0);

      // Should be reasonable sizes (not too small, not too large)
      expect(variant.width).toBeGreaterThanOrEqual(400);
      expect(variant.width).toBeLessThanOrEqual(2000);
      expect(variant.height).toBeGreaterThanOrEqual(200);
      expect(variant.height).toBeLessThanOrEqual(2000);
    });
  });

  describe('hero variant', () => {
    it('should have 16:9 aspect ratio', () => {
      expect(IMAGE_VARIANTS.hero.aspectRatio).toBeCloseTo(16 / 9, 2);
    });

    it('should be the largest variant', () => {
      const heroPixels = IMAGE_VARIANTS.hero.width * IMAGE_VARIANTS.hero.height;
      const cardPixels = IMAGE_VARIANTS.card.width * IMAGE_VARIANTS.card.height;
      const thumbnailPixels =
        IMAGE_VARIANTS.thumbnail.width * IMAGE_VARIANTS.thumbnail.height;
      const detailPixels =
        IMAGE_VARIANTS.detail.width * IMAGE_VARIANTS.detail.height;

      expect(heroPixels).toBeGreaterThanOrEqual(cardPixels);
      expect(heroPixels).toBeGreaterThanOrEqual(thumbnailPixels);
      expect(heroPixels).toBeGreaterThanOrEqual(detailPixels);
    });
  });

  describe('thumbnail variant', () => {
    it('should be the smallest variant', () => {
      const heroPixels = IMAGE_VARIANTS.hero.width * IMAGE_VARIANTS.hero.height;
      const cardPixels = IMAGE_VARIANTS.card.width * IMAGE_VARIANTS.card.height;
      const thumbnailPixels =
        IMAGE_VARIANTS.thumbnail.width * IMAGE_VARIANTS.thumbnail.height;
      const detailPixels =
        IMAGE_VARIANTS.detail.width * IMAGE_VARIANTS.detail.height;

      expect(thumbnailPixels).toBeLessThanOrEqual(heroPixels);
      expect(thumbnailPixels).toBeLessThanOrEqual(cardPixels);
      expect(thumbnailPixels).toBeLessThanOrEqual(detailPixels);
    });
  });

  describe('detail variant', () => {
    it('should have 3:2 aspect ratio', () => {
      expect(IMAGE_VARIANTS.detail.aspectRatio).toBeCloseTo(3 / 2, 2);
    });
  });
});
