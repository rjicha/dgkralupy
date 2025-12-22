/**
 * createReactClass Polyfill
 *
 * Creates a polyfill for createReactClass using modern React class components.
 * This allows legacy Decap CMS widget code to work with React 16+.
 *
 * @see https://reactjs.org/docs/react-without-es6.html
 */

/* global React */

// Create a polyfill for createReactClass using modern React
window.createReactClass = function(spec) {
  return class extends React.Component {
    constructor(props) {
      super(props);

      // Initialize state from getInitialState
      if (spec.getInitialState) {
        this.state = spec.getInitialState.call(this);
      } else {
        this.state = {};
      }

      // Bind all methods to this instance
      Object.keys(spec).forEach(key => {
        if (typeof spec[key] === 'function' &&
            key !== 'render' &&
            key !== 'getInitialState' &&
            !key.startsWith('component')) {
          this[key] = spec[key].bind(this);
        }
      });

      // Handle lifecycle methods
      const lifecycleMethods = [
        'componentDidMount',
        'componentDidUpdate',
        'componentWillUnmount',
        'shouldComponentUpdate',
        'getSnapshotBeforeUpdate'
      ];

      lifecycleMethods.forEach(method => {
        if (spec[method]) {
          this[method] = spec[method].bind(this);
        }
      });
    }

    render() {
      return spec.render.call(this);
    }
  };
};

console.log('✓ createReactClass polyfill loaded');
