// Author attribution widget
// Automatically sets author based on logged-in GitHub user
// Uses modern React component (Decap CMS 3.x compatible)

(function() {
  'use strict';

  const { h, Component } = window.preactRuntimeExports || window;

  class AuthorControl extends Component {
    constructor(props) {
      super(props);
      this.state = {
        author: 'Načítání...',
        githubUser: null,
        error: null
      };
    }

    componentDidMount() {
      this.determineAuthor();
    }

    async determineAuthor() {
      try {
        // Get backend instance from CMS
        const backend = this.props.field.get('backend') || window.CMS.getBackend();

        // Get current user
        const user = await backend.currentUser();
        const githubUsername = user?.login || user?.name;

        if (!githubUsername) {
          throw new Error('Unable to determine GitHub username');
        }

        this.setState({ githubUser: githubUsername });

        // Fetch author mappings from settings
        const response = await fetch('/content/settings/authors.json');
        if (!response.ok) {
          throw new Error('Failed to fetch author mappings');
        }

        const authors = await response.json();

        // Find mapping for current user
        const mapping = authors.mappings.find(
          m => m.github === githubUsername
        );

        const displayName = mapping ? mapping.displayName : 'Redakce';

        this.setState({
          author: displayName,
          error: null
        });
        this.props.onChange(displayName);

      } catch (error) {
        console.error('Failed to determine author:', error);
        this.setState({
          author: 'Redakce',
          error: error.message
        });
        this.props.onChange('Redakce');
      }
    }

    render() {
      const { author, githubUser, error } = this.state;

      return h(
        'div',
        { className: 'author-widget', style: styles.container },

        // Author display
        h('p', { style: styles.authorName }, author),

        // GitHub username
        githubUser && h(
          'p',
          { style: styles.githubInfo },
          `GitHub: ${githubUser}`
        ),

        // Help text
        h(
          'p',
          { style: styles.helpText },
          'Autor je nastaven automaticky na základě vašeho GitHub účtu'
        ),

        // Error message (if any)
        error && h(
          'p',
          { style: styles.error },
          `⚠️ ${error}`
        )
      );
    }
  }

  class AuthorPreview extends Component {
    render() {
      return h(
        'div',
        {},
        h('strong', {}, 'Autor: '),
        this.props.value || 'Redakce'
      );
    }
  }

  // Styles
  const styles = {
    container: {
      padding: '12px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      border: '1px solid #ddd'
    },
    authorName: {
      margin: '8px 0',
      fontWeight: 500,
      fontSize: '14px',
      color: '#333'
    },
    githubInfo: {
      margin: '4px 0',
      fontSize: '12px',
      color: '#666'
    },
    helpText: {
      margin: '4px 0',
      fontSize: '11px',
      color: '#999'
    },
    error: {
      margin: '8px 0 4px',
      fontSize: '12px',
      color: '#c00'
    }
  };

  // Register widget when CMS is ready
  window.CMS.registerWidget('author', AuthorControl, AuthorPreview);
})();
