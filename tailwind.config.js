/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        heading: ['Fraunces', 'serif'],
      },
      colors: {
        background: '#0A0F1F', // Deep ink
        surface: '#111827', // Slate 900
        surfaceHighlight: '#1F2937', // Slate 800
        border: '#1E293B', // Slate 800

        primary: {
          DEFAULT: '#22D3EE', // Cyan 400
          foreground: '#FFFFFF',
          light: '#67E8F9',
          dark: '#0E7490',
        },
        secondary: {
          DEFAULT: '#F97316', // Orange 500
          foreground: '#FFFFFF',
        },

        // Brand Specific - "Royal Series"
        noble: {
          green: '#0F766E', // Teal 700
          gold: '#F59E0B', // Amber 500
          gray: '#94A3B8', // Slate 400
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noble-gradient': 'linear-gradient(135deg, #0A0F1F 0%, #0F766E 100%)',
        'glass-premium': 'linear-gradient(145deg, rgba(31, 41, 55, 0.7) 0%, rgba(17, 24, 39, 0.6) 100%)',
        'gold-sheen': 'linear-gradient(45deg, #F97316 0%, #FDBA74 50%, #F97316 100%)',
      },
      boxShadow: {
        'premium': '0 20px 40px -5px rgba(2, 6, 23, 0.45), 0 8px 10px -6px rgba(2, 6, 23, 0.3)',
        'glow': '0 0 24px rgba(34, 211, 238, 0.28)',
      }
    },
  },
  plugins: [],
}
