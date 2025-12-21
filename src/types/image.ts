/**
 * Type definitions for enhanced image handling
 * Supports both legacy (string) and new (object) image formats
 */

import type { ImageVariant } from '../lib/utils/imageVariants';

/**
 * Focus point coordinates (percentage-based)
 * - x: 0-100 (left to right)
 * - y: 0-100 (top to bottom)
 */
export interface FocusPoint {
  x: number;
  y: number;
}

/**
 * Crop data for image variants
 * Defines the crop rectangle in pixels
 */
export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Enhanced image format with metadata
 * Includes src, alt text, focus point, and optional custom crops
 */
export interface EnhancedImageData {
  src: string;
  alt: string;
  focusPoint?: FocusPoint;
  crops?: Partial<Record<ImageVariant, CropData>>;
}

/**
 * Legacy image format (simple string path)
 * Maintained for backward compatibility
 */
export type LegacyImageData = string;

/**
 * Union type supporting both legacy and enhanced formats
 * Components should handle both cases gracefully
 */
export type ImageData = EnhancedImageData | LegacyImageData;
