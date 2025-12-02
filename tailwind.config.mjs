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
        // Typography scale matching current site
        'xs': '0.7rem',    // 11.2px - metadata, footer
        'sm': '0.8rem',    // 12.8px - body, breadcrumb
        'base': '0.9rem',  // 14.4px - dropdown
        'lg': '1.05rem',   // 16.8px - navbar
        'xl': '1.3rem',    // 20.8px - h4
        '2xl': '1.5rem',   // 24px - h3
        '3xl': '1.7rem',   // 27.2px - h2
        '4xl': '2rem',     // 32px - h1
      },
      fontWeight: {
        thin: '100',
        light: '300',
        normal: '400',
        bold: '700',
      },
    },
  },
  plugins: [],
};
