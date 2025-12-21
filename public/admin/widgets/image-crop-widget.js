/**
 * Custom Decap CMS Widget: Enhanced Image with Focus Point
 *
 * Provides a user-friendly interface for:
 * - Image upload with validation
 * - Alt text input (accessibility)
 * - Visual focus point selection (click-based)
 * - Advanced mode with Cropper.js for manual cropping
 * - Czech localization
 *
 * @module widgets/image-crop-widget
 * @version 2.0.0
 */

import { registerWidget } from '../scripts/utils/widget-registration.js';

/**
 * @typedef {Object} FocusPoint
 * @property {number} x - X coordinate (0-100)
 * @property {number} y - Y coordinate (0-100)
 */

/**
 * @typedef {Object} CropData
 * @property {number} x - Crop X position
 * @property {number} y - Crop Y position
 * @property {number} width - Crop width
 * @property {number} height - Crop height
 */

/**
 * @typedef {Object} ImageValue
 * @property {string} src - Image source URL
 * @property {string} alt - Alt text (max 125 chars)
 * @property {FocusPoint} focusPoint - Focus point coordinates
 * @property {Object.<string, CropData>} [crops] - Optional crops per variant
 */

// Register widget using shared utility
await registerWidget('image-crop', async () => {
  // Access React.createElement and createReactClass for components
  const h = React.createElement;
  const createClass = window.createReactClass;

  // Image variant specifications (matching imageVariants.ts)
  const IMAGE_VARIANTS = {
    hero: { width: 1920, height: 1080, aspectRatio: 16/9, label: 'Hlavní banner (16:9)' },
    card: { width: 800, height: 450, aspectRatio: 16/9, label: 'Karta článku (16:9)' },
    thumbnail: { width: 400, height: 225, aspectRatio: 16/9, label: 'Miniatura (16:9)' },
    detail: { width: 1200, height: 800, aspectRatio: 3/2, label: 'Detail článku (3:2)' }
  };

  /**
   * Validate uploaded image file
   * @param {File} file - The uploaded file
   * @returns {Promise<{valid: boolean, error?: string, dimensions?: {width: number, height: number}}>}
   */
  function validateImage(file) {
    return new Promise((resolve) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxFileSize = 10 * 1024 * 1024; // 10MB

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        const fileTypeName = file.type.split('/')[1]?.toUpperCase() || 'neznámý';
        resolve({
          valid: false,
          error: `Nepodporovaný formát souboru (${fileTypeName}). Použijte prosím JPG, PNG nebo WebP.`
        });
        return;
      }

      // Check file size
      if (file.size > maxFileSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        resolve({
          valid: false,
          error: `Soubor je příliš velký (${sizeMB} MB). Maximální velikost je 10 MB. Zkomprimujte prosím obrázek.`
        });
        return;
      }

      // Check dimensions
      const img = new Image();
      img.onload = () => {
        if (img.width < 800 || img.height < 450) {
          resolve({
            valid: false,
            error: `Obrázek je příliš malý (${img.width}×${img.height} px). Minimální velikost je 800×450 px.`
          });
          return;
        }
        if (img.width > 4000 || img.height > 4000) {
          resolve({
            valid: false,
            error: `Obrázek je příliš velký (${img.width}×${img.height} px). Maximální rozměry jsou 4000×4000 px.`
          });
          return;
        }
        resolve({ valid: true, dimensions: { width: img.width, height: img.height } });
      };
      img.onerror = () => {
        resolve({ valid: false, error: 'Neplatný soubor obrázku.' });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Enhanced Image Control Component
   */
  const ImageCropControl = createClass({
    getInitialState: function() {
      const value = this.props.value || {};
      return {
        src: value.src || '',
        alt: value.alt || '',
        focusPoint: value.focusPoint || { x: 50, y: 50 },
        crops: value.crops || {},
        isUploading: false,
        uploadError: null,
        showSuccess: false,
        imageDimensions: null,
        showAdvanced: false,
        previewVariant: 'hero'
      };
    },

    componentDidMount: function() {
      // If we have an existing image, ensure proper data structure
      if (this.state.src && !this.state.alt) {
        // Migration helper: if old string format, convert to object
        this.updateValue();
      }
    },

    componentDidUpdate: function(_prevProps, prevState) {
      // Initialize/reinitialize Cropper.js when entering advanced mode or changing variant
      if (this.state.showAdvanced && this.state.src && this.cropperImageRef) {
        if (!this.cropperRef || 
            prevState.previewVariant !== this.state.previewVariant ||
            prevState.showAdvanced !== this.state.showAdvanced) {
          this.initializeCropper();
        }
      } else if (!this.state.showAdvanced && this.cropperRef) {
        // Destroy cropper when leaving advanced mode
        this.destroyCropper();
      }
    },

    componentWillUnmount: function() {
      this.destroyCropper();
    },

    initializeCropper: function() {
      // Destroy existing cropper if any
      this.destroyCropper();

      // Check if Cropper is available
      if (!window.Cropper) {
        console.warn('Cropper.js not loaded yet, will retry...');
        setTimeout(() => this.initializeCropper(), 100);
        return;
      }

      const { previewVariant, crops, src } = this.state;
      const variantSpec = IMAGE_VARIANTS[previewVariant];

      if (!this.cropperImageRef || !src) return;

      // Initialize Cropper.js
      this.cropperRef = new window.Cropper(this.cropperImageRef, {
        aspectRatio: variantSpec.aspectRatio,
        viewMode: 1,
        autoCropArea: 1,
        responsive: true,
        restore: false,
        guides: true,
        center: true,
        highlight: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        data: crops[previewVariant], // Restore saved crop if exists
        crop: (event) => {
          // Save crop data for this variant
          const cropData = {
            x: Math.round(event.detail.x),
            y: Math.round(event.detail.y),
            width: Math.round(event.detail.width),
            height: Math.round(event.detail.height)
          };

          this.setState({
            crops: {
              ...this.state.crops,
              [previewVariant]: cropData
            }
          }, () => {
            // Update parent with new crop data
            this.updateValue();
          });
        }
      });
    },

    destroyCropper: function() {
      if (this.cropperRef) {
        this.cropperRef.destroy();
        this.cropperRef = null;
      }
    },

    updateValue: function() {
      const { src, alt, focusPoint, crops } = this.state;

      if (!src) {
        // No image, send null/empty
        this.props.onChange(null);
        return;
      }

      const value = {
        src,
        alt: alt || '',
        focusPoint: focusPoint || { x: 50, y: 50 }
      };

      // Only include crops if they exist
      if (crops && Object.keys(crops).length > 0) {
        value.crops = crops;
      }

      this.props.onChange(value);
    },

    handleFileSelect: async function(e) {
      const file = e.target.files?.[0];
      if (!file) return;

      this.setState({ isUploading: true, uploadError: null });

      // Validate image
      const validation = await validateImage(file);

      if (!validation.valid) {
        this.setState({
          isUploading: false,
          uploadError: validation.error
        });
        return;
      }

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = () => {
        this.setState({
          src: reader.result,
          isUploading: false,
          showSuccess: true,
          imageDimensions: validation.dimensions
        }, () => {
          this.updateValue();
          // Hide success message after 3 seconds
          setTimeout(() => {
            this.setState({ showSuccess: false });
          }, 3000);
        });
      };
      reader.onerror = () => {
        this.setState({
          isUploading: false,
          uploadError: 'Chyba při načítání souboru'
        });
      };
      reader.readAsDataURL(file);
    },

    handleAltChange: function(e) {
      this.setState({ alt: e.target.value }, () => {
        this.updateValue();
      });
    },

    handleFocusPointClick: function(e) {
      if (!this.imagePreviewRef) return;

      const rect = this.imagePreviewRef.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      this.setState({
        focusPoint: {
          x: Math.round(Math.max(0, Math.min(100, x))),
          y: Math.round(Math.max(0, Math.min(100, y)))
        }
      }, () => {
        this.updateValue();
      });
    },

    handleFocusPointKeyDown: function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.setState({
          focusPoint: { x: 50, y: 50 }
        }, () => {
          this.updateValue();
        });
      }
    },

    handleRemoveImage: function() {
      this.destroyCropper(); // Clean up cropper before removing image
      this.setState({
        src: '',
        alt: '',
        focusPoint: { x: 50, y: 50 },
        crops: {},
        uploadError: null,
        showSuccess: false,
        imageDimensions: null,
        showAdvanced: false
      }, () => {
        this.updateValue();
        // Reset file input
        if (this.fileInputRef) {
          this.fileInputRef.value = '';
        }
      });
    },

    handleToggleAdvanced: function() {
      this.setState({ showAdvanced: !this.state.showAdvanced });
    },

    handleVariantChange: function(e) {
      this.setState({ previewVariant: e.target.value });
    },

    handleResetCrop: function() {
      const { previewVariant, crops } = this.state;
      
      // Remove crop for current variant
      const newCrops = { ...crops };
      delete newCrops[previewVariant];
      
      this.setState({ crops: newCrops }, () => {
        this.updateValue();
        // Reinitialize cropper to reset
        if (this.cropperRef) {
          this.initializeCropper();
        }
      });
    },

    render: function() {
      const { src, alt, focusPoint, isUploading, uploadError, showSuccess, imageDimensions, showAdvanced, previewVariant, crops } = this.state;
      const { forID } = this.props;

      return h('div', { className: 'image-crop-widget' }, [
        // Upload requirements (shown before upload)
        !src && h('div', { className: 'upload-requirements', key: 'requirements' }, [
          h('p', { className: 'requirements-title' }, 'Požadavky na obrázek:'),
          h('ul', { className: 'requirements-list' }, [
            h('li', { key: 'format' }, '✓ Formát: JPG, PNG nebo WebP'),
            h('li', { key: 'minsize' }, '✓ Minimální velikost: 800×450 px'),
            h('li', { key: 'maxsize' }, '✓ Maximální velikost souboru: 10 MB')
          ]),
          h('p', { className: 'hint' }, '💡 Tip: Pro nejlepší výsledek použijte obrázek 1200×675 px')
        ]),

        // Image upload section
        h('div', { className: 'upload-section', key: 'upload' }, [
          h('label', { htmlFor: `${forID}-upload`, className: 'upload-label' }, 'Nahrát obrázek'),
          h('input', {
            id: `${forID}-upload`,
            ref: (el) => { this.fileInputRef = el; },
            type: 'file',
            accept: 'image/jpeg,image/png,image/webp',
            onChange: this.handleFileSelect,
            disabled: isUploading,
            className: 'upload-input',
            'aria-describedby': `${forID}-upload-hint`
          }),
          h('p', {
            id: `${forID}-upload-hint`,
            className: 'hint'
          }, 'Podporované formáty: JPEG, PNG, WebP (max 10 MB)')
        ]),

        // Upload error
        uploadError && h('div', {
          className: 'error-message',
          role: 'alert',
          key: 'error'
        }, [
          h('svg', {
            className: 'error-icon',
            width: '20',
            height: '20',
            viewBox: '0 0 20 20',
            'aria-hidden': 'true'
          }, [
            h('path', {
              fill: 'currentColor',
              d: 'M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z'
            })
          ]),
          h('span', {}, uploadError)
        ]),

        // Loading spinner
        isUploading && h('div', { className: 'loading-overlay', key: 'loading' }, [
          h('div', {
            className: 'spinner',
            role: 'status',
            'aria-live': 'polite'
          }, [
            h('span', { className: 'sr-only' }, 'Nahrávání obrázku...')
          ]),
          h('p', {}, 'Nahrávání obrázku...')
        ]),

        // Success message
        showSuccess && h('div', {
          className: 'success-message',
          role: 'status',
          'aria-live': 'polite',
          key: 'success'
        }, [
          h('svg', {
            className: 'success-icon',
            width: '20',
            height: '20',
            viewBox: '0 0 20 20',
            'aria-hidden': 'true'
          }, [
            h('path', {
              fill: 'currentColor',
              d: 'M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z'
            })
          ]),
          h('span', {}, 'Obrázek byl úspěšně nahrán!')
        ]),

        // Alt text input (shown after upload)
        src && h('div', { className: 'alt-section', key: 'alt' }, [
          h('label', {
            htmlFor: `${forID}-alt`,
            className: 'alt-label'
          }, [
            'Alternativní text ',
            h('span', {
              className: 'required',
              'aria-label': 'povinné'
            }, '*')
          ]),
          h('input', {
            id: `${forID}-alt`,
            type: 'text',
            value: alt,
            onChange: this.handleAltChange,
            placeholder: 'Popište obrázek pro nevidomé uživatele',
            'aria-required': 'true',
            maxLength: 125,
            className: 'alt-input'
          }),
          h('div', { className: 'input-footer' }, [
            h('p', { className: 'hint' }, 'Popište, co je na obrázku vidět'),
            h('p', { className: 'char-counter' }, `${alt.length} / 125`)
          ])
        ]),

        // Focus point section (shown after upload)
        src && h('div', { className: 'focus-point-section', key: 'focus' }, [
          h('label', { className: 'focus-label' }, 'Bod zaměření'),
          h('p', { className: 'hint' },
            'Klikněte na nejdůležitější část obrázku (např. obličej osoby, logo, hlavní objekt)'
          ),
          h('div', {
            className: 'focus-point-preview',
            onClick: this.handleFocusPointClick,
            onKeyDown: this.handleFocusPointKeyDown,
            role: 'button',
            tabIndex: 0,
            'aria-label': 'Klikněte pro nastavení bodu zaměření'
          }, [
            h('img', {
              ref: (el) => { this.imagePreviewRef = el; },
              src: src,
              alt: 'Náhled pro výběr bodu zaměření',
              className: 'focus-preview-image'
            }),
            // Visual focus point marker (crosshair)
            h('div', {
              className: 'focus-point-marker',
              style: {
                left: `${focusPoint.x}%`,
                top: `${focusPoint.y}%`
              },
              'aria-hidden': 'true'
            }, [
              h('div', { className: 'focus-crosshair' })
            ])
          ]),
          h('p', {
            className: 'focus-point-status',
            'aria-live': 'polite'
          }, `✓ Bod zaměření nastaven: ${focusPoint.x}%, ${focusPoint.y}%`),
          imageDimensions && h('p', { className: 'image-info' },
            `Rozměry: ${imageDimensions.width}×${imageDimensions.height} px`
          )
        ]),

        // Advanced mode toggle (shown after upload)
        src && h('div', { className: 'advanced-toggle-section', key: 'advanced-toggle' }, [
          h('button', {
            type: 'button',
            className: 'btn-advanced-toggle',
            onClick: this.handleToggleAdvanced,
            'aria-expanded': showAdvanced
          }, showAdvanced ? '▼ Skrýt pokročilé možnosti' : '▶ Zobrazit pokročilé možnosti'),
          h('p', { className: 'hint', style: { marginTop: '8px' } },
            'Pokročilé možnosti umožňují přesně nastavit ořez obrázku pro různé části webu.'
          )
        ]),

        // Advanced options (collapsible, shown when enabled)
        src && showAdvanced && h('div', { className: 'advanced-options', key: 'advanced' }, [
          // Variant selector
          h('div', { className: 'variant-selector' }, [
            h('label', { htmlFor: `${forID}-variant` }, 'Náhled varianty'),
            h('select', {
              id: `${forID}-variant`,
              value: previewVariant,
              onChange: this.handleVariantChange,
              className: 'variant-select'
            }, Object.entries(IMAGE_VARIANTS).map(([key, spec]) =>
              h('option', { value: key, key: key }, spec.label)
            )),
            h('p', { className: 'hint', style: { marginTop: '8px' } },
              'Vyberte variantu pro úpravu ořezu. Každá varianta má jiný poměr stran.'
            )
          ]),

          // Cropper container
          h('div', { className: 'cropper-container', style: { marginTop: '16px' } }, [
            h('label', {}, 'Ruční úprava ořezu (volitelné)'),
            h('p', { className: 'hint' },
              'Přetáhněte rám nebo jeho rohy pro přesné nastavení ořezu. Klávesy: Šipky = posun, Ctrl+Šipky = změna velikosti'
            ),
            h('div', { className: 'cropper-wrapper', style: { marginTop: '12px', maxHeight: '400px' } }, [
              h('img', {
                ref: (el) => { this.cropperImageRef = el; },
                src: src,
                alt: 'Náhled ořezu',
                style: { maxWidth: '100%', display: 'block' }
              })
            ]),
            // Reset crop button
            crops[previewVariant] && h('button', {
              type: 'button',
              onClick: this.handleResetCrop,
              className: 'btn-reset-crop',
              style: { marginTop: '12px' }
            }, '↺ Obnovit výchozí ořez pro tuto variantu')
          ])
        ]),

        // Remove image button (shown after upload)
        src && h('div', { className: 'remove-section', key: 'remove' }, [
          h('button', {
            type: 'button',
            onClick: this.handleRemoveImage,
            className: 'btn-remove',
            'aria-label': 'Odstranit obrázek'
          }, '🗑️ Odstranit obrázek')
        ])
      ]);
    }
  });

  /**
   * Preview Component
   */
  const ImageCropPreview = ({ value }) => {
    if (!value || !value.src) {
      return h('p', { className: 'preview-empty' }, 'Obrázek nebyl nahrán');
    }

    const hasCrops = value.crops && Object.keys(value.crops).length > 0;

    return h('div', { className: 'image-preview' }, [
      h('img', {
        src: value.src,
        alt: value.alt || 'Náhled',
        style: { maxWidth: '300px', height: 'auto', borderRadius: '4px' }
      }),
      h('p', { style: { marginTop: '8px' } }, [
        h('strong', {}, 'Alt text: '),
        value.alt || h('em', { style: { color: '#999' } }, 'Není zadán')
      ]),
      value.focusPoint && h('p', { style: { marginTop: '4px', fontSize: '0.875rem', color: '#666' } },
        `Bod zaměření: ${value.focusPoint.x}%, ${value.focusPoint.y}%`
      ),
      hasCrops && h('p', { style: { marginTop: '4px', fontSize: '0.875rem', color: '#666' } },
        `Vlastní ořezy: ${Object.keys(value.crops).join(', ')}`
      )
    ]);
  };

  // Return widget components
  return {
    control: ImageCropControl,
    preview: ImageCropPreview
  };
});
