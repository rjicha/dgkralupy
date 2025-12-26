# Author Widget

**Status:** Production Ready

---

## Overview

Auto-populates the author field when creating new articles by reading the logged-in GitHub user and mapping to a display name.

**Example:**
- GitHub user: `rjicha`
- Auto-filled: `Radek Jícha`

---

## How It Works

```javascript
// 1. Get user from localStorage
const userData = JSON.parse(localStorage.getItem('decap-cms-user'));

// 2. Extract GitHub username
const username = userData.login;

// 3. Fetch mapping
fetch('/dgkralupy/authors.json')
  .then(r => r.json())
  .then(data => {
    const mapping = data.mappings.find(m => m.github === username);
    const authorName = mapping.displayName;
  });
```

**Technical details:** [../DECAP-CMS-LOCALSTORAGE.md](../DECAP-CMS-LOCALSTORAGE.md)

---

## Configuration

### `public/admin/config.yml`

```yaml
backend:
  name: github
  repo: rjicha/dgkralupy
  branch: main
  base_url: https://dgkralupy-stg.radekjicha.workers.dev

local_backend: false  # Required for user data
```

### Files Required

1. `public/admin/index.html` - Widget code
2. `public/authors.json` - Username mapping
3. `public/admin/config.yml` - CMS config

---

## Adding Authors

Edit `public/authors.json`:

```json
{
  "mappings": [
    { "github": "rjicha", "displayName": "Radek Jícha" },
    { "github": "teacher2", "displayName": "Teacher Name" }
  ],
  "defaultAuthor": "Redakce"
}
```

---

## Usage

### New Article
1. Log in with GitHub
2. Click "New Články"
3. Author auto-fills ✅

### Existing Article
- Shows original author (not changed)
- Only auto-fills for **new** articles

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Shows "Redakce" | Verify logged in (check avatar) |
| Still "Redakce" | Check `local_backend: false` |
| 404 authors.json | File must be in `public/` |
| Doesn't work | Test on **NEW** article |

---

## Testing

```javascript
// Check if logged in
localStorage.getItem('decap-cms-user')  // Should return JSON

// Check widget registered
window.CMS.getWidget('author')  // Should return object

// Check mapping file
fetch('/dgkralupy/authors.json').then(r => r.json())
```

---

## Related

- [../DECAP-CMS-LOCALSTORAGE.md](../DECAP-CMS-LOCALSTORAGE.md) - localStorage mechanism
- [widget-development.md](./widget-development.md) - Widget dev guide
