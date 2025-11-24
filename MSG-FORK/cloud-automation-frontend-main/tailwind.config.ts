import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Refined Professional Color Palette - Neutral Base with Strategic Blue
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          400: '#0E6BA8',      // Blue accent
          500: '#0A2472',      // Blue primary (main)
          600: '#001C55',      // Blue hover
          700: '#001C55',
          800: '#001C55',
          900: '#001C55',
        },
        blue: {
          accent: '#0E6BA8',   // Links and interactive elements
          primary: '#0A2472',  // Primary buttons and active states  
          hover: '#001C55',    // Hover states
        },
        gray: {
          50: '#F8F9FA',       // Very light gray - page background
          100: '#F1F3F4',      // Light gray - sidebar background
          200: '#E5E7EB',      // Border color for content
          300: '#D1D5DB',      // Subtle borders
          400: '#9CA3AF',
          500: '#6B7280',      // Secondary text
          600: '#6B7280',
          700: '#374151',      // Primary text/headers
          800: '#1F2937',
          900: '#111827',      // Very dark text
        },
        success: {
          50: '#E8F5E8',
          500: '#10B981',      // Updated success green
          600: '#047857',
        },
        warning: {
          50: '#FEF3C7',
          500: '#F59E0B',      // Keep existing warning amber
          600: '#D97706',
        },
        error: {
          50: '#FEE2E2',
          500: '#EF4444',      // Keep existing error red
          600: '#DC2626',
        },
        background: '#A6E1FA', // Very light blue page background
        surface: '#ffffff',    // White for content cards
        border: '#0E6BA8',     // Bright blue for borders
      },
      fontFamily: {
        'sans': ['Roboto', 'ui-sans-serif', 'system-ui'],
        'heading': ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 1px rgba(0, 0, 0, 0.03)',
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 4px 8px 3px rgba(0, 0, 0, 0.03)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        makestuffgo: {
          'primary': '#0A2472',        // Blue primary for important actions only
          'primary-content': '#ffffff',
          'secondary': '#F1F3F4',      // Light gray for secondary elements  
          'secondary-content': '#374151', // Dark gray text
          'accent': '#0E6BA8',         // Blue accent for links and highlights
          'accent-content': '#ffffff',
          'neutral': '#6B7280',        // Gray for secondary text
          'neutral-content': '#ffffff',
          'base-100': '#ffffff',       // White content cards
          'base-200': '#F8F9FA',       // Very light gray backgrounds
          'base-300': '#E5E7EB',       // Light gray borders
          'base-content': '#374151',   // Dark gray primary text
          'info': '#0E6BA8',           // Blue accent
          'success': '#10B981',        // Updated success green
          'warning': '#F59E0B',        // Keep existing warning amber
          'error': '#EF4444',          // Keep existing error red
        },
      }
    ],
    base: true,
    styled: true,
    utils: true,
  },
}
export default config
