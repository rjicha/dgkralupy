# Decap CMS Custom Widgets Guide

**Last Updated:** December 22, 2025  
**Status:** Production-ready

## Overview

This guide documents how to work with custom widgets in Decap CMS 3.x. Custom widgets extend the CMS editor with specialized input controls beyond the built-in widgets.

**Current Widgets:**
- **Author Widget** - Auto-detects and maps GitHub users to display names
- **Enhanced Image Widget** - Image upload with alt text and focus point selection

## Core Principles

### 1. Always Use Inline Registration

Register widgets directly in [public/admin/index.html](../public/admin/index.html). Never use external JavaScript files.

**Why:**
- No timing/race conditions with CMS initialization
- Single source of truth
- Easier debugging
- No path resolution issues

### 2. Use `createClass` Syntax (Required)

Decap CMS 3.x uses Preact internally and exposes `createClass` globally. ES6 classes are not compatible.

**Correct:**
```javascript
var MyWidget = createClass({
  getInitialState: function() {
    return { value: '' };
  },
  
  render: function() {
    return h('input', { 
      type: 'text',
      value: this.state.value,
      onChange: this.handleChange
    });
  }
});
```

**Wrong:**
```javascript
class MyWidget extends React.Component {  // ❌ Won't work
  constructor(props) {
    super(props);
  }
}
```

### 3. Use `h()` for Elements

The `h()` function (Preact's `createElement`) is available globally. Never use JSX.

**Syntax:**
```javascript
h(tagName, props, children)
```

**Examples:**
```javascript
// Simple element
h('div', { className: 'container' }, 'Hello')

// Nested elements
h('div', {},
  h('h1', {}, 'Title'),
  h('p', {}, 'Content')
)

// With event handlers
h('button', {
  onClick: this.handleClick,
  style: { padding: '10px' }
}, 'Click me')

// Conditional rendering
error && h('div', { className: 'error' }, error)
```

### 4. Widget Registration Pattern

**Structure:**
```javascript
<script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
<script>
  (function() {
    'use strict';

    // 1. Define Control Component
    var MyControl = createClass({
      getInitialState: function() {
        return { /* initial state */ };
      },
      
      render: function() {
        // Access props: this.props.value, this.props.onChange, this.props.field
        // Access state: this.state
        return h('div', {}, /* widget UI */);
      }
    });

    // 2. Define Preview Component (optional)
    var MyPreview = createClass({
      render: function() {
        return h('div', {}, this.props.value);
      }
    });

    // 3. Register Widget
    CMS.registerWidget('my-widget', MyControl, MyPreview);
    
  })();
</script>
```

## Widget API Reference

### Control Component Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | any | Current field value |
| `field` | Immutable.Map | Field configuration from config.yml |
| `onChange` | function | Callback to update value: `this.props.onChange(newValue)` |
| `forID` | string | Unique ID for the field (use for `<input id=...>`) |
| `classNameWrapper` | string | CSS class for CMS styling |
| `onOpenMediaLibrary` | function | Opens media library (for image/file widgets) |

### Common Lifecycle Methods

```javascript
var Widget = createClass({
  // Initial state
  getInitialState: function() {
    return { /* state object */ };
  },
  
  // After component mounts (fetch data, set up listeners)
  componentDidMount: function() {
    // this.setState({ ... })
  },
  
  // Before component unmounts (cleanup)
  componentWillUnmount: function() {
    // Clean up listeners, timers
  },
  
  // Render UI
  render: function() {
    return h('div', {}, /* JSX-like structure */);
  }
});
```

### State Management

```javascript
// Set state
this.setState({ key: value });

// Set state with callback
this.setState({ key: value }, function() {
  // Called after state update
  this.emitChange();
});

// Access state
this.state.myValue
```

## Common Patterns

### Pattern 1: Simple Text Input

```javascript
var SimpleWidget = createClass({
  handleChange: function(e) {
    this.props.onChange(e.target.value);
  },
  
  render: function() {
    return h('input', {
      id: this.props.forID,
      className: this.props.classNameWrapper,
      type: 'text',
      value: this.props.value || '',
      onChange: this.handleChange
    });
  }
});

CMS.registerWidget('simple', SimpleWidget);
```

### Pattern 2: Widget with Validation

```javascript
var ValidatedWidget = createClass({
  getInitialState: function() {
    return { error: null };
  },
  
  handleChange: function(e) {
    var value = e.target.value;
    
    // Validate
    if (value.length > 100) {
      this.setState({ error: 'Max 100 characters' });
      return;
    }
    
    this.setState({ error: null });
    this.props.onChange(value);
  },
  
  render: function() {
    return h('div', {},
      h('input', {
        type: 'text',
        value: this.props.value || '',
        onChange: this.handleChange
      }),
      this.state.error && h('p', { style: { color: 'red' } }, this.state.error)
    );
  }
});
```

### Pattern 3: Fetching External Data

```javascript
var FetchWidget = createClass({
  getInitialState: function() {
    return {
      data: null,
      loading: true,
      error: null
    };
  },
  
  componentDidMount: function() {
    var self = this;
    
    fetch('/api/data')
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        self.setState({ 
          data: data,
          loading: false 
        });
      })
      .catch(function(error) {
        self.setState({ 
          error: error.message,
          loading: false 
        });
      });
  },
  
  render: function() {
    if (this.state.loading) {
      return h('div', {}, 'Loading...');
    }
    
    if (this.state.error) {
      return h('div', { style: { color: 'red' } }, this.state.error);
    }
    
    return h('div', {}, JSON.stringify(this.state.data));
  }
});
```

### Pattern 4: Image Widget with Media Library

```javascript
var ImageWidget = createClass({
  getInitialState: function() {
    return {
      src: this.props.value || null,
      error: null
    };
  },
  
  handleFileSelect: function() {
    var self = this;
    
    if (this.props.onOpenMediaLibrary) {
      this.props.onOpenMediaLibrary({
        forImage: true
      }).then(function(mediaFile) {
        self.setState({ src: mediaFile.path });
        self.props.onChange(mediaFile.path);
      }).catch(function(error) {
        self.setState({ error: error.message });
      });
    }
  },
  
  render: function() {
    return h('div', {},
      this.state.src 
        ? h('img', { src: this.state.src, style: { maxWidth: '100%' } })
        : h('button', { onClick: this.handleFileSelect }, 'Select Image'),
      this.state.error && h('p', { style: { color: 'red' } }, this.state.error)
    );
  }
});
```

## Common Mistakes to Avoid

### ❌ Don't: Use External Files
```javascript
// external-widget.js
class MyWidget extends Component { }
```

```html
<!-- index.html -->
<script src="./widgets/external-widget.js"></script>
```

**Problem:** Race conditions, path issues, harder to debug

### ❌ Don't: Use ES6 Classes
```javascript
class MyWidget extends React.Component {
  constructor(props) {
    super(props);
  }
}
```

**Problem:** Incompatible with Decap CMS's Preact implementation

### ❌ Don't: Use async/await
```javascript
componentDidMount: async function() {
  const data = await fetch('/api/data');  // ❌ Won't work
}
```

**Problem:** `createClass` doesn't support async functions. Use promises with `.then()`

### ❌ Don't: Forget Error Handling
```javascript
fetch('/api/data')
  .then(function(response) {
    return response.json();
  })
  // ❌ No .catch() - errors will be silent
```

**Solution:** Always add `.catch()` for error handling

### ❌ Don't: Mutate State Directly
```javascript
this.state.value = newValue;  // ❌ Wrong
```

**Solution:** Always use `this.setState()`

## Testing Checklist

Before deploying widgets:

- [ ] Widget loads without console errors
- [ ] Widget renders correctly in CMS editor
- [ ] Widget saves data in correct format
- [ ] Preview component displays saved data
- [ ] Error states show user-friendly messages
- [ ] Widget works with existing content (backward compatibility)
- [ ] Validation prevents invalid data
- [ ] Loading states provide feedback

## Resources

- [Official Decap CMS Custom Widgets Documentation](https://decapcms.org/docs/custom-widgets/)
- [Decap CMS Widget API Reference](https://decapcms.org/docs/widgets/)
- [Preact Documentation](https://preactjs.com/guide/v10/api-reference/)

## Current Implementation

Our widgets are in [public/admin/index.html](../public/admin/index.html). See the file for complete, working examples of:

1. **Author Widget** - Demonstrates async data fetching, error handling, and CMS backend integration
2. **Enhanced Image Widget** - Shows media library integration, state management, and complex UI

**Key implementation details:**
- Both widgets use `createClass` syntax
- All elements created with `h()` function
- Proper error handling with user feedback
- Backward compatibility with existing data formats
