# Author Widget Issue Assessment

**Date**: 2025-12-22  
**Status**: 🔴 CRITICAL  
**Reported Error**: "⚠️ Backend není dostupný" (GitHub integration not ready)  
**Component**: Author Widget in Decap CMS Admin Interface

> **Note**: "Backend" in Decap CMS refers to the **Git provider integration** (GitHub/GitLab/etc.), not a server. This is a fully browser-based CMS that uses Git as the storage backend.

---

## Executive Summary

The Author Widget is displaying a **"Backend není dostupný"** error and falling back to the default author "Redakce". This occurs because the widget cannot access the **GitHub integration layer** to retrieve the authenticated user information, which is required to automatically map GitHub usernames to display names.

**Terminology Clarification**: Decap CMS uses "backend" to refer to the Git provider (GitHub) integration, not a traditional server. All operations happen in the browser via GitHub's API.

**Impact**: 
- ❌ Automatic author attribution based on GitHub login is non-functional
- ⚠️ All articles default to "Redakce" regardless of who creates them
- 📉 Loss of authorship tracking and accountability

**Severity**: **HIGH** - Core feature non-functional, but content creation can continue with manual workarounds

---

## Root Cause Analysis

### 1. **GitHub Integration Timing Issue**

**Location**: [public/admin/index.html](public/admin/index.html#L93-L104)

```javascript
var backend = window.CMS && window.CMS.getBackend && window.CMS.getBackend();
if (!backend || !backend.currentUser) {
  console.error('Unable to access CMS backend');
  self.setState({ 
    author: 'Redakce', 
    error: 'Backend není dostupný' 
  });
  self.props.onChange('Redakce');
  return;
}
```

**Problem**: The widget's `componentDidMount()` is called immediately when the component renders, but the **GitHub integration** may not be fully initialized yet. The check for `backend.currentUser` is failing because:

- The Git provider integration object exists but is not yet fully initialized
- The OAuth authentication flow with GitHub hasn't completed
- The GitHub user session isn't loaded yet

**What `backend` actually is**: In Decap CMS, `backend` = the JavaScript API that talks to GitHub (or GitLab/Bitbucket). It handles OAuth, file reads/writes via Git API, and user authentication.

### 2. **Authors.json Path Mismatch**

**Location**: [public/admin/index.html](public/admin/index.html#L114)

```javascript
var authorsPath = '/dgkralupy/content/authors/authors.json';
```

**Problems Identified**:

a) **Hardcoded GitHub Pages Path**: The path includes `/dgkralupy/` which is specific to GitHub Pages deployment. This will fail in:
   - Local development environments
   - Non-GitHub Pages deployments
   - Different repository names

b) **File Location Inconsistency**:
   - Widget tries to fetch: `/dgkralupy/content/authors/authors.json`
   - Actual file locations:
     - Source: `src/content/authors/authors.json` ✅ (exists)
     - Public: `public/content/authors/authors.json` ✅ (exists)
   - Runtime path: Should be `/content/authors/authors.json` (without `/dgkralupy/`)

c) **Format Mismatch**:
   - **src/content/authors/authors.json** (NEW format):
     ```json
     {
       "mappings": [
         {
           "github": "rjicha",
           "displayName": "Radek Jícha"
         }
       ],
       "defaultAuthor": "Redakce"
     }
     ```
   - **public/content/authors/authors.json** (OLD format):
     ```json
     {
       "mapping": {
         "rjicha": "Radek Jícha"
       },
       "defaultAuthor": "Redakce"
     }
     ```
   - Widget code handles both formats, but the inconsistency is problematic

### 3. **Git Provider Configuration**

**Location**: [public/admin/config.yml](public/admin/config.yml#L3-L6)

```yaml
backend:
  name: github
  repo: rjicha/dgkralupy
  branch: main
  base_url: https://dgkralupy-stg.radekjicha.workers.dev

local_backend: true
```

**Analysis**:
- GitHub integration is configured correctly
- `local_backend: true` enables local Git mode for development
- External OAuth handler at `https://dgkralupy-stg.radekjicha.workers.dev` (for production)

**Possible Issues**:
- OAuth handler may not be responding
- CORS issues with the OAuth endpoint
- GitHub authentication token expired or invalid
- User not logged in to GitHub

---

## Error Manifestation

### User Experience

When creating/editing an article, the author field shows:

```
Redakce

Autor je nastaven automaticky na základě vašeho GitHub účtu

⚠️ Backend není dostupný
```

**Translation**: "Author is set automatically based on your GitHub account" / "GitHub integration not available"

### Console Errors (Expected)

```javascript
Unable to access CMS backend  // = GitHub integration not ready
Chyba při načítání autora: [Error details]  // = Error loading author
```

---

## Technical Deep Dive

### Widget Lifecycle Flow

```
1. Article editor opens
   ↓
2. Author widget component mounts
   ↓
3. componentDidMount() executes
   ↓
4. determineAuthor() called
   ↓
5. Try to get GitHub integration: window.CMS.getBackend()
   ↓
6. Check if GitHub user session exists  ❌ FAILS HERE
   ↓
7. Set error state: "Backend není dostupný"
   ↓
8. Default to "Redakce"
```

### Expected Flow (When Working)

```
1. Article editor opens
   ↓
2. Author widget component mounts
   ↓
3. componentDidMount() executes
   ↓
4. determineAuthor() called
   ↓
5. Get GitHub integration: window.CMS.getBackend()  ✓
   ↓
6. Call backend.currentUser() to get GitHub user via API  ✓
   ↓
7. Extract GitHub username from user object (e.g., "rjicha")  ✓
   ↓
8. Fetch /content/authors/authors.json from repository  ✓
   ↓
9. Map GitHub username → Display name ("rjicha" → "Radek Jícha")  ✓
   ↓
10. Set author to mapped name  ✓
```

---

## Related Issues

### 1. Data Format Inconsistency

Two different formats exist for `authors.json`:
- **src/content/authors/authors.json** uses the new array-based format with `mappings`
- **public/content/authors/authors.json** uses the old object-based format with `mapping`
- Need to standardize on one format
- Ensure consistency across environments

---

## Potential Solutions

### Solution A: Add GitHub Integration Readiness Check ⭐ RECOMMENDED

**Approach**: Retry GitHub integration access with exponential backoff until OAuth completes

**Implementation**:
```javascript
determineAuthor: function() {
  var self = this;
  var maxRetries = 10;
  var retryDelay = 200; // Start with 200ms
  
  function attemptGetBackend(retryCount) {
    var backend = window.CMS && window.CMS.getBackend && window.CMS.getBackend();
    
    if (!backend || !backend.currentUser) {
      if (retryCount < maxRetries) {
        console.log('Backend not ready, retrying... (' + (retryCount + 1) + '/' + maxRetries + ')');
        setTimeout(function() {
          attemptGetBackend(retryCount + 1);
        }, retryDelay * Math.pow(1.5, retryCount)); // Exponential backoff
        return;
      } else {
        console.error('Backend not available after ' + maxRetries + ' retries');
        self.setState({ 
          author: 'Redakce', 
          error: 'Backend není dostupný po ' + maxRetries + ' pokusech' 
        });
        self.props.onChange('Redakce');
        return;
      }
    }
    
    // Backend is ready, proceed with normal flow
    backend.currentUser().then(function(user) {
      // ... existing logic ...
    }).catch(function(error) {
      console.error('Chyba při načítání autora:', error);
      self.setState({
        author: 'Redakce',
        error: error.message
      });
      self.props.onChange('Redakce');
    });
  }
  
  attemptGetBackend(0);
}
```

**Pros**:
- ✅ Handles GitHub OAuth timing (authentication may take a few seconds)
- ✅ Graceful degradation after max retries
- ✅ Clear logging for debugging
- ✅ Minimal changes to existing code

**Cons**:
- ⚠️ Adds complexity
- ⚠️ May still fail if GitHub authentication never completes

---

### Solution B: Fix Authors.json Path

**Approach**: Make path environment-aware and consistent

**Implementation**:
```javascript
// Determine base path based on environment
var basePath = window.location.hostname === 'localhost' 
  ? '' 
  : (window.location.pathname.split('/')[1] ? '/' + window.location.pathname.split('/')[1] : '');

var authorsPath = basePath + '/content/authors/authors.json';
```

**Pros**:
- ✅ Works in all environments
- ✅ No hardcoded paths
- ✅ Future-proof

**Cons**:
- ⚠️ Doesn't solve GitHub integration timing issue
- ⚠️ More complex path logic

---

### Solution C: Synchronize Data Formats

**Approach**: Update `public/content/authors/authors.json` to match new format

**Implementation**:
Replace old format with:
```json
{
  "mappings": [
    {
      "github": "rjicha",
      "displayName": "Radek Jícha"
    }
  ],
  "defaultAuthor": "Redakce"
}
```

**Pros**:
- ✅ Consistency across environments
- ✅ Widget already supports both formats
- ✅ Simple fix

**Cons**:
- ⚠️ Doesn't solve GitHub integration timing issue
- ⚠️ May break if old format is required elsewhere

---

### Solution D: GitHub Authentication Event Listener ⭐ COMPREHENSIVE

**Approach**: Listen for CMS initialization event before attempting to access GitHub user

**Implementation**:
```javascript
componentDidMount: function() {
  var self = this;
  
  // Check if GitHub integration is already ready
  var backend = window.CMS && window.CMS.getBackend && window.CMS.getBackend();
  if (backend && backend.currentUser) {
    self.determineAuthor();
    return;
  }
  
  // Otherwise, wait for CMS to complete GitHub OAuth
  window.addEventListener('decap-cms-ready', function() {
    console.log('CMS ready (GitHub auth complete), determining author...');
    self.determineAuthor();
  });
  
  // Fallback timeout in case event doesn't fire
  setTimeout(function() {
    if (self.state.author === 'Načítání...') {
      console.warn('CMS ready event not received, attempting anyway...');
      self.determineAuthor();
    }
  }, 5000);
}
```

**Pros**:
- ✅ Event-driven approach waits for OAuth completion
- ✅ Proper timing coordination with GitHub authentication
- ✅ Fallback mechanism
- ✅ Aligns with proper lifecycle management

**Cons**:
- ⚠️ Requires CMS to emit ready event (may need custom event dispatch)
- ⚠️ More invasive changes

---

## Recommended Fix Strategy

### Phase 1: Immediate Fix (High Priority)
1. ✅ **Implement Solution A** - Add backend readiness retry logic
2. ✅ **Implement Solution B** - Fix hardcoded path issue
3. ✅ **Implement Solution C** - Synchronize data formats

### Phase 2: Architecture Improvement (Medium Priority)
4. ⏳ **Implement Solution D** - Add proper event-based initialization
5. ⏳ Add comprehensive error handling and user feedback
6. ⏳ Add admin UI for debugging backend status

### Phase 3: Testing & Validation
7. ⏳ Test in local development environment
8. ⏳ Test in GitHub Pages deployment
9. ⏳ Test with different authentication states
10. ⏳ Add automated tests for widget lifecycle

---

## Testing Checklist

- [ ] GitHub OAuth completes before widget mounts
- [ ] GitHub OAuth completes after widget mounts
- [ ] GitHub authentication succeeds
- [ ] GitHub authentication fails/times out
- [ ] authors.json file loads successfully from repository
- [ ] authors.json file fails to load (404)
- [ ] GitHub username exists in mapping
- [ ] GitHub username not in mapping (fallback to default)
- [ ] Local development environment (local_backend mode)
- [ ] GitHub Pages deployment (OAuth via external handler)
- [ ] Different repository/base paths

---

## Success Criteria

1. ✅ No "Backend není dostupný" error after GitHub authentication completes
2. ✅ GitHub username correctly mapped to display name
3. ✅ Graceful fallback to "Redakce" only when GitHub auth fails or user not found
4. ✅ Clear error messages for debugging OAuth/API issues
5. ✅ Works in all deployment environments (local and GitHub Pages)
6. ✅ Consistent data format across environments

---

## Dependencies

- Decap CMS initialization in browser
- GitHub OAuth flow completion (authentication via GitHub API)
- authors.json file availability in repository
- Network connectivity for GitHub API calls and file fetching

---

## Risk Assessment

**Risk Level**: **MEDIUM-HIGH**

**Risks**:
- ⚠️ GitHub OAuth may fail or timeout in certain network conditions
- ⚠️ OAuth flow failures will always cause this error
- ⚠️ Path fixes may break in unexpected deployment scenarios
- ⚠️ Retry logic could delay widget rendering
- ⚠️ CORS issues with OAuth handler could block authentication

**Mitigation**:
- Implement comprehensive error handling for OAuth failures
- Add fallback mechanisms at every step
- Test thoroughly in all environments (local_backend and OAuth modes)
- Add monitoring/logging for production issues
- Provide clear user feedback when GitHub auth is required

---

## Additional Notes

### GitHub Integration Debugging

To diagnose GitHub authentication issues, add this debug code to the widget:

```javascript
// Debug helper for GitHub integration
function debugGitHubIntegration() {
  console.log('=== GitHub Integration Debug Info ===');
  console.log('window.CMS:', typeof window.CMS);
  console.log('window.CMS.getBackend:', typeof (window.CMS && window.CMS.getBackend));
  
  var backend = window.CMS && window.CMS.getBackend && window.CMS.getBackend();
  console.log('GitHub integration object:', backend);
  console.log('backend.currentUser method:', backend && typeof backend.currentUser);
  
  if (backend && backend.currentUser) {
    backend.currentUser()
      .then(function(user) {
        console.log('GitHub authenticated user:', user);
        console.log('GitHub username:', user.login);
      })
      .catch(function(error) {
        console.error('GitHub API error:', error);
      });
  } else {
    console.warn('GitHub integration not ready - OAuth may still be in progress');
  }
  console.log('========================');
}
```

### Related Documentation

- [Custom Widgets Refactoring](docs/CUSTOM_WIDGETS_REFACTORING.md) - Widget implementation best practices
- [CMS Admin Architecture](docs/issues/04-cms-admin-architecture-ip.md)

---

## Conclusion

The "Backend není dostupný" error is caused by a timing issue where the Author Widget attempts to access the **GitHub integration** (Git provider API) before the OAuth authentication flow has completed. Remember: Decap CMS has no traditional backend server - it's a fully browser-based system that uses GitHub's API as its storage layer.

The recommended solution is a multi-phase approach:

1. **Immediate**: Add retry logic with exponential backoff
2. **Immediate**: Fix hardcoded path issues
3. **Immediate**: Synchronize data format inconsistencies
4. **Follow-up**: Implement proper event-based initialization

This approach provides immediate relief while setting the foundation for a more robust architecture.

**Next Steps**: Proceed with Phase 1 implementation and testing.
