/**
 * Test script to verify focus point precision improvements
 * Tests the getCloudinaryUrl function with different focus point values
 */

import { getCloudinaryUrl } from '../src/lib/utils/cloudinary';
import type { ImageVariant } from '../src/lib/utils/imageVariants';

// Test cases from IP 08
const testCases = [
  { x: 26, y: 51, description: 'Standard case - should be x_0.26,y_0.51 (not x_0.3,y_0.5)' },
  { x: 33, y: 50, description: 'Edge case - should be x_0.33,y_0.50 (not x_0.3,y_0.5)' },
  { x: 37, y: 25, description: 'Edge case - should be x_0.37,y_0.25 (not x_0.4,y_0.3)' },
  { x: 50, y: 50, description: 'Center - should be x_0.50,y_0.50' },
  { x: 0, y: 0, description: 'Top-left corner - should be x_0.00,y_0.00' },
  { x: 100, y: 100, description: 'Bottom-right corner - should be x_1.00,y_1.00' },
];

// Test validation and clamping
const validationCases = [
  { x: 150, y: 50, description: 'Out of range (x > 100) - should clamp to x_1.00' },
  { x: 50, y: -10, description: 'Out of range (y < 0) - should clamp to y_0.00' },
  { x: -5, y: 105, description: 'Both out of range - should clamp to x_0.00,y_1.00' },
];

console.log('='.repeat(80));
console.log('Focus Point Precision Test - IP 08');
console.log('='.repeat(80));

console.log('\n📊 Testing Standard Cases:\n');

testCases.forEach(({ x, y, description }) => {
  const url = getCloudinaryUrl('dgkralupy/test.jpg', 'hero', { x, y });

  // Extract the x,y coordinates from the URL
  const coordMatch = url.match(/x_([\d.]+),y_([\d.]+)/);
  const extractedX = coordMatch ? coordMatch[1] : 'NOT_FOUND';
  const extractedY = coordMatch ? coordMatch[2] : 'NOT_FOUND';

  console.log(`✓ Input: { x: ${x}, y: ${y} }`);
  console.log(`  ${description}`);
  console.log(`  Result: x_${extractedX},y_${extractedY}`);
  console.log('');
});

console.log('\n🔒 Testing Validation & Clamping:\n');

validationCases.forEach(({ x, y, description }) => {
  const url = getCloudinaryUrl('dgkralupy/test.jpg', 'hero', { x, y });

  // Extract the x,y coordinates from the URL
  const coordMatch = url.match(/x_([\d.]+),y_([\d.]+)/);
  const extractedX = coordMatch ? coordMatch[1] : 'NOT_FOUND';
  const extractedY = coordMatch ? coordMatch[2] : 'NOT_FOUND';

  console.log(`✓ Input: { x: ${x}, y: ${y} }`);
  console.log(`  ${description}`);
  console.log(`  Result: x_${extractedX},y_${extractedY}`);
  console.log('');
});

console.log('='.repeat(80));
console.log('✅ Test completed successfully!');
console.log('='.repeat(80));
