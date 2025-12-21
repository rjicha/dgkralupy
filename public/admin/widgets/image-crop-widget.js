/**
 * Custom Decap CMS Widget: Enhanced Image with Focus Point
 *
 * Provides a user-friendly interface for:
 * - Image upload with validation
 * - Alt text input (accessibility)
 * - Visual focus point selection (click-based)
 * - Czech localization
 *
 * @version 1.0.0
 */

(function() {
  const { h, Component } = window.CMS;

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
  class ImageCropControl extends Component {
    constructor(props) {
      super(props);

      const value = props.value || {};
      this.state = {
        src: value.src || '',
        alt: value.alt || '',
        focusPoint: value.focusPoint || { x: 50, y: 50 },
        isUploading: false,
        uploadError: null,
        showSuccess: false,
        imageDimensions: null
      };

      this.imagePreviewRef = null;
      this.fileInputRef = null;
    }

    componentDidMount() {
      // If we have an existing image, ensure proper data structure
      if (this.state.src && !this.state.alt) {
        // Migration helper: if old string format, convert to object
        this.updateValue();
      }
    }

    updateValue() {
      const { src, alt, focusPoint } = this.state;

      if (!src) {
        // No image, send null/empty
        this.props.onChange(null);
        return;
      }

      this.props.onChange({
        src,
        alt: alt || '',
        focusPoint: focusPoint || { x: 50, y: 50 }
      });
    }

    handleFileSelect = async (e) => {
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
    };

    handleAltChange = (e) => {
      this.setState({ alt: e.target.value }, () => {
        this.updateValue();
      });
    };

    handleFocusPointClick = (e) => {
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
    };

    handleFocusPointKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.setState({
          focusPoint: { x: 50, y: 50 }
        }, () => {
          this.updateValue();
        });
      }
    };

    handleRemoveImage = () => {
      this.setState({
        src: '',
        alt: '',
        focusPoint: { x: 50, y: 50 },
        uploadError: null,
        showSuccess: false,
        imageDimensions: null
      }, () => {
        this.updateValue();
        // Reset file input
        if (this.fileInputRef) {
          this.fileInputRef.value = '';
        }
      });
    };

    render() {
      const { src, alt, focusPoint, isUploading, uploadError, showSuccess, imageDimensions } = this.state;
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
  }

  /**
   * Preview Component
   */
  const ImageCropPreview = ({ value }) => {
    if (!value || !value.src) {
      return h('p', { className: 'preview-empty' }, 'Obrázek nebyl nahrán');
    }

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
      )
    ]);
  };

  // Register the custom widget
  window.CMS.registerWidget('image-crop', ImageCropControl, ImageCropPreview);
})();
