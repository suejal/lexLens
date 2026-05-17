import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#070707',
        ink: '#0D0D0F',
        coal: '#151515',
        graphite: '#23211E',
        parchment: '#F5F0E8',
        vellum: '#E8DDCC',
        gold: '#C9A84C',
        'gold-soft': '#E2C878',
        crimson: '#8B1A1A',
        muted: '#A9A093',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 40px rgba(201, 168, 76, 0.22)',
        'deep-panel': '0 24px 90px rgba(0, 0, 0, 0.42)',
      },
      backgroundImage: {
        'paper-grain':
          'radial-gradient(circle at 20% 10%, rgba(139, 26, 26, 0.08), transparent 28%), radial-gradient(circle at 80% 0%, rgba(201, 168, 76, 0.15), transparent 22%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
