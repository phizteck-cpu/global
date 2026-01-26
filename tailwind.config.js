/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        background: '#020617', // Slate 950 - Deep Space Blue/Black
        surface: '#0F172A', // Slate 900
        surfaceHighlight: '#1E293B', // Slate 800
        border: '#1E293B', // Slate 800

        primary: {
          DEFAULT: '#10B981', // Emerald 500 - Brighter for Dark Mode
          foreground: '#FFFFFF',
          light: '#34D399',
          dark: '#059669',
        },
        secondary: {
          DEFAULT: '#F59E0B', // Amber 500 - Bright Gold
          foreground: '#FFFFFF',
        },

        // Brand Specific - "Royal Series"
        noble: {
          green: '#064E3B', // Emerald 900
          gold: '#D97706', // Amber 600
          gray: '#94A3B8', // Slate 400
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noble-gradient': 'linear-gradient(135deg, #020617 0%, #064E3B 100%)', // Dark Slate -> Deep Emerald
        'glass-premium': 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.6) 100%)',
        'gold-sheen': 'linear-gradient(45deg, #B45309 0%, #FCD34D 50%, #B45309 100%)',
      },
      boxShadow: {
        'premium': '0 20px 40px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
