import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Five One brand colors
        navy: {
          DEFAULT: '#0a192f',
          light:   '#112240',
          lighter: '#1d3461',
        },
        mint: {
          DEFAULT: '#64ffda',
          dim:     'rgba(100,255,218,0.15)',
          glow:    'rgba(100,255,218,0.3)',
        },
        golden: {
          DEFAULT: '#ffd700',
          dark:    '#996515',
        },
        // Semantic text
        slate: {
          DEFAULT: '#8892b0',
          light:   '#ccd6f6',
          white:   '#e6f1ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'mint':        '0 0 20px rgba(100,255,218,0.2)',
        'mint-strong': '0 0 40px rgba(100,255,218,0.4)',
        'glow':        '0 4px 24px rgba(100,255,218,0.15)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.6)',
        'inner-mint':  'inset 0 1px 0 rgba(100,255,218,0.1)',
      },
      backgroundImage: {
        'gradient-navy':       'linear-gradient(135deg, #0a192f 0%, #112240 100%)',
        'gradient-navy-dark':  'linear-gradient(rgba(10,25,47,0.95), rgba(17,34,64,0.95))',
        'gradient-mint':       'linear-gradient(135deg, rgba(100,255,218,0.1) 0%, rgba(100,255,218,0.05) 100%)',
        'gradient-card':       'linear-gradient(135deg, rgba(17,34,64,0.8) 0%, rgba(10,25,47,0.8) 100%)',
        'gradient-mint-border': 'linear-gradient(135deg, #64ffda, transparent)',
      },
      animation: {
        'fade-in':       'fadeIn 0.3s ease-out',
        'fade-in-up':    'fadeInUp 0.4s ease-out',
        'slide-in':      'slideIn 0.3s ease-out',
        'pulse-mint':    'pulseMint 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':       'shimmer 1.5s infinite',
        'spin-slow':     'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulseMint: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'bounce-sm': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

export default config
