
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
				background: '#f5f6fa', // Light gray background
				foreground: '#333333', // Dark text color
				primary: {
					DEFAULT: '#3a86ff', // A nice blue
					foreground: '#FFFFFF',
					hover: '#2563eb',
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
					DEFAULT: '#64748b', // Slate blue-gray
					light: '#E5E7EB',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: '#ef4444', // Red
					foreground: '#FFFFFF'
				},
				muted: {
					DEFAULT: '#f1f5f9', // Very light blue-gray
					foreground: '#64748b'
				},
				popover: {
					DEFAULT: '#FFFFFF',
					foreground: '#333333'
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#333333'
				},
				sidebar: {
					DEFAULT: '#FFFFFF', // White sidebar
					foreground: '#333333', // Dark text
					hover: 'rgba(58, 134, 255, 0.1)', // Primary color tint 
					'active-border': '#3a86ff', // Primary blue
				},
				success: {
					DEFAULT: '#22c55e',
					foreground: '#FFFFFF'
				},
				warning: {
					DEFAULT: '#f59e0b',
					foreground: '#FFFFFF'
				},
				info: {
					DEFAULT: '#3a86ff',
					foreground: '#FFFFFF'
				},
				revenue: {
					DEFAULT: '#3a86ff',
					light: '#e0eaff'
				},
				clients: {
					DEFAULT: '#f59e0b',
					light: '#fef3c7'
				},
				cases: {
					DEFAULT: '#3a86ff',
					light: '#e0eaff'
				},
				hours: {
					DEFAULT: '#ef4444',
					light: '#fee2e2'
				}
			},
			borderRadius: {
				lg: '12px',
				md: '8px',
				sm: '4px',
				DEFAULT: '8px',
				button: '8px',
			},
			boxShadow: {
				'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
				DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
				'md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
				'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
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
