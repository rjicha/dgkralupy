/**
 * Cloudinary Configuration
 * Centralized config for CMS widget integration
 *
 * This file is loaded by index.html and provides Cloudinary settings
 * to the Enhanced Image widget.
 */

window.CLOUDINARY_CONFIG = {
  cloudName: 'zzbazza',
  uploadPreset: 'dgkralupy-stg',
  folder: 'dgkralupy',

  /**
   * Build Cloudinary URL from public_id
   * @param {string} publicId - Cloudinary public_id (e.g., "dgkralupy/image.jpg")
   * @param {Object} options - Optional transformations
   * @returns {string} Full Cloudinary URL
   */
  buildUrl: function(publicId, options) {
    options = options || {};
    var baseUrl = 'https://res.cloudinary.com/' + this.cloudName + '/image/upload/';

    // Add transformations if provided
    var transformations = [];
    if (options.width) transformations.push('w_' + options.width);
    if (options.height) transformations.push('h_' + options.height);
    if (options.crop) transformations.push('c_' + options.crop);
    if (options.quality) transformations.push('q_' + options.quality);
    if (options.format) transformations.push('f_' + options.format);

    var transformPart = transformations.length > 0 ? transformations.join(',') + '/' : '';
    return baseUrl + transformPart + publicId;
  },

  /**
   * Extract public_id from Cloudinary URL
   * @param {string} url - Cloudinary URL or public_id
   * @returns {string} Public ID
   */
  extractPublicId: function(url) {
    // If it's already a public_id (no https://), return as-is
    if (!url.startsWith('http')) {
      return url;
    }

    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/zzbazza/image/upload/v1234567890/dgkralupy/image.jpg
    // Result: dgkralupy/image.jpg
    var match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    return match ? match[1] : url;
  }
};
