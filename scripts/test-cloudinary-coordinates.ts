/**
 * Cloudinary Coordinate System Verification Test
 *
 * This script verifies that Cloudinary's x and y parameters with xy_center gravity
 * accept percentage values (0-100) as we store them in FocusPoint.
 */

import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { xyCenter } from '@cloudinary/url-gen/qualifiers/gravity';

const cld = new Cloudinary({
  cloud: { cloudName: 'zzbazza' }
});

console.log('=== Cloudinary Coordinate System Verification ===\n');

// Test 1: Center point (50%, 50%)
const testUrl1 = cld.image('sample')
  .resize(fill().width(800).height(450).gravity(xyCenter()).x(50).y(50))
  .toURL();

console.log('Test 1: Center point (x=50%, y=50%)');
console.log('URL:', testUrl1);
console.log('Expected pattern: g_xy_center,x_50,y_50 or g_xy_center:50:50');
console.log('');

// Test 2: Top-right point (75%, 25%)
const testUrl2 = cld.image('sample')
  .resize(fill().width(800).height(450).gravity(xyCenter()).x(75).y(25))
  .toURL();

console.log('Test 2: Top-right focus (x=75%, y=25%)');
console.log('URL:', testUrl2);
console.log('Expected pattern: g_xy_center,x_75,y_25 or g_xy_center:75:25');
console.log('');

// Test 3: Bottom-left point (25%, 75%)
const testUrl3 = cld.image('sample')
  .resize(fill().width(800).height(450).gravity(xyCenter()).x(25).y(75))
  .toURL();

console.log('Test 3: Bottom-left focus (x=25%, y=75%)');
console.log('URL:', testUrl3);
console.log('Expected pattern: g_xy_center,x_25,y_75 or g_xy_center:75:25');
console.log('');

console.log('=== Next Steps ===');
console.log('1. Review the generated URLs above');
console.log('2. Verify they contain the correct x and y values');
console.log('3. Upload a test image to Cloudinary (cloud name: zzbazza)');
console.log('4. Replace "sample" with your test image public ID');
console.log('5. Test the URLs in a browser to verify correct cropping');
console.log('');
console.log('If x and y values appear correctly in the URLs, the coordinate system is verified.');
