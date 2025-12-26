# Custom Widget Development Guide

**Decap CMS 3.x**
**Last Updated:** December 26, 2025

---

## Overview

Guide for developing custom widgets in Decap CMS. Custom widgets extend the CMS editor with specialized input controls.

**Current Widgets:**
- **Author Widget** - Auto-populates author from GitHub user
- **Enhanced Image Widget** - Image upload with alt text and focus point

---

## Core Requirements

### 1. Inline Registration

Register widgets directly in `public/admin/index.html`. Never use external JavaScript files.

```html
<script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
<script>
  (function() {
    'use strict';

    var MyControl = createClass({
      render: function() {
        return h('input', {
          value: this.props.value,
          onChange: (e) => this.props.onChange(e.target.value)
        });
      }
    });

    CMS.registerWidget('my-widget', MyControl);
  })();
</script>
```

### 2. Use `createClass` Syntax

Decap CMS uses Preact internally. ES6 classes are not compatible.

```javascript
// ✅ Correct
var MyWidget = createClass({
  getInitialState: function() {
    return { value: '' };
  },
  render: function() {
    return h('div', {}, this.state.value);
  }
});

// ❌ Wrong
class MyWidget extends React.Component { }
```

### 3. Use `h()` for Elements

Create elements with Preact's `h()` function (no JSX).

```javascript
h(tagName, props, children)

// Examples:
h('div', { className: 'container' }, 'Hello')
h('button', { onClick: this.handleClick }, 'Click')
h('div', {}, h('h1', {}, 'Title'), h('p', {}, 'Text'))
```

---

## Widget API

### Control Component Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | any | Current field value |
| `field` | Map | Field configuration from config.yml |
| `onChange` | function | Update value: `this.props.onChange(newValue)` |
| `forID` | string | Unique field ID |
| `classNameWrapper` | string | CSS class for styling |

### Lifecycle Methods

```javascript
var Widget = createClass({
  getInitialState: function() {
    return { data: null };
  },

  componentDidMount: function() {
    // Fetch data, set up listeners
  },

  componentWillUnmount: function() {
    // Cleanup
  },

  render: function() {
    return h('div', {}, this.state.data);
  }
});
```

---

## Common Patterns

### Simple Text Input

```javascript
var SimpleWidget = createClass({
  handleChange: function(e) {
    this.props.onChange(e.target.value);
  },

  render: function() {
    return h('input', {
      id: this.props.forID,
      type: 'text',
      value: this.props.value || '',
      onChange: this.handleChange
    });
  }
});
```

### With Validation

```javascript
var ValidatedWidget = createClass({
  getInitialState: function() {
    return { error: null };
  },

  handleChange: function(e) {
    var value = e.target.value;

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

### Fetching External Data

```javascript
var FetchWidget = createClass({
  getInitialState: function() {
    return { data: null, loading: true };
  },

  componentDidMount: function() {
    var self = this;

    fetch('/api/data')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        self.setState({ data: data, loading: false });
      })
      .catch(function(err) {
        self.setState({ error: err.message, loading: false });
      });
  },

  render: function() {
    if (this.state.loading) return h('div', {}, 'Loading...');
    if (this.state.error) return h('div', {}, this.state.error);
    return h('div', {}, JSON.stringify(this.state.data));
  }
});
```

---

## Accessing Current User

Decap CMS has no official API for accessing the authenticated user in widgets.

**Solution:** Use localStorage

**See:** [../DECAP-CMS-LOCALSTORAGE.md](../DECAP-CMS-LOCALSTORAGE.md) for complete details.

**Quick reference:**

```javascript
var userData = JSON.parse(localStorage.getItem('decap-cms-user'));
var username = userData.login || userData.username || userData.name;
```

**Requirements:**
- localStorage key: `'decap-cms-user'` (NOT `'netlify-cms-user'`)
- Config: `local_backend: false` (NOT `true`)
- User must be logged in

---

## Common Mistakes

### ❌ External JavaScript Files

Don't use external widget files - causes race conditions.

### ❌ ES6 Classes

```javascript
class MyWidget extends React.Component { }  // Won't work
```

### ❌ async/await

```javascript
componentDidMount: async function() {  // Not supported
  const data = await fetch('/api');
}
```

Use promises with `.then()` instead.

### ❌ Direct State Mutation

```javascript
this.state.value = newValue;  // Wrong
this.setState({ value: newValue });  // Correct
```

### ❌ Missing Error Handling

Always add `.catch()` to promises:

```javascript
fetch('/api/data')
  .then(res => res.json())
  .catch(err => console.error(err));  // Always handle errors
```

---

## Troubleshooting

### Widget Not Registered

```javascript
// Check globals
console.log('CMS:', typeof window.CMS);
console.log('createClass:', typeof createClass);
console.log('h:', typeof h);

// Verify registration
window.CMS.getWidget('my-widget')  // Should return object
```

**Common causes:**
- JavaScript syntax error
- Missing IIFE closure `})();`
- Widget name mismatch with config.yml
- Script runs before Decap CMS loads

### 404 Loading External Files

Files must be in `public/` folder to be accessible:

```bash
# Wrong location
src/content/data.json

# Correct location
public/data.json
```

### Wrong Base Path in Production

Detect base path from URL:

```javascript
var basePath = '';
var pathParts = window.location.pathname.split('/').filter(p => p);
if (pathParts.length > 0 && pathParts[0] !== 'admin') {
  basePath = '/' + pathParts[0];
}
fetch(basePath + '/data.json')
```

---

## Testing Checklist

- [ ] Widget loads without console errors
- [ ] Widget renders correctly
- [ ] Widget saves data properly
- [ ] Preview displays correctly
- [ ] Error states work
- [ ] Validation works
- [ ] Works with existing content

---

## Resources

- [Official Decap CMS Documentation](https://decapcms.org/docs/custom-widgets/)
- [Preact API Reference](https://preactjs.com/guide/v10/api-reference/)
- [Widget API Reference](https://decapcms.org/docs/widgets/)

---

## Implementation

**See working examples:** `public/admin/index.html`

- Author Widget - localStorage access, GitHub user mapping
- Enhanced Image Widget - Media library, state management
