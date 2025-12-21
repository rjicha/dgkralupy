import { describe, it, expect } from 'vitest';
import { normalizeImageData } from '../../src/lib/utils/imageProcessing';

describe('ResponsiveImage Component Integration', () => {
  describe('Legacy Format Support', () => {
    it('should normalize legacy string image format', () => {
      const legacyImage = '/images/test.jpg';
      const normalized = normalizeImageData(legacyImage);

      expect(normalized).toEqual({
        src: '/images/test.jpg',
        alt: '',
        focusPoint: { x: 50, y: 50 },
      });
    });

    it('should provide default focus point for legacy images', () => {
      const result = normalizeImageData('/images/halloween.jpg');
      expect(result.focusPoint).toEqual({ x: 50, y: 50 });
    });

    it('should handle legacy images without alt text', () => {
      const result = normalizeImageData('/images/test.jpg');
      expect(result.alt).toBe('');
    });
  });

  describe('Enhanced Format Support', () => {
    it('should normalize enhanced object image format', () => {
      const enhancedImage = {
        src: '/images/test.jpg',
        alt: 'Test image description',
        focusPoint: { x: 60, y: 40 },
      };

      const normalized = normalizeImageData(enhancedImage);

      expect(normalized).toEqual({
        src: '/images/test.jpg',
        alt: 'Test image description',
        focusPoint: { x: 60, y: 40 },
      });
    });

    it('should handle missing optional fields in enhanced format', () => {
      const partialImage = {
        src: '/images/test.jpg',
        alt: 'Test image',
      };

      const normalized = normalizeImageData(partialImage);

      expect(normalized.focusPoint).toEqual({ x: 50, y: 50 });
      expect(normalized.crops).toBeUndefined();
    });

    it('should preserve custom crops when provided', () => {
      const imageWithCrops = {
        src: '/images/test.jpg',
        alt: 'Test image',
        focusPoint: { x: 45, y: 35 },
        crops: {
          hero: { x: 0, y: 0, width: 1920, height: 1080 },
          card: { x: 100, y: 50, width: 800, height: 450 },
        },
      };

      const normalized = normalizeImageData(imageWithCrops);

      expect(normalized.crops).toEqual({
        hero: { x: 0, y: 0, width: 1920, height: 1080 },
        card: { x: 100, y: 50, width: 800, height: 450 },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty alt text', () => {
      const image = {
        src: '/images/test.jpg',
        alt: '',
      };

      const normalized = normalizeImageData(image);
      expect(normalized.alt).toBe('');
    });

    it('should handle focus points at boundaries', () => {
      const image = {
        src: '/images/test.jpg',
        alt: 'Test',
        focusPoint: { x: 0, y: 0 },
      };

      const normalized = normalizeImageData(image);
      expect(normalized.focusPoint).toEqual({ x: 0, y: 0 });
    });

    it('should handle focus points at max boundaries', () => {
      const image = {
        src: '/images/test.jpg',
        alt: 'Test',
        focusPoint: { x: 100, y: 100 },
      };

      const normalized = normalizeImageData(image);
      expect(normalized.focusPoint).toEqual({ x: 100, y: 100 });
    });

    it('should handle objects with only src property', () => {
      const image = {
        src: '/images/test.jpg',
      };

      const normalized = normalizeImageData(image);
      expect(normalized.src).toBe('/images/test.jpg');
      expect(normalized.alt).toBe('');
      expect(normalized.focusPoint).toEqual({ x: 50, y: 50 });
    });
  });

  describe('Backward Compatibility', () => {
    it('should support all existing article images (string format)', () => {
      const existingArticles = [
        '/images/halloween-oslava.jpg',
        '/images/rekonstrukce-knihovny.jpg',
        '/images/vanocni-koncert.jpg',
        '/images/erasmus-nemecko.jpg',
      ];

      existingArticles.forEach((imagePath) => {
        const normalized = normalizeImageData(imagePath);
        expect(normalized.src).toBe(imagePath);
        expect(normalized.focusPoint).toEqual({ x: 50, y: 50 });
      });
    });

    it('should seamlessly migrate from legacy to enhanced format', () => {
      // Start with legacy format
      const legacyImage = '/images/test.jpg';
      const legacyNormalized = normalizeImageData(legacyImage);

      // Migrate to enhanced format
      const enhancedImage = {
        src: legacyImage,
        alt: 'Added alt text',
        focusPoint: { x: 60, y: 40 },
      };
      const enhancedNormalized = normalizeImageData(enhancedImage);

      // Both should have the same src
      expect(legacyNormalized.src).toBe(enhancedNormalized.src);
      // Enhanced should have additional data
      expect(enhancedNormalized.alt).toBe('Added alt text');
      expect(enhancedNormalized.focusPoint).toEqual({ x: 60, y: 40 });
    });
  });

  describe('Type Safety', () => {
    it('should handle objects with minimal properties', () => {
      const minimalImage = { 
        src: '/images/test.jpg',
        alt: 'Test' 
      };
      const normalized = normalizeImageData(minimalImage);
      expect(normalized.src).toBe('/images/test.jpg');
      expect(normalized.alt).toBe('Test');
    });

    it('should handle objects with extra properties', () => {
      const imageWithExtras = {
        src: '/images/test.jpg',
        alt: 'Test',
        focusPoint: { x: 50, y: 50 },
        extraField: 'should be ignored',
      };

      const normalized = normalizeImageData(imageWithExtras);
      expect(normalized.src).toBe('/images/test.jpg');
      // Extra fields are not validated, but don't break the function
    });
  });
});
