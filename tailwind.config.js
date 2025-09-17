/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ Enable dark mode via class (very important!)
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Reflect-style font
      },
      colors: {
        'midnight': '#0f0f1b',
        'neon-purple': '#a855f7',
        'glass': 'rgba(255, 255, 255, 0.05)',
        'reflect-bg': '#0a0a14',
        'reflect-card': '#111122',
      },
      boxShadow: {
        glow: '0 0 30px rgba(168, 85, 247, 0.4)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at center, #a855f7, #0a0a14)',
      },
      blur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

