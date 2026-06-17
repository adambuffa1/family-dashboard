import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF8',
          100: '#F7F2EB',
          200: '#EDE4D6',
          300: '#DDD2C0',
        },
        charcoal: {
          900: '#18160F',
          800: '#26221A',
          700: '#363029',
          600: '#4A4338',
        },
        gold: {
          300: '#DFC08A',
          400: '#CCA96A',
          500: '#B8924D',
          600: '#9E7B3A',
        },
        stone: {
          300: '#C8C0B4',
          400: '#A89E94',
          500: '#867C72',
          600: '#665E56',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'slide-right': 'slideRight 0.6s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
