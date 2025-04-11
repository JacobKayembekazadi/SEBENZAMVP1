
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
				background: '#f8f8f8', // Updated to match JSON secondaryColor
				foreground: '#222222', // Updated to match JSON primaryColor
				primary: {
					DEFAULT: '#222222', // Updated to match JSON primaryColor
					foreground: '#FFFFFF',
					hover: '#333333',
				},
				accent: {
					DEFAULT: '#80DCA0', // Updated to first accent color from JSON
					foreground: '#FFFFFF',
					hover: '#6DC98D',
				},
				warning: {
					DEFAULT: '#F0C760', // Updated to second accent color from JSON
					foreground: '#FFFFFF',
				},
				secondary: {
					DEFAULT: '#6060F0', // Updated to third accent color from JSON
					light: '#E5E7EB',
					foreground: '#FFFFFF'
				},
				destructive: {
					DEFAULT: '#ef4444', // Kept for consistency
					foreground: '#FFFFFF'
				},
				muted: {
					DEFAULT: '#f1f5f9', // Very light blue-gray
					foreground: '#64748b'
				},
				popover: {
					DEFAULT: '#FFFFFF',
					foreground: '#222222'
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#222222'
				},
				sidebar: {
					DEFAULT: '#222222', // Updated to dark sidebar as per JSON
					foreground: '#FFFFFF', // Light text on dark background
					hover: 'rgba(128, 220, 160, 0.1)', // Primary accent color tint
					'active-border': '#80DCA0', // Primary accent color
				},
				success: {
					DEFAULT: '#80DCA0', // Updated to match first accent color
					foreground: '#FFFFFF'
				},
				warning: {
					DEFAULT: '#F0C760', // Updated to match second accent color
					foreground: '#FFFFFF'
				},
				info: {
					DEFAULT: '#6060F0', // Updated to match third accent color
					foreground: '#FFFFFF'
				},
				revenue: {
					DEFAULT: '#80DCA0', // Updated to match first accent color
					light: '#e6f7ed'
				},
				clients: {
					DEFAULT: '#F0C760', // Updated to match second accent color
					light: '#fcf6e0'
				},
				cases: {
					DEFAULT: '#6060F0', // Updated to match third accent color
					light: '#e0e0fc'
				},
				hours: {
					DEFAULT: '#ef4444', // Kept for consistency
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
