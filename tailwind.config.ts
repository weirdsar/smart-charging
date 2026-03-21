import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        accent: {
          DEFAULT: '#FF6B00',
          hover: '#E55F00',
        },
        surface: {
          DEFAULT: '#111111',
          light: '#1A1A1A',
        },
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        heading: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
    },
  },
  plugins: [typography],
};

export default config;
