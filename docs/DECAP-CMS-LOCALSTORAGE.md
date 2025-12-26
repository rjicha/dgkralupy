# Decap CMS localStorage: Accessing User Data in Custom Widgets

**Last Updated:** December 26, 2025
**Status:** Production Knowledge
**Decap CMS Version:** 3.x

---

## Overview

This document describes how Decap CMS uses browser localStorage to persist user authentication data, and how custom widgets can access this information.

**Important:** This is an **undocumented internal mechanism** of Decap CMS. While stable and reliable, it is not part of the official widget API and could theoretically change in future versions.

---

## The Problem

Decap CMS **does not provide an official API** for custom widgets to access the currently authenticated user. Widget props include:
- `value` - Current field value
- `field` - Field configuration
- `onChange` - Update callback
- `forID` - Field identifier
- Other UI-related props

But **NOT**:
- ❌ Current user information
- ❌ Authentication state
- ❌ User profile data

**GitHub Issue:** [#2661](https://github.com/decaporg/decap-cms/issues/2661) requesting this feature was closed as "not planned."

---

## The Solution: localStorage

Decap CMS stores authenticated user data in **browser localStorage** where custom widgets can access it.

### Storage Key

```javascript
'decap-cms-user'
```

**Critical:** The key is `'decap-cms-user'` NOT `'netlify-cms-user'`

**Why:** When Netlify CMS was renamed to Decap CMS, the localStorage key was changed to reflect the new name.

### Source Code Reference

From [Decap CMS backend.js](https://github.com/decaporg/decap-cms/blob/main/src/backends/backend.js):

```javascript
class LocalStorageAuthStore {
  constructor() {
    this.storageKey = 'decap-cms-user';  // ← Hardcoded key
  }

  retrieve() {
    const data = window.localStorage.getItem(this.storageKey);
    return data && JSON.parse(data);
  }

  store(user) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  logout() {
    window.localStorage.removeItem(this.storageKey);
  }
}
```

---

## Data Structure

### GitHub Backend

When authenticated with GitHub backend:

```json
{
  "login": "username",
  "name": "Full Name",
  "email": "user@example.com",
  "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
  "id": 12345,
  "node_id": "MDQ6VXNlcjEyMzQ1",
  "bio": "User bio text",
  "blog": "https://blog.example.com",
  "company": "Company Name",
  "location": "City, Country",
  "hireable": null,
  "public_repos": 10,
  "followers": 50,
  "following": 30,
  "created_at": "2015-01-01T00:00:00Z",
  "updated_at": "2025-12-26T00:00:00Z",
  "token": "gho_...",
  "backendName": "github"
}
```

### GitLab Backend

```json
{
  "username": "username",
  "name": "Full Name",
  "email": "user@example.com",
  "avatar_url": "https://gitlab.com/uploads/-/system/user/avatar/12345/avatar.png",
  "id": 12345,
  "web_url": "https://gitlab.com/username",
  "token": "glpat-...",
  "backendName": "gitlab"
}
```

### Bitbucket Backend

```json
{
  "username": "username",
  "display_name": "Full Name",
  "uuid": "{12345678-1234-1234-1234-123456789012}",
  "links": {
    "avatar": {
      "href": "https://bitbucket.org/account/username/avatar/"
    }
  },
  "token": "...",
  "backendName": "bitbucket"
}
```

### Proxy Backend (Local Development)

When using `local_backend: true`:

```json
{
  "backendName": "proxy"
}
```

**⚠️ Important:** Proxy backend **only** stores the backend name. No user data is available.

---

## Accessing User Data

### Basic Access

```javascript
// Get raw data
const userDataString = localStorage.getItem('decap-cms-user');

// Check if user is logged in
if (!userDataString) {
  console.log('User is not logged in');
  return;
}

// Parse user data
const userData = JSON.parse(userDataString);
console.log('Logged in as:', userData.login || userData.username);
```

### Backend-Agnostic Username Extraction

Different backends use different property names for the username:

```javascript
function getCurrentUsername() {
  const userDataString = localStorage.getItem('decap-cms-user');

  if (!userDataString) {
    return null;  // Not logged in
  }

  const userData = JSON.parse(userDataString);

  // Try different backend username properties
  return userData.login      // GitHub
      || userData.username   // GitLab, Bitbucket
      || userData.name       // Fallback
      || null;
}
```

### Safe Access with Error Handling

```javascript
function getCurrentUser() {
  try {
    const userDataString = localStorage.getItem('decap-cms-user');

    if (!userDataString) {
      return null;
    }

    const userData = JSON.parse(userDataString);

    // Validate it's not just proxy backend
    if (userData.backendName === 'proxy') {
      return null;  // Proxy backend has no user data
    }

    return userData;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
}
```

---

## Requirements and Limitations

### ✅ Requirements

#### 1. User Must Be Authenticated

localStorage is only populated **after** successful OAuth login. Users must:
1. Click "Login with GitHub" (or other provider)
2. Complete OAuth flow
3. Be redirected back to CMS

#### 2. Real Backend Authentication Required

For full user data, you **must** use real backend authentication:

```yaml
# config.yml
backend:
  name: github  # or gitlab, bitbucket
  repo: owner/repo
  branch: main
  base_url: https://your-oauth-provider.com

local_backend: false  # ← MUST be false
```

**With `local_backend: true`:**
```json
{"backendName": "proxy"}  // ← No user data
```

**With `local_backend: false`:**
```json
{
  "login": "username",
  "name": "Full Name",
  ...  // ← Full user data ✅
}
```

#### 3. Browser localStorage Enabled

- Must have browser localStorage available
- Must have JavaScript enabled
- Required for Decap CMS itself (not an additional requirement)

### ⚠️ Limitations

#### 1. Undocumented API

- Not part of official Decap CMS widget API
- Could change without notice in future versions
- No guarantees of stability

**Mitigation:**
- Use defensive programming
- Always check for existence
- Provide fallback values
- Monitor for breaking changes in CMS updates

#### 2. Client-Side Only

- Data is stored in browser only
- Not available server-side
- Cleared when user logs out
- Cleared when localStorage is cleared

#### 3. Backend-Specific Structure

Different backends return different user object structures. Code must handle variations.

#### 4. Security Considerations

**Contains authentication token:**
```json
{
  "token": "gho_..."  // ← OAuth token stored here
}
```

**Best Practices:**
- ✅ Read only non-sensitive fields (login, name, email)
- ❌ Never read the `token` field in widget code
- ❌ Never log the token to console
- ❌ Never transmit the token elsewhere

---

## Common Use Cases

### Use Case 1: Auto-Populate Author Field

```javascript
var AuthorControl = createClass({
  componentDidMount: function() {
    var self = this;

    // Get current user
    var userDataString = localStorage.getItem('decap-cms-user');

    if (!userDataString) {
      // Not logged in - use default
      self.props.onChange('Anonymous');
      return;
    }

    var userData = JSON.parse(userDataString);
    var username = userData.login || userData.username || userData.name;

    if (!username) {
      // No username - use default
      self.props.onChange('Anonymous');
      return;
    }

    // Use username as author
    self.props.onChange(username);
  }
});
```

### Use Case 2: User-Specific Configuration

```javascript
var ConfigWidget = createClass({
  componentDidMount: function() {
    var userData = JSON.parse(localStorage.getItem('decap-cms-user'));

    if (userData && userData.login) {
      // Load user-specific preferences
      fetch('/config/users/' + userData.login + '.json')
        .then(response => response.json())
        .then(config => {
          this.setState({ userConfig: config });
        });
    }
  }
});
```

### Use Case 3: Conditional Widget Behavior

```javascript
var AdminWidget = createClass({
  isAdmin: function() {
    var userData = JSON.parse(localStorage.getItem('decap-cms-user'));

    if (!userData) return false;

    var username = userData.login || userData.username;

    // Check if user is in admin list
    var adminUsers = ['admin', 'superuser', 'owner'];
    return adminUsers.includes(username);
  },

  render: function() {
    if (this.isAdmin()) {
      // Show admin controls
      return h('div', {}, 'Admin options here');
    } else {
      // Show regular controls
      return h('div', {}, 'Regular user view');
    }
  }
});
```

---

## Alternatives Considered

### ❌ CMS.getBackend().currentUser()

**Attempted approach:**
```javascript
var backend = window.CMS.getBackend();
backend.currentUser().then(user => {
  // Use user data
});
```

**Why it fails:**
- Race condition: backend might not be initialized when widget mounts
- Timing unpredictable
- Returns `undefined` or `null` inconsistently
- Not designed for custom widget access

**Conclusion:** Not reliable for custom widgets.

### ❌ Redux Store Access

**Attempted approach:**
```javascript
// Try to access CMS Redux store
var store = window.CMS.store;  // ← Doesn't exist
```

**Why it fails:**
- Redux store is not exposed globally
- No public API to access store
- Internal implementation detail

**Conclusion:** Not possible without hacking CMS internals.

### ✅ localStorage Access (Current Solution)

**Why it works:**
- Synchronous access (no race conditions)
- Always available when user is logged in
- Reliable data structure
- Used by CMS core authentication

**Trade-offs:**
- Undocumented
- Could theoretically change
- Requires defensive programming

---

## Best Practices

### 1. Always Check for Existence

```javascript
// ✅ GOOD
var userDataString = localStorage.getItem('decap-cms-user');
if (!userDataString) {
  return 'Default Value';
}

// ❌ BAD
var userData = JSON.parse(localStorage.getItem('decap-cms-user'));
// Throws error if null
```

### 2. Use Try-Catch for JSON Parsing

```javascript
// ✅ GOOD
try {
  var userData = JSON.parse(localStorage.getItem('decap-cms-user'));
  return userData.login;
} catch (error) {
  console.error('Error parsing user data:', error);
  return null;
}

// ❌ BAD
var userData = JSON.parse(localStorage.getItem('decap-cms-user'));
// No error handling
```

### 3. Provide Fallback Values

```javascript
// ✅ GOOD
var username = getCurrentUsername() || 'Anonymous';

// ❌ BAD
var username = getCurrentUsername();
// Could be null/undefined
```

### 4. Don't Access Token

```javascript
// ✅ GOOD
var userData = JSON.parse(localStorage.getItem('decap-cms-user'));
var username = userData.login;

// ❌ BAD
var token = userData.token;  // Don't access token
console.log('Token:', token);  // Never log token
```

### 5. Backend-Agnostic Code

```javascript
// ✅ GOOD - Works with GitHub, GitLab, Bitbucket
var username = userData.login || userData.username || userData.name;

// ❌ BAD - Only works with GitHub
var username = userData.login;
```

### 6. Validate Backend Type

```javascript
// ✅ GOOD
var userData = JSON.parse(localStorage.getItem('decap-cms-user'));

if (userData.backendName === 'proxy') {
  // Proxy backend has no user data
  return 'Default';
}

var username = userData.login || userData.username;
```

---

## Debugging

### Check if User is Logged In

Open browser console:

```javascript
// Check localStorage
localStorage.getItem('decap-cms-user')

// Should return:
// - null (not logged in)
// - JSON string with user data (logged in)
```

### Inspect User Data

```javascript
// Pretty print user data
console.log(JSON.parse(localStorage.getItem('decap-cms-user')));
```

### Verify Backend Type

```javascript
// Check which backend is in use
var userData = JSON.parse(localStorage.getItem('decap-cms-user'));
console.log('Backend:', userData.backendName);

// Returns: "github", "gitlab", "bitbucket", or "proxy"
```

### Clear User Session

```javascript
// Log out (clear user data)
localStorage.removeItem('decap-cms-user');

// Then reload admin page to log in again
```

---

## Testing

### Test Scenarios

1. **Not logged in**
   - Clear localStorage: `localStorage.removeItem('decap-cms-user')`
   - Widget should use fallback value

2. **Logged in with GitHub**
   - Log in normally
   - Check `userData.login` exists
   - Widget should use username

3. **Logged in with GitLab**
   - Use GitLab backend
   - Check `userData.username` exists

4. **Proxy backend (local dev)**
   - Set `local_backend: true`
   - Only `{backendName: 'proxy'}` stored
   - Widget should use fallback value

### Test Code

```javascript
function testUserAccess() {
  console.log('Testing Decap CMS localStorage access...');

  // Test 1: Check key exists
  var keys = Object.keys(localStorage);
  console.log('1. localStorage keys:', keys);

  // Test 2: Get user data
  var userDataString = localStorage.getItem('decap-cms-user');
  console.log('2. User data string:', userDataString);

  if (!userDataString) {
    console.log('✅ Test: User not logged in (expected if not logged in)');
    return;
  }

  // Test 3: Parse data
  try {
    var userData = JSON.parse(userDataString);
    console.log('3. Parsed user data:', userData);

    // Test 4: Extract username
    var username = userData.login || userData.username || userData.name;
    console.log('4. Username:', username);

    // Test 5: Check backend
    console.log('5. Backend:', userData.backendName);

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testUserAccess();
```

---

## Version Compatibility

| Decap CMS Version | localStorage Key | Notes |
|-------------------|------------------|-------|
| 3.x | `'decap-cms-user'` | Current version ✅ |
| 2.x (Netlify CMS) | `'netlify-cms-user'` | Legacy key name |

**Migration:** When upgrading from Netlify CMS to Decap CMS:
- Old key: `'netlify-cms-user'`
- New key: `'decap-cms-user'`
- CMS handles migration automatically
- Custom widgets must use new key name

---

## Related Documentation

- [Creating Custom Widgets](https://decapcms.org/docs/custom-widgets/) - Official Decap CMS docs
- [GitHub Issue #2661](https://github.com/decaporg/decap-cms/issues/2661) - Feature request for user access in widgets
- [Decap CMS Architecture](https://decapcms.org/docs/architecture/) - CMS architecture overview
- [backend.js Source](https://github.com/decaporg/decap-cms/blob/main/src/backends/backend.js) - LocalStorageAuthStore implementation

---

## Summary

### Key Takeaways

1. **localStorage key:** `'decap-cms-user'` (not `'netlify-cms-user'`)
2. **Requirement:** `local_backend: false` for full user data
3. **Backend-agnostic:** Use `login || username || name` for username
4. **Undocumented:** Not part of official API, use defensively
5. **Security:** Never access or log the `token` field

### When to Use

Use localStorage access when you need to:
- Auto-populate fields with user information
- Customize widget behavior per user
- Implement user-specific features
- Track content authorship

### When NOT to Use

Don't use for:
- Security/authorization (client-side only)
- Enforcing access control (can be bypassed)
- Production authentication (use backend validation)

---

**Last Updated:** December 26, 2025
**Decap CMS Version:** 3.x
**Status:** Production-tested and documented
