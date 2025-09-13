/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Ubuntu/Yaru color palette
        ubuntu: {
          orange: '#E95420',
          'orange-light': '#F47068',
          'orange-dark': '#C7431B',
          purple: '#772953',
          'purple-light': '#AEA79F',
          'purple-dark': '#2C001E',
          aubergine: '#77216F',
          'warm-grey': '#AEA79F',
          'cool-grey': '#333333',
          'text-grey': '#111111',
          white: '#FFFFFF',
        },
        // Semantic colors
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
          active: 'var(--surface-active)',
          border: 'var(--surface-border)',
        },
        background: {
          DEFAULT: 'var(--background)',
          secondary: 'var(--background-secondary)',
        },
        foreground: {
          DEFAULT: 'var(--foreground)',
          muted: 'var(--foreground-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
      },
      borderRadius: {
        'ubuntu': '8px',
        'ubuntu-sm': '4px',
        'ubuntu-lg': '12px',
      },
      boxShadow: {
        'ubuntu': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'ubuntu-lg': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'ubuntu-xl': '0 8px 32px rgba(0, 0, 0, 0.15)',
        'window': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      fontFamily: {
        'ubuntu': ['Ubuntu', 'system-ui', 'sans-serif'],
        'ubuntu-mono': ['Ubuntu Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      zIndex: {
        'dock': '40',
        'topbar': '50',
        'window': '100',
        'window-focused': '200',
        'modal': '300',
        'tooltip': '400',
        'notification': '500',
      }
    },
  },
  plugins: [],
}
