/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand colors extracted from www.dgkralupy.cz
        primary: {
          DEFAULT: '#3b5f78', // Blue-gray - main brand color
          dark: '#273946',    // Dark blue-gray - navbar background
        },
        secondary: '#44c2c4', // Cyan/turquoise
        accent: {
          green: '#bfcc34',   // Lime green
          coral: '#ff6b6b',   // Coral/red
          rose: '#c44d58',    // Rose/pink - links and highlights
        },
        // Text colors
        text: {
          primary: '#000000',   // Black
          secondary: '#3b3b3b', // Dark gray
          muted: '#a09f9f',     // Gray for metadata
        },
        // Background colors
        bg: {
          page: '#f0f0f0',    // Light gray page background
          content: '#ffffff', // White content boxes
        },
        // Border colors
        border: {
          light: '#efefef',   // Very light gray
          DEFAULT: '#cccccc', // Medium gray
          dark: '#999999',    // Darker gray
        },
      },
      fontFamily: {
        // Actual fonts from www.dgkralupy.cz (Google Fonts with latin-ext for Czech)
        sans: ['"Open Sans"', 'Arial', 'sans-serif'],
        heading: ['"Roboto"', 'sans-serif'],
      },
      fontSize: {
        // Improved typography scale for better readability
        'xs': '0.75rem',   // 12px - metadata, footer
        'sm': '0.875rem',  // 14px - small text, breadcrumb
        'base': '1rem',    // 16px - body text (web standard)
        'lg': '1.125rem',  // 18px - large body text
        'xl': '1.25rem',   // 20px - h4
        '2xl': '1.5rem',   // 24px - h3
        '3xl': '1.875rem', // 30px - h2
        '4xl': '2.25rem',  // 36px - h1
        '5xl': '3rem',     // 48px - hero titles
      },
      lineHeight: {
        'tight': '1.25',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '1.75',
      },
      fontWeight: {
        thin: '100',
        light: '300',
        normal: '400',
        bold: '700',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            // Base text styling
            color: theme('colors.text.secondary'),
            fontSize: theme('fontSize.base'),
            lineHeight: theme('lineHeight.relaxed'),

            // Headings
            'h1, h2, h3, h4, h5, h6': {
              color: theme('colors.text.primary'),
              fontFamily: theme('fontFamily.heading').join(', '),
              fontWeight: theme('fontWeight.thin'),
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
            },
            h1: {
              fontSize: theme('fontSize.4xl'),
              marginTop: '0',
              marginBottom: theme('spacing.6'),
              paddingBottom: theme('spacing.4'),
              borderBottomWidth: '2px',
              borderBottomColor: theme('colors.accent.coral'),
            },
            h2: {
              fontSize: theme('fontSize.3xl'),
              marginTop: theme('spacing.12'),
              marginBottom: theme('spacing.4'),
              paddingBottom: theme('spacing.2'),
              borderBottomWidth: '2px',
              borderBottomColor: theme('colors.secondary'),
            },
            h3: {
              fontSize: theme('fontSize.2xl'),
              marginTop: theme('spacing.8'),
              marginBottom: theme('spacing.3'),
            },
            h4: {
              fontSize: theme('fontSize.xl'),
              marginTop: theme('spacing.6'),
              marginBottom: theme('spacing.2'),
            },

            // Paragraphs
            p: {
              marginTop: '0',
              marginBottom: theme('spacing.6'), // Good spacing between paragraphs
              lineHeight: theme('lineHeight.relaxed'),
            },

            // Links
            a: {
              color: theme('colors.accent.rose'),
              textDecoration: 'none',
              fontWeight: theme('fontWeight.normal'),
              '&:hover': {
                textDecoration: 'underline',
                color: theme('colors.accent.coral'),
              },
            },

            // Strong/Bold
            strong: {
              color: theme('colors.text.primary'),
              fontWeight: theme('fontWeight.bold'),
            },

            // Lists
            'ul, ol': {
              marginTop: theme('spacing.4'),
              marginBottom: theme('spacing.6'),
              paddingLeft: theme('spacing.6'),
            },
            li: {
              marginTop: theme('spacing.2'),
              marginBottom: theme('spacing.2'),
              lineHeight: theme('lineHeight.relaxed'),
            },
            'li p': {
              marginTop: theme('spacing.2'),
              marginBottom: theme('spacing.2'),
            },

            // Blockquotes
            blockquote: {
              fontStyle: 'italic',
              color: theme('colors.text.secondary'),
              borderLeftWidth: '4px',
              borderLeftColor: theme('colors.secondary'),
              paddingLeft: theme('spacing.4'),
              marginTop: theme('spacing.6'),
              marginBottom: theme('spacing.6'),
            },

            // Code blocks
            code: {
              color: theme('colors.accent.rose'),
              backgroundColor: theme('colors.bg.page'),
              padding: '0.2em 0.4em',
              borderRadius: theme('borderRadius.sm'),
              fontSize: '0.9em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },

            // Tables
            table: {
              width: '100%',
              marginTop: theme('spacing.6'),
              marginBottom: theme('spacing.6'),
            },
            'th, td': {
              padding: theme('spacing.3'),
              borderWidth: '1px',
              borderColor: theme('colors.border.DEFAULT'),
            },
            th: {
              backgroundColor: theme('colors.bg.page'),
              fontWeight: theme('fontWeight.bold'),
              textAlign: 'left',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
