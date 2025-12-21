// Custom widget that auto-populates author from logged-in GitHub user
(async function registerAuthorWidget() {
  // Wait for CMS to be available
  if (!window.CMS) {
    console.log('Author widget: Waiting for Decap CMS to load...');
    setTimeout(registerAuthorWidget, 100);
    return;
  }

  console.log('Registering author-auto widget...');
  const { h, Component } = window.CMS;

  // Fetch author mappings
  let authorsData = { mapping: {}, defaultAuthor: "Redakce" };
  try {
    const response = await fetch('/dgkralupy/content/authors/authors.json');
    authorsData = await response.json();
  } catch (e) {
    console.warn('Could not load author mappings, using defaults', e);
  }

  class AuthorControl extends Component {
    componentDidMount() {
      // Auto-populate only if field is empty
      if (!this.props.value) {
        this.setAuthorFromCurrentUser();
      }
    }

    setAuthorFromCurrentUser() {
      // Try to get current user from window context
      // Decap CMS exposes this after login
      const getUserInfo = () => {
        try {
          // Check if netlifyIdentity or CMS user is available
          if (window.netlifyIdentity?.currentUser) {
            return window.netlifyIdentity.currentUser();
          }
          // Fallback: try to access from CMS internal state
          const cmsApp = document.querySelector('[class*="CMS"]');
          if (cmsApp && cmsApp.__reactInternalInstance$) {
            // React internal access (fragile, but sometimes necessary)
            const fiber = cmsApp._reactRootContainer?._internalRoot?.current;
            // Navigate fiber tree to find user context
            // This is CMS version-dependent
          }
          return null;
        } catch (e) {
          console.error('Error getting user info:', e);
          return null;
        }
      };

      const user = getUserInfo();
      const githubUsername = user?.user_metadata?.preferred_username ||
                            user?.login ||
                            user?.user_metadata?.full_name;

      const displayName = githubUsername && authorsData.mapping[githubUsername]
        ? authorsData.mapping[githubUsername]
        : authorsData.defaultAuthor;

      this.props.onChange(displayName);
    }

    handleChange = (e) => {
      this.props.onChange(e.target.value);
    }

    render() {
      return h('div', { className: 'nc-controlPane-control' },
        h('input', {
          id: this.props.forID,
          className: 'nc-input',
          type: 'text',
          value: this.props.value || '',
          onChange: this.handleChange,
          placeholder: authorsData.defaultAuthor
        })
      );
    }
  }

  const AuthorPreview = ({ value }) =>
    h('div', {}, value || 'Autor nebyl zadán');

  window.CMS.registerWidget('author-auto', AuthorControl, AuthorPreview);
  console.log('✓ author-auto widget registered successfully');
})();
