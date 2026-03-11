/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media',

  theme: {
    extend: {
      /* ── Apple iOS System Colors ── */
      colors: {
        /* Interactive */
        'ios-blue':   '#007AFF',
        'ios-green':  '#34C759',
        'ios-red':    '#FF3B30',
        'ios-orange': '#FF9500',
        'ios-purple': '#AF52DE',
        'ios-pink':   '#FF2D55',
        'ios-teal':   '#5AC8FA',
        'ios-indigo': '#5856D6',

        /* System backgrounds */
        'sys-bg':      '#F2F2F7',   // grouped background
        'sys-card':    '#FFFFFF',   // card / secondary background
        'sys-fill':    '#E5E5EA',   // progress track, dividers

        /* Text (light) — accessed via opacity utilities in dark mode */
        'sys-label':   '#000000',
        'sys-label-2': 'rgba(60,60,67,0.60)',
        'sys-label-3': 'rgba(60,60,67,0.30)',
        'sys-sep':     'rgba(60,60,67,0.12)',

        /* Keep brand tokens — sidebar / analytics still use them */
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1',
          600: '#4f46e5', 700: '#4338ca', 800: '#3730a3',
          900: '#312e81', 950: '#1e1b4b',
        },
      },

      /* ── Typography ── */
      fontSize: {
        'large-title': ['34px', { lineHeight: '41px', fontWeight: '700' }],
        'title-1':     ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'title-2':     ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'title-3':     ['20px', { lineHeight: '24px', fontWeight: '600' }],
        'headline':    ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'body':        ['17px', { lineHeight: '22px', fontWeight: '400' }],
        'callout':     ['16px', { lineHeight: '21px', fontWeight: '400' }],
        'subhead':     ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'footnote':    ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption-1':   ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'caption-2':   ['11px', { lineHeight: '13px', fontWeight: '400' }],
      },

      /* ── Shadows ── */
      boxShadow: {
        /* iOS card: barely-there elevation */
        'ios':      '0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
        'ios-md':   '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'ios-lg':   '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)',
        /* Brand / sidebar */
        glass:      '0 4px 24px -2px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        'glass-lg': '0 8px 40px -4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        brand:      '0 8px 32px -4px rgba(99,102,241,0.35)',
        'brand-sm': '0 4px 14px -2px rgba(99,102,241,0.28)',
      },

      /* ── Border radius ── */
      borderRadius: {
        'ios':    '13px',   // iOS grouped-list cell
        'ios-lg': '16px',   // iOS cards
        'ios-xl': '20px',   // Bottom sheets / large cards
      },

      /* ── Keyframes ── */
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'modal-in': {
          '0%':   { opacity: '0', transform: 'scale(0.94) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'bounce-in': {
          '0%':   { opacity: '0', transform: 'scale(0.5)' },
          '60%':  { transform: 'scale(1.18)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-right': {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(250%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.4)' },
          '50%':       { boxShadow: '0 0 0 8px rgba(99,102,241,0)' },
        },
      },

      animation: {
        'fade-up':     'fade-up 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
        'modal-in':    'modal-in 0.28s cubic-bezier(0.22,1,0.36,1) forwards',
        'bounce-in':   'bounce-in 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-right': 'slide-right 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
        shimmer:       'shimmer 2.8s ease-in-out infinite',
        'pulse-glow':  'pulse-glow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
