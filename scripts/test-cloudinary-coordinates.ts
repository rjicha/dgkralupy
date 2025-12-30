/**
 * Cloudinary Coordinate System Verification Test
 *
 * This script verifies that Cloudinary's x and y parameters with xy_center gravity
 * work correctly with our FocusPoint conversion (0-100 → 0.0-1.0).
 */

import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { xyCenter } from '@cloudinary/url-gen/qualifiers/gravity';

const cld = new Cloudinary({
  cloud: { cloudName: 'zzbazza' }
});

console.log('=== Cloudinary Coordinate System Verification ===\n');
console.log('Testing coordinate conversion: FocusPoint (0-100) → Cloudinary (0.0-1.0)\n');

// Test 1: Center point (50%, 50%)
const testUrl1 = cld.image('sample')
  .resize(fill().width(800).height(450).gravity(xyCenter()).x(50 / 100).y(50 / 100))
  .toURL();

console.log('Test 1: Center point (x=50%, y=50%)');
console.log('Input: focusPoint.x = 50, focusPoint.y = 50');
console.log('Conversion: x(50/100) = 0.5, y(50/100) = 0.5');
console.log('URL:', testUrl1);
console.log('Expected: Should contain x_0.5,y_0.5 (NOT x_50,y_50)');
console.log((testUrl1.includes('x_0.5') && testUrl1.includes('y_0.5')) ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 2: Top-right point (75%, 25%)
const testUrl2 = cld.image('sample')
  .resize(fill().width(800).height(450).gravity(xyCenter()).x(75 / 100).y(25 / 100))
  .toURL();

console.log('Test 2: Top-right focus (x=75%, y=25%)');
console.log('Input: focusPoint.x = 75, focusPoint.y = 25');
console.log('Conversion: x(75/100) = 0.75, y(25/100) = 0.25');
console.log('URL:', testUrl2);
console.log('Expected: Should contain x_0.75,y_0.25 (NOT x_75,y_25)');
console.log((testUrl2.includes('x_0.75') && testUrl2.includes('y_0.25')) ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 3: Bottom-left point (25%, 75%)
const testUrl3 = cld.image('sample')
  .resize(fill().width(800).height(450).gravity(xyCenter()).x(25 / 100).y(75 / 100))
  .toURL();

console.log('Test 3: Bottom-left focus (x=25%, y=75%)');
console.log('Input: focusPoint.x = 25, focusPoint.y = 75');
console.log('Conversion: x(25/100) = 0.25, y(75/100) = 0.75');
console.log('URL:', testUrl3);
console.log('Expected: Should contain x_0.25,y_0.75 (NOT x_25,y_75)');
console.log((testUrl3.includes('x_0.25') && testUrl3.includes('y_0.75')) ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test 4: Demonstrate the bug (without conversion)
const buggyUrl = cld.image('sample')
  .resize(fill().width(800).height(450).gravity(xyCenter()).x(50).y(50))
  .toURL();

console.log('Test 4: Without conversion (THE BUG)');
console.log('Input: .x(50).y(50) - passing integers directly');
console.log('URL:', buggyUrl);
console.log('⚠️  Note: x_50,y_50 means 50 PIXELS, not 50%!');
console.log('');

console.log('=== Summary ===');
const allPass = testUrl1.includes('x_0.5') && testUrl1.includes('y_0.5') &&
                testUrl2.includes('x_0.75') && testUrl2.includes('y_0.25') &&
                testUrl3.includes('x_0.25') && testUrl3.includes('y_0.75');

if (allPass) {
  console.log('✅ All tests PASSED - Coordinate conversion is correct!');
  console.log('✅ FocusPoint values (0-100) are properly converted to Cloudinary format (0.0-1.0)');
} else {
  console.log('❌ Tests FAILED - Coordinate conversion needs fixing!');
  console.log('Fix: Divide focusPoint values by 100 before passing to .x() and .y()');
}
console.log('');
console.log('Next: Test with real image on Cloudinary to verify correct cropping behavior.');
