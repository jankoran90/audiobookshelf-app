const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['components/**/*.vue', 'layouts/**/*.vue', 'pages/**/*.vue', 'mixins/**/*.js', 'plugins/**/*.js'],
  theme: {
    extend: {
      screens: {
        short: { raw: '(max-height: 500px)' }
      },
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        'bg-hover': 'rgb(var(--color-bg-hover) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--color-fg-muted) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'bg-toggle': 'rgb(var(--color-bg-toggle) / <alpha-value>)',
        'bg-toggle-selected': 'rgb(var(--color-bg-toggle-selected) / <alpha-value>)',
        'track-cursor': 'rgb(var(--color-track-cursor) / <alpha-value>)',
        track: 'rgb(var(--color-track) / <alpha-value>)',
        'track-buffered': 'rgb(var(--color-track-buffered) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        successDark: '#3b8a3e',
        warning: 'rgb(var(--color-warning) / <alpha-value>)'
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        DEFAULT: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        'lg-up': 'var(--shadow-lg-up)',
        xl: 'var(--shadow-xl)',
        book: 'var(--shadow-book)',
        player: 'var(--shadow-player)'
      },
      cursor: {
        none: 'none'
      },
      fontFamily: {
        sans: ['Source Sans Pro', ...defaultTheme.fontFamily.sans],
        mono: ['Ubuntu Mono', ...defaultTheme.fontFamily.mono]
      },
      fontSize: {
        '1.5xl': '1.375rem',
        xxs: '0.625rem'
      },
      spacing: {
        18: '4.5rem'
      },
      height: {
        18: '4.5rem'
      },
      maxWidth: {
        24: '6rem'
      },
      minWidth: {
        4: '1rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem'
      },
      minHeight: {
        12: '3rem'
      }
    }
  },
  plugins: []
}
