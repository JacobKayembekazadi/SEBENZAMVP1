
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			maxWidth: {
				'layout': '1440px',
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				pacifico: ['Pacifico', 'cursive'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#2563eb', // Blue
					foreground: '#FFFFFF',
					hover: '#1d4ed8',
				},
				accent: {
					DEFAULT: '#10B981', // Emerald
					foreground: '#FFFFFF',
					hover: '#0EA371',
				},
				warning: {
					DEFAULT: '#6366F1', // Indigo
					foreground: '#FFFFFF',
				},
				secondary: {
					DEFAULT: '#475569', // Secondary
					light: '#E5E7EB',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: '#FFFFFF', // White sidebar
					foreground: '#475569', // Secondary color text
					hover: 'rgba(37, 99, 235, 0.1)', // Primary color tint 
					'active-border': '#2563eb', // Primary blue
				},
				success: {
					DEFAULT: '#4CAF50',
					foreground: '#FFFFFF'
				},
				warning: {
					DEFAULT: '#FF9800',
					foreground: '#FFFFFF'
				},
				info: {
					DEFAULT: '#2196F3',
					foreground: '#FFFFFF'
				},
				revenue: {
					DEFAULT: '#56B99F',
					light: '#E7F6F2'
				},
				clients: {
					DEFAULT: '#F6B656',
					light: '#FFF8EC'
				},
				cases: {
					DEFAULT: '#2563eb', // Using our primary blue color
					light: '#EFF6FF'
				},
				hours: {
					DEFAULT: '#E6707F',
					light: '#FFEFF2'
				}
			},
			borderRadius: {
				lg: '16px',
				md: '12px',
				sm: '8px',
				DEFAULT: '8px',
				button: '8px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
