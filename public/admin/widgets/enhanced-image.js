// Enhanced Image Widget with Focus Point and Cropping
// Supports structured metadata for build-time image processing
// Uses modern React component (Decap CMS 3.x compatible)

(function() {
  'use strict';

  const { h, Component } = window.preactRuntimeExports || window;

  // Image variant specifications (must match design doc)
  // Prefixed with _ to indicate it's reserved for future crop editor implementation
  const _IMAGE_VARIANTS = {
    hero: { width: 1920, height: 1080, ratio: '16:9', label: 'Hero (1920×1080)' },
    card: { width: 800, height: 450, ratio: '16:9', label: 'Karta (800×450)' },
    thumbnail: { width: 400, height: 225, ratio: '16:9', label: 'Náhled (400×225)' },
    detail: { width: 1200, height: 800, ratio: '3:2', label: 'Detail (1200×800)' }
  };

  const MAX_ALT_LENGTH = 125;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  class EnhancedImageControl extends Component {
    constructor(props) {
      super(props);
      const value = props.value || {};
      this.state = {
        src: value.src || null,
        alt: value.alt || '',
        focusPoint: value.focusPoint || { x: 50, y: 50 },
        crops: value.crops || {},
        error: null,
        isDragging: false,
        showCropEditor: false
      };

      this.fileInputRef = null;
      this.handleFileSelect = this.handleFileSelect.bind(this);
      this.handleAltChange = this.handleAltChange.bind(this);
      this.handleFocusPointChange = this.handleFocusPointChange.bind(this);
      this.handleRemove = this.handleRemove.bind(this);
    }

    // File validation
    validateFile(file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return 'Podporované formáty: JPG, PNG, WebP';
      }
      if (file.size > MAX_FILE_SIZE) {
        return 'Maximální velikost souboru je 5 MB';
      }
      return null;
    }

    // Handle file upload
    async handleFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;

      const validationError = this.validateFile(file);
      if (validationError) {
        this.setState({ error: validationError });
        return;
      }

      try {
        // Get media library instance
        const mediaLibrary = this.props.mediaPaths?.get(this.props.field.get('name'));

        // Upload via CMS media library
        const mediaFile = await this.props.onOpenMediaLibrary({
          controlMedia: mediaLibrary,
          forImage: true
        });

        this.setState({
          src: mediaFile.path,
          error: null
        });

        this.emitChange();

      } catch (error) {
        console.error('Image upload error:', error);
        this.setState({ error: 'Nahrávání se nezdařilo: ' + error.message });
      }
    }

    // Handle alt text change
    handleAltChange(e) {
      const alt = e.target.value.slice(0, MAX_ALT_LENGTH);
      this.setState({ alt });
      this.emitChange();
    }

    // Handle focus point change
    handleFocusPointChange(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

      this.setState({
        focusPoint: {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y))
        }
      });

      this.emitChange();
    }

    // Handle image removal
    handleRemove() {
      this.setState({
        src: null,
        alt: '',
        focusPoint: { x: 50, y: 50 },
        crops: {}
      });
      this.props.onChange(null);
    }

    // Emit structured data
    emitChange() {
      const { src, alt, focusPoint, crops } = this.state;

      if (!src) {
        this.props.onChange(null);
        return;
      }

      this.props.onChange({
        src,
        alt,
        focusPoint,
        crops
      });
    }

    render() {
      const { src, alt, focusPoint, error, isDragging } = this.state;

      return h(
        'div',
        { className: 'enhanced-image-widget', style: styles.container },

        // Error message
        error && h(
          'div',
          { style: styles.error },
          error
        ),

        // File upload area
        !src && h(
          'div',
          {
            style: isDragging ? styles.dropzoneActive : styles.dropzone,
            onClick: () => this.fileInputRef && this.fileInputRef.click()
          },
          h('p', {}, '📁 Klikněte nebo přetáhněte obrázek'),
          h('p', { style: styles.hint }, 'JPG, PNG, WebP • Max 5 MB'),
          h('input', {
            ref: ref => this.fileInputRef = ref,
            type: 'file',
            accept: 'image/jpeg,image/png,image/webp',
            style: { display: 'none' },
            onChange: this.handleFileSelect
          })
        ),

        // Image preview and controls
        src && h(
          'div',
          { style: styles.preview },

          // Image with focus point overlay
          h(
            'div',
            {
              style: styles.imageContainer,
              onClick: this.handleFocusPointChange
            },
            h('img', { src, alt, style: styles.image }),
            h('div', {
              style: {
                ...styles.focusPoint,
                left: focusPoint.x + '%',
                top: focusPoint.y + '%'
              }
            })
          ),

          // Alt text input
          h(
            'div',
            { style: styles.field },
            h('label', { style: styles.label }, 'Alternativní text (povinný)'),
            h('input', {
              type: 'text',
              value: alt,
              maxLength: MAX_ALT_LENGTH,
              placeholder: 'Popis obrázku pro nevidomé uživatele',
              style: styles.input,
              onChange: this.handleAltChange
            }),
            h(
              'span',
              { style: styles.hint },
              `${alt.length}/${MAX_ALT_LENGTH} znaků`
            )
          ),

          // Focus point info
          h(
            'div',
            { style: styles.info },
            h('strong', {}, 'Ohnisko: '),
            `${focusPoint.x}%, ${focusPoint.y}% • Klikněte na obrázek pro změnu`
          ),

          // Remove button
          h(
            'button',
            {
              type: 'button',
              style: styles.removeButton,
              onClick: this.handleRemove
            },
            '🗑️ Odstranit obrázek'
          )
        )
      );
    }
  }

  class EnhancedImagePreview extends Component {
    render() {
      const value = this.props.value || {};

      if (!value.src) {
        return h('div', {}, 'Žádný obrázek');
      }

      return h(
        'div',
        {},
        h('img', {
          src: value.src,
          alt: value.alt,
          style: { maxWidth: '300px', display: 'block', marginBottom: '8px' }
        }),
        value.alt && h('p', {}, value.alt)
      );
    }
  }

  // Basic styles (can be enhanced)
  const styles = {
    container: {
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '16px',
      marginBottom: '16px'
    },
    dropzone: {
      border: '2px dashed #ccc',
      borderRadius: '8px',
      padding: '40px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    dropzoneActive: {
      border: '2px dashed #3b5f78',
      backgroundColor: '#f0f7ff'
    },
    preview: {
      marginTop: '16px'
    },
    imageContainer: {
      position: 'relative',
      cursor: 'crosshair',
      marginBottom: '16px'
    },
    image: {
      maxWidth: '100%',
      display: 'block',
      borderRadius: '4px'
    },
    focusPoint: {
      position: 'absolute',
      width: '20px',
      height: '20px',
      marginLeft: '-10px',
      marginTop: '-10px',
      borderRadius: '50%',
      border: '3px solid #ff6b6b',
      backgroundColor: 'rgba(255, 107, 107, 0.3)',
      pointerEvents: 'none'
    },
    field: {
      marginBottom: '12px'
    },
    label: {
      display: 'block',
      marginBottom: '4px',
      fontWeight: 500,
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    hint: {
      fontSize: '12px',
      color: '#666',
      marginTop: '4px',
      display: 'block'
    },
    info: {
      padding: '8px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      fontSize: '13px',
      marginBottom: '12px'
    },
    error: {
      padding: '12px',
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '4px',
      color: '#c00',
      marginBottom: '12px'
    },
    removeButton: {
      padding: '8px 16px',
      backgroundColor: '#f44',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  };

  // Register widget with CMS when ready
  window.CMS.registerWidget('enhanced-image', EnhancedImageControl, EnhancedImagePreview);
})();
