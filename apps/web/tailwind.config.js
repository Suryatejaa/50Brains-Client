/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // 🎨 Professional 50BraIns Design System
                brand: {
                    primary: '#2563EB',     // Strong blue for CTAs & accents
                    base: '#FFFFFF',        // Clean white background
                    surface: '#F9FAFB',     // Subtle background for sections
                    border: '#E5E7EB',      // Professional borders
                    text: {
                        primary: '#111827',  // Sharp black text
                        secondary: '#374151', // Medium gray text
                        muted: '#6B7280',    // Light gray text
                    },
                },

                // Updated primary color - more saturated and professional
                primary: {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#2563EB',  // Main brand color - strong blue
                    600: '#1D4ED8',
                    700: '#1E40AF',
                    800: '#1E3A8A',
                    900: '#1E3A8A',
                    950: '#172554',
                },

                // Professional grays
                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                    950: '#030712',
                },

                // Status colors - more saturated and professional
                success: '#059669',
                warning: '#D97706',
                error: '#DC2626',
                info: '#2563EB',

                // Reputation system colors
                reputation: {
                    bronze: '#CD7F32',
                    silver: '#C0C0C0',
                    gold: '#F59E0B',
                    platinum: '#E5E4E2',
                    diamond: '#3B82F6',
                    legend: '#8B5CF6',
                },
            },

            // Glassmorphism effects
            backdropBlur: {
                sm: '4px',
                md: '10px',
                lg: '16px',
            },

            boxShadow: {
                'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                'professional': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },

            fontFamily: {
                sans: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
                display: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
            },

            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
                'glass-shimmer': 'glassShimmer 2s ease-in-out infinite',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                bounceGentle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                glassShimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },

            spacing: {
                '18': '4.5rem',
                '88': '22rem',
            },

            maxWidth: {
                '8xl': '88rem',
                '9xl': '96rem',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio'),
    ],
};
