/**
 * Mock for astro:assets module used in tests
 * Provides minimal implementation for getImage function
 */

export interface GetImageOptions {
  src: string;
  width?: number;
  height?: number;
  format?: 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number;
  position?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface GetImageResult {
  src: string;
  options: {
    width?: number;
    height?: number;
    format?: string;
  };
}

/**
 * Mock implementation of getImage
 * Returns a simple object mimicking Astro's response
 */
export async function getImage(
  options: GetImageOptions,
): Promise<GetImageResult> {
  const { src, width, height, format } = options;

  return {
    src: `${src.replace(/\.\w+$/, '')}-${width}x${height}.${format}`,
    options: {
      width,
      height,
      format,
    },
  };
}
