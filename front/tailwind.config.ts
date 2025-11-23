import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      boxShadow: {

        'layer-0': 'none',
        'layer-1':
          'inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -1px 1px rgba(0, 0, 0, 0.1), ' +
          '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02)',
        'layer-2':
          'inset 0 1px 2px rgba(255, 255, 255, 0.7), inset 0 -2px 2px rgba(0, 0, 0, 0.12), ' +
          '0 2px 4px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.03)',
        'layer-3':
          'inset 0 2px 3px rgba(255, 255, 255, 0.75), inset 0 -3px 3px rgba(0, 0, 0, 0.15), ' +
          '0 3px 6px rgba(0, 0, 0, 0.06), 0 6px 12px rgba(0, 0, 0, 0.04)',
        'layer-4':
          'inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -4px 4px rgba(0, 0, 0, 0.18), ' +
          '0 4px 8px rgba(0, 0, 0, 0.07), 0 8px 16px rgba(0, 0, 0, 0.05)',
        'layer-5':
          'inset 0 3px 5px rgba(255, 255, 255, 0.85), inset 0 -5px 5px rgba(0, 0, 0, 0.2), ' +
          '0 5px 10px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(0, 0, 0, 0.06)',

        'inner-0': 'none',
        'inner-1':
          'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.06)',
        'inner-2':
          'inset 0 3px 6px rgba(0, 0, 0, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.08)',
        'inner-3':
          'inset 0 4px 8px rgba(0, 0, 0, 0.15), inset 0 3px 6px rgba(0, 0, 0, 0.1)',
        'inner-4':
          'inset 0 5px 10px rgba(0, 0, 0, 0.18), inset 0 4px 8px rgba(0, 0, 0, 0.12)',
        'inner-5':
          'inset 0 6px 12px rgba(0, 0, 0, 0.2), inset 0 5px 10px rgba(0, 0, 0, 0.15)',
        // Sombras padrão estilo recessed
        DEFAULT:
          'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.06)',
        sm: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.06)',
        md: 'inset 0 3px 6px rgba(0, 0, 0, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.08)',
        lg: 'inset 0 4px 8px rgba(0, 0, 0, 0.15), inset 0 3px 6px rgba(0, 0, 0, 0.1)',
        xl: 'inset 0 5px 10px rgba(0, 0, 0, 0.18), inset 0 4px 8px rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config


