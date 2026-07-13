/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#0B0B0B', 
          900: '#161616',
          800: '#1F1F1F',
          700: '#2A2A2A',
          600: '#333333',
        },
        cyber: {
          neon: '#ff3b30', 
          pink: '#ef4444',
          cyan: '#dc2626',
        },
        cinematic: {
          pure: '#0B0B0B',
          dark: '#161616',
          card: '#1F1F1F',
          red: {
            apple: '#ff3b30',
            primary: '#dc2626',
            secondary: '#b91c1c',
            accent: '#ef4444',
            glow: 'rgba(255, 59, 48, 0.25)',
          },
          glass: {
            bg: 'rgba(255, 255, 255, 0.08)',
            border: 'rgba(255, 255, 255, 0.15)',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#B3B3B3',
            muted: '#8b8b8b',
          }
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(220, 38, 38, 0.2), inset 0 0 5px rgba(220, 38, 38, 0.05)' },
          '50%': { boxShadow: '0 0 30px rgba(220, 38, 38, 0.45), inset 0 0 12px rgba(220, 38, 38, 0.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-12px) scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

