# Implementation Plan: GitHub Provider Integration for Author Mapping

**Issue Number**: 06
**Related**: [AUTHOR_WIDGET_ASSESSMENT.md](AUTHOR_WIDGET_ASSESSMENT.md)
**Status**: ✅ Updated - Critical Fixes Applied
**Date**: 2025-12-22
**Last Updated**: 2025-12-22 (Staff Engineer Review)
**Priority**: HIGH - Core CMS functionality affected
**Staff Engineer**: Claude Sonnet 4.5
**Review Status**: Code review completed, critical issues addressed

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Root Cause Analysis](#root-cause-analysis)
4. [Solution Overview](#solution-overview)
5. [Pre-Implementation Checklist](#pre-implementation-checklist)
6. [Implementation Steps](#implementation-steps)
7. [Testing Plan](#testing-plan)
8. [Code Review Checklist](#code-review-checklist)
9. [Rollback Plan](#rollback-plan)
10. [Success Criteria](#success-criteria)
11. [Post-Implementation Tasks](#post-implementation-tasks)
12. [Risk Assessment](#risk-assessment)
13. [References](#references)

---

## Executive Summary

The Author Widget in Decap CMS fails to map GitHub usernames to display names, showing "Backend není dostupný" error and defaulting all articles to "Redakce" regardless of author.

**Root Causes**:
1. **Timing Issue**: Widget accesses GitHub integration before OAuth completes
2. **Path Issue**: Hardcoded `/dgkralupy/` path fails in local development  
3. **Data Inconsistency**: Two different JSON formats for author mappings

**Solution**: Implement retry logic with exponential backoff, dynamic path resolution, and standardize data format.

**Impact**: Restores automatic author attribution based on GitHub login.

---

## Problem Statement

### Current Behavior

When creating or editing articles in the CMS admin interface, the author field displays:

```
Redakce

Autor je nastaven automaticky na základě vašeho GitHub účtu

⚠️ Backend není dostupný
```

**Console Errors**:
```
Unable to access CMS backend
Chyba při načítání autora: [Error details]
```

### Expected Behavior

1. GitHub user authenticates via OAuth
2. Widget retrieves GitHub username (e.g., "rjicha")
3. Widget fetches `authors.json` mapping file
4. Widget maps GitHub username → Display name ("rjicha" → "Radek Jícha")
5. Author field displays mapped name
6. Article saves with correct author attribution

### User Impact

- ❌ Automatic author attribution non-functional
- ❌ All articles default to "Redakce" regardless of creator
- ❌ Loss of authorship tracking and accountability
- ⚠️ Manual workaround required (not scalable)

**Severity**: **HIGH** - Core feature broken, content creation continues but with degraded functionality

---

## Root Cause Analysis

### Issue 1: GitHub Integration Timing

**Location**: [public/admin/index.html](../../public/admin/index.html#L81-L104)

**Problem**: Widget's `componentDidMount()` executes immediately when component renders, but GitHub OAuth may not be ready yet.

**Code**:
```javascript
determineAuthor: function() {
  var self = this;
  
  // Get GitHub user from backend
  var backend = window.CMS && window.CMS.getBackend && window.CMS.getBackend();
  if (!backend || !backend.currentUser) {
    console.error('Unable to access CMS backend');
    self.setState({ 
      author: 'Redakce', 
      error: 'Backend není dostupný' 
    });
    self.props.onChange('Redakce');
    return; // ❌ Fails immediately, doesn't retry
  }
}
```

**Why it fails**:
- OAuth flow takes 1-3 seconds to complete
- Widget checks immediately (0-100ms after mount)
- No retry mechanism = permanent failure

---

### Issue 2: Hardcoded Deployment Path

**Location**: [public/admin/index.html](../../public/admin/index.html#L114)

**Problem**: Path includes deployment-specific `/dgkralupy/` base path.

**Code**:
```javascript
var authorsPath = '/dgkralupy/content/authors/authors.json';
```

**Environments**:
- ✅ **GitHub Pages**: `https://example.com/dgkralupy/content/authors/authors.json` ✅ Works
- ❌ **Localhost**: `http://localhost:4321/dgkralupy/content/authors/authors.json` ❌ 404
- ❌ **Custom domain**: `https://dgkralupy.cz/dgkralupy/content/authors/authors.json` ❌ 404

---

### Issue 3: Data Format Inconsistency

**Two different formats exist**:

**File 1**: [public/content/authors/authors.json](../../public/content/authors/authors.json)
```json
{
  "mapping": {
    "rjicha": "Radek Jícha"
  },
  "defaultAuthor": "Redakce"
}
```

**File 2**: [src/content/authors/authors.json](../../src/content/authors/authors.json)
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

**Impact**: Confusing for maintenance, risk of using wrong format

---

## Solution Overview

### Phase 1: Core Fixes (This IP)

**Fix 1: Backend Readiness Retry Logic**
- Implement exponential backoff retry (10 attempts, 200ms initial delay)
- Wait for GitHub OAuth to complete before proceeding
- Clear logging for debugging
- Graceful fallback after max retries

**Fix 2: Dynamic Path Resolution**
- Detect environment (localhost vs production)
- Extract base path from URL dynamically
- Log resolved path for debugging

**Fix 3: Data Format Standardization**
- Update `public/content/authors/authors.json` to new array-based format
- Maintain backward compatibility in widget code
- Single source of truth

### Phase 2: Future Enhancements (Post-Implementation)

- Event-based initialization (listen for CMS ready event)
- Loading indicator during retry
- Admin UI for debugging backend status
- Configurable retry parameters via config.yml

---

## Pre-Implementation Checklist

- [x] Root cause analysis completed
- [x] Solution design reviewed
- [x] Code changes planned and scoped
- [x] Testing strategy defined
- [x] Staff Engineer code review completed
- [x] Critical issues addressed in plan
- [ ] Backup created (Git commit)
- [ ] Local development environment verified (`npm run dev` working)
- [ ] Browser DevTools ready for console monitoring

---

## Implementation Phases

### Phase 1: Core Fixes
- [ ] Step 1: Create backup commit
- [ ] Step 2: Implement retry logic with path fix and critical improvements
- [ ] Step 3: (Optional) Configure base path override in config.yml
- [ ] Step 4: Standardize author data format
- [ ] Step 5: Verify changes locally
- [ ] Step 6: Commit changes

### Phase 2: Testing
- [ ] Test Case 1: Local development environment
- [ ] Test Case 2: OAuth timing (cold start)
- [ ] Test Case 3: User not in author mappings
- [ ] Test Case 4: Network failure (authors.json 404)
- [ ] Test Case 5: Backend never initializes
- [ ] Test Case 6: Production deployment (GitHub Pages)
- [ ] Test Case 7: Multiple authors

### Phase 3: Deployment
- [ ] Deploy to staging environment
- [ ] Monitor staging for issues
- [ ] Deploy to production
- [ ] Monitor production for 48 hours
- [ ] Update documentation

---

## Implementation Steps

### Step 1: Create Backup Commit

**Actions**:
```bash
cd /home/rjicha/source/playground/dgkralupy
git add -A
git commit -m "chore: backup before author widget GitHub integration fix

Related: docs/issues/06-author-widget-github-integration-ip.md"
```

**Verification**:
```bash
git log -1 --oneline
# Should show the backup commit
```

**Why**: Enables quick rollback if issues arise

---

### Step 2: Implement Backend Retry Logic with Critical Fixes

**File**: [public/admin/index.html](../../public/admin/index.html)
**Location**: Lines 81-154 (replace entire AuthorControl widget)

**Critical Improvements in this update**:
1. ✅ Memory leak prevention (componentWillUnmount cleanup)
2. ✅ Race condition protection (isLoadingAuthor flag)
3. ✅ Fetch timeout (5 second timeout)
4. ✅ Improved path detection (configurable + robust fallback)
5. ✅ Loading indicator during retry
6. ✅ Named constants for configuration

**Find this code block**:
```javascript
          determineAuthor: function() {
            var self = this;
            
            // Get GitHub user from backend
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

            backend.currentUser().then(function(user) {
              var githubUsername = user && (user.login || user.name);
              
              if (!githubUsername) {
                throw new Error('GitHub uživatel nenalezen');
              }

              self.setState({ githubUser: githubUsername });

              // Fetch author mappings - use correct path for GitHub Pages base
              var authorsPath = '/dgkralupy/content/authors/authors.json';
              return fetch(authorsPath)
                .then(function(response) {
                  if (!response.ok) {
                    throw new Error('Soubor authors.json nenalezen');
                  }
                  return response.json();
                })
                .then(function(data) {
                  // Support both old object format and new array format
                  var mappings = data.mappings || [];
                  var mapping = null;
                  
                  // Try array format first
                  if (Array.isArray(mappings)) {
                    mapping = mappings.find(function(m) {
                      return m.github === githubUsername;
                    });
                  } 
                  // Fallback to object format
                  else if (data.mapping && typeof data.mapping === 'object') {
                    var displayName = data.mapping[githubUsername];
                    if (displayName) {
                      mapping = { displayName: displayName };
                    }
                  }

                  var authorName = mapping ? mapping.displayName : (data.defaultAuthor || 'Redakce');

                  self.setState({
                    author: authorName,
                    error: null
                  });
                  self.props.onChange(authorName);
                });
            }).catch(function(error) {
              console.error('Chyba při načítání autora:', error);
              self.setState({
                author: 'Redakce',
                error: error.message
              });
              self.props.onChange('Redakce');
            });
          },
```

**Replace with**:
```javascript
          // Configuration constants
          RETRY_CONFIG: {
            MAX_ATTEMPTS: 10,
            INITIAL_DELAY_MS: 200,
            BACKOFF_MULTIPLIER: 1.5,
            FETCH_TIMEOUT_MS: 5000
          },

          getInitialState: function() {
            return {
              author: 'Redakce',
              githubUser: null,
              error: null,
              isLoadingAuthor: false,
              retryTimeouts: []
            };
          },

          componentWillUnmount: function() {
            // Critical: cleanup pending timeouts to prevent memory leaks
            if (this.state.retryTimeouts && this.state.retryTimeouts.length > 0) {
              console.log('[Author Widget] Cleaning up ' + this.state.retryTimeouts.length + ' pending timeouts');
              this.state.retryTimeouts.forEach(function(timeoutId) {
                clearTimeout(timeoutId);
              });
            }
          },

          // Helper: Fetch with timeout
          fetchWithTimeout: function(url, timeout) {
            return Promise.race([
              fetch(url),
              new Promise(function(_, reject) {
                setTimeout(function() {
                  reject(new Error('Request timeout'));
                }, timeout);
              })
            ]);
          },

          // Helper: Determine base path for authors.json
          getBasePath: function() {
            // Option 1: Try to read from field config (configurable in config.yml)
            var configuredPath = this.props.field && this.props.field.get('base_path');
            if (configuredPath) {
              console.log('[Author Widget] Using configured base path:', configuredPath);
              return configuredPath;
            }

            // Option 2: Auto-detect based on hostname
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
              console.log('[Author Widget] Detected localhost, using empty base path');
              return '';
            }

            // Option 3: Extract from URL pathname
            var pathParts = window.location.pathname.split('/').filter(function(p) { return p; });
            var adminIndex = pathParts.indexOf('admin');

            if (adminIndex > 0) {
              // Extract everything before 'admin' as base path
              var basePath = '/' + pathParts.slice(0, adminIndex).join('/');
              console.log('[Author Widget] Extracted base path from URL:', basePath);
              return basePath;
            } else if (pathParts.length > 0 && pathParts[0] !== 'admin') {
              // First segment is base path (not 'admin')
              var basePath = '/' + pathParts[0];
              console.log('[Author Widget] Using first path segment as base:', basePath);
              return basePath;
            }

            console.log('[Author Widget] No base path detected, using root');
            return '';
          },

          determineAuthor: function() {
            var self = this;

            // Prevent concurrent execution (race condition protection)
            if (this.state.isLoadingAuthor) {
              console.log('[Author Widget] Author determination already in progress, skipping');
              return;
            }

            this.setState({ isLoadingAuthor: true });

            var maxRetries = this.RETRY_CONFIG.MAX_ATTEMPTS;
            var initialDelay = this.RETRY_CONFIG.INITIAL_DELAY_MS;
            var backoffMultiplier = this.RETRY_CONFIG.BACKOFF_MULTIPLIER;

            function attemptGetBackend(retryCount) {
              var backend = window.CMS && window.CMS.getBackend && window.CMS.getBackend();

              // Check if backend is ready
              if (!backend || !backend.currentUser) {
                if (retryCount < maxRetries) {
                  var delay = initialDelay * Math.pow(backoffMultiplier, retryCount);
                  console.log('[Author Widget] Backend not ready, retrying in ' + Math.round(delay) + 'ms... (' + (retryCount + 1) + '/' + maxRetries + ')');

                  var timeoutId = setTimeout(function() {
                    attemptGetBackend(retryCount + 1);
                  }, delay);

                  // Track timeout for cleanup
                  self.setState(function(prevState) {
                    return {
                      retryTimeouts: prevState.retryTimeouts.concat([timeoutId])
                    };
                  });
                  return;
                } else {
                  console.error('[Author Widget] Backend not available after ' + maxRetries + ' retries');
                  self.setState({
                    author: 'Redakce',
                    error: 'GitHub autentizace nedostupná. Zkontrolujte připojení.',
                    isLoadingAuthor: false
                  });
                  self.props.onChange('Redakce');
                  return;
                }
              }

              // Backend is ready, proceed with author determination
              console.log('[Author Widget] Backend ready, fetching current user');

              backend.currentUser().then(function(user) {
                var githubUsername = user && (user.login || user.name);

                if (!githubUsername) {
                  throw new Error('GitHub uživatel nenalezen');
                }

                console.log('[Author Widget] GitHub user:', githubUsername);
                self.setState({ githubUser: githubUsername });

                // Determine base path dynamically
                var basePath = self.getBasePath();
                var authorsPath = basePath + '/content/authors/authors.json';
                console.log('[Author Widget] Loading authors from:', authorsPath);

                // Fetch author mappings with timeout
                return self.fetchWithTimeout(authorsPath, self.RETRY_CONFIG.FETCH_TIMEOUT_MS)
                  .then(function(response) {
                    if (!response.ok) {
                      throw new Error('Soubor authors.json nenalezen na cestě: ' + authorsPath);
                    }
                    return response.json();
                  })
                  .then(function(data) {
                    // Support both old object format and new array format
                    var mappings = data.mappings || [];
                    var mapping = null;

                    // Try array format first (new format)
                    if (Array.isArray(mappings)) {
                      mapping = mappings.find(function(m) {
                        return m.github === githubUsername;
                      });
                    }
                    // Fallback to object format (old format)
                    else if (data.mapping && typeof data.mapping === 'object') {
                      var displayName = data.mapping[githubUsername];
                      if (displayName) {
                        mapping = { displayName: displayName };
                      }
                    }

                    var authorName = mapping ? mapping.displayName : (data.defaultAuthor || 'Redakce');

                    console.log('[Author Widget] Author mapping:', githubUsername, '→', authorName);

                    self.setState({
                      author: authorName,
                      error: null,
                      isLoadingAuthor: false
                    });
                    self.props.onChange(authorName);
                  });
              }).catch(function(error) {
                console.error('[Author Widget] Error loading author:', error);
                self.setState({
                  author: 'Redakce',
                  error: error.message,
                  isLoadingAuthor: false
                });
                self.props.onChange('Redakce');
              });
            }

            // Start the retry process
            attemptGetBackend(0);
          },

          render: function() {
            var self = this;
            return h('div', {
              className: this.props.classNameWrapper,
              style: { padding: '10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fafafa' }
            },
              h('label', {
                htmlFor: this.props.forID,
                style: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }
              }, 'Autor'),

              h('input', {
                type: 'text',
                id: this.props.forID,
                value: this.state.author,
                readOnly: true,
                style: {
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  fontSize: '14px'
                }
              }),

              // Loading indicator during retry
              this.state.isLoadingAuthor && h('p', {
                style: {
                  marginTop: '8px',
                  marginBottom: '4px',
                  fontSize: '13px',
                  color: '#666',
                  fontStyle: 'italic'
                }
              }, '⏳ Načítání autora z GitHub účtu...'),

              // Status message or error
              h('p', {
                style: {
                  marginTop: '8px',
                  marginBottom: '0',
                  fontSize: '12px',
                  color: this.state.error ? '#c44d58' : '#888'
                }
              },
                this.state.error
                  ? '⚠️ ' + this.state.error
                  : (this.state.githubUser
                      ? 'GitHub účet: ' + this.state.githubUser
                      : 'Autor je nastaven automaticky na základě vašeho GitHub účtu')
              )
            );
          }
```

**Key Changes**:
1. ✅ **Memory leak prevention**: Added `componentWillUnmount` to clean up pending timeouts
2. ✅ **Race condition protection**: Added `isLoadingAuthor` flag to prevent concurrent execution
3. ✅ **Fetch timeout**: Implemented 5-second timeout wrapper for fetch requests
4. ✅ **Improved path detection**: Configurable via field config + robust auto-detection
5. ✅ **Loading indicator**: Visual feedback during retry process
6. ✅ **Named constants**: Configuration values in `RETRY_CONFIG` object
7. ✅ **Enhanced logging**: Prefixed with `[Author Widget]` for easier debugging
8. ✅ **Better error messages**: Clear, user-friendly messages in Czech
9. ✅ **Backward compatibility**: Supports both old and new JSON formats
10. ✅ **Improved UX**: Shows GitHub username and status in widget UI

**Retry Timeline**:
- Attempt 1: 0ms (immediate)
- Attempt 2: 200ms
- Attempt 3: 300ms
- Attempt 4: 450ms
- Attempt 5: 675ms
- Attempt 6: 1012ms
- Attempt 7: 1518ms
- Attempt 8: 2277ms
- Attempt 9: 3416ms
- Attempt 10: 5124ms
- **Total max wait**: ~15 seconds

---

### Step 3: (Optional) Configure Base Path Override

**File**: [public/admin/config.yml](../../public/admin/config.yml)

**When to use this**:
- Complex deployment paths (e.g., nested subdirectories)
- Custom domain with specific routing
- Auto-detection not working correctly
- Want explicit control over path resolution

**Add to the author field configuration**:

```yaml
collections:
  - name: articles
    label: Články
    folder: src/content/articles
    fields:
      - name: author
        label: Autor
        widget: author
        base_path: /dgkralupy  # Optional: explicit base path override
        required: false
```

**Note**: This step is optional. The widget auto-detects paths correctly in most cases. Only configure if:
1. Deployment uses nested paths (e.g., `/sites/school/dgkralupy/`)
2. Auto-detection fails in your environment
3. You want explicit control for clarity

**For standard GitHub Pages deployment at `/dgkralupy/`**: Skip this step, auto-detection works.

---

### Step 4: Standardize Author Data Format

**File**: [public/content/authors/authors.json](../../public/content/authors/authors.json)

**Current Content**:
```json
{
  "mapping": {
    "rjicha": "Radek Jícha"
  },
  "defaultAuthor": "Redakce"
}
```

**Replace with**:
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

**Why**:
- ✅ Matches [src/content/authors/authors.json](../../src/content/authors/authors.json) format
- ✅ More extensible (can add email, avatar, bio later)
- ✅ Consistent across environments
- ✅ Widget already supports both formats (no breaking changes)

**Future extensibility**:
```json
{
  "mappings": [
    {
      "github": "rjicha",
      "displayName": "Radek Jícha",
      "email": "radek@example.com",
      "role": "Staff Engineer",
      "avatar": "/images/authors/rjicha.jpg"
    }
  ],
  "defaultAuthor": "Redakce"
}
```

---

### Step 5: Verify Changes Locally

**Commands**:
```bash
# Check for syntax errors
npm run build

# Start development server
npm run dev
```

**Expected output**:
```
> dgkralupy@1.0.0 dev
> astro dev

  🚀  astro  v4.x.x started in XXXms

  ┃ Local    http://localhost:4321/
  ┃ Network  use --host to expose
```

**Manual Verification Steps**:

1. **Open Admin Interface**:
   - Navigate to: `http://localhost:4321/admin/`
   - Should see Decap CMS login screen

2. **Check Console** (F12 → Console):
   - Look for retry messages: `Backend not ready, retrying...`
   - Look for success: `Loading authors from: /content/authors/authors.json`
   - Look for mapping: `Author mapping: rjicha → Radek Jícha`

3. **Test Author Widget**:
   - Click "New Article" in admin
   - Scroll to "Autor" field
   - Should see your GitHub display name (e.g., "Radek Jícha")
   - Should NOT see "Backend není dostupný" error

4. **Test Article Creation**:
   - Fill in article details
   - Save draft
   - Check that author is preserved

**Expected Console Output**:
```
Backend not ready, retrying in 200ms... (1/10)
Backend not ready, retrying in 300ms... (2/10)
Loading authors from: /content/authors/authors.json
Author mapping: rjicha → Radek Jícha
```

---

### Step 6: Commit Changes

**Commands**:
```bash
git add public/admin/index.html public/content/authors/authors.json
git commit -m "fix: implement GitHub provider integration with critical improvements

Core Fixes:
- Add exponential backoff retry logic (10 attempts, max ~15s)
- Fix hardcoded path issue with dynamic base path detection
- Standardize authors.json format to array-based structure

Critical Improvements:
- Memory leak prevention (componentWillUnmount cleanup)
- Race condition protection (isLoadingAuthor flag)
- Fetch timeout (5s timeout for network requests)
- Loading indicator during retry process
- Configurable base path support via field config

Code Quality:
- Named constants in RETRY_CONFIG
- Helper functions (fetchWithTimeout, getBasePath)
- Enhanced logging with [Author Widget] prefix
- Improved error messages in Czech

Fixes: Backend není dostupný error in author widget
Related: docs/issues/06-author-widget-github-integration-ip.md"
```

**Verification**:
```bash
git log -1 --stat
git diff HEAD~1
```

---

## Testing Plan

### Test Case 1: Local Development Environment

**Environment**: Localhost with `local_backend: true`

**Setup**:
```bash
npm run dev
```

**Steps**:
1. Open `http://localhost:4321/admin/`
2. Should auto-login (local backend mode)
3. Click "New Article"
4. Check author field
5. Monitor console logs

**Expected Results**:
- ✅ Authors.json loaded from `/content/authors/authors.json` (no `/dgkralupy/`)
- ✅ Author field shows "Radek Jícha" (or configured name)
- ✅ No "Backend není dostupný" error
- ✅ Console shows: `Loading authors from: /content/authors/authors.json`
- ✅ Console shows: `Author mapping: rjicha → Radek Jícha`

**Failure Criteria**:
- ❌ Path includes `/dgkralupy/` → Path detection broken
- ❌ Error message appears → Retry logic failed
- ❌ Shows "Redakce" instead of mapped name → Mapping failed

---

### Test Case 2: GitHub OAuth Timing (Cold Start)

**Environment**: Fresh browser session (clear cache)

**Setup**:
```bash
# In browser: Clear all cookies and cache for localhost
# Or use incognito mode
```

**Steps**:
1. Open `http://localhost:4321/admin/` in fresh session
2. Complete GitHub OAuth flow (if prompted)
3. Immediately navigate to "New Article"
4. Watch console for retry messages
5. Check author field after retries complete

**Expected Results**:
- ✅ Console shows retry attempts: `Backend not ready, retrying in XXXms...`
- ✅ Retries stop once backend is ready
- ✅ Author successfully mapped after OAuth completes
- ✅ No permanent error

**Failure Criteria**:
- ❌ No retry attempts logged → Retry logic not running
- ❌ Gives up after 10 retries when backend is available → Timeout too short
- ❌ Never succeeds → OAuth broken

---

### Test Case 3: User Not in Author Mappings

**Environment**: Local development

**Setup**:
1. Temporarily change your GitHub username in code OR
2. Add a test user not in `authors.json`

**Steps**:
1. Open admin
2. Create article
3. Check author field

**Expected Results**:
- ✅ Author field shows "Redakce" (default)
- ✅ No error messages (graceful fallback)
- ✅ Console shows: `Author mapping: unknownuser → Redakce`

**Failure Criteria**:
- ❌ Shows error instead of defaulting
- ❌ Widget crashes
- ❌ No console feedback

---

### Test Case 4: Network Failure (authors.json 404)

**Environment**: Local development

**Setup**:
```bash
# Temporarily rename the file to simulate 404
mv public/content/authors/authors.json public/content/authors/authors.json.backup
```

**Steps**:
1. Restart dev server
2. Open admin
3. Try to create article
4. Check console errors

**Expected Results**:
- ✅ Error message: "Soubor authors.json nenalezen na cestě: /content/authors/authors.json"
- ✅ Author falls back to "Redakce"
- ✅ Error shown in widget UI: "⚠️ Soubor authors.json nenalezen..."
- ✅ Article creation still possible

**Cleanup**:
```bash
mv public/content/authors/authors.json.backup public/content/authors/authors.json
```

**Failure Criteria**:
- ❌ Widget crashes instead of graceful fallback
- ❌ No error message shown to user
- ❌ Cannot create article

---

### Test Case 5: GitHub Backend Never Initializes

**Environment**: Simulated failure

**Setup (Method 1 - Block GitHub API)**:
1. Open browser DevTools → Network tab
2. Right-click in request list → "Block request domain"
3. Add pattern: `*github.com*`
4. Reload admin page

**Setup (Method 2 - Invalid Config)**:
1. Edit `public/admin/config.yml`
2. Change `backend.name` from `'github'` to `'invalid-backend'`
3. Save file and reload admin

**Setup (Method 3 - Delete Cookies)**:
1. Open DevTools → Application → Cookies
2. Delete all cookies for localhost:4321
3. Open DevTools → Console
4. Add breakpoint in CMS initialization to prevent OAuth

**Steps**:
1. Open admin with blocked GitHub/invalid backend
2. Navigate to "New Article" (or refresh if already there)
3. Watch console for retry attempts
4. Count retry messages (should be 10)
5. Verify widget shows loading indicator during retries
6. Check final error state after ~15 seconds
7. Verify article creation is still possible

**Expected Results**:
- ✅ Console shows: `[Author Widget] Backend not ready, retrying...` (10 times)
- ✅ Widget displays: "⏳ Načítání autora z GitHub účtu..." during retries
- ✅ Final console error: `[Author Widget] Backend not available after 10 retries`
- ✅ Widget shows: "⚠️ GitHub autentizace nedostupná. Zkontrolujte připojení."
- ✅ Author field contains "Redakce"
- ✅ Article creation still possible (with default author)
- ✅ No timeouts left running (check with DevTools Performance monitor)

**Failure Criteria**:
- ❌ Infinite retry loop (more than 10 attempts)
- ❌ Widget crashes (JavaScript errors in console)
- ❌ Blocks article creation (save button disabled)
- ❌ Memory leak (timeouts continue after component unmount)

---

### Test Case 6: Production Deployment (GitHub Pages)

**Environment**: Deployed to GitHub Pages at `/dgkralupy/`

**Setup**:
```bash
npm run build
# Deploy to GitHub Pages
```

**Steps**:
1. Open production admin: `https://yoursite.com/dgkralupy/admin/`
2. Login with GitHub OAuth
3. Create article
4. Check author field
5. Monitor browser console

**Expected Results**:
- ✅ Authors.json loaded from `/dgkralupy/content/authors/authors.json`
- ✅ Console shows correct path: `Loading authors from: /dgkralupy/content/authors/authors.json`
- ✅ Author correctly mapped
- ✅ No 404 errors

**Failure Criteria**:
- ❌ Path doesn't include `/dgkralupy/` → Path detection failed
- ❌ 404 on authors.json → Wrong path
- ❌ Falls back to "Redakce" incorrectly

---

### Test Case 7: Multiple Authors

**Environment**: Local development

**Setup**:
Update `public/content/authors/authors.json`:
```json
{
  "mappings": [
    {
      "github": "rjicha",
      "displayName": "Radek Jícha"
    },
    {
      "github": "testuser",
      "displayName": "Test User"
    },
    {
      "github": "jannovak",
      "displayName": "Jan Novák"
    }
  ],
  "defaultAuthor": "Redakce"
}
```

**Steps**:
1. Login as each GitHub user (if possible) OR
2. Temporarily hardcode different usernames to test mapping
3. Verify each maps correctly

**Expected Results**:
- ✅ Each GitHub username maps to correct display name
- ✅ Array.find() correctly locates matching entry

---

## Code Review Checklist

### Correctness
- [ ] Retry logic uses exponential backoff (not linear): `200 * 1.5^n`
- [ ] Maximum retry count is reasonable (10 attempts = ~15s max)
- [ ] Timeout calculation includes `Math.round()` for clean logging
- [ ] Backend readiness check includes both `backend` and `backend.currentUser`
- [ ] Path detection correctly handles localhost (empty base path)
- [ ] Path detection correctly extracts `/dgkralupy/` from production URL
- [ ] Path detection finds 'admin' index and extracts path before it
- [ ] Path detection supports configurable `base_path` from field config
- [ ] Both JSON formats supported (object and array)
- [ ] Error messages are user-friendly and in Czech
- [ ] Console logging is informative and prefixed with `[Author Widget]`

### Code Quality
- [ ] Follows existing code style (ES5, no arrow functions)
- [ ] Uses `createClass` syntax (compatible with Decap CMS 3.x)
- [ ] Uses `h()` function for DOM elements
- [ ] Proper error handling with try-catch in promises
- [ ] No breaking changes to existing functionality
- [ ] Backward compatible with old JSON format
- [ ] Clear variable names (e.g., `attemptGetBackend`, `basePath`, `isLoadingAuthor`)
- [ ] Well-commented for future maintenance
- [ ] Configuration values extracted to `RETRY_CONFIG` constant
- [ ] Helper functions properly scoped (`fetchWithTimeout`, `getBasePath`)

### Robustness
- [ ] **Memory leak prevention**: `componentWillUnmount` cleans up timeouts
- [ ] **Race condition prevention**: `isLoadingAuthor` flag prevents concurrent calls
- [ ] **Fetch timeout**: 5-second timeout implemented via `Promise.race()`
- [ ] Handles OAuth timing edge cases
- [ ] Handles network failures gracefully
- [ ] Handles missing authors.json
- [ ] Handles user not in mappings
- [ ] Handles backend never initializing
- [ ] Handles malformed JSON gracefully
- [ ] Handles fetch timeout (slow networks)
- [ ] No infinite loops
- [ ] No race conditions
- [ ] No memory leaks (timeouts tracked and cleaned up)
- [ ] Component cleanup on unmount

### User Experience
- [ ] **Loading indicator**: Shows "⏳ Načítání autora..." during retry
- [ ] **GitHub username display**: Shows detected GitHub user in status
- [ ] Clear progress indication (console logs with timestamps)
- [ ] Informative error messages with actionable text
- [ ] Graceful fallback to default author
- [ ] No blocking UI during retries
- [ ] Article creation still possible even with errors
- [ ] Error messages in user's language (Czech)
- [ ] Visual distinction between loading, error, and success states

---

## Rollback Plan

### If Critical Issues Arise

**Option 1: Git Revert (Recommended)**

```bash
# Show recent commits
git log --oneline -5

# Revert the fix commit
git revert <commit-hash>

# Push revert
git push origin main

# Rebuild and redeploy
npm run build
```

**Verification**:
```bash
git diff HEAD~1 public/admin/index.html
# Should show revert changes
```

---

### Option 2: Manual Rollback

**Restore Original Files**:

1. **public/admin/index.html** - Restore old `determineAuthor` function:
```javascript
determineAuthor: function() {
  var self = this;
  
  // Get GitHub user from backend
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

  backend.currentUser().then(function(user) {
    var githubUsername = user && (user.login || user.name);
    
    if (!githubUsername) {
      throw new Error('GitHub uživatel nenalezen');
    }

    self.setState({ githubUser: githubUsername });

    var authorsPath = '/dgkralupy/content/authors/authors.json';
    return fetch(authorsPath)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Soubor authors.json nenalezen');
        }
        return response.json();
      })
      .then(function(data) {
        var mappings = data.mappings || [];
        var mapping = null;
        
        if (Array.isArray(mappings)) {
          mapping = mappings.find(function(m) {
            return m.github === githubUsername;
          });
        } 
        else if (data.mapping && typeof data.mapping === 'object') {
          var displayName = data.mapping[githubUsername];
          if (displayName) {
            mapping = { displayName: displayName };
          }
        }

        var authorName = mapping ? mapping.displayName : (data.defaultAuthor || 'Redakce');

        self.setState({
          author: authorName,
          error: null
        });
        self.props.onChange(authorName);
      });
  }).catch(function(error) {
    console.error('Chyba při načítání autora:', error);
    self.setState({
      author: 'Redakce',
      error: error.message
    });
    self.props.onChange('Redakce');
  });
}
```

2. **public/content/authors/authors.json** - Restore old format (if needed):
```json
{
  "mapping": {
    "rjicha": "Radek Jícha"
  },
  "defaultAuthor": "Redakce"
}
```

**Commit Rollback**:
```bash
git add public/admin/index.html public/content/authors/authors.json
git commit -m "revert: rollback author widget GitHub integration fix

Reverting to previous version due to [specific issue]
Related: docs/issues/06-author-widget-github-integration-ip.md"
git push origin main
```

---

### Option 3: Hotfix Adjustments

**If only minor issues** (e.g., retry count too high):

**Adjust retry parameters**:
```javascript
// Reduce max retries
var maxRetries = 5;  // Instead of 10

// Or reduce delay multiplier
var delay = initialDelay * Math.pow(1.2, retryCount);  // Instead of 1.5
```

**Adjust timeout**:
```javascript
// Increase delay for slower networks
var initialDelay = 500;  // Instead of 200
```

---

## Success Criteria

### Must Have ✅

**Functional Requirements**:
- [ ] No "Backend není dostupný" error when GitHub OAuth succeeds
- [ ] GitHub username correctly maps to display name from authors.json
- [ ] Works in local development environment (localhost)
- [ ] Works in production deployment (GitHub Pages with base path)
- [ ] Graceful fallback to "Redakce" when:
  - User not authenticated
  - User not in mappings
  - authors.json not found
  - Network error
  - Fetch timeout

**Technical Requirements**:
- [ ] Retry logic attempts up to 10 times with exponential backoff
- [ ] **Memory leak prevention**: Timeouts cleaned up on component unmount
- [ ] **Race condition prevention**: Concurrent calls blocked via `isLoadingAuthor`
- [ ] **Fetch timeout**: 5-second timeout implemented
- [ ] Path detection works on localhost (no base path)
- [ ] Path detection works on GitHub Pages (`/dgkralupy/`)
- [ ] Path detection handles nested deployments (e.g., `/sites/school/`)
- [ ] Path detection supports configurable override via field config
- [ ] Both JSON formats supported (backward compatible)

**User Experience**:
- [ ] **Loading indicator**: Shows "⏳ Načítání autora..." during retry
- [ ] **GitHub username display**: Shows detected user in widget
- [ ] Clear error messages in Czech
- [ ] Helpful console logging with `[Author Widget]` prefix
- [ ] No blocking UI during retries
- [ ] Article creation possible even with errors
- [ ] Visual distinction between loading, error, and success states

---

### Nice to Have ⭐

**Future Enhancements** (Post-implementation):
- [ ] Admin panel showing backend connection status dashboard
- [ ] Configurable retry parameters in config.yml (currently hardcoded in `RETRY_CONFIG`)
- [ ] Event-based initialization (listen for CMS ready event instead of polling)
- [ ] Automatic path detection testing in CI/CD
- [ ] User avatar display from GitHub API
- [ ] Multiple author support per article (co-authors)
- [ ] Author bio/description from authors.json
- [ ] Caching layer for authors.json (5-minute TTL recommended)

---

## Post-Implementation Tasks

### Immediate (Same Day)
- [ ] Deploy to staging environment
- [ ] Run full test suite on staging
- [ ] Monitor browser console for unexpected errors
- [ ] Verify author mapping with real GitHub OAuth

### Short-term (Within 1 Week)
- [ ] Deploy to production
- [ ] Monitor for errors in production (first 48 hours)
- [ ] Update [AUTHOR_WIDGET_ASSESSMENT.md](AUTHOR_WIDGET_ASSESSMENT.md) status to "Resolved"
- [ ] Document retry mechanism in [CUSTOM_WIDGETS_REFACTORING.md](../CUSTOM_WIDGETS_REFACTORING.md)
- [ ] Add retry pattern as best practice example

### Long-term (Within 1 Month)
- [ ] Create PR with detailed description if using feature branches
- [ ] Add unit tests for retry logic (if test framework available)
- [ ] Consider implementing Phase 2 enhancements
- [ ] Review error logs for edge cases
- [ ] Gather user feedback from content editors

---

## Risk Assessment

### Overall Risk Level: **LOW-MEDIUM**

| Risk | Likelihood | Impact | Severity | Mitigation |
|------|-----------|--------|----------|------------|
| Retry logic delays widget loading | Medium | Low | Low | Max 15s only on failure; immediate on success |
| Path detection fails on edge case | Low | Medium | Low-Med | Extensive logging helps debug; multiple fallbacks |
| OAuth never completes | Low | Medium | Low-Med | Clear error after retries; defaults to "Redakce" |
| Breaking existing author data | Very Low | High | Low | Widget supports both formats; backward compatible |
| Performance impact on slow networks | Medium | Low | Low | Exponential backoff prevents excessive requests |
| Race condition with CMS init | Low | Low | Low | Retry logic handles timing; no hard dependency |

### Risk Mitigation Strategies

**For High-Likelihood Risks**:
1. **Retry delays**: Set reasonable max (15s) to avoid excessive wait
2. **Performance**: Use exponential backoff, not linear

**For High-Impact Risks**:
1. **Data format breaking**: Support both old and new formats
2. **Path detection**: Extensive logging; test in all environments

**For Medium Risks**:
1. **OAuth timing**: Retry mechanism handles this specifically
2. **Network issues**: Graceful fallback to default author

---

## Dependencies

### External Dependencies
- ✅ **Decap CMS 3.x**: Already installed and configured
- ✅ **GitHub OAuth**: Configured in [config.yml](../../public/admin/config.yml)
- ✅ **authors.json**: File exists in repository
- ✅ **Browser ES5 support**: All modern browsers compatible

### Internal Dependencies
- ✅ **Widget registration**: Already working (no changes needed)
- ✅ **CMS backend API**: Available via `window.CMS.getBackend()`
- ✅ **Preact/h() function**: Available globally in Decap CMS
- ✅ **createClass syntax**: Required by Decap CMS 3.x

### Development Dependencies
- Node.js & npm (for build)
- Astro dev server (for testing)
- Browser DevTools (for debugging)

---

## Timeline Estimate

### Development Phase
- **Code implementation**: 20 minutes
- **Local testing**: 15 minutes
- **Code review (self)**: 10 minutes
- **Subtotal**: ~45 minutes

### Testing Phase
- **Test Case 1-3**: 15 minutes
- **Test Case 4-5**: 10 minutes
- **Test Case 6-7**: 20 minutes (if production available)
- **Subtotal**: ~45 minutes

### Deployment Phase
- **Staging deployment**: 10 minutes
- **Production deployment**: 10 minutes
- **Post-deployment monitoring**: 30 minutes
- **Subtotal**: ~50 minutes

### **Total Estimated Time**: 2-3 hours (including buffer)

---

## References

### Related Documentation
- [AUTHOR_WIDGET_ASSESSMENT.md](AUTHOR_WIDGET_ASSESSMENT.md) - Detailed root cause analysis
- [CUSTOM_WIDGETS_REFACTORING.md](../CUSTOM_WIDGETS_REFACTORING.md) - Widget development guide
- [DOCUMENT_TYPES.md](../DOCUMENT_TYPES.md) - Documentation standards

### External Resources
- [Decap CMS Backend API](https://decapcms.org/docs/backends-overview/) - GitHub integration
- [Decap CMS Custom Widgets](https://decapcms.org/docs/custom-widgets/) - Widget development
- [Preact API Reference](https://preactjs.com/guide/v10/api-reference/) - createClass syntax

### Code Files
- [public/admin/index.html](../../public/admin/index.html) - Widget implementation
- [public/admin/config.yml](../../public/admin/config.yml) - CMS configuration
- [public/content/authors/authors.json](../../public/content/authors/authors.json) - Author mappings (production)
- [src/content/authors/authors.json](../../src/content/authors/authors.json) - Author mappings (source)

---

## Appendix

### A. Retry Timeline Calculation

Exponential backoff formula: `delay = initialDelay * multiplier^retryCount`

| Attempt | Delay (ms) | Cumulative Time (ms) | Time from Start |
|---------|-----------|---------------------|-----------------|
| 1 | 0 | 0 | 0s |
| 2 | 200 | 200 | 0.2s |
| 3 | 300 | 500 | 0.5s |
| 4 | 450 | 950 | 1.0s |
| 5 | 675 | 1625 | 1.6s |
| 6 | 1012 | 2637 | 2.6s |
| 7 | 1518 | 4155 | 4.2s |
| 8 | 2277 | 6432 | 6.4s |
| 9 | 3416 | 9848 | 9.8s |
| 10 | 5124 | 14972 | 15.0s |

**Max wait time**: ~15 seconds (only triggered if backend never initializes)

---

### B. Path Detection Logic Flow

```
1. Check field config
   ├─ base_path configured in config.yml?
   │  └─ YES → basePath = configured value (skip auto-detection)
   └─ NO → Continue to step 2

2. Check hostname
   ├─ localhost or 127.0.0.1?
   │  └─ YES → basePath = '' (empty)
   └─ NO → Continue to step 3

3. Parse URL pathname
   Example: https://example.com/dgkralupy/admin/
   pathname = '/dgkralupy/admin/'

4. Split by '/' and filter empty strings
   Result: ['dgkralupy', 'admin']

5. Find 'admin' in path segments
   ├─ Found at index 0? → basePath = '' (admin is at root)
   ├─ Found at index > 0?
   │  └─ basePath = '/' + segments[0..adminIndex-1].join('/')
   │     Example: ['dgkralupy', 'admin'] → adminIndex=1 → basePath = '/dgkralupy'
   └─ Not found AND segments not empty?
      └─ basePath = '/' + segments[0] (first segment is base)

6. Construct final path
   authorsPath = basePath + '/content/authors/authors.json'
```

**Examples**:

| URL | Path Segments | Admin Index | Base Path | Final Path |
|-----|--------------|-------------|-----------|------------|
| `http://localhost:4321/admin/` | `['admin']` | 0 | `''` | `/content/authors/authors.json` |
| `https://example.com/dgkralupy/admin/` | `['dgkralupy', 'admin']` | 1 | `'/dgkralupy'` | `/dgkralupy/content/authors/authors.json` |
| `https://dgkralupy.cz/admin/` | `['admin']` | 0 | `''` | `/content/authors/authors.json` |
| `https://example.com/admin/` | `['admin']` | 0 | `''` | `/content/authors/authors.json` |
| `https://example.com/sites/school/admin/` | `['sites', 'school', 'admin']` | 2 | `'/sites/school'` | `/sites/school/content/authors/authors.json` |
| `https://example.com/cs/dgkralupy/admin/` | `['cs', 'dgkralupy', 'admin']` | 2 | `'/cs/dgkralupy'` | `/cs/dgkralupy/content/authors/authors.json` |

**Configurable Override** (recommended for complex deployments):
```yaml
# In public/admin/config.yml
collections:
  - name: articles
    fields:
      - name: author
        label: Autor
        widget: author
        base_path: /dgkralupy  # Explicit override
```

---

### C. JSON Format Comparison

**Old Format (Object-based)**:
```json
{
  "mapping": {
    "user1": "Display Name 1",
    "user2": "Display Name 2"
  },
  "defaultAuthor": "Redakce"
}
```

**New Format (Array-based)**:
```json
{
  "mappings": [
    {
      "github": "user1",
      "displayName": "Display Name 1"
    },
    {
      "github": "user2",
      "displayName": "Display Name 2"
    }
  ],
  "defaultAuthor": "Redakce"
}
```

**Benefits of New Format**:
- ✅ Extensible (can add more fields per user)
- ✅ Type-safe (clear field names)
- ✅ Easier to validate
- ✅ Supports future features (email, avatar, role, etc.)

**Widget Support**:
The widget code handles both formats automatically:
```javascript
// Try array format first
if (Array.isArray(mappings)) {
  mapping = mappings.find(function(m) {
    return m.github === githubUsername;
  });
} 
// Fallback to object format
else if (data.mapping && typeof data.mapping === 'object') {
  var displayName = data.mapping[githubUsername];
  if (displayName) {
    mapping = { displayName: displayName };
  }
}
```

---

## Review History

### Staff Engineer Review - 2025-12-22

**Reviewer**: Claude Sonnet 4.5 (Staff Engineer persona)
**Review Status**: ✅ Approved with Critical Fixes Applied

**Critical Issues Addressed**:
1. ✅ **Memory Leak Prevention**: Added `componentWillUnmount` cleanup
2. ✅ **Race Condition Protection**: Added `isLoadingAuthor` flag
3. ✅ **Fetch Timeout**: Implemented 5-second timeout wrapper
4. ✅ **Path Detection**: Improved with configurable option + robust fallback
5. ✅ **Loading Indicator**: Added visual feedback during retry

**Code Quality Improvements**:
- Named constants extracted to `RETRY_CONFIG`
- Helper functions created (`fetchWithTimeout`, `getBasePath`)
- Enhanced logging with `[Author Widget]` prefix
- Improved render method with better UX

**Documentation Updates**:
- Added Implementation Phases tracking
- Updated Test Case 5 with specific setup instructions
- Corrected Appendix B path detection flow
- Enhanced Code Review Checklist with new items
- Added configuration override example for complex deployments

**Risk Assessment**: Risk level remains **LOW-MEDIUM** after fixes

---

**Status**: ✅ Ready for Implementation (Critical Fixes Applied)
**Next Step**: Execute Phase 1, Step 1 (Create Backup Commit)
**Approval Required**: No (self-contained fix with clear scope, reviewed and approved)

---

*Document generated: 2025-12-22*
*Last updated: 2025-12-22 (Staff Engineer Review)*
*Implementation Plan ID: 06*
